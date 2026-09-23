<?php
/**
 * Database Migration - Leave Management Tables
 */
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance();

    echo "Running Leave Management Migration...\n";

    // 1. Create leave_types
    $db->exec("
        CREATE TABLE IF NOT EXISTS `leave_types` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(50) NOT NULL,
            `code` VARCHAR(10) NOT NULL UNIQUE,
            `days_allowed_per_year` INT UNSIGNED NOT NULL DEFAULT 12,
            `is_paid` TINYINT(1) NOT NULL DEFAULT 1,
            `color` VARCHAR(20) DEFAULT 'emerald',
            `description` VARCHAR(255) DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `leave_types` ready.\n";

    // 2. Create leave_balances
    $db->exec("
        CREATE TABLE IF NOT EXISTS `leave_balances` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT UNSIGNED NOT NULL,
            `leave_type_id` INT UNSIGNED NOT NULL,
            `year` INT UNSIGNED NOT NULL,
            `total_days` DECIMAL(4,1) NOT NULL DEFAULT 0.0,
            `used_days` DECIMAL(4,1) NOT NULL DEFAULT 0.0,
            `pending_days` DECIMAL(4,1) NOT NULL DEFAULT 0.0,
            `remaining_days` DECIMAL(4,1) NOT NULL DEFAULT 0.0,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY `uk_user_type_year` (`user_id`, `leave_type_id`, `year`),
            FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `leave_balances` ready.\n";

    // 3. Create leave_requests
    $db->exec("
        CREATE TABLE IF NOT EXISTS `leave_requests` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT UNSIGNED NOT NULL,
            `leave_type_id` INT UNSIGNED NOT NULL,
            `start_date` DATE NOT NULL,
            `end_date` DATE NOT NULL,
            `total_days` DECIMAL(4,1) NOT NULL DEFAULT 1.0,
            `is_half_day` TINYINT(1) NOT NULL DEFAULT 0,
            `reason` TEXT NOT NULL,
            `status` ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') NOT NULL DEFAULT 'Pending',
            `approver_id` INT UNSIGNED DEFAULT NULL,
            `approver_remarks` TEXT DEFAULT NULL,
            `approved_at` TIMESTAMP NULL DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `leave_requests` ready.\n";

    // 4. Seed leave_types if empty
    $count = $db->query("SELECT COUNT(*) FROM `leave_types`")->fetchColumn();
    if ($count == 0) {
        $db->exec("
            INSERT INTO `leave_types` (`name`, `code`, `days_allowed_per_year`, `is_paid`, `color`, `description`) VALUES
            ('Casual Leave', 'CL', 12, 1, 'emerald', 'Personal affairs, unplanned short-term absences'),
            ('Sick Leave', 'SL', 10, 1, 'amber', 'Medical emergencies, illness and doctor visits'),
            ('Paid Annual Leave', 'PL', 15, 1, 'blue', 'Planned vacation and annual paid holidays'),
            ('Maternity / Paternity', 'ML', 90, 1, 'purple', 'Parental leave for childcare and new additions'),
            ('Unpaid Leave', 'LOP', 30, 0, 'slate', 'Loss of pay absence beyond allotted quotas');
        ");
        echo "  [OK] Seeded 5 leave types.\n";
    }

    // 5. Seed balances for all existing users for current year
    $currentYear = (int)date('Y');
    $users = $db->query("SELECT `id` FROM `users`")->fetchAll(PDO::FETCH_COLUMN);
    $leaveTypes = $db->query("SELECT `id`, `days_allowed_per_year` FROM `leave_types`")->fetchAll();

    $stmtBalance = $db->prepare("
        INSERT IGNORE INTO `leave_balances` (`user_id`, `leave_type_id`, `year`, `total_days`, `used_days`, `pending_days`, `remaining_days`)
        VALUES (?, ?, ?, ?, 0.0, 0.0, ?)
    ");

    foreach ($users as $userId) {
        foreach ($leaveTypes as $lt) {
            $stmtBalance->execute([
                $userId,
                $lt['id'],
                $currentYear,
                $lt['days_allowed_per_year'],
                $lt['days_allowed_per_year']
            ]);
        }
    }
    echo "  [OK] Seeded leave balances for " . count($users) . " users for year {$currentYear}.\n";

    // 6. Seed sample leave request if none exist
    $reqCount = $db->query("SELECT COUNT(*) FROM `leave_requests`")->fetchColumn();
    if ($reqCount == 0 && count($users) >= 2) {
        $db->exec("
            INSERT INTO `leave_requests` (`user_id`, `leave_type_id`, `start_date`, `end_date`, `total_days`, `reason`, `status`, `created_at`)
            VALUES 
            (2, 1, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY), 3.0, 'Family wedding out of town', 'Pending', NOW()),
            (2, 2, DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 9 DAY), 2.0, 'Seasonal viral flu', 'Approved', DATE_SUB(CURRENT_DATE, INTERVAL 11 DAY));
        ");
        // Update user 2 used_days for SL
        $db->exec("UPDATE `leave_balances` SET `used_days` = 2.0, `remaining_days` = total_days - 2.0 WHERE `user_id` = 2 AND `leave_type_id` = 2 AND `year` = {$currentYear}");
        // Update user 2 pending_days for CL
        $db->exec("UPDATE `leave_balances` SET `pending_days` = 3.0, `remaining_days` = total_days - 3.0 WHERE `user_id` = 2 AND `leave_type_id` = 1 AND `year` = {$currentYear}");
        echo "  [OK] Seeded sample leave requests.\n";
    }

    echo "Migration completed successfully!\n";
} catch (Exception $e) {
    echo "Migration error: " . $e->getMessage() . "\n";
    exit(1);
}
