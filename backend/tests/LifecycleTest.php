<?php
/**
 * Employee Lifecycle & Exit Management Unit Tests
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/LifecycleModel.php';

class LifecycleTest
{
    private PDO $db;
    private LifecycleModel $model;
    private int $passed = 0;
    private int $failed = 0;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->model = new LifecycleModel($this->db);
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
        echo "\n── Employee Lifecycle & Exit Management Tests ──\n";

        $this->testWorkflowsRetrieval();
        $this->testWorkflowCreationAndChecklistProgression();
        $this->testDepartmentClearanceMatrix();
        $this->testLifecycleStats();

        echo "  Lifecycle Tests: {$this->passed} passed, {$this->failed} failed\n";
        return ['passed' => $this->passed, 'failed' => $this->failed];
    }

    private function testWorkflowsRetrieval(): void
    {
        $all = $this->model->getWorkflows();
        $this->assert(is_array($all), 'Workflows query returns array');
        $this->assert(count($all) >= 3, 'At least 3 seeded workflows found (got: ' . count($all) . ')');

        $first = $all[0];
        $this->assert(!empty($first['workflow_code']), 'Workflow contains code: ' . ($first['workflow_code'] ?? ''));
        $this->assert(!empty($first['employee_name']), 'Workflow joined with employee name: ' . ($first['employee_name'] ?? ''));
        $this->assert(isset($first['computed_progress']), 'Workflow contains computed progress percent');
        $this->assert(isset($first['days_remaining']), 'Workflow computes days remaining until target date');

        // Filter by Onboarding
        $onboardingOnly = $this->model->getWorkflows(['type' => 'Onboarding']);
        $this->assert(count($onboardingOnly) >= 2, 'Filtered Onboarding workflows count >= 2');
        foreach ($onboardingOnly as $w) {
            $this->assert($w['type'] === 'Onboarding', 'Filtered record is Onboarding type');
            break;
        }

        // Filter by Offboarding
        $offboardingOnly = $this->model->getWorkflows(['type' => 'Offboarding']);
        $this->assert(count($offboardingOnly) >= 1, 'Filtered Offboarding workflows count >= 1');
        foreach ($offboardingOnly as $w) {
            $this->assert($w['type'] === 'Offboarding', 'Filtered record is Offboarding type');
            break;
        }
    }

    private function testWorkflowCreationAndChecklistProgression(): void
    {
        // Fetch first user ID
        $userStmt = $this->db->query("SELECT id, full_name FROM users ORDER BY id ASC LIMIT 1");
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        $userId = (int)$user['id'];

        // 1. Create a test onboarding workflow
        $targetDate = date('Y-m-d', strtotime('+10 days'));
        $wfId = $this->model->createWorkflow([
            'user_id'     => $userId,
            'type'        => 'Onboarding',
            'title'       => 'Automated Test Onboarding — ' . $user['full_name'],
            'target_date' => $targetDate,
            'created_by'  => $userId
        ]);

        $this->assert($wfId > 0, 'Created test onboarding workflow with ID: ' . $wfId);

        // Fetch workflow details
        $wf = $this->model->getWorkflowById($wfId);
        $this->assert($wf !== null, 'Fetched newly created workflow');
        $this->assert($wf['status'] === 'In Progress', 'New workflow status is In Progress');
        $this->assert($wf['progress_percent'] === 0, 'New workflow starts at 0% progress');
        $this->assert($wf['total_tasks'] === 8, 'Auto-populated 8 standard onboarding checklist tasks');

        // 2. Complete 4 tasks and check progress recalculation
        $tasks = $wf['tasks'];
        $this->assert(count($tasks) === 8, 'Checklist contains 8 task records');

        for ($i = 0; $i < 4; $i++) {
            $this->model->updateTaskStatus((int)$tasks[$i]['id'], 'Completed', 'Automated test sign-off', $userId);
        }

        $wfUpdated = $this->model->getWorkflowById($wfId);
        $this->assert($wfUpdated['completed_tasks'] === 4, '4 tasks marked completed');
        $this->assert($wfUpdated['progress_percent'] === 50, 'Workflow progress automatically recalculated to 50%');

        // 3. Add a custom 9th task
        $newTaskId = $this->model->addTask($wfId, [
            'title'      => 'Custom Security Badging',
            'department' => 'Operations',
            'notes'      => 'Test custom task addition'
        ]);
        $this->assert($newTaskId > 0, 'Added custom task with ID: ' . $newTaskId);

        $wfWith9 = $this->model->getWorkflowById($wfId);
        $this->assert($wfWith9['total_tasks'] === 9, 'Total tasks updated to 9');
        $this->assert($wfWith9['progress_percent'] === 44, 'Progress recalculated to 44% (4/9)');

        // 4. Complete all remaining tasks and verify auto-completion
        foreach ($wfWith9['tasks'] as $t) {
            if ($t['status'] !== 'Completed') {
                $this->model->updateTaskStatus((int)$t['id'], 'Completed', 'Done', $userId);
            }
        }

        $wfCompleted = $this->model->getWorkflowById($wfId);
        $this->assert($wfCompleted['progress_percent'] === 100, 'Progress reached 100%');
        $this->assert($wfCompleted['status'] === 'Completed', 'Workflow status auto-transitioned to Completed');
        $this->assert(!empty($wfCompleted['completed_at']), 'Workflow completed_at timestamp recorded');

        // 5. Clean up test workflow
        $deleted = $this->model->deleteWorkflow($wfId);
        $this->assert($deleted, 'Successfully deleted test workflow');
        $this->assert($this->model->getWorkflowById($wfId) === null, 'Verified test workflow deleted from database');
    }

    private function testDepartmentClearanceMatrix(): void
    {
        $matrix = $this->model->getDepartmentClearanceMatrix();
        $this->assert(is_array($matrix), 'Clearance matrix returns array');
        $this->assert(count($matrix) >= 1, 'Clearance matrix contains active offboarding records (got: ' . count($matrix) . ')');

        $first = $matrix[0];
        $this->assert(isset($first['it_completed']), 'Matrix tracks IT completed tasks');
        $this->assert(isset($first['it_total']), 'Matrix tracks IT total tasks');
        $this->assert(isset($first['fin_completed']), 'Matrix tracks Finance completed tasks');
        $this->assert(isset($first['hr_completed']), 'Matrix tracks HR completed tasks');
        $this->assert(isset($first['it_cleared']), 'Matrix provides IT clearance boolean');
        $this->assert(isset($first['fin_cleared']), 'Matrix provides Finance clearance boolean');
        $this->assert(isset($first['hr_cleared']), 'Matrix provides HR clearance boolean');
        $this->assert(isset($first['all_cleared']), 'Matrix computes all_cleared final status');
    }

    private function testLifecycleStats(): void
    {
        $stats = $this->model->getStats();
        $this->assert(isset($stats['active_onboarding']), 'Stats includes active_onboarding count');
        $this->assert($stats['active_onboarding'] >= 1, 'Active onboarding >= 1');
        $this->assert(isset($stats['total_onboarding']), 'Stats includes total_onboarding count');
        $this->assert(isset($stats['active_offboarding']), 'Stats includes active_offboarding count');
        $this->assert($stats['active_offboarding'] >= 1, 'Active offboarding >= 1');
        $this->assert(isset($stats['clearances_pending']), 'Stats includes clearances_pending count');
        $this->assert(isset($stats['overall_health_rate']), 'Stats includes overall_health_rate percentage');
        $this->assert(isset($stats['department_clearances']), 'Stats includes department_clearances breakdown');
    }
}
