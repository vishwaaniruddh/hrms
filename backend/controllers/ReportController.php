<?php
/**
 * Report Controller
 * Endpoints for Attendance Muster Roll, Payroll Disbursal Registers, Leave Liability, and CSV Exports
 */
class ReportController extends Controller
{
    private ReportModel $model;

    public function __construct()
    {
        parent::__construct();
        $this->model = new ReportModel(Database::getInstance());
    }

    /**
     * GET /api/reports/muster-roll
     */
    public function musterRoll(Request $request): void
    {
        $year = (int)$request->getQuery('year', (string)date('Y'));
        $month = (int)$request->getQuery('month', (string)date('n'));
        $filters = [
            'designation' => $request->getQuery('designation'),
            'search'      => $request->getQuery('search')
        ];
        $filters = array_filter($filters, fn($v) => $v !== null && $v !== '');

        $data = $this->model->getMusterRoll($year, $month, $filters);
        Response::success($data);
    }

    /**
     * GET /api/reports/payroll-register
     */
    public function payrollRegister(Request $request): void
    {
        $year = (int)$request->getQuery('year', (string)date('Y'));
        $month = (int)$request->getQuery('month', (string)date('n'));
        $filters = [
            'tier'   => $request->getQuery('tier'),
            'status' => $request->getQuery('status'),
            'search' => $request->getQuery('search')
        ];
        $filters = array_filter($filters, fn($v) => $v !== null && $v !== '');

        $data = $this->model->getPayrollDisbursalRegister($year, $month, $filters);
        Response::success($data);
    }

    /**
     * GET /api/reports/leave-liability
     */
    public function leaveLiability(Request $request): void
    {
        $year = (int)$request->getQuery('year', (string)date('Y'));
        $filters = [
            'designation' => $request->getQuery('designation'),
            'search'      => $request->getQuery('search')
        ];
        $filters = array_filter($filters, fn($v) => $v !== null && $v !== '');

        $data = $this->model->getLeaveLiabilityReport($year, $filters);
        Response::success($data);
    }

    /**
     * GET /api/reports/export
     */
    public function exportCsv(Request $request): void
    {
        $type = $request->getQuery('type', 'muster-roll');
        $year = (int)$request->getQuery('year', (string)date('Y'));
        $month = (int)$request->getQuery('month', (string)date('n'));

        if ($type === 'muster-roll') {
            $filters = array_filter([
                'designation' => $request->getQuery('designation'),
                'search'      => $request->getQuery('search')
            ]);
            $reportData = $this->model->getMusterRoll($year, $month, $filters);
            $filename = sprintf('muster_roll_%04d_%02d.csv', $year, $month);
        } elseif ($type === 'payroll-register') {
            $filters = array_filter([
                'tier'   => $request->getQuery('tier'),
                'status' => $request->getQuery('status'),
                'search' => $request->getQuery('search')
            ]);
            $reportData = $this->model->getPayrollDisbursalRegister($year, $month, $filters);
            $filename = sprintf('payroll_disbursal_register_%04d_%02d.csv', $year, $month);
        } elseif ($type === 'leave-liability') {
            $filters = array_filter([
                'designation' => $request->getQuery('designation'),
                'search'      => $request->getQuery('search')
            ]);
            $reportData = $this->model->getLeaveLiabilityReport($year, $filters);
            $filename = sprintf('leave_liability_report_%04d.csv', $year);
        } else {
            Response::badRequest('Invalid report type for CSV export');
            return;
        }

        $csvContent = $this->model->generateCsv($type, $reportData);

        // If client requests raw file download
        if ($request->getQuery('download') === '1') {
            header('Content-Type: text/csv; charset=utf-8');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Pragma: no-cache');
            header('Expires: 0');
            echo $csvContent;
            exit;
        }

        // Return structured payload with raw csv content and recommended filename
        Response::success([
            'filename' => $filename,
            'csv'      => $csvContent
        ]);
    }
}
