<?php
/**
 * Notification Controller
 * REST endpoints for WhatsApp & SMS Notification Engine, event triggers, logs, and webhooks.
 */
require_once __DIR__ . '/../core/Response.php';

class NotificationController extends Controller
{
    private NotificationService $service;

    public function __construct()
    {
        parent::__construct();
        $this->service = new NotificationService();
    }

    /**
     * GET /api/notifications/logs
     */
    public function logs(Request $request): void
    {
        $page = $request->getPage();
        $perPage = $request->getPerPage();

        $filters = [
            'channel'    => $request->getQuery('channel'),
            'event_type' => $request->getQuery('event_type'),
            'status'     => $request->getQuery('status'),
            'search'     => $request->getQuery('search'),
            'user_id'    => $request->getQuery('user_id'),
        ];
        $filters = array_filter($filters, fn($val) => $val !== null && $val !== '');

        $result = $this->service->getModel()->getLogs($filters, $page, $perPage);
        Response::paginated($result['data'], $result['total'], $page, $perPage);
    }

    /**
     * GET /api/notifications/stats
     */
    public function stats(Request $request): void
    {
        $stats = $this->service->getModel()->getStats();
        Response::success($stats);
    }

    /**
     * GET /api/notifications/settings
     */
    public function settings(Request $request): void
    {
        $settings = $this->service->getModel()->getSettings();
        Response::success($settings);
    }

    /**
     * PUT /api/notifications/settings/{key}
     */
    public function updateSetting(Request $request): void
    {
        $key = $request->getParam('key');
        $body = $request->getBody();

        if (empty($key)) {
            Response::error('Trigger key is required', 400);
        }

        $ok = $this->service->getModel()->updateSetting($key, $body);
        if ($ok) {
            $updated = $this->service->getModel()->getSettingByKey($key);
            Response::success($updated, 'Notification trigger updated successfully');
        } else {
            Response::error('Failed to update trigger setting or no changes detected', 400);
        }
    }

    /**
     * POST /api/notifications/send-test
     * Body: { recipient_phone: string, message_text: string, channel?: 'whatsapp'|'sms', recipient_name?: string }
     */
    public function sendTest(Request $request): void
    {
        $body = $request->getBody();

        $phone = $body['recipient_phone'] ?? $body['phone'] ?? null;
        $text = $body['message_text'] ?? $body['message'] ?? null;
        $channel = $body['channel'] ?? 'whatsapp';
        $name = $body['recipient_name'] ?? 'Team Member';
        $userId = isset($body['user_id']) ? (int) $body['user_id'] : null;

        if (empty($phone) || empty($text)) {
            Response::error('recipient_phone and message_text are required fields', 422);
        }

        $result = $this->service->sendCustom($phone, $text, $channel, $userId, $name);
        Response::success($result, 'Notification dispatched successfully');
    }

    /**
     * POST /api/notifications/triggers/attendance-alerts
     */
    public function triggerAttendance(Request $request): void
    {
        $result = $this->service->runAttendanceAuditAndAlerts();
        Response::success($result, 'Attendance audit executed successfully');
    }

    /**
     * POST /api/notifications/webhook
     * Webhook endpoint for delivery receipt ingestion (compatible with Tubelight callback format)
     */
    public function webhook(Request $request): void
    {
        $payload = $request->getBody();
        if (empty($payload)) {
            Response::error('Empty callback payload', 400);
        }

        $result = $this->service->processWebhook($payload);
        if ($result['success']) {
            Response::success($result, 'Delivery receipt processed');
        } else {
            Response::error($result['error'] ?? 'Receipt could not be matched', 422, $result);
        }
    }

    /**
     * POST /api/notifications/simulate-receipt
     * Helper for live UI testing: cycle status to delivered or read
     * Body: { message_id: string, status: 'delivered'|'read'|'failed' }
     */
    public function simulateReceipt(Request $request): void
    {
        $body = $request->getBody();
        $messageId = $body['message_id'] ?? null;
        $status = $body['status'] ?? 'delivered';

        if (!$messageId) {
            Response::error('message_id is required', 400);
        }

        $updated = $this->service->getModel()->updateStatusByMessageId($messageId, $status);
        if ($updated) {
            $log = $this->service->getModel()->findLogByMessageId($messageId);
            Response::success($log, "Message status simulated to {$status}");
        } else {
            Response::error("Message ID {$messageId} not found in logs", 404);
        }
    }
}
