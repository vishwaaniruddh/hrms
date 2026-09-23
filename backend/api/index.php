<?php
/**
 * HRMS API Front Controller
 * All API requests are routed through this file
 */

// Error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Set JSON content type
header('Content-Type: application/json; charset=utf-8');

// CORS Headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-HTTP-Method-Override');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Autoload all project files
$basePath = dirname(__DIR__);

// Config
require_once $basePath . '/config/Database.php';
require_once $basePath . '/config/Cache.php';

// Core
require_once $basePath . '/core/Router.php';
require_once $basePath . '/core/Request.php';
require_once $basePath . '/core/Response.php';
require_once $basePath . '/core/Controller.php';

// Models
require_once $basePath . '/models/UserModel.php';
require_once $basePath . '/models/AttendanceModel.php';
require_once $basePath . '/models/SalaryModel.php';
require_once $basePath . '/models/RoleModel.php';
require_once $basePath . '/models/LeaveModel.php';
require_once $basePath . '/models/AssetModel.php';
require_once $basePath . '/models/PayrollMasterModel.php';
require_once $basePath . '/models/HolidayModel.php';
require_once $basePath . '/models/ReportModel.php';
require_once $basePath . '/models/RecruitmentModel.php';
require_once $basePath . '/models/LifecycleModel.php';
require_once $basePath . '/models/EssModel.php';
require_once $basePath . '/models/ApprovalsModel.php';
require_once $basePath . '/models/PmsModel.php';
require_once $basePath . '/models/NotificationModel.php';
require_once $basePath . '/models/ShiftModel.php';
require_once $basePath . '/models/HelpdeskModel.php';

// Services
require_once $basePath . '/services/UserService.php';
require_once $basePath . '/services/AttendanceService.php';
require_once $basePath . '/services/SalaryService.php';
require_once $basePath . '/services/PayrollService.php';
require_once $basePath . '/services/StatsService.php';
require_once $basePath . '/services/LeaveService.php';
require_once $basePath . '/services/AssetService.php';
require_once $basePath . '/services/NotificationService.php';

// Controllers
require_once $basePath . '/controllers/UserController.php';
require_once $basePath . '/controllers/AttendanceController.php';
require_once $basePath . '/controllers/SalaryController.php';
require_once $basePath . '/controllers/PayrollMasterController.php';
require_once $basePath . '/controllers/StatsController.php';
require_once $basePath . '/controllers/LeaveController.php';
require_once $basePath . '/controllers/AssetController.php';
require_once $basePath . '/controllers/HolidayController.php';
require_once $basePath . '/controllers/ReportController.php';
require_once $basePath . '/controllers/RecruitmentController.php';
require_once $basePath . '/controllers/LifecycleController.php';
require_once $basePath . '/controllers/EssController.php';
require_once $basePath . '/controllers/ApprovalsController.php';
require_once $basePath . '/controllers/PmsController.php';
require_once $basePath . '/controllers/NotificationController.php';
require_once $basePath . '/controllers/ShiftController.php';
require_once $basePath . '/controllers/HelpdeskController.php';

// ────────────────────────────────────────────
// Define API Routes
// ────────────────────────────────────────────

$router = new Router();

// Health check
$router->get('/', function (Request $request) {
    Response::success([
        'name'    => 'HRMS API',
        'version' => '1.0.0',
        'status'  => 'running',
        'time'    => date('Y-m-d H:i:s'),
    ]);
});

// ── Members ──
$router->get('/members/stats',  [UserController::class, 'stats']);
$router->get('/members',        [UserController::class, 'index']);
$router->get('/members/{id}',   [UserController::class, 'show']);
$router->post('/members',       [UserController::class, 'store']);
$router->put('/members/{id}',   [UserController::class, 'update']);
$router->delete('/members/{id}',[UserController::class, 'destroy']);

