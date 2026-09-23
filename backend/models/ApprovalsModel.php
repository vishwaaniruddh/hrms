<?php
/**
 * Manager Approvals Model
 * Aggregates pending multi-department approval queues (Leaves, Expense Claims, Exit Clearances)
 */
class ApprovalsModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Get unified pending approvals inbox
     */
    public function getPendingInbox(?int $managerId = null): array
    {
        // 1. Pending Leave Requests
        $leaveStmt = $this->db->query("
            SELECT lr.*, 
                   u.full_name as employee_name, u.email as employee_email, 
                   u.designation as employee_designation, u.avatar as employee_avatar,
                   lt.name as leave_type_name, lt.code as leave_type_code, lt.color as leave_type_color,
                   (
                       SELECT COUNT(*) 
                       FROM leave_requests ol 
                       WHERE ol.id != lr.id 
                         AND ol.status = 'Approved' 
                         AND (ol.start_date <= lr.end_date AND ol.end_date >= lr.start_date)
                   ) as team_overlap_count
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            WHERE lr.status = 'Pending'
            ORDER BY lr.created_at ASC
        ");
        $pendingLeaves = $leaveStmt->fetchAll(PDO::FETCH_ASSOC);

        // 2. Pending Expense Claims
        $claimStmt = $this->db->query("
            SELECT ec.*, 
                   u.full_name as employee_name, u.email as employee_email,
                   u.designation as employee_designation, u.avatar as employee_avatar
            FROM expense_claims ec
            JOIN users u ON ec.user_id = u.id
            WHERE ec.status = 'Pending'
            ORDER BY ec.created_at ASC
        ");
        $pendingClaims = $claimStmt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Pending Exit Clearances (from Lifecycle tasks for Offboarding)
        $clearanceStmt = $this->db->query("
            SELECT lt.*, 
                   lw.workflow_code, lw.type as workflow_type, lw.target_date as last_working_day,
                   u.full_name as employee_name, u.email as employee_email,
                   u.designation as employee_designation, u.avatar as employee_avatar
            FROM lifecycle_tasks lt
            JOIN lifecycle_workflows lw ON lt.workflow_id = lw.id
            JOIN users u ON lw.user_id = u.id
            WHERE lw.type = 'Offboarding' 
              AND lt.status = 'Pending'
            ORDER BY lw.target_date ASC, lt.id ASC
        ");
        $pendingClearances = $clearanceStmt->fetchAll(PDO::FETCH_ASSOC);

        // 4. Pending Shift Swaps
        $swapStmt = $this->db->query("
            SELECT s.*, 
                   req.full_name as requester_name, req.email as requester_email, req.avatar as requester_avatar,
                   rec.full_name as receiver_name, rec.email as receiver_email, rec.avatar as receiver_avatar,
                   sh.name as current_shift_name, sh.shift_code as current_shift_code, sh.color as current_shift_color
            FROM shift_swaps s
            JOIN users req ON s.requester_id = req.id
            JOIN users rec ON s.receiver_id = rec.id
            JOIN shift_rosters r ON s.roster_id = r.id
            LEFT JOIN shifts sh ON r.shift_id = sh.id
            WHERE s.manager_status = 'Pending'
            ORDER BY s.created_at ASC
        ");
        $pendingSwaps = $swapStmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculate KPI summary
        $totalPending = count($pendingLeaves) + count($pendingClaims) + count($pendingClearances) + count($pendingSwaps);
        $totalClaimAmount = array_sum(array_column($pendingClaims, 'amount'));

        return [
            'summary' => [
                'total_pending'            => $totalPending,
                'pending_leaves_count'     => count($pendingLeaves),
                'pending_claims_count'     => count($pendingClaims),
                'pending_clearances_count' => count($pendingClearances),
                'pending_swaps_count'      => count($pendingSwaps),
                'pending_claims_amount'    => (float) $totalClaimAmount,
            ],
            'leaves'     => $pendingLeaves,
            'claims'     => $pendingClaims,
            'clearances' => $pendingClearances,
            'swaps'      => $pendingSwaps,
        ];
    }

    /**
     * Approve or reject a leave request
     */
    public function reviewLeave(int $leaveId, int $reviewerId, string $action, ?string $remarks = null): array
    {
        $status = ucfirst(strtolower($action)); // 'Approved' or 'Rejected'
        if (!in_array($status, ['Approved', 'Rejected'])) {
            throw new Exception("Invalid leave review action. Must be 'Approved' or 'Rejected'.");
        }

        $stmt = $this->db->prepare("SELECT * FROM leave_requests WHERE id = :id");
        $stmt->execute(['id' => $leaveId]);
        $leave = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$leave) {
            throw new Exception("Leave request with ID $leaveId not found.");
        }

        $upd = $this->db->prepare("
            UPDATE leave_requests 
            SET status = :status, approver_id = :approver, approver_remarks = :remarks, approved_at = NOW()
            WHERE id = :id
        ");
        $upd->execute([
            'status'   => $status,
            'approver' => $reviewerId,
            'remarks'  => $remarks,
            'id'       => $leaveId
        ]);

        // Adjust leave_balances
        $year = (int) date('Y', strtotime($leave['start_date']));
        $days = (float) $leave['total_days'];

        $balStmt = $this->db->prepare("
            SELECT * FROM leave_balances 
            WHERE user_id = :uid AND leave_type_id = :ltid AND year = :yr
        ");
        $balStmt->execute([
            'uid'  => $leave['user_id'],
            'ltid' => $leave['leave_type_id'],
            'yr'   => $year
        ]);
        $balance = $balStmt->fetch(PDO::FETCH_ASSOC);

        if ($balance) {
            if ($status === 'Approved') {
                $this->db->prepare("
                    UPDATE leave_balances 
                    SET pending_days = GREATEST(0, pending_days - :d1),
                        used_days = used_days + :d2,
                        remaining_days = GREATEST(0, remaining_days - :d3)
                    WHERE id = :id
                ")->execute(['d1' => $days, 'd2' => $days, 'd3' => $days, 'id' => $balance['id']]);
            } else { // Rejected
                $this->db->prepare("
                    UPDATE leave_balances 
                    SET pending_days = GREATEST(0, pending_days - :d1)
                    WHERE id = :id
                ")->execute(['d1' => $days, 'id' => $balance['id']]);
            }
        }

        return [
            'id'      => $leaveId,
            'status'  => $status,
            'message' => "Leave request has been $status successfully."
        ];
    }

    /**
     * Approve or reject an expense claim
     */
    public function reviewClaim(int $claimId, int $reviewerId, string $action, ?string $remarks = null): array
    {
        $status = ucfirst(strtolower($action)); // 'Approved', 'Rejected', 'Reimbursed'
        if (!in_array($status, ['Approved', 'Rejected', 'Reimbursed'])) {
            throw new Exception("Invalid claim review action. Must be 'Approved', 'Rejected', or 'Reimbursed'.");
        }

        $stmt = $this->db->prepare("SELECT * FROM expense_claims WHERE id = :id");
        $stmt->execute(['id' => $claimId]);
        $claim = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$claim) {
            throw new Exception("Expense claim with ID $claimId not found.");
        }

        $approvedAt = ($status === 'Approved') ? date('Y-m-d H:i:s') : $claim['approved_at'];
        $reimbursedAt = ($status === 'Reimbursed') ? date('Y-m-d H:i:s') : $claim['reimbursed_at'];

        $upd = $this->db->prepare("
            UPDATE expense_claims 
            SET status = :status, approver_id = :approver, approver_remarks = :remarks, 
                approved_at = :app_at, reimbursed_at = :reimb_at
            WHERE id = :id
        ");
        $upd->execute([
            'status'   => $status,
            'approver' => $reviewerId,
            'remarks'  => $remarks,
            'app_at'   => $approvedAt,
            'reimb_at' => $reimbursedAt,
            'id'       => $claimId
        ]);

        return [
            'id'      => $claimId,
            'status'  => $status,
            'message' => "Expense claim has been marked as $status."
        ];
    }

    /**
     * Review/sign-off department clearance task
     */
    public function reviewClearanceTask(int $taskId, int $reviewerId, string $status, ?string $notes = null): array
    {
        $stmt = $this->db->prepare("SELECT * FROM lifecycle_tasks WHERE id = :id");
        $stmt->execute(['id' => $taskId]);
        $task = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$task) {
            throw new Exception("Clearance task with ID $taskId not found.");
        }

        $completedAt = ($status === 'Completed') ? date('Y-m-d H:i:s') : null;
        $upd = $this->db->prepare("
            UPDATE lifecycle_tasks 
            SET status = :status, notes = COALESCE(:notes, notes), completed_at = :completed_at
            WHERE id = :id
        ");
        $upd->execute([
            'status'       => $status,
            'notes'        => $notes,
            'completed_at' => $completedAt,
            'id'           => $taskId
        ]);

        // Recalculate workflow progress
        require_once __DIR__ . '/LifecycleModel.php';
        $lifecycleModel = new LifecycleModel($this->db);
        $lifecycleModel->recalculateProgress($task['workflow_id']);

        return [
            'id'      => $taskId,
            'status'  => $status,
            'message' => "Clearance milestone successfully marked as $status."
        ];
    }
}
