<?php
/**
 * Stats Controller
 * Dashboard aggregate statistics endpoint
 */
class StatsController extends Controller
{
    private StatsService $service;

    public function __construct()
    {
        parent::__construct();
        $this->service = new StatsService();
    }

    /**
     * GET /api/stats
     */
    public function index(Request $request): void
    {
        $stats = $this->service->getDashboardStats();
        Response::success($stats);
    }
}
