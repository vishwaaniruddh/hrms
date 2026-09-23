<?php
/**
 * Recruitment Controller
 * REST endpoints for Job Openings, Candidate Pipeline, Kanban board, and hiring analytics
 */
class RecruitmentController extends Controller
{
    private RecruitmentModel $model;

    public function __construct()
    {
        parent::__construct();
        $this->model = new RecruitmentModel(Database::getInstance());
    }

    /**
     * GET /api/recruitment/stats
     */
    public function stats(Request $request): void
    {
        $stats = $this->model->getStats();
        Response::success($stats);
    }

    /**
     * GET /api/recruitment/openings
     */
    public function openings(Request $request): void
    {
        $filters = [
            'department'      => $request->getQuery('department'),
            'status'          => $request->getQuery('status'),
            'location'        => $request->getQuery('location'),
            'employment_type' => $request->getQuery('employment_type'),
            'search'          => $request->getQuery('search'),
        ];
        $filters = array_filter($filters, fn($v) => $v !== null && $v !== '');

        $page = $request->getPage();
        $perPage = $request->getPerPage(50);

        $result = $this->model->getOpenings($filters, $page, $perPage);
        Response::paginated($result['data'], $result['total'], $page, $perPage);
    }

    /**
     * GET /api/recruitment/openings/{id}
     */
    public function showOpening(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $job = $this->model->getOpeningById($id);

        if (!$job) {
            Response::notFound('Job opening not found');
            return;
        }

        Response::success($job);
    }

    /**
     * POST /api/recruitment/openings
     */
    public function storeOpening(Request $request): void
    {
        $body = $request->getBody();

        if (empty($body['title']) || empty($body['department'])) {
            Response::badRequest('Job title and department are required');
            return;
        }

        $id = $this->model->createOpening($body);
        $job = $this->model->getOpeningById($id);
        Response::created($job, 'Job opening created successfully');
    }

    /**
     * PUT /api/recruitment/openings/{id}
     */
    public function updateOpening(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $body = $request->getBody();

        $existing = $this->model->getOpeningById($id);
        if (!$existing) {
            Response::notFound('Job opening not found');
            return;
        }

        $success = $this->model->updateOpening($id, $body);
        if ($success) {
            $updated = $this->model->getOpeningById($id);
            Response::success($updated, 'Job opening updated successfully');
        } else {
            Response::error('Failed to update job opening', 500);
        }
    }

    /**
     * DELETE /api/recruitment/openings/{id}
     */
    public function destroyOpening(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $existing = $this->model->getOpeningById($id);

        if (!$existing) {
            Response::notFound('Job opening not found');
            return;
        }

        $success = $this->model->deleteOpening($id);
        if ($success) {
            Response::success(null, 'Job opening deleted successfully');
        } else {
            Response::error('Failed to delete job opening', 500);
        }
    }

    /**
     * GET /api/recruitment/candidates
     */
    public function candidates(Request $request): void
    {
        $filters = [
            'job_id'     => $request->getQuery('job_id'),
            'stage'      => $request->getQuery('stage'),
            'department' => $request->getQuery('department'),
            'search'     => $request->getQuery('search'),
            'format'     => $request->getQuery('format') // e.g. 'kanban'
        ];
        $filters = array_filter($filters, fn($v) => $v !== null && $v !== '');

        $result = $this->model->getCandidates($filters);
        Response::success($result);
    }

    /**
     * GET /api/recruitment/candidates/{id}
     */
    public function showCandidate(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $candidate = $this->model->getCandidateById($id);

        if (!$candidate) {
            Response::notFound('Candidate application not found');
            return;
        }

        Response::success($candidate);
    }

    /**
     * POST /api/recruitment/candidates
     */
    public function storeCandidate(Request $request): void
    {
        $body = $request->getBody();

        if (empty($body['job_id']) || empty($body['full_name']) || empty($body['email'])) {
            Response::badRequest('Job position, candidate name, and email are required');
            return;
        }

        $id = $this->model->createCandidate($body);
        $candidate = $this->model->getCandidateById($id);
        Response::created($candidate, 'Candidate application registered successfully');
    }

    /**
     * PUT /api/recruitment/candidates/{id}/stage
     */
    public function updateStage(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $body = $request->getBody();

        if (empty($body['stage'])) {
            Response::badRequest('Target stage is required');
            return;
        }

        $note = $body['note'] ?? null;
        $userId = $body['user_id'] ?? 1;

        $success = $this->model->updateCandidateStage($id, $body['stage'], $note, $userId);
        if ($success) {
            $updated = $this->model->getCandidateById($id);
            Response::success($updated, "Candidate transitioned to {$body['stage']} stage");
        } else {
            Response::badRequest('Invalid stage or candidate not found');
        }
    }

    /**
     * PUT /api/recruitment/candidates/{id}
     */
    public function updateCandidate(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $body = $request->getBody();

        $existing = $this->model->getCandidateById($id);
        if (!$existing) {
            Response::notFound('Candidate not found');
            return;
        }

        $success = $this->model->updateCandidate($id, $body);
        if ($success) {
            $updated = $this->model->getCandidateById($id);
            Response::success($updated, 'Candidate details updated successfully');
        } else {
            Response::error('Failed to update candidate', 500);
        }
    }

    /**
     * DELETE /api/recruitment/candidates/{id}
     */
    public function destroyCandidate(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $existing = $this->model->getCandidateById($id);

        if (!$existing) {
            Response::notFound('Candidate not found');
            return;
        }

        $success = $this->model->deleteCandidate($id);
        if ($success) {
            Response::success(null, 'Candidate application deleted successfully');
        } else {
            Response::error('Failed to delete candidate', 500);
        }
    }
}
