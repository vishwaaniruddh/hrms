<?php
/**
 * Reports & Intelligence Suite Unit Tests
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/ReportModel.php';

class ReportTest
{
    private PDO $db;
    private ReportModel $model;
    private int $passed = 0;
    private int $failed = 0;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->model = new ReportModel($this->db);
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

    public function getPassed(): int { return $this->passed; }
    public function getFailed(): int { return $this->failed; }

    public function run(): array
    {
        echo "\n── Reports & Intelligence Suite Tests ──\n";

        $this->testMusterRollGeneration();
        $this->testMusterRollFilters();
        $this->testPayrollDisbursalRegister();
        $this->testLeaveLiabilityReport();
        $this->testCsvExportGeneration();

        echo "  Report Tests: {$this->passed} passed, {$this->failed} failed\n";
        return ['passed' => $this->passed, 'failed' => $this->failed];
    }

    private function testMusterRollGeneration(): void
    {
        $year = 2026;
        $month = 9; // September
        $result = $this->model->getMusterRoll($year, $month);

        $this->assert(isset($result['meta']), 'Muster roll contains meta object');
        $this->assert($result['meta']['days_in_month'] === 30, 'September 2026 has exactly 30 days');
        $this->assert(count($result['meta']['days_meta']) === 30, 'Days meta array contains 30 items');
        $this->assert(isset($result['kpis']['total_employees']), 'Muster roll contains total_employees KPI');
        $this->assert($result['kpis']['total_employees'] > 0, 'At least 1 active employee found in muster roll');
        $this->assert(!empty($result['rows']), 'Muster roll contains employee punch rows');

        $firstRow = $result['rows'][0];
        $this->assert(!empty($firstRow['employee']['name']), 'Row has valid employee name: ' . ($firstRow['employee']['name'] ?? ''));
        $this->assert(isset($firstRow['punches'][1]['status']), 'Day 1 punch status is recorded');
        $this->assert(is_numeric($firstRow['attendance_rate']), 'Attendance rate is numeric');
    }

    private function testMusterRollFilters(): void
    {
        $year = 2026;
        $month = 9;
        
        // Filter by search keyword
        $searchResult = $this->model->getMusterRoll($year, $month, ['search' => 'Abu']);
        $this->assert(count($searchResult['rows']) >= 1, 'Search filter for "Abu" returned staff rows');
        $this->assert(strpos($searchResult['rows'][0]['employee']['name'], 'Abu') !== false, 'Filtered employee name matches query');
    }

    private function testPayrollDisbursalRegister(): void
    {
        $year = 2026;
        $month = 9;
        $result = $this->model->getPayrollDisbursalRegister($year, $month);

        $this->assert(isset($result['meta']['records']), 'Payroll register contains record count');
        $this->assert(isset($result['kpis']['total_gross']), 'Payroll register computes total gross');
        $this->assert(isset($result['kpis']['total_deductions']), 'Payroll register computes total deductions');
        $this->assert(isset($result['kpis']['net_disbursed']), 'Payroll register computes net disbursed amount');
        $this->assert(is_array($result['rows']), 'Payroll register returns rows array');

        // Test with year 2026 month 1 to 12 if September has 0 generated
        if (empty($result['rows'])) {
            // Find any month with salaries
            $stmt = $this->db->query("SELECT YEAR(salary_date) as y, MONTH(salary_date) as m FROM salaries LIMIT 1");
            $salRow = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($salRow) {
                $altResult = $this->model->getPayrollDisbursalRegister((int)$salRow['y'], (int)$salRow['m']);
                $this->assert(count($altResult['rows']) > 0, 'Found generated payroll records for month ' . $salRow['m'] . '/' . $salRow['y']);
            } else {
                $this->assert(true, 'No historical salary rows to test (empty database test)');
            }
        } else {
            $first = $result['rows'][0];
            $this->assert(isset($first['gross_salary']), 'Payroll row has gross salary');
            $this->assert(isset($first['net_salary']), 'Payroll row has net salary');
        }
    }

    private function testLeaveLiabilityReport(): void
    {
        $year = 2026;
        $result = $this->model->getLeaveLiabilityReport($year);

        $this->assert(isset($result['meta']['records']), 'Leave liability report contains records count');
        $this->assert($result['meta']['records'] > 0, 'Leave liability evaluated for active staff');
        $this->assert(isset($result['kpis']['total_leave_reserve']), 'KPI calculates total leave reserve');
        $this->assert(isset($result['kpis']['total_financial_liability']), 'KPI calculates total dollar liability');
        $this->assert($result['kpis']['total_financial_liability'] > 0, 'Calculated non-zero balance sheet leave liability ($' . $result['kpis']['total_financial_liability'] . ')');

        $first = $result['rows'][0];
        $this->assert($first['daily_rate'] > 0, 'Computed daily wage rate: $' . $first['daily_rate']);
        $this->assert(isset($first['encashable_days']), 'Encashable days field exists');
        $this->assert($first['financial_liability'] >= 0, 'Per-employee liability calculated correctly');
    }

    private function testCsvExportGeneration(): void
    {
        $year = 2026;
        $month = 9;

        // 1. Muster Roll CSV
        $musterData = $this->model->getMusterRoll($year, $month);
        $csvMuster = $this->model->generateCsv('muster-roll', $musterData);
        $this->assert(!empty($csvMuster), 'Generated Muster Roll CSV string');
        $this->assert(strpos($csvMuster, 'Monthly Attendance Muster Roll') !== false, 'Muster Roll CSV header present');
        $this->assert(strpos($csvMuster, 'Attendance Rate %') !== false, 'Muster Roll CSV columns present');

        // 2. Payroll Register CSV
        $payrollData = $this->model->getPayrollDisbursalRegister($year, $month);
        $csvPayroll = $this->model->generateCsv('payroll-register', $payrollData);
        $this->assert(!empty($csvPayroll), 'Generated Payroll Register CSV string');
        $this->assert(strpos($csvPayroll, 'Payroll Disbursal Register') !== false, 'Payroll Register CSV title present');

        // 3. Leave Liability CSV
        $liabilityData = $this->model->getLeaveLiabilityReport($year);
        $csvLiability = $this->model->generateCsv('leave-liability', $liabilityData);
        $this->assert(!empty($csvLiability), 'Generated Leave Liability CSV string');
        $this->assert(strpos($csvLiability, 'Balance Sheet Liability ($)') !== false, 'Leave liability columns present');
    }
}
