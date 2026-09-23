<?php
/**
 * HRMS Test Runner
 * Standalone CLI test suite - run with: php backend/tests/run_tests.php
 */

echo "\n╔══════════════════════════════════════════╗\n";
echo "║       HRMS Backend Test Suite            ║\n";
echo "╚══════════════════════════════════════════╝\n\n";

$basePath = dirname(__DIR__);

// Load dependencies
require_once $basePath . '/config/Database.php';
require_once $basePath . '/config/Cache.php';
require_once $basePath . '/models/UserModel.php';
require_once $basePath . '/models/AttendanceModel.php';
require_once $basePath . '/models/SalaryModel.php';
require_once $basePath . '/models/RoleModel.php';
require_once $basePath . '/models/LeaveModel.php';
require_once $basePath . '/services/LeaveService.php';
require_once $basePath . '/models/AssetModel.php';
require_once $basePath . '/services/AssetService.php';

// Load test files
require_once __DIR__ . '/CacheTest.php';
require_once __DIR__ . '/UserModelTest.php';
require_once __DIR__ . '/AttendanceTest.php';
require_once __DIR__ . '/LeaveTest.php';
require_once __DIR__ . '/AssetTest.php';

$totalPassed = 0;
$totalFailed = 0;

// ── Cache Tests ──
echo "── Cache Tests ──\n";
$cacheTest = new CacheTest();
$result = $cacheTest->run();
$totalPassed += $result['passed'];
$totalFailed += $result['failed'];
echo "\n";

// ── User Model Tests ──
echo "── User Model Tests ──\n";
$userTest = new UserModelTest();
$result = $userTest->run();
$totalPassed += $result['passed'];
$totalFailed += $result['failed'];
echo "\n";

// ── Attendance Tests ──
echo "── Attendance Tests ──\n";
$attendanceTest = new AttendanceTest();
$result = $attendanceTest->run();
$totalPassed += $result['passed'];
$totalFailed += $result['failed'];
echo "\n";

// ── Leave Management Tests ──
$leaveTest = new LeaveTest();
$leaveTest->run();
$totalPassed += $leaveTest->getPassed();
$totalFailed += $leaveTest->getFailed();
echo "\n";

// ── Asset Management Tests ──
$assetTest = new AssetTest();
$assetTest->run();
$totalPassed += $assetTest->getPassed();
$totalFailed += $assetTest->getFailed();
echo "\n";

// ── Payroll & Salary Masters Tests ──
require_once __DIR__ . '/PayrollTest.php';
$payrollTest = new PayrollTest();
$payResult = $payrollTest->run();
$totalPassed += $payResult['passed'];
$totalFailed += $payResult['failed'];
echo "\n";

// ── Company Holidays & Calendar Tests ──
require_once __DIR__ . '/HolidayTest.php';
$holidayTest = new HolidayTest();
$holResult = $holidayTest->run();
$totalPassed += $holResult['passed'];
$totalFailed += $holResult['failed'];
echo "\n";

// ── Reports & Intelligence Suite Tests ──
require_once __DIR__ . '/ReportTest.php';
$reportTest = new ReportTest();
$repResult = $reportTest->run();
$totalPassed += $repResult['passed'];
$totalFailed += $repResult['failed'];
echo "\n";

// ── Recruitment & Hiring Pipeline (ATS) Tests ──
require_once __DIR__ . '/RecruitmentTest.php';
$recruitmentTest = new RecruitmentTest();
$recResult = $recruitmentTest->run();
$totalPassed += $recResult['passed'];
$totalFailed += $recResult['failed'];
echo "\n";

// ── Employee Lifecycle & Exit Management Tests ──
require_once __DIR__ . '/LifecycleTest.php';
$lifecycleTest = new LifecycleTest();
$lifeResult = $lifecycleTest->run();
$totalPassed += $lifeResult['passed'];
$totalFailed += $lifeResult['failed'];
echo "\n";

// ── Employee Self-Service (ESS) & Manager Approvals Tests ──
require_once __DIR__ . '/EssApprovalsTest.php';
$essTest = new EssApprovalsTest();
$essResult = $essTest->run();
$totalPassed += $essResult['passed'];
$totalFailed += $essResult['failed'];
echo "\n";

// ── Performance Management & Appraisals (PMS) Tests ──
require_once __DIR__ . '/PmsTest.php';
$pmsTest = new PmsTest();
$pmsResults = $pmsTest->run();
$pmsPassed = count(array_filter($pmsResults, fn($r) => $r['status'] === 'PASS'));
$pmsFailed = count(array_filter($pmsResults, fn($r) => $r['status'] === 'FAIL'));
$totalPassed += $pmsPassed;
$totalFailed += $pmsFailed;
echo "  PMS Tests: {$pmsPassed} passed, {$pmsFailed} failed\n\n";

// ── Automated WhatsApp & SMS Notification Engine Tests ──
require_once __DIR__ . '/NotificationTest.php';
$notifTest = new NotificationTest();
$notifResults = $notifTest->run();
$notifPassed = count(array_filter($notifResults, fn($r) => $r['status'] === 'PASS'));
$notifFailed = count(array_filter($notifResults, fn($r) => $r['status'] === 'FAIL'));
$totalPassed += $notifPassed;
$totalFailed += $notifFailed;
echo "  Notification Tests: {$notifPassed} passed, {$notifFailed} failed\n\n";

// ── Shift Scheduling & Team Roster Management Tests ──
require_once __DIR__ . '/ShiftTest.php';
$shiftTest = new ShiftTest();
$shiftResults = $shiftTest->run();
$shiftPassed = count(array_filter($shiftResults, fn($r) => $r['status'] === 'PASS'));
$shiftFailed = count(array_filter($shiftResults, fn($r) => $r['status'] === 'FAIL'));
$totalPassed += $shiftPassed;
$totalFailed += $shiftFailed;
echo "  Shift & Roster Tests: {$shiftPassed} passed, {$shiftFailed} failed\n\n";

// ── Internal HR Helpdesk & Employee Ticketing Tests ──
require_once __DIR__ . '/HelpdeskTest.php';
$helpdeskTest = new HelpdeskTest();
$helpdeskResults = $helpdeskTest->run();
$helpdeskPassed = count(array_filter($helpdeskResults, fn($r) => $r['status'] === 'PASS'));
$helpdeskFailed = count(array_filter($helpdeskResults, fn($r) => $r['status'] === 'FAIL'));
$totalPassed += $helpdeskPassed;
$totalFailed += $helpdeskFailed;
echo "  Helpdesk & Ticketing Tests: {$helpdeskPassed} passed, {$helpdeskFailed} failed\n\n";

// ── Summary ──
$total = $totalPassed + $totalFailed;
echo "══════════════════════════════════════════\n";
echo "Results: {$totalPassed}/{$total} passed";
if ($totalFailed > 0) {
    echo " ({$totalFailed} failed)";
}
echo "\n";

if ($totalFailed === 0) {
    echo "🎉 All tests passed!\n";
} else {
    echo "⚠️  Some tests failed.\n";
}

echo "══════════════════════════════════════════\n\n";

exit($totalFailed > 0 ? 1 : 0);
