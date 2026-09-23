<?php
/**
 * Database Migration - Asset Allocation & IT Inventory
 */
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance();
    echo "Running Asset Management Migration...\n";

    // 1. Create asset_categories
    $db->exec("
        CREATE TABLE IF NOT EXISTS `asset_categories` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(50) NOT NULL,
            `code` VARCHAR(20) NOT NULL UNIQUE,
            `icon` VARCHAR(30) DEFAULT 'laptop',
            `description` VARCHAR(255) DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `asset_categories` ready.\n";

    // 2. Create assets
    $db->exec("
        CREATE TABLE IF NOT EXISTS `assets` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `category_id` INT UNSIGNED NOT NULL,
            `name` VARCHAR(100) NOT NULL,
            `asset_tag` VARCHAR(50) NOT NULL UNIQUE,
            `serial_number` VARCHAR(100) NOT NULL UNIQUE,
            `brand` VARCHAR(50) NOT NULL,
            `model` VARCHAR(100) NOT NULL,
            `purchase_date` DATE DEFAULT NULL,
            `purchase_cost` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
            `warranty_expiry` DATE DEFAULT NULL,
            `condition` ENUM('New', 'Good', 'Fair', 'Damaged') NOT NULL DEFAULT 'Good',
            `status` ENUM('Available', 'Assigned', 'Under Repair', 'Retired') NOT NULL DEFAULT 'Available',
            `current_user_id` INT UNSIGNED DEFAULT NULL,
            `notes` TEXT DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (`category_id`) REFERENCES `asset_categories` (`id`) ON DELETE RESTRICT,
            FOREIGN KEY (`current_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `assets` ready.\n";

    // 3. Create asset_assignments
    $db->exec("
        CREATE TABLE IF NOT EXISTS `asset_assignments` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `asset_id` INT UNSIGNED NOT NULL,
            `user_id` INT UNSIGNED NOT NULL,
            `assigned_by` INT UNSIGNED DEFAULT NULL,
            `assigned_date` DATE NOT NULL,
            `expected_return_date` DATE DEFAULT NULL,
            `returned_date` DATE DEFAULT NULL,
            `condition_on_assignment` ENUM('New', 'Good', 'Fair', 'Damaged') NOT NULL DEFAULT 'Good',
            `condition_on_return` ENUM('New', 'Good', 'Fair', 'Damaged') DEFAULT NULL,
            `status` ENUM('Active', 'Returned') NOT NULL DEFAULT 'Active',
            `notes` TEXT DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `asset_assignments` ready.\n";

    // 4. Seed categories if empty
    $catCount = $db->query("SELECT COUNT(*) FROM `asset_categories`")->fetchColumn();
    if ($catCount == 0) {
        $db->exec("
            INSERT INTO `asset_categories` (`name`, `code`, `icon`, `description`) VALUES
            ('Laptops & Desktops', 'LAPTOP', 'laptop', 'MacBooks, Dell, ThinkPads, and workstations'),
            ('Monitors & Displays', 'MONITOR', 'monitor', 'External 4K displays and workstation screens'),
            ('Access & Security Keys', 'SECURITY', 'key', 'YubiKeys, physical smart cards, and tokens'),
            ('Mobile & Tablets', 'MOBILE', 'smartphone', 'Company-issued phones and iPads'),
            ('Office Peripherals', 'PERIPHERAL', 'headphones', 'Headsets, docks, webcams, and mice');
        ");
        echo "  [OK] Seeded 5 asset categories.\n";
    }

    // 5. Seed initial assets if empty
    $assetCount = $db->query("SELECT COUNT(*) FROM `assets`")->fetchColumn();
    if ($assetCount == 0) {
        $db->exec("
            INSERT INTO `assets` 
            (`category_id`, `name`, `asset_tag`, `serial_number`, `brand`, `model`, `purchase_date`, `purchase_cost`, `currency`, `warranty_expiry`, `condition`, `status`, `current_user_id`, `notes`) 
            VALUES
            (1, 'MacBook Pro 16\" M3 Max', 'AST-00101', 'C02G1234MD6R', 'Apple', 'MacBookPro18,1', '2024-01-15', 3499.00, 'USD', '2027-01-15', 'New', 'Assigned', 1, 'Assigned to Super Admin for engineering leadership.'),
            (1, 'Dell XPS 15 9530', 'AST-00102', '8X99K2194B', 'Dell', 'XPS 15 9530 i9', '2023-11-20', 2199.00, 'USD', '2026-11-20', 'Good', 'Assigned', 2, 'Primary executive management device.'),
            (2, 'Dell UltraSharp 27\" 4K USB-C', 'AST-00103', 'CN098192A01', 'Dell', 'U2723QE', '2023-12-05', 629.00, 'USD', '2026-12-05', 'New', 'Assigned', 2, 'Workstation secondary display.'),
            (3, 'YubiKey 5C NFC Security Key', 'AST-00104', 'YK948194819', 'Yubico', 'YubiKey 5C', '2024-02-10', 55.00, 'USD', '2028-02-10', 'New', 'Available', NULL, 'Stored in IT security safe for next onboarding.'),
            (4, 'iPad Pro 12.9\" M2', 'AST-00105', 'DLXQ9182MD1', 'Apple', 'iPad Pro 6th Gen', '2023-09-15', 1099.00, 'USD', '2025-09-15', 'Good', 'Available', NULL, 'Available for executive travel and design testing.');
        ");
        echo "  [OK] Seeded 5 assets.\n";

        // Seed initial assignments
        $db->exec("
            INSERT INTO `asset_assignments` 
            (`asset_id`, `user_id`, `assigned_by`, `assigned_date`, `condition_on_assignment`, `status`, `notes`)
            VALUES
            (1, 1, 1, '2024-01-16', 'New', 'Active', 'Handed over in original box with 140W charger.'),
            (2, 2, 1, '2023-11-21', 'Good', 'Active', 'Issued for operations and management.'),
            (3, 2, 1, '2023-12-06', 'New', 'Active', 'Mounted on monitor arm at desk 402.');
        ");
        echo "  [OK] Seeded 3 asset assignments.\n";
    }

    echo "Asset Migration completed successfully!\n";
} catch (Exception $e) {
    echo "Asset migration error: " . $e->getMessage() . "\n";
    exit(1);
}
