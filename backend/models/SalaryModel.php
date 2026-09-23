<?php
/**
 * Salary Model
 * Handles all database operations for salaries, salary_payments, and itemized salary_items tables
 */
class SalaryModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Get paginated salary records with optional filters
     */
    public function getAll(array $filters = [], int $page = 1, int $perPage = 10): array
    {
        $where = [];
        $params = [];

        if (!empty($filters['user_id'])) {
            $where[] = 's.user_id = :user_id';
            $params['user_id'] = $filters['user_id'];
        }

        if (!empty($filters['status'])) {
            $where[] = 's.status = :status';
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['employment_type'])) {
            $where[] = 's.employment_type = :employment_type';
            $params['employment_type'] = $filters['employment_type'];
        }

        if (!empty($filters['date_from'])) {
            $where[] = 's.salary_date >= :date_from';
            $params['date_from'] = $filters['date_from'];
        }

        if (!empty($filters['date_to'])) {
            $where[] = 's.salary_date <= :date_to';
            $params['date_to'] = $filters['date_to'];
        }

        if (!empty($filters['search'])) {
            $where[] = '(u.full_name LIKE :search OR u.designation LIKE :search)';
            $params['search'] = '%' . $filters['search'] . '%';
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        $offset = ($page - 1) * $perPage;

        // Total count
        $countSql = "SELECT COUNT(*) FROM salaries s LEFT JOIN users u ON s.user_id = u.id $whereClause";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        // Paginated results
        $sql = "SELECT s.*, 
                       u.full_name as member_name, 
                       u.email as member_email,
                       u.designation,
                       u.avatar,
                       g.full_name as generated_by_name,
                       ess.bank_name,
                       ess.account_number,
                       ess.payment_method
                FROM salaries s
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN users g ON s.generated_by = g.id
                LEFT JOIN employee_salary_structures ess ON s.user_id = ess.user_id
                $whereClause
                ORDER BY s.salary_date DESC, s.id DESC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'data'  => $stmt->fetchAll(PDO::FETCH_ASSOC),
            'total' => $total,
        ];
    }

    /**
     * Find salary by ID including line items and structure
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT s.*, 
                    u.full_name as member_name, 
                    u.email as member_email,
                    u.designation,
                    u.avatar,
                    u.phone as member_phone,
                    g.full_name as generated_by_name,
                    ess.bank_name,
                    ess.account_number,
                    ess.routing_code,
                    ess.payment_method
             FROM salaries s
             LEFT JOIN users u ON s.user_id = u.id
             LEFT JOIN users g ON s.generated_by = g.id
             LEFT JOIN employee_salary_structures ess ON s.user_id = ess.user_id
             WHERE s.id = :id"
        );
        $stmt->execute(['id' => $id]);
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$record) {
            return null;
        }

        // Fetch line items
        $itemStmt = $this->db->prepare("
            SELECT si.*, pc.code as component_code 
            FROM salary_items si
            LEFT JOIN payroll_components pc ON si.component_id = pc.id
            WHERE si.salary_id = :salary_id
            ORDER BY si.type ASC, si.id ASC
        ");
        $itemStmt->execute(['salary_id' => $id]);
        $record['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch payments
        $payStmt = $this->db->prepare("SELECT * FROM salary_payments WHERE salary_id = :salary_id ORDER BY id DESC");
        $payStmt->execute(['salary_id' => $id]);
        $record['payments'] = $payStmt->fetchAll(PDO::FETCH_ASSOC);

        return $record;
    }

    /**
     * Create a salary record with optional itemized breakdown
     */
    public function create(array $data): int
    {
        $grossSalary = isset($data['gross_salary']) ? (float) $data['gross_salary'] : (float) ($data['total_salary'] ?? 0.00);
        $totalDeductions = isset($data['total_deductions']) ? (float) $data['total_deductions'] : 0.00;
        $netSalary = isset($data['net_salary']) ? (float) $data['net_salary'] : max(0.00, $grossSalary - $totalDeductions);
        $totalSalary = $netSalary > 0 ? $netSalary : $grossSalary;

        $employmentType = $data['employment_type'] ?? 'Permanent';

        $this->db->beginTransaction();

        try {
            $sql = "INSERT INTO salaries 
                    (user_id, employment_type, salary_date, gross_salary, total_deductions, net_salary, total_salary, currency, working_days, generated_by, status)
                    VALUES 
                    (:user_id, :employment_type, :salary_date, :gross_salary, :total_deductions, :net_salary, :total_salary, :currency, :working_days, :generated_by, :status)";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'user_id'          => $data['user_id'],
                'employment_type'  => $employmentType,
                'salary_date'      => $data['salary_date'],
                'gross_salary'     => $grossSalary,
                'total_deductions' => $totalDeductions,
                'net_salary'       => $netSalary,
                'total_salary'     => $totalSalary,
                'currency'         => $data['currency'] ?? 'USD',
                'working_days'     => $data['working_days'] ?? 22,
                'generated_by'     => $data['generated_by'] ?? 1,
                'status'           => $data['status'] ?? 'Unpaid',
            ]);

            $salaryId = (int) $this->db->lastInsertId();

            // Insert line items if present
            if (!empty($data['items']) && is_array($data['items'])) {
                $itemStmt = $this->db->prepare("
                    INSERT INTO salary_items (salary_id, component_id, component_name, type, category, amount)
                    VALUES (:salary_id, :component_id, :component_name, :type, :category, :amount)
                ");
                foreach ($data['items'] as $item) {
                    $itemStmt->execute([
                        'salary_id'      => $salaryId,
                        'component_id'   => !empty($item['component_id']) ? (int) $item['component_id'] : null,
                        'component_name' => $item['component_name'] ?? ($item['name'] ?? 'Allowance'),
                        'type'           => $item['type'] ?? 'Earning',
                        'category'       => $item['category'] ?? 'General',
                        'amount'         => (float) ($item['amount'] ?? 0.00),
                    ]);
                }
            }

            $this->db->commit();
            return $salaryId;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Update a salary record
     */
    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = ['id' => $id];

        $updatable = ['salary_date', 'employment_type', 'gross_salary', 'total_deductions', 'net_salary', 'total_salary', 'currency', 'working_days', 'status'];
        foreach ($updatable as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE salaries SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Delete a salary record
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM salaries WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Record a payment for a salary
     */
    public function recordPayment(array $data): int
    {
        $this->db->beginTransaction();

        try {
            $sql = "INSERT INTO salary_payments (salary_id, user_id, amount_paid, payment_date, payment_method, transaction_ref, notes)
                    VALUES (:salary_id, :user_id, :amount_paid, :payment_date, :payment_method, :transaction_ref, :notes)";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'salary_id'      => $data['salary_id'],
                'user_id'        => $data['user_id'],
                'amount_paid'    => $data['amount_paid'],
                'payment_date'   => $data['payment_date'] ?? date('Y-m-d'),
                'payment_method' => $data['payment_method'] ?? 'Bank Transfer',
                'transaction_ref' => $data['transaction_ref'] ?? null,
                'notes'          => $data['notes'] ?? null,
            ]);

            $paymentId = (int) $this->db->lastInsertId();

            // Update salary status to Paid
            $this->update($data['salary_id'], ['status' => 'Paid']);

            $this->db->commit();
            return $paymentId;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Get salary summary statistics
     */
    public function getSummary(): array
    {
        $stmt = $this->db->query(
            "SELECT 
                COUNT(*) as total_records,
                SUM(CASE WHEN status = 'Paid' THEN 1 ELSE 0 END) as paid_count,
                SUM(CASE WHEN status = 'Unpaid' THEN 1 ELSE 0 END) as unpaid_count,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_count,
                COALESCE(SUM(COALESCE(net_salary, total_salary)), 0) as total_payroll,
                COALESCE(SUM(COALESCE(gross_salary, total_salary)), 0) as total_gross,
                COALESCE(SUM(COALESCE(total_deductions, 0)), 0) as total_deductions,
                COALESCE(SUM(CASE WHEN status = 'Paid' THEN COALESCE(net_salary, total_salary) ELSE 0 END), 0) as total_paid,
                COALESCE(SUM(CASE WHEN status = 'Unpaid' THEN COALESCE(net_salary, total_salary) ELSE 0 END), 0) as total_unpaid,
                SUM(CASE WHEN employment_type = 'Intern' THEN 1 ELSE 0 END) as intern_slips_count,
                SUM(CASE WHEN employment_type = 'Permanent' THEN 1 ELSE 0 END) as permanent_slips_count
             FROM salaries"
        );
        $summary = $stmt->fetch(PDO::FETCH_ASSOC);

        // Also fetch active structure counts
        $structStmt = $this->db->query("
            SELECT 
                COUNT(*) as total_structures,
                SUM(CASE WHEN employment_type = 'Permanent' THEN 1 ELSE 0 END) as permanent_profiles,
                SUM(CASE WHEN employment_type = 'Temporary' THEN 1 ELSE 0 END) as temporary_profiles,
                SUM(CASE WHEN employment_type = 'Intern' THEN 1 ELSE 0 END) as intern_profiles
            FROM employee_salary_structures WHERE status = 'Active'
        ");
        $structures = $structStmt->fetch(PDO::FETCH_ASSOC);

        return array_merge($summary, $structures ?: []);
    }
}
