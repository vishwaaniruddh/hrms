<?php
/**
 * Automated Unit Tests for WhatsApp & SMS Notification Engine
 */
require_once __DIR__ . '/../models/NotificationModel.php';
require_once __DIR__ . '/../services/NotificationService.php';
require_once __DIR__ . '/../config/Database.php';

class NotificationTest
{
    private PDO $db;
    private NotificationModel $model;
    private NotificationService $service;
    private array $results = [];

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->model = new NotificationModel($this->db);
        $this->service = new NotificationService($this->model);
    }

    private function assert($condition, string $message): void
    {
        if ($condition) {
            $this->results[] = ['status' => 'PASS', 'message' => $message];
            echo "  ✔ PASS: {$message}\n";
        } else {
            $this->results[] = ['status' => 'FAIL', 'message' => $message];
            echo "  ✖ FAIL: {$message}\n";
        }
    }

    public function run(): array
    {
        echo "\n── Automated WhatsApp & SMS Notification Engine Tests ──\n";

        $this->testSettingsAndTriggers();
        $this->testOutboundDispatchAndLogging();
        $this->testLeaveApprovalTrigger();
        $this->testSalaryDisbursalTrigger();
        $this->testOnboardingWelcomeTrigger();
        $this->testAttendanceAlertTrigger();
        $this->testWebhookDeliveryReceiptIngestion();
        $this->testNotificationStats();

        return $this->results;
    }

    private function testSettingsAndTriggers(): void
    {
        $settings = $this->model->getSettings();
        $this->assert(is_array($settings) && count($settings) >= 4, "Notification settings return at least 4 core triggers");

        $leaveSetting = $this->model->getSettingByKey('leave_approval');
        $this->assert($leaveSetting !== null, "Leave approval trigger exists");
        $this->assert($leaveSetting['channel'] === 'whatsapp', "Leave approval channel is configured as WhatsApp");

        // Test updating setting
        $updated = $this->model->updateSetting('leave_approval', ['is_enabled' => 1]);
        $this->assert($updated, "Successfully updated trigger setting");
    }

    private function testOutboundDispatchAndLogging(): void
    {
        $res = $this->service->sendCustom(
            '+917021889883',
            'Automated test broadcast for unit verification',
            'whatsapp',
            1,
            'Test Recipient'
        );

        $this->assert($res['success'] === true, "Outbound message dispatched successfully");
        $this->assert(!empty($res['message_id']), "Outbound message generated valid message_id: {$res['message_id']}");
        $this->assert($res['status'] === 'sent', "Initial message status is 'sent'");

        $log = $this->model->findLogByMessageId($res['message_id']);
        $this->assert($log !== null, "Dispatched message recorded in notification_logs table");
        $this->assert($log['channel'] === 'whatsapp', "Log channel matches whatsapp");
        $this->assert($log['recipient_name'] === 'Test Recipient', "Log recipient name matches");
    }

    private function testLeaveApprovalTrigger(): void
    {
        // Find existing leave request
        $leave = $this->db->query("SELECT id FROM `leave_requests` LIMIT 1")->fetch();
        if ($leave) {
            $leaveId = (int) $leave['id'];
            $res = $this->service->notifyLeaveStatus($leaveId, 'Approved', 'Enjoy your vacation', 'Manager Test');
            $this->assert($res !== null && $res['success'] === true, "Leave approval notification dispatched via event trigger");

            if ($res) {
                $log = $this->model->findLogByMessageId($res['message_id']);
                $this->assert(strpos($log['message_text'], 'Approved') !== false, "Leave message contains hydrated 'Approved' status");
            }
        } else {
            $this->assert(true, "Skipped leave test (no leave records)");
        }
    }

    private function testSalaryDisbursalTrigger(): void
    {
        $sal = $this->db->query("SELECT id FROM `salaries` LIMIT 1")->fetch();
        if ($sal) {
            $salId = (int) $sal['id'];
            $res = $this->service->notifySalaryDisbursed($salId, [
                'payment_method'    => 'Direct Bank NEFT',
                'payment_reference' => 'TEST-TXN-9988'
            ]);
            $this->assert($res !== null && $res['success'] === true, "Salary disbursal notification dispatched via event trigger");

            if ($res) {
                $log = $this->model->findLogByMessageId($res['message_id']);
                $this->assert(strpos($log['message_text'], 'TEST-TXN-9988') !== false, "Salary message contains hydrated payment reference");
            }
        } else {
            $this->assert(true, "Skipped salary test (no salary records)");
        }
    }

    private function testOnboardingWelcomeTrigger(): void
    {
        $user = $this->db->query("SELECT id, full_name FROM `users` WHERE phone IS NOT NULL LIMIT 1")->fetch();
        if ($user) {
            $res = $this->service->notifyOnboardingWelcome((int) $user['id'], ['type' => 'Onboarding']);
            $this->assert($res !== null && $res['success'] === true, "Day-1 Onboarding welcome notification dispatched");

            if ($res) {
                $log = $this->model->findLogByMessageId($res['message_id']);
                $this->assert(strpos($log['message_text'], $user['full_name']) !== false, "Onboarding message contains employee's full name");
            }
        } else {
            $this->assert(true, "Skipped onboarding test (no user with phone)");
        }
    }

    private function testAttendanceAlertTrigger(): void
    {
        $user = $this->db->query("SELECT id FROM `users` WHERE phone IS NOT NULL LIMIT 1")->fetch();
        if ($user) {
            $res = $this->service->notifyAttendanceAlert((int) $user['id'], 'late_punchin', ['date' => '2026-09-23']);
            $this->assert($res !== null && $res['success'] === true, "Late punch-in attendance alert dispatched");

            if ($res) {
                $log = $this->model->findLogByMessageId($res['message_id']);
                $this->assert($log['event_type'] === 'attendance_alert', "Event type is 'attendance_alert'");
            }
        } else {
            $this->assert(true, "Skipped attendance test (no user with phone)");
        }
    }

    private function testWebhookDeliveryReceiptIngestion(): void
    {
        // 1. Create a message in 'sent' state
        $res = $this->service->sendCustom('+917021889883', 'Receipt transition test', 'whatsapp');
        $msgId = $res['message_id'];

        $initial = $this->model->findLogByMessageId($msgId);
        $this->assert($initial['status'] === 'sent', "Initial state is 'sent'");

        // 2. Ingest delivery receipt -> 'delivered'
        $wh1 = $this->service->processWebhook([
            'callback_type' => 'status',
            'messageId'     => $msgId,
            'status'        => 'delivered'
        ]);
        $this->assert($wh1['success'] === true, "Webhook receipt accepted for delivered status");

        $delivered = $this->model->findLogByMessageId($msgId);
        $this->assert($delivered['status'] === 'delivered', "Log updated to 'delivered' via webhook");
        $this->assert(!empty($delivered['delivered_at']), "Timestamp delivered_at is recorded");

        // 3. Ingest read receipt -> 'read'
        $wh2 = $this->service->processWebhook([
            'callback_type' => 'status',
            'messageId'     => $msgId,
            'status'        => 'read'
        ]);
        $this->assert($wh2['success'] === true, "Webhook receipt accepted for read status");

        $read = $this->model->findLogByMessageId($msgId);
        $this->assert($read['status'] === 'read', "Log updated to 'read' via webhook");
        $this->assert(!empty($read['read_at']), "Timestamp read_at is recorded");
    }

    private function testNotificationStats(): void
    {
        $stats = $this->model->getStats();
        $this->assert(isset($stats['total']) && $stats['total'] >= 5, "Stats includes total count >= 5 (got: {$stats['total']})");
        $this->assert(isset($stats['delivery_rate']) && $stats['delivery_rate'] >= 0, "Stats computes delivery rate %");
        $this->assert(isset($stats['read_rate']) && $stats['read_rate'] >= 0, "Stats computes read rate %");
        $this->assert(isset($stats['gateway_health']['provider']), "Stats reports Tubelight Communications gateway health");
    }
}
