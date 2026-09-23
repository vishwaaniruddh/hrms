<?php
/**
 * Database Migration - Shift Scheduling & Team Roster Management
 * Tables: `shifts`, `shift_rosters`, `shift_swaps`, `shift_overtime_records`
 */
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance();
    echo "Running Shift & Roster Management Migration...\n";

    // 1. Create shifts master table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `shifts` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `shift_code` VARCHAR(50) NOT NULL UNIQUE,
            `name` VARCHAR(100) NOT NULL,
            `description` VARCHAR(255) DEFAULT NULL,
            `start_time` TIME NOT NULL,
            `end_time` TIME NOT NULL,
            `grace_period_mins` INT UNSIGNED NOT NULL DEFAULT 15,
            `break_duration_mins` INT UNSIGNED NOT NULL DEFAULT 60,
            `color` VARCHAR(30) NOT NULL DEFAULT '#10b981',
            `is_night_shift` TINYINT(1) NOT NULL DEFAULT 0,
            `night_allowance_amt` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            `overtime_multiplier` DECIMAL(3,2) NOT NULL DEFAULT 1.50,
            `is_active` TINYINT(1) NOT NULL DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `shifts` ready.\n";

    // 2. Create shift_rosters table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `shift_rosters` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT UNSIGNED NOT NULL,
            `shift_id` INT UNSIGNED DEFAULT NULL,
            `date` DATE NOT NULL,
            `is_off_day` TINYINT(1) NOT NULL DEFAULT 0,
            `status` ENUM('Scheduled', 'Completed', 'Swapped', 'Absent') NOT NULL DEFAULT 'Scheduled',
            `notes` VARCHAR(255) DEFAULT NULL,
            `assigned_by` INT UNSIGNED DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY `unique_user_date` (`user_id`, `date`),
            INDEX idx_roster_date (`date`),
            INDEX idx_roster_status (`status`),
            FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `shift_rosters` ready.\n";

    // 3. Create shift_swaps table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `shift_swaps` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `requester_id` INT UNSIGNED NOT NULL,
            `receiver_id` INT UNSIGNED NOT NULL,
            `roster_id` INT UNSIGNED NOT NULL,
            `swap_date` DATE NOT NULL,
            `target_shift_id` INT UNSIGNED DEFAULT NULL,
            `reason` TEXT DEFAULT NULL,
            `receiver_status` ENUM('Pending', 'Accepted', 'Declined') NOT NULL DEFAULT 'Pending',
            `manager_status` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
            `manager_remarks` VARCHAR(255) DEFAULT NULL,
            `approved_by` INT UNSIGNED DEFAULT NULL,
            `approved_at` DATETIME DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_swap_requester (`requester_id`),
            INDEX idx_swap_receiver (`receiver_id`),
            INDEX idx_swap_manager_status (`manager_status`),
            FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`roster_id`) REFERENCES `shift_rosters` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `shift_swaps` ready.\n";

    // 4. Create shift_overtime_records table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `shift_overtime_records` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT UNSIGNED NOT NULL,
            `attendance_id` INT UNSIGNED DEFAULT NULL,
            `shift_id` INT UNSIGNED DEFAULT NULL,
            `date` DATE NOT NULL,
            `scheduled_hours` DECIMAL(5,2) NOT NULL DEFAULT 8.00,
            `actual_hours` DECIMAL(5,2) NOT NULL DEFAULT 8.00,
            `overtime_hours` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            `is_night_shift` TINYINT(1) NOT NULL DEFAULT 0,
            `night_differential_pay` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            `overtime_pay` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            `payroll_synced` TINYINT(1) NOT NULL DEFAULT 0,
            `salary_id` INT UNSIGNED DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_ot_user_date (`user_id`, `date`),
            INDEX idx_ot_synced (`payroll_synced`),
            FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `shift_overtime_records` ready.\n";

    // 5. Seed default enterprise shifts if empty
    $shiftCount = $db->query("SELECT COUNT(*) FROM `shifts`")->fetchColumn();
    if ($shiftCount == 0) {
        echo "  Seeding default shift masters...\n";
        $seedShifts = [
            [
                'code'        => 'MORN-01',
                'name'        => 'Morning General Shift',
                'description' => 'Standard daytime shift for administrative, engineering and support staff.',
                'start'       => '08:30:00',
                'end'         => '17:00:00',
                'grace'       => 15,
                'break'       => 60,
                'color'       => '#10b981', // Emerald
                'is_night'    => 0,
                'night_allow' => 0.00,
                'ot_multi'    => 1.50
            ],
            [
                'code'        => 'EVE-02',
                'name'        => 'Evening Swing Shift',
                'description' => 'Late afternoon to night shift for operational handover and clinical support.',
                'start'       => '14:30:00',
                'end'         => '23:00:00',
                'grace'       => 15,
                'break'       => 45,
                'color'       => '#3b82f6', // Blue
                'is_night'    => 0,
                'night_allow' => 150.00,
                'ot_multi'    => 1.50
            ],
            [
                'code'        => 'NIGHT-03',
                'name'        => 'Night Owls Differential',
                'description' => 'Overnight healthcare and IT server monitoring shift with statutory differential allowance.',
                'start'       => '22:30:00',
                'end'         => '07:00:00',
                'grace'       => 10,
                'break'       => 60,
                'color'       => '#8b5cf6', // Purple
                'is_night'    => 1,
                'night_allow' => 350.00,
                'ot_multi'    => 1.75
            ],
            [
                'code'        => 'ROT-04',
                'name'        => '12-Hour Critical Care Roster',
                'description' => 'Rotational extended shift for hospital pharmacy and emergency operations.',
                'start'       => '08:00:00',
                'end'         => '20:00:00',
                'grace'       => 20,
                'break'       => 90,
                'color'       => '#f59e0b', // Amber
                'is_night'    => 0,
                'night_allow' => 200.00,
                'ot_multi'    => 2.00
            ],
        ];

        $insShift = $db->prepare("
            INSERT INTO `shifts` 
            (`shift_code`, `name`, `description`, `start_time`, `end_time`, `grace_period_mins`, `break_duration_mins`, `color`, `is_night_shift`, `night_allowance_amt`, `overtime_multiplier`, `is_active`)
            VALUES 
            (:shift_code, :name, :description, :start_time, :end_time, :grace_period_mins, :break_duration_mins, :color, :is_night_shift, :night_allowance_amt, :overtime_multiplier, 1)
        ");

        foreach ($seedShifts as $s) {
            $insShift->execute([
                ':shift_code'           => $s['code'],
                ':name'                 => $s['name'],
                ':description'          => $s['description'],
                ':start_time'           => $s['start'],
                ':end_time'             => $s['end'],
                ':grace_period_mins'    => $s['grace'],
                ':break_duration_mins'  => $s['break'],
                ':color'                => $s['color'],
                ':is_night_shift'       => $s['is_night'],
                ':night_allowance_amt'  => $s['night_allow'],
                ':overtime_multiplier'  => $s['ot_multi'],
            ]);
        }
        echo "  [OK] Default shift definitions seeded.\n";
    }

    // 6. Seed active monthly rosters for current month
    $rosterCount = $db->query("SELECT COUNT(*) FROM `shift_rosters`")->fetchColumn();
    if ($rosterCount == 0) {
        echo "  Seeding realistic team rosters for current month...\n";
        $users = $db->query("SELECT id FROM users LIMIT 10")->fetchAll(PDO::FETCH_COLUMN);
        $shifts = $db->query("SELECT id, shift_code FROM shifts")->fetchAll(PDO::FETCH_KEY_PAIR);

        $mornId = array_search('MORN-01', $shifts);
        $eveId = array_search('EVE-02', $shifts);
        $nightId = array_search('NIGHT-03', $shifts);

        $currentYear = (int) date('Y');
        $currentMonth = (int) date('m');
        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $currentMonth, $currentYear);

        $insRoster = $db->prepare("
            INSERT IGNORE INTO `shift_rosters` 
            (`user_id`, `shift_id`, `date`, `is_off_day`, `status`, `assigned_by`)
            VALUES 
            (:user_id, :shift_id, :date, :is_off_day, :status, 1)
        ");

        foreach ($users as $idx => $userId) {
            // Assign patterns per user
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $dateStr = sprintf('%04d-%02d-%02d', $currentYear, $currentMonth, $d);
                $dayOfWeek = date('N', strtotime($dateStr)); // 1 (Mon) to 7 (Sun)

                $isWeekend = ($dayOfWeek == 6 || $dayOfWeek == 7);
                if ($isWeekend) {
                    $insRoster->execute([
                        ':user_id'    => $userId,
                        ':shift_id'   => null,
                        ':date'       => $dateStr,
                        ':is_off_day' => 1,
                        ':status'     => 'Scheduled'
                    ]);
                } else {
                    // Rotate shifts among team members
                    $shiftToAssign = ($idx % 3 === 0) ? $mornId : (($idx % 3 === 1) ? $eveId : $nightId);
                    $insRoster->execute([
                        ':user_id'    => $userId,
                        ':shift_id'   => $shiftToAssign,
                        ':date'       => $dateStr,
                        ':is_off_day' => 0,
                        ':status'     => 'Scheduled'
                    ]);
                }
            }
        }
        echo "  [OK] Team roster schedules populated.\n";

        // Seed a pending shift swap request for testing
        if (count($users) >= 2) {
            $tomorrow = date('Y-m-d', strtotime('+1 day'));
            $rosterRow = $db->query("SELECT id FROM shift_rosters WHERE user_id = {$users[0]} AND date = '{$tomorrow}' LIMIT 1")->fetch();
            if ($rosterRow) {
                $db->prepare("
                    INSERT INTO `shift_swaps` 
                    (`requester_id`, `receiver_id`, `roster_id`, `swap_date`, `reason`, `receiver_status`, `manager_status`)
                    VALUES 
                    (:requester_id, :receiver_id, :roster_id, :swap_date, 'Attending clinical training seminar', 'Accepted', 'Pending')
                ")->execute([
                    ':requester_id' => $users[0],
                    ':receiver_id'  => $users[1],
                    ':roster_id'    => $rosterRow['id'],
                    ':swap_date'    => $tomorrow
                ]);
                echo "  [OK] Sample shift swap request seeded.\n";
            }
        }

        // Seed sample overtime record
        if (count($users) >= 1) {
            $yesterday = date('Y-m-d', strtotime('-1 day'));
            $db->prepare("
                INSERT INTO `shift_overtime_records`
                (`user_id`, `shift_id`, `date`, `scheduled_hours`, `actual_hours`, `overtime_hours`, `is_night_shift`, `night_differential_pay`, `overtime_pay`, `payroll_synced`)
                VALUES 
                (:user_id, :shift_id, :date, 8.00, 10.50, 2.50, 1, 350.00, 562.50, 0)
            ")->execute([
                ':user_id'  => $users[0],
                ':shift_id' => $nightId ?: 1,
                ':date'     => $yesterday
            ]);
            echo "  [OK] Sample night differential & overtime record seeded.\n";
        }
    }

    echo "Shift & Roster Management migration completed successfully!\n";

} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
