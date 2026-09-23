<?php
/**
 * Database Migration - Company Holidays & Work Calendar
 */
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance();
    echo "Running Company Holidays Migration...\n";

    // 1. Create company_holidays table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `company_holidays` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(100) NOT NULL,
            `holiday_date` DATE NOT NULL,
            `day_name` VARCHAR(20) NOT NULL,
            `type` ENUM('Statutory', 'Optional', 'Observance') NOT NULL DEFAULT 'Statutory',
            `is_mandatory_off` TINYINT(1) NOT NULL DEFAULT 1,
            `description` VARCHAR(255) DEFAULT NULL,
            `year` INT UNSIGNED NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY `uk_holiday_date_name` (`holiday_date`, `name`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `company_holidays` ready.\n";

    // 2. Seed standard statutory & company holidays for 2026
    $holidays2026 = [
        [
            'name'             => "New Year's Day",
            'holiday_date'     => '2026-01-01',
            'day_name'         => 'Thursday',
            'type'             => 'Statutory',
            'is_mandatory_off' => 1,
            'description'      => 'Federal & global public holiday celebrating the new year',
            'year'             => 2026
        ],
        [
            'name'             => 'Martin Luther King Jr. Day',
            'holiday_date'     => '2026-01-19',
            'day_name'         => 'Monday',
            'type'             => 'Statutory',
            'is_mandatory_off' => 1,
            'description'      => 'Honoring civil rights leader Dr. Martin Luther King Jr.',
            'year'             => 2026
        ],
        [
            'name'             => "Presidents' Day",
            'holiday_date'     => '2026-02-16',
            'day_name'         => 'Monday',
            'type'             => 'Statutory',
            'is_mandatory_off' => 1,
            'description'      => "Washington's Birthday & honoring US presidents",
            'year'             => 2026
        ],
        [
            'name'             => 'Memorial Day',
            'holiday_date'     => '2026-05-25',
            'day_name'         => 'Monday',
            'type'             => 'Statutory',
            'is_mandatory_off' => 1,
            'description'      => 'Honoring fallen military personnel and unofficial start of summer',
            'year'             => 2026
        ],
        [
            'name'             => 'Juneteenth National Independence Day',
            'holiday_date'     => '2026-06-19',
            'day_name'         => 'Friday',
            'type'             => 'Statutory',
            'is_mandatory_off' => 1,
            'description'      => 'Commemorating the emancipation of enslaved African Americans',
            'year'             => 2026
        ],
        [
            'name'             => 'Independence Day (Observed)',
            'holiday_date'     => '2026-07-03',
            'day_name'         => 'Friday',
            'type'             => 'Statutory',
            'is_mandatory_off' => 1,
            'description'      => 'Celebration of the Declaration of Independence (Observed)',
            'year'             => 2026
        ],
        [
            'name'             => 'Labor Day',
            'holiday_date'     => '2026-09-07',
            'day_name'         => 'Monday',
            'type'             => 'Statutory',
            'is_mandatory_off' => 1,
            'description'      => 'National celebration of the American labor movement',
            'year'             => 2026
        ],
        [
            'name'             => "Indigenous Peoples' Day / Columbus Day",
            'holiday_date'     => '2026-10-12',
            'day_name'         => 'Monday',
            'type'             => 'Optional',
            'is_mandatory_off' => 0,
            'description'      => 'Floating cultural observance and federal holiday',
            'year'             => 2026
        ],
        [
            'name'             => 'Veterans Day',
            'holiday_date'     => '2026-11-11',
            'day_name'         => 'Wednesday',
            'type'             => 'Optional',
            'is_mandatory_off' => 0,
            'description'      => 'Tribute to all military veterans who served in the armed forces',
            'year'             => 2026
        ],
        [
            'name'             => 'Thanksgiving Day',
            'holiday_date'     => '2026-11-26',
            'day_name'         => 'Thursday',
            'type'             => 'Statutory',
            'is_mandatory_off' => 1,
            'description'      => 'National harvest festival and thanksgiving holiday',
            'year'             => 2026
        ],
        [
            'name'             => 'Day After Thanksgiving / Black Friday',
            'holiday_date'     => '2026-11-27',
            'day_name'         => 'Friday',
            'type'             => 'Observance',
            'is_mandatory_off' => 1,
            'description'      => 'Extended holiday weekend for company staff and families',
            'year'             => 2026
        ],
        [
            'name'             => 'Christmas Eve',
            'holiday_date'     => '2026-12-24',
            'day_name'         => 'Thursday',
            'type'             => 'Observance',
            'is_mandatory_off' => 1,
            'description'      => 'Half-day / company winter holiday observance',
            'year'             => 2026
        ],
        [
            'name'             => 'Christmas Day',
            'holiday_date'     => '2026-12-25',
            'day_name'         => 'Friday',
            'type'             => 'Statutory',
            'is_mandatory_off' => 1,
            'description'      => 'Official global statutory holiday celebrating Christmas',
            'year'             => 2026
        ],
        [
            'name'             => "New Year's Eve (Optional Half-Day)",
            'holiday_date'     => '2026-12-31',
            'day_name'         => 'Thursday',
            'type'             => 'Optional',
            'is_mandatory_off' => 0,
            'description'      => 'Year-end wrap up and celebratory floating holiday',
            'year'             => 2026
        ],
    ];

    $checkStmt = $db->prepare("SELECT id FROM company_holidays WHERE holiday_date = :hdate AND name = :hname");
    $insertStmt = $db->prepare("
        INSERT INTO company_holidays (name, holiday_date, day_name, type, is_mandatory_off, description, year)
        VALUES (:name, :holiday_date, :day_name, :type, :is_mandatory_off, :description, :year)
    ");

    foreach ($holidays2026 as $h) {
        $checkStmt->execute(['hdate' => $h['holiday_date'], 'hname' => $h['name']]);
        if (!$checkStmt->fetch()) {
            $insertStmt->execute($h);
        }
    }
    echo "  [OK] Standard 2026 holidays seeded successfully.\n";

    echo "Company Holidays Migration completed successfully!\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
