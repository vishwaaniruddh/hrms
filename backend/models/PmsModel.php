<?php
/**
 * Performance Management & Appraisals (PMS) Model
 * Handles OKRs, 360 Review Cycles, 9-Box Talent Matrix, Competencies, and Payroll Increments
 */
class PmsModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    // ──────────────────────────────────────────
    // 1. Performance Cycles
    // ──────────────────────────────────────────

    public function getCycles(): array
    {
        $stmt = $this->db->query("SELECT * FROM `performance_cycles` ORDER BY `year` DESC, `id` DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCycleById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM `performance_cycles` WHERE `id` = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function getActiveCycle(): ?array
    {
        $stmt = $this->db->query("SELECT * FROM `performance_cycles` WHERE `status` = 'Active' ORDER BY `year` DESC LIMIT 1");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function createCycle(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO `performance_cycles` 
            (`title`, `period_type`, `year`, `start_date`, `end_date`, `self_review_deadline`, `manager_review_deadline`, `status`, `description`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['title'],
            $data['period_type'] ?? 'Annual',
            (int)($data['year'] ?? date('Y')),
            $data['start_date'],
            $data['end_date'],
            $data['self_review_deadline'],
            $data['manager_review_deadline'],
            $data['status'] ?? 'Active',
            $data['description'] ?? null
        ]);
        return (int)$this->db->lastInsertId();
    }

    // ──────────────────────────────────────────
    // 2. Competencies
    // ──────────────────────────────────────────

    public function getCompetencies(): array
    {
        $stmt = $this->db->query("SELECT * FROM `performance_competencies` WHERE `is_active` = 1 ORDER BY `id` ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ──────────────────────────────────────────
    // 3. OKRs & Key Results
    // ──────────────────────────────────────────

    public function getOkrs(array $filters = []): array
    {
        $where = ['1=1'];
        $params = [];

        if (!empty($filters['cycle_id'])) {
            $where[] = 'o.cycle_id = ?';
            $params[] = (int)$filters['cycle_id'];
        }

        if (!empty($filters['user_id'])) {
            $where[] = 'o.user_id = ?';
            $params[] = (int)$filters['user_id'];
        }

        if (!empty($filters['quarter']) && $filters['quarter'] !== 'All') {
            $where[] = 'o.quarter = ?';
            $params[] = $filters['quarter'];
        }

        if (!empty($filters['category']) && $filters['category'] !== 'All') {
            $where[] = 'o.category = ?';
            $params[] = $filters['category'];
        }

        if (!empty($filters['status']) && $filters['status'] !== 'All') {
            $where[] = 'o.status = ?';
            $params[] = $filters['status'];
        }

        $whereClause = implode(' AND ', $where);

        $sql = "
            SELECT 
                o.*,
                u.full_name AS member_name,
                u.email AS member_email,
                u.designation,
                u.avatar,
                c.title AS cycle_title
            FROM `performance_okrs` o
            JOIN `users` u ON o.user_id = u.id
            JOIN `performance_cycles` c ON o.cycle_id = c.id
            WHERE {$whereClause}
            ORDER BY o.id DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $okrs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($okrs)) {
            return [];
        }

        $okrIds = array_column($okrs, 'id');
        $inClause = implode(',', array_fill(0, count($okrIds), '?'));

        $krStmt = $this->db->prepare("
            SELECT * FROM `performance_key_results` 
            WHERE `okr_id` IN ({$inClause})
            ORDER BY `id` ASC
        ");
        $krStmt->execute($okrIds);
        $keyResults = $krStmt->fetchAll(PDO::FETCH_ASSOC);

        $krMap = [];
        foreach ($keyResults as $kr) {
            $krMap[$kr['okr_id']][] = $kr;
        }

        foreach ($okrs as &$okr) {
            $okr['key_results'] = $krMap[$okr['id']] ?? [];
        }

        return $okrs;
    }

    public function getOkrById(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT 
                o.*,
                u.full_name AS member_name,
                u.email AS member_email,
                u.designation,
                u.avatar,
                c.title AS cycle_title
            FROM `performance_okrs` o
            JOIN `users` u ON o.user_id = u.id
            JOIN `performance_cycles` c ON o.cycle_id = c.id
            WHERE o.id = ?
        ");
        $stmt->execute([$id]);
        $okr = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$okr) return null;

        $krStmt = $this->db->prepare("SELECT * FROM `performance_key_results` WHERE `okr_id` = ? ORDER BY `id` ASC");
        $krStmt->execute([$id]);
        $okr['key_results'] = $krStmt->fetchAll(PDO::FETCH_ASSOC);

        return $okr;
    }

    public function createOkr(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO `performance_okrs` 
            (`cycle_id`, `user_id`, `objective_title`, `category`, `quarter`, `weight_pct`, `progress_pct`, `status`)
            VALUES (?, ?, ?, ?, ?, ?, 0, 'In Progress')
        ");
        $stmt->execute([
            $data['cycle_id'],
            $data['user_id'],
            $data['objective_title'],
            $data['category'] ?? 'Department Milestone',
            $data['quarter'] ?? 'Q1',
            (int)($data['weight_pct'] ?? 100)
        ]);
        $okrId = (int)$this->db->lastInsertId();

        if (!empty($data['key_results']) && is_array($data['key_results'])) {
            $krStmt = $this->db->prepare("
                INSERT INTO `performance_key_results` 
                (`okr_id`, `title`, `metric_type`, `start_value`, `target_value`, `current_value`, `weight_pct`, `progress_pct`, `status`)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            foreach ($data['key_results'] as $kr) {
                $start = (float)($kr['start_value'] ?? 0.0);
                $target = (float)($kr['target_value'] ?? 100.0);
                $current = (float)($kr['current_value'] ?? $start);
                $progress = $this->calculateKrProgress($kr['metric_type'] ?? 'percentage', $start, $target, $current);

                $krStmt->execute([
                    $okrId,
                    $kr['title'],
                    $kr['metric_type'] ?? 'percentage',
                    $start,
                    $target,
                    $current,
                    (int)($kr['weight_pct'] ?? 100),
                    $progress,
                    $progress >= 100 ? 'Achieved' : ($progress >= 50 ? 'On Track' : 'Behind')
                ]);
            }
            $this->recalculateOkrProgress($okrId);
        }

        return $okrId;
    }

    public function updateKeyResultProgress(int $krId, float $currentValue, ?string $status = null): array
    {
        $stmt = $this->db->prepare("SELECT * FROM `performance_key_results` WHERE `id` = ?");
        $stmt->execute([$krId]);
        $kr = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$kr) {
            throw new Exception("Key Result not found");
        }

        $start = (float)$kr['start_value'];
        $target = (float)$kr['target_value'];
        $progress = $this->calculateKrProgress($kr['metric_type'], $start, $target, $currentValue);

        if ($status === null) {
            $status = $progress >= 100 ? 'Achieved' : ($progress >= 50 ? 'On Track' : 'Behind');
        }

        $upd = $this->db->prepare("
            UPDATE `performance_key_results` 
            SET `current_value` = ?, `progress_pct` = ?, `status` = ?, `updated_at` = NOW()
            WHERE `id` = ?
        ");
        $upd->execute([$currentValue, $progress, $status, $krId]);

        $this->recalculateOkrProgress((int)$kr['okr_id']);

        return [
            'id' => $krId,
            'okr_id' => $kr['okr_id'],
            'current_value' => $currentValue,
            'progress_pct' => $progress,
            'status' => $status
        ];
    }

    private function calculateKrProgress(string $type, float $start, float $target, float $current): int
    {
        if ($type === 'boolean') {
            return $current >= 1.0 ? 100 : 0;
        }

        $range = $target - $start;
        if (abs($range) < 0.0001) {
            return $current >= $target ? 100 : 0;
        }

        $pct = (($current - $start) / $range) * 100;
        return max(0, min(100, (int)round($pct)));
    }

    private function recalculateOkrProgress(int $okrId): void
    {
        $stmt = $this->db->prepare("SELECT `progress_pct` FROM `performance_key_results` WHERE `okr_id` = ?");
        $stmt->execute([$okrId]);
        $krs = $stmt->fetchAll(PDO::FETCH_COLUMN);

        if (empty($krs)) {
            return;
        }

        $avg = (int)round(array_sum($krs) / count($krs));
        $status = $avg >= 100 ? 'Completed' : ($avg > 0 ? 'In Progress' : 'Not Started');

        $this->db->prepare("
            UPDATE `performance_okrs` 
            SET `progress_pct` = ?, `status` = ?, `updated_at` = NOW() 
            WHERE `id` = ?
        ")->execute([$avg, $status, $okrId]);
    }

    // ──────────────────────────────────────────
    // 4. 360° Review Cycles & Appraisals
    // ──────────────────────────────────────────

    public function getReviews(array $filters = []): array
    {
        $where = ['1=1'];
        $params = [];

        if (!empty($filters['cycle_id'])) {
            $where[] = 'r.cycle_id = ?';
            $params[] = (int)$filters['cycle_id'];
        }

        if (!empty($filters['user_id'])) {
            $where[] = 'r.user_id = ?';
            $params[] = (int)$filters['user_id'];
        }

        if (!empty($filters['manager_id'])) {
            $where[] = 'r.manager_id = ?';
            $params[] = (int)$filters['manager_id'];
        }

        if (!empty($filters['status']) && $filters['status'] !== 'All') {
            $where[] = 'r.status = ?';
            $params[] = $filters['status'];
        }

        $whereClause = implode(' AND ', $where);

        $sql = "
            SELECT 
                r.*,
                u.full_name AS member_name,
                u.email AS member_email,
                u.designation,
                u.avatar,
                m.full_name AS manager_name,
                c.title AS cycle_title,
                c.self_review_deadline,
                c.manager_review_deadline,
                ess.base_salary AS current_base_salary
            FROM `performance_reviews` r
            JOIN `users` u ON r.user_id = u.id
            JOIN `users` m ON r.manager_id = m.id
            JOIN `performance_cycles` c ON r.cycle_id = c.id
            LEFT JOIN `employee_salary_structures` ess ON r.user_id = ess.user_id
            WHERE {$whereClause}
            ORDER BY r.id DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($reviews)) {
            return [];
        }

        // Attach competency scores and peer feedbacks
        foreach ($reviews as &$rev) {
            $rev['competency_scores'] = $this->getCompetencyScores((int)$rev['id']);
            $rev['peer_feedbacks'] = $this->getPeerFeedbacks((int)$rev['id']);
        }

        return $reviews;
    }

    public function getReviewById(int $id): ?array
    {
        $sql = "
            SELECT 
                r.*,
                u.full_name AS member_name,
                u.email AS member_email,
                u.designation,
                u.avatar,
                m.full_name AS manager_name,
                c.title AS cycle_title,
                c.self_review_deadline,
                c.manager_review_deadline,
                ess.base_salary AS current_base_salary
            FROM `performance_reviews` r
            JOIN `users` u ON r.user_id = u.id
            JOIN `users` m ON r.manager_id = m.id
            JOIN `performance_cycles` c ON r.cycle_id = c.id
            LEFT JOIN `employee_salary_structures` ess ON r.user_id = ess.user_id
            WHERE r.id = ?
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        $rev = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$rev) return null;

        $rev['competency_scores'] = $this->getCompetencyScores($id);
        $rev['peer_feedbacks'] = $this->getPeerFeedbacks($id);

        return $rev;
    }

    public function getCompetencyScores(int $reviewId): array
    {
        $stmt = $this->db->prepare("
            SELECT s.*, c.name AS competency_name, c.category, c.weight_pct
            FROM `performance_review_competency_scores` s
            JOIN `performance_competencies` c ON s.competency_id = c.id
            WHERE s.review_id = ?
            ORDER BY c.id ASC
        ");
        $stmt->execute([$reviewId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPeerFeedbacks(int $reviewId): array
    {
        $stmt = $this->db->prepare("
            SELECT f.*, u.full_name AS peer_name, u.avatar, u.designation
            FROM `performance_peer_feedbacks` f
            JOIN `users` u ON f.reviewer_user_id = u.id
            WHERE f.review_id = ?
            ORDER BY f.id ASC
        ");
        $stmt->execute([$reviewId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function submitSelfEvaluation(int $reviewId, array $data): bool
    {
        $selfRating = (float)($data['self_rating'] ?? 3.0);
        $selfComments = $data['self_comments'] ?? '';

        $stmt = $this->db->prepare("
            UPDATE `performance_reviews` 
            SET `self_rating` = ?, `self_comments` = ?, `self_submitted_at` = NOW(), `status` = 'Pending Manager Review'
            WHERE `id` = ?
        ");
        $stmt->execute([$selfRating, $selfComments, $reviewId]);

        // Save individual competency self scores if provided
        if (!empty($data['competencies']) && is_array($data['competencies'])) {
            $updScore = $this->db->prepare("
                INSERT INTO `performance_review_competency_scores` (`review_id`, `competency_id`, `self_score`, `comments`)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE `self_score` = VALUES(`self_score`), `comments` = VALUES(`comments`)
            ");
            foreach ($data['competencies'] as $cid => $cScore) {
                $score = is_array($cScore) ? (float)($cScore['score'] ?? 3.0) : (float)$cScore;
                $comment = is_array($cScore) ? ($cScore['comment'] ?? null) : null;
                $updScore->execute([$reviewId, (int)$cid, $score, $comment]);
            }
        }

        return true;
    }

    public function submitManagerEvaluation(int $reviewId, array $data): bool
    {
        $managerRating = (float)($data['manager_rating'] ?? 3.5);
        $potential = $data['manager_potential_rating'] ?? 'Medium'; // Low, Medium, High
        $performance = $data['manager_performance_rating'] ?? 'Medium'; // Low, Medium, High

        // Compute 9-Box quadrant
        $quadrant = $this->resolveNineBoxQuadrant($performance, $potential);

        // Auto recommended increment based on rating and 9-box
        $incrementPct = isset($data['recommended_increment_pct']) 
            ? (float)$data['recommended_increment_pct'] 
            : $this->calculateRecommendedIncrement($managerRating, $quadrant);

        $finalRating = (float)($data['final_rating'] ?? $managerRating);

        $stmt = $this->db->prepare("
            UPDATE `performance_reviews` 
            SET `manager_rating` = ?,
                `manager_potential_rating` = ?,
                `manager_performance_rating` = ?,
                `nine_box_quadrant` = ?,
                `manager_comments` = ?,
                `strengths` = ?,
                `growth_areas` = ?,
                `final_rating` = ?,
                `recommended_increment_pct` = ?,
                `manager_submitted_at` = NOW(),
                `status` = 'Finalized'
            WHERE `id` = ?
        ");
        $stmt->execute([
            $managerRating,
            $potential,
            $performance,
            $quadrant,
            $data['manager_comments'] ?? '',
            $data['strengths'] ?? '',
            $data['growth_areas'] ?? '',
            $finalRating,
            $incrementPct,
            $reviewId
        ]);

        // Save individual competency manager scores
        if (!empty($data['competencies']) && is_array($data['competencies'])) {
            $updScore = $this->db->prepare("
                INSERT INTO `performance_review_competency_scores` (`review_id`, `competency_id`, `manager_score`, `comments`)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE `manager_score` = VALUES(`manager_score`), `comments` = COALESCE(VALUES(`comments`), `comments`)
            ");
            foreach ($data['competencies'] as $cid => $cScore) {
                $score = is_array($cScore) ? (float)($cScore['score'] ?? 3.5) : (float)$cScore;
                $comment = is_array($cScore) ? ($cScore['comment'] ?? null) : null;
                $updScore->execute([$reviewId, (int)$cid, $score, $comment]);
            }
        }

        return true;
    }

    public function resolveNineBoxQuadrant(string $performance, string $potential): string
    {
        $perf = ucfirst(strtolower($performance));
        $pot = ucfirst(strtolower($potential));

        if ($perf === 'High') {
            if ($pot === 'High') return 'Star / Future Leader';
            if ($pot === 'Medium') return 'High Performer';
            return 'Solid Professional';
        }

        if ($perf === 'Medium') {
            if ($pot === 'High') return 'High Potential / Growth Star';
            if ($pot === 'Medium') return 'Core Contributor';
            return 'Effective Team Member';
        }

        // Low Performance
        if ($pot === 'High') return 'Enigma / Rough Diamond';
        if ($pot === 'Medium') return 'Dilemma / Inconsistent';
        return 'Underperformer / Risk';
    }

    public function calculateRecommendedIncrement(float $rating, string $quadrant): float
    {
        if (str_contains($quadrant, 'Star')) return 15.0;
        if (str_contains($quadrant, 'High Performer')) return 12.0;
        if (str_contains($quadrant, 'Growth Star')) return 10.0;
        if (str_contains($quadrant, 'Solid Professional')) return 8.0;
        if (str_contains($quadrant, 'Core Contributor')) return 6.0;
        if (str_contains($quadrant, 'Effective')) return 4.0;
        if ($rating >= 4.5) return 12.5;
        if ($rating >= 4.0) return 10.0;
        if ($rating >= 3.0) return 5.0;
        return 0.0;
    }

    // ──────────────────────────────────────────
    // 5. 9-Box Talent Matrix Aggregation
    // ──────────────────────────────────────────

    public function getTalentMatrix(int $cycleId): array
    {
        $sql = "
            SELECT 
                r.id,
                r.user_id,
                r.nine_box_quadrant,
                r.manager_potential_rating,
                r.manager_performance_rating,
                r.final_rating,
                r.recommended_increment_pct,
                r.status,
                u.full_name AS member_name,
                u.email AS member_email,
                u.designation,
                u.avatar
            FROM `performance_reviews` r
            JOIN `users` u ON r.user_id = u.id
            WHERE r.cycle_id = ?
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$cycleId]);
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $quadrants = [
            'Star / Future Leader'          => ['potential' => 'High', 'performance' => 'High', 'color' => 'emerald', 'employees' => []],
            'High Potential / Growth Star'  => ['potential' => 'High', 'performance' => 'Medium', 'color' => 'blue', 'employees' => []],
            'Enigma / Rough Diamond'        => ['potential' => 'High', 'performance' => 'Low', 'color' => 'purple', 'employees' => []],
            'High Performer'                => ['potential' => 'Medium', 'performance' => 'High', 'color' => 'emerald', 'employees' => []],
            'Core Contributor'              => ['potential' => 'Medium', 'performance' => 'Medium', 'color' => 'blue', 'employees' => []],
            'Dilemma / Inconsistent'        => ['potential' => 'Medium', 'performance' => 'Low', 'color' => 'amber', 'employees' => []],
            'Solid Professional'            => ['potential' => 'Low', 'performance' => 'High', 'color' => 'teal', 'employees' => []],
            'Effective Team Member'         => ['potential' => 'Low', 'performance' => 'Medium', 'color' => 'slate', 'employees' => []],
            'Underperformer / Risk'         => ['potential' => 'Low', 'performance' => 'Low', 'color' => 'rose', 'employees' => []],
        ];

        foreach ($reviews as $rev) {
            $box = $rev['nine_box_quadrant'] ?: 'Core Contributor';
            if (isset($quadrants[$box])) {
                $quadrants[$box]['employees'][] = $rev;
            } else {
                $quadrants['Core Contributor']['employees'][] = $rev;
            }
        }

        return [
            'cycle_id' => $cycleId,
            'total_evaluated' => count($reviews),
            'quadrants' => $quadrants
        ];
    }

    // ──────────────────────────────────────────
    // 6. Appraisal to Payroll Link
    // ──────────────────────────────────────────

    public function applyIncrementToPayroll(int $reviewId, int $processedBy): array
    {
        $rev = $this->getReviewById($reviewId);
        if (!$rev) {
            throw new Exception("Performance Review not found");
        }

        $userId = (int)$rev['user_id'];
        $incrementPct = (float)$rev['recommended_increment_pct'];

        // Get current salary structure
        $structStmt = $this->db->prepare("SELECT * FROM `employee_salary_structures` WHERE `user_id` = ?");
        $structStmt->execute([$userId]);
        $struct = $structStmt->fetch(PDO::FETCH_ASSOC);

        $oldBase = $struct ? (float)$struct['base_salary'] : 4500.00;
        $incrementAmount = round($oldBase * ($incrementPct / 100), 2);
        $newBase = $oldBase + $incrementAmount;
        $effectiveDate = date('Y-m-d');

        // Insert into salary_increments audit log
        $incStmt = $this->db->prepare("
            INSERT INTO `salary_increments` 
            (`review_id`, `user_id`, `old_base_salary`, `increment_pct`, `increment_amount`, `new_base_salary`, `effective_date`, `processed_by`, `status`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Applied to Payroll')
        ");
        $incStmt->execute([
            $reviewId,
            $userId,
            $oldBase,
            $incrementPct,
            $incrementAmount,
            $newBase,
            $effectiveDate,
            $processedBy
        ]);
        $incrementId = (int)$this->db->lastInsertId();

        // Update employee_salary_structures
        if ($struct) {
            $updStruct = $this->db->prepare("
                UPDATE `employee_salary_structures` 
                SET `base_salary` = ?, `effective_date` = ?, `updated_at` = NOW() 
                WHERE `user_id` = ?
            ");
            $updStruct->execute([$newBase, $effectiveDate, $userId]);
        } else {
            $insStruct = $this->db->prepare("
                INSERT INTO `employee_salary_structures` 
                (`user_id`, `employment_type`, `base_salary`, `currency`, `effective_date`, `status`)
                VALUES (?, 'Permanent', ?, 'USD', ?, 'Active')
            ");
            $insStruct->execute([$userId, $newBase, $effectiveDate]);
        }

        // Mark review as payroll_increment_applied
        $updRev = $this->db->prepare("
            UPDATE `performance_reviews` 
            SET `payroll_increment_applied` = 1, `payroll_applied_at` = NOW(), `status` = 'Finalized'
            WHERE `id` = ?
        ");
        $updRev->execute([$reviewId]);

        return [
            'increment_id'      => $incrementId,
            'review_id'         => $reviewId,
            'user_id'           => $userId,
            'member_name'       => $rev['member_name'],
            'old_base_salary'   => $oldBase,
            'increment_pct'     => $incrementPct,
            'increment_amount'  => $incrementAmount,
            'new_base_salary'   => $newBase,
            'effective_date'    => $effectiveDate,
            'status'            => 'Applied to Payroll'
        ];
    }

    public function getSalaryIncrements(?int $userId = null): array
    {
        $where = ['1=1'];
        $params = [];

        if ($userId !== null) {
            $where[] = 'i.user_id = ?';
            $params[] = $userId;
        }

        $whereClause = implode(' AND ', $where);

        $sql = "
            SELECT 
                i.*,
                u.full_name AS member_name,
                u.email AS member_email,
                u.designation,
                admin.full_name AS processed_by_name,
                c.title AS cycle_title,
                r.final_rating,
                r.nine_box_quadrant
            FROM `salary_increments` i
            JOIN `users` u ON i.user_id = u.id
            JOIN `users` admin ON i.processed_by = admin.id
            JOIN `performance_reviews` r ON i.review_id = r.id
            JOIN `performance_cycles` c ON r.cycle_id = c.id
            WHERE {$whereClause}
            ORDER BY i.id DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ──────────────────────────────────────────
    // 7. Aggregate PMS Stats
    // ──────────────────────────────────────────

    public function getStats(?int $cycleId = null, ?int $userId = null): array
    {
        $cycle = $cycleId ? $this->getCycleById($cycleId) : $this->getActiveCycle();
        $cId = $cycle ? (int)$cycle['id'] : 1;

        // OKR Stats
        $okrWhere = ['cycle_id = ?'];
        $okrParams = [$cId];
        if ($userId !== null) {
            $okrWhere[] = 'user_id = ?';
            $okrParams[] = $userId;
        }
        $okrWhereClause = implode(' AND ', $okrWhere);

        $okrStmt = $this->db->prepare("
            SELECT 
                COUNT(*) AS total_okrs,
                AVG(progress_pct) AS avg_progress,
                SUM(CASE WHEN `status` = 'Completed' THEN 1 ELSE 0 END) AS completed_okrs,
                SUM(CASE WHEN `status` = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_okrs
            FROM `performance_okrs`
            WHERE {$okrWhereClause}
        ");
        $okrStmt->execute($okrParams);
        $okrStats = $okrStmt->fetch(PDO::FETCH_ASSOC);

        // Review Stats
        $revWhere = ['cycle_id = ?'];
        $revParams = [$cId];
        if ($userId !== null) {
            $revWhere[] = 'user_id = ?';
            $revParams[] = $userId;
        }
        $revWhereClause = implode(' AND ', $revWhere);

        $revStmt = $this->db->prepare("
            SELECT 
                COUNT(*) AS total_reviews,
                SUM(CASE WHEN `status` = 'Pending Self-Review' THEN 1 ELSE 0 END) AS pending_self,
                SUM(CASE WHEN `status` = 'Pending Manager Review' THEN 1 ELSE 0 END) AS pending_manager,
                SUM(CASE WHEN `status` = 'Finalized' THEN 1 ELSE 0 END) AS finalized_reviews,
                SUM(CASE WHEN `payroll_increment_applied` = 1 THEN 1 ELSE 0 END) AS payroll_applied_count,
                AVG(final_rating) AS avg_rating
            FROM `performance_reviews`
            WHERE {$revWhereClause}
        ");
        $revStmt->execute($revParams);
        $revStats = $revStmt->fetch(PDO::FETCH_ASSOC);

        return [
            'cycle' => $cycle,
            'total_okrs'        => (int)($okrStats['total_okrs'] ?? 0),
            'avg_okr_progress'  => round((float)($okrStats['avg_progress'] ?? 0), 1),
            'completed_okrs'    => (int)($okrStats['completed_okrs'] ?? 0),
            'in_progress_okrs'  => (int)($okrStats['in_progress_okrs'] ?? 0),
            'total_reviews'     => (int)($revStats['total_reviews'] ?? 0),
            'pending_self'      => (int)($revStats['pending_self'] ?? 0),
            'pending_manager'   => (int)($revStats['pending_manager'] ?? 0),
            'finalized_reviews' => (int)($revStats['finalized_reviews'] ?? 0),
            'payroll_applied'   => (int)($revStats['payroll_applied_count'] ?? 0),
            'avg_rating'        => round((float)($revStats['avg_rating'] ?? 0), 2)
        ];
    }
}
