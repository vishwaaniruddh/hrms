<?php
/**
 * User (Member) Model
 * Handles all database operations for the users table
 */
class UserModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Get paginated list of users with optional filters
     */
    public function getAll(array $filters = [], int $page = 1, int $perPage = 10): array
    {
        $where = [];
        $params = [];

        if (!empty($filters['search'])) {
            $where[] = '(u.full_name LIKE :search OR u.email LIKE :search2)';
            $params['search'] = '%' . $filters['search'] . '%';
            $params['search2'] = '%' . $filters['search'] . '%';
        }

        if (!empty($filters['designation'])) {
            $where[] = 'u.designation = :designation';
            $params['designation'] = $filters['designation'];
        }

        if (!empty($filters['status'])) {
            $where[] = 'u.status = :status';
            $params['status'] = $filters['status'];
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        $offset = ($page - 1) * $perPage;

        // Get total count
        $countSql = "SELECT COUNT(*) FROM users u $whereClause";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        // Get paginated results
        $sql = "SELECT u.*, r.name as role_name 
                FROM users u 
                LEFT JOIN roles r ON u.role_id = r.id 
                $whereClause 
                ORDER BY u.created_at DESC 
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
     * Find a user by ID
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT u.*, r.name as role_name 
             FROM users u 
             LEFT JOIN roles r ON u.role_id = r.id 
             WHERE u.id = :id"
        );
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    /**
     * Find a user by email
     */
    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    /**
     * Create a new user
     */
    public function create(array $data): int
    {
        $sql = "INSERT INTO users 
                (full_name, display_name, email, password, phone, date_of_birth, address, designation, role_id, joining_date, status, avatar)
                VALUES 
                (:full_name, :display_name, :email, :password, :phone, :date_of_birth, :address, :designation, :role_id, :joining_date, :status, :avatar)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'full_name'     => $data['full_name'],
            'display_name'  => $data['display_name'] ?? null,
            'email'         => $data['email'],
            'password'      => password_hash($data['password'] ?? 'password123', PASSWORD_BCRYPT),
            'phone'         => $data['phone'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'address'       => $data['address'] ?? null,
            'designation'   => $data['designation'] ?? 'Pharmacist',
            'role_id'       => $data['role_id'] ?? 3,
            'joining_date'  => $data['joining_date'] ?? date('Y-m-d'),
            'status'        => $data['status'] ?? 'Active',
            'avatar'        => $data['avatar'] ?? null,
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Update an existing user
     */
    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = ['id' => $id];

        $updatable = ['full_name', 'display_name', 'email', 'phone', 'date_of_birth', 'address', 'designation', 'role_id', 'joining_date', 'status', 'avatar'];

        foreach ($updatable as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Delete a user
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Get member count by status
     */
    public function countByStatus(): array
    {
        $stmt = $this->db->query("SELECT status, COUNT(*) as count FROM users GROUP BY status");
        $results = $stmt->fetchAll();
        $counts = ['Active' => 0, 'Inactive' => 0, 'Suspend' => 0, 'total' => 0];
        foreach ($results as $row) {
            $counts[$row['status']] = (int) $row['count'];
            $counts['total'] += (int) $row['count'];
        }
        return $counts;
    }

    /**
     * Get documents for a user
     */
    public function getDocuments(int $userId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM user_documents WHERE user_id = :user_id ORDER BY uploaded_at DESC");
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll();
    }

    /**
     * Get user settings/preferences
     */
    public function getSettings(int $userId): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM user_settings WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $userId]);
        $settings = $stmt->fetch();
        return $settings ?: null;
    }
}
