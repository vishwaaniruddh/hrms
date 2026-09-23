<?php
/**
 * Payroll & Masters Unit Tests
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/PayrollMasterModel.php';
require_once __DIR__ . '/../models/SalaryModel.php';
require_once __DIR__ . '/../services/PayrollService.php';

class PayrollTest
{
    private PDO $db;
    private PayrollMasterModel $masterModel;
    private SalaryModel $salaryModel;
    private PayrollService $payrollService;
    private int $passed = 0;
    private int $failed = 0;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->masterModel = new PayrollMasterModel($this->db);
        $this->salaryModel = new SalaryModel($this->db);
        $this->payrollService = new PayrollService();
    }

    private function assert($condition, string $message): void
    {
        if ($condition) {
            echo "  \033[32m✔ PASS:\033[0m $message\n";
            $this->passed++;
        } else {
            echo "  \033[31m✖ FAIL:\033[0m $message\n";
            $this->failed++;
        }
    }

    public function run(): array
    {
        echo "\n── Payroll & Salary Masters Tests ──\n";

        $this->testComponentsRetrieval();
        $this->testComponentCrud();
        $this->testEmployeeSalaryStructures();
        $this->testPermanentCalculation();
        $this->testInternStipendCalculation();
        $this->testItemizedSalarySlipCreation();

        echo "  Payroll Tests: {$this->passed} passed, {$this->failed} failed\n";
        return ['passed' => $this->passed, 'failed' => $this->failed];
    }

    private function testComponentsRetrieval(): void
    {
        $components = $this->masterModel->getComponents();
        $this->assert(count($components) >= 8, 'Default payroll components loaded (count: ' . count($components) . ')');

        $basic = $this->masterModel->getComponentByCode('BASIC');
        $this->assert($basic !== null && $basic['type'] === 'Earning', 'BASIC component exists as Earning');

        $stipend = $this->masterModel->getComponentByCode('STIPEND');
        $this->assert($stipend !== null && $stipend['category'] === 'Stipend', 'STIPEND component exists for Interns');

        $pf = $this->masterModel->getComponentByCode('PF');
        $this->assert($pf !== null && $pf['type'] === 'Deduction', 'PF component exists as Deduction');

        $medical = $this->masterModel->getComponentByCode('MEDICAL');
        $this->assert($medical !== null && $medical['category'] === 'Allowance', 'MEDICAL allowance component exists');

        $insurance = $this->masterModel->getComponentByCode('INSURANCE');
        $this->assert($insurance !== null && $insurance['category'] === 'Insurance', 'INSURANCE deduction component exists');
    }

    private function testComponentCrud(): void
    {
        $testCode = 'TEST_ALLOW_' . time();
        $id = $this->masterModel->createComponent([
            'name'             => 'Special Project Bonus',
            'code'             => $testCode,
            'type'             => 'Earning',
            'category'         => 'Variable',
            'calculation_type' => 'Flat',
            'default_value'    => 250.00,
            'applies_to'       => 'All',
            'is_taxable'       => 1,
            'is_mandatory'     => 0,
            'is_active'        => 1,
            'description'      => 'Temporary test component',
        ]);

        $this->assert($id > 0, 'Created custom payroll component with ID: ' . $id);

        $fetched = $this->masterModel->getComponentById($id);
        $this->assert($fetched !== null && $fetched['code'] === $testCode, 'Found custom component by ID');

        $updated = $this->masterModel->updateComponent($id, ['default_value' => 300.00]);
        $this->assert($updated === true, 'Updated custom component default value');

        $deleted = $this->masterModel->deleteComponent($id);
        $this->assert($deleted === true, 'Deleted non-mandatory custom component');
    }

    private function testEmployeeSalaryStructures(): void
    {
        // Use user ID 1
        $saved = $this->masterModel->saveStructure([
            'user_id'         => 1,
            'employment_type' => 'Permanent',
            'base_salary'     => 4000.00,
            'currency'        => 'USD',
            'effective_date'  => date('Y-01-01'),
            'bank_name'       => 'Bank of America',
            'account_number'  => '9876543210',
            'routing_code'    => 'ACH-111000',
            'payment_method'  => 'Bank Transfer',
            'status'          => 'Active'
        ]);

        $this->assert($saved !== null && (float)$saved['base_salary'] === 4000.00, 'Saved permanent employee salary structure');
        $this->assert($saved['employment_type'] === 'Permanent', 'Structure employment type is Permanent');
    }

    private function testPermanentCalculation(): void
    {
        // Calculate preview for user 1 (base: 4000)
        $preview = $this->payrollService->calculateSalaryPreview(1, [
            'working_days' => 22,
            'unpaid_days'  => 0,
        ]);

        $this->assert($preview['employment_type'] === 'Permanent', 'Preview recognizes Permanent tier');
        $this->assert($preview['gross_salary'] > 4000.00, 'Gross salary includes allowances (Gross: ' . $preview['gross_salary'] . ')');
        $this->assert($preview['total_deductions'] > 0, 'Deductions calculated (Total: ' . $preview['total_deductions'] . ')');
        $this->assert($preview['net_salary'] === round($preview['gross_salary'] - $preview['total_deductions'], 2), 'Net salary matches Gross - Deductions (Net: ' . $preview['net_salary'] . ')');
    }

    private function testInternStipendCalculation(): void
    {
        // Find or setup an intern user structure (e.g. user 2 as Intern)
        $this->masterModel->saveStructure([
            'user_id'         => 2,
            'employment_type' => 'Intern',
            'base_salary'     => 850.00,
            'currency'        => 'USD',
            'effective_date'  => date('Y-01-01'),
            'bank_name'       => 'Wells Fargo',
            'account_number'  => '555444333',
            'routing_code'    => 'ACH-222000',
            'payment_method'  => 'Bank Transfer',
            'status'          => 'Active'
        ]);

        $preview = $this->payrollService->calculateSalaryPreview(2, [
            'working_days' => 22,
            'overrides'    => ['VARIABLE_BONUS' => 150.00], // $150 performance stipend
        ]);

        $this->assert($preview['employment_type'] === 'Intern', 'Preview identifies Intern tier');
        $this->assert($preview['gross_salary'] === 1000.00, 'Intern gross matches Stipend $850 + Bonus $150 ($1000.00)');

        // Ensure statutory PF is NOT in deductions for Intern
        $deductionCodes = array_column($preview['deductions'], 'code');
        $this->assert(!in_array('PF', $deductionCodes), 'Intern has NO statutory PF deduction');
        $this->assert($preview['net_salary'] === 1000.00, 'Intern receives full net stipend ($1000.00)');
    }

    private function testItemizedSalarySlipCreation(): void
    {
        $slipDate = date('Y-m-d');
        $salaryId = $this->salaryModel->create([
            'user_id'          => 1,
            'employment_type'  => 'Permanent',
            'salary_date'      => $slipDate,
            'gross_salary'     => 4500.00,
            'total_deductions' => 600.00,
            'net_salary'       => 3900.00,
            'currency'         => 'USD',
            'working_days'     => 22,
            'status'           => 'Unpaid',
            'items'            => [
                ['component_name' => 'Basic Salary', 'type' => 'Earning', 'category' => 'Basic', 'amount' => 3500.00],
                ['component_name' => 'Medical Allowance', 'type' => 'Earning', 'category' => 'Allowance', 'amount' => 500.00],
                ['component_name' => 'Conveyance', 'type' => 'Earning', 'category' => 'Allowance', 'amount' => 500.00],
                ['component_name' => 'Provident Fund (EPF)', 'type' => 'Deduction', 'category' => 'Statutory', 'amount' => 420.00],
                ['component_name' => 'Health Insurance', 'type' => 'Deduction', 'category' => 'Insurance', 'amount' => 100.00],
                ['component_name' => 'TDS / Tax', 'type' => 'Deduction', 'category' => 'Statutory', 'amount' => 80.00],
            ]
        ]);

        $this->assert($salaryId > 0, 'Created itemized salary slip with ID: ' . $salaryId);

        $fetched = $this->salaryModel->findById($salaryId);
        $this->assert($fetched !== null, 'Fetched generated salary slip');
        $this->assert(count($fetched['items']) === 6, 'Fetched all 6 itemized line items (3 earnings, 3 deductions)');
        $this->assert((float)$fetched['net_salary'] === 3900.00, 'Net salary matches $3900.00');

        // Clean up test salary
        $this->salaryModel->delete($salaryId);
        $this->assert($this->salaryModel->findById($salaryId) === null, 'Cleaned up test salary slip');
    }
}
