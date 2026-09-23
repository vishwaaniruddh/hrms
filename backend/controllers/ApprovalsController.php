<?php
/**
 * Manager Approvals Controller
 * REST endpoints for unified approval inbox, leave sign-offs, expense claims, and clearance tasks.
 */
class ApprovalsController extends Controller
{
    private ApprovalsModel $model;

    public function __construct()
    {
        parent::__construct();
        $this->model = new ApprovalsModel(Database::getInstance());
    }

    /**
     * GET /api/approvals/inbox?manager_id=X
     */
    public function inbox(Request $request): void
    {
        $managerId = $request->getQuery('manager_id') ? (int) $request->getQuery('manager_id') : null;

        try {
            $data = $this->model->getPendingInbox($managerId);
            Response::success($data);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * POST /api/approvals/leaves/{id}
     * Body: { reviewer_id: int, action: 'Approved'|'Rejected', remarks?: string }
     */
    public function reviewLeave(Request $request): void
    {
        $leaveId = (int) $request->getParam('id');
        $body = $request->getBody();
        $reviewerId = (int) ($body['reviewer_id'] ?? 1);
        $action = $body['action'] ?? 'Approved';
        $remarks = $body['remarks'] ?? null;

        try {
            $result = $this->model->reviewLeave($leaveId, $reviewerId, $action, $remarks);
            
            // Event Trigger: Instant WhatsApp Notification
            try {
                $notifService = new NotificationService();
                $notifService->notifyLeaveStatus($leaveId, $action, $remarks);
            } catch (Exception $ne) {
                // Non-blocking notification failure
            }

            Response::success($result);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    /**
     * POST /api/approvals/claims/{id}
     * Body: { reviewer_id: int, action: 'Approved'|'Rejected'|'Reimbursed', remarks?: string }
     */
    public function reviewClaim(Request $request): void
    {
        $claimId = (int) $request->getParam('id');
        $body = $request->getBody();
        $reviewerId = (int) ($body['reviewer_id'] ?? 1);
        $action = $body['action'] ?? 'Approved';
        $remarks = $body['remarks'] ?? null;

        try {
            $result = $this->model->reviewClaim($claimId, $reviewerId, $action, $remarks);
            Response::success($result);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    /**
     * POST /api/approvals/clearance/{id}
     * Body: { reviewer_id: int, status: 'Completed'|'Waived', notes?: string }
     */
    public function reviewClearance(Request $request): void
    {
        $taskId = (int) $request->getParam('id');
        $body = $request->getBody();
        $reviewerId = (int) ($body['reviewer_id'] ?? 1);
        $status = $body['status'] ?? 'Completed';
        $notes = $body['notes'] ?? null;

        try {
            $result = $this->model->reviewClearanceTask($taskId, $reviewerId, $status, $notes);
            Response::success($result);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 422);
        }
    }
}
