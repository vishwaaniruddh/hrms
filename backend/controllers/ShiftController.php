<?php
/**
 * Shift Controller
 * REST endpoints for Shift Master, Visual Roster Grid, Shift Swaps, and Overtime & Differentials.
 */
require_once __DIR__ . '/../core/Response.php';

class ShiftController extends Controller
{
    private ShiftModel $model;

    public function __construct()
    {
        parent::__construct();
        $this->model = new ShiftModel(Database::getInstance());
    }

    /**
     * GET /api/shifts
     */
    public function getShifts(Request $request): void
    {
        $activeOnly = $request->getQuery('active_only') === 'true' || $request->getQuery('active_only') === '1';
        $shifts = $this->model->getShifts($activeOnly);
        Response::success($shifts);
    }

    /**
     * POST /api/shifts
     */
    public function createShift(Request $request): void
    {
        $body = $request->getBody();

        if (empty($body['name']) || empty($body['start_time']) || empty($body['end_time'])) {
            Response::error('Shift name, start_time, and end_time are required', 422);
        }

        $id = $this->model->createShift($body);
        $shift = $this->model->getShiftById($id);
        Response::created($shift, 'Shift created successfully');
    }

    /**
     * PUT /api/shifts/{id}
     */
    public function updateShift(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $body = $request->getBody();

        $ok = $this->model->updateShift($id, $body);
        if ($ok) {
            $shift = $this->model->getShiftById($id);
            Response::success($shift, 'Shift updated successfully');
        } else {
            Response::error('Shift not found or no changes made', 400);
        }
    }

    /**
     * DELETE /api/shifts/{id}
     */
    public function deleteShift(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $ok = $this->model->deleteShift($id);
        if ($ok) {
            Response::success(['deleted' => true], 'Shift deactivated successfully');
        } else {
            Response::error('Shift could not be deactivated', 400);
        }
    }

    /**
     * GET /api/shifts/roster?year=2026&month=9&department=Engineering
     */
    public function getRoster(Request $request): void
    {
        $year = (int) $request->getQuery('year', (int) date('Y'));
        $month = (int) $request->getQuery('month', (int) date('m'));
        $department = $request->getQuery('department');

        $grid = $this->model->getRosterGrid($year, $month, $department);
        Response::success($grid);
    }

    /**
     * POST /api/shifts/roster/assign
     * Body: { user_id: int, date: string, shift_id?: int, is_off_day?: bool, notes?: string }
     */
    public function assignRoster(Request $request): void
    {
        $body = $request->getBody();
        $userId = (int) ($body['user_id'] ?? 0);
        $date = $body['date'] ?? null;
        $shiftId = isset($body['shift_id']) && $body['shift_id'] !== '' ? (int) $body['shift_id'] : null;
        $isOff = !empty($body['is_off_day']);
        $notes = $body['notes'] ?? null;
        $assignedBy = (int) ($body['assigned_by'] ?? 1);

        if (!$userId || !$date) {
            Response::error('user_id and date are required', 422);
        }

        $id = $this->model->assignRoster($userId, $date, $shiftId, $isOff, $notes, $assignedBy);
        Response::success(['id' => $id, 'user_id' => $userId, 'date' => $date, 'shift_id' => $shiftId], 'Roster updated');
    }

    /**
     * POST /api/shifts/roster/bulk
     */
    public function bulkAssign(Request $request): void
    {
        $body = $request->getBody();

        if (empty($body['user_ids']) || empty($body['start_date']) || empty($body['end_date']) || empty($body['shift_id'])) {
            Response::error('user_ids, start_date, end_date, and shift_id are required', 422);
        }

        $count = $this->model->bulkAssignPattern($body);
        Response::success(['assigned_slots' => $count], "Bulk schedule assigned {$count} slots successfully");
    }

    /**
     * GET /api/shifts/swaps
     */
    public function getSwaps(Request $request): void
    {
        $managerId = $request->getQuery('manager_id') ? (int) $request->getQuery('manager_id') : null;
        $userId = $request->getQuery('user_id') ? (int) $request->getQuery('user_id') : null;
        $status = $request->getQuery('status');

        $swaps = $this->model->getSwapRequests($managerId, $userId, $status);
        Response::success($swaps);
    }

