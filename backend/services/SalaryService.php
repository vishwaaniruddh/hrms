<?php
/**
 * Salary Service
 * Business logic layer with caching for salary/payroll operations
 */
class SalaryService
{
    private SalaryModel $model;
    private Cache $cache;

    private const CACHE_TTL = 300;
    private const CACHE_TAG = 'salaries';

    public function __construct()
    {
        $this->model = new SalaryModel(Database::getInstance());
        $this->cache = Cache::getInstance();
    }

    /**
     * Get salary records with caching
     */
    public function getSalaries(array $filters = [], int $page = 1, int $perPage = 10): array
    {
        $cacheKey = 'salaries_list_' . md5(json_encode($filters) . "_p{$page}_pp{$perPage}");

        return $this->cache->remember($cacheKey, self::CACHE_TTL, function () use ($filters, $page, $perPage) {
            return $this->model->getAll($filters, $page, $perPage);
        });
    }

    /**
     * Get single salary record
     */
    public function getSalary(int $id): ?array
    {
        return $this->model->findById($id);
    }

    /**
     * Generate a salary record
     */
    public function createSalary(array $data): array
    {
        $errors = $this->validate($data);
        if (!empty($errors)) {
            return ['errors' => $errors];
        }

        $id = $this->model->create($data);
        $this->invalidateCache();
        return $this->model->findById($id);
    }

    /**
     * Update salary record
     */
    public function updateSalary(int $id, array $data): array|null
    {
        $existing = $this->model->findById($id);
        if (!$existing) {
            return null;
        }

        $this->model->update($id, $data);
        $this->invalidateCache();
        return $this->model->findById($id);
    }

    /**
     * Delete salary record
     */
    public function deleteSalary(int $id): bool
    {
        $result = $this->model->delete($id);
        if ($result) {
            $this->invalidateCache();
        }
        return $result;
    }

    /**
     * Process a payment for a salary
     */
    public function processPayment(int $salaryId, array $data): array
    {
        $salary = $this->model->findById($salaryId);
        if (!$salary) {
            return ['errors' => ['Salary record not found']];
        }

        if ($salary['status'] === 'Paid') {
            return ['errors' => ['Salary has already been paid']];
        }

        $data['salary_id'] = $salaryId;
        $data['user_id'] = $salary['user_id'];
        $data['amount_paid'] = $data['amount_paid'] ?? $salary['total_salary'];

        $paymentId = $this->model->recordPayment($data);
        $this->invalidateCache();

        return [
            'payment_id' => $paymentId,
            'salary'     => $this->model->findById($salaryId),
        ];
    }

    /**
     * Get payroll summary statistics
     */
    public function getSummary(): array
    {
        return $this->cache->remember('salary_summary', self::CACHE_TTL, function () {
            return $this->model->getSummary();
        });
    }

    /**
     * Validate salary data
     */
    private function validate(array $data): array
    {
        $errors = [];

        if (empty($data['user_id'])) {
            $errors['user_id'] = 'Member is required';
        }

        if (empty($data['salary_date'])) {
            $errors['salary_date'] = 'Date is required';
        }

        $salaryAmount = $data['total_salary'] ?? ($data['net_salary'] ?? ($data['gross_salary'] ?? null));
        if ($salaryAmount === null || (float)$salaryAmount < 0) {
            $errors['total_salary'] = 'Valid salary amount is required';
        }

        if (!isset($data['working_days']) || $data['working_days'] <= 0) {
            $errors['working_days'] = 'Valid working days count is required';
        }

        return $errors;
    }

    private function invalidateCache(): void
    {
        $this->cache->invalidateByTag(self::CACHE_TAG);
        $this->cache->delete('salary_summary');
        $this->cache->delete('dashboard_stats');
    }
}
