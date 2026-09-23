<?php
/**
 * Automated Unit Tests for Shift Scheduling & Team Roster Management
 */
require_once __DIR__ . '/../models/ShiftModel.php';
require_once __DIR__ . '/../config/Database.php';

class ShiftTest
{
    private PDO $db;
    private ShiftModel $model;
    private array $results = [];

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->model = new ShiftModel($this->db);
    }

    private function assert($condition, string $message): void
    {
        if ($condition) {
            $this->results[] = ['status' => 'PASS', 'message' => $message];
            echo "  ✔ PASS: {$message}\n";
        } else {
            $this->results[] = ['status' => 'FAIL', 'message' => $message];
            echo "  ✖ FAIL: {$message}\n";
        }
    }

    public function run(): array
    {
        echo "\n── Shift Scheduling & Team Roster Management Tests ──\n";

        $this->testShiftMasterCrud();
        $this->testVisualRosterGrid();
        $this->testRosterAssignmentAndBulk();
        $this->testShiftSwappingLifecycle();
        $this->testOvertimeAndNightDifferential();
        $this->testSyncOvertimeToPayroll();
        $this->testShiftStats();

        return $this->results;
    }

    private function testShiftMasterCrud(): void
    {
        // Clean up any lingering test shifts
        $this->db->exec("DELETE FROM shifts WHERE shift_code LIKE 'UNIT-%'");

        $shifts = $this->model->getShifts();
        $this->assert(is_array($shifts) && count($shifts) >= 4, "Shift Master contains at least 4 seeded shifts (got: " . count($shifts) . ")");

        // Find Morning and Night shift
        $codes = array_column($shifts, 'shift_code');
        $this->assert(in_array('MORN-01', $codes), "Shift Master contains MORN-01");
        $this->assert(in_array('NIGHT-03', $codes), "Shift Master contains NIGHT-03");

        // Verify night shift attributes
        $night = null;
        foreach ($shifts as $s) {
            if ($s['shift_code'] === 'NIGHT-03') {
                $night = $s;
                break;
            }
        }
        $this->assert($night !== null && (int)$night['is_night_shift'] === 1, "NIGHT-03 has is_night_shift = 1");
        $this->assert((float)$night['night_allowance_amt'] === 350.00, "NIGHT-03 has ₹350 night allowance");

        // Create a test shift with unique code
        $testCode = 'UNIT-' . substr(md5(uniqid()), 0, 6);
        $testId = $this->model->createShift([
            'shift_code'          => $testCode,
            'name'                => 'Unit Test Custom Shift',
            'description'         => 'Test shift for validation',
            'start_time'          => '10:00:00',
            'end_time'            => '18:30:00',
            'grace_period_mins'   => 20,
            'break_duration_mins' => 45,
            'color'               => '#06b6d4',
            'is_night_shift'      => 0
        ]);
        $this->assert($testId > 0, "Created custom shift with ID: {$testId}");

        $created = $this->model->getShiftById($testId);
        $this->assert($created['name'] === 'Unit Test Custom Shift', "Fetched shift name matches");
        $this->assert((int)$created['grace_period_mins'] === 20, "Grace period verified as 20 mins");

        // Update shift
        $upd = $this->model->updateShift($testId, ['grace_period_mins' => 25, 'color' => '#0891b2']);
        $this->assert($upd === true, "Updated custom shift settings");

        $updated = $this->model->getShiftById($testId);
        $this->assert((int)$updated['grace_period_mins'] === 25, "Updated grace period verified as 25 mins");

        // Clean up test shift
        $this->db->exec("DELETE FROM shifts WHERE id = {$testId}");
        $this->assert(true, "Cleaned up test shift");
    }

    private function testVisualRosterGrid(): void
    {
        $currentYear = (int) date('Y');
        $currentMonth = (int) date('m');

        $grid = $this->model->getRosterGrid($currentYear, $currentMonth);

        $this->assert(isset($grid['year']) && $grid['year'] === $currentYear, "Grid reflects requested year: {$currentYear}");
        $this->assert(isset($grid['month']) && $grid['month'] === $currentMonth, "Grid reflects requested month: {$currentMonth}");
        $this->assert(isset($grid['days_in_month']) && $grid['days_in_month'] >= 28, "Grid computes days in month: {$grid['days_in_month']}");

        $this->assert(is_array($grid['employees']) && count($grid['employees']) >= 1, "Grid loads employees roster rows (count: " . count($grid['employees']) . ")");
        $firstEmp = $grid['employees'][0];
        $this->assert(!empty($firstEmp['assignments']), "Employee has daily assignment map");

        $dateSample = sprintf('%04d-%02d-05', $currentYear, $currentMonth);
        $this->assert(isset($firstEmp['assignments'][$dateSample]), "Employee has assignment on {$dateSample}");
        $this->assert(isset($firstEmp['assignments'][$dateSample]['shift_code']), "Daily slot includes shift code: {$firstEmp['assignments'][$dateSample]['shift_code']}");

        $this->assert(is_array($grid['daily_coverage']) && count($grid['daily_coverage']) === $grid['days_in_month'], "Daily coverage counters match month days");
        $this->assert(isset($grid['kpis']['total_scheduled_hours']), "KPI calculates total scheduled hours: {$grid['kpis']['total_scheduled_hours']} hrs");
    }

    private function testRosterAssignmentAndBulk(): void
    {
        $user = $this->db->query("SELECT id FROM users LIMIT 1")->fetch();
        $this->assert($user !== null, "Active user retrieved for roster assignment");

        $userId = (int) $user['id'];
        $testDate = '2026-11-15';
        $shift = $this->db->query("SELECT id FROM shifts WHERE shift_code = 'MORN-01' LIMIT 1")->fetch();
        $shiftId = (int) $shift['id'];

        // Assign single roster
        $rosterId = $this->model->assignRoster($userId, $testDate, $shiftId, false, 'Single Assignment Test');
        $this->assert($rosterId > 0, "Single roster assigned for {$testDate} (ID: {$rosterId})");

        $check = $this->db->query("SELECT * FROM shift_rosters WHERE user_id = {$userId} AND date = '{$testDate}'")->fetch();
        $this->assert($check !== null && (int)$check['shift_id'] === $shiftId, "Verified DB roster record has shift_id {$shiftId}");

        // Bulk Pattern Assignment
        $assignedSlots = $this->model->bulkAssignPattern([
            'user_ids'         => [$userId],
            'start_date'       => '2026-11-16',
            'end_date'         => '2026-11-20',
            'shift_id'         => $shiftId,
            'include_weekends' => false
        ]);
        $this->assert($assignedSlots >= 5, "Bulk pattern assignment allocated {$assignedSlots} roster slots");

        // Clean up
        $this->db->exec("DELETE FROM shift_rosters WHERE user_id = {$userId} AND date BETWEEN '2026-11-15' AND '2026-11-20'");
    }

    private function testShiftSwappingLifecycle(): void
    {
        $users = $this->db->query("SELECT id FROM users LIMIT 2")->fetchAll(PDO::FETCH_COLUMN);
        if (count($users) < 2) {
            $this->assert(true, "Skipped swap test (need at least 2 users)");
            return;
        }

        $reqId = (int) $users[0];
        $recId = (int) $users[1];
        $swapDate = '2026-12-05';

        $shifts = $this->db->query("SELECT id, shift_code FROM shifts LIMIT 2")->fetchAll();
        $s1 = (int) $shifts[0]['id'];
        $s2 = (int) $shifts[1]['id'];

        // Assign initial rosters for both users
        $r1 = $this->model->assignRoster($reqId, $swapDate, $s1);
        $r2 = $this->model->assignRoster($recId, $swapDate, $s2);

        // 1. Submit Swap Request
        $swapId = $this->model->createSwapRequest($reqId, $recId, $r1, $swapDate, 'Swap request for doctor visit', $s2);
        $this->assert($swapId > 0, "Created shift swap request (ID: {$swapId})");

        $swaps = $this->model->getSwapRequests(null, $reqId);
        $this->assert(count($swaps) >= 1, "Swap request visible in user swap queue");
        $this->assert($swaps[0]['receiver_status'] === 'Pending', "Initial peer status is Pending");

        // 2. Peer Responds -> Accepted
        $peerOk = $this->model->respondToSwap($swapId, $recId, 'accept');
        $this->assert($peerOk === true, "Colleague accepted shift swap request");

        $checkSwap = $this->model->getSwapRequests(null, null);
        $found = null;
        foreach ($checkSwap as $sw) {
            if ((int)$sw['id'] === $swapId) { $found = $sw; break; }
        }
        $this->assert($found !== null && $found['receiver_status'] === 'Accepted', "Peer status transitioned to Accepted");
        $this->assert($found['manager_status'] === 'Pending', "Manager status is Pending sign-off");

        // 3. Manager Review -> Approved
        $mgrOk = $this->model->reviewSwap($swapId, 1, 'Approved', 'Manager approved shift exchange');
        $this->assert($mgrOk === true, "Manager approved shift swap");

        // 4. Verify Roster Schedules were Swapped in shift_rosters!
        $newR1 = $this->db->query("SELECT shift_id, status FROM shift_rosters WHERE id = {$r1}")->fetch();
        $newR2 = $this->db->query("SELECT shift_id, status FROM shift_rosters WHERE id = {$r2}")->fetch();

        $this->assert((int)$newR1['shift_id'] === $s2, "Requester roster exchanged to target shift {$s2}");
        $this->assert((int)$newR2['shift_id'] === $s1, "Receiver roster exchanged to shift {$s1}");
        $this->assert($newR1['status'] === 'Swapped', "Roster status flagged as 'Swapped'");

        // Clean up
        $this->db->exec("DELETE FROM shift_swaps WHERE id = {$swapId}");
        $this->db->exec("DELETE FROM shift_rosters WHERE id IN ({$r1}, {$r2})");
    }

    private function testOvertimeAndNightDifferential(): void
    {
        $user = $this->db->query("SELECT id FROM users LIMIT 1")->fetch();
        $userId = (int) $user['id'];
        $testDate = '2026-11-25';

        $nightShift = $this->db->query("SELECT id, night_allowance_amt, overtime_multiplier FROM shifts WHERE is_night_shift = 1 LIMIT 1")->fetch();
        $this->assert($nightShift !== null, "Night shift master found for differential testing");
        $shiftId = (int) $nightShift['id'];

        // Assign night shift roster
        $this->model->assignRoster($userId, $testDate, $shiftId);

        // Insert attendance: Clock in 22:30, Clock out 08:30 (10 hours total: 8h sched + 2h OT)
        $attStmt = $this->db->prepare("
            INSERT INTO attendances 
            (user_id, date, sign_in, sign_out, stay_time) 
            VALUES (?, ?, '22:30:00', '08:30:00', '10 hrs 00 mins')
        ");
        $attStmt->execute([$userId, $testDate]);
        $attId = (int) $this->db->lastInsertId();

        // Run calculation
        $res = $this->model->calculateOvertimeAndDifferentials($testDate, $testDate);
        $this->assert($res['processed_records'] >= 1, "Calculated overtime & differentials for attendance record");

        $otRec = $this->db->query("SELECT * FROM shift_overtime_records WHERE user_id = {$userId} AND date = '{$testDate}'")->fetch();
        $this->assert($otRec !== null, "shift_overtime_records row created");
        $this->assert((float)$otRec['overtime_hours'] == 2.00, "Calculated 2.00 hours of overtime");
        $this->assert((int)$otRec['is_night_shift'] === 1, "Flagged is_night_shift = 1");
        $this->assert((float)$otRec['night_differential_pay'] === 350.00, "Calculated ₹350 night allowance differential");
        $this->assert((float)$otRec['overtime_pay'] > 0, "Calculated positive overtime pay amount: ₹{$otRec['overtime_pay']}");

        // Clean up
        $this->db->exec("DELETE FROM shift_overtime_records WHERE user_id = {$userId} AND date = '{$testDate}'");
        $this->db->exec("DELETE FROM attendances WHERE id = {$attId}");
        $this->db->exec("DELETE FROM shift_rosters WHERE user_id = {$userId} AND date = '{$testDate}'");
    }

    private function testSyncOvertimeToPayroll(): void
    {
        // Check existing sample overtime record
        $otRec = $this->db->query("SELECT id FROM shift_overtime_records WHERE payroll_synced = 0 LIMIT 1")->fetch();
        if ($otRec) {
            $recId = (int) $otRec['id'];
            $syncRes = $this->model->syncOvertimeToPayroll([$recId], 1);
            $this->assert($syncRes['synced_count'] >= 1, "Overtime record synced to payroll");

            $updated = $this->db->query("SELECT payroll_synced FROM shift_overtime_records WHERE id = {$recId}")->fetch();
            $this->assert((int)$updated['payroll_synced'] === 1, "Record status marked payroll_synced = 1");
        } else {
            $this->assert(true, "Skipped sync test (no unsynced OT records)");
        }
    }

    private function testShiftStats(): void
    {
        $stats = $this->model->getStats();
        $this->assert(isset($stats['active_shifts']) && $stats['active_shifts'] >= 4, "Stats tracks active shifts count: {$stats['active_shifts']}");
        $this->assert(isset($stats['total_roster_slots']) && $stats['total_roster_slots'] > 0, "Stats tracks total roster slots: {$stats['total_roster_slots']}");
        $this->assert(isset($stats['coverage_rate']), "Stats calculates coverage rate percentage: {$stats['coverage_rate']}%");
    }
}
