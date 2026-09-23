<?php
/**
 * Payroll Service
 * Computes compensation rules, tiered calculations (Permanent, Temporary, Intern), and master component integration
 */
class PayrollService
{
    private PayrollMasterModel $masterModel;
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->masterModel = new PayrollMasterModel($this->db);
    }

    /**
     * Compute automated salary preview for an employee
     */
    public function calculateSalaryPreview(int $userId, array $params = []): array
    {
        $structure = $this->masterModel->getStructureByUserId($userId);

        // Fallback default structure if not assigned yet
        if (!$structure) {
            $structure = [
                'user_id'         => $userId,
                'employment_type' => 'Permanent',
                'base_salary'     => 3000.00,
                'currency'        => 'USD',
                'effective_date'  => date('Y-01-01'),
                'bank_name'       => 'Pending Setup',
                'account_number'  => 'N/A',
                'routing_code'    => 'N/A',
                'payment_method'  => 'Bank Transfer',
                'status'          => 'Active',
            ];
        }

        $tier = $structure['employment_type'] ?? 'Permanent';
        $baseSalary = (float) ($structure['base_salary'] ?? 0.00);
        $currency = $structure['currency'] ?? 'USD';

        // Load active payroll components
        $components = $this->masterModel->getComponents(['is_active' => 1]);

        $earnings = [];
        $deductions = [];

        $overrides = $params['overrides'] ?? [];
        $unpaidDays = (int) ($params['unpaid_days'] ?? 0);
        $standardDays = (int) ($params['working_days'] ?? 22);
        if ($standardDays <= 0) $standardDays = 22;

        if ($tier === 'Intern') {
            // ── INTERN CALCULATION ──
            // Find STIPEND component
            $stipendComp = null;
            foreach ($components as $c) {
                if ($c['code'] === 'STIPEND') {
                    $stipendComp = $c;
                    break;
                }
            }

            $stipendAmount = isset($overrides['STIPEND']) 
                ? (float) $overrides['STIPEND'] 
                : ($baseSalary > 0 ? $baseSalary : ($stipendComp ? (float) $stipendComp['default_value'] : 800.00));

            $earnings[] = [
                'component_id'   => $stipendComp['id'] ?? null,
                'code'           => 'STIPEND',
                'component_name' => $stipendComp['name'] ?? 'Monthly Stipend',
                'type'           => 'Earning',
                'category'       => 'Stipend',
                'amount'         => round($stipendAmount, 2),
            ];

            // Optional Intern variable / performance incentive
            if (!empty($overrides['VARIABLE_BONUS']) && (float) $overrides['VARIABLE_BONUS'] > 0) {
                $bonusComp = null;
                foreach ($components as $c) {
                    if ($c['code'] === 'VARIABLE_BONUS') { $bonusComp = $c; break; }
                }
                $earnings[] = [
                    'component_id'   => $bonusComp['id'] ?? null,
                    'code'           => 'VARIABLE_BONUS',
                    'component_name' => 'Performance Stipend / Bonus',
                    'type'           => 'Earning',
                    'category'       => 'Variable',
                    'amount'         => round((float) $overrides['VARIABLE_BONUS'], 2),
                ];
            }

            // Intern Loss of Pay if any
            if ($unpaidDays > 0) {
                $lopAmount = round(($stipendAmount / $standardDays) * $unpaidDays, 2);
                $lopComp = null;
                foreach ($components as $c) {
                    if ($c['code'] === 'LOP') { $lopComp = $c; break; }
                }
                $deductions[] = [
                    'component_id'   => $lopComp['id'] ?? null,
                    'code'           => 'LOP',
                    'component_name' => 'Loss of Pay (LOP)',
                    'type'           => 'Deduction',
                    'category'       => 'Deduction',
                    'amount'         => $lopAmount,
                ];
            }
        } else {
            // ── PERMANENT / TEMPORARY EMPLOYEES ──
            $basicAmount = isset($overrides['BASIC']) ? (float) $overrides['BASIC'] : $baseSalary;

            foreach ($components as $comp) {
                $code = $comp['code'];
                $appliesTo = $comp['applies_to'];

                // Skip intern-only stipend for permanent/temp
                if ($comp['category'] === 'Stipend' || $appliesTo === 'Intern') {
                    continue;
                }

                // If component applies to Permanent only and user is Temporary
                if ($appliesTo === 'Permanent' && $tier !== 'Permanent') {
                    continue;
                }

                // Calculate amount
                $amount = 0.00;

                if (isset($overrides[$code])) {
                    $amount = (float) $overrides[$code];
                } elseif ($code === 'BASIC') {
                    $amount = $basicAmount;
                } elseif ($comp['calculation_type'] === 'Percentage') {
                    // Percentage of basic
                    $amount = round(($basicAmount * ((float) $comp['default_value'])) / 100, 2);
                } else {
                    $amount = (float) $comp['default_value'];
                }

                // Skip non-mandatory zero-amount items
                if ($amount <= 0 && empty($comp['is_mandatory'])) {
                    continue;
                }

                $item = [
                    'component_id'   => (int) $comp['id'],
                    'code'           => $code,
                    'component_name' => $comp['name'],
                    'type'           => $comp['type'],
                    'category'       => $comp['category'],
                    'amount'         => round($amount, 2),
                ];

                if ($comp['type'] === 'Earning') {
                    $earnings[] = $item;
                } else {
                    $deductions[] = $item;
                }
            }

            // Loss of pay calculation if unpaid days specified
            if ($unpaidDays > 0) {
                $lopAmount = round(($basicAmount / $standardDays) * $unpaidDays, 2);
                $hasLop = false;
                foreach ($deductions as &$d) {
                    if ($d['code'] === 'LOP') {
                        $d['amount'] += $lopAmount;
                        $hasLop = true;
                        break;
                    }
                }
                unset($d);

                if (!$hasLop) {
                    $deductions[] = [
                        'component_id'   => null,
                        'code'           => 'LOP',
                        'component_name' => 'Loss of Pay (LOP)',
                        'type'           => 'Deduction',
                        'category'       => 'Deduction',
                        'amount'         => $lopAmount,
                    ];
                }
            }
        }

        $grossSalary = round(array_sum(array_column($earnings, 'amount')), 2);
        $totalDeductions = round(array_sum(array_column($deductions, 'amount')), 2);
        $netSalary = max(0, round($grossSalary - $totalDeductions, 2));

        return [
            'user_id'          => $userId,
            'employment_type'  => $tier,
            'structure'        => $structure,
            'currency'         => $currency,
            'working_days'     => $standardDays,
            'unpaid_days'      => $unpaidDays,
            'earnings'         => $earnings,
            'deductions'       => $deductions,
            'gross_salary'     => $grossSalary,
            'total_deductions' => $totalDeductions,
            'net_salary'       => $netSalary,
        ];
    }
}
