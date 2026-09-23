<?php
/**
 * Leave Model
 * Manages leave types, quotas, balances, and employee leave applications
 */
class LeaveModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Get all active leave types & policies
     */
    public function getLeaveTypes(): array
    {
        $stmt = $this->db->query("SELECT * FROM `leave_types` ORDER BY `id` ASC");
        return $stmt->fetchAll();
    }

    /**
     * Get leave quota balances for a specific user
     */
    public function getLeaveBalances(int $userId, ?int $year = null): array
    {
        $year = $year ?? (int)date('Y');
        
        // Ensure balances are initialized
        $this->initializeUserBalances($userId, $year);

        $sql = "
            SELECT 
                b.*,
                t.name AS type_name,
                t.code AS type_code,
                t.color AS type_color,
                t.is_paid,
                t.description AS type_description
            FROM `leave_balances` b
            JOIN `leave_types` t ON b.leave_type_id = t.id
            WHERE b.user_id = ? AND b.year = ?
            ORDER BY t.id ASC
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId, $year]);
        return $stmt->fetchAll();
    }

    /**
     * Get a specific balance record
     */
    public function getLeaveBalance(int $userId, int $leaveTypeId, ?int $year = null): ?array
    {
        $year = $year ?? (int)date('Y');
        $stmt = $this->db->prepare("
            SELECT * FROM `leave_balances`
            WHERE `user_id` = ? AND `leave_type_id` = ? AND `year` = ?
        ");
        $stmt->execute([$userId, $leaveTypeId, $year]);
        $res = $stmt->fetch();
        return $res ?: null;
    }

    /**
     * Get paginated leave requests with filters
     */
    public function getLeaveRequests(array $params = []): array
    {
        $page = max(1, (int)($params['page'] ?? 1));
        $perPage = min(100, max(1, (int)($params['per_page'] ?? 10)));
        $offset = ($page - 1) * $perPage;

        $where = ['1=1'];
        $bindings = [];

        if (!empty($params['user_id'])) {
            $where[] = 'r.user_id = ?';
            $bindings[] = (int)$params['user_id'];
        }

        if (!empty($params['status']) && $params['status'] !== 'All') {
            $where[] = 'r.status = ?';
            $bindings[] = $params['status'];
        }

        if (!empty($params['leave_type_id'])) {
            $where[] = 'r.leave_type_id = ?';
            $bindings[] = (int)$params['leave_type_id'];
        }

        if (!empty($params['search'])) {
            $where[] = '(u.full_name LIKE ? OR u.email LIKE ? OR r.reason LIKE ?)';
            $searchTerm = '%' . $params['search'] . '%';
            $bindings[] = $searchTerm;
            $bindings[] = $searchTerm;
            $bindings[] = $searchTerm;
        }

        $whereClause = implode(' AND ', $where);

        // Count total
        $countSql = "
            SELECT COUNT(*) 
            FROM `leave_requests` r
            JOIN `users` u ON r.user_id = u.id
            WHERE {$whereClause}
        ";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($bindings);
        $total = (int)$countStmt->fetchColumn();

        // Fetch records
        $sql = "
            SELECT 
                r.*,
                u.full_name AS member_name,
                u.email AS member_email,
                u.designation,
                t.name AS type_name,
                t.code AS type_code,
                t.color AS type_color,
                t.is_paid,
                app.full_name AS approver_name
            FROM `leave_requests` r
            JOIN `users` u ON r.user_id = u.id
            JOIN `leave_types` t ON r.leave_type_id = t.id
            LEFT JOIN `users` app ON r.approver_id = app.id
            WHERE {$whereClause}
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?
        ";

        $stmt = $this->db->prepare($sql);
        $execBindings = array_merge($bindings, [$perPage, $offset]);
        $stmt->execute($execBindings);
        $data = $stmt->fetchAll();

        return [
            'data' => $data,
            'meta' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => ceil($total / $perPage) ?: 1
            ]
        ];
    }

    /**
     * Get request by ID
     */
    public function getLeaveRequestById(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT 
                r.*,
                u.full_name AS member_name,
                u.email AS member_email,
                u.designation,
                t.name AS type_name,
                t.code AS type_code,
                t.color AS type_color,
                app.full_name AS approver_name
            FROM `leave_requests` r
            JOIN `users` u ON r.user_id = u.id
            JOIN `leave_types` t ON r.leave_type_id = t.id
            LEFT JOIN `users` app ON r.approver_id = app.id
            WHERE r.id = ?
        ");
        $stmt->execute([$id]);
        $res = $stmt->fetch();
        return $res ?: null;
    }

    /**
     * Create leave application
     */
    public function createLeaveRequest(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO `leave_requests` 
            (`user_id`, `leave_type_id`, `start_date`, `end_date`, `total_days`, `is_half_day`, `reason`, `status`, `created_at`)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
        ");
        $stmt->execute([
            $data['user_id'],
            $data['leave_type_id'],
            $data['start_date'],
            $data['end_date'],
            $data['total_days'] ?? 1.0,
            $data['is_half_day'] ?? 0,
            $data['reason']
        ]);

        $requestId = (int)$this->db->lastInsertId();

        // Update pending balance
        $year = (int)date('Y', strtotime($data['start_date']));
        $this->adjustBalance($data['user_id'], $data['leave_type_id'], $year, 0.0, (float)($data['total_days'] ?? 1.0));

        return $requestId;
    }

    /**
     * Update request status (Approve or Reject)
     */
    public function updateRequestStatus(int $id, string $status, ?int $approverId = null, ?string $remarks = null): bool
    {
        $request = $this->getLeaveRequestById($id);
        if (!$request) return false;

        $previousStatus = $request['status'];
        if ($previousStatus === $status) return true;

        $stmt = $this->db->prepare("
            UPDATE `leave_requests`
            SET `status` = ?, `approver_id` = ?, `approver_remarks` = ?, `approved_at` = NOW(), `updated_at` = NOW()
            WHERE `id` = ?
        ");
        $stmt->execute([$status, $approverId, $remarks, $id]);

        $year = (int)date('Y', strtotime($request['start_date']));
        $days = (float)$request['total_days'];

        // Balance adjustment based on status transition
        if ($previousStatus === 'Pending') {
            if ($status === 'Approved') {
                // Remove from pending, add to used
                $this->adjustBalance($request['user_id'], $request['leave_type_id'], $year, $days, -$days);
            } elseif ($status === 'Rejected' || $status === 'Cancelled') {
                // Remove from pending
                $this->adjustBalance($request['user_id'], $request['leave_type_id'], $year, 0.0, -$days);
            }
        } elseif ($previousStatus === 'Approved' && ($status === 'Rejected' || $status === 'Cancelled')) {
            // Revert used days
            $this->adjustBalance($request['user_id'], $request['leave_type_id'], $year, -$days, 0.0);
        }

        return true;
    }

    /**
     * Adjust leave balance
     */
    public function adjustBalance(int $userId, int $leaveTypeId, int $year, float $usedDelta, float $pendingDelta): void
    {
        $this->initializeUserBalances($userId, $year);

        $stmt = $this->db->prepare("
            UPDATE `leave_balances`
            SET 
                `used_days` = GREATEST(0, `used_days` + ?),
                `pending_days` = GREATEST(0, `pending_days` + ?),
                `remaining_days` = GREATEST(0, `total_days` - (`used_days` + ? + `pending_days` + ?))
            WHERE `user_id` = ? AND `leave_type_id` = ? AND `year` = ?
        ");
        $stmt->execute([
            $usedDelta,
            $pendingDelta,
            $usedDelta,
            $pendingDelta,
            $userId,
            $leaveTypeId,
            $year
        ]);
    }

    /**
     * Get aggregate statistics for leave dashboard
     */
    public function getStats(?int $year = null, ?int $userId = null): array
    {
        $year = $year ?? (int)date('Y');
        $where = ['YEAR(`start_date`) = ?'];
        $bindings = [$year];

        if ($userId !== null) {
            $where[] = '`user_id` = ?';
            $bindings[] = $userId;
        }

        $whereClause = implode(' AND ', $where);

        $stmt = $this->db->prepare("
            SELECT 
                COUNT(*) AS total_requests,
                SUM(CASE WHEN `status` = 'Pending' THEN 1 ELSE 0 END) AS pending_count,
                SUM(CASE WHEN `status` = 'Approved' THEN 1 ELSE 0 END) AS approved_count,
                SUM(CASE WHEN `status` = 'Rejected' THEN 1 ELSE 0 END) AS rejected_count,
                SUM(CASE WHEN `status` = 'Approved' AND CURRENT_DATE BETWEEN `start_date` AND `end_date` THEN 1 ELSE 0 END) AS on_leave_today
            FROM `leave_requests`
            WHERE {$whereClause}
        ");
        $stmt->execute($bindings);
        $res = $stmt->fetch();

        return [
            'total_requests' => (int)($res['total_requests'] ?? 0),
            'pending_count'  => (int)($res['pending_count'] ?? 0),
            'approved_count' => (int)($res['approved_count'] ?? 0),
            'rejected_count' => (int)($res['rejected_count'] ?? 0),
            'on_leave_today' => (int)($res['on_leave_today'] ?? 0),
        ];
    }

    /**
     * Ensure a user has balance records initialized for all active leave types
     */
    public function initializeUserBalances(int $userId, int $year): void
    {
        $types = $this->getLeaveTypes();
        $stmt = $this->db->prepare("
            INSERT IGNORE INTO `leave_balances`
            (`user_id`, `leave_type_id`, `year`, `total_days`, `used_days`, `pending_days`, `remaining_days`)
            VALUES (?, ?, ?, ?, 0.0, 0.0, ?)
        ");

        foreach ($types as $t) {
            $stmt->execute([
                $userId,
                $t['id'],
                $year,
                $t['days_allowed_per_year'],
                $t['days_allowed_per_year']
            ]);
        }
    }
}
