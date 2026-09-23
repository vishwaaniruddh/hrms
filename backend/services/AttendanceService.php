<?php
/**
 * Attendance Service
 * Business logic layer with caching for attendance operations
 */
class AttendanceService
{
    private AttendanceModel $model;
    private Cache $cache;

    private const CACHE_TTL = 180; // 3 minutes (attendance changes frequently)
    private const CACHE_TAG = 'attendance';

    public function __construct()
    {
        $this->model = new AttendanceModel(Database::getInstance());
        $this->cache = Cache::getInstance();
    }

    /**
     * Get attendance records with caching
     */
    public function getAttendance(array $filters = [], int $page = 1, int $perPage = 10): array
    {
        $cacheKey = 'attendance_list_' . md5(json_encode($filters) . "_p{$page}_pp{$perPage}");

        return $this->cache->remember($cacheKey, self::CACHE_TTL, function () use ($filters, $page, $perPage) {
            return $this->model->getAll($filters, $page, $perPage);
        });
    }

    /**
     * Get single attendance record
     */
    public function getRecord(int $id): ?array
    {
        return $this->model->findById($id);
    }

    /**
     * Record attendance (sign-in)
     */
    public function recordSignIn(array $data): array
    {
        $errors = $this->validate($data);
        if (!empty($errors)) {
            return ['errors' => $errors];
        }

        $id = $this->model->signIn(
            (int) $data['user_id'],
            $data['date'],
            $data['sign_in']
        );

        $this->invalidateCache();
        return $this->model->findById($id) ?? ['id' => $id];
    }

    /**
     * Record sign-out
     */
    public function recordSignOut(array $data): array
    {
        if (empty($data['user_id']) || empty($data['date']) || empty($data['sign_out'])) {
            return ['errors' => ['Missing required fields: user_id, date, sign_out']];
        }

        $result = $this->model->signOut(
            (int) $data['user_id'],
            $data['date'],
            $data['sign_out']
        );

        if (!$result) {
            return ['errors' => ['No sign-in record found for this date']];
        }

        $this->invalidateCache();
        return ['success' => true];
    }

    /**
     * Create a full attendance record
     */
    public function createAttendance(array $data): array
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
     * Update attendance record
     */
    public function updateAttendance(int $id, array $data): array|null
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
     * Delete attendance record
     */
    public function deleteAttendance(int $id): bool
    {
        $result = $this->model->delete($id);
        if ($result) {
            $this->invalidateCache();
        }
        return $result;
    }

    /**
     * Get today's attendance summary
     */
    public function getTodaySummary(): array
    {
        return $this->cache->remember('attendance_today', 60, function () {
            return $this->model->getTodaySummary();
        });
    }

    /**
     * Calculate stay time from two time strings (public helper)
     */
    public function calculateStayTime(string $signIn, string $signOut): string
    {
        return $this->model->calculateStayTime($signIn, $signOut);
    }

    /**
     * Validate attendance input
     */
    private function validate(array $data): array
    {
        $errors = [];

        if (empty($data['user_id'])) {
            $errors['user_id'] = 'Member is required';
        }

        if (empty($data['date'])) {
            $errors['date'] = 'Date is required';
        }

        if (empty($data['sign_in'])) {
            $errors['sign_in'] = 'Sign-in time is required';
        }

        return $errors;
    }

    private function invalidateCache(): void
    {
        $this->cache->invalidateByTag(self::CACHE_TAG);
        $this->cache->delete('attendance_today');
        $this->cache->delete('dashboard_stats');
    }
}
