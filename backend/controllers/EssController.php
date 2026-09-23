<?php
/**
 * Employee Self-Service (ESS) Controller
 * REST endpoints for employee dashboard, web punch clock, leave requests, expense claims, and payslips.
 */
class EssController extends Controller
{
    private EssModel $model;

    public function __construct()
    {
        parent::__construct();
        $this->model = new EssModel(Database::getInstance());
    }

    /**
     * GET /api/ess/dashboard?user_id=X
     */
    public function dashboard(Request $request): void
    {
        $userId = (int) ($request->getQuery('user_id') ?: 1);

        try {
            $data = $this->model->getDashboard($userId);
            Response::success($data);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 404);
        }
    }

    /**
     * POST /api/ess/punch
     * Body: { user_id: int, notes?: string }
     */
    public function punch(Request $request): void
    {
        $body = $request->getBody();
        $userId = (int) ($body['user_id'] ?? 0);
        $notes = trim($body['notes'] ?? '');

        if (!$userId) {
            Response::error('User ID is required for punch action.', 422);
            return;
        }

        try {
            $result = $this->model->clockInOut($userId, $notes);
            Response::success($result);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * POST /api/ess/leaves
     * Body: { user_id, leave_type_id, start_date, end_date, total_days, is_half_day, reason }
     */
    public function applyLeave(Request $request): void
    {
        $body = $request->getBody();

        try {
            $result = $this->model->applyLeave($body);
            Response::success($result, 201);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    /**
     * POST /api/ess/claims
     * Body: { user_id, title, category, amount, claim_date, description, receipt_url }
     */
    public function submitClaim(Request $request): void
    {
        $body = $request->getBody();

        try {
            $result = $this->model->submitClaim($body);
            Response::success($result, 201);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    /**
     * GET /api/ess/payslips/{id}?user_id=X
     */
    public function payslip(Request $request): void
    {
        $salaryId = (int) $request->getParam('id');
        $userId = (int) ($request->getQuery('user_id') ?: 1);

        try {
            $data = $this->model->getSalarySlipDetails($salaryId, $userId);
            Response::success($data);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 404);
        }
    }
}
