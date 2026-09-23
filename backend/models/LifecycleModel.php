<?php
/**
 * Employee Lifecycle & Exit Management Model
 * Handles database operations for onboarding workflows, exit management, and department clearances.
 */
class LifecycleModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Executive KPI Statistics
     */
    public function getStats(): array
    {
        // 1. Active Onboarding count
        $onbStmt = $this->db->query("
            SELECT 
                COUNT(*) as total_onboarding,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as active_onboarding,
                AVG(progress_percent) as avg_progress
            FROM `lifecycle_workflows`
            WHERE type = 'Onboarding'
        ");
        $onbStats = $onbStmt->fetch(PDO::FETCH_ASSOC);

        // 2. Active Offboarding count & clearances
        $offStmt = $this->db->query("
            SELECT 
                COUNT(*) as total_offboarding,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as active_offboarding,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_offboarding
            FROM `lifecycle_workflows`
            WHERE type = 'Offboarding'
        ");
        $offStats = $offStmt->fetch(PDO::FETCH_ASSOC);

        // 3. Pending clearance tasks by department for active offboardings
        $deptStmt = $this->db->query("
            SELECT 
                t.department,
                COUNT(*) as total_tasks,
                SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN t.status IN ('Pending', 'In Progress') THEN 1 ELSE 0 END) as pending_tasks
            FROM `lifecycle_tasks` t
            JOIN `lifecycle_workflows` w ON t.workflow_id = w.id
            WHERE w.type = 'Offboarding' AND w.status = 'In Progress'
            GROUP BY t.department
        ");
        $deptClearances = $deptStmt->fetchAll(PDO::FETCH_ASSOC);

        // 4. Overall pending clearance count
        $pendingClearancesCount = 0;
        foreach ($deptClearances as $d) {
            $pendingClearancesCount += (int)$d['pending_tasks'];
        }

        // 5. Total task completion health
        $taskHealthStmt = $this->db->query("
            SELECT 
                COUNT(*) as total_all_tasks,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_all_tasks
            FROM `lifecycle_tasks`
        ");
        $taskHealth = $taskHealthStmt->fetch(PDO::FETCH_ASSOC);
        $totalAll = (int)($taskHealth['total_all_tasks'] ?? 0);
        $completedAll = (int)($taskHealth['completed_all_tasks'] ?? 0);
        $overallHealthRate = $totalAll > 0 ? round(($completedAll / $totalAll) * 100, 1) : 0.0;

        return [
            'active_onboarding' => (int)($onbStats['active_onboarding'] ?? 0),
            'total_onboarding' => (int)($onbStats['total_onboarding'] ?? 0),
            'onboarding_avg_progress' => round((float)($onbStats['avg_progress'] ?? 0), 1),
            'active_offboarding' => (int)($offStats['active_offboarding'] ?? 0),
            'completed_offboarding' => (int)($offStats['completed_offboarding'] ?? 0),
            'clearances_pending' => $pendingClearancesCount,
            'overall_health_rate' => $overallHealthRate,
            'department_clearances' => $deptClearances
        ];
    }

    /**
     * Get workflows list with filters
     */
    public function getWorkflows(array $params = []): array
    {
        $where = [];
        $bindings = [];

        if (!empty($params['type'])) {
            $where[] = "w.type = :type";
            $bindings[':type'] = $params['type'];
        }

        if (!empty($params['status'])) {
            $where[] = "w.status = :status";
            $bindings[':status'] = $params['status'];
        }

        if (!empty($params['search'])) {
            $where[] = "(w.workflow_code LIKE :search OR w.title LIKE :search OR u.full_name LIKE :search OR u.email LIKE :search)";
            $bindings[':search'] = '%' . $params['search'] . '%';
        }

        if (!empty($params['designation'])) {
            $where[] = "u.designation = :designation";
            $bindings[':designation'] = $params['designation'];
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $sql = "
            SELECT 
                w.*,
                u.full_name as employee_name,
                u.email as employee_email,
                u.designation as employee_designation,
                u.avatar as employee_avatar,
                (SELECT COUNT(*) FROM `lifecycle_tasks` t WHERE t.workflow_id = w.id) as total_tasks,
                (SELECT COUNT(*) FROM `lifecycle_tasks` t WHERE t.workflow_id = w.id AND t.status = 'Completed') as completed_tasks,
                DATEDIFF(w.target_date, CURDATE()) as days_remaining
            FROM `lifecycle_workflows` w
            JOIN `users` u ON w.user_id = u.id
            $whereClause
            ORDER BY w.status = 'In Progress' DESC, w.target_date ASC, w.id DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($bindings);
        $workflows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Enhance with calculated fields
        foreach ($workflows as &$wf) {
            $total = (int)$wf['total_tasks'];
            $completed = (int)$wf['completed_tasks'];
            $wf['computed_progress'] = $total > 0 ? round(($completed / $total) * 100) : 0;
            $wf['days_remaining'] = (int)$wf['days_remaining'];
        }

        return $workflows;
    }

    /**
     * Get single workflow with full checklist tasks
     */
    public function getWorkflowById(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT 
                w.*,
                u.full_name as employee_name,
                u.email as employee_email,
                u.phone as employee_phone,
                u.designation as employee_designation,
                u.joining_date as employee_joining_date,
                u.avatar as employee_avatar,
                cb.full_name as created_by_name,
                DATEDIFF(w.target_date, CURDATE()) as days_remaining
            FROM `lifecycle_workflows` w
            JOIN `users` u ON w.user_id = u.id
            LEFT JOIN `users` cb ON w.created_by = cb.id
            WHERE w.id = ?
        ");
        $stmt->execute([$id]);
        $workflow = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$workflow) {
            return null;
        }

        // Fetch tasks
        $taskStmt = $this->db->prepare("
            SELECT 
                t.*,
                comp.full_name as completed_by_name,
                assign.full_name as assigned_to_name
            FROM `lifecycle_tasks` t
            LEFT JOIN `users` comp ON t.completed_by = comp.id
            LEFT JOIN `users` assign ON t.assigned_to = assign.id
            WHERE t.workflow_id = ?
            ORDER BY t.order_index ASC, t.id ASC
        ");
        $taskStmt->execute([$id]);
        $tasks = $taskStmt->fetchAll(PDO::FETCH_ASSOC);

        $workflow['tasks'] = $tasks;
        $workflow['total_tasks'] = count($tasks);
        $workflow['completed_tasks'] = count(array_filter($tasks, fn($t) => $t['status'] === 'Completed'));
        $workflow['days_remaining'] = (int)$workflow['days_remaining'];

        return $workflow;
    }

    /**
     * Create a new workflow and auto-populate checklist
     */
    public function createWorkflow(array $data): int
    {
        $type = in_array($data['type'] ?? '', ['Onboarding', 'Offboarding']) ? $data['type'] : 'Onboarding';
        $prefix = $type === 'Onboarding' ? 'ONB' : 'OFF';
        $year = date('Y');

        // Generate unique code
        $codeStmt = $this->db->prepare("SELECT COUNT(*) FROM `lifecycle_workflows` WHERE `workflow_code` LIKE ?");
        $codeStmt->execute(["$prefix-$year-%"]);
        $seq = $codeStmt->fetchColumn() + 1;
        $code = sprintf("%s-%s-%03d", $prefix, $year, $seq);

        $stmt = $this->db->prepare("
            INSERT INTO `lifecycle_workflows`
            (`workflow_code`, `user_id`, `type`, `title`, `status`, `progress_percent`, `target_date`, `resignation_date`, `notice_period_days`, `reason`, `exit_interview_notes`, `created_by`)
            VALUES (?, ?, ?, ?, 'In Progress', 0, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $code,
            $data['user_id'],
            $type,
            $data['title'],
            $data['target_date'],
            $data['resignation_date'] ?? ($type === 'Offboarding' ? date('Y-m-d') : null),
            $data['notice_period_days'] ?? 30,
            $data['reason'] ?? null,
            $data['exit_interview_notes'] ?? null,
            $data['created_by'] ?? null
        ]);

        $workflowId = (int)$this->db->lastInsertId();

        // Default Checklist Templates
        $tasksToInsert = [];
        if (!empty($data['custom_tasks']) && is_array($data['custom_tasks'])) {
            $tasksToInsert = $data['custom_tasks'];
        } elseif ($type === 'Onboarding') {
            $tasksToInsert = [
                ['title' => 'Sign NDA & Employment Contract', 'department' => 'HR', 'notes' => 'Collect signed legal documents'],
                ['title' => 'Submit Identity & Proof Verification Documents', 'department' => 'HR', 'notes' => 'Background verification'],
                ['title' => 'Provision Laptop & Security Token', 'department' => 'IT', 'notes' => 'Assign standard workstation hardware'],
                ['title' => 'Create Google Workspace, Email & Slack Accounts', 'department' => 'IT', 'notes' => 'Grant company communications access'],
                ['title' => 'Setup Payroll & Direct Deposit Bank Details', 'department' => 'Finance', 'notes' => 'Verify salary disbursement info'],
                ['title' => 'HR Orientation & Company Policy Walkthrough', 'department' => 'HR', 'notes' => 'Benefits, leave rules, and values'],
                ['title' => 'Assign Onboarding Buddy & Team Introduction', 'department' => 'Department Head', 'notes' => 'Pair with senior teammate'],
                ['title' => '30-Day Check-in & Initial Milestone Review', 'department' => 'Department Head', 'notes' => 'Review probationary milestones']
            ];
        } else {
            // Default Offboarding
            $tasksToInsert = [
                ['title' => 'Acknowledge Resignation & Confirm Last Working Day', 'department' => 'HR', 'notes' => 'Calculate notice period obligations'],
                ['title' => 'Complete Project Knowledge Transfer & Code Handover', 'department' => 'Department Head', 'notes' => 'Handover repo branches and documentation'],
                ['title' => 'Return IT Assets (Laptop, Monitor, Security Key)', 'department' => 'IT', 'notes' => 'Hardware custody return inspection'],
                ['title' => 'Revoke Email, Slack, GitHub, & VPN Access', 'department' => 'IT', 'notes' => 'Deactivate accounts on final day 6:00 PM'],
                ['title' => 'Finance & Expense Claims Clearance', 'department' => 'Finance', 'notes' => 'Reimbursements and credit card zero-balance'],
                ['title' => 'Full & Final (F&F) Settlement Calculation', 'department' => 'Finance', 'notes' => 'Leave encashment and statutory severance'],
                ['title' => 'Conduct HR Exit Interview Survey', 'department' => 'HR', 'notes' => 'Feedback regarding tenure and departure reason'],
                ['title' => 'Issue Relieving Letter & Experience Certificate', 'department' => 'HR', 'notes' => 'Official service credentials document']
            ];
        }

        $order = 1;
        $taskInsert = $this->db->prepare("
            INSERT INTO `lifecycle_tasks`
            (`workflow_id`, `title`, `department`, `status`, `due_date`, `notes`, `order_index`)
            VALUES (?, ?, ?, 'Pending', ?, ?, ?)
        ");

        foreach ($tasksToInsert as $t) {
            $taskInsert->execute([
                $workflowId,
                $t['title'],
                $t['department'] ?? 'HR',
                $data['target_date'],
                $t['notes'] ?? null,
                $order++
            ]);
        }

        $this->recalculateProgress($workflowId);
        return $workflowId;
    }

    /**
     * Update task status & sign-off
     */
    public function updateTaskStatus(int $taskId, string $status, ?string $notes = null, ?int $completedBy = null): bool
    {
        $task = $this->getTaskById($taskId);
        if (!$task) {
            return false;
        }

        $completedAt = ($status === 'Completed' || $status === 'Waived') ? date('Y-m-d H:i:s') : null;

        $stmt = $this->db->prepare("
            UPDATE `lifecycle_tasks`
            SET 
                `status` = ?,
                `completed_at` = ?,
                `completed_by` = ?,
                `notes` = COALESCE(?, `notes`)
            WHERE `id` = ?
        ");

        $success = $stmt->execute([$status, $completedAt, $completedBy, $notes, $taskId]);
        if ($success) {
            $this->recalculateProgress((int)$task['workflow_id']);
        }

        return $success;
    }

    /**
     * Recalculate workflow completion percentage and auto-complete if 100%
     */
    public function recalculateProgress(int $workflowId): void
    {
        $stmt = $this->db->prepare("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status IN ('Completed', 'Waived') THEN 1 ELSE 0 END) as finished
            FROM `lifecycle_tasks`
            WHERE `workflow_id` = ?
        ");
        $stmt->execute([$workflowId]);
        $counts = $stmt->fetch(PDO::FETCH_ASSOC);

        $total = (int)($counts['total'] ?? 0);
        $finished = (int)($counts['finished'] ?? 0);
        $percent = $total > 0 ? (int)round(($finished / $total) * 100) : 0;

        $newStatus = null;
        $completedAt = null;

        // Auto-complete if all tasks finished
        if ($percent === 100 && $total > 0) {
            $newStatus = 'Completed';
            $completedAt = date('Y-m-d H:i:s');
        }

        if ($newStatus) {
            $updateStmt = $this->db->prepare("
                UPDATE `lifecycle_workflows`
                SET `progress_percent` = ?, `status` = ?, `completed_at` = ?
                WHERE `id` = ?
            ");
            $updateStmt->execute([$percent, $newStatus, $completedAt, $workflowId]);
        } else {
            $updateStmt = $this->db->prepare("
                UPDATE `lifecycle_workflows`
                SET `progress_percent` = ?,
                    `status` = CASE WHEN `status` = 'Completed' THEN 'In Progress' ELSE `status` END,
                    `completed_at` = NULL
                WHERE `id` = ?
            ");
            $updateStmt->execute([$percent, $workflowId]);
        }
    }

    /**
     * Add single task to existing workflow
     */
    public function addTask(int $workflowId, array $data): int
    {
        $maxOrderStmt = $this->db->prepare("SELECT MAX(order_index) FROM `lifecycle_tasks` WHERE workflow_id = ?");
        $maxOrderStmt->execute([$workflowId]);
        $nextOrder = (int)$maxOrderStmt->fetchColumn() + 1;

        $stmt = $this->db->prepare("
            INSERT INTO `lifecycle_tasks`
            (`workflow_id`, `title`, `department`, `status`, `due_date`, `notes`, `order_index`)
            VALUES (?, ?, ?, 'Pending', ?, ?, ?)
        ");
        $stmt->execute([
            $workflowId,
            $data['title'],
            $data['department'] ?? 'HR',
            $data['due_date'] ?? null,
            $data['notes'] ?? null,
            $nextOrder
        ]);

        $newTaskId = (int)$this->db->lastInsertId();
        $this->recalculateProgress($workflowId);
        return $newTaskId;
    }

    /**
     * Update workflow attributes
     */
    public function updateWorkflow(int $id, array $data): bool
    {
        $allowed = ['title', 'target_date', 'resignation_date', 'notice_period_days', 'reason', 'exit_interview_notes', 'status'];
        $sets = [];
        $params = [':id' => $id];

        foreach ($allowed as $f) {
            if (array_key_exists($f, $data)) {
                $sets[] = "`$f` = :$f";
                $params[":$f"] = $data[$f];
            }
        }

        if (empty($sets)) {
            return false;
        }

        $sql = "UPDATE `lifecycle_workflows` SET " . implode(', ', $sets) . " WHERE id = :id";
        return $this->db->prepare($sql)->execute($params);
    }

    /**
     * Delete workflow
     */
    public function deleteWorkflow(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM `lifecycle_workflows` WHERE id = ?");
        return $stmt->execute([$id]);
    }

    /**
     * Get single task
     */
    public function getTaskById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM `lifecycle_tasks` WHERE id = ?");
        $stmt->execute([$id]);
        $task = $stmt->fetch(PDO::FETCH_ASSOC);
        return $task ?: null;
    }

    /**
     * Department Clearance Matrix for Active Exits
     */
    public function getDepartmentClearanceMatrix(): array
    {
        $sql = "
            SELECT 
                w.id as workflow_id,
                w.workflow_code,
                w.title,
                w.target_date as last_working_day,
                w.status as workflow_status,
                w.progress_percent,
                u.full_name as employee_name,
                u.email as employee_email,
                u.designation as employee_designation,
                (SELECT COUNT(*) FROM `lifecycle_tasks` t WHERE t.workflow_id = w.id AND t.department = 'IT' AND t.status = 'Completed') as it_completed,
                (SELECT COUNT(*) FROM `lifecycle_tasks` t WHERE t.workflow_id = w.id AND t.department = 'IT') as it_total,
                (SELECT COUNT(*) FROM `lifecycle_tasks` t WHERE t.workflow_id = w.id AND t.department = 'Finance' AND t.status = 'Completed') as fin_completed,
                (SELECT COUNT(*) FROM `lifecycle_tasks` t WHERE t.workflow_id = w.id AND t.department = 'Finance') as fin_total,
                (SELECT COUNT(*) FROM `lifecycle_tasks` t WHERE t.workflow_id = w.id AND t.department = 'HR' AND t.status = 'Completed') as hr_completed,
                (SELECT COUNT(*) FROM `lifecycle_tasks` t WHERE t.workflow_id = w.id AND t.department = 'HR') as hr_total
            FROM `lifecycle_workflows` w
            JOIN `users` u ON w.user_id = u.id
            WHERE w.type = 'Offboarding'
            ORDER BY w.status = 'In Progress' DESC, w.target_date ASC
        ";

        $stmt = $this->db->query($sql);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as &$r) {
            $r['it_cleared'] = ((int)$r['it_total'] > 0 && (int)$r['it_completed'] === (int)$r['it_total']);
            $r['fin_cleared'] = ((int)$r['fin_total'] > 0 && (int)$r['fin_completed'] === (int)$r['fin_total']);
            $r['hr_cleared'] = ((int)$r['hr_total'] > 0 && (int)$r['hr_completed'] === (int)$r['hr_total']);
            $r['all_cleared'] = ($r['it_cleared'] && $r['fin_cleared'] && $r['hr_cleared']);
        }

        return $rows;
    }
}
