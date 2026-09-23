<?php
/**
 * Payroll Master Model
 * Manages pay components (allowances, variables, deductions, stipends) and employee salary structures
 */
class PayrollMasterModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    // ──────────────────────────────────────────
    // Pay Components Master
    // ──────────────────────────────────────────

    /**
     * Get all payroll components with optional filtering
     */
    public function getComponents(array $filters = []): array
    {
        $where = [];
        $params = [];

        if (!empty($filters['type'])) {
            $where[] = 'type = :type';
            $params['type'] = $filters['type'];
        }

        if (!empty($filters['applies_to'])) {
            $where[] = '(applies_to = :applies_to OR applies_to = "All")';
            $params['applies_to'] = $filters['applies_to'];
        }

        if (isset($filters['is_active'])) {
            $where[] = 'is_active = :is_active';
            $params['is_active'] = (int) $filters['is_active'];
        }

        if (!empty($filters['search'])) {
            $where[] = '(name LIKE :search OR code LIKE :search OR category LIKE :search)';
            $params['search'] = '%' . $filters['search'] . '%';
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        $sql = "SELECT * FROM `payroll_components` $whereClause ORDER BY type ASC, category ASC, id ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Find component by ID
     */
    public function getComponentById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM `payroll_components` WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    /**
     * Find component by Code
     */
    public function getComponentByCode(string $code): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM `payroll_components` WHERE code = :code");
        $stmt->execute(['code' => $code]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    /**
     * Create a payroll component
     */
    public function createComponent(array $data): int
    {
        $sql = "INSERT INTO `payroll_components` 
                (`name`, `code`, `type`, `category`, `calculation_type`, `default_value`, `applies_to`, `is_taxable`, `is_mandatory`, `is_active`, `description`)
                VALUES (:name, :code, :type, :category, :calculation_type, :default_value, :applies_to, :is_taxable, :is_mandatory, :is_active, :description)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'name'             => $data['name'],
            'code'             => strtoupper(trim($data['code'])),
            'type'             => $data['type'],
            'category'         => $data['category'] ?? 'Allowance',
            'calculation_type' => $data['calculation_type'] ?? 'Flat',
            'default_value'    => (float) ($data['default_value'] ?? 0.00),
            'applies_to'       => $data['applies_to'] ?? 'All',
            'is_taxable'       => isset($data['is_taxable']) ? (int) $data['is_taxable'] : 1,
            'is_mandatory'     => isset($data['is_mandatory']) ? (int) $data['is_mandatory'] : 0,
            'is_active'        => isset($data['is_active']) ? (int) $data['is_active'] : 1,
            'description'      => $data['description'] ?? null,
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Update a payroll component
     */
    public function updateComponent(int $id, array $data): bool
    {
        $fields = [];
        $params = ['id' => $id];

        $allowed = ['name', 'type', 'category', 'calculation_type', 'default_value', 'applies_to', 'is_taxable', 'is_mandatory', 'is_active', 'description'];
        foreach ($allowed as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "`$col` = :$col";
                $params[$col] = $data[$col];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE `payroll_components` SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Delete a payroll component
     */
    public function deleteComponent(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM `payroll_components` WHERE id = :id AND is_mandatory = 0");
        return $stmt->execute(['id' => $id]);
    }

    // ──────────────────────────────────────────
    // Employee Salary Structures
    // ──────────────────────────────────────────

    /**
     * Get paginated salary structures
     */
    public function getStructures(array $filters = [], int $page = 1, int $perPage = 10): array
    {
        $where = [];
        $params = [];

        if (!empty($filters['employment_type'])) {
            $where[] = 'ess.employment_type = :employment_type';
            $params['employment_type'] = $filters['employment_type'];
        }

        if (!empty($filters['status'])) {
            $where[] = 'ess.status = :status';
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['search'])) {
            $where[] = '(u.full_name LIKE :search OR u.designation LIKE :search OR ess.bank_name LIKE :search)';
            $params['search'] = '%' . $filters['search'] . '%';
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        $offset = ($page - 1) * $perPage;

        $countSql = "SELECT COUNT(*) FROM employee_salary_structures ess 
                     JOIN users u ON ess.user_id = u.id $whereClause";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $sql = "SELECT ess.*, 
                       u.full_name as member_name, 
                       u.email as member_email, 
                       u.designation,
                       u.avatar
                FROM employee_salary_structures ess
                JOIN users u ON ess.user_id = u.id
                $whereClause
                ORDER BY ess.id DESC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'data'  => $stmt->fetchAll(PDO::FETCH_ASSOC),
            'total' => $total
        ];
    }

    /**
     * Find structure by User ID
     */
    public function getStructureByUserId(int $userId): ?array
    {
        $sql = "SELECT ess.*, 
                       u.full_name as member_name, 
                       u.email as member_email, 
                       u.designation,
                       u.avatar
                FROM employee_salary_structures ess
                JOIN users u ON ess.user_id = u.id
                WHERE ess.user_id = :user_id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row && !empty($row['components_override'])) {
            $row['components_override'] = json_decode($row['components_override'], true);
        }

        return $row ?: null;
    }

    /**
     * Save (insert or update) an employee salary structure
     */
    public function saveStructure(array $data): array
    {
        $userId = (int) $data['user_id'];
        $existing = $this->getStructureByUserId($userId);

        $componentsJson = isset($data['components_override']) && is_array($data['components_override'])
            ? json_encode($data['components_override'])
            : ($data['components_override'] ?? null);

        if ($existing) {
            $sql = "UPDATE employee_salary_structures SET 
                    employment_type = :employment_type,
                    base_salary = :base_salary,
                    currency = :currency,
                    effective_date = :effective_date,
                    bank_name = :bank_name,
                    account_number = :account_number,
                    routing_code = :routing_code,
                    payment_method = :payment_method,
                    components_override = :components_override,
                    status = :status
                    WHERE user_id = :user_id";
        } else {
            $sql = "INSERT INTO employee_salary_structures 
                    (user_id, employment_type, base_salary, currency, effective_date, bank_name, account_number, routing_code, payment_method, components_override, status)
                    VALUES 
                    (:user_id, :employment_type, :base_salary, :currency, :effective_date, :bank_name, :account_number, :routing_code, :payment_method, :components_override, :status)";
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'user_id'             => $userId,
            'employment_type'     => $data['employment_type'] ?? 'Permanent',
            'base_salary'         => (float) ($data['base_salary'] ?? 0.00),
            'currency'            => $data['currency'] ?? 'USD',
            'effective_date'      => $data['effective_date'] ?? date('Y-m-d'),
            'bank_name'           => $data['bank_name'] ?? null,
            'account_number'      => $data['account_number'] ?? null,
            'routing_code'        => $data['routing_code'] ?? null,
            'payment_method'      => $data['payment_method'] ?? 'Bank Transfer',
            'components_override' => $componentsJson,
            'status'              => $data['status'] ?? 'Active',
        ]);

        return $this->getStructureByUserId($userId);
    }

    // ──────────────────────────────────────────
    // Salary Slip Line Items
    // ──────────────────────────────────────────

    /**
     * Get itemized salary slip line items
     */
    public function getItemsBySalaryId(int $salaryId): array
    {
        $stmt = $this->db->prepare("
            SELECT si.*, pc.code as component_code
            FROM salary_items si
            LEFT JOIN payroll_components pc ON si.component_id = pc.id
            WHERE si.salary_id = :salary_id
            ORDER BY si.type ASC, si.id ASC
        ");
        $stmt->execute(['salary_id' => $salaryId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Save line items for a salary slip
     */
    public function saveSalaryItems(int $salaryId, array $items): void
    {
        // Delete previous items if updating
        $del = $this->db->prepare("DELETE FROM salary_items WHERE salary_id = :salary_id");
        $del->execute(['salary_id' => $salaryId]);

        $ins = $this->db->prepare("
            INSERT INTO salary_items (salary_id, component_id, component_name, type, category, amount)
            VALUES (:salary_id, :component_id, :component_name, :type, :category, :amount)
        ");

        foreach ($items as $item) {
            $amount = (float) ($item['amount'] ?? 0.00);
            if ($amount <= 0 && empty($item['keep_zero'])) {
                continue;
            }
            $ins->execute([
                'salary_id'      => $salaryId,
                'component_id'   => !empty($item['component_id']) ? (int) $item['component_id'] : null,
                'component_name' => $item['component_name'] ?? ($item['name'] ?? 'Allowance'),
                'type'           => $item['type'] ?? 'Earning',
                'category'       => $item['category'] ?? 'General',
                'amount'         => $amount,
            ]);
        }
    }
}
