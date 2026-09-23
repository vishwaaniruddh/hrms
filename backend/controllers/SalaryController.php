<?php
/**
 * Salary Controller
 * RESTful endpoints for payroll management
 */
class SalaryController extends Controller
{
    private SalaryService $service;

    public function __construct()
    {
        parent::__construct();
        $this->service = new SalaryService();
    }

    /**
     * GET /api/salaries
     */
    public function index(Request $request): void
    {
        $filters = [
            'user_id'         => $request->getQuery('user_id'),
            'status'          => $request->getQuery('status'),
            'employment_type' => $request->getQuery('employment_type'),
            'date_from'       => $request->getQuery('date_from'),
            'date_to'         => $request->getQuery('date_to'),
            'search'          => $request->getQuery('search'),
        ];

        $filters = array_filter($filters);
        $page = $request->getPage();
        $perPage = $request->getPerPage();

        $result = $this->service->getSalaries($filters, $page, $perPage);
        Response::paginated($result['data'], $result['total'], $page, $perPage);
    }

    /**
     * GET /api/salaries/{id}
     */
    public function show(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $salary = $this->service->getSalary($id);

        if (!$salary) {
            Response::notFound('Salary record not found');
        }

        Response::success($salary);
    }

    /**
     * POST /api/salaries
     */
    public function store(Request $request): void
    {
        $data = $request->getBody();
        $result = $this->service->createSalary($data);

        if (isset($result['errors'])) {
            Response::validationError($result['errors']);
        }

        Response::created($result, 'Salary generated');
    }

    /**
     * PUT /api/salaries/{id}
     */
    public function update(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $data = $request->getBody();
        $result = $this->service->updateSalary($id, $data);

        if ($result === null) {
            Response::notFound('Salary record not found');
        }

        Response::success($result, 'Salary updated');
    }

    /**
     * DELETE /api/salaries/{id}
     */
    public function destroy(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $result = $this->service->deleteSalary($id);

        if (!$result) {
            Response::notFound('Salary record not found');
        }

        Response::success(['deleted' => true], 'Salary deleted');
    }

    /**
     * PUT /api/salaries/{id}/pay
     */
    public function pay(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $data = $request->getBody();
        $result = $this->service->processPayment($id, $data);

        if (isset($result['errors'])) {
            Response::error($result['errors'][0] ?? 'Payment failed', 400);
        }

        // Event Trigger: Instant WhatsApp Notification on Salary Disbursal
        try {
            $notifService = new NotificationService();
            $notifService->notifySalaryDisbursed($id, $data);
        } catch (Exception $e) {}

        Response::success($result, 'Payment processed');
    }

    /**
     * GET /api/salaries/summary
     */
    public function summary(Request $request): void
    {
        $summary = $this->service->getSummary();
        Response::success($summary);
    }
}
