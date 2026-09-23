<?php
/**
 * Leave Service
 * Business logic for leave applications, balance checks, approval workflows, and caching
 */
require_once __DIR__ . '/../models/LeaveModel.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Cache.php';

class LeaveService
{
    private LeaveModel $model;
    private Cache $cache;

    public function __construct(?PDO $db = null)
    {
        $database = $db ?? Database::getInstance();
        $this->model = new LeaveModel($database);
        $this->cache = Cache::getInstance();
    }

    /**
     * Get leave policies
     */
    public function getLeaveTypes(): array
    {
        return $this->cache->remember('leave_types', 3600, function () {
            return $this->model->getLeaveTypes();
        }, ['leaves']);
    }

    /**
     * Get user leave balances
     */
    public function getLeaveBalances(int $userId, ?int $year = null): array
    {
        $year = $year ?? (int)date('Y');
        $cacheKey = "leave_balances_{$userId}_{$year}";

        return $this->cache->remember($cacheKey, 300, function () use ($userId, $year) {
            return $this->model->getLeaveBalances($userId, $year);
        }, ['leaves']);
    }

    /**
     * Get filtered leave requests
     */
    public function getLeaveRequests(array $params = []): array
    {
        $cacheKey = 'leave_requests_' . md5(serialize($params));
        return $this->cache->remember($cacheKey, 60, function () use ($params) {
            return $this->model->getLeaveRequests($params);
        }, ['leaves']);
    }

    /**
     * Submit a new leave application
     */
    public function applyForLeave(array $data): array
    {
        // 1. Validation
        $errors = [];
        if (empty($data['user_id'])) $errors['user_id'] = 'Employee is required.';
        if (empty($data['leave_type_id'])) $errors['leave_type_id'] = 'Leave policy type is required.';
        if (empty($data['start_date'])) $errors['start_date'] = 'Start date is required.';
        if (empty($data['end_date'])) $errors['end_date'] = 'End date is required.';
        if (empty(trim($data['reason'] ?? ''))) $errors['reason'] = 'Reason for leave is required.';

        if (!empty($data['start_date']) && !empty($data['end_date'])) {
            if ($data['start_date'] > $data['end_date']) {
                $errors['end_date'] = 'End date cannot be earlier than start date.';
            }
        }

        if (!empty($errors)) {
            throw new InvalidArgumentException(json_encode($errors));
        }

        // 2. Calculate requested days
        $start = new DateTime($data['start_date']);
        $end = new DateTime($data['end_date']);
        $diff = $start->diff($end)->days + 1;
        $totalDays = !empty($data['is_half_day']) ? 0.5 : (float)$diff;
        $data['total_days'] = $totalDays;

        // 3. Balance verification
        $year = (int)$start->format('Y');
        $balance = $this->model->getLeaveBalance((int)$data['user_id'], (int)$data['leave_type_id'], $year);
        if ($balance) {
            $available = (float)$balance['remaining_days'];
            // If it's a paid leave type, enforce quota
            if ($balance['total_days'] > 0 && $available < $totalDays) {
                throw new InvalidArgumentException(json_encode([
                    'leave_type_id' => "Insufficient leave balance. You have {$available} days remaining, but requested {$totalDays}."
                ]));
            }
        }

        // 4. Create request
        $requestId = $this->model->createLeaveRequest($data);

        // Invalidate cache
        $this->cache->invalidateTags(['leaves', 'stats']);

        return [
            'id' => $requestId,
            'message' => 'Leave application submitted successfully for manager approval.',
            'total_days' => $totalDays
        ];
    }

    /**
     * Manager Approval
     */
    public function approveRequest(int $id, ?int $approverId = null, ?string $remarks = null): bool
    {
        $res = $this->model->updateRequestStatus($id, 'Approved', $approverId, $remarks);
        if ($res) {
            $this->cache->invalidateTags(['leaves', 'stats']);
        }
        return $res;
    }

    /**
     * Manager Rejection
     */
    public function rejectRequest(int $id, ?int $approverId = null, ?string $remarks = null): bool
    {
        $res = $this->model->updateRequestStatus($id, 'Rejected', $approverId, $remarks);
        if ($res) {
            $this->cache->invalidateTags(['leaves', 'stats']);
        }
        return $res;
    }

    /**
     * Get aggregate statistics
     */
    public function getStats(?int $year = null, ?int $userId = null): array
    {
        $year = $year ?? (int)date('Y');
        $cacheKey = "leave_stats_{$year}_" . ($userId ?? 'all');
        return $this->cache->remember($cacheKey, 60, function () use ($year, $userId) {
            return $this->model->getStats($year, $userId);
        }, ['leaves', 'stats']);
    }
}
