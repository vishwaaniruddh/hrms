<?php
/**
 * Holiday Controller
 * REST endpoints for statutory holidays, company calendar feed, and working days metrics
 */
class HolidayController extends Controller
{
    private HolidayModel $model;

    public function __construct()
    {
        parent::__construct();
        $this->model = new HolidayModel(Database::getInstance());
    }

    /**
     * GET /api/holidays
     */
    public function index(Request $request): void
    {
        $filters = [
            'year'   => $request->getQuery('year', (string) date('Y')),
            'type'   => $request->getQuery('type'),
            'search' => $request->getQuery('search'),
        ];
        $filters = array_filter($filters, fn($v) => $v !== null && $v !== '');

        $page = $request->getPage();
        $perPage = $request->getPerPage(50);

        $result = $this->model->getAll($filters, $page, $perPage);
        Response::paginated($result['data'], $result['total'], $page, $perPage);
    }

    /**
     * GET /api/holidays/stats
     */
    public function stats(Request $request): void
    {
        $year = (int) $request->getQuery('year', (string) date('Y'));
        $stats = $this->model->getStats($year);
        Response::success($stats);
    }

    /**
     * GET /api/holidays/calendar
     */
    public function calendar(Request $request): void
    {
        $year = (int) $request->getQuery('year', (string) date('Y'));
        $month = (int) $request->getQuery('month', (string) date('m'));

        $feed = $this->model->getCalendarFeed($year, $month);
        Response::success($feed);
    }

    /**
     * GET /api/holidays/upcoming
     */
    public function upcoming(Request $request): void
    {
        $limit = (int) $request->getQuery('limit', '5');
        $upcoming = $this->model->getUpcoming($limit);
        Response::success($upcoming);
    }

    /**
     * POST /api/holidays
     */
    public function store(Request $request): void
    {
        $data = $request->getBody();

        if (empty($data['name']) || empty($data['holiday_date'])) {
            Response::validationError([
                'name'         => empty($data['name']) ? 'Holiday name is required' : null,
                'holiday_date' => empty($data['holiday_date']) ? 'Holiday date is required' : null,
            ]);
            return;
        }

        $id = $this->model->create($data);
        $created = $this->model->findById($id);
        Response::created($created, 'Company holiday scheduled successfully');
    }

    /**
     * PUT /api/holidays/{id}
     */
    public function update(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $data = $request->getBody();

        $existing = $this->model->findById($id);
        if (!$existing) {
            Response::notFound('Holiday record not found');
            return;
        }

        $this->model->update($id, $data);
        $updated = $this->model->findById($id);
        Response::success($updated, 'Holiday updated successfully');
    }

    /**
     * DELETE /api/holidays/{id}
     */
    public function destroy(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $existing = $this->model->findById($id);

        if (!$existing) {
            Response::notFound('Holiday record not found');
            return;
        }

        $this->model->delete($id);
        Response::success(['deleted' => true], 'Holiday removed successfully');
    }
}
