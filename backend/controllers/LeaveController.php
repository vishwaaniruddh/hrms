<?php
/**
 * Leave Controller
 * REST API endpoints for Leave Management & Approval Inbox
 */
class LeaveController extends Controller
{
    private LeaveService $service;

    public function __construct()
    {
        parent::__construct();
        $this->service = new LeaveService();
    }

    /**
     * GET /leaves/types
     */
    public function types(Request $request): void
    {
        $data = $this->service->getLeaveTypes();
        Response::success($data);
    }

    /**
     * GET /leaves/balances?user_id=1
     */
    public function balances(Request $request): void
    {
        $userId = (int)$request->getQuery('user_id', 1);
        $year = (int)$request->getQuery('year', (int)date('Y'));

        $data = $this->service->getLeaveBalances($userId, $year);
        Response::success($data);
    }

    /**
     * GET /leaves/requests
     */
    public function index(Request $request): void
    {
        $page = $request->getPage();
        $perPage = $request->getPerPage();

        $params = [
            'page'          => $page,
            'per_page'      => $perPage,
            'status'        => $request->getQuery('status'),
            'user_id'       => $request->getQuery('user_id'),
            'leave_type_id' => $request->getQuery('leave_type_id'),
            'search'        => $request->getQuery('search'),
        ];

        $result = $this->service->getLeaveRequests($params);
        Response::paginated($result['data'], $result['meta']['total'], $page, $perPage);
    }

    /**
     * POST /leaves/requests
     */
    public function apply(Request $request): void
    {
        $body = $request->getBody();

        try {
            $result = $this->service->applyForLeave($body);
            Response::created($result, 'Leave application submitted successfully.');
        } catch (InvalidArgumentException $e) {
            $decoded = json_decode($e->getMessage(), true);
            Response::error('Validation failed', 422, $decoded ?: ['message' => $e->getMessage()]);
        } catch (Exception $e) {
            Response::error('Failed to submit leave application: ' . $e->getMessage(), 500);
        }
    }

    /**
     * PUT /leaves/requests/{id}/approve
     */
    public function approve(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $body = $request->getBody();
        $approverId = (int)($body['approver_id'] ?? 1); // Default to admin (id: 1)
        $remarks = $body['remarks'] ?? 'Approved by manager';

        $success = $this->service->approveRequest($id, $approverId, $remarks);

        if ($success) {
            try {
                $notifService = new NotificationService();
                $notifService->notifyLeaveStatus($id, 'Approved', $remarks);
            } catch (Exception $e) {}

            Response::success(['approved' => true], 'Leave request approved successfully.');
        } else {
            Response::error('Leave request not found or could not be updated.', 404);
        }
    }

    /**
     * PUT /leaves/requests/{id}/reject
     */
    public function reject(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $body = $request->getBody();
        $approverId = (int)($body['approver_id'] ?? 1);
        $remarks = $body['remarks'] ?? 'Rejected by manager';

        $success = $this->service->rejectRequest($id, $approverId, $remarks);

        if ($success) {
            try {
                $notifService = new NotificationService();
                $notifService->notifyLeaveStatus($id, 'Rejected', $remarks);
            } catch (Exception $e) {}

            Response::success(['rejected' => true], 'Leave request rejected.');
        } else {
            Response::error('Leave request not found or could not be updated.', 404);
        }
    }

    /**
     * GET /leaves/stats
     */
    public function stats(Request $request): void
    {
        $year = (int)$request->getQuery('year', (int)date('Y'));
        $userId = $request->getQuery('user_id') ? (int)$request->getQuery('user_id') : null;
        $data = $this->service->getStats($year, $userId);
        Response::success($data);
    }
}
