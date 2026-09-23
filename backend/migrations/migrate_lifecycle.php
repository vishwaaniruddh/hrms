<?php
/**
 * Database Migration - Employee Onboarding & Offboarding Lifecycle (Exit Management)
 * Tables: `lifecycle_workflows`, `lifecycle_tasks`
 */
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance();
    echo "Running Employee Lifecycle & Exit Management Migration...\n";

    // 1. Create lifecycle_workflows table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `lifecycle_workflows` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `workflow_code` VARCHAR(50) NOT NULL UNIQUE,
            `user_id` INT UNSIGNED NOT NULL,
            `type` ENUM('Onboarding', 'Offboarding') NOT NULL,
            `title` VARCHAR(150) NOT NULL,
            `status` ENUM('Draft', 'In Progress', 'Completed', 'Cancelled', 'On Hold') NOT NULL DEFAULT 'In Progress',
            `progress_percent` INT UNSIGNED NOT NULL DEFAULT 0,
            `target_date` DATE NOT NULL,
            `resignation_date` DATE DEFAULT NULL,
            `notice_period_days` INT NOT NULL DEFAULT 30,
            `reason` VARCHAR(255) DEFAULT NULL,
            `exit_interview_notes` TEXT DEFAULT NULL,
            `created_by` INT UNSIGNED DEFAULT NULL,
            `completed_at` DATETIME DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `lifecycle_workflows` ready.\n";

    // 2. Create lifecycle_tasks table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `lifecycle_tasks` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `workflow_id` INT UNSIGNED NOT NULL,
            `title` VARCHAR(150) NOT NULL,
            `department` ENUM('HR', 'IT', 'Finance', 'Operations', 'Department Head') NOT NULL,
            `assigned_to` INT UNSIGNED DEFAULT NULL,
            `status` ENUM('Pending', 'In Progress', 'Completed', 'Waived') NOT NULL DEFAULT 'Pending',
            `due_date` DATE DEFAULT NULL,
            `completed_at` DATETIME DEFAULT NULL,
            `completed_by` INT UNSIGNED DEFAULT NULL,
            `notes` TEXT DEFAULT NULL,
            `order_index` INT NOT NULL DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (`workflow_id`) REFERENCES `lifecycle_workflows` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `lifecycle_tasks` ready.\n";

    // 3. Seed Workflows & Checklists if empty
    $count = $db->query("SELECT COUNT(*) FROM `lifecycle_workflows`")->fetchColumn();
    if ($count == 0) {
        echo "  Seeding realistic Onboarding and Offboarding workflows...\n";

        // Fetch valid user IDs
        $userStmt = $db->query("SELECT id, full_name, designation FROM users ORDER BY id ASC LIMIT 5");
        $users = $userStmt->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($users)) {
            $u1 = $users[0]; // Admin / Primary user
            $u2 = isset($users[1]) ? $users[1] : $u1;
            $u3 = isset($users[2]) ? $users[2] : $u1;

            // Workflow 1: Active Engineering Onboarding for User 2 (or User 1)
            $w1Code = 'ONB-2026-001';
            $w1Title = "New Hire Onboarding — " . $u2['full_name'];
            $targetDate1 = date('Y-m-d', strtotime('+7 days'));
            $db->prepare("
                INSERT INTO `lifecycle_workflows` 
                (`workflow_code`, `user_id`, `type`, `title`, `status`, `progress_percent`, `target_date`, `created_by`)
                VALUES (?, ?, 'Onboarding', ?, 'In Progress', 62, ?, ?)
            ")->execute([$w1Code, $u2['id'], $w1Title, $targetDate1, $u1['id']]);
            $w1Id = $db->lastInsertId();

            // Tasks for Workflow 1 (Onboarding)
            $onboardingTasks = [
                ['title' => 'Sign NDA & Employee Code of Conduct', 'dept' => 'HR', 'status' => 'Completed', 'notes' => 'Digitally signed via DocuSign'],
                ['title' => 'Submit Identity & Address Proofs for Background Check', 'dept' => 'HR', 'status' => 'Completed', 'notes' => 'Passport and SSN verified'],
                ['title' => 'Provision MacBook Pro & IT Security Token', 'dept' => 'IT', 'status' => 'Completed', 'notes' => 'MacBook M3 Pro assigned (AST-LAP-001)'],
                ['title' => 'Create Google Workspace & Slack Accounts', 'dept' => 'IT', 'status' => 'Completed', 'notes' => 'SSO credentials activated'],
                ['title' => 'Setup Payroll & Direct Deposit Bank Details', 'dept' => 'Finance', 'status' => 'Completed', 'notes' => 'Routing and account verified'],
                ['title' => 'Team Welcome Lunch & Culture Orientation', 'dept' => 'HR', 'status' => 'In Progress', 'notes' => 'Scheduled for Monday at 12:30 PM'],
                ['title' => 'Assign Onboarding Mentor / Buddy Sync', 'dept' => 'Department Head', 'status' => 'Pending', 'notes' => 'Senior engineer assigned for first 30 days'],
                ['title' => '30-Day New Hire Review & Goal Setting', 'dept' => 'Department Head', 'status' => 'Pending', 'notes' => 'Review OKRs and milestones']
            ];

            $order = 1;
            foreach ($onboardingTasks as $t) {
                $completedAt = $t['status'] === 'Completed' ? date('Y-m-d H:i:s', strtotime('-2 days')) : null;
                $db->prepare("
                    INSERT INTO `lifecycle_tasks`
                    (`workflow_id`, `title`, `department`, `status`, `due_date`, `completed_at`, `notes`, `order_index`)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ")->execute([
                    $w1Id, 
                    $t['title'], 
                    $t['dept'], 
                    $t['status'], 
                    $targetDate1, 
                    $completedAt, 
                    $t['notes'], 
                    $order++
                ]);
            }

            // Workflow 2: Active Resignation & Offboarding Clearance for User 3 (or User 2)
            $targetUser = isset($users[2]) ? $users[2] : (isset($users[1]) ? $users[1] : $users[0]);
            $w2Code = 'OFF-2026-001';
            $w2Title = "Resignation & Exit Clearance — " . $targetUser['full_name'];
            $resignationDate = date('Y-m-d', strtotime('-14 days'));
            $lwd = date('Y-m-d', strtotime('+16 days')); // Last working day
            $db->prepare("
                INSERT INTO `lifecycle_workflows` 
                (`workflow_code`, `user_id`, `type`, `title`, `status`, `progress_percent`, `target_date`, `resignation_date`, `notice_period_days`, `reason`, `exit_interview_notes`, `created_by`)
                VALUES (?, ?, 'Offboarding', ?, 'In Progress', 50, ?, ?, 30, 'Pursuing Higher Education & Relocation', 'Positive feedback regarding team engineering culture and mentorship.', ?)
            ")->execute([$w2Code, $targetUser['id'], $w2Title, $lwd, $resignationDate, $u1['id']]);
            $w2Id = $db->lastInsertId();

            // Tasks for Workflow 2 (Offboarding)
            $offboardingTasks = [
                ['title' => 'Resignation Acceptance & Notice Period Agreement', 'dept' => 'HR', 'status' => 'Completed', 'notes' => 'Formal notice accepted by management'],
                ['title' => 'Project Knowledge Transfer & Code Handover', 'dept' => 'Department Head', 'status' => 'Completed', 'notes' => 'Architecture documentation completed in Notion'],
                ['title' => 'Return IT Hardware (Laptop, Monitor, Security Key)', 'dept' => 'IT', 'status' => 'Pending', 'notes' => 'Due on last working day'],
                ['title' => 'Revoke Email, Slack, GitHub, & VPN Access', 'dept' => 'IT', 'status' => 'Pending', 'notes' => 'Scheduled for deactivation on LWD 6:00 PM'],
                ['title' => 'Audit Company Credit Card & Expense Receipts', 'dept' => 'Finance', 'status' => 'Completed', 'notes' => 'Zero outstanding balance'],
                ['title' => 'Calculate Final Settlement (Leave Encashment & Gratuity)', 'dept' => 'Finance', 'status' => 'Pending', 'notes' => 'Awaiting IT clearance for final disbursal sign-off'],
                ['title' => 'Conduct Formal HR Exit Interview Survey', 'dept' => 'HR', 'status' => 'Completed', 'notes' => 'Exit survey feedback logged'],
                ['title' => 'Issue Relieving Letter & Service Experience Certificate', 'dept' => 'HR', 'status' => 'Pending', 'notes' => 'Generated upon final clearance approval']
            ];

            $order = 1;
            foreach ($offboardingTasks as $t) {
                $completedAt = $t['status'] === 'Completed' ? date('Y-m-d H:i:s', strtotime('-5 days')) : null;
                $db->prepare("
                    INSERT INTO `lifecycle_tasks`
                    (`workflow_id`, `title`, `department`, `status`, `due_date`, `completed_at`, `notes`, `order_index`)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ")->execute([
                    $w2Id, 
                    $t['title'], 
                    $t['dept'], 
                    $t['status'], 
                    $lwd, 
                    $completedAt, 
                    $t['notes'], 
                    $order++
                ]);
            }

            // Workflow 3: Completed Onboarding Example
            $w3Code = 'ONB-2026-002';
            $w3Title = "Product Operations Onboarding — " . $u1['full_name'];
            $targetDate3 = date('Y-m-d', strtotime('-30 days'));
            $db->prepare("
                INSERT INTO `lifecycle_workflows` 
                (`workflow_code`, `user_id`, `type`, `title`, `status`, `progress_percent`, `target_date`, `completed_at`, `created_by`)
                VALUES (?, ?, 'Onboarding', ?, 'Completed', 100, ?, ?, ?)
            ")->execute([$w3Code, $u1['id'], $w3Title, $targetDate3, date('Y-m-d H:i:s', strtotime('-5 days')), $u1['id']]);
            $w3Id = $db->lastInsertId();

            $completedTasks = [
                ['title' => 'Sign NDA & Security Documentation', 'dept' => 'HR', 'status' => 'Completed'],
                ['title' => 'Hardware & Peripheral Issuance', 'dept' => 'IT', 'status' => 'Completed'],
                ['title' => 'Bank Account Verification & Tax Setup', 'dept' => 'Finance', 'status' => 'Completed'],
                ['title' => '30-Day Check-in & Manager Sign-off', 'dept' => 'Department Head', 'status' => 'Completed'],
            ];

            $order = 1;
            foreach ($completedTasks as $t) {
                $db->prepare("
                    INSERT INTO `lifecycle_tasks`
                    (`workflow_id`, `title`, `department`, `status`, `due_date`, `completed_at`, `order_index`)
                    VALUES (?, ?, ?, 'Completed', ?, ?, ?)
                ")->execute([
                    $w3Id, 
                    $t['title'], 
                    $t['dept'], 
                    $targetDate3, 
                    date('Y-m-d H:i:s', strtotime('-6 days')), 
                    $order++
                ]);
            }
        }
        echo "  [OK] Seeded 3 sample lifecycle workflows.\n";
    }

    echo "Lifecycle & Exit Management Migration completed successfully!\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
