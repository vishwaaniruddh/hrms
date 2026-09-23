<?php
/**
 * Database Migration - Payroll Masters, Salary Structures & Itemized Payslips
 */
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance();
    echo "Running Payroll Masters Migration...\n";

    // 1. Create payroll_components master table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `payroll_components` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(100) NOT NULL,
            `code` VARCHAR(50) NOT NULL UNIQUE,
            `type` ENUM('Earning', 'Deduction') NOT NULL,
            `category` ENUM('Basic', 'Allowance', 'Variable', 'Statutory', 'Insurance', 'Stipend', 'Deduction') NOT NULL DEFAULT 'Allowance',
            `calculation_type` ENUM('Flat', 'Percentage') NOT NULL DEFAULT 'Flat',
            `default_value` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            `applies_to` ENUM('All', 'Permanent', 'Temporary', 'Intern') NOT NULL DEFAULT 'All',
            `is_taxable` TINYINT(1) NOT NULL DEFAULT 1,
            `is_mandatory` TINYINT(1) NOT NULL DEFAULT 0,
            `is_active` TINYINT(1) NOT NULL DEFAULT 1,
            `description` VARCHAR(255) DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `payroll_components` ready.\n";

    // 2. Create employee_salary_structures table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `employee_salary_structures` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT UNSIGNED NOT NULL UNIQUE,
            `employment_type` ENUM('Permanent', 'Temporary', 'Intern') NOT NULL DEFAULT 'Permanent',
            `base_salary` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
            `effective_date` DATE NOT NULL,
            `bank_name` VARCHAR(100) DEFAULT NULL,
            `account_number` VARCHAR(50) DEFAULT NULL,
            `routing_code` VARCHAR(50) DEFAULT NULL,
            `payment_method` ENUM('Bank Transfer', 'Cheque', 'Cash') NOT NULL DEFAULT 'Bank Transfer',
            `components_override` JSON DEFAULT NULL,
            `status` ENUM('Active', 'Archived') NOT NULL DEFAULT 'Active',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `employee_salary_structures` ready.\n";

    // 3. Alter salaries table to add gross_salary, total_deductions, net_salary, employment_type if missing
    $columns = $db->query("SHOW COLUMNS FROM `salaries`")->fetchAll(PDO::FETCH_COLUMN);

    if (!in_array('gross_salary', $columns)) {
        $db->exec("ALTER TABLE `salaries` ADD COLUMN `gross_salary` DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER `salary_date`");
        echo "  [OK] Added `gross_salary` to `salaries`.\n";
    }
    if (!in_array('total_deductions', $columns)) {
        $db->exec("ALTER TABLE `salaries` ADD COLUMN `total_deductions` DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER `gross_salary`");
        echo "  [OK] Added `total_deductions` to `salaries`.\n";
    }
    if (!in_array('net_salary', $columns)) {
        $db->exec("ALTER TABLE `salaries` ADD COLUMN `net_salary` DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER `total_deductions`");
        echo "  [OK] Added `net_salary` to `salaries`.\n";
    }
    if (!in_array('employment_type', $columns)) {
        $db->exec("ALTER TABLE `salaries` ADD COLUMN `employment_type` ENUM('Permanent', 'Temporary', 'Intern') NOT NULL DEFAULT 'Permanent' AFTER `user_id`");
        echo "  [OK] Added `employment_type` to `salaries`.\n";
    }

    // Sync any existing total_salary into net_salary and gross_salary for backwards compatibility
    $db->exec("UPDATE `salaries` SET `net_salary` = `total_salary`, `gross_salary` = `total_salary` WHERE `net_salary` = 0.00 AND `total_salary` > 0");

    // 4. Create salary_items table for itemized pay breakdowns
    $db->exec("
        CREATE TABLE IF NOT EXISTS `salary_items` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `salary_id` INT UNSIGNED NOT NULL,
            `component_id` INT UNSIGNED DEFAULT NULL,
            `component_name` VARCHAR(100) NOT NULL,
            `type` ENUM('Earning', 'Deduction') NOT NULL,
            `category` VARCHAR(50) NOT NULL DEFAULT 'General',
            `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`salary_id`) REFERENCES `salaries` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`component_id`) REFERENCES `payroll_components` (`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `salary_items` ready.\n";

    // 5. Seed standard payroll components
    $defaultComponents = [
        [
            'name'             => 'Basic Salary',
            'code'             => 'BASIC',
            'type'             => 'Earning',
            'category'         => 'Basic',
            'calculation_type' => 'Flat',
            'default_value'    => 2500.00,
            'applies_to'       => 'Permanent',
            'is_taxable'       => 1,
            'is_mandatory'     => 1,
            'description'      => 'Base regular monthly salary for permanent personnel'
        ],
        [
            'name'             => 'House Rent Allowance (HRA)',
            'code'             => 'HRA',
            'type'             => 'Earning',
            'category'         => 'Allowance',
            'calculation_type' => 'Percentage',
            'default_value'    => 20.00, // 20% of basic
            'applies_to'       => 'Permanent',
            'is_taxable'       => 1,
            'is_mandatory'     => 0,
            'description'      => 'Housing allowance calculated as a percentage of basic salary'
        ],
        [
            'name'             => 'Medical Allowance',
            'code'             => 'MEDICAL',
            'type'             => 'Earning',
            'category'         => 'Allowance',
            'calculation_type' => 'Flat',
            'default_value'    => 200.00,
            'applies_to'       => 'All',
            'is_taxable'       => 0,
            'is_mandatory'     => 0,
            'description'      => 'Healthcare and medical expenditure allowance'
        ],
        [
            'name'             => 'Conveyance / Transport Allowance',
            'code'             => 'CONVEYANCE',
            'type'             => 'Earning',
            'category'         => 'Allowance',
            'calculation_type' => 'Flat',
            'default_value'    => 150.00,
            'applies_to'       => 'All',
            'is_taxable'       => 1,
            'is_mandatory'     => 0,
            'description'      => 'Monthly commuting and travel allowance'
        ],
        [
            'name'             => 'Performance Variable / Bonus',
            'code'             => 'VARIABLE_BONUS',
            'type'             => 'Earning',
            'category'         => 'Variable',
            'calculation_type' => 'Flat',
            'default_value'    => 0.00,
            'applies_to'       => 'All',
            'is_taxable'       => 1,
            'is_mandatory'     => 0,
            'description'      => 'Incentive, quarterly variable or performance bonus'
        ],
        [
            'name'             => 'Monthly Stipend',
            'code'             => 'STIPEND',
            'type'             => 'Earning',
            'category'         => 'Stipend',
            'calculation_type' => 'Flat',
            'default_value'    => 800.00,
            'applies_to'       => 'Intern',
            'is_taxable'       => 0,
            'is_mandatory'     => 1,
            'description'      => 'Standard monthly educational stipend for interns'
        ],
        [
            'name'             => 'Provident Fund (EPF)',
            'code'             => 'PF',
            'type'             => 'Deduction',
            'category'         => 'Statutory',
            'calculation_type' => 'Percentage',
            'default_value'    => 12.00, // 12% of basic
            'applies_to'       => 'Permanent',
            'is_taxable'       => 0,
            'is_mandatory'     => 1,
            'description'      => 'Employee contribution to retirement provident fund'
        ],
        [
            'name'             => 'Health & Mediclaim Insurance',
            'code'             => 'INSURANCE',
            'type'             => 'Deduction',
            'category'         => 'Insurance',
            'calculation_type' => 'Flat',
            'default_value'    => 75.00,
            'applies_to'       => 'All',
            'is_taxable'       => 0,
            'is_mandatory'     => 0,
            'description'      => 'Group health insurance and medical coverage premium'
        ],
        [
            'name'             => 'Income Tax (TDS)',
            'code'             => 'TAX',
            'type'             => 'Deduction',
            'category'         => 'Statutory',
            'calculation_type' => 'Flat',
            'default_value'    => 120.00,
            'applies_to'       => 'All',
            'is_taxable'       => 0,
            'is_mandatory'     => 0,
            'description'      => 'Monthly tax deducted at source based on annual tax slab'
        ],
        [
            'name'             => 'Loss of Pay (LOP)',
            'code'             => 'LOP',
            'type'             => 'Deduction',
            'category'         => 'Deduction',
            'calculation_type' => 'Flat',
            'default_value'    => 0.00,
            'applies_to'       => 'All',
            'is_taxable'       => 0,
            'is_mandatory'     => 0,
            'description'      => 'Deductions for unapproved absences and leaves beyond quota'
        ],
    ];

    $checkStmt = $db->prepare("SELECT id FROM `payroll_components` WHERE `code` = :code");
    $insertStmt = $db->prepare("
        INSERT INTO `payroll_components` 
        (`name`, `code`, `type`, `category`, `calculation_type`, `default_value`, `applies_to`, `is_taxable`, `is_mandatory`, `description`)
        VALUES (:name, :code, :type, :category, :calculation_type, :default_value, :applies_to, :is_taxable, :is_mandatory, :description)
    ");

    foreach ($defaultComponents as $comp) {
        $checkStmt->execute(['code' => $comp['code']]);
        if (!$checkStmt->fetch()) {
            $insertStmt->execute($comp);
        }
    }
    echo "  [OK] Default payroll master components seeded.\n";

    // 6. Seed sample salary structures for users if none exist
    $users = $db->query("SELECT id, designation FROM users LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);
    $structCheck = $db->prepare("SELECT id FROM employee_salary_structures WHERE user_id = :uid");
    $structInsert = $db->prepare("
        INSERT INTO employee_salary_structures 
        (`user_id`, `employment_type`, `base_salary`, `currency`, `effective_date`, `bank_name`, `account_number`, `routing_code`, `payment_method`)
        VALUES (:user_id, :employment_type, :base_salary, :currency, :effective_date, :bank_name, :account_number, :routing_code, :payment_method)
    ");

    foreach ($users as $index => $u) {
        $structCheck->execute(['uid' => $u['id']]);
        if (!$structCheck->fetch()) {
            // Assign some as Permanent, one as Temporary, one as Intern for rich representation
            $tier = 'Permanent';
            $base = 3500.00;
            if ($index === 2) {
                $tier = 'Temporary';
                $base = 2800.00;
            } elseif ($index === 3) {
                $tier = 'Intern';
                $base = 950.00; // Stipend
            }

            $structInsert->execute([
                'user_id'         => $u['id'],
                'employment_type' => $tier,
                'base_salary'     => $base,
                'currency'        => 'USD',
                'effective_date'  => date('Y-01-01'),
                'bank_name'       => 'JPMorgan Chase / Silicon Valley Bank',
                'account_number'  => '****' . rand(1000, 9999),
                'routing_code'    => 'ACH-021000021',
                'payment_method'  => 'Bank Transfer'
            ]);
        }
    }
    echo "  [OK] Initial employee salary structures seeded.\n";

    echo "Payroll Masters Migration completed successfully!\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
