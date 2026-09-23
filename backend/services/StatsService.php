<?php
/**
 * Stats Service
 * Aggregates dashboard metrics from multiple models with caching
 */
class StatsService
{
    private Cache $cache;

    private const CACHE_TTL = 120; // 2 minutes

    public function __construct()
    {
        $this->cache = Cache::getInstance();
    }

    /**
     * Get all dashboard stats
     */
    public function getDashboardStats(): array
    {
        return $this->cache->remember('dashboard_stats', self::CACHE_TTL, function () {
            $userService = new UserService();
            $attendanceService = new AttendanceService();
            $salaryService = new SalaryService();

            return [
                'members'    => $userService->getMemberStats(),
                'attendance' => $attendanceService->getTodaySummary(),
                'salary'     => $salaryService->getSummary(),
            ];
        });
    }
}
