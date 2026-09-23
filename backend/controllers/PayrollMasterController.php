<?php
/**
 * Payroll Master Controller
 * Handles REST endpoints for pay components, salary structures, and live breakdown previews
 */
class PayrollMasterController extends Controller
{
    private PayrollMasterModel $masterModel;
    private PayrollService $payrollService;

    public function __construct()
    {
        parent::__construct();
        $db = Database::getInstance();
        $this->masterModel = new PayrollMasterModel($db);
        $this->payrollService = new PayrollService();
    }

    /**
     * GET /api/payroll/components
     */
    public function getComponents(Request $request): void
    {
        $filters = [
            'type'       => $request->getQuery('type'),
            'applies_to' => $request->getQuery('applies_to'),
            'is_active'  => $request->getQuery('is_active'),
            'search'     => $request->getQuery('search'),
        ];
        $filters = array_filter($filters, fn($v) => $v !== null && $v !== '');

        $components = $this->masterModel->getComponents($filters);
        Response::success($components);
    }

    /**
     * POST /api/payroll/components
     */
    public function createComponent(Request $request): void
    {
        $data = $request->getBody();

        if (empty($data['name']) || empty($data['code']) || empty($data['type'])) {
            Response::validationError([
                'name' => empty($data['name']) ? 'Component name is required' : null,
                'code' => empty($data['code']) ? 'Unique component code is required' : null,
                'type' => empty($data['type']) ? 'Component type (Earning/Deduction) is required' : null,
            ]);
            return;
        }

        // Check unique code
        $existing = $this->masterModel->getComponentByCode(strtoupper(trim($data['code'])));
        if ($existing) {
            Response::validationError(['code' => 'A component with this code already exists']);
            return;
        }

        $id = $this->masterModel->createComponent($data);
        $created = $this->masterModel->getComponentById($id);
        Response::created($created, 'Payroll component created successfully');
    }

    /**
     * PUT /api/payroll/components/{id}
     */
    public function updateComponent(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $data = $request->getBody();

        $existing = $this->masterModel->getComponentById($id);
        if (!$existing) {
            Response::notFound('Payroll component not found');
            return;
        }

        $this->masterModel->updateComponent($id, $data);
        $updated = $this->masterModel->getComponentById($id);
        Response::success($updated, 'Payroll component updated');
    }

    /**
     * DELETE /api/payroll/components/{id}
     */
    public function deleteComponent(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $existing = $this->masterModel->getComponentById($id);

        if (!$existing) {
            Response::notFound('Payroll component not found');
            return;
        }

        if (!empty($existing['is_mandatory'])) {
            Response::error('Mandatory statutory/base component cannot be deleted', 400);
            return;
        }

        $this->masterModel->deleteComponent($id);
        Response::success(['deleted' => true], 'Payroll component deleted');
    }

    /**
     * GET /api/payroll/structures
     */
    public function getStructures(Request $request): void
    {
        $filters = [
            'employment_type' => $request->getQuery('employment_type'),
            'status'          => $request->getQuery('status'),
            'search'          => $request->getQuery('search'),
        ];
        $filters = array_filter($filters, fn($v) => $v !== null && $v !== '');

        $page = $request->getPage();
        $perPage = $request->getPerPage();

        $result = $this->masterModel->getStructures($filters, $page, $perPage);
        Response::paginated($result['data'], $result['total'], $page, $perPage);
    }

    /**
     * GET /api/payroll/structures/{userId}
     */
    public function getStructureByUser(Request $request): void
    {
        $userId = (int) $request->getParam('userId');
        $structure = $this->masterModel->getStructureByUserId($userId);

        if (!$structure) {
            Response::notFound('Salary structure not found for this employee');
            return;
        }

        Response::success($structure);
    }

    /**
     * POST /api/payroll/structures
     */
    public function saveStructure(Request $request): void
    {
        $data = $request->getBody();

        if (empty($data['user_id'])) {
            Response::validationError(['user_id' => 'Employee is required']);
            return;
        }

        $saved = $this->masterModel->saveStructure($data);
        Response::success($saved, 'Employee salary structure saved successfully');
    }

    /**
     * POST /api/payroll/calculate-preview
     * Previews earnings, deductions, gross, and net pay before saving
     */
    public function calculatePreview(Request $request): void
    {
        $data = $request->getBody();

        if (empty($data['user_id'])) {
            Response::validationError(['user_id' => 'Employee selection is required']);
            return;
        }

        $userId = (int) $data['user_id'];
        $preview = $this->payrollService->calculateSalaryPreview($userId, $data);

        Response::success($preview);
    }
}
