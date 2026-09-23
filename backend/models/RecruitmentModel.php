<?php
/**
 * Recruitment Model
 * Manages Job Openings, Candidate Pipeline, Kanban stages, and activity history
 */
class RecruitmentModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Get paginated job openings with applicant stage counts
     */
    public function getOpenings(array $filters = [], int $page = 1, int $perPage = 50): array
    {
        $where = [];
        $params = [];

        if (!empty($filters['department'])) {
            $where[] = 'jo.department = :department';
            $params['department'] = $filters['department'];
        }

        if (!empty($filters['status']) && $filters['status'] !== 'All') {
            $where[] = 'jo.status = :status';
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['location']) && $filters['location'] !== 'All') {
            $where[] = 'jo.location = :location';
            $params['location'] = $filters['location'];
        }

        if (!empty($filters['employment_type']) && $filters['employment_type'] !== 'All') {
            $where[] = 'jo.employment_type = :employment_type';
            $params['employment_type'] = $filters['employment_type'];
        }

        if (!empty($filters['search'])) {
            $where[] = '(jo.title LIKE :search1 OR jo.job_code LIKE :search2 OR jo.department LIKE :search3)';
            $params['search1'] = '%' . $filters['search'] . '%';
            $params['search2'] = '%' . $filters['search'] . '%';
            $params['search3'] = '%' . $filters['search'] . '%';
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        $offset = ($page - 1) * $perPage;

        $countSql = "SELECT COUNT(*) FROM `job_openings` jo $whereClause";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $sql = "
            SELECT 
                jo.*,
                u.full_name as hiring_manager_name,
                COUNT(jc.id) as total_candidates,
                SUM(CASE WHEN jc.stage = 'Applied' THEN 1 ELSE 0 END) as count_applied,
                SUM(CASE WHEN jc.stage = 'Screening' THEN 1 ELSE 0 END) as count_screening,
                SUM(CASE WHEN jc.stage = 'Interview' THEN 1 ELSE 0 END) as count_interview,
                SUM(CASE WHEN jc.stage = 'Offer' THEN 1 ELSE 0 END) as count_offer,
                SUM(CASE WHEN jc.stage = 'Hired' THEN 1 ELSE 0 END) as count_hired,
                SUM(CASE WHEN jc.stage = 'Rejected' THEN 1 ELSE 0 END) as count_rejected
            FROM `job_openings` jo
            LEFT JOIN `users` u ON jo.hiring_manager_id = u.id
            LEFT JOIN `job_candidates` jc ON jc.job_id = jo.id
            $whereClause
            GROUP BY jo.id
            ORDER BY jo.created_at DESC
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'data'  => $stmt->fetchAll(PDO::FETCH_ASSOC),
            'total' => $total,
        ];
    }

    /**
     * Get single opening by ID
     */
    public function getOpeningById(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT jo.*, u.full_name as hiring_manager_name 
            FROM `job_openings` jo
            LEFT JOIN `users` u ON jo.hiring_manager_id = u.id
            WHERE jo.id = ?
        ");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    /**
     * Create new job opening
     */
    public function createOpening(array $data): int
    {
        $jobCode = $data['job_code'] ?? null;
        if (empty($jobCode)) {
            $nextNum = ((int)$this->db->query("SELECT MAX(id) FROM `job_openings`")->fetchColumn()) + 1;
            $jobCode = 'JOB-' . date('Y') . '-' . str_pad((string)$nextNum, 3, '0', STR_PAD_LEFT);
        }

        $stmt = $this->db->prepare("
            INSERT INTO `job_openings` 
            (`job_code`, `title`, `department`, `location`, `employment_type`, `experience_level`, `salary_min`, `salary_max`, `positions_count`, `status`, `description`, `requirements`, `hiring_manager_id`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $jobCode,
            $data['title'],
            $data['department'],
            $data['location'] ?? 'Hybrid',
            $data['employment_type'] ?? 'Full-time',
            $data['experience_level'] ?? 'Mid',
            $data['salary_min'] ?? null,
            $data['salary_max'] ?? null,
            (int)($data['positions_count'] ?? 1),
            $data['status'] ?? 'Published',
            $data['description'] ?? null,
            $data['requirements'] ?? null,
            $data['hiring_manager_id'] ?? 1
        ]);

        return (int)$this->db->lastInsertId();
    }

    /**
     * Update job opening
     */
    public function updateOpening(int $id, array $data): bool
    {
        $allowed = [
            'title', 'department', 'location', 'employment_type', 'experience_level',
            'salary_min', 'salary_max', 'positions_count', 'status', 'description',
            'requirements', 'hiring_manager_id'
        ];

        $fields = [];
        $values = [];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "`$f` = ?";
                $values[] = $data[$f];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $values[] = $id;
        $sql = "UPDATE `job_openings` SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }

    /**
     * Delete job opening
     */
    public function deleteOpening(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM `job_openings` WHERE id = ?");
        return $stmt->execute([$id]);
    }

    /**
     * Get candidate applications (list or Kanban grouped)
     */
    public function getCandidates(array $filters = []): array
    {
        $where = [];
        $params = [];

        if (!empty($filters['job_id'])) {
            $where[] = 'jc.job_id = :job_id';
            $params['job_id'] = (int)$filters['job_id'];
        }

        if (!empty($filters['stage']) && $filters['stage'] !== 'All') {
            $where[] = 'jc.stage = :stage';
            $params['stage'] = $filters['stage'];
        }

        if (!empty($filters['department'])) {
            $where[] = 'jo.department = :department';
            $params['department'] = $filters['department'];
        }

        if (!empty($filters['search'])) {
            $where[] = '(jc.full_name LIKE :search1 OR jc.email LIKE :search2 OR jc.candidate_code LIKE :search3 OR jc.current_company LIKE :search4)';
            $params['search1'] = '%' . $filters['search'] . '%';
            $params['search2'] = '%' . $filters['search'] . '%';
            $params['search3'] = '%' . $filters['search'] . '%';
            $params['search4'] = '%' . $filters['search'] . '%';
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $sql = "
            SELECT 
                jc.*,
                jo.job_code,
                jo.title as job_title,
                jo.department as job_department,
                jo.location as job_location
            FROM `job_candidates` jc
            JOIN `job_openings` jo ON jc.job_id = jo.id
            $whereClause
            ORDER BY jc.rating DESC, jc.applied_at DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $candidates = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // If Kanban format is requested, group by stages
        if (!empty($filters['format']) && $filters['format'] === 'kanban') {
            $stages = [
                'Applied'   => [],
                'Screening' => [],
                'Interview' => [],
                'Offer'     => [],
                'Hired'     => [],
                'Rejected'  => []
            ];

            foreach ($candidates as $c) {
                $st = $c['stage'];
                if (isset($stages[$st])) {
                    $stages[$st][] = $c;
                } else {
                    $stages['Applied'][] = $c;
                }
            }

            return [
                'stages'     => $stages,
                'total'      => count($candidates),
                'stage_counts' => [
                    'Applied'   => count($stages['Applied']),
                    'Screening' => count($stages['Screening']),
                    'Interview' => count($stages['Interview']),
                    'Offer'     => count($stages['Offer']),
                    'Hired'     => count($stages['Hired']),
                    'Rejected'  => count($stages['Rejected'])
                ]
            ];
        }

        return [
            'data'  => $candidates,
            'total' => count($candidates)
        ];
    }

    /**
     * Get candidate by ID with activity timeline
     */
    public function getCandidateById(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT 
                jc.*,
                jo.job_code,
                jo.title as job_title,
                jo.department as job_department,
                jo.location as job_location,
                jo.salary_min,
                jo.salary_max
            FROM `job_candidates` jc
            JOIN `job_openings` jo ON jc.job_id = jo.id
            WHERE jc.id = ?
        ");
        $stmt->execute([$id]);
        $candidate = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$candidate) {
            return null;
        }

        // Fetch activity logs
        $logsStmt = $this->db->prepare("
            SELECT cal.*, u.full_name as performed_by_name
            FROM `candidate_activity_logs` cal
            LEFT JOIN `users` u ON cal.performed_by = u.id
            WHERE cal.candidate_id = ?
            ORDER BY cal.id DESC, cal.created_at DESC
        ");
        $logsStmt->execute([$id]);
        $candidate['activity_logs'] = $logsStmt->fetchAll(PDO::FETCH_ASSOC);

        return $candidate;
    }

    /**
     * Create candidate application
     */
    public function createCandidate(array $data): int
    {
        $code = $data['candidate_code'] ?? null;
        if (empty($code)) {
            $nextNum = ((int)$this->db->query("SELECT MAX(id) FROM `job_candidates`")->fetchColumn()) + 1;
            $code = 'APP-' . (1000 + $nextNum);
        }

        $stage = $data['stage'] ?? 'Applied';

        $stmt = $this->db->prepare("
            INSERT INTO `job_candidates` 
            (`job_id`, `candidate_code`, `full_name`, `email`, `phone`, `current_company`, `experience_years`, `expected_salary`, `source`, `stage`, `rating`, `notes`, `applied_at`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            (int)$data['job_id'],
            $code,
            $data['full_name'],
            $data['email'],
            $data['phone'] ?? null,
            $data['current_company'] ?? null,
            (float)($data['experience_years'] ?? 0.0),
            $data['expected_salary'] ? (float)$data['expected_salary'] : null,
            $data['source'] ?? 'LinkedIn',
            $stage,
            (int)($data['rating'] ?? 3),
            $data['notes'] ?? null,
            $data['applied_at'] ?? date('Y-m-d')
        ]);

        $candId = (int)$this->db->lastInsertId();

        // Create log entry
        $logStmt = $this->db->prepare("
            INSERT INTO `candidate_activity_logs` 
            (`candidate_id`, `from_stage`, `to_stage`, `note`, `performed_by`)
            VALUES (?, NULL, ?, ?, ?)
        ");
        $logStmt->execute([
            $candId,
            $stage,
            $data['notes'] ?: 'Candidate application created in ' . $stage . ' stage',
            $data['user_id'] ?? 1
        ]);

        return $candId;
    }

    /**
     * Update candidate Kanban stage with audit log
     */
    public function updateCandidateStage(int $candidateId, string $newStage, ?string $note = null, ?int $performedBy = 1): bool
    {
        $validStages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];
        if (!in_array($newStage, $validStages)) {
            return false;
        }

        // Get current stage
        $currStmt = $this->db->prepare("SELECT stage FROM `job_candidates` WHERE id = ?");
        $currStmt->execute([$candidateId]);
        $fromStage = $currStmt->fetchColumn();

        if ($fromStage === false) {
            return false;
        }

        // Update stage
        $upStmt = $this->db->prepare("UPDATE `job_candidates` SET `stage` = ? WHERE id = ?");
        $success = $upStmt->execute([$newStage, $candidateId]);

        if ($success) {
            // Write activity log
            $logStmt = $this->db->prepare("
                INSERT INTO `candidate_activity_logs` 
                (`candidate_id`, `from_stage`, `to_stage`, `note`, `performed_by`)
                VALUES (?, ?, ?, ?, ?)
            ");
            $logStmt->execute([
                $candidateId,
                $fromStage,
                $newStage,
                $note ?: "Stage transitioned from $fromStage to $newStage",
                $performedBy
            ]);
        }

        return $success;
    }

    /**
     * Update candidate details
     */
    public function updateCandidate(int $id, array $data): bool
    {
        $allowed = [
            'job_id', 'full_name', 'email', 'phone', 'current_company',
            'experience_years', 'expected_salary', 'source', 'stage',
            'rating', 'notes', 'resume_url'
        ];

        $fields = [];
        $values = [];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "`$f` = ?";
                $values[] = $data[$f];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $values[] = $id;
        $sql = "UPDATE `job_candidates` SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }

    /**
     * Delete candidate
     */
    public function deleteCandidate(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM `job_candidates` WHERE id = ?");
        return $stmt->execute([$id]);
    }

    /**
     * Get Recruitment KPIs & Pipeline Stats
     */
    public function getStats(): array
    {
        // 1. Job Opening counts
        $jobStmt = $this->db->query("
            SELECT 
                COUNT(*) as total_openings,
                SUM(CASE WHEN `status` = 'Published' THEN 1 ELSE 0 END) as active_openings,
                SUM(CASE WHEN `status` = 'Draft' THEN 1 ELSE 0 END) as draft_openings,
                SUM(CASE WHEN `status` = 'Closed' THEN 1 ELSE 0 END) as closed_openings
            FROM `job_openings`
        ");
        $jobStats = $jobStmt->fetch(PDO::FETCH_ASSOC);

        // 2. Candidate counts by stage
        $candStmt = $this->db->query("
            SELECT 
                COUNT(*) as total_candidates,
                SUM(CASE WHEN `stage` = 'Applied' THEN 1 ELSE 0 END) as count_applied,
                SUM(CASE WHEN `stage` = 'Screening' THEN 1 ELSE 0 END) as count_screening,
                SUM(CASE WHEN `stage` = 'Interview' THEN 1 ELSE 0 END) as count_interview,
                SUM(CASE WHEN `stage` = 'Offer' THEN 1 ELSE 0 END) as count_offer,
                SUM(CASE WHEN `stage` = 'Hired' THEN 1 ELSE 0 END) as count_hired,
                SUM(CASE WHEN `stage` = 'Rejected' THEN 1 ELSE 0 END) as count_rejected
            FROM `job_candidates`
        ");
        $candStats = $candStmt->fetch(PDO::FETCH_ASSOC);

        $inPipeline = (int)$candStats['count_applied'] + (int)$candStats['count_screening'] + (int)$candStats['count_interview'] + (int)$candStats['count_offer'];
        $hired = (int)$candStats['count_hired'];
        $totalCandidates = max(1, (int)$candStats['total_candidates']);
        $conversionRate = round(($hired / $totalCandidates) * 100, 1);

        return [
            'active_openings'        => (int)($jobStats['active_openings'] ?? 0),
            'total_openings'         => (int)($jobStats['total_openings'] ?? 0),
            'total_candidates'       => (int)($candStats['total_candidates'] ?? 0),
            'in_pipeline'            => $inPipeline,
            'interviews_active'      => (int)($candStats['count_interview'] ?? 0),
            'offers_extended'        => (int)($candStats['count_offer'] ?? 0),
            'hired_count'            => $hired,
            'conversion_rate'        => $conversionRate,
            'by_stage' => [
                'Applied'   => (int)($candStats['count_applied'] ?? 0),
                'Screening' => (int)($candStats['count_screening'] ?? 0),
                'Interview' => (int)($candStats['count_interview'] ?? 0),
                'Offer'     => (int)($candStats['count_offer'] ?? 0),
                'Hired'     => (int)($candStats['count_hired'] ?? 0),
                'Rejected'  => (int)($candStats['count_rejected'] ?? 0)
            ]
        ];
    }
}
