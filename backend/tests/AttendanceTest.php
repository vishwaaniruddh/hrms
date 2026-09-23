<?php
/**
 * Attendance Calculation Tests
 * Tests stay time computation and attendance CRUD
 */
class AttendanceTest
{
    private AttendanceModel $model;
    private PDO $db;
    private int $passed = 0;
    private int $failed = 0;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->model = new AttendanceModel($this->db);
    }

    public function run(): array
    {
        $this->testStayTimeCalculation();
        $this->testStayTimeShortShift();
        $this->testStayTimeExactHour();
        $this->testStayTimeInvalid();
        $this->testTodaySummary();

        return ['passed' => $this->passed, 'failed' => $this->failed];
    }

    private function testStayTimeCalculation(): void
    {
        $result = $this->model->calculateStayTime('06:00:00', '15:30:00');
        $this->assert($result === '9 hrs 30 mins', 'Stay Time 9h30m (got: ' . $result . ')');
    }

    private function testStayTimeShortShift(): void
    {
        $result = $this->model->calculateStayTime('09:00:00', '13:45:00');
        $this->assert($result === '4 hrs 45 mins', 'Stay Time 4h45m (got: ' . $result . ')');
    }

    private function testStayTimeExactHour(): void
    {
        $result = $this->model->calculateStayTime('08:00:00', '17:00:00');
        $this->assert($result === '9 hrs 0 mins', 'Stay Time 9h0m (got: ' . $result . ')');
    }

    private function testStayTimeInvalid(): void
    {
        // Sign out before sign in should return 0
        $result = $this->model->calculateStayTime('17:00:00', '08:00:00');
        $this->assert($result === '0 hrs 0 mins', 'Stay Time Invalid (got: ' . $result . ')');
    }

    private function testTodaySummary(): void
    {
        $summary = $this->model->getTodaySummary();
        $this->assert(
            is_array($summary) && array_key_exists('present', $summary),
            'Today Summary returns valid structure'
        );
    }

    private function assert(bool $condition, string $testName): void
    {
        if ($condition) {
            $this->passed++;
            echo "  ✅ PASS: $testName\n";
        } else {
            $this->failed++;
            echo "  ❌ FAIL: $testName\n";
        }
    }
}