// ── Attendance ──
$router->get('/attendance/today',    [AttendanceController::class, 'today']);
$router->get('/attendance',          [AttendanceController::class, 'index']);
$router->post('/attendance',         [AttendanceController::class, 'store']);
$router->post('/attendance/sign-in', [AttendanceController::class, 'signIn']);
$router->post('/attendance/sign-out',[AttendanceController::class, 'signOut']);
$router->put('/attendance/{id}',     [AttendanceController::class, 'update']);
$router->delete('/attendance/{id}',  [AttendanceController::class, 'destroy']);

// ── Salaries & Payroll ──
$router->get('/salaries/summary',   [SalaryController::class, 'summary']);
$router->get('/salaries',           [SalaryController::class, 'index']);
$router->get('/salaries/{id}',      [SalaryController::class, 'show']);
$router->post('/salaries',          [SalaryController::class, 'store']);
$router->put('/salaries/{id}',      [SalaryController::class, 'update']);
$router->put('/salaries/{id}/pay',  [SalaryController::class, 'pay']);
$router->delete('/salaries/{id}',   [SalaryController::class, 'destroy']);

// ── Payroll Masters & Structure Configuration ──
$router->get('/payroll/components',             [PayrollMasterController::class, 'getComponents']);
$router->post('/payroll/components',            [PayrollMasterController::class, 'createComponent']);
$router->put('/payroll/components/{id}',        [PayrollMasterController::class, 'updateComponent']);
$router->delete('/payroll/components/{id}',     [PayrollMasterController::class, 'deleteComponent']);
$router->get('/payroll/structures',             [PayrollMasterController::class, 'getStructures']);
$router->get('/payroll/structures/{userId}',    [PayrollMasterController::class, 'getStructureByUser']);
$router->post('/payroll/structures',            [PayrollMasterController::class, 'saveStructure']);
$router->post('/payroll/calculate-preview',      [PayrollMasterController::class, 'calculatePreview']);

// ── Leave Management ──
$router->get('/leaves/types',                  [LeaveController::class, 'types']);
$router->get('/leaves/balances',               [LeaveController::class, 'balances']);
$router->get('/leaves/requests',               [LeaveController::class, 'index']);
$router->post('/leaves/requests',              [LeaveController::class, 'apply']);
$router->put('/leaves/requests/{id}/approve',  [LeaveController::class, 'approve']);
$router->put('/leaves/requests/{id}/reject',   [LeaveController::class, 'reject']);
$router->get('/leaves/stats',                  [LeaveController::class, 'stats']);

// ── Asset & Inventory Management ──
$router->get('/assets/categories',        [AssetController::class, 'categories']);
$router->get('/assets/stats',             [AssetController::class, 'stats']);
$router->get('/assets/assignments',       [AssetController::class, 'assignments']);
$router->get('/assets',                   [AssetController::class, 'index']);
$router->get('/assets/{id}',              [AssetController::class, 'show']);
$router->post('/assets',                  [AssetController::class, 'store']);
$router->put('/assets/{id}',              [AssetController::class, 'update']);
$router->delete('/assets/{id}',           [AssetController::class, 'destroy']);
$router->post('/assets/{id}/assign',      [AssetController::class, 'assign']);
$router->post('/assets/{id}/return',      [AssetController::class, 'processReturn']);

// ── Company Holidays & Work Calendar ──
$router->get('/holidays/stats',           [HolidayController::class, 'stats']);
$router->get('/holidays/calendar',        [HolidayController::class, 'calendar']);
$router->get('/holidays/upcoming',        [HolidayController::class, 'upcoming']);
$router->get('/holidays',                 [HolidayController::class, 'index']);
$router->post('/holidays',                [HolidayController::class, 'store']);
$router->put('/holidays/{id}',            [HolidayController::class, 'update']);
$router->delete('/holidays/{id}',         [HolidayController::class, 'destroy']);

// ── Reports & Intelligence Suite ──
$router->get('/reports/muster-roll',      [ReportController::class, 'musterRoll']);
$router->get('/reports/payroll-register', [ReportController::class, 'payrollRegister']);
$router->get('/reports/leave-liability',  [ReportController::class, 'leaveLiability']);
$router->get('/reports/export',           [ReportController::class, 'exportCsv']);

