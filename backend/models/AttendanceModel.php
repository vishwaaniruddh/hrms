<?php
/**
 * Attendance Model
 * Handles all database operations for the attendances table
 */
class AttendanceModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Get paginated attendance records with optional filters
     */
    public function getAll(array $filters = [], int $page = 1, int $perPage = 10): array
    {
        $where = [];
        $params = [];

        if (!empty($filters['user_id'])) {
            $where[] = 'a.user_id = :user_id';
            $params['user_id'] = $filters['user_id'];
        }

        if (!empty($filters['date_from'])) {
            $where[] = 'a.date >= :date_from';
            $params['date_from'] = $filters['date_from'];
        }

        if (!empty($filters['date_to'])) {
            $where[] = 'a.date <= :date_to';
            $params['date_to'] = $filters['date_to'];
        }

        if (!empty($filters['search'])) {
            $where[] = 'u.full_name LIKE :search';
            $params['search'] = '%' . $filters['search'] . '%';
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        $offset = ($page - 1) * $perPage;

        // Total count
        $countSql = "SELECT COUNT(*) FROM attendances a LEFT JOIN users u ON a.user_id = u.id $whereClause";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        // Paginated results
        $sql = "SELECT a.*, u.full_name as member_name, u.designation, u.avatar
                FROM attendances a
                LEFT JOIN users u ON a.user_id = u.id
                $whereClause
                ORDER BY a.date DESC, a.sign_in DESC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'data'  => $stmt->fetchAll(),
            'total' => $total,
        ];
    }

    /**
     * Find attendance by ID
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT a.*, u.full_name as member_name 
             FROM attendances a 
             LEFT JOIN users u ON a.user_id = u.id 
             WHERE a.id = :id"
        );
        $stmt->execute(['id' => $id]);
        $record = $stmt->fetch();
        return $record ?: null;
    }

    /**
     * Record sign-in for a member
     */
    public function signIn(int $userId, string $date, string $signInTime): int
    {
        $sql = "INSERT INTO attendances (user_id, date, sign_in, status)
                VALUES (:user_id, :date, :sign_in, 'Present')
                ON DUPLICATE KEY UPDATE sign_in = :sign_in2, status = 'Present'";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'user_id'  => $userId,
            'date'     => $date,
            'sign_in'  => $signInTime,
            'sign_in2' => $signInTime,
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Record sign-out and compute stay time
     */
    public function signOut(int $userId, string $date, string $signOutTime): bool
    {
        // First get the sign-in time
        $stmt = $this->db->prepare(
            "SELECT sign_in FROM attendances WHERE user_id = :user_id AND date = :date"
        );
        $stmt->execute(['user_id' => $userId, 'date' => $date]);
        $record = $stmt->fetch();

        if (!$record || !$record['sign_in']) {
            return false;
        }

        $stayTime = $this->calculateStayTime($record['sign_in'], $signOutTime);

        $updateStmt = $this->db->prepare(
            "UPDATE attendances SET sign_out = :sign_out, stay_time = :stay_time 
             WHERE user_id = :user_id AND date = :date"
        );

        return $updateStmt->execute([
            'sign_out'  => $signOutTime,
            'stay_time' => $stayTime,
            'user_id'   => $userId,
            'date'      => $date,
        ]);
    }

    /**
     * Create a full attendance record
     */
    public function create(array $data): int
    {
        $stayTime = null;
        if (!empty($data['sign_in']) && !empty($data['sign_out'])) {
            $stayTime = $this->calculateStayTime($data['sign_in'], $data['sign_out']);
        }

        $sql = "INSERT INTO attendances (user_id, date, sign_in, sign_out, stay_time, status, notes)
                VALUES (:user_id, :date, :sign_in, :sign_out, :stay_time, :status, :notes)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'user_id'  => $data['user_id'],
            'date'     => $data['date'],
            'sign_in'  => $data['sign_in'] ?? null,
            'sign_out' => $data['sign_out'] ?? null,
            'stay_time' => $stayTime,
            'status'   => $data['status'] ?? 'Present',
            'notes'    => $data['notes'] ?? null,
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Update attendance record
     */
    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = ['id' => $id];

        $updatable = ['sign_in', 'sign_out', 'status', 'notes'];
        foreach ($updatable as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }

        // Recalculate stay time if sign_in or sign_out changed
        if (isset($data['sign_in']) && isset($data['sign_out'])) {
            $stayTime = $this->calculateStayTime($data['sign_in'], $data['sign_out']);
            $fields[] = "stay_time = :stay_time";
            $params['stay_time'] = $stayTime;
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE attendances SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Delete attendance record
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM attendances WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Get today's attendance summary
     */
    public function getTodaySummary(): array
    {
        $today = date('Y-m-d');
        $stmt = $this->db->prepare(
            "SELECT status, COUNT(*) as count FROM attendances WHERE date = :date GROUP BY status"
        );
        $stmt->execute(['date' => $today]);
        $results = $stmt->fetchAll();

        $summary = ['present' => 0, 'late' => 0, 'absent' => 0, 'on_leave' => 0];
        foreach ($results as $row) {
            $key = strtolower(str_replace(' ', '_', $row['status']));
            $summary[$key] = (int) $row['count'];
        }
        return $summary;
    }

    /**
     * Calculate the duration between sign-in and sign-out
     */
    public function calculateStayTime(string $signIn, string $signOut): string
    {
        $in = strtotime($signIn);
        $out = strtotime($signOut);

        if ($out <= $in) {
            return '0 hrs 0 mins';
        }

        $diff = $out - $in;
        $hours = floor($diff / 3600);
        $minutes = floor(($diff % 3600) / 60);

        return "$hours hrs $minutes mins";
    }
}
