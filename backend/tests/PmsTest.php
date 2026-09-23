<?php
/**
 * Automated Unit Tests for Performance Management & Appraisals (PMS)
 */
require_once __DIR__ . '/../models/PmsModel.php';
require_once __DIR__ . '/../config/Database.php';

class PmsTest
{
    private PDO $db;
    private PmsModel $model;
    private array $results = [];

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->model = new PmsModel($this->db);
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
        echo "\n── Performance Management & Appraisals (PMS) Tests ──\n";

        $this->testCyclesAndCompetencies();
        $this->testOkrLifecycle();
        $this->testReviewsAndSelfEvaluation();
        $this->testManagerAppraisalAndNineBox();
        $this->testTalentMatrix();
        $this->testAppraisalToPayrollLink();
        $this->testPmsStats();

        return $this->results;
    }

    private function testCyclesAndCompetencies(): void
    {
        $cycles = $this->model->getCycles();
        $this->assert(is_array($cycles) && count($cycles) >= 1, "Cycles query returns array with active cycle");
        $this->assert(!empty($cycles[0]['title']), "Cycle record contains title: {$cycles[0]['title']}");

        $active = $this->model->getActiveCycle();
        $this->assert($active !== null && $active['status'] === 'Active', "Active performance cycle identified");

        $competencies = $this->model->getCompetencies();
        $this->assert(count($competencies) >= 5, "At least 5 core competencies loaded (got: " . count($competencies) . ")");
        $compNames = array_column($competencies, 'name');
        $this->assert(in_array('Technical Excellence & Quality', $compNames), "Competencies include Technical Excellence & Quality");
    }

    private function testOkrLifecycle(): void
    {
        $active = $this->model->getActiveCycle();
        $cycleId = $active ? (int)$active['id'] : 1;

        // Fetch Julian's ID
        $user = $this->db->query("SELECT id FROM users WHERE email = 'julian.morales@example.com' OR full_name LIKE '%Julian Morales%' LIMIT 1")->fetch();
        $userId = $user ? (int)$user['id'] : 36;

        $okrs = $this->model->getOkrs(['user_id' => $userId, 'cycle_id' => $cycleId]);
        $this->assert(is_array($okrs) && count($okrs) >= 1, "Employee has assigned OKRs (found: " . count($okrs) . ")");
        $this->assert(!empty($okrs[0]['key_results']), "OKR has associated key results");

        // Create a new test OKR
        $testOkrId = $this->model->createOkr([
            'cycle_id' => $cycleId,
            'user_id' => $userId,
            'objective_title' => 'Test Automated Milestone Objective for Microservice Migration',
            'category' => 'Department Milestone',
            'quarter' => 'Q2',
            'weight_pct' => 100,
            'key_results' => [
                [
                    'title' => 'Migrate 5 legacy endpoints to fast async queue',
                    'metric_type' => 'number',
                    'start_value' => 0,
                    'target_value' => 5,
                    'current_value' => 0,
                    'weight_pct' => 50
                ],
                [
                    'title' => 'Achieve 95% latency reduction',
                    'metric_type' => 'percentage',
                    'start_value' => 0,
                    'target_value' => 100,
                    'current_value' => 0,
                    'weight_pct' => 50
                ]
            ]
        ]);
        $this->assert($testOkrId > 0, "Created test OKR with ID: {$testOkrId}");

        $createdOkr = $this->model->getOkrById($testOkrId);
        $this->assert(count($createdOkr['key_results']) === 2, "Created OKR contains exactly 2 key results");
        $this->assert($createdOkr['progress_pct'] === 0, "Initial OKR progress starts at 0%");

        // Update progress of first KR (3 out of 5 = 60%)
        $kr1 = $createdOkr['key_results'][0];
        $res1 = $this->model->updateKeyResultProgress((int)$kr1['id'], 3.0);
        $this->assert($res1['progress_pct'] === 60, "Key Result 1 progress updated to 60% (3/5)");

        // Update progress of second KR (80%)
        $kr2 = $createdOkr['key_results'][1];
        $res2 = $this->model->updateKeyResultProgress((int)$kr2['id'], 80.0);
        $this->assert($res2['progress_pct'] === 80, "Key Result 2 progress updated to 80%");

        // Verify parent OKR auto-recalculated to (60 + 80) / 2 = 70%
        $updatedOkr = $this->model->getOkrById($testOkrId);
        $this->assert($updatedOkr['progress_pct'] === 70, "Parent OKR progress auto-averaged to 70%");
        $this->assert($updatedOkr['status'] === 'In Progress', "Parent OKR status is In Progress");

        // Clean up test OKR
        $this->db->prepare("DELETE FROM `performance_okrs` WHERE `id` = ?")->execute([$testOkrId]);
        $this->assert(true, "Cleaned up test OKR record");
    }

    private function testReviewsAndSelfEvaluation(): void
    {
        $active = $this->model->getActiveCycle();
        $cycleId = $active ? (int)$active['id'] : 1;

        $user = $this->db->query("SELECT id FROM users WHERE email = 'julian.morales@example.com' OR full_name LIKE '%Julian Morales%' LIMIT 1")->fetch();
        $userId = $user ? (int)$user['id'] : 36;

        $reviews = $this->model->getReviews(['user_id' => $userId, 'cycle_id' => $cycleId]);
        $this->assert(count($reviews) >= 1, "Employee review record exists for cycle");

        $rev = $reviews[0];
        $reviewId = (int)$rev['id'];

        // Submit Self-Evaluation
        $selfSuccess = $this->model->submitSelfEvaluation($reviewId, [
            'self_rating' => 4.50,
            'self_comments' => 'Delivered all pharmacology services ahead of schedule and mentored team on unit testing.',
            'competencies' => [
                1 => ['score' => 4.8, 'comment' => 'Architected robust modular pipelines.'],
                2 => ['score' => 4.5, 'comment' => 'Took complete ownership of production releases.']
            ]
        ]);
        $this->assert($selfSuccess, "Employee self-evaluation submitted successfully");

        $updatedRev = $this->model->getReviewById($reviewId);
        $this->assert((float)$updatedRev['self_rating'] === 4.50, "Stored self-rating is 4.50");
        $this->assert($updatedRev['status'] === 'Pending Manager Review', "Review status moved to 'Pending Manager Review'");
    }

    private function testManagerAppraisalAndNineBox(): void
    {
        $active = $this->model->getActiveCycle();
        $cycleId = $active ? (int)$active['id'] : 1;

        $user = $this->db->query("SELECT id FROM users WHERE email = 'julian.morales@example.com' OR full_name LIKE '%Julian Morales%' LIMIT 1")->fetch();
        $userId = $user ? (int)$user['id'] : 36;

        $rev = $this->model->getReviews(['user_id' => $userId, 'cycle_id' => $cycleId])[0];
        $reviewId = (int)$rev['id'];

        // Manager submits evaluation: Performance=High, Potential=High
        $mgrSuccess = $this->model->submitManagerEvaluation($reviewId, [
            'manager_rating' => 4.60,
            'manager_performance_rating' => 'High',
            'manager_potential_rating' => 'High',
            'manager_comments' => 'Julian is a standout technical lead with strong initiative.',
            'strengths' => 'Architecture, code hygiene, dependability.',
            'growth_areas' => 'Executive presentation skills.',
            'final_rating' => 4.55,
            'recommended_increment_pct' => 15.00
        ]);
        $this->assert($mgrSuccess, "Manager appraisal submitted successfully");

        $finalRev = $this->model->getReviewById($reviewId);
        $this->assert($finalRev['nine_box_quadrant'] === 'Star / Future Leader', "9-Box quadrant auto-resolved to 'Star / Future Leader'");
        $this->assert((float)$finalRev['recommended_increment_pct'] === 15.00, "Recommended increment set to 15%");
        $this->assert($finalRev['status'] === 'Finalized', "Review transitioned to Finalized status");
    }

    private function testTalentMatrix(): void
    {
        $active = $this->model->getActiveCycle();
        $cycleId = $active ? (int)$active['id'] : 1;

        $matrix = $this->model->getTalentMatrix($cycleId);
        $this->assert(!empty($matrix['quadrants']), "9-Box talent matrix returned quadrants array");
        $this->assert(count($matrix['quadrants']) === 9, "Matrix contains all 9 standard performance-potential boxes");
        $this->assert(isset($matrix['quadrants']['Star / Future Leader']), "Matrix includes 'Star / Future Leader' quadrant");
        $this->assert(isset($matrix['quadrants']['Core Contributor']), "Matrix includes 'Core Contributor' quadrant");
        $this->assert($matrix['total_evaluated'] >= 1, "Talent matrix aggregates evaluated employees (count: {$matrix['total_evaluated']})");
    }

    private function testAppraisalToPayrollLink(): void
    {
        $active = $this->model->getActiveCycle();
        $cycleId = $active ? (int)$active['id'] : 1;

        $user = $this->db->query("SELECT id FROM users WHERE email = 'julian.morales@example.com' OR full_name LIKE '%Julian Morales%' LIMIT 1")->fetch();
        $userId = $user ? (int)$user['id'] : 36;

        $rev = $this->model->getReviews(['user_id' => $userId, 'cycle_id' => $cycleId])[0];
        $reviewId = (int)$rev['id'];

        // Ensure Julian has an initial salary structure
        $struct = $this->db->prepare("SELECT * FROM employee_salary_structures WHERE user_id = ?");
        $struct->execute([$userId]);
        $existing = $struct->fetch();
        if (!$existing) {
            $this->db->prepare("
                INSERT INTO employee_salary_structures (user_id, employment_type, base_salary, currency, effective_date, status)
                VALUES (?, 'Permanent', 5000.00, 'USD', '2026-01-01', 'Active')
            ")->execute([$userId]);
            $initialBase = 5000.00;
        } else {
            $initialBase = (float)$existing['base_salary'];
        }

        // Apply Increment: recommended is 15%
        $payrollResult = $this->model->applyIncrementToPayroll($reviewId, 1);
        $this->assert($payrollResult['status'] === 'Applied to Payroll', "Appraisal increment status is 'Applied to Payroll'");
        $this->assert($payrollResult['old_base_salary'] === $initialBase, "Logged initial base salary accurately: \${$initialBase}");

        $expectedNew = round($initialBase * 1.15, 2);
        $this->assert(abs($payrollResult['new_base_salary'] - $expectedNew) < 0.05, "Calculated +15% new base salary: \${$expectedNew}");

        // Verify salary structure was updated in the DB
        $struct->execute([$userId]);
        $updatedStruct = $struct->fetch();
        $this->assert(abs((float)$updatedStruct['base_salary'] - $expectedNew) < 0.05, "employee_salary_structures base_salary was updated to \${$expectedNew}");

        // Verify review marked as applied
        $checkRev = $this->model->getReviewById($reviewId);
        $this->assert((int)$checkRev['payroll_increment_applied'] === 1, "Review flagged payroll_increment_applied = 1");

        // Verify salary_increments audit log
        $increments = $this->model->getSalaryIncrements($userId);
        $this->assert(count($increments) >= 1, "salary_increments audit record logged for employee");
        $this->assert((float)$increments[0]['increment_pct'] === 15.00, "Audit log records 15% increment rate");
    }

    private function testPmsStats(): void
    {
        $stats = $this->model->getStats();
        $this->assert(isset($stats['total_okrs']), "Stats includes total_okrs");
        $this->assert(isset($stats['avg_okr_progress']), "Stats includes avg_okr_progress");
        $this->assert(isset($stats['total_reviews']), "Stats includes total_reviews");
        $this->assert(isset($stats['payroll_applied']), "Stats tracks payroll_applied increments count");
    }
}
