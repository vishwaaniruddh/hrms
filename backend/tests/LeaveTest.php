<?php
/**
 * Leave Management Test Suite
 */
class LeaveTest
{
    private LeaveModel $model;
    private LeaveService $service;
    private PDO $db;
    private int $passed = 0;
    private int $failed = 0;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->model = new LeaveModel($this->db);
        $this->service = new LeaveService($this->db);
    }

    public function run(): void
    {
        echo "\n── Leave Management Tests ──\n";

        $this->testLeaveTypes();
        $this->testLeaveBalances();
        $this->testLeaveApplyAndApprovalFlow();
        $this->testLeaveStats();

        echo "  Leave Tests: {$this->passed} passed, {$this->failed} failed\n";
    }

    private function testLeaveTypes(): void
    {
        $types = $this->model->getLeaveTypes();
        $this->assert('Leave types retrieved', count($types) >= 5);
        $this->assert('Casual Leave code is CL', $types[0]['code'] === 'CL');
    }

    private function testLeaveBalances(): void
    {
        $balances = $this->model->getLeaveBalances(1, (int)date('Y'));
        $this->assert('User 1 balances initialized', count($balances) >= 5);
        $this->assert('Has total days quota', (float)$balances[0]['total_days'] > 0);
    }

    private function testLeaveApplyAndApprovalFlow(): void
    {
        // Ensure user 1 has available balance for repeatable test runs
        $this->db->exec("UPDATE leave_balances SET used_days = 0, remaining_days = total_days WHERE user_id = 1 AND leave_type_id = 1");

        // Apply for 1 day leave
        $startDate = date('Y-m-d', strtotime('+30 days'));
        $endDate = date('Y-m-d', strtotime('+30 days'));

        $res = $this->service->applyForLeave([
            'user_id'       => 1,
            'leave_type_id' => 1, // Casual Leave
            'start_date'    => $startDate,
            'end_date'      => $endDate,
            'reason'        => 'Test leave application',
            'is_half_day'   => 0
        ]);

        $this->assert('Leave applied successfully', !empty($res['id']));
        $reqId = $res['id'];

        $req = $this->model->getLeaveRequestById($reqId);
        $this->assert('Request status is Pending', $req['status'] === 'Pending');

        // Approve
        $approved = $this->service->approveRequest($reqId, 1, 'Approved by automated test');
        $this->assert('Manager approve request', $approved === true);

        $reqUpdated = $this->model->getLeaveRequestById($reqId);
        $this->assert('Request status is Approved', $reqUpdated['status'] === 'Approved');

        // Clean up test request
        $this->db->prepare("DELETE FROM `leave_requests` WHERE `id` = ?")->execute([$reqId]);
    }

    private function testLeaveStats(): void
    {
        $stats = $this->service->getStats((int)date('Y'));
        $this->assert('Stats returned total_requests', isset($stats['total_requests']));
        $this->assert('Stats returned pending_count', isset($stats['pending_count']));
        $this->assert('Stats returned approved_count', isset($stats['approved_count']));
    }

    private function assert(string $label, bool $condition): void
    {
        if ($condition) {
            $this->passed++;
            echo "  ✅ PASS: {$label}\n";
        } else {
            $this->failed++;
            echo "  ❌ FAIL: {$label}\n";
        }
    }

    public function getPassed(): int { return $this->passed; }
    public function getFailed(): int { return $this->failed; }
}
