<?php
/**
 * Recruitment & Hiring Pipeline (ATS) Unit Tests
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/RecruitmentModel.php';

class RecruitmentTest
{
    private PDO $db;
    private RecruitmentModel $model;
    private int $passed = 0;
    private int $failed = 0;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->model = new RecruitmentModel($this->db);
    }

    private function assert($condition, string $message): void
    {
        if ($condition) {
            echo "  \033[32m✔ PASS:\033[0m $message\n";
            $this->passed++;
        } else {
            echo "  \033[31m✖ FAIL:\033[0m $message\n";
            $this->failed++;
        }
    }

    public function getPassed(): int { return $this->passed; }
    public function getFailed(): int { return $this->failed; }

    public function run(): array
    {
        echo "\n── Recruitment & Hiring Pipeline (ATS) Tests ──\n";

        $this->testJobOpeningsRetrieval();
        $this->testJobOpeningCrud();
        $this->testCandidatePipelineKanban();
        $this->testCandidateStageTransitionAndAudit();
        $this->testRecruitmentStats();

        echo "  Recruitment Tests: {$this->passed} passed, {$this->failed} failed\n";
        return ['passed' => $this->passed, 'failed' => $this->failed];
    }

    private function testJobOpeningsRetrieval(): void
    {
        $result = $this->model->getOpenings();

        $this->assert(isset($result['data']), 'Openings query returns data key');
        $this->assert($result['total'] >= 6, 'At least 6 initial job openings retrieved (got: ' . $result['total'] . ')');

        $first = $result['data'][0];
        $this->assert(!empty($first['title']), 'Opening contains title: ' . ($first['title'] ?? ''));
        $this->assert(isset($first['total_candidates']), 'Opening calculates total candidates count');
        $this->assert(isset($first['count_interview']), 'Opening calculates interview stage candidates');

        // Test filtering by department
        $filtered = $this->model->getOpenings(['department' => 'Engineering']);
        $this->assert(count($filtered['data']) >= 1, 'Filter by Engineering department returned jobs');
        $this->assert($filtered['data'][0]['department'] === 'Engineering', 'Filtered job department matches');
    }

    private function testJobOpeningCrud(): void
    {
        // 1. Create opening
        $newJob = [
            'title'           => 'Staff DevOps Automation Engineer',
            'department'      => 'Engineering',
            'location'        => 'Remote',
            'employment_type' => 'Full-time',
            'experience_level'=> 'Lead',
            'salary_min'      => 5000.00,
            'salary_max'      => 6500.00,
            'positions_count' => 1,
            'status'          => 'Published',
            'description'     => 'CI/CD and Kubernetes infrastructure lead.'
        ];

        $jobId = $this->model->createOpening($newJob);
        $this->assert($jobId > 0, "Created test job opening with ID: $jobId");

        // 2. Read
        $fetched = $this->model->getOpeningById($jobId);
        $this->assert($fetched !== null, 'Fetched newly created job opening');
        $this->assert($fetched['title'] === 'Staff DevOps Automation Engineer', 'Job title matches');
        $this->assert(!empty($fetched['job_code']), 'Job code auto-generated: ' . $fetched['job_code']);

        // 3. Update
        $updated = $this->model->updateOpening($jobId, [
            'salary_max' => 7000.00,
            'status'     => 'Draft'
        ]);
        $this->assert($updated === true, 'Updated job opening attributes');
        $recheck = $this->model->getOpeningById($jobId);
        $this->assert((float)$recheck['salary_max'] === 7000.00, 'Updated salary ceiling verified');
        $this->assert($recheck['status'] === 'Draft', 'Updated status verified as Draft');

        // 4. Delete
        $deleted = $this->model->deleteOpening($jobId);
        $this->assert($deleted === true, 'Deleted test job opening');
        $this->assert($this->model->getOpeningById($jobId) === null, 'Verified deletion of job opening');
    }

    private function testCandidatePipelineKanban(): void
    {
        // 1. Flat candidate list
        $all = $this->model->getCandidates();
        $this->assert($all['total'] >= 15, 'Total candidate applications >= 15 (got: ' . $all['total'] . ')');

        $first = $all['data'][0];
        $this->assert(!empty($first['full_name']), 'Candidate record has name: ' . $first['full_name']);
        $this->assert(!empty($first['job_title']), 'Candidate joined with job title: ' . $first['job_title']);

        // 2. Kanban format
        $kanban = $this->model->getCandidates(['format' => 'kanban']);
        $this->assert(isset($kanban['stages']), 'Kanban format returned stages mapping');
        $this->assert(isset($kanban['stages']['Applied']), 'Kanban contains Applied stage column');
        $this->assert(isset($kanban['stages']['Screening']), 'Kanban contains Screening stage column');
        $this->assert(isset($kanban['stages']['Interview']), 'Kanban contains Interview stage column');
        $this->assert(isset($kanban['stages']['Offer']), 'Kanban contains Offer stage column');
        $this->assert(isset($kanban['stages']['Hired']), 'Kanban contains Hired stage column');

        $this->assert(count($kanban['stages']['Applied']) >= 1, 'Applied stage has candidates');
        $this->assert(count($kanban['stages']['Interview']) >= 1, 'Interview stage has candidates');
        $this->assert(count($kanban['stages']['Hired']) >= 1, 'Hired stage has candidates');
    }

    private function testCandidateStageTransitionAndAudit(): void
    {
        // Get a valid job ID
        $openings = $this->model->getOpenings();
        $jobId = (int)$openings['data'][0]['id'];

        // 1. Create candidate in Applied stage
        $candId = $this->model->createCandidate([
            'job_id'          => $jobId,
            'full_name'       => 'Test Pipeline Candidate',
            'email'           => 'pipeline.test@example.com',
            'phone'           => '+1 (555) 999-8888',
            'current_company' => 'Beta Systems',
            'experience_years'=> 4.5,
            'expected_salary' => 4500.00,
            'source'          => 'LinkedIn',
            'stage'           => 'Applied',
            'rating'          => 4,
            'notes'           => 'Initial application submission'
        ]);

        $this->assert($candId > 0, "Created candidate application with ID: $candId");

        // 2. Verify initial candidate & activity log
        $cand = $this->model->getCandidateById($candId);
        $this->assert($cand['stage'] === 'Applied', 'Candidate starts in Applied stage');
        $this->assert(count($cand['activity_logs']) >= 1, 'Initial activity log created');

        // 3. Move from Applied -> Screening
        $move1 = $this->model->updateCandidateStage($candId, 'Screening', 'Phone screening scheduled', 1);
        $this->assert($move1 === true, 'Successfully transitioned candidate to Screening');

        // 4. Move from Screening -> Interview
        $move2 = $this->model->updateCandidateStage($candId, 'Interview', 'Passed phone screen, technical interview booked', 1);
        $this->assert($move2 === true, 'Successfully transitioned candidate to Interview');

        // 5. Verify stage and updated activity logs
        $candAfter = $this->model->getCandidateById($candId);
        $this->assert($candAfter['stage'] === 'Interview', 'Candidate stage is now Interview');
        $this->assert(count($candAfter['activity_logs']) >= 3, 'Candidate has 3 recorded stage transition audit logs');
        $this->assert($candAfter['activity_logs'][0]['to_stage'] === 'Interview', 'Latest log reflects Interview stage');

        // 6. Clean up test candidate
        $deleted = $this->model->deleteCandidate($candId);
        $this->assert($deleted === true, 'Cleaned up test candidate record');
    }

    private function testRecruitmentStats(): void
    {
        $stats = $this->model->getStats();

        $this->assert(isset($stats['active_openings']), 'Stats includes active_openings');
        $this->assert($stats['active_openings'] >= 5, 'Active openings >= 5 (got: ' . $stats['active_openings'] . ')');
        $this->assert(isset($stats['total_candidates']), 'Stats includes total_candidates');
        $this->assert($stats['total_candidates'] >= 15, 'Total candidates >= 15 (got: ' . $stats['total_candidates'] . ')');
        $this->assert(isset($stats['in_pipeline']), 'Stats includes in_pipeline');
        $this->assert($stats['in_pipeline'] >= 5, 'Candidates in active pipeline >= 5 (got: ' . $stats['in_pipeline'] . ')');
        $this->assert(isset($stats['interviews_active']), 'Stats includes interviews_active');
        $this->assert(isset($stats['conversion_rate']), 'Stats includes hiring conversion_rate');
        $this->assert(isset($stats['by_stage']['Interview']), 'Stats includes by_stage interview breakdown');
    }
}
