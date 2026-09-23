<?php
/**
 * Database Migration - Performance Management & Appraisals (PMS)
 * Handles OKR & Goal Setting, 360 Review Cycles, Competency & 9-Box Matrix, and Payroll Link
 */
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance();
    echo "Running PMS (Performance Management & Appraisals) Migration...\n";

    // 1. Performance Cycles
    $db->exec("
        CREATE TABLE IF NOT EXISTS `performance_cycles` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `title` VARCHAR(150) NOT NULL,
            `period_type` ENUM('Quarterly', 'Bi-Annual', 'Annual') NOT NULL DEFAULT 'Annual',
            `year` INT UNSIGNED NOT NULL,
            `start_date` DATE NOT NULL,
            `end_date` DATE NOT NULL,
            `self_review_deadline` DATE NOT NULL,
            `manager_review_deadline` DATE NOT NULL,
            `status` ENUM('Draft', 'Active', 'In Review', 'Calibration', 'Finalized', 'Archived') NOT NULL DEFAULT 'Active',
            `description` TEXT DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `performance_cycles` ready.\n";

    // 2. Performance Competencies
    $db->exec("
        CREATE TABLE IF NOT EXISTS `performance_competencies` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(100) NOT NULL,
            `category` VARCHAR(50) NOT NULL DEFAULT 'Core Values',
            `description` TEXT DEFAULT NULL,
            `weight_pct` INT UNSIGNED NOT NULL DEFAULT 20,
            `is_active` TINYINT(1) NOT NULL DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `performance_competencies` ready.\n";

    // 3. Performance OKRs (Objectives)
    $db->exec("
        CREATE TABLE IF NOT EXISTS `performance_okrs` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `cycle_id` INT UNSIGNED NOT NULL,
            `user_id` INT UNSIGNED NOT NULL,
            `objective_title` VARCHAR(255) NOT NULL,
            `category` ENUM('Company Strategic', 'Department Milestone', 'Individual Growth', 'Operational Excellence') NOT NULL DEFAULT 'Department Milestone',
            `quarter` ENUM('Q1', 'Q2', 'Q3', 'Q4', 'Annual') NOT NULL DEFAULT 'Annual',
            `weight_pct` INT UNSIGNED NOT NULL DEFAULT 100,
            `progress_pct` INT UNSIGNED NOT NULL DEFAULT 0,
            `status` ENUM('Not Started', 'In Progress', 'At Risk', 'Completed') NOT NULL DEFAULT 'In Progress',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (`cycle_id`) REFERENCES `performance_cycles` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `performance_okrs` ready.\n";

    // 4. Performance Key Results
    $db->exec("
        CREATE TABLE IF NOT EXISTS `performance_key_results` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `okr_id` INT UNSIGNED NOT NULL,
            `title` VARCHAR(255) NOT NULL,
            `metric_type` ENUM('percentage', 'number', 'currency', 'boolean') NOT NULL DEFAULT 'percentage',
            `start_value` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            `target_value` DECIMAL(12,2) NOT NULL DEFAULT 100.00,
            `current_value` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            `weight_pct` INT UNSIGNED NOT NULL DEFAULT 100,
            `progress_pct` INT UNSIGNED NOT NULL DEFAULT 0,
            `status` ENUM('Pending', 'On Track', 'Behind', 'Achieved') NOT NULL DEFAULT 'On Track',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (`okr_id`) REFERENCES `performance_okrs` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `performance_key_results` ready.\n";

    // 5. Performance Reviews (360 Appraisals)
    $db->exec("
        CREATE TABLE IF NOT EXISTS `performance_reviews` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `cycle_id` INT UNSIGNED NOT NULL,
            `user_id` INT UNSIGNED NOT NULL,
            `manager_id` INT UNSIGNED NOT NULL,
            `self_rating` DECIMAL(3,2) DEFAULT NULL,
            `self_comments` TEXT DEFAULT NULL,
            `self_submitted_at` DATETIME DEFAULT NULL,
            `manager_rating` DECIMAL(3,2) DEFAULT NULL,
            `manager_potential_rating` ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
            `manager_performance_rating` ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
            `nine_box_quadrant` VARCHAR(60) DEFAULT NULL,
            `manager_comments` TEXT DEFAULT NULL,
            `strengths` TEXT DEFAULT NULL,
            `growth_areas` TEXT DEFAULT NULL,
            `manager_submitted_at` DATETIME DEFAULT NULL,
            `peer_feedback_summary` TEXT DEFAULT NULL,
            `final_rating` DECIMAL(3,2) DEFAULT NULL,
            `recommended_increment_pct` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            `payroll_increment_applied` TINYINT(1) NOT NULL DEFAULT 0,
            `payroll_applied_at` DATETIME DEFAULT NULL,
            `status` ENUM('Pending Self-Review', 'Pending Manager Review', 'Calibrating', 'Finalized', 'Acknowledged') NOT NULL DEFAULT 'Pending Self-Review',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (`cycle_id`) REFERENCES `performance_cycles` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `performance_reviews` ready.\n";

    // 6. Review Competency Scores
    $db->exec("
        CREATE TABLE IF NOT EXISTS `performance_review_competency_scores` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `review_id` INT UNSIGNED NOT NULL,
            `competency_id` INT UNSIGNED NOT NULL,
            `self_score` DECIMAL(3,2) DEFAULT NULL,
            `manager_score` DECIMAL(3,2) DEFAULT NULL,
            `comments` VARCHAR(255) DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`review_id`) REFERENCES `performance_reviews` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`competency_id`) REFERENCES `performance_competencies` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `performance_review_competency_scores` ready.\n";

    // 7. Peer Feedbacks
    $db->exec("
        CREATE TABLE IF NOT EXISTS `performance_peer_feedbacks` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `review_id` INT UNSIGNED NOT NULL,
            `reviewer_user_id` INT UNSIGNED NOT NULL,
            `relationship` ENUM('Peer', 'Direct Report', 'Cross-Functional Partner') NOT NULL DEFAULT 'Peer',
            `rating` DECIMAL(3,2) DEFAULT NULL,
            `feedback_text` TEXT DEFAULT NULL,
            `status` ENUM('Requested', 'Submitted', 'Declined') NOT NULL DEFAULT 'Requested',
            `submitted_at` DATETIME DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`review_id`) REFERENCES `performance_reviews` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`reviewer_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `performance_peer_feedbacks` ready.\n";

    // 8. Salary Increments (Appraisal to Payroll Link)
    $db->exec("
        CREATE TABLE IF NOT EXISTS `salary_increments` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `review_id` INT UNSIGNED NOT NULL,
            `user_id` INT UNSIGNED NOT NULL,
            `old_base_salary` DECIMAL(12,2) NOT NULL,
            `increment_pct` DECIMAL(5,2) NOT NULL,
            `increment_amount` DECIMAL(12,2) NOT NULL,
            `new_base_salary` DECIMAL(12,2) NOT NULL,
            `effective_date` DATE NOT NULL,
            `processed_by` INT UNSIGNED NOT NULL,
            `status` ENUM('Approved', 'Applied to Payroll') NOT NULL DEFAULT 'Applied to Payroll',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`review_id`) REFERENCES `performance_reviews` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `salary_increments` ready.\n";

    // ──────────────────────────────────────────
    // Seed Core Master Data & Realistic Scenarios
    // ──────────────────────────────────────────

    // Seed Competencies
    $db->exec("
        INSERT INTO `performance_competencies` (`name`, `category`, `description`, `weight_pct`) VALUES
        ('Technical Excellence & Quality', 'Functional Skills', 'Demonstrates high engineering standards, clean code architecture, and thoroughness.', 25),
        ('Ownership & Accountability', 'Core Values', 'Takes end-to-end responsibility for milestones, anticipates roadblocks, and delivers on commitments.', 20),
        ('Communication & Collaboration', 'Core Values', 'Shares knowledge proactively, supports cross-functional peers, and resolves conflicts constructively.', 20),
        ('Problem Solving & Innovation', 'Functional Skills', 'Proposes creative, efficient solutions to complex business bottlenecks and optimizes processes.', 20),
        ('Delivery Velocity & Reliability', 'Execution', 'Consistently hits project deadlines with predictable velocity and resilient system uptime.', 15)
        ON DUPLICATE KEY UPDATE `weight_pct` = VALUES(`weight_pct`);
    ");
    echo "  [OK] Seeded 5 core competencies.\n";

    // Seed Active Performance Cycle
    $cycleCheck = $db->query("SELECT id FROM `performance_cycles` WHERE `year` = 2026 LIMIT 1")->fetch();
    if (!$cycleCheck) {
        $db->exec("
            INSERT INTO `performance_cycles` 
            (`title`, `period_type`, `year`, `start_date`, `end_date`, `self_review_deadline`, `manager_review_deadline`, `status`, `description`) 
            VALUES 
            ('FY2026 Enterprise Performance & OKR Cycle', 'Annual', 2026, '2026-01-01', '2026-12-31', '2026-11-15', '2026-12-05', 'Active', 'Company-wide annual appraisal, 360 peer feedback, and salary revision appraisal review.')
        ");
        $cycleId = (int)$db->lastInsertId();
        echo "  [OK] Created FY2026 Performance Cycle (ID: {$cycleId}).\n";
    } else {
        $cycleId = (int)$cycleCheck['id'];
    }

    // Identify users for sample data
    $julian = $db->query("SELECT id FROM users WHERE email = 'julian.morales@example.com' OR full_name LIKE '%Julian Morales%' LIMIT 1")->fetch();
    $julianId = $julian ? (int)$julian['id'] : 36;

    $emma = $db->query("SELECT id FROM users WHERE email = 'emma.walker@example.com' OR full_name LIKE '%Emma Walker%' LIMIT 1")->fetch();
    $emmaId = $emma ? (int)$emma['id'] : 2;

    $adminId = 1;

    // Check & Seed OKRs for Julian Morales
    $okrCheck = $db->prepare("SELECT id FROM `performance_okrs` WHERE `user_id` = ? AND `cycle_id` = ?");
    $okrCheck->execute([$julianId, $cycleId]);
    if (!$okrCheck->fetch()) {
        // Objective 1: Clinical Platform
        $stmt = $db->prepare("
            INSERT INTO `performance_okrs` 
            (`cycle_id`, `user_id`, `objective_title`, `category`, `quarter`, `weight_pct`, `progress_pct`, `status`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $cycleId, 
            $julianId, 
            'Architect & Launch Next-Gen Clinical Drug Interaction Engine', 
            'Department Milestone', 
            'Q1', 
            50, 
            75, 
            'In Progress'
        ]);
        $okr1Id = (int)$db->lastInsertId();

        // KRs for Objective 1
        $krStmt = $db->prepare("
            INSERT INTO `performance_key_results` 
            (`okr_id`, `title`, `metric_type`, `start_value`, `target_value`, `current_value`, `weight_pct`, `progress_pct`, `status`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $krStmt->execute([$okr1Id, 'Achieve sub-50ms API response latency for 100k pharmacology records', 'number', 250, 50, 60, 50, 80, 'On Track']);
        $krStmt->execute([$okr1Id, 'Implement 100% automated test coverage for critical contraindication logic', 'percentage', 0, 100, 70, 50, 70, 'On Track']);

        // Objective 2: Quality & Compliance
        $stmt->execute([
            $cycleId, 
            $julianId, 
            'Achieve 99.95% System Reliability and HIPAA Compliance Certification', 
            'Operational Excellence', 
            'Q2', 
            50, 
            60, 
            'In Progress'
        ]);
        $okr2Id = (int)$db->lastInsertId();

        $krStmt->execute([$okr2Id, 'Conduct 3 quarterly security & privacy audit simulations with zero vulnerabilities', 'number', 0, 3, 2, 50, 66, 'On Track']);
        $krStmt->execute([$okr2Id, 'Publish comprehensive pharmacology API developer documentation', 'boolean', 0, 1, 1, 50, 100, 'Achieved']);

        echo "  [OK] Seeded Julian Morales OKRs and Key Results.\n";
    }

    // Seed OKRs for Emma Walker
    $okrCheck->execute([$emmaId, $cycleId]);
    if (!$okrCheck->fetch()) {
        $stmt = $db->prepare("
            INSERT INTO `performance_okrs` 
            (`cycle_id`, `user_id`, `objective_title`, `category`, `quarter`, `weight_pct`, `progress_pct`, `status`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $cycleId, 
            $emmaId, 
            'Scale Engineering Team Velocity and Reduce Cycle Time by 30%', 
            'Company Strategic', 
            'Annual', 
            100, 
            85, 
            'In Progress'
        ]);
        $okr3Id = (int)$db->lastInsertId();

        $krStmt = $db->prepare("
            INSERT INTO `performance_key_results` 
            (`okr_id`, `title`, `metric_type`, `start_value`, `target_value`, `current_value`, `weight_pct`, `progress_pct`, `status`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $krStmt->execute([$okr3Id, 'Mentor 4 senior engineers into tech lead roles', 'number', 0, 4, 3, 50, 75, 'On Track']);
        $krStmt->execute([$okr3Id, 'Maintain team sprint completion rate above 92%', 'percentage', 70, 95, 93, 50, 95, 'Achieved']);

        echo "  [OK] Seeded Emma Walker OKRs.\n";
    }

    // Seed Reviews in different 9-box quadrants
    $revCheck = $db->prepare("SELECT id FROM `performance_reviews` WHERE `user_id` = ? AND `cycle_id` = ?");
    $revCheck->execute([$julianId, $cycleId]);
    if (!$revCheck->fetch()) {
        $stmt = $db->prepare("
            INSERT INTO `performance_reviews` 
            (`cycle_id`, `user_id`, `manager_id`, `self_rating`, `self_comments`, `self_submitted_at`, 
             `manager_rating`, `manager_potential_rating`, `manager_performance_rating`, `nine_box_quadrant`, 
             `manager_comments`, `strengths`, `growth_areas`, `manager_submitted_at`, `final_rating`, 
             `recommended_increment_pct`, `payroll_increment_applied`, `status`)
            VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, 0, ?)
        ");
        $stmt->execute([
            $cycleId,
            $julianId,
            $emmaId,
            4.20,
            'I successfully redesigned our latency-critical pharmacology search pipelines and led the drug interaction indexing migration on schedule.',
            4.40,
            'High',
            'High',
            'Star / Future Leader',
            'Julian has demonstrated exceptional technical prowess and dependable delivery. Ready for senior architectural scope.',
            'Exceptional analytical depth, reliable execution, and deep domain healthcare context.',
            'Can take on greater cross-team mentorship and architecture presentations.',
            4.30,
            12.50, // 12.5% increment recommendation
            'Pending Manager Review' // Ready for final manager/admin review & payroll apply
        ]);
        $reviewJulianId = (int)$db->lastInsertId();

        // Seed Competency Scores for Julian
        $compList = $db->query("SELECT id FROM performance_competencies ORDER BY id ASC")->fetchAll(PDO::FETCH_COLUMN);
        $scoreStmt = $db->prepare("
            INSERT INTO `performance_review_competency_scores` 
            (`review_id`, `competency_id`, `self_score`, `manager_score`, `comments`)
            VALUES (?, ?, ?, ?, ?)
        ");
        $sampleScores = [
            ['self' => 4.5, 'mgr' => 4.6, 'note' => 'Consistently high quality code and architecture.'],
            ['self' => 4.0, 'mgr' => 4.2, 'note' => 'Strong ownership across product releases.'],
            ['self' => 4.0, 'mgr' => 4.0, 'note' => 'Clear communication in sprint reviews.'],
            ['self' => 4.3, 'mgr' => 4.5, 'note' => 'Proactive optimization of queries.'],
            ['self' => 4.2, 'mgr' => 4.3, 'note' => 'Hits project milestones reliably.']
        ];
        foreach ($compList as $idx => $cid) {
            $s = $sampleScores[$idx % count($sampleScores)];
            $scoreStmt->execute([$reviewJulianId, $cid, $s['self'], $s['mgr'], $s['note']]);
        }

        // Seed Peer Feedback for Julian
        $db->prepare("
            INSERT INTO `performance_peer_feedbacks` 
            (`review_id`, `reviewer_user_id`, `relationship`, `rating`, `feedback_text`, `status`, `submitted_at`)
            VALUES (?, ?, 'Peer', 4.5, 'Julian is super dependable and wrote the cleanest API endpoints in our sprint.', 'Submitted', NOW())
        ")->execute([$reviewJulianId, $emmaId]);

        echo "  [OK] Seeded 360 Review and Competencies for Julian Morales.\n";
    }

    // Seed additional reviews for 9-Box talent matrix spread (users in company)
    $otherUsers = $db->query("SELECT id FROM users WHERE id NOT IN ($julianId, 1) LIMIT 6")->fetchAll(PDO::FETCH_COLUMN);
    $quadrants = [
        ['perf' => 'High', 'pot' => 'Medium', 'box' => 'High Performer', 'rating' => 4.10, 'inc' => 10.0, 'status' => 'Finalized'],
        ['perf' => 'Medium', 'pot' => 'High', 'box' => 'High Potential / Growth Star', 'rating' => 3.80, 'inc' => 8.0, 'status' => 'Calibrating'],
        ['perf' => 'Medium', 'pot' => 'Medium', 'box' => 'Core Contributor', 'rating' => 3.30, 'inc' => 5.0, 'status' => 'Finalized'],
        ['perf' => 'High', 'pot' => 'Low', 'box' => 'Solid Professional', 'rating' => 3.70, 'inc' => 6.0, 'status' => 'Acknowledged'],
        ['perf' => 'Low', 'pot' => 'Medium', 'box' => 'Dilemma / Inconsistent', 'rating' => 2.40, 'inc' => 0.0, 'status' => 'Calibrating'],
    ];

    foreach ($otherUsers as $i => $uid) {
        $q = $quadrants[$i % count($quadrants)];
        $check = $db->prepare("SELECT id FROM `performance_reviews` WHERE `user_id` = ? AND `cycle_id` = ?");
        $check->execute([$uid, $cycleId]);
        if (!$check->fetch()) {
            $ins = $db->prepare("
                INSERT INTO `performance_reviews` 
                (`cycle_id`, `user_id`, `manager_id`, `self_rating`, `self_comments`, `self_submitted_at`, 
                 `manager_rating`, `manager_potential_rating`, `manager_performance_rating`, `nine_box_quadrant`, 
                 `manager_comments`, `final_rating`, `recommended_increment_pct`, `payroll_increment_applied`, `status`)
                VALUES (?, ?, ?, ?, 'Completed deliverables.', NOW(), ?, ?, ?, ?, 'Solid overall execution.', ?, ?, 0, ?)
            ");
            $ins->execute([
                $cycleId, 
                $uid, 
                $adminId, 
                $q['rating'], 
                $q['rating'], 
                $q['pot'], 
                $q['perf'], 
                $q['box'], 
                $q['rating'], 
                $q['inc'], 
                $q['status']
            ]);
        }
    }
    echo "  [OK] Seeded 9-Box talent distribution reviews.\n";

    echo "PMS Migration completed successfully!\n";
} catch (Exception $e) {
    echo "ERROR during PMS migration: " . $e->getMessage() . "\n";
    exit(1);
}
