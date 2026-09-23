<?php
/**
 * Attendance Controller
 * RESTful endpoints for attendance management
 */
class AttendanceController extends Controller
{
    private AttendanceService $service;

    public function __construct()
    {
        parent::__construct();
        $this->service = new AttendanceService();
    }

    /**
     * GET /api/attendance
     */
    public function index(Request $request): void
    {
        $filters = [
            'user_id'   => $request->getQuery('user_id'),
            'date_from' => $request->getQuery('date_from'),
            'date_to'   => $request->getQuery('date_to'),
            'search'    => $request->getQuery('search'),
        ];

        $filters = array_filter($filters);
        $page = $request->getPage();
        $perPage = $request->getPerPage();

        $result = $this->service->getAttendance($filters, $page, $perPage);
        Response::paginated($result['data'], $result['total'], $page, $perPage);
    }

    /**
     * POST /api/attendance
     */
    public function store(Request $request): void
    {
        $data = $request->getBody();
        $result = $this->service->createAttendance($data);

        if (isset($result['errors'])) {
            Response::validationError($result['errors']);
        }

        Response::created($result, 'Attendance recorded');
    }

    /**
     * POST /api/attendance/sign-in
     */
    public function signIn(Request $request): void
    {
        $data = $request->getBody();
        $result = $this->service->recordSignIn($data);

        if (isset($result['errors'])) {
            Response::validationError($result['errors']);
        }

        Response::created($result, 'Sign-in recorded');
    }

    /**
     * POST /api/attendance/sign-out
     */
    public function signOut(Request $request): void
    {
        $data = $request->getBody();
        $result = $this->service->recordSignOut($data);

        if (isset($result['errors'])) {
            Response::validationError($result['errors']);
        }

        Response::success($result, 'Sign-out recorded');
    }

    /**
     * PUT /api/attendance/{id}
     */
    public function update(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $data = $request->getBody();
        $result = $this->service->updateAttendance($id, $data);

        if ($result === null) {
            Response::notFound('Attendance record not found');
        }

        Response::success($result, 'Attendance updated');
    }

    /**
     * DELETE /api/attendance/{id}
     */
    public function destroy(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $result = $this->service->deleteAttendance($id);

        if (!$result) {
            Response::notFound('Attendance record not found');
        }

        Response::success(['deleted' => true], 'Attendance deleted');
    }

    /**
     * GET /api/attendance/today
     */
    public function today(Request $request): void
    {
        $summary = $this->service->getTodaySummary();
        Response::success($summary);
    }
}
