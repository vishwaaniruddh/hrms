<?php
/**
 * Employee Self-Service (ESS) & Manager Approvals Unit Tests
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/EssModel.php';
require_once __DIR__ . '/../models/ApprovalsModel.php';

class EssApprovalsTest
{
    private PDO $db;
    private EssModel $essModel;
    private ApprovalsModel $approvalsModel;
    private int $passed = 0;
    private int $failed = 0;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->essModel = new EssModel($this->db);
        $this->approvalsModel = new ApprovalsModel($this->db);
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
        echo "\n── Employee Self-Service (ESS) & Manager Approvals Tests ──\n";

        $this->testEssDashboard();
        $this->testPunchClockCycle();
        $this->testLeaveApplicationAndManagerApproval();
        $this->testExpenseClaimAndManagerApproval();
        $this->testManagerInboxAggregation();

        echo "  ESS & Approvals Tests: {$this->passed} passed, {$this->failed} failed\n";
        return ['passed' => $this->passed, 'failed' => $this->failed];
    }

    private function getTestUserId(): int
    {
        $stmt = $this->db->query("SELECT id FROM users WHERE email = 'julian.morales@example.com'");
        $id = $stmt->fetchColumn();
        return $id ? (int)$id : 1;
    }

    private function testEssDashboard(): void
    {
        $userId = $this->getTestUserId();
        $data = $this->essModel->getDashboard($userId);

        $this->assert(is_array($data), 'Dashboard query returns array');
        $this->assert(!empty($data['user']['full_name']), 'User profile contains full name: ' . ($data['user']['full_name'] ?? ''));
        $this->assert(!empty($data['user']['role_name']), 'User profile contains role name');
        $this->assert(isset($data['punch_status']['is_clocked_in']), 'Dashboard provides real-time punch clock status');
        $this->assert(isset($data['attendance_stats']['present_days']), 'Dashboard provides monthly attendance metrics');
        $this->assert(is_array($data['leave_balances']), 'Dashboard contains leave balances list');
        $this->assert(is_float($data['total_leave_rem']) || is_numeric($data['total_leave_rem']), 'Total remaining leave computed');
        $this->assert(is_array($data['assigned_assets']), 'Assigned hardware inventory list returned');
        $this->assert(is_array($data['payslips']), 'Recent payslips history array returned');
        $this->assert(is_array($data['leave_requests']), 'Recent leave applications array returned');
        $this->assert(is_array($data['expense_claims']), 'Recent expense claims array returned');
    }

    private function testPunchClockCycle(): void
    {
        // Use a dedicated dummy user for punch clock tests so we don't disrupt real dates
        $dummyEmail = 'test.puncher.' . time() . '@example.com';
        $this->db->prepare("
            INSERT INTO users (full_name, email, password, designation, role_id, joining_date)
            VALUES ('Punch Test User', :email, 'hash', 'Pharmacist', 3, '2026-01-01')
        ")->execute(['email' => $dummyEmail]);
        $testUid = (int)$this->db->lastInsertId();

        // 1. Clock In
        $inRes = $this->essModel->clockInOut($testUid, 'Morning shift punch test');
        $this->assert($inRes['action'] === 'clock_in', 'First punch successfully executes Clock In');
        $this->assert(!empty($inRes['sign_in']), 'Clock in timestamp recorded: ' . ($inRes['sign_in'] ?? ''));
        $this->assert(in_array($inRes['status'], ['Present', 'Late']), 'Clock in determines punctuality status: ' . ($inRes['status'] ?? ''));

        // 2. Clock Out
        $outRes = $this->essModel->clockInOut($testUid, 'Evening checkout test');
        $this->assert($outRes['action'] === 'clock_out', 'Second punch successfully executes Clock Out');
        $this->assert(!empty($outRes['sign_out']), 'Clock out timestamp recorded: ' . ($outRes['sign_out'] ?? ''));
        $this->assert(!empty($outRes['stay_time']), 'Elapsed stay time computed: ' . ($outRes['stay_time'] ?? ''));

        // 3. Duplicate punch on same day
        $dupRes = $this->essModel->clockInOut($testUid);
        $this->assert($dupRes['action'] === 'already_completed', 'Third punch safely recognizes shift already completed');

        // Cleanup
        $this->db->prepare("DELETE FROM attendances WHERE user_id = :uid")->execute(['uid' => $testUid]);
        $this->db->prepare("DELETE FROM users WHERE id = :uid")->execute(['uid' => $testUid]);
    }

    private function testLeaveApplicationAndManagerApproval(): void
    {
        $userId = $this->getTestUserId();
        $ltId = (int)$this->db->query("SELECT id FROM leave_types LIMIT 1")->fetchColumn();

        // Ensure user has remaining balance for idempotent test execution
        $this->db->prepare("UPDATE leave_balances SET remaining_days = 20 WHERE user_id = :uid AND leave_type_id = :ltId")
                 ->execute([':uid' => $userId, ':ltId' => $ltId]);

        // Apply for leave
        $app = $this->essModel->applyLeave([
            'user_id'       => $userId,
            'leave_type_id' => $ltId,
            'start_date'    => '2026-11-10',
            'end_date'      => '2026-11-12',
            'total_days'    => 2.0,
            'is_half_day'   => 0,
            'reason'        => 'Family celebration and clinical conference travel'
        ]);

        $this->assert(!empty($app['id']), 'Leave application submitted with ID: ' . $app['id']);
        $this->assert($app['status'] === 'Pending', 'Leave request created in Pending status');
        $leaveId = $app['id'];

        // Verify it appears in manager approvals inbox
        $inbox = $this->approvalsModel->getPendingInbox(2);
        $found = false;
        foreach ($inbox['leaves'] as $l) {
            if ((int)$l['id'] === $leaveId) {
                $found = true;
                $this->assert(!empty($l['employee_name']), 'Pending leave joined with applicant name: ' . $l['employee_name']);
                $this->assert(isset($l['team_overlap_count']), 'Team leave overlap count calculated: ' . $l['team_overlap_count']);
                break;
            }
        }
        $this->assert($found, 'New leave request immediately visible in Manager Approvals Inbox');

        // Manager reviews and approves
        $review = $this->approvalsModel->reviewLeave($leaveId, 2, 'Approved', 'Approved per manager schedule review.');
        $this->assert($review['status'] === 'Approved', 'Leave request transitioned to Approved');

        // Verify status in DB
        $stmt = $this->db->prepare("SELECT status, approver_id FROM leave_requests WHERE id = :id");
        $stmt->execute(['id' => $leaveId]);
        $updated = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->assert($updated['status'] === 'Approved', 'Database record confirmed as Approved');
        $this->assert((int)$updated['approver_id'] === 2, 'Approver ID correctly assigned to manager');

        // Cleanup
        $this->db->prepare("DELETE FROM leave_requests WHERE id = :id")->execute(['id' => $leaveId]);
    }

    private function testExpenseClaimAndManagerApproval(): void
    {
        $userId = $this->getTestUserId();

        // Submit expense claim
        $claim = $this->essModel->submitClaim([
            'user_id'     => $userId,
            'title'       => 'High-Speed Fiber Internet & Regional Clinic Travel',
            'category'    => 'Internet & Utilities',
            'amount'      => 85.50,
            'claim_date'  => date('Y-m-d'),
            'description' => 'Work from home connectivity and off-site client travel',
            'receipt_url' => '/uploads/receipts/test_bill.pdf'
        ]);

        $this->assert(!empty($claim['id']), 'Expense claim submitted with ID: ' . $claim['id']);
        $this->assert(!empty($claim['claim_number']), 'Claim auto-assigned claim number: ' . $claim['claim_number']);
        $claimId = $claim['id'];

        // Manager reviews and approves
        $review = $this->approvalsModel->reviewClaim($claimId, 2, 'Approved', 'Verified broadband utility receipt.');
        $this->assert($review['status'] === 'Approved', 'Expense claim transitioned to Approved');

        // Verify in DB
        $stmt = $this->db->prepare("SELECT status, approver_remarks FROM expense_claims WHERE id = :id");
        $stmt->execute(['id' => $claimId]);
        $updated = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->assert($updated['status'] === 'Approved', 'Claim DB status updated to Approved');
        $this->assert(str_contains($updated['approver_remarks'], 'Verified broadband'), 'Approver remarks saved');

        // Cleanup
        $this->db->prepare("DELETE FROM expense_claims WHERE id = :id")->execute(['id' => $claimId]);
    }

    private function testManagerInboxAggregation(): void
    {
        $inbox = $this->approvalsModel->getPendingInbox(2);

        $this->assert(isset($inbox['summary']['total_pending']), 'Inbox contains summary with total_pending KPI');
        $this->assert(isset($inbox['summary']['pending_leaves_count']), 'Inbox summary tracks pending leaves count');
        $this->assert(isset($inbox['summary']['pending_claims_count']), 'Inbox summary tracks pending claims count');
        $this->assert(isset($inbox['summary']['pending_clearances_count']), 'Inbox summary tracks pending clearances count');
        $this->assert(isset($inbox['summary']['pending_claims_amount']), 'Inbox summary aggregates pending claims dollar volume');
        $this->assert(is_array($inbox['leaves']), 'Leaves array present');
        $this->assert(is_array($inbox['claims']), 'Claims array present');
        $this->assert(is_array($inbox['clearances']), 'Clearances array present');
    }
}