// ── Recruitment & Hiring Pipeline (ATS) ──
$router->get('/recruitment/stats',              [RecruitmentController::class, 'stats']);
$router->get('/recruitment/openings',           [RecruitmentController::class, 'openings']);
$router->get('/recruitment/openings/{id}',      [RecruitmentController::class, 'showOpening']);
$router->post('/recruitment/openings',          [RecruitmentController::class, 'storeOpening']);
$router->put('/recruitment/openings/{id}',      [RecruitmentController::class, 'updateOpening']);
$router->delete('/recruitment/openings/{id}',   [RecruitmentController::class, 'destroyOpening']);
$router->get('/recruitment/candidates',         [RecruitmentController::class, 'candidates']);
$router->get('/recruitment/candidates/{id}',    [RecruitmentController::class, 'showCandidate']);
$router->post('/recruitment/candidates',        [RecruitmentController::class, 'storeCandidate']);
$router->put('/recruitment/candidates/{id}/stage', [RecruitmentController::class, 'updateStage']);
$router->put('/recruitment/candidates/{id}',    [RecruitmentController::class, 'updateCandidate']);
$router->delete('/recruitment/candidates/{id}', [RecruitmentController::class, 'destroyCandidate']);

// ── Employee Lifecycle & Exit Management ──
$router->get('/lifecycle/stats',              [LifecycleController::class, 'stats']);
$router->get('/lifecycle/clearances',         [LifecycleController::class, 'clearances']);
$router->get('/lifecycle/workflows',          [LifecycleController::class, 'index']);
$router->get('/lifecycle/workflows/{id}',     [LifecycleController::class, 'show']);
$router->post('/lifecycle/workflows',         [LifecycleController::class, 'store']);
$router->put('/lifecycle/workflows/{id}',     [LifecycleController::class, 'update']);
$router->delete('/lifecycle/workflows/{id}',  [LifecycleController::class, 'destroy']);
$router->put('/lifecycle/tasks/{id}',         [LifecycleController::class, 'updateTask']);
$router->post('/lifecycle/workflows/{id}/tasks', [LifecycleController::class, 'addTask']);

// ── Employee Self-Service (ESS) ──
$router->get('/ess/dashboard',                [EssController::class, 'dashboard']);
$router->post('/ess/punch',                   [EssController::class, 'punch']);
$router->post('/ess/leaves',                  [EssController::class, 'applyLeave']);
$router->post('/ess/claims',                  [EssController::class, 'submitClaim']);
$router->get('/ess/payslips/{id}',            [EssController::class, 'payslip']);

// ── Manager Approvals ──
$router->get('/approvals/inbox',              [ApprovalsController::class, 'inbox']);
$router->post('/approvals/leaves/{id}',       [ApprovalsController::class, 'reviewLeave']);
$router->post('/approvals/claims/{id}',       [ApprovalsController::class, 'reviewClaim']);
$router->post('/approvals/clearance/{id}',    [ApprovalsController::class, 'reviewClearance']);

// ── Performance Management & Appraisals (PMS) ──
$router->get('/pms/cycles',                   [PmsController::class, 'getCycles']);
$router->post('/pms/cycles',                  [PmsController::class, 'createCycle']);
$router->get('/pms/competencies',             [PmsController::class, 'getCompetencies']);
$router->get('/pms/okrs',                     [PmsController::class, 'getOkrs']);
$router->get('/pms/okrs/{id}',                [PmsController::class, 'getOkrById']);
$router->post('/pms/okrs',                    [PmsController::class, 'createOkr']);
$router->put('/pms/key-results/{id}/progress',[PmsController::class, 'updateKeyResultProgress']);
$router->get('/pms/reviews',                  [PmsController::class, 'getReviews']);
$router->get('/pms/reviews/{id}',             [PmsController::class, 'getReviewById']);
$router->post('/pms/reviews/{id}/self-eval',  [PmsController::class, 'submitSelfEvaluation']);
$router->post('/pms/reviews/{id}/manager-eval',[PmsController::class, 'submitManagerEvaluation']);
$router->get('/pms/talent-matrix',            [PmsController::class, 'getTalentMatrix']);
$router->post('/pms/reviews/{id}/apply-increment', [PmsController::class, 'applyIncrement']);
$router->get('/pms/salary-increments',        [PmsController::class, 'getSalaryIncrements']);
$router->get('/pms/stats',                    [PmsController::class, 'getStats']);

