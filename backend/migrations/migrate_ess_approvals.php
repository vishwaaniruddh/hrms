<?php
/**
 * Database Migration - Employee Self-Service (ESS) & Manager Approvals Tables
 */
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance();

    echo "Running ESS & Approvals Migration...\n";

    // 1. Create expense_claims table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `expense_claims` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `claim_number` VARCHAR(50) NOT NULL UNIQUE,
            `user_id` INT UNSIGNED NOT NULL,
            `title` VARCHAR(255) NOT NULL,
            `category` ENUM(
                'Travel & Mileage',
                'Meals & Entertainment',
                'Equipment & Tech',
                'Internet & Utilities',
                'Medical & Health',
                'Training & Certs',
                'Other'
            ) NOT NULL DEFAULT 'Other',
            `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
            `claim_date` DATE NOT NULL,
            `receipt_url` VARCHAR(255) DEFAULT NULL,
            `description` TEXT DEFAULT NULL,
            `status` ENUM('Pending', 'Approved', 'Rejected', 'Reimbursed') NOT NULL DEFAULT 'Pending',
            `approver_id` INT UNSIGNED DEFAULT NULL,
            `approver_remarks` TEXT DEFAULT NULL,
            `approved_at` TIMESTAMP NULL DEFAULT NULL,
            `reimbursed_at` TIMESTAMP NULL DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX `idx_claim_user` (`user_id`),
            INDEX `idx_claim_status` (`status`),
            INDEX `idx_claim_approver` (`approver_id`),
            FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `expense_claims` ready.\n";

    // 2. Ensure test/demo users exist
    // User 1: Abu Bin Ishtiyak (Admin)
    // User 2: Emma Walker (Manager)
    // User 3: Dr. Julian Morales (Employee - Pharmacist / Specialist)
    $stmt = $db->query("SELECT id FROM users WHERE email = 'julian.morales@example.com'");
    $julianId = $stmt->fetchColumn();

    if (!$julianId) {
        // Find role for staff (or create/use pharmacist/staff role)
        $roleStmt = $db->query("SELECT id FROM roles WHERE slug = 'pharmacist' LIMIT 1");
        $roleId = $roleStmt->fetchColumn() ?: 3;

        $db->prepare("
            INSERT INTO users (full_name, display_name, email, password, phone, date_of_birth, address, designation, role_id, joining_date, status)
            VALUES (:name, :display, :email, :pass, :phone, :dob, :addr, :desig, :role, :joining, 'Active')
        ")->execute([
            'name' => 'Dr. Julian Morales',
            'display' => 'Julian',
            'email' => 'julian.morales@example.com',
            'pass' => password_hash('password123', PASSWORD_BCRYPT),
            'phone' => '+1 555-0482',
            'dob' => '1990-05-14',
            'addr' => '742 Evergreen Terrace, Springfield',
            'desig' => 'Pharmacist',
            'role' => $roleId,
            'joining' => '2022-03-01'
        ]);
        $julianId = $db->lastInsertId();
        echo "  [OK] Seeded demo employee: Dr. Julian Morales (ID: $julianId)\n";
    }

    // 3. Ensure Julian has leave balances
    $leaveTypes = $db->query("SELECT id, days_allowed_per_year FROM leave_types")->fetchAll(PDO::FETCH_ASSOC);
    $currentYear = (int) date('Y');
    foreach ($leaveTypes as $lt) {
        $db->prepare("
            INSERT INTO leave_balances (user_id, leave_type_id, year, total_days, used_days, pending_days, remaining_days)
            VALUES (:uid, :ltid, :yr, :total, 0, 0, :rem)
            ON DUPLICATE KEY UPDATE total_days = VALUES(total_days)
        ")->execute([
            'uid' => $julianId,
            'ltid' => $lt['id'],
            'yr' => $currentYear,
            'total' => $lt['days_allowed_per_year'],
            'rem' => $lt['days_allowed_per_year']
        ]);
    }

    // 4. Ensure Julian has an assigned laptop asset
    $assetCheck = $db->prepare("SELECT id FROM assets WHERE current_user_id = :uid");
    $assetCheck->execute(['uid' => $julianId]);
    if (!$assetCheck->fetchColumn()) {
        $catId = $db->query("SELECT id FROM asset_categories WHERE code = 'LAPTOP' LIMIT 1")->fetchColumn() ?: 1;
        $tag = 'AST-MBP-' . str_pad($julianId, 4, '0', STR_PAD_LEFT);
        $serial = 'C02G' . strtoupper(substr(md5($julianId . 'seed'), 0, 8));
        
        $db->prepare("
            INSERT INTO assets (category_id, name, asset_tag, serial_number, brand, model, purchase_date, purchase_cost, `condition`, status, current_user_id, notes)
            VALUES (:cat, :name, :tag, :serial, 'Apple', 'MacBook Pro 16\" M3 Max', '2024-01-15', 3499.00, 'Good', 'Assigned', :uid, '36GB RAM, 1TB SSD, Space Black')
        ")->execute([
            'cat' => $catId,
            'name' => 'MacBook Pro 16" - Engineering & Clinical Suite',
            'tag' => $tag,
            'serial' => $serial,
            'uid' => $julianId
        ]);
        $assetId = $db->lastInsertId();
        
        $db->prepare("
            INSERT INTO asset_assignments (asset_id, user_id, assigned_by, assigned_date, condition_on_assignment, status, notes)
            VALUES (:aid, :uid, 1, '2024-01-20', 'Good', 'Active', 'Standard engineering deployment')
        ")->execute([
            'aid' => $assetId,
            'uid' => $julianId
        ]);
        echo "  [OK] Assigned demo hardware asset to Julian Morales\n";
    }

    // 5. Seed sample pending leave request for Julian (to be reviewed by Manager)
    $leaveCheck = $db->prepare("SELECT id FROM leave_requests WHERE user_id = :uid AND status = 'Pending'");
    $leaveCheck->execute(['uid' => $julianId]);
    if (!$leaveCheck->fetchColumn()) {
        $ltId = $leaveTypes[0]['id'] ?? 1;
        $startDate = date('Y-m-d', strtotime('+3 days'));
        $endDate = date('Y-m-d', strtotime('+5 days'));
        $db->prepare("
            INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, total_days, is_half_day, reason, status)
            VALUES (:uid, :ltid, :start, :end, 3.0, 0, 'Attending Annual Healthcare Practitioners Conference and clinical pharmacology training.', 'Pending')
        ")->execute([
            'uid' => $julianId,
            'ltid' => $ltId,
            'start' => $startDate,
            'end' => $endDate
        ]);
        echo "  [OK] Seeded pending leave request for manager review.\n";
    }

    // 6. Seed sample expense claims for Julian
    $claimCount = (int) $db->query("SELECT COUNT(*) FROM expense_claims")->fetchColumn();
    if ($claimCount === 0) {
        $claims = [
            [
                'number' => 'CLM-2026-001',
                'user_id' => $julianId,
                'title' => 'Clinical Research & Pharmacology Journal Subscription',
                'category' => 'Training & Certs',
                'amount' => 180.00,
                'date' => date('Y-m-d', strtotime('-5 days')),
                'desc' => 'Annual IEEE & Medical Pharmacology database access for clinical documentation updates.',
                'status' => 'Pending',
                'approver_id' => null,
                'remarks' => null
            ],
            [
                'number' => 'CLM-2026-002',
                'user_id' => $julianId,
                'title' => 'Client On-Site Pharmacy Audit Travel',
                'category' => 'Travel & Mileage',
                'amount' => 64.50,
                'date' => date('Y-m-d', strtotime('-2 days')),
                'desc' => 'Metro pass and rideshare reimbursement for offsite facility inspection.',
                'status' => 'Pending',
                'approver_id' => null,
                'remarks' => null
            ],
            [
                'number' => 'CLM-2026-003',
                'user_id' => 1, // Abu
                'title' => 'Enterprise Cloud Hosting & SSL Certificates',
                'category' => 'Equipment & Tech',
                'amount' => 349.00,
                'date' => date('Y-m-d', strtotime('-15 days')),
                'desc' => 'Annual wildcard SSL renewal and high-availability server cluster bandwidth overage.',
                'status' => 'Approved',
                'approver_id' => 2,
                'remarks' => 'Approved per Q3 IT Infrastructure budget.'
            ]
        ];

        $insClaim = $db->prepare("
            INSERT INTO expense_claims (claim_number, user_id, title, category, amount, claim_date, description, status, approver_id, approver_remarks, approved_at)
            VALUES (:num, :uid, :title, :cat, :amt, :cdate, :descr, :status, :app_id, :remarks, :app_at)
        ");

        foreach ($claims as $c) {
            $insClaim->execute([
                'num' => $c['number'],
                'uid' => $c['user_id'],
                'title' => $c['title'],
                'cat' => $c['category'],
                'amt' => $c['amount'],
                'cdate' => $c['date'],
                'descr' => $c['desc'],
                'status' => $c['status'],
                'app_id' => $c['approver_id'],
                'remarks' => $c['remarks'],
                'app_at' => $c['status'] === 'Approved' ? date('Y-m-d H:i:s') : null
            ]);
        }
        echo "  [OK] Seeded 3 sample expense claims.\n";
    }

    echo "ESS & Approvals Migration completed successfully!\n";

} catch (Exception $e) {
    echo "MIGRATION ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
