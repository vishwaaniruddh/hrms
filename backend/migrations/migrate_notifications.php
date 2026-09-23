<?php
/**
 * Database Migration - Automated WhatsApp & SMS Notification Engine
 * Tables: `notification_settings`, `notification_logs`
 */
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance();
    echo "Running Notification Engine Migration...\n";

    // 1. Create notification_settings table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `notification_settings` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `trigger_key` VARCHAR(60) NOT NULL UNIQUE,
            `name` VARCHAR(100) NOT NULL,
            `description` VARCHAR(255) DEFAULT NULL,
            `channel` ENUM('whatsapp', 'sms', 'both') NOT NULL DEFAULT 'whatsapp',
            `is_enabled` TINYINT(1) NOT NULL DEFAULT 1,
            `template_name` VARCHAR(100) DEFAULT NULL,
            `template_text` TEXT NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `notification_settings` ready.\n";

    // 2. Create notification_logs table
    $db->exec("
        CREATE TABLE IF NOT EXISTS `notification_logs` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT UNSIGNED DEFAULT NULL,
            `recipient_phone` VARCHAR(30) NOT NULL,
            `recipient_name` VARCHAR(100) DEFAULT NULL,
            `channel` ENUM('whatsapp', 'sms') NOT NULL DEFAULT 'whatsapp',
            `event_type` ENUM('leave_approval', 'salary_disbursal', 'onboarding_welcome', 'attendance_alert', 'custom_broadcast') NOT NULL,
            `template_name` VARCHAR(100) DEFAULT NULL,
            `message_text` TEXT NOT NULL,
            `message_id` VARCHAR(120) DEFAULT NULL UNIQUE,
            `status` ENUM('queued', 'sent', 'delivered', 'read', 'failed') NOT NULL DEFAULT 'sent',
            `raw_payload` JSON DEFAULT NULL,
            `api_response` JSON DEFAULT NULL,
            `error_message` VARCHAR(255) DEFAULT NULL,
            `sent_at` DATETIME DEFAULT NULL,
            `delivered_at` DATETIME DEFAULT NULL,
            `read_at` DATETIME DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_event_type (`event_type`),
            INDEX idx_status (`status`),
            INDEX idx_channel (`channel`),
            INDEX idx_recipient_phone (`recipient_phone`),
            INDEX idx_message_id (`message_id`),
            FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "  [OK] Table `notification_logs` ready.\n";

    // 3. Seed default trigger settings if empty
    $count = $db->query("SELECT COUNT(*) FROM `notification_settings`")->fetchColumn();
    if ($count == 0) {
        echo "  Seeding default HR notification triggers & templates...\n";
        $triggers = [
            [
                'key'         => 'leave_approval',
                'name'        => 'Leave Approvals & Rejections',
                'desc'        => 'Instant WhatsApp notification when an employee leave application is approved or rejected by management.',
                'channel'     => 'whatsapp',
                'enabled'     => 1,
                'tpl_name'    => 'hrms_leave_decision',
                'tpl_text'    => "Hello {{employee_name}}, your leave request for {{leave_type}} from {{start_date}} to {{end_date}} ({{days}} days) has been {{status}} by {{approver_name}}.\n\nRemarks: {{remarks}}\nStatus: {{status}}\nAcme Global HRMS"
            ],
            [
                'key'         => 'salary_disbursal',
                'name'        => 'Salary Disbursal & Slip Download',
                'desc'        => 'Notifies employees when monthly payroll has been disbursed, including net salary and direct download link.',
                'channel'     => 'whatsapp',
                'enabled'     => 1,
                'tpl_name'    => 'hrms_salary_credit',
                'tpl_text'    => "Dear {{employee_name}}, your salary for {{month_year}} of ₹{{net_salary}} has been disbursed via {{payment_method}} (Ref: {{payment_ref}}).\n\nView or download your digital payslip: {{payslip_url}}\nAcme Global Payroll"
            ],
            [
                'key'         => 'onboarding_welcome',
                'name'        => 'Day-1 Onboarding Welcome',
                'desc'        => 'Sends warm welcome greetings and the Day-1 orientation roadmap link to newly onboarded team members.',
                'channel'     => 'whatsapp',
                'enabled'     => 1,
                'tpl_name'    => 'hrms_welcome_onboarding',
                'tpl_text'    => "Welcome to Acme Global, {{employee_name}}! 🎉 We are thrilled to have you join our team as {{designation}}.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: {{onboarding_url}}\n\nPlease reach out to HR Operations for any questions."
            ],
            [
                'key'         => 'attendance_alert',
                'name'        => 'Attendance Alerts (Late & Missing Checkout)',
                'desc'        => 'Automated alerts for grace-period late punch-in reminders and end-of-shift missing checkout warnings.',
                'channel'     => 'both',
                'enabled'     => 1,
                'tpl_name'    => 'hrms_attendance_alert',
                'tpl_text'    => "Attendance Notice: Hi {{employee_name}}, {{alert_message}} on {{date}}.\n\nPlease log in to the ESS Portal to record or regularize: {{ess_url}}\nAcme Operations Desk"
            ],
        ];

        $stmt = $db->prepare("
            INSERT INTO `notification_settings` 
            (`trigger_key`, `name`, `description`, `channel`, `is_enabled`, `template_name`, `template_text`)
            VALUES 
            (:trigger_key, :name, :description, :channel, :is_enabled, :template_name, :template_text)
        ");

        foreach ($triggers as $t) {
            $stmt->execute([
                ':trigger_key'   => $t['key'],
                ':name'          => $t['name'],
                ':description'   => $t['desc'],
                ':channel'       => $t['channel'],
                ':is_enabled'    => $t['enabled'],
                ':template_name' => $t['tpl_name'],
                ':template_text' => $t['tpl_text'],
            ]);
        }
        echo "  [OK] Default notification triggers seeded.\n";
    }

    // 4. Seed realistic sample logs if empty
    $logCount = $db->query("SELECT COUNT(*) FROM `notification_logs`")->fetchColumn();
    if ($logCount == 0) {
        echo "  Seeding realistic delivery log history...\n";

        // Fetch sample users
        $users = $db->query("SELECT id, full_name, phone, designation FROM users LIMIT 5")->fetchAll();
        $samplePhones = ['+919876543210', '+919820011223', '+919920334455', '+919819955667', '+917021889883'];

        $sampleLogs = [
            [
                'user_idx'     => 0,
                'phone'        => '+917021889883',
                'name'         => 'Abu Bin Ishtiyak',
                'channel'      => 'whatsapp',
                'event_type'   => 'leave_approval',
                'template'     => 'hrms_leave_decision',
                'text'         => "Hello Abu Bin Ishtiyak, your leave request for Casual Leave from 2026-09-25 to 2026-09-26 (2 days) has been Approved by Emma Walker.\n\nRemarks: Approved enjoy your leave\nStatus: Approved\nAcme Global HRMS",
                'msg_id'       => 'wamid.HBgMOTE3MDIxODg5ODgzFQIAERgSOTVEQzFCRjczODg1RjlCNkMyAA==',
                'status'       => 'read',
                'sent_at'      => date('Y-m-d H:i:s', strtotime('-2 hours')),
                'delivered_at' => date('Y-m-d H:i:s', strtotime('-115 minutes')),
                'read_at'      => date('Y-m-d H:i:s', strtotime('-110 minutes')),
            ],
            [
                'user_idx'     => 1,
                'phone'        => '+919820011223',
                'name'         => 'Emma Walker',
                'channel'      => 'whatsapp',
                'event_type'   => 'salary_disbursal',
                'template'     => 'hrms_salary_credit',
                'text'         => "Dear Emma Walker, your salary for August 2026 of ₹85,000 has been disbursed via Bank Transfer (Ref: TXN-20260831-9842).\n\nView or download your digital payslip: http://localhost:5173/hrms/ess\nAcme Global Payroll",
                'msg_id'       => 'wamid.HBgMOTE5ODIwMDExMjIzFQIAERgSRTYyMDU0RjE3MDcwODQyNTU2AA==',
                'status'       => 'delivered',
                'sent_at'      => date('Y-m-d H:i:s', strtotime('-5 hours')),
                'delivered_at' => date('Y-m-d H:i:s', strtotime('-290 minutes')),
                'read_at'      => null,
            ],
            [
                'user_idx'     => 2,
                'phone'        => '+919920334455',
                'name'         => 'Dr. Julian Morales',
                'channel'      => 'whatsapp',
                'event_type'   => 'onboarding_welcome',
                'template'     => 'hrms_welcome_onboarding',
                'text'         => "Welcome to Acme Global, Dr. Julian Morales! 🎉 We are thrilled to have you join our team as Lead Pharmacist.\n\nYour Day-1 onboarding checklist and orientation roadmap are ready at: http://localhost:5173/hrms/lifecycle\n\nPlease reach out to HR Operations for any questions.",
                'msg_id'       => 'wamid.HBgMOTE5OTIwMzM0NDU1FQIAERgSNDgyMTIwNTY4RDIwNjkwMkRGAA==',
                'status'       => 'read',
                'sent_at'      => date('Y-m-d H:i:s', strtotime('-1 day')),
                'delivered_at' => date('Y-m-d H:i:s', strtotime('-1 day + 2 minutes')),
                'read_at'      => date('Y-m-d H:i:s', strtotime('-1 day + 15 minutes')),
            ],
            [
                'user_idx'     => 0,
                'phone'        => '+917021889883',
                'name'         => 'Abu Bin Ishtiyak',
                'channel'      => 'sms',
                'event_type'   => 'attendance_alert',
                'template'     => 'hrms_attendance_alert',
                'text'         => "Attendance Notice: Hi Abu Bin Ishtiyak, we noticed you have not clocked in as of 10:15 AM on 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk",
                'msg_id'       => 'sms_89410482_acme',
                'status'       => 'delivered',
                'sent_at'      => date('Y-m-d H:i:s', strtotime('-30 minutes')),
                'delivered_at' => date('Y-m-d H:i:s', strtotime('-28 minutes')),
                'read_at'      => null,
            ],
            [
                'user_idx'     => 1,
                'phone'        => '+919820011223',
                'name'         => 'Emma Walker',
                'channel'      => 'whatsapp',
                'event_type'   => 'attendance_alert',
                'template'     => 'hrms_attendance_alert',
                'text'         => "Attendance Notice: Hi Emma Walker, missing checkout warning detected for today 2026-09-23.\n\nPlease log in to the ESS Portal to record or regularize: http://localhost:5173/hrms/ess\nAcme Operations Desk",
                'msg_id'       => 'wamid.HBgMOTE5ODIwMDExMjIzFQIAERgSODc2NzI2OUU1RENFMzM1OUE4AA==',
                'status'       => 'sent',
                'sent_at'      => date('Y-m-d H:i:s', strtotime('-5 minutes')),
                'delivered_at' => null,
                'read_at'      => null,
            ],
        ];

        $logStmt = $db->prepare("
            INSERT INTO `notification_logs`
            (`user_id`, `recipient_phone`, `recipient_name`, `channel`, `event_type`, `template_name`, `message_text`, `message_id`, `status`, `sent_at`, `delivered_at`, `read_at`)
            VALUES
            (:user_id, :recipient_phone, :recipient_name, :channel, :event_type, :template_name, :message_text, :message_id, :status, :sent_at, :delivered_at, :read_at)
        ");

        foreach ($sampleLogs as $l) {
            $uId = isset($users[$l['user_idx']]) ? $users[$l['user_idx']]['id'] : null;
            $uName = isset($users[$l['user_idx']]) ? $users[$l['user_idx']]['full_name'] : $l['name'];

            $logStmt->execute([
                ':user_id'         => $uId,
                ':recipient_phone' => $l['phone'],
                ':recipient_name'  => $uName,
                ':channel'         => $l['channel'],
                ':event_type'      => $l['event_type'],
                ':template_name'   => $l['template'],
                ':message_text'    => $l['text'],
                ':message_id'      => $l['msg_id'],
                ':status'          => $l['status'],
                ':sent_at'         => $l['sent_at'],
                ':delivered_at'    => $l['delivered_at'],
                ':read_at'         => $l['read_at'],
            ]);
        }
        echo "  [OK] Realistic delivery logs seeded successfully.\n";
    }

    echo "Notification Engine migration completed successfully!\n";

} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