    /**
     * POST /api/shifts/swaps
     * Body: { requester_id: int, receiver_id: int, roster_id: int, date: string, reason: string, target_shift_id?: int }
     */
    public function createSwap(Request $request): void
    {
        $body = $request->getBody();

        $reqId = (int) ($body['requester_id'] ?? 0);
        $recId = (int) ($body['receiver_id'] ?? 0);
        $rosterId = (int) ($body['roster_id'] ?? 0);
        $date = $body['date'] ?? null;
        $reason = $body['reason'] ?? 'Shift exchange request';
        $targetShiftId = !empty($body['target_shift_id']) ? (int) $body['target_shift_id'] : null;

        if (!$reqId || !$recId || !$rosterId || !$date) {
            Response::error('requester_id, receiver_id, roster_id, and date are required', 422);
        }

        $id = $this->model->createSwapRequest($reqId, $recId, $rosterId, $date, $reason, $targetShiftId);

        // Dispatch WhatsApp notification to colleague
        try {
            $notif = new NotificationService();
            $db = Database::getInstance();
            $receiver = $db->query("SELECT phone, full_name FROM users WHERE id = {$recId}")->fetch();
            $requester = $db->query("SELECT full_name FROM users WHERE id = {$reqId}")->fetch();
            if ($receiver && !empty($receiver['phone'])) {
                $text = "Hi {$receiver['full_name']}, colleague {$requester['full_name']} has requested a shift swap with you for date {$date}. Please review and respond in your HRMS ESS Portal.";
                $notif->sendCustom($receiver['phone'], $text, 'whatsapp', $recId, $receiver['full_name']);
            }
        } catch (Exception $e) {}

        Response::created(['id' => $id], 'Shift swap request submitted');
    }

    /**
     * POST /api/shifts/swaps/{id}/peer-respond
     * Body: { user_id: int, action: 'accept'|'decline' }
     */
    public function respondSwap(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $body = $request->getBody();
        $userId = (int) ($body['user_id'] ?? 0);
        $action = $body['action'] ?? 'accept';

        $ok = $this->model->respondToSwap($id, $userId, $action);
        if ($ok) {
            Response::success(['updated' => true], "Swap request {$action}ed by colleague");
        } else {
            Response::error('Failed to update swap response', 400);
        }
    }

    /**
     * POST /api/shifts/swaps/{id}/review
     * Body: { manager_id: int, action: 'approved'|'rejected', remarks?: string }
     */
    public function reviewSwap(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $body = $request->getBody();
        $managerId = (int) ($body['manager_id'] ?? 1);
        $action = $body['action'] ?? 'approved';
        $remarks = $body['remarks'] ?? null;

        $ok = $this->model->reviewSwap($id, $managerId, $action, $remarks);
        if ($ok) {
            // Dispatch WhatsApp notification to requester
            try {
                $notif = new NotificationService();
                $db = Database::getInstance();
                $swap = $db->query("SELECT requester_id, swap_date FROM shift_swaps WHERE id = {$id}")->fetch();
                if ($swap) {
                    $reqUser = $db->query("SELECT phone, full_name FROM users WHERE id = {$swap['requester_id']}")->fetch();
                    if ($reqUser && !empty($reqUser['phone'])) {
                        $text = "Shift Swap Update: Hi {$reqUser['full_name']}, your shift swap for {$swap['swap_date']} has been {$action} by manager. Remarks: " . ($remarks ?: 'None');
                        $notif->sendCustom($reqUser['phone'], $text, 'whatsapp', (int) $swap['requester_id'], $reqUser['full_name']);
                    }
                }
            } catch (Exception $e) {}

            Response::success(['reviewed' => true], "Shift swap {$action} successfully and roster schedules updated");
        } else {
            Response::error('Failed to review shift swap', 400);
        }
    }

    /**
     * GET /api/shifts/overtime
     */
    public function getOvertime(Request $request): void
    {
        $filters = [
            'user_id'        => $request->getQuery('user_id'),
            'month'          => $request->getQuery('month'),
            'year'           => $request->getQuery('year'),
            'payroll_synced' => $request->getQuery('payroll_synced') !== null ? (int) $request->getQuery('payroll_synced') : null
        ];
        $filters = array_filter($filters, fn($v) => $v !== null && $v !== '');

        $records = $this->model->getOvertimeRecords($filters);
        Response::success($records);
    }

    /**
     * POST /api/shifts/overtime/calculate
     * Body: { date_from: string, date_to: string }
     */
    public function calculateOvertime(Request $request): void
    {
        $body = $request->getBody();
        $dateFrom = $body['date_from'] ?? date('Y-m-01');
        $dateTo = $body['date_to'] ?? date('Y-m-d');

        $result = $this->model->calculateOvertimeAndDifferentials($dateFrom, $dateTo);
        Response::success($result, 'Overtime and night differentials computed successfully');
    }

    /**
     * POST /api/shifts/overtime/sync
     * Body: { record_ids: int[], salary_id: int }
     */
    public function syncOvertime(Request $request): void
    {
        $body = $request->getBody();
        $recordIds = $body['record_ids'] ?? [];
        $salaryId = (int) ($body['salary_id'] ?? 0);

        if (empty($recordIds)) {
            Response::error('record_ids array is required', 422);
        }

        $result = $this->model->syncOvertimeToPayroll($recordIds, $salaryId);
        Response::success($result, 'Differentials and overtime synced to payroll');
    }

    /**
     * GET /api/shifts/stats
     */
    public function getStats(Request $request): void
    {
        $stats = $this->model->getStats();
        Response::success($stats);
    }
}
