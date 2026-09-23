<?php
/**
 * Holiday Model
 * Handles database operations for company holidays, calendar events, and team leave integration
 */
class HolidayModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Get paginated or filtered holidays
     */
    public function getAll(array $filters = [], int $page = 1, int $perPage = 50): array
    {
        $where = [];
        $params = [];

        if (!empty($filters['year'])) {
            $where[] = 'year = :year';
            $params['year'] = (int) $filters['year'];
        }

        if (!empty($filters['type']) && $filters['type'] !== 'All') {
            $where[] = 'type = :type';
            $params['type'] = $filters['type'];
        }

        if (!empty($filters['search'])) {
            $where[] = '(name LIKE :search1 OR description LIKE :search2)';
            $params['search1'] = '%' . $filters['search'] . '%';
            $params['search2'] = '%' . $filters['search'] . '%';
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        $offset = ($page - 1) * $perPage;

        $countSql = "SELECT COUNT(*) FROM company_holidays $whereClause";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $sql = "SELECT * FROM company_holidays 
                $whereClause 
                ORDER BY holiday_date ASC 
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'data'  => $stmt->fetchAll(PDO::FETCH_ASSOC),
            'total' => $total
        ];
    }

    /**
     * Find holiday by ID
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM company_holidays WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    /**
     * Get upcoming holidays from today
     */
    public function getUpcoming(int $limit = 5): array
    {
        $stmt = $this->db->prepare("
            SELECT *, DATEDIFF(holiday_date, CURDATE()) as days_remaining 
            FROM company_holidays 
            WHERE holiday_date >= CURDATE() 
            ORDER BY holiday_date ASC 
            LIMIT :limit
        ");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Create a holiday
     */
    public function create(array $data): int
    {
        $date = $data['holiday_date'];
        $dayName = date('l', strtotime($date));
        $year = (int) date('Y', strtotime($date));

        $sql = "INSERT INTO company_holidays (name, holiday_date, day_name, type, is_mandatory_off, description, year)
                VALUES (:name, :holiday_date, :day_name, :type, :is_mandatory_off, :description, :year)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'name'             => $data['name'],
            'holiday_date'     => $date,
            'day_name'         => $dayName,
            'type'             => $data['type'] ?? 'Statutory',
            'is_mandatory_off' => isset($data['is_mandatory_off']) ? (int) $data['is_mandatory_off'] : 1,
            'description'      => $data['description'] ?? null,
            'year'             => $year,
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Update a holiday
     */
    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = ['id' => $id];

        if (!empty($data['holiday_date'])) {
            $data['day_name'] = date('l', strtotime($data['holiday_date']));
            $data['year'] = (int) date('Y', strtotime($data['holiday_date']));
        }

        $allowed = ['name', 'holiday_date', 'day_name', 'type', 'is_mandatory_off', 'description', 'year'];
        foreach ($allowed as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "`$col` = :$col";
                $params[$col] = $data[$col];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE company_holidays SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Delete a holiday
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM company_holidays WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Get aggregated monthly calendar feed (holidays + team leave absences)
     */
    public function getCalendarFeed(int $year, int $month): array
    {
        $startDate = sprintf('%04d-%02d-01', $year, $month);
        $endDate = date('Y-m-t', strtotime($startDate));

        // 1. Fetch Company Holidays for this month
        $hStmt = $this->db->prepare("
            SELECT * FROM company_holidays 
            WHERE holiday_date BETWEEN :start AND :end
            ORDER BY holiday_date ASC
        ");
        $hStmt->execute(['start' => $startDate, 'end' => $endDate]);
        $holidays = $hStmt->fetchAll(PDO::FETCH_ASSOC);

        // 2. Fetch Approved Team Leaves overlapping this month
        $lStmt = $this->db->prepare("
            SELECT lr.*, 
                   u.full_name as member_name, 
                   u.designation,
                   u.avatar,
                   lt.name as leave_type_name,
                   lt.code as leave_type_code,
                   lt.color as leave_type_color
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            WHERE lr.status = 'Approved'
              AND lr.start_date <= :end 
              AND lr.end_date >= :start
            ORDER BY lr.start_date ASC
        ");
        $lStmt->execute(['start' => $startDate, 'end' => $endDate]);
        $leaves = $lStmt->fetchAll(PDO::FETCH_ASSOC);

        // Format daily events map
        $eventsByDate = [];

        // Add holidays
        foreach ($holidays as $h) {
            $d = $h['holiday_date'];
            if (!isset($eventsByDate[$d])) $eventsByDate[$d] = [];
            $eventsByDate[$d][] = [
                'id'               => 'holiday-' . $h['id'],
                'type'             => 'holiday',
                'title'            => $h['name'],
                'category'         => $h['type'],
                'is_mandatory_off' => (bool) $h['is_mandatory_off'],
                'description'      => $h['description']
            ];
        }

        // Add team leaves (expand multi-day spans)
        foreach ($leaves as $l) {
            $cur = max($startDate, $l['start_date']);
            $last = min($endDate, $l['end_date']);

            $period = new DatePeriod(
                new DateTime($cur),
                new DateInterval('P1D'),
                (new DateTime($last))->modify('+1 day')
            );

            foreach ($period as $dt) {
                $dStr = $dt->format('Y-m-d');
                if (!isset($eventsByDate[$dStr])) $eventsByDate[$dStr] = [];
                $eventsByDate[$dStr][] = [
                    'id'               => 'leave-' . $l['id'] . '-' . $dStr,
                    'type'             => 'leave',
                    'title'            => $l['member_name'] . ' (' . $l['leave_type_code'] . ')',
                    'member_name'      => $l['member_name'],
                    'designation'      => $l['designation'],
                    'leave_type_name'  => $l['leave_type_name'],
                    'leave_type_code'  => $l['leave_type_code'],
                    'color'            => $l['leave_type_color'] ?: 'blue',
                    'is_half_day'      => (bool) $l['is_half_day'],
                    'reason'           => $l['reason']
                ];
            }
        }

        return [
            'year'          => $year,
            'month'         => $month,
            'start_date'    => $startDate,
            'end_date'      => $endDate,
            'holidays'      => $holidays,
            'leaves'        => $leaves,
            'events_by_day' => $eventsByDate
        ];
    }

    /**
     * Get holiday and work calendar statistics
     */
    public function getStats(int $year): array
    {
        $today = date('Y-m-d');
        $curMonth = (int) date('m');
        $curYear = (int) date('Y');

        // Year holiday counts
        $stmt = $this->db->prepare("
            SELECT 
                COUNT(*) as total_holidays,
                SUM(CASE WHEN type = 'Statutory' THEN 1 ELSE 0 END) as statutory_count,
                SUM(CASE WHEN type = 'Optional' THEN 1 ELSE 0 END) as optional_count,
                SUM(CASE WHEN type = 'Observance' THEN 1 ELSE 0 END) as observance_count
            FROM company_holidays 
            WHERE year = :year
        ");
        $stmt->execute(['year' => $year]);
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);

        // Next upcoming holiday
        $upStmt = $this->db->prepare("
            SELECT *, DATEDIFF(holiday_date, CURDATE()) as days_away
            FROM company_holidays 
            WHERE holiday_date >= CURDATE() 
            ORDER BY holiday_date ASC 
            LIMIT 1
        ");
        $upStmt->execute();
        $nextHoliday = $upStmt->fetch(PDO::FETCH_ASSOC);

        // Calculate working days in current month (Monday - Friday minus statutory holidays)
        $monthStart = date('Y-m-01');
        $monthEnd = date('Y-m-t');

        // Holidays in current month
        $mHolidaysStmt = $this->db->prepare("
            SELECT holiday_date FROM company_holidays 
            WHERE holiday_date BETWEEN :start AND :end AND is_mandatory_off = 1
        ");
        $mHolidaysStmt->execute(['start' => $monthStart, 'end' => $monthEnd]);
        $offHolidays = $mHolidaysStmt->fetchAll(PDO::FETCH_COLUMN);

        $workingDays = 0;
        $period = new DatePeriod(new DateTime($monthStart), new DateInterval('P1D'), (new DateTime($monthEnd))->modify('+1 day'));
        foreach ($period as $d) {
            $w = (int) $d->format('N'); // 1 = Mon, 7 = Sun
            $dStr = $d->format('Y-m-d');
            if ($w <= 5 && !in_array($dStr, $offHolidays)) {
                $workingDays++;
            }
        }

        // Active team members on leave this month
        $lCountStmt = $this->db->prepare("
            SELECT COUNT(DISTINCT user_id) 
            FROM leave_requests 
            WHERE status = 'Approved' 
              AND start_date <= :end 
              AND end_date >= :start
        ");
        $lCountStmt->execute(['start' => $monthStart, 'end' => $monthEnd]);
        $teamOnLeave = (int) $lCountStmt->fetchColumn();

        return [
            'year'               => $year,
            'total_holidays'     => (int) ($stats['total_holidays'] ?? 0),
            'statutory_count'    => (int) ($stats['statutory_count'] ?? 0),
            'optional_count'     => (int) ($stats['optional_count'] ?? 0),
            'observance_count'   => (int) ($stats['observance_count'] ?? 0),
            'next_holiday'       => $nextHoliday ?: null,
            'working_days_month' => $workingDays,
            'team_on_leave_month'=> $teamOnLeave
        ];
    }
}
