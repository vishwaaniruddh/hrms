<?php
/**
 * Performance Management & Appraisals (PMS) Controller
 */
require_once __DIR__ . '/../models/PmsModel.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../core/Response.php';

class PmsController
{
    private PmsModel $model;

    public function __construct(?PDO $db = null)
    {
        $database = $db ?? Database::getInstance();
        $this->model = new PmsModel($database);
    }

    /**
     * GET /pms/cycles
     */
    public function getCycles(Request $request): void
    {
        $cycles = $this->model->getCycles();
        Response::success($cycles);
    }

    /**
     * POST /pms/cycles
     */
    public function createCycle(Request $request): void
    {
        $body = $request->getBody();
        if (empty($body['title']) || empty($body['start_date']) || empty($body['end_date'])) {
            Response::error('Title, start date, and end date are required.', 422);
            return;
        }

        try {
            $id = $this->model->createCycle($body);
            $cycle = $this->model->getCycleById($id);
            Response::created($cycle, 'Performance cycle created successfully.');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /pms/competencies
     */
    public function getCompetencies(Request $request): void
    {
        $competencies = $this->model->getCompetencies();
        Response::success($competencies);
    }

    /**
     * GET /pms/okrs
     */
    public function getOkrs(Request $request): void
    {
        $filters = [
            'cycle_id' => $request->getQuery('cycle_id'),
            'user_id'  => $request->getQuery('user_id'),
            'quarter'  => $request->getQuery('quarter'),
            'category' => $request->getQuery('category'),
            'status'   => $request->getQuery('status')
        ];

        $okrs = $this->model->getOkrs($filters);
        Response::success($okrs);
    }

    /**
     * GET /pms/okrs/{id}
     */
    public function getOkrById(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $okr = $this->model->getOkrById($id);
        if (!$okr) {
            Response::error('OKR not found.', 404);
            return;
        }
        Response::success($okr);
    }

    /**
     * POST /pms/okrs
     */
    public function createOkr(Request $request): void
    {
        $body = $request->getBody();
        if (empty($body['objective_title']) || empty($body['cycle_id']) || empty($body['user_id'])) {
            Response::error('Objective title, cycle, and user are required.', 422);
            return;
        }

        try {
            $id = $this->model->createOkr($body);
            $okr = $this->model->getOkrById($id);
            Response::created($okr, 'Objective and Key Results created successfully.');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * PUT /pms/key-results/{id}/progress
     */
    public function updateKeyResultProgress(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $body = $request->getBody();

        if (!isset($body['current_value'])) {
            Response::error('Current value is required.', 422);
            return;
        }

        try {
            $res = $this->model->updateKeyResultProgress(
                $id, 
                (float)$body['current_value'], 
                $body['status'] ?? null
            );
            Response::success($res, 'Key Result progress checked in.');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /pms/reviews
     */
    public function getReviews(Request $request): void
    {
        $filters = [
            'cycle_id'   => $request->getQuery('cycle_id'),
            'user_id'    => $request->getQuery('user_id'),
            'manager_id' => $request->getQuery('manager_id'),
            'status'     => $request->getQuery('status')
        ];

        $reviews = $this->model->getReviews($filters);
        Response::success($reviews);
    }

    /**
     * GET /pms/reviews/{id}
     */
    public function getReviewById(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $review = $this->model->getReviewById($id);
        if (!$review) {
            Response::error('Performance review not found.', 404);
            return;
        }
        Response::success($review);
    }

    /**
     * POST /pms/reviews/{id}/self-eval
     */
    public function submitSelfEvaluation(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $body = $request->getBody();

        try {
            $this->model->submitSelfEvaluation($id, $body);
            $rev = $this->model->getReviewById($id);
            Response::success($rev, 'Self-evaluation submitted successfully to your manager.');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * POST /pms/reviews/{id}/manager-eval
     */
    public function submitManagerEvaluation(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $body = $request->getBody();

        try {
            $this->model->submitManagerEvaluation($id, $body);
            $rev = $this->model->getReviewById($id);
            Response::success($rev, 'Manager appraisal submitted and 9-box talent rating resolved.');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /pms/talent-matrix
     */
    public function getTalentMatrix(Request $request): void
    {
        $cycleId = $request->getQuery('cycle_id');
        if (!$cycleId) {
            $active = $this->model->getActiveCycle();
            $cycleId = $active ? (int)$active['id'] : 1;
        }

        $matrix = $this->model->getTalentMatrix((int)$cycleId);
        Response::success($matrix);
    }

    /**
     * POST /pms/reviews/{id}/apply-increment
     */
    public function applyIncrement(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $body = $request->getBody();
        $processedBy = (int)($body['processed_by'] ?? 1);

        try {
            $res = $this->model->applyIncrementToPayroll($id, $processedBy);
            Response::success($res, 'Appraisal increment applied directly to employee payroll structure.');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * GET /pms/salary-increments
     */
    public function getSalaryIncrements(Request $request): void
    {
        $userId = $request->getQuery('user_id') ? (int)$request->getQuery('user_id') : null;
        $increments = $this->model->getSalaryIncrements($userId);
        Response::success($increments);
    }

    /**
     * GET /pms/stats
     */
    public function getStats(Request $request): void
    {
        $cycleId = $request->getQuery('cycle_id') ? (int)$request->getQuery('cycle_id') : null;
        $userId = $request->getQuery('user_id') ? (int)$request->getQuery('user_id') : null;

        $stats = $this->model->getStats($cycleId, $userId);
        Response::success($stats);
    }
}
