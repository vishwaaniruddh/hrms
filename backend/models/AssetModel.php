<?php
/**
 * Asset Model
 * Relational database operations for Hardware Assets, Categories, and Allocation Assignments
 */
class AssetModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Get all categories
     */
    public function getCategories(): array
    {
        $stmt = $this->db->query("SELECT * FROM `asset_categories` ORDER BY `id` ASC");
        return $stmt->fetchAll();
    }

    /**
     * Aliases for standard CRUD names
     */
    public function getAll(array $params = []): array
    {
        return $this->getAssets($params);
    }

    public function getById(int $id): ?array
    {
        return $this->getAssetById($id);
    }

    public function delete(int $id): bool
    {
        return $this->deleteAsset($id);
    }


    /**
     * Get paginated assets with search and filters
     */
    public function getAssets(array $params = []): array
    {
        $page = max(1, (int)($params['page'] ?? 1));
        $perPage = min(100, max(1, (int)($params['per_page'] ?? 10)));
        $offset = ($page - 1) * $perPage;

        $where = ['1=1'];
        $bindings = [];

        if (!empty($params['category_id'])) {
            $where[] = 'a.category_id = ?';
            $bindings[] = (int)$params['category_id'];
        }

        if (!empty($params['status']) && $params['status'] !== 'All') {
            $where[] = 'a.status = ?';
            $bindings[] = $params['status'];
        }

        if (!empty($params['condition'])) {
            $where[] = 'a.condition = ?';
            $bindings[] = $params['condition'];
        }

        if (!empty($params['user_id'])) {
            $where[] = 'a.current_user_id = ?';
            $bindings[] = (int)$params['user_id'];
        }

        if (!empty($params['search'])) {
            $where[] = '(a.name LIKE ? OR a.asset_tag LIKE ? OR a.serial_number LIKE ? OR a.brand LIKE ? OR a.model LIKE ? OR u.full_name LIKE ?)';
            $term = '%' . $params['search'] . '%';
            for ($i = 0; $i < 6; $i++) {
                $bindings[] = $term;
            }
        }

        $whereClause = implode(' AND ', $where);

        // Count total
        $countSql = "
            SELECT COUNT(*) 
            FROM `assets` a
            LEFT JOIN `users` u ON a.current_user_id = u.id
            WHERE {$whereClause}
        ";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($bindings);
        $total = (int)$countStmt->fetchColumn();

        // Query records
        $sql = "
            SELECT 
                a.*,
                c.name AS category_name,
                c.code AS category_code,
                c.icon AS category_icon,
                u.full_name AS assigned_to_name,
                u.email AS assigned_to_email,
                u.designation AS assigned_to_designation
            FROM `assets` a
            JOIN `asset_categories` c ON a.category_id = c.id
            LEFT JOIN `users` u ON a.current_user_id = u.id
            WHERE {$whereClause}
            ORDER BY a.created_at DESC
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
     * Get single asset by ID
     */
    public function getAssetById(int $id): ?array
    {
        $sql = "
            SELECT 
                a.*,
                c.name AS category_name,
                c.code AS category_code,
                u.full_name AS assigned_to_name,
                u.email AS assigned_to_email,
                u.designation AS assigned_to_designation
            FROM `assets` a
            JOIN `asset_categories` c ON a.category_id = c.id
            LEFT JOIN `users` u ON a.current_user_id = u.id
            WHERE a.id = ?
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        $res = $stmt->fetch();
        return $res ?: null;
    }

    /**
     * Create asset
     */
    public function createAsset(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO `assets` 
            (`category_id`, `name`, `asset_tag`, `serial_number`, `brand`, `model`, `purchase_date`, `purchase_cost`, `currency`, `warranty_expiry`, `condition`, `status`, `notes`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['category_id'],
            $data['name'],
            $data['asset_tag'],
            $data['serial_number'],
            $data['brand'],
            $data['model'] ?? '',
            $data['purchase_date'] ?? date('Y-m-d'),
            $data['purchase_cost'] ?? 0.00,
            $data['currency'] ?? 'USD',
            $data['warranty_expiry'] ?? null,
            $data['condition'] ?? 'Good',
            $data['status'] ?? 'Available',
            $data['notes'] ?? null
        ]);

        return (int)$this->db->lastInsertId();
    }

    /**
     * Update asset details
     */
    public function updateAsset(int $id, array $data): bool
    {
        $stmt = $this->db->prepare("
            UPDATE `assets`
            SET `category_id` = ?, `name` = ?, `brand` = ?, `model` = ?, `purchase_cost` = ?,
                `warranty_expiry` = ?, `condition` = ?, `notes` = ?, `updated_at` = NOW()
            WHERE `id` = ?
        ");
        return $stmt->execute([
            $data['category_id'],
            $data['name'],
            $data['brand'],
            $data['model'] ?? '',
            $data['purchase_cost'] ?? 0.00,
            $data['warranty_expiry'] ?? null,
            $data['condition'] ?? 'Good',
            $data['notes'] ?? null,
            $id
        ]);
    }

    /**
     * Delete asset
     */
    public function deleteAsset(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM `assets` WHERE `id` = ?");
        return $stmt->execute([$id]);
    }

    /**
     * Assign asset to employee
     */
    public function assignAsset(
        int $assetId, 
        int $userId, 
        ?int $assignedBy = null, 
        ?string $assignedDate = null, 
        ?string $expectedReturnDate = null, 
        string $condition = 'Good', 
        ?string $notes = null
    ): int {
        $assignedDate = $assignedDate ?? date('Y-m-d');

        // 1. Close any existing active assignment for this asset
        $this->db->prepare("
            UPDATE `asset_assignments`
            SET `status` = 'Returned', `returned_date` = NOW()
            WHERE `asset_id` = ? AND `status` = 'Active'
        ")->execute([$assetId]);

        // 2. Create new assignment
        $stmt = $this->db->prepare("
            INSERT INTO `asset_assignments`
            (`asset_id`, `user_id`, `assigned_by`, `assigned_date`, `expected_return_date`, `condition_on_assignment`, `status`, `notes`)
            VALUES (?, ?, ?, ?, ?, ?, 'Active', ?)
        ");
        $stmt->execute([
            $assetId,
            $userId,
            $assignedBy,
            $assignedDate,
            $expectedReturnDate,
            $condition,
            $notes
        ]);
        $assignmentId = (int)$this->db->lastInsertId();

        // 3. Update asset status
        $this->db->prepare("
            UPDATE `assets`
            SET `status` = 'Assigned', `current_user_id` = ?, `condition` = ?, `updated_at` = NOW()
            WHERE `id` = ?
        ")->execute([$userId, $condition, $assetId]);

        return $assignmentId;
    }

    /**
     * Return asset to storage
     */
    public function returnAsset(int $assetId, ?string $returnedDate = null, string $condition = 'Good', ?string $notes = null): bool
    {
        $returnedDate = $returnedDate ?? date('Y-m-d');

        // 1. Update assignment record
        $stmt = $this->db->prepare("
            UPDATE `asset_assignments`
            SET `status` = 'Returned', `returned_date` = ?, `condition_on_return` = ?, `notes` = CONCAT(IFNULL(notes,''), '\nReturn Note: ', ?), `updated_at` = NOW()
            WHERE `asset_id` = ? AND `status` = 'Active'
        ");
        $stmt->execute([$returnedDate, $condition, $notes ?? 'Inspected on return', $assetId]);

        // 2. Update asset status to Available
        $this->db->prepare("
            UPDATE `assets`
            SET `status` = 'Available', `current_user_id` = NULL, `condition` = ?, `updated_at` = NOW()
            WHERE `id` = ?
        ")->execute([$condition, $assetId]);

        return true;
    }

    /**
     * Get assignment audit logs
     */
    public function getAssignments(?int $assetId = null, ?int $userId = null): array
    {
        $where = ['1=1'];
        $bindings = [];

        if ($assetId !== null) {
            $where[] = 'h.asset_id = ?';
            $bindings[] = $assetId;
        }

        if ($userId !== null) {
            $where[] = 'h.user_id = ?';
            $bindings[] = $userId;
        }

        $whereClause = implode(' AND ', $where);

        $sql = "
            SELECT 
                h.*,
                a.name AS asset_name,
                a.asset_tag,
                u.full_name AS member_name,
                u.designation,
                admin.full_name AS assigned_by_name
            FROM `asset_assignments` h
            JOIN `assets` a ON h.asset_id = a.id
            JOIN `users` u ON h.user_id = u.id
            LEFT JOIN `users` admin ON h.assigned_by = admin.id
            WHERE {$whereClause}
            ORDER BY h.assigned_date DESC, h.id DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($bindings);
        return $stmt->fetchAll();
    }

    /**
     * Get aggregate statistics for IT assets
     */
    public function getStats(?int $userId = null): array
    {
        $where = ['1=1'];
        $bindings = [];

        if ($userId !== null) {
            $where[] = '`current_user_id` = ?';
            $bindings[] = $userId;
        }

        $whereClause = implode(' AND ', $where);

        $stmt = $this->db->prepare("
            SELECT 
                COUNT(*) AS total_assets,
                SUM(CASE WHEN `status` = 'Assigned' THEN 1 ELSE 0 END) AS assigned_count,
                SUM(CASE WHEN `status` = 'Available' THEN 1 ELSE 0 END) AS available_count,
                SUM(CASE WHEN `status` = 'Under Repair' THEN 1 ELSE 0 END) AS repair_count,
                COALESCE(SUM(purchase_cost), 0) AS total_valuation
            FROM `assets`
            WHERE {$whereClause}
        ");
        $stmt->execute($bindings);
        $res = $stmt->fetch();

        return [
            'total_assets'    => (int)($res['total_assets'] ?? 0),
            'assigned_count'  => (int)($res['assigned_count'] ?? 0),
            'available_count' => (int)($res['available_count'] ?? 0),
            'repair_count'    => (int)($res['repair_count'] ?? 0),
            'total_valuation' => (float)($res['total_valuation'] ?? 0.00),
        ];
    }

    public function getInventoryStats(): array
    {
        return $this->getStats();
    }
}

