<?php
/**
 * Database Migration - Recruitment & Hiring Pipeline (ATS)
 * Tables: `job_openings`, `job_candidates`, `candidate_activity_logs`
 */
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance();
    echo "Running Recruitment & Hiring Pipeline (ATS) Migration...\n";

    // 1. Create job_openings table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `job_openings` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `job_code` VARCHAR(50) NOT NULL UNIQUE,
            `title` VARCHAR(150) NOT NULL,
            `department` VARCHAR(100) NOT NULL,
            `location` ENUM('Remote', 'On-site', 'Hybrid') NOT NULL DEFAULT 'Hybrid',
            `employment_type` ENUM('Full-time', 'Part-time', 'Contract', 'Internship') NOT NULL DEFAULT 'Full-time',
            `experience_level` ENUM('Entry', 'Mid', 'Senior', 'Lead') NOT NULL DEFAULT 'Mid',
            `salary_min` DECIMAL(12,2) DEFAULT NULL,
            `salary_max` DECIMAL(12,2) DEFAULT NULL,
            `positions_count` INT UNSIGNED NOT NULL DEFAULT 1,
            `status` ENUM('Draft', 'Published', 'Closed', 'Archived') NOT NULL DEFAULT 'Published',
            `description` TEXT DEFAULT NULL,
            `requirements` TEXT DEFAULT NULL,
            `hiring_manager_id` INT UNSIGNED DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (`hiring_manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `job_openings` ready.\n";

    // 2. Create job_candidates table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `job_candidates` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `job_id` INT UNSIGNED NOT NULL,
            `candidate_code` VARCHAR(50) NOT NULL UNIQUE,
            `full_name` VARCHAR(150) NOT NULL,
            `email` VARCHAR(150) NOT NULL,
            `phone` VARCHAR(30) DEFAULT NULL,
            `current_company` VARCHAR(150) DEFAULT NULL,
            `experience_years` DECIMAL(4,1) NOT NULL DEFAULT 0.0,
            `expected_salary` DECIMAL(12,2) DEFAULT NULL,
            `source` ENUM('LinkedIn', 'Career Page', 'Referral', 'Indeed', 'Agency', 'Other') NOT NULL DEFAULT 'LinkedIn',
            `stage` ENUM('Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected') NOT NULL DEFAULT 'Applied',
            `rating` TINYINT UNSIGNED NOT NULL DEFAULT 3,
            `resume_url` VARCHAR(255) DEFAULT NULL,
            `notes` TEXT DEFAULT NULL,
            `applied_at` DATE NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (`job_id`) REFERENCES `job_openings` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `job_candidates` ready.\n";

    // 3. Create candidate_activity_logs table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `candidate_activity_logs` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `candidate_id` INT UNSIGNED NOT NULL,
            `from_stage` VARCHAR(50) DEFAULT NULL,
            `to_stage` VARCHAR(50) NOT NULL,
            `note` VARCHAR(255) DEFAULT NULL,
            `performed_by` INT UNSIGNED DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`candidate_id`) REFERENCES `job_candidates` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `candidate_activity_logs` ready.\n";

    // 4. Seed initial realistic Job Openings if empty
    $countJobs = (int)$db->query("SELECT COUNT(*) FROM `job_openings`")->fetchColumn();
    if ($countJobs === 0) {
        $jobs = [
            [
                'code' => 'JOB-2026-001',
                'title' => 'Senior Full Stack Engineer',
                'dept' => 'Engineering',
                'loc' => 'Hybrid',
                'emp' => 'Full-time',
                'exp' => 'Senior',
                'min' => 4500.00,
                'max' => 6000.00,
                'pos' => 2,
                'desc' => 'We are seeking an experienced Full Stack Engineer to lead architectural design and development of enterprise HRMS and payroll services.',
                'req' => '5+ years experience with React, PHP/Node.js, relational databases, REST APIs, and high-performance caching.'
            ],
            [
                'code' => 'JOB-2026-002',
                'title' => 'Clinical Pharmacy Specialist',
                'dept' => 'Pharmacy Operations',
                'loc' => 'On-site',
                'emp' => 'Full-time',
                'exp' => 'Mid',
                'min' => 3200.00,
                'max' => 4200.00,
                'pos' => 3,
                'desc' => 'Manage prescription dispensing protocols, therapeutic patient consultations, and regulatory pharmaceutical compliance.',
                'req' => 'Licensed Pharmacist with minimum 3 years clinical or community healthcare experience.'
            ],
            [
                'code' => 'JOB-2026-003',
                'title' => 'HR Operations & Talent Specialist',
                'dept' => 'Human Resources',
                'loc' => 'Hybrid',
                'emp' => 'Full-time',
                'exp' => 'Mid',
                'min' => 2800.00,
                'max' => 3800.00,
                'pos' => 1,
                'desc' => 'Drive recruitment, onboarding experiences, statutory compliance registers, and employee engagement programs.',
                'req' => 'Proven background in HR generalist duties, labor laws, payroll coordination, and talent acquisition.'
            ],
            [
                'code' => 'JOB-2026-004',
                'title' => 'Product UI/UX Designer',
                'dept' => 'Product Design',
                'loc' => 'Remote',
                'emp' => 'Full-time',
                'exp' => 'Mid',
                'min' => 3000.00,
                'max' => 4000.00,
                'pos' => 1,
                'desc' => 'Design user-centric interfaces, design systems, micro-interactions, and workflows for cloud enterprise applications.',
                'req' => 'Proficiency in Figma, design tokens, responsive web layout principles, and user research workflows.'
            ],
            [
                'code' => 'JOB-2026-005',
                'title' => 'Financial Accountant & Auditor',
                'dept' => 'Finance & Accounting',
                'loc' => 'On-site',
                'emp' => 'Full-time',
                'exp' => 'Senior',
                'min' => 3500.00,
                'max' => 4800.00,
                'pos' => 1,
                'desc' => 'Oversee general ledgers, tax TDS filings, financial year-end audits, and statutory payroll disbursements.',
                'req' => 'CPA / ACCA or equivalent degree with 4+ years corporate accounting and taxation experience.'
            ],
            [
                'code' => 'JOB-2026-006',
                'title' => 'Pharmaceutical Sales Associate',
                'dept' => 'Sales & Business',
                'loc' => 'On-site',
                'emp' => 'Full-time',
                'exp' => 'Entry',
                'min' => 1800.00,
                'max' => 2500.00,
                'pos' => 4,
                'desc' => 'Engage healthcare clinics, handle point-of-sale customer interactions, and maintain product inventory merchandising.',
                'req' => 'Energetic communication skills with background in retail or healthcare customer service.'
            ]
        ];

        $insJob = $db->prepare("
            INSERT INTO `job_openings` 
            (`job_code`, `title`, `department`, `location`, `employment_type`, `experience_level`, `salary_min`, `salary_max`, `positions_count`, `description`, `requirements`, `hiring_manager_id`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ");

        foreach ($jobs as $j) {
            $insJob->execute([
                $j['code'], $j['title'], $j['dept'], $j['loc'], $j['emp'], $j['exp'], $j['min'], $j['max'], $j['pos'], $j['desc'], $j['req']
            ]);
        }
        echo "  [OK] Seeded " . count($jobs) . " initial job openings.\n";
    }

    // 5. Seed initial realistic Candidates across Kanban stages
    $countCandidates = (int)$db->query("SELECT COUNT(*) FROM `job_candidates`")->fetchColumn();
    if ($countCandidates === 0) {
        $firstJobId = (int)$db->query("SELECT id FROM `job_openings` WHERE `job_code` = 'JOB-2026-001'")->fetchColumn();
        $pharmJobId = (int)$db->query("SELECT id FROM `job_openings` WHERE `job_code` = 'JOB-2026-002'")->fetchColumn();
        $hrJobId    = (int)$db->query("SELECT id FROM `job_openings` WHERE `job_code` = 'JOB-2026-003'")->fetchColumn();
        $designId   = (int)$db->query("SELECT id FROM `job_openings` WHERE `job_code` = 'JOB-2026-004'")->fetchColumn();

        $candidates = [
            // Stage: Applied
            [
                'job_id' => $firstJobId, 'code' => 'APP-1001', 'name' => 'Marcus Vance', 'email' => 'marcus.vance@example.com',
                'phone' => '+1 (555) 234-5678', 'company' => 'Apex Cloud Inc.', 'exp' => 5.5, 'salary' => 5200.00,
                'source' => 'LinkedIn', 'stage' => 'Applied', 'rating' => 4, 'notes' => 'Strong background in full stack React + MySQL architecture.', 'date' => '2026-09-18'
            ],
            [
                'job_id' => $firstJobId, 'code' => 'APP-1002', 'name' => 'Elena Rostova', 'email' => 'elena.rostova@example.com',
                'phone' => '+1 (555) 345-6789', 'company' => 'FinTech Labs', 'exp' => 4.0, 'salary' => 4800.00,
                'source' => 'Career Page', 'stage' => 'Applied', 'rating' => 3, 'notes' => 'Solid API design background, reviewed initial portfolio.', 'date' => '2026-09-20'
            ],
            [
                'job_id' => $pharmJobId, 'code' => 'APP-1003', 'name' => 'Dr. Julian Morales', 'email' => 'julian.morales@example.com',
                'phone' => '+1 (555) 456-7890', 'company' => 'CityCare Health', 'exp' => 6.0, 'salary' => 3900.00,
                'source' => 'Indeed', 'stage' => 'Applied', 'rating' => 5, 'notes' => 'PharmD holder with comprehensive clinical inventory experience.', 'date' => '2026-09-21'
            ],

            // Stage: Screening
            [
                'job_id' => $firstJobId, 'code' => 'APP-1004', 'name' => 'Siddharth Patel', 'email' => 'sid.patel@example.com',
                'phone' => '+1 (555) 567-8901', 'company' => 'ByteForge Soft', 'exp' => 7.0, 'salary' => 5800.00,
                'source' => 'Referral', 'stage' => 'Screening', 'rating' => 5, 'notes' => 'Screening call completed by HR. Strong communication and tech stack match.', 'date' => '2026-09-15'
            ],
            [
                'job_id' => $designId, 'code' => 'APP-1005', 'name' => 'Chloe Dubois', 'email' => 'chloe.dubois@example.com',
                'phone' => '+1 (555) 678-9012', 'company' => 'Studio Pixel', 'exp' => 3.5, 'salary' => 3600.00,
                'source' => 'LinkedIn', 'stage' => 'Screening', 'rating' => 4, 'notes' => 'Impressive design system portfolio in Figma.', 'date' => '2026-09-16'
            ],
            [
                'job_id' => $hrJobId, 'code' => 'APP-1006', 'name' => 'Hannah Scott', 'email' => 'hannah.scott@example.com',
                'phone' => '+1 (555) 789-0123', 'company' => 'TalentHub Solutions', 'exp' => 4.5, 'salary' => 3400.00,
                'source' => 'LinkedIn', 'stage' => 'Screening', 'rating' => 4, 'notes' => 'Experienced with compliance filings and payroll onboarding.', 'date' => '2026-09-14'
            ],

            // Stage: Interview
            [
                'job_id' => $firstJobId, 'code' => 'APP-1007', 'name' => 'David Kim', 'email' => 'david.kim@example.com',
                'phone' => '+1 (555) 890-1234', 'company' => 'NextGen Digital', 'exp' => 6.5, 'salary' => 5500.00,
                'source' => 'LinkedIn', 'stage' => 'Interview', 'rating' => 5, 'notes' => 'Technical interview scheduled for Thursday 2:00 PM. Completed take-home test with 95% score.', 'date' => '2026-09-10'
            ],
            [
                'job_id' => $pharmJobId, 'code' => 'APP-1008', 'name' => 'Fatima Al-Mansoor', 'email' => 'fatima.almansoor@example.com',
                'phone' => '+1 (555) 901-2345', 'company' => 'Al-Amal Medical Center', 'exp' => 4.0, 'salary' => 3800.00,
                'source' => 'Agency', 'stage' => 'Interview', 'rating' => 4, 'notes' => 'Panel interview scheduled with Chief Pharmacist on Friday.', 'date' => '2026-09-12'
            ],
            [
                'job_id' => $designId, 'code' => 'APP-1009', 'name' => 'Oliver Wright', 'email' => 'oliver.wright@example.com',
                'phone' => '+1 (555) 012-3456', 'company' => 'Kreativ Lab', 'exp' => 5.0, 'salary' => 3900.00,
                'source' => 'Referral', 'stage' => 'Interview', 'rating' => 4, 'notes' => 'Live design challenge review completed. Positive feedback from Product Lead.', 'date' => '2026-09-11'
            ],

            // Stage: Offer
            [
                'job_id' => $firstJobId, 'code' => 'APP-1010', 'name' => 'Aisha Rahman', 'email' => 'aisha.rahman@example.com',
                'phone' => '+1 (555) 123-9876', 'company' => 'Synapse Corp', 'exp' => 6.0, 'salary' => 5400.00,
                'source' => 'LinkedIn', 'stage' => 'Offer', 'rating' => 5, 'notes' => 'Offer letter extended at $5,400/mo. Candidate reviewing benefits package.', 'date' => '2026-09-05'
            ],
            [
                'job_id' => $pharmJobId, 'code' => 'APP-1011', 'name' => 'Lucas Bernard', 'email' => 'lucas.bernard@example.com',
                'phone' => '+1 (555) 234-8765', 'company' => 'PharmaPlus Clinic', 'exp' => 5.0, 'salary' => 4000.00,
                'source' => 'Career Page', 'stage' => 'Offer', 'rating' => 5, 'notes' => 'Written offer sent. Acceptance expected by end of week.', 'date' => '2026-09-08'
            ],

            // Stage: Hired
            [
                'job_id' => $firstJobId, 'code' => 'APP-1012', 'name' => 'Alexander Hayes', 'email' => 'alex.hayes@example.com',
                'phone' => '+1 (555) 345-7654', 'company' => 'CloudScale Ltd.', 'exp' => 8.0, 'salary' => 5800.00,
                'source' => 'LinkedIn', 'stage' => 'Hired', 'rating' => 5, 'notes' => 'Offer accepted. Joining date set for October 1, 2026. Onboarding initiated.', 'date' => '2026-09-01'
            ],
            [
                'job_id' => $hrJobId, 'code' => 'APP-1013', 'name' => 'Grace Lin', 'email' => 'grace.lin@example.com',
                'phone' => '+1 (555) 456-6543', 'company' => 'Metro Health Systems', 'exp' => 5.0, 'salary' => 3600.00,
                'source' => 'Referral', 'stage' => 'Hired', 'rating' => 5, 'notes' => 'Contract signed. Laptop and badge provisioned in IT Asset system.', 'date' => '2026-08-28'
            ],

            // Stage: Rejected
            [
                'job_id' => $firstJobId, 'code' => 'APP-1014', 'name' => 'Dmitri Volkov', 'email' => 'dmitri.volkov@example.com',
                'phone' => '+1 (555) 567-5432', 'company' => 'Freelance', 'exp' => 2.0, 'salary' => 4500.00,
                'source' => 'Indeed', 'stage' => 'Rejected', 'rating' => 2, 'notes' => 'Insufficient experience in enterprise backend scaling and concurrency.', 'date' => '2026-09-02'
            ],
            [
                'job_id' => $designId, 'code' => 'APP-1015', 'name' => 'Zoe Martin', 'email' => 'zoe.martin@example.com',
                'phone' => '+1 (555) 678-4321', 'company' => 'AdMedia Works', 'exp' => 1.5, 'salary' => 3200.00,
                'source' => 'Career Page', 'stage' => 'Rejected', 'rating' => 2, 'notes' => 'Skills focused more on graphic marketing rather than software product UX.', 'date' => '2026-09-04'
            ]
        ];

        $insCand = $db->prepare("
            INSERT INTO `job_candidates`
            (`job_id`, `candidate_code`, `full_name`, `email`, `phone`, `current_company`, `experience_years`, `expected_salary`, `source`, `stage`, `rating`, `notes`, `applied_at`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $insLog = $db->prepare("
            INSERT INTO `candidate_activity_logs`
            (`candidate_id`, `from_stage`, `to_stage`, `note`, `performed_by`)
            VALUES (?, ?, ?, ?, 1)
        ");

        foreach ($candidates as $c) {
            $insCand->execute([
                $c['job_id'], $c['code'], $c['name'], $c['email'], $c['phone'], $c['company'], $c['exp'], $c['salary'], $c['source'], $c['stage'], $c['rating'], $c['notes'], $c['date']
            ]);
            $candId = (int)$db->lastInsertId();
            $insLog->execute([$candId, null, $c['stage'], 'Initial application processed in ' . $c['stage'] . ' stage']);
        }

        echo "  [OK] Seeded " . count($candidates) . " candidate profiles with activity logs.\n";
    }

    echo "Recruitment Migration Completed Successfully!\n";
} catch (Exception $e) {
    echo "Migration Error: " . $e->getMessage() . "\n";
    exit(1);
}