// ── Automated WhatsApp & SMS Notification Engine ──
$router->get('/notifications/logs',                        [NotificationController::class, 'logs']);
$router->get('/notifications/stats',                       [NotificationController::class, 'stats']);
$router->get('/notifications/settings',                    [NotificationController::class, 'settings']);
$router->put('/notifications/settings/{key}',              [NotificationController::class, 'updateSetting']);
$router->post('/notifications/send-test',                  [NotificationController::class, 'sendTest']);
$router->post('/notifications/triggers/attendance-alerts', [NotificationController::class, 'triggerAttendance']);
$router->post('/notifications/webhook',                    [NotificationController::class, 'webhook']);
$router->post('/notifications/simulate-receipt',           [NotificationController::class, 'simulateReceipt']);

// ── Shift Scheduling & Team Roster Management ──
$router->get('/shifts',                         [ShiftController::class, 'getShifts']);
$router->post('/shifts',                        [ShiftController::class, 'createShift']);
$router->put('/shifts/{id}',                    [ShiftController::class, 'updateShift']);
$router->delete('/shifts/{id}',                 [ShiftController::class, 'deleteShift']);
$router->get('/shifts/roster',                  [ShiftController::class, 'getRoster']);
$router->post('/shifts/roster/assign',          [ShiftController::class, 'assignRoster']);
$router->post('/shifts/roster/bulk',            [ShiftController::class, 'bulkAssign']);
$router->get('/shifts/swaps',                   [ShiftController::class, 'getSwaps']);
$router->post('/shifts/swaps',                  [ShiftController::class, 'createSwap']);
$router->post('/shifts/swaps/{id}/peer-respond', [ShiftController::class, 'respondSwap']);
$router->post('/shifts/swaps/{id}/review',      [ShiftController::class, 'reviewSwap']);
$router->get('/shifts/overtime',                [ShiftController::class, 'getOvertime']);
$router->post('/shifts/overtime/calculate',     [ShiftController::class, 'calculateOvertime']);
$router->post('/shifts/overtime/sync',          [ShiftController::class, 'syncOvertime']);
$router->get('/shifts/stats',                   [ShiftController::class, 'getStats']);

// ── Internal HR Helpdesk & Employee Ticketing ──
$router->get('/helpdesk/categories',            [HelpdeskController::class, 'getCategories']);
$router->post('/helpdesk/categories',           [HelpdeskController::class, 'createCategory']);
$router->get('/helpdesk/tickets',               [HelpdeskController::class, 'getTickets']);
$router->post('/helpdesk/tickets',              [HelpdeskController::class, 'createTicket']);
$router->get('/helpdesk/tickets/{id}',          [HelpdeskController::class, 'getTicket']);
$router->post('/helpdesk/tickets/{id}/messages', [HelpdeskController::class, 'replyTicket']);
$router->put('/helpdesk/tickets/{id}/status',   [HelpdeskController::class, 'updateStatus']);
$router->put('/helpdesk/tickets/{id}/assign',   [HelpdeskController::class, 'assignTicket']);
$router->post('/helpdesk/tickets/{id}/csat',    [HelpdeskController::class, 'submitCsat']);
$router->get('/helpdesk/stats',                 [HelpdeskController::class, 'getStats']);

// ── Dashboard Stats ──
$router->get('/stats', [StatsController::class, 'index']);

// ── Roles ──
$router->get('/roles', function (Request $request) {
    $model = new RoleModel(Database::getInstance());
    Response::success($model->getAll());
});

// ────────────────────────────────────────────
// Dispatch
// ────────────────────────────────────────────

try {
    $request = new Request();
    $router->dispatch($request);
} catch (PDOException $e) {
    Response::error('Database error: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    Response::error('Server error: ' . $e->getMessage(), 500);
}
