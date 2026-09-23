<?php
/**
 * Report Model
 * Generates audit-ready reports:
 * 1. Monthly Attendance Muster Roll (Form T / Day-by-Day attendance matrix)
 * 2. Payroll Disbursal Registers (Multi-tier financial ledger)
 * 3. Leave Liability & Accrual Registers (Actuarial encashment liability)
 */
class ReportModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Generate Monthly Attendance Muster Roll
     */
    public function getMusterRoll(int $year, int $month, array $filters = []): array
    {
        // 1. Calculate month details
        $daysInMonth = (int)date('t', strtotime(sprintf('%04d-%02d-01', $year, $month)));
        $startDate = sprintf('%04d-%02d-01', $year, $month);
        $endDate = sprintf('%04d-%02d-%02d', $year, $month, $daysInMonth);
        $todayStr = date('Y-m-d');

        // 2. Fetch statutory holidays for this month
        $holidaysStmt = $this->db->prepare("
            SELECT holiday_date, name, type 
            FROM company_holidays 
            WHERE holiday_date BETWEEN ? AND ?
        ");
        $holidaysStmt->execute([$startDate, $endDate]);
        $holidaysRaw = $holidaysStmt->fetchAll(PDO::FETCH_ASSOC);
        $holidaysMap = [];
        foreach ($holidaysRaw as $h) {
            $holidaysMap[$h['holiday_date']] = $h['name'];
        }

        // 3. Build day calendar headers
        $daysMeta = [];
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $curDate = sprintf('%04d-%02d-%02d', $year, $month, $d);
            $dayOfWeek = (int)date('N', strtotime($curDate)); // 1 (Mon) to 7 (Sun)
            $isWeekend = ($dayOfWeek === 6 || $dayOfWeek === 7);
            $holidayName = $holidaysMap[$curDate] ?? null;

            $daysMeta[] = [
                'day'          => $d,
                'date'         => $curDate,
                'day_name'     => date('D', strtotime($curDate)),
                'is_weekend'   => $isWeekend,
                'holiday_name' => $holidayName,
                'is_past'      => ($curDate <= $todayStr),
                'is_today'     => ($curDate === $todayStr)
            ];
        }

        // 4. Query staff members
        $userWhere = ["u.status != 'Suspend'"];
        $userParams = [];

        if (!empty($filters['designation'])) {
            $userWhere[] = "u.designation = :designation";
            $userParams['designation'] = $filters['designation'];
        }

        if (!empty($filters['search'])) {
            $userWhere[] = "(u.full_name LIKE :search1 OR u.designation LIKE :search2 OR u.email LIKE :search3)";
            $userParams['search1'] = '%' . $filters['search'] . '%';
            $userParams['search2'] = '%' . $filters['search'] . '%';
            $userParams['search3'] = '%' . $filters['search'] . '%';
        }

        $userSql = "
            SELECT u.id, u.full_name, u.email, u.designation, u.status, u.avatar, u.joining_date
            FROM users u
            WHERE " . implode(' AND ', $userWhere) . "
            ORDER BY u.full_name ASC
        ";
        $userStmt = $this->db->prepare($userSql);
        $userStmt->execute($userParams);
        $users = $userStmt->fetchAll(PDO::FETCH_ASSOC);

        // 5. Query attendance punches for this month
        $attStmt = $this->db->prepare("
            SELECT user_id, date, status, stay_time, sign_in, sign_out
            FROM attendances
            WHERE date BETWEEN ? AND ?
        ");
        $attStmt->execute([$startDate, $endDate]);
        $attendancesRaw = $attStmt->fetchAll(PDO::FETCH_ASSOC);
        $attMap = [];
        foreach ($attendancesRaw as $a) {
            $key = $a['user_id'] . '_' . $a['date'];
            $attMap[$key] = $a;
        }

        // 6. Query approved leaves for this month
        $leaveStmt = $this->db->prepare("
            SELECT lr.user_id, lr.start_date, lr.end_date, lt.code as type_code, lt.name as type_name
            FROM leave_requests lr
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            WHERE lr.status = 'Approved' 
              AND (lr.start_date <= ? AND lr.end_date >= ?)
        ");
        $leaveStmt->execute([$endDate, $startDate]);
        $leavesRaw = $leaveStmt->fetchAll(PDO::FETCH_ASSOC);

        $leavesUserMap = [];
        foreach ($leavesRaw as $lv) {
            $uId = $lv['user_id'];
            $pStart = max($startDate, $lv['start_date']);
            $pEnd = min($endDate, $lv['end_date']);
            $period = new DatePeriod(
                new DateTime($pStart),
                new DateInterval('P1D'),
                (new DateTime($pEnd))->modify('+1 day')
            );
            foreach ($period as $dt) {
                $dStr = $dt->format('Y-m-d');
                $leavesUserMap[$uId . '_' . $dStr] = $lv['type_code'];
            }
        }

        // 7. Aggregate per employee matrix
        $rows = [];
        $totalPresentOverall = 0;
        $totalAbsentOverall = 0;
        $totalLeaveOverall = 0;
        $totalAttendancePctSum = 0;

        foreach ($users as $user) {
            $uId = (int)$user['id'];
            $empPunches = [];
            $presentCount = 0;
            $halfDayCount = 0;
            $absentCount = 0;
            $leaveCount = 0;
            $holidayCount = 0;
            $weekendCount = 0;
            $workingDays = 0;

            foreach ($daysMeta as $dm) {
                $cDate = $dm['date'];
                $isWeekend = $dm['is_weekend'];
                $isHoliday = !empty($dm['holiday_name']);
                $key = $uId . '_' . $cDate;

                $statusCode = '-';
                $statusDetail = 'Upcoming';

                if (isset($attMap[$key])) {
                    $att = $attMap[$key];
                    if ($att['status'] === 'Present') {
                        $statusCode = 'P';
                        $statusDetail = 'Present (' . ($att['stay_time'] ?: 'Standard') . ')';
                        $presentCount++;
                    } elseif ($att['status'] === 'Half Day') {
                        $statusCode = 'HD';
                        $statusDetail = 'Half Day';
                        $halfDayCount++;
                    } elseif ($att['status'] === 'On Leave') {
                        $statusCode = 'L';
                        $statusDetail = 'Leave';
                        $leaveCount++;
                    } else {
                        $statusCode = 'A';
                        $statusDetail = 'Absent';
                        $absentCount++;
                    }
                    if (!$isWeekend && !$isHoliday) {
                        $workingDays++;
                    }
                } elseif (isset($leavesUserMap[$key])) {
                    $statusCode = 'L';
                    $statusDetail = 'Leave (' . $leavesUserMap[$key] . ')';
                    $leaveCount++;
                    if (!$isWeekend && !$isHoliday) {
                        $workingDays++;
                    }
                } elseif ($isHoliday) {
                    $statusCode = 'H';
                    $statusDetail = 'Holiday: ' . $dm['holiday_name'];
                    $holidayCount++;
                } elseif ($isWeekend) {
                    $statusCode = 'WO';
                    $statusDetail = 'Week Off';
                    $weekendCount++;
                } elseif ($dm['is_past']) {
                    // Past date without punch or leave is counted as Absent (LOP)
                    $statusCode = 'A';
                    $statusDetail = 'Absent (LOP)';
                    $absentCount++;
                    $workingDays++;
                } else {
                    $statusCode = '-';
                    $statusDetail = 'Upcoming';
                }

                $empPunches[$dm['day']] = [
                    'status' => $statusCode,
                    'detail' => $statusDetail
                ];
            }

            // Effective present days counting half days as 0.5
            $effectivePresent = $presentCount + ($halfDayCount * 0.5);
            $effectiveWorking = max(1, $workingDays);
            $attendanceRate = round(($effectivePresent / $effectiveWorking) * 100, 1);
            if ($attendanceRate > 100) $attendanceRate = 100.0;

            $totalPresentOverall += $effectivePresent;
            $totalAbsentOverall += $absentCount;
            $totalLeaveOverall += $leaveCount;
            $totalAttendancePctSum += $attendanceRate;

            $rows[] = [
                'employee' => [
                    'id'           => $uId,
                    'name'         => $user['full_name'],
                    'code'         => 'EMP-' . str_pad((string)$uId, 4, '0', STR_PAD_LEFT),
                    'email'        => $user['email'],
                    'designation'  => $user['designation'],
                    'joining_date' => $user['joining_date'],
                    'avatar'       => $user['avatar']
                ],
                'punches'           => $empPunches,
                'present_days'      => $presentCount,
                'half_days'         => $halfDayCount,
                'leave_days'        => $leaveCount,
                'absent_days'       => $absentCount,
                'weekend_days'      => $weekendCount,
                'holiday_days'      => $holidayCount,
                'working_days'      => $workingDays,
                'attendance_rate'   => $attendanceRate
            ];
        }

        $userCount = max(1, count($users));
        $avgAttendanceRate = round($totalAttendancePctSum / $userCount, 1);

        return [
            'meta' => [
                'year'          => $year,
                'month'         => $month,
                'month_name'    => date('F', mktime(0, 0, 0, $month, 10)),
                'days_in_month' => $daysInMonth,
                'days_meta'     => $daysMeta
            ],
            'kpis' => [
                'total_employees'      => count($users),
                'avg_attendance_rate'  => $avgAttendanceRate,
                'total_mandays'        => $totalPresentOverall,
                'total_absent_lop'     => $totalAbsentOverall,
                'total_leaves_taken'   => $totalLeaveOverall
            ],
            'rows' => $rows
        ];
    }

    /**
     * Generate Payroll Disbursal Register
     */
    public function getPayrollDisbursalRegister(int $year, int $month, array $filters = []): array
    {
        $startDate = sprintf('%04d-%02d-01', $year, $month);
        $endDate = sprintf('%04d-%02d-%02d', $year, $month, (int)date('t', strtotime($startDate)));

        // Base where condition
        $where = ["s.salary_date BETWEEN :start_date AND :end_date"];
        $params = [
            'start_date' => $startDate,
            'end_date'   => $endDate
        ];

        if (!empty($filters['tier'])) {
            $where[] = "s.employment_type = :tier";
            $params['tier'] = $filters['tier'];
        }

        if (!empty($filters['status'])) {
            $where[] = "s.status = :status";
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['search'])) {
            $where[] = "(u.full_name LIKE :search1 OR u.designation LIKE :search2 OR sp.transaction_ref LIKE :search3)";
            $params['search1'] = '%' . $filters['search'] . '%';
            $params['search2'] = '%' . $filters['search'] . '%';
            $params['search3'] = '%' . $filters['search'] . '%';
        }

        $sql = "
            SELECT 
                s.*,
                u.full_name as member_name,
                u.email as member_email,
                u.designation,
                u.avatar,
                sp.id as payment_id,
                sp.amount_paid,
                sp.payment_date,
                sp.payment_method,
                sp.transaction_ref
            FROM salaries s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN salary_payments sp ON sp.salary_id = s.id
            WHERE " . implode(' AND ', $where) . "
            ORDER BY s.salary_date DESC, u.full_name ASC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $salaries = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch itemized line items for all salaries retrieved
        $rows = [];
        $totalGross = 0;
        $totalDeductions = 0;
        $totalNet = 0;
        $totalPaid = 0;
        $totalPending = 0;

        foreach ($salaries as $sal) {
            $salId = (int)$sal['id'];
            $itemsStmt = $this->db->prepare("
                SELECT 
                    si.id, 
                    si.type, 
                    si.component_name, 
                    si.category, 
                    si.amount, 
                    COALESCE(pc.code, '') as component_code
                FROM salary_items si
                LEFT JOIN payroll_components pc ON si.component_id = pc.id
                WHERE si.salary_id = ?
                ORDER BY si.type ASC, si.id ASC
            ");
            $itemsStmt->execute([$salId]);
            $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

            $earningsList = [];
            $deductionsList = [];
            $basicAmount = 0;
            $hraAmount = 0;
            $medicalAllowance = 0;
            $otherAllowances = 0;
            $pfDeduction = 0;
            $taxDeduction = 0;
            $insuranceDeduction = 0;
            $lopDeduction = 0;

            foreach ($items as $item) {
                $amt = (float)$item['amount'];
                $code = strtoupper($item['component_code']);
                $name = strtolower($item['component_name']);

                if ($item['type'] === 'Earning') {
                    $earningsList[] = $item;
                    if (in_array($code, ['BASIC', 'STIPEND']) || strpos($name, 'basic') !== false || strpos($name, 'stipend') !== false) {
                        $basicAmount += $amt;
                    } elseif ($code === 'HRA' || strpos($name, 'house') !== false) {
                        $hraAmount += $amt;
                    } elseif ($code === 'MEDICAL' || strpos($name, 'medical') !== false) {
                        $medicalAllowance += $amt;
                    } else {
                        $otherAllowances += $amt;
                    }
                } else {
                    $deductionsList[] = $item;
                    if ($code === 'PF' || strpos($name, 'provident') !== false) {
                        $pfDeduction += $amt;
                    } elseif ($code === 'TDS' || strpos($name, 'tax') !== false) {
                        $taxDeduction += $amt;
                    } elseif ($code === 'INSURANCE' || strpos($name, 'insurance') !== false) {
                        $insuranceDeduction += $amt;
                    } elseif ($code === 'LOP' || strpos($name, 'lop') !== false || strpos($name, 'leave') !== false) {
                        $lopDeduction += $amt;
                    }
                }
            }

            $gross = (float)($sal['gross_salary'] ?: $sal['total_salary']);
            $deduct = (float)($sal['total_deductions'] ?: ($gross - (float)$sal['net_salary']));
            $net = (float)($sal['net_salary'] ?: $sal['total_salary']);

            $totalGross += $gross;
            $totalDeductions += $deduct;
            $totalNet += $net;

            if ($sal['status'] === 'Paid') {
                $totalPaid += $net;
            } else {
                $totalPending += $net;
            }

            $rows[] = [
                'id'                 => $salId,
                'user_id'            => (int)$sal['user_id'],
                'employee_name'      => $sal['member_name'],
                'employee_code'      => 'EMP-' . str_pad((string)$sal['user_id'], 4, '0', STR_PAD_LEFT),
                'designation'        => $sal['designation'],
                'avatar'             => $sal['avatar'],
                'salary_date'        => $sal['salary_date'],
                'employment_type'    => $sal['employment_type'] ?: 'Permanent',
                'working_days'       => (int)$sal['working_days'],
                'basic_amount'       => $basicAmount ?: $gross,
                'hra_amount'         => $hraAmount,
                'medical_allowance'  => $medicalAllowance,
                'other_allowances'   => $otherAllowances,
                'gross_salary'       => $gross,
                'pf_deduction'       => $pfDeduction,
                'tax_deduction'      => $taxDeduction,
                'insurance_deduction'=> $insuranceDeduction,
                'lop_deduction'      => $lopDeduction,
                'total_deductions'   => $deduct,
                'net_salary'         => $net,
                'status'             => $sal['status'],
                'payment_method'     => $sal['payment_method'] ?: 'Bank Transfer',
                'transaction_ref'    => $sal['transaction_ref'] ?: 'N/A',
                'payment_date'       => $sal['payment_date'],
                'earnings_items'     => $earningsList,
                'deductions_items'   => $deductionsList
            ];
        }

        $totalCount = count($rows);
        $paidCount = count(array_filter($rows, fn($r) => $r['status'] === 'Paid'));
        $progressPct = $totalCount > 0 ? round(($paidCount / $totalCount) * 100, 1) : 0;

        return [
            'meta' => [
                'year'       => $year,
                'month'      => $month,
                'month_name' => date('F', mktime(0, 0, 0, $month, 10)),
                'records'    => $totalCount
            ],
            'kpis' => [
                'total_gross'        => $totalGross,
                'total_deductions'   => $totalDeductions,
                'net_disbursed'      => $totalPaid,
                'pending_disbursal'  => $totalPending,
                'progress_rate'      => $progressPct
            ],
            'rows' => $rows
        ];
    }

    /**
     * Generate Leave Liability & Accrual Register
     */
    public function getLeaveLiabilityReport(int $year, array $filters = []): array
    {
        $userWhere = ["u.status != 'Suspend'"];
        $userParams = [];

        if (!empty($filters['designation'])) {
            $userWhere[] = "u.designation = :designation";
            $userParams['designation'] = $filters['designation'];
        }

        if (!empty($filters['search'])) {
            $userWhere[] = "(u.full_name LIKE :search1 OR u.designation LIKE :search2 OR u.email LIKE :search3)";
            $userParams['search1'] = '%' . $filters['search'] . '%';
            $userParams['search2'] = '%' . $filters['search'] . '%';
            $userParams['search3'] = '%' . $filters['search'] . '%';
        }

        $sql = "
            SELECT 
                u.id, 
                u.full_name, 
                u.email, 
                u.designation, 
                u.joining_date, 
                u.status,
                ess.employment_type,
                COALESCE(ess.base_salary, 3500.00) as base_salary
            FROM users u
            LEFT JOIN employee_salary_structures ess ON ess.user_id = u.id
            WHERE " . implode(' AND ', $userWhere) . "
            ORDER BY u.full_name ASC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($userParams);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $rows = [];
        $totalAccruedReserve = 0;
        $totalDaysConsumed = 0;
        $totalEncashableDays = 0;
        $totalLiabilityDollars = 0;

        foreach ($users as $u) {
            $uId = (int)$u['id'];
            $baseSalary = (float)$u['base_salary'];
            $dailyRate = round($baseSalary / 30, 2);

            // Fetch leave balances for this user
            $balStmt = $this->db->prepare("
                SELECT 
                    b.total_days, 
                    b.used_days, 
                    t.code as type_code, 
                    t.name as type_name, 
                    t.is_paid
                FROM leave_balances b
                JOIN leave_types t ON b.leave_type_id = t.id
                WHERE b.user_id = ? AND b.year = ?
            ");
            $balStmt->execute([$uId, $year]);
            $balances = $balStmt->fetchAll(PDO::FETCH_ASSOC);

            $clQuota = 0; $clUsed = 0;
            $slQuota = 0; $slUsed = 0;
            $plQuota = 0; $plUsed = 0;

            foreach ($balances as $b) {
                $code = strtoupper($b['type_code']);
                $quota = (float)$b['total_days'];
                $used = (float)$b['used_days'];

                if ($code === 'CL') {
                    $clQuota = $quota; $clUsed = $used;
                } elseif ($code === 'SL') {
                    $slQuota = $quota; $slUsed = $used;
                } elseif ($code === 'PL') {
                    $plQuota = $quota; $plUsed = $used;
                }
            }

            // Defaults if balances table hasn't initialized for user yet
            if (empty($balances)) {
                $clQuota = 12; $clUsed = 2;
                $slQuota = 10; $slUsed = 1;
                $plQuota = 15; $plUsed = 3;
            }

            $clAvailable = max(0, $clQuota - $clUsed);
            $slAvailable = max(0, $slQuota - $slUsed);
            $plAvailable = max(0, $plQuota - $plUsed);

            $totalQuota = $clQuota + $slQuota + $plQuota;
            $totalUsed = $clUsed + $slUsed + $plUsed;
            $totalAvailable = $clAvailable + $slAvailable + $plAvailable;

            // Encashable leaves (Paid / Privilege Leaves are legally encashable)
            $encashableDays = $plAvailable;
            $financialLiability = round($encashableDays * $dailyRate, 2);

            $totalAccruedReserve += $totalAvailable;
            $totalDaysConsumed += $totalUsed;
            $totalEncashableDays += $encashableDays;
            $totalLiabilityDollars += $financialLiability;

            $rows[] = [
                'user_id'             => $uId,
                'employee_name'       => $u['full_name'],
                'employee_code'       => 'EMP-' . str_pad((string)$uId, 4, '0', STR_PAD_LEFT),
                'email'               => $u['email'],
                'designation'         => $u['designation'],
                'employment_type'     => $u['employment_type'] ?: 'Permanent',
                'monthly_salary'      => $baseSalary,
                'daily_rate'          => $dailyRate,
                'cl_quota'            => $clQuota,
                'cl_used'             => $clUsed,
                'cl_available'        => $clAvailable,
                'sl_quota'            => $slQuota,
                'sl_used'             => $slUsed,
                'sl_available'        => $slAvailable,
                'pl_quota'            => $plQuota,
                'pl_used'             => $plUsed,
                'pl_available'        => $plAvailable,
                'total_quota'         => $totalQuota,
                'total_used'          => $totalUsed,
                'total_available'     => $totalAvailable,
                'encashable_days'     => $encashableDays,
                'financial_liability' => $financialLiability
            ];
        }

        return [
            'meta' => [
                'year'    => $year,
                'records' => count($rows)
            ],
            'kpis' => [
                'total_leave_reserve'       => $totalAccruedReserve,
                'total_days_consumed'       => $totalDaysConsumed,
                'total_encashable_days'     => $totalEncashableDays,
                'total_financial_liability' => round($totalLiabilityDollars, 2)
            ],
            'rows' => $rows
        ];
    }

    /**
     * Generate RFC 4180 compliant CSV string from report data
     */
    public function generateCsv(string $type, array $reportData): string
    {
        $fp = fopen('php://temp', 'r+');

        if ($type === 'muster-roll') {
            $meta = $reportData['meta'];
            fputcsv($fp, ['Acme Global HRMS - Monthly Attendance Muster Roll']);
            fputcsv($fp, ['Pay Period:', $meta['month_name'] . ' ' . $meta['year']]);
            fputcsv($fp, ['Generated On:', date('Y-m-d H:i:s')]);
            fputcsv($fp, []); // blank line

            // Header line: Emp Info + Day 1..N + Summary Totals
            $header = ['Emp Code', 'Employee Name', 'Designation'];
            foreach ($meta['days_meta'] as $dm) {
                $header[] = $dm['day'] . ' (' . $dm['day_name'] . ')';
            }
            $header[] = 'Present';
            $header[] = 'Half Days';
            $header[] = 'Leave';
            $header[] = 'Absent (LOP)';
            $header[] = 'Week Off';
            $header[] = 'Holidays';
            $header[] = 'Working Days';
            $header[] = 'Attendance Rate %';
            fputcsv($fp, $header);

            // Data rows
            foreach ($reportData['rows'] as $r) {
                $row = [
                    $r['employee']['code'],
                    $r['employee']['name'],
                    $r['employee']['designation']
                ];
                foreach ($meta['days_meta'] as $dm) {
                    $p = $r['punches'][$dm['day']]['status'] ?? '-';
                    $row[] = $p;
                }
                $row[] = $r['present_days'];
                $row[] = $r['half_days'];
                $row[] = $r['leave_days'];
                $row[] = $r['absent_days'];
                $row[] = $r['weekend_days'];
                $row[] = $r['holiday_days'];
                $row[] = $r['working_days'];
                $row[] = $r['attendance_rate'] . '%';
                fputcsv($fp, $row);
            }
        } elseif ($type === 'payroll-register') {
            $meta = $reportData['meta'];
            fputcsv($fp, ['Acme Global HRMS - Payroll Disbursal Register']);
            fputcsv($fp, ['Pay Period:', $meta['month_name'] . ' ' . $meta['year']]);
            fputcsv($fp, ['Generated On:', date('Y-m-d H:i:s')]);
            fputcsv($fp, []);

            $header = [
                'Emp Code', 'Employee Name', 'Designation', 'Tier', 'Work Days',
                'Basic/Stipend', 'HRA', 'Medical', 'Other Allowances', 'Gross Pay',
                'PF / EPF', 'TDS / Tax', 'Insurance', 'LOP Deductions', 'Total Deductions',
                'Net Salary', 'Payment Status', 'Payment Method', 'Transaction Ref', 'Payment Date'
            ];
            fputcsv($fp, $header);

            foreach ($reportData['rows'] as $r) {
                fputcsv($fp, [
                    $r['employee_code'],
                    $r['employee_name'],
                    $r['designation'],
                    $r['employment_type'],
                    $r['working_days'],
                    number_format($r['basic_amount'], 2),
                    number_format($r['hra_amount'], 2),
                    number_format($r['medical_allowance'], 2),
                    number_format($r['other_allowances'], 2),
                    number_format($r['gross_salary'], 2),
                    number_format($r['pf_deduction'], 2),
                    number_format($r['tax_deduction'], 2),
                    number_format($r['insurance_deduction'], 2),
                    number_format($r['lop_deduction'], 2),
                    number_format($r['total_deductions'], 2),
                    number_format($r['net_salary'], 2),
                    $r['status'],
                    $r['payment_method'],
                    $r['transaction_ref'],
                    $r['payment_date'] ?: 'Pending'
                ]);
            }
        } elseif ($type === 'leave-liability') {
            $meta = $reportData['meta'];
            fputcsv($fp, ['Acme Global HRMS - Leave Liability & Accrual Balance Register']);
            fputcsv($fp, ['Valuation Year:', $meta['year']]);
            fputcsv($fp, ['Generated On:', date('Y-m-d H:i:s')]);
            fputcsv($fp, []);

            $header = [
                'Emp Code', 'Employee Name', 'Designation', 'Tier',
                'Monthly Base Pay', 'Daily Rate',
                'CL Quota', 'CL Used', 'CL Avail',
                'SL Quota', 'SL Used', 'SL Avail',
                'PL Quota', 'PL Used', 'PL Avail',
                'Total Quota', 'Total Consumed', 'Total Available Reserve',
                'Encashable Days', 'Balance Sheet Liability ($)'
            ];
            fputcsv($fp, $header);

            foreach ($reportData['rows'] as $r) {
                fputcsv($fp, [
                    $r['employee_code'],
                    $r['employee_name'],
                    $r['designation'],
                    $r['employment_type'],
                    number_format($r['monthly_salary'], 2),
                    number_format($r['daily_rate'], 2),
                    $r['cl_quota'], $r['cl_used'], $r['cl_available'],
                    $r['sl_quota'], $r['sl_used'], $r['sl_available'],
                    $r['pl_quota'], $r['pl_used'], $r['pl_available'],
                    $r['total_quota'], $r['total_used'], $r['total_available'],
                    $r['encashable_days'],
                    number_format($r['financial_liability'], 2)
                ]);
            }
        }

        rewind($fp);
        $csv = stream_get_contents($fp);
        fclose($fp);
        return $csv;
    }
}
