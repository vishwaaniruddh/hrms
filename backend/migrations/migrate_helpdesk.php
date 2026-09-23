<?php
/**
 * Database Migration - Internal HR Helpdesk & Employee Ticketing System (Option 5)
 * Tables: `helpdesk_categories`, `helpdesk_tickets`, `helpdesk_messages`
 */
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance();
    echo "Running HR Helpdesk & Ticketing System Migration...\n";

    // 1. Create categories table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `helpdesk_categories` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(100) NOT NULL,
            `code` VARCHAR(50) NOT NULL UNIQUE,
            `description` VARCHAR(255) DEFAULT NULL,
            `icon` VARCHAR(50) NOT NULL DEFAULT 'HelpCircle',
            `color` VARCHAR(30) NOT NULL DEFAULT '#10b981',
            `sla_urgent_hrs` INT UNSIGNED NOT NULL DEFAULT 4,
            `sla_high_hrs` INT UNSIGNED NOT NULL DEFAULT 12,
            `sla_medium_hrs` INT UNSIGNED NOT NULL DEFAULT 24,
            `sla_low_hrs` INT UNSIGNED NOT NULL DEFAULT 48,
            `is_active` TINYINT(1) NOT NULL DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `helpdesk_categories` ready.\n";

    // 2. Create tickets table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `helpdesk_tickets` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `ticket_number` VARCHAR(50) NOT NULL UNIQUE,
            `user_id` INT UNSIGNED NOT NULL,
            `category_id` INT UNSIGNED NOT NULL,
            `priority` ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL DEFAULT 'Medium',
            `status` ENUM('Open', 'In Progress', 'Waiting on Employee', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
            `subject` VARCHAR(255) NOT NULL,
            `description` TEXT NOT NULL,
            `assigned_to` INT UNSIGNED DEFAULT NULL,
            `is_confidential` TINYINT(1) NOT NULL DEFAULT 0,
            `sla_due_at` DATETIME NOT NULL,
            `resolved_at` DATETIME DEFAULT NULL,
            `closed_at` DATETIME DEFAULT NULL,
            `csat_rating` TINYINT UNSIGNED DEFAULT NULL,
            `csat_feedback` TEXT DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_ticket_status (`status`),
            INDEX idx_ticket_priority (`priority`),
            INDEX idx_ticket_user (`user_id`),
            INDEX idx_ticket_assigned (`assigned_to`),
            INDEX idx_ticket_confidential (`is_confidential`),
            FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`category_id`) REFERENCES `helpdesk_categories` (`id`) ON DELETE RESTRICT,
            FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `helpdesk_tickets` ready.\n";

    // 3. Create messages table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `helpdesk_messages` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `ticket_id` INT UNSIGNED NOT NULL,
            `user_id` INT UNSIGNED NOT NULL,
            `message` TEXT NOT NULL,
            `is_internal_note` TINYINT(1) NOT NULL DEFAULT 0,
            `attachment_path` VARCHAR(255) DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_msg_ticket (`ticket_id`),
            FOREIGN KEY (`ticket_id`) REFERENCES `helpdesk_tickets` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `helpdesk_messages` ready.\n";

    // 4. Seed Categories if empty
    $catCheck = $db->query("SELECT COUNT(*) FROM `helpdesk_categories`")->fetchColumn();
    if ($catCheck == 0) {
        $db->exec("
            INSERT INTO `helpdesk_categories` (`name`, `code`, `description`, `icon`, `color`, `sla_urgent_hrs`, `sla_high_hrs`, `sla_medium_hrs`, `sla_low_hrs`) VALUES
            ('Payroll & Tax Withholding', 'PAYROLL', 'Salary computation errors, tax exemptions, bonus queries and payslip corrections.', 'DollarSign', '#10b981', 4, 12, 24, 48),
            ('IT & Hardware Infrastructure', 'IT-SUPPORT', 'Laptop issues, VPN setup, peripheral requests, access permissions and email configuration.', 'Laptop', '#3b82f6', 2, 8, 24, 48),
            ('HR Policies & Employee Benefits', 'HR-POLICY', 'Leave carryover policy, medical insurance enrollment, maternity/paternity guidelines.', 'Briefcase', '#8b5cf6', 6, 18, 36, 72),
            ('Workplace Grievance & Ethics', 'GRIEVANCE', 'Strictly confidential escalation for harassment, ethical misconduct or workplace disputes.', 'ShieldAlert', '#ef4444', 4, 12, 24, 48),
            ('Facilities & Office Admin', 'FACILITIES', 'Desk allocation, ID card replacement, visitor passes, cafeteria and parking queries.', 'Building2', '#f59e0b', 8, 24, 48, 96);
        ");
        echo "  [OK] Seeded 5 standard Helpdesk Categories.\n";
    }

    // 5. Seed Realistic Sample Tickets if empty
    $ticketCheck = $db->query("SELECT COUNT(*) FROM `helpdesk_tickets`")->fetchColumn();
    if ($ticketCheck == 0) {
        // Fetch active users for ticket anchors
        $users = $db->query("SELECT u.`id`, u.`full_name`, r.`name` as `role` FROM `users` u LEFT JOIN `roles` r ON u.`role_id` = r.`id` WHERE u.`status` = 'Active' LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
        $empUser = $users[0] ?? ['id' => 1];
        $empUser2 = $users[1] ?? $empUser;
        $adminUser = null;
        foreach ($users as $u) {
            if ($u['role'] === 'Admin') {
                $adminUser = $u;
                break;
            }
        }
        if (!$adminUser) $adminUser = $users[0] ?? ['id' => 1];

        $now = date('Y-m-d H:i:s');
        $dueUrgent = date('Y-m-d H:i:s', strtotime('+4 hours'));
        $dueHigh = date('Y-m-d H:i:s', strtotime('+12 hours'));
        $dueMedium = date('Y-m-d H:i:s', strtotime('+24 hours'));
        $duePast = date('Y-m-d H:i:s', strtotime('-2 days'));
        $resolvedPast = date('Y-m-d H:i:s', strtotime('-1 day'));

        // Ticket 1: Urgent Payroll TDS query (In Progress)
        $db->exec("
            INSERT INTO `helpdesk_tickets` (`ticket_number`, `user_id`, `category_id`, `priority`, `status`, `subject`, `description`, `assigned_to`, `is_confidential`, `sla_due_at`, `created_at`) VALUES
            ('TKT-2026-0001', {$empUser['id']}, 1, 'Urgent', 'In Progress', 'Discrepancy in August Monthly Payslip TDS Deduction', 'My payslip shows an extra $240 TDS deduction compared to the submitted 80C declaration. Kindly review and adjust in the September disbursement cycle.', {$adminUser['id']}, 0, '{$dueUrgent}', '{$now}');
        ");
        $t1Id = $db->lastInsertId();

        // Messages for Ticket 1
        $db->exec("
            INSERT INTO `helpdesk_messages` (`ticket_id`, `user_id`, `message`, `is_internal_note`, `created_at`) VALUES
            ({$t1Id}, {$empUser['id']}, 'Submitted declaration copy and bank statement for reference.', 0, '{$now}'),
            ({$t1Id}, {$adminUser['id']}, 'Auditing tax ledger with Finance Department. Component adjustment prepared.', 1, '{$now}'),
            ({$t1Id}, {$adminUser['id']}, 'Hello! We have reviewed your 80C submission and identified the missing receipt. It will be credited back in your next pay run.', 0, '{$now}');
        ");

        // Ticket 2: IT Hardware replacement (Open)
        $db->exec("
            INSERT INTO `helpdesk_tickets` (`ticket_number`, `user_id`, `category_id`, `priority`, `status`, `subject`, `description`, `assigned_to`, `is_confidential`, `sla_due_at`, `created_at`) VALUES
            ('TKT-2026-0002', {$empUser2['id']}, 2, 'High', 'Open', 'MacBook USB-C Multiport Dock Power Failure', 'The issued Dell Thunderbolt dock is no longer charging the laptop or recognizing external display monitors.', NULL, 0, '{$dueHigh}', '{$now}');
        ");

        // Ticket 3: Confidential Workplace Grievance (Waiting on Employee)
        $db->exec("
            INSERT INTO `helpdesk_tickets` (`ticket_number`, `user_id`, `category_id`, `priority`, `status`, `subject`, `description`, `assigned_to`, `is_confidential`, `sla_due_at`, `created_at`) VALUES
            ('TKT-2026-0003', {$empUser['id']}, 4, 'High', 'Waiting on Employee', 'Confidential Inquiry Regarding Team Shift Reassignment', 'Reporting unfair night roster allocations occurring repeatedly over the past 2 months despite medical exemption submission.', {$adminUser['id']}, 1, '{$dueMedium}', '{$now}');
        ");
        $t3Id = $db->lastInsertId();
        $db->exec("
            INSERT INTO `helpdesk_messages` (`ticket_id`, `user_id`, `message`, `is_internal_note`, `created_at`) VALUES
            ({$t3Id}, {$adminUser['id']}, 'Thank you for reaching out in confidence. Could you please share the physician recommendation letter so we can calibrate with Clinical Shift Planning?', 0, '{$now}');
        ");

        // Ticket 4: Facilities request (Resolved & CSAT 5-star)
        $db->exec("
            INSERT INTO `helpdesk_tickets` (`ticket_number`, `user_id`, `category_id`, `priority`, `status`, `subject`, `description`, `assigned_to`, `is_confidential`, `sla_due_at`, `resolved_at`, `closed_at`, `csat_rating`, `csat_feedback`, `created_at`) VALUES
            ('TKT-2026-0004', {$empUser2['id']}, 5, 'Low', 'Closed', 'Building Access Badge RFID Reprogramming', 'Smart card scanner is not opening the 3rd floor pharmacy research wing door.', {$adminUser['id']}, 0, '{$duePast}', '{$resolvedPast}', '{$resolvedPast}', 5, 'Super prompt assistance by office security desk! Fixed in 15 minutes.', '{$duePast}');
        ");

        echo "  [OK] Seeded 4 realistic sample helpdesk tickets with message threads and CSAT feedback.\n";
    }

    echo "HR Helpdesk & Ticketing System Migration successfully completed!\n";

} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
