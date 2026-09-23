<?php
/**
 * Employee Lifecycle & Exit Management Controller
 * REST endpoints for Onboarding journeys, Exit clearances, task sign-offs, and department metrics.
 */
class LifecycleController extends Controller
{
    private LifecycleModel $model;

    public function __construct()
    {
        parent::__construct();
        $this->model = new LifecycleModel(Database::getInstance());
    }

    /**
     * GET /api/lifecycle/stats
     */
    public function stats(Request $request): void
    {
        $stats = $this->model->getStats();
        Response::success($stats);
    }

    /**
     * GET /api/lifecycle/workflows
     */
    public function index(Request $request): void
    {
        $params = [
            'type'        => $request->getQuery('type'),
            'status'      => $request->getQuery('status'),
            'search'      => $request->getQuery('search'),
            'designation' => $request->getQuery('designation'),
        ];
        $params = array_filter($params, fn($v) => $v !== null && $v !== '');

        $workflows = $this->model->getWorkflows($params);
        Response::success($workflows);
    }

    /**
     * GET /api/lifecycle/workflows/{id}
     */
    public function show(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $workflow = $this->model->getWorkflowById($id);

        if (!$workflow) {
            Response::notFound('Workflow record not found');
            return;
        }

        Response::success($workflow);
    }

    /**
     * POST /api/lifecycle/workflows
     */
    public function store(Request $request): void
    {
        $body = $request->getBody();

        if (empty($body['user_id'])) {
            Response::error('Employee (user_id) is required', 400);
            return;
        }

        if (empty($body['title'])) {
            Response::error('Workflow title is required', 400);
            return;
        }

        if (empty($body['target_date'])) {
            Response::error('Target date or Last Working Day is required', 400);
            return;
        }

        $type = in_array($body['type'] ?? '', ['Onboarding', 'Offboarding']) ? $body['type'] : 'Onboarding';

        $data = [
            'user_id'              => (int)$body['user_id'],
            'type'                 => $type,
            'title'                => trim($body['title']),
            'target_date'          => $body['target_date'],
            'resignation_date'     => $body['resignation_date'] ?? null,
            'notice_period_days'   => !empty($body['notice_period_days']) ? (int)$body['notice_period_days'] : 30,
            'reason'               => $body['reason'] ?? null,
            'exit_interview_notes' => $body['exit_interview_notes'] ?? null,
            'created_by'           => $request->getUserId() ?: 1,
            'custom_tasks'         => $body['custom_tasks'] ?? null
        ];

        try {
            $id = $this->model->createWorkflow($data);
            $newWf = $this->model->getWorkflowById($id);

            // Event Trigger: Instant Day-1 Onboarding Welcome notification
            if ($type === 'Onboarding') {
                try {
                    $notifService = new NotificationService();
                    $notifService->notifyOnboardingWelcome((int)$data['user_id'], $data);
                } catch (Exception $e) {}
            }

            Response::success($newWf, 'Workflow initiated successfully', 201);
        } catch (Exception $e) {
            Response::error('Failed to create workflow: ' . $e->getMessage(), 500);
        }
    }

    /**
     * PUT /api/lifecycle/workflows/{id}
     */
    public function update(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $existing = $this->model->getWorkflowById($id);

        if (!$existing) {
            Response::notFound('Workflow not found');
            return;
        }

        $body = $request->getBody();
        $ok = $this->model->updateWorkflow($id, $body);

        if ($ok) {
            $updated = $this->model->getWorkflowById($id);
            Response::success($updated, 'Workflow updated successfully');
        } else {
            Response::error('No attributes updated or update failed', 400);
        }
    }

    /**
     * DELETE /api/lifecycle/workflows/{id}
     */
    public function destroy(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $existing = $this->model->getWorkflowById($id);

        if (!$existing) {
            Response::notFound('Workflow not found');
            return;
        }

        $ok = $this->model->deleteWorkflow($id);
        if ($ok) {
            Response::success(null, 'Workflow deleted successfully');
        } else {
            Response::error('Failed to delete workflow', 500);
        }
    }

    /**
     * PUT /api/lifecycle/tasks/{id}
     */
    public function updateTask(Request $request): void
    {
        $taskId = (int)$request->getParam('id');
        $body = $request->getBody();

        if (empty($body['status']) || !in_array($body['status'], ['Pending', 'In Progress', 'Completed', 'Waived'])) {
            Response::error('Valid task status is required (Pending, In Progress, Completed, Waived)', 400);
            return;
        }

        $notes = $body['notes'] ?? null;
        $completedBy = $request->getUserId() ?: 1;

        $ok = $this->model->updateTaskStatus($taskId, $body['status'], $notes, $completedBy);

        if ($ok) {
            $task = $this->model->getTaskById($taskId);
            Response::success($task, 'Task status updated successfully');
        } else {
            Response::notFound('Task not found or update failed');
        }
    }

    /**
     * POST /api/lifecycle/workflows/{id}/tasks
     */
    public function addTask(Request $request): void
    {
        $workflowId = (int)$request->getParam('id');
        $existing = $this->model->getWorkflowById($workflowId);

        if (!$existing) {
            Response::notFound('Workflow not found');
            return;
        }

        $body = $request->getBody();
        if (empty($body['title'])) {
            Response::error('Task title is required', 400);
            return;
        }

        $data = [
            'title'      => trim($body['title']),
            'department' => $body['department'] ?? 'HR',
            'due_date'   => $body['due_date'] ?? $existing['target_date'],
            'notes'      => $body['notes'] ?? null
        ];

        $newTaskId = $this->model->addTask($workflowId, $data);
        $task = $this->model->getTaskById($newTaskId);

        Response::success($task, 'Task added to checklist', 201);
    }

    /**
     * GET /api/lifecycle/clearances
     */
    public function clearances(Request $request): void
    {
        $matrix = $this->model->getDepartmentClearanceMatrix();
        Response::success($matrix);
    }
}
