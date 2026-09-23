<?php
/**
 * Employee Self-Service (ESS) Model
 * Aggregates personalized employee telemetry, punch clock operations, leaves, claims, and hardware inventory
 */
class EssModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Get aggregated personalized dashboard for an employee
     */
    public function getDashboard(int $userId): array
    {
        // 1. Employee Profile
        $userStmt = $this->db->prepare("
            SELECT u.id, u.full_name, u.display_name, u.email, u.phone, u.date_of_birth,
                   u.address, u.designation, u.joining_date, u.status, u.avatar,
                   r.name as role_name, r.slug as role_slug
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.id = :id
        ");
        $userStmt->execute(['id' => $userId]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            throw new Exception("Employee not found with ID $userId");
        }

        $today = date('Y-m-d');
        $currentMonth = date('Y-m');
        $currentYear = (int) date('Y');

        // 2. Today's Attendance & Punch Status
        $attStmt = $this->db->prepare("
            SELECT * FROM attendances 
            WHERE user_id = :id AND date = :today
        ");
        $attStmt->execute(['id' => $userId, 'today' => $today]);
        $todayAttendance = $attStmt->fetch(PDO::FETCH_ASSOC);

        $punchStatus = [
            'is_clocked_in'  => !empty($todayAttendance['sign_in']) && empty($todayAttendance['sign_out']),
            'is_clocked_out' => !empty($todayAttendance['sign_out']),
            'sign_in'        => $todayAttendance['sign_in'] ?? null,
            'sign_out'       => $todayAttendance['sign_out'] ?? null,
            'stay_time'      => $todayAttendance['stay_time'] ?? null,
            'status'         => $todayAttendance['status'] ?? 'Not Clocked In',
            'notes'          => $todayAttendance['notes'] ?? null,
        ];

        // 3. Current Month Attendance Summary
        $monthAttStmt = $this->db->prepare("
            SELECT 
                COUNT(*) as total_logged_days,
                COALESCE(SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END), 0) as present_days,
                COALESCE(SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END), 0) as late_days,
                COALESCE(SUM(CASE WHEN status = 'Half Day' THEN 1 ELSE 0 END), 0) as half_days,
                COALESCE(SUM(CASE WHEN status = 'On Leave' THEN 1 ELSE 0 END), 0) as leave_days
            FROM attendances
            WHERE user_id = :id AND date LIKE :monthPattern
        ");
        $monthAttStmt->execute(['id' => $userId, 'monthPattern' => "$currentMonth%"]);
        $attendanceStats = $monthAttStmt->fetch(PDO::FETCH_ASSOC) ?: [
            'total_logged_days' => 0,
            'present_days' => 0,
            'late_days' => 0,
            'half_days' => 0,
            'leave_days' => 0,
        ];
        $attendanceStats['present_days'] = (int)($attendanceStats['present_days'] ?? 0);
        $attendanceStats['late_days'] = (int)($attendanceStats['late_days'] ?? 0);
        $attendanceStats['half_days'] = (int)($attendanceStats['half_days'] ?? 0);
        $attendanceStats['leave_days'] = (int)($attendanceStats['leave_days'] ?? 0);
        $attendanceStats['total_logged_days'] = (int)($attendanceStats['total_logged_days'] ?? 0);

        // 4. Leave Balances for current year
        $lbStmt = $this->db->prepare("
            SELECT lb.*, lt.name as leave_name, lt.code as leave_code, lt.color, lt.is_paid
            FROM leave_balances lb
            JOIN leave_types lt ON lb.leave_type_id = lt.id
            WHERE lb.user_id = :id AND lb.year = :year
            ORDER BY lt.id ASC
        ");
        $lbStmt->execute(['id' => $userId, 'year' => $currentYear]);
        $leaveBalances = $lbStmt->fetchAll(PDO::FETCH_ASSOC);

        $totalLeaveRemaining = array_sum(array_column($leaveBalances, 'remaining_days'));
        $totalLeaveUsed = array_sum(array_column($leaveBalances, 'used_days'));

        // 5. Assigned Hardware Assets
        $assetStmt = $this->db->prepare("
            SELECT a.id, a.name, a.asset_tag, a.serial_number, a.brand, a.model,
                   a.condition, a.status, a.purchase_date, a.notes,
                   ac.name as category_name, ac.icon as category_icon
            FROM assets a
            LEFT JOIN asset_categories ac ON a.category_id = ac.id
            WHERE a.current_user_id = :id
            ORDER BY a.created_at DESC
        ");
        $assetStmt->execute(['id' => $userId]);
        $assignedAssets = $assetStmt->fetchAll(PDO::FETCH_ASSOC);

        // 6. Recent Payslips
        $salStmt = $this->db->prepare("
            SELECT id, salary_date, gross_salary, total_deductions, net_salary,
                   total_salary, currency, status, created_at
            FROM salaries
            WHERE user_id = :id
            ORDER BY salary_date DESC
            LIMIT 6
        ");
        $salStmt->execute(['id' => $userId]);
        $payslips = $salStmt->fetchAll(PDO::FETCH_ASSOC);

        // 7. Recent Leave Requests
        $lrStmt = $this->db->prepare("
            SELECT lr.*, lt.name as leave_name, lt.code as leave_code, lt.color,
                   u.full_name as approver_name
            FROM leave_requests lr
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            LEFT JOIN users u ON lr.approver_id = u.id
            WHERE lr.user_id = :id
            ORDER BY lr.created_at DESC
            LIMIT 5
        ");
        $lrStmt->execute(['id' => $userId]);
        $leaveRequests = $lrStmt->fetchAll(PDO::FETCH_ASSOC);

        // 8. Recent Expense Claims
        $claimStmt = $this->db->prepare("
            SELECT ec.*, u.full_name as approver_name
            FROM expense_claims ec
            LEFT JOIN users u ON ec.approver_id = u.id
            WHERE ec.user_id = :id
            ORDER BY ec.created_at DESC
            LIMIT 5
        ");
        $claimStmt->execute(['id' => $userId]);
        $claims = $claimStmt->fetchAll(PDO::FETCH_ASSOC);

        // 9. Active Onboarding / Lifecycle Workflow
        $wfStmt = $this->db->prepare("
            SELECT * FROM lifecycle_workflows
            WHERE user_id = :id AND type = 'Onboarding' AND status != 'Completed'
            ORDER BY created_at DESC LIMIT 1
        ");
        $wfStmt->execute(['id' => $userId]);
        $activeWorkflow = $wfStmt->fetch(PDO::FETCH_ASSOC);
        $workflowTasks = [];

        if ($activeWorkflow) {
            $taskStmt = $this->db->prepare("
                SELECT * FROM lifecycle_tasks
                WHERE workflow_id = :wid
                ORDER BY due_date ASC, id ASC
            ");
            $taskStmt->execute(['wid' => $activeWorkflow['id']]);
            $workflowTasks = $taskStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        return [
            'user'             => $user,
            'punch_status'     => $punchStatus,
            'attendance_stats' => $attendanceStats,
            'leave_balances'   => $leaveBalances,
            'total_leave_rem'  => (float) $totalLeaveRemaining,
            'total_leave_used' => (float) $totalLeaveUsed,
            'assigned_assets'  => $assignedAssets,
            'payslips'         => $payslips,
            'leave_requests'   => $leaveRequests,
            'expense_claims'   => $claims,
            'onboarding'       => $activeWorkflow ? [
                'workflow' => $activeWorkflow,
                'tasks'    => $workflowTasks
            ] : null,
        ];
    }

    /**
     * Handle Clock In or Clock Out punch
     */
    public function clockInOut(int $userId, string $notes = ''): array
    {
        $today = date('Y-m-d');
        $nowTime = date('H:i:s');

        // Check if attendance record already exists today
        $stmt = $this->db->prepare("SELECT * FROM attendances WHERE user_id = :uid AND date = :today");
        $stmt->execute(['uid' => $userId, 'today' => $today]);
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$record) {
            // CLOCK IN
            // Standard shift start is 09:30 AM
            $status = ($nowTime > '09:30:00') ? 'Late' : 'Present';
            $ins = $this->db->prepare("
                INSERT INTO attendances (user_id, date, sign_in, status, notes)
                VALUES (:uid, :today, :sign_in, :status, :notes)
            ");
            $ins->execute([
                'uid'     => $userId,
                'today'   => $today,
                'sign_in' => $nowTime,
                'status'  => $status,
                'notes'   => !empty($notes) ? $notes : ($status === 'Late' ? 'Late arrival recorded' : 'On-time morning check-in')
            ]);

            return [
                'action'     => 'clock_in',
                'sign_in'    => $nowTime,
                'status'     => $status,
                'message'    => "Successfully clocked in at $nowTime (" . ($status === 'Late' ? 'Flagged as Late' : 'Present') . ")"
            ];
        }

        if (empty($record['sign_out'])) {
            // CLOCK OUT
            $signInTime = strtotime($record['sign_in']);
            $signOutTime = strtotime($nowTime);
            $diffSeconds = max(0, $signOutTime - $signInTime);

            $hours = floor($diffSeconds / 3600);
            $minutes = floor(($diffSeconds % 3600) / 60);
            $stayTime = sprintf("%02d hrs %02d mins", $hours, $minutes);

            $upd = $this->db->prepare("
                UPDATE attendances 
                SET sign_out = :sign_out, stay_time = :stay_time, updated_at = NOW()
                WHERE id = :id
            ");
            $upd->execute([
                'sign_out'  => $nowTime,
                'stay_time' => $stayTime,
                'id'        => $record['id']
            ]);

            return [
                'action'    => 'clock_out',
                'sign_in'   => $record['sign_in'],
                'sign_out'  => $nowTime,
                'stay_time' => $stayTime,
                'message'   => "Successfully clocked out at $nowTime (Total stay: $stayTime)"
            ];
        }

        return [
            'action'    => 'already_completed',
            'sign_in'   => $record['sign_in'],
            'sign_out'  => $record['sign_out'],
            'stay_time' => $record['stay_time'],
            'message'   => "Shift for today is already completed (Clocked out at {$record['sign_out']})"
        ];
    }

    /**
     * Submit a leave application from ESS
     */
    public function applyLeave(array $data): array
    {
        $userId = (int) ($data['user_id'] ?? 0);
        $leaveTypeId = (int) ($data['leave_type_id'] ?? 0);
        $startDate = $data['start_date'] ?? '';
        $endDate = $data['end_date'] ?? '';
        $totalDays = (float) ($data['total_days'] ?? 1.0);
        $isHalfDay = !empty($data['is_half_day']) ? 1 : 0;
        $reason = trim($data['reason'] ?? '');

        if (!$userId || !$leaveTypeId || !$startDate || !$endDate || !$reason) {
            throw new Exception("Missing required fields: user_id, leave_type_id, start_date, end_date, and reason are required.");
        }

        // Verify balance
        $year = (int) date('Y', strtotime($startDate));
        $balStmt = $this->db->prepare("
            SELECT * FROM leave_balances 
            WHERE user_id = :uid AND leave_type_id = :ltid AND year = :yr
        ");
        $balStmt->execute(['uid' => $userId, 'ltid' => $leaveTypeId, 'yr' => $year]);
        $balance = $balStmt->fetch(PDO::FETCH_ASSOC);

        if ($balance && ($balance['remaining_days'] < $totalDays)) {
            throw new Exception("Insufficient leave balance. Remaining: {$balance['remaining_days']} days, Requested: $totalDays days.");
        }

        $ins = $this->db->prepare("
            INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, total_days, is_half_day, reason, status)
            VALUES (:uid, :ltid, :start, :end, :days, :half, :reason, 'Pending')
        ");
        $ins->execute([
            'uid'    => $userId,
            'ltid'   => $leaveTypeId,
            'start'  => $startDate,
            'end'    => $endDate,
            'days'   => $totalDays,
            'half'   => $isHalfDay,
            'reason' => $reason
        ]);
        $leaveId = (int) $this->db->lastInsertId();

        // Increment pending days in balance
        if ($balance) {
            $this->db->prepare("
                UPDATE leave_balances 
                SET pending_days = pending_days + :days
                WHERE id = :id
            ")->execute(['days' => $totalDays, 'id' => $balance['id']]);
        }

        return [
            'id'      => $leaveId,
            'status'  => 'Pending',
            'message' => 'Leave application submitted successfully and sent to manager for approval.'
        ];
    }

    /**
     * Submit an expense reimbursement claim from ESS
     */
    public function submitClaim(array $data): array
    {
        $userId = (int) ($data['user_id'] ?? 0);
        $title = trim($data['title'] ?? '');
        $category = $data['category'] ?? 'Other';
        $amount = (float) ($data['amount'] ?? 0.0);
        $claimDate = $data['claim_date'] ?? date('Y-m-d');
        $description = trim($data['description'] ?? '');
        $receiptUrl = $data['receipt_url'] ?? null;

        if (!$userId || !$title || $amount <= 0) {
            throw new Exception("Missing required fields: valid user_id, title, and amount greater than 0 are required.");
        }

        // Auto-generate unique claim number
        $claimNumber = 'CLM-' . date('Y') . '-' . strtoupper(substr(uniqid(), -5));

        $ins = $this->db->prepare("
            INSERT INTO expense_claims (claim_number, user_id, title, category, amount, claim_date, description, receipt_url, status)
            VALUES (:num, :uid, :title, :cat, :amt, :cdate, :descr, :receipt, 'Pending')
        ");
        $ins->execute([
            'num'     => $claimNumber,
            'uid'     => $userId,
            'title'   => $title,
            'cat'     => $category,
            'amt'     => $amount,
            'cdate'   => $claimDate,
            'descr'   => $description,
            'receipt' => $receiptUrl
        ]);

        return [
            'id'           => (int) $this->db->lastInsertId(),
            'claim_number' => $claimNumber,
            'status'       => 'Pending',
            'message'      => "Expense claim $claimNumber submitted successfully for review."
        ];
    }

    /**
     * Get itemized details of a salary slip
     */
    public function getSalarySlipDetails(int $salaryId, int $userId): array
    {
        $stmt = $this->db->prepare("
            SELECT s.*, u.full_name, u.email, u.designation, u.joining_date
            FROM salaries s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = :sid AND s.user_id = :uid
        ");
        $stmt->execute(['sid' => $salaryId, 'uid' => $userId]);
        $salary = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$salary) {
            throw new Exception("Salary record not found or access denied.");
        }

        $itemsStmt = $this->db->prepare("
            SELECT * FROM salary_items WHERE salary_id = :sid ORDER BY type ASC, amount DESC
        ");
        $itemsStmt->execute(['sid' => $salaryId]);
        $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

        $earnings = array_values(array_filter($items, fn($i) => $i['type'] === 'Earning'));
        $deductions = array_values(array_filter($items, fn($i) => $i['type'] === 'Deduction'));

        return [
            'salary'     => $salary,
            'earnings'   => $earnings,
            'deductions' => $deductions
        ];
    }
}
