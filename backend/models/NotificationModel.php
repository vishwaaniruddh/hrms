<?php
/**
 * Notification Model
 * Manages notification_settings, notification_logs, delivery metrics and webhook callbacks.
 */
class NotificationModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Get all trigger configurations
     */
    public function getSettings(): array
    {
        $stmt = $this->db->query("SELECT * FROM `notification_settings` ORDER BY `id` ASC");
        return $stmt->fetchAll();
    }

    /**
     * Get trigger setting by key
     */
    public function getSettingByKey(string $key): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM `notification_settings` WHERE `trigger_key` = :key LIMIT 1");
        $stmt->execute([':key' => $key]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Update trigger setting by key or id
     */
    public function updateSetting(string $key, array $data): bool
    {
        $fields = [];
        $params = [':key' => $key];

        if (isset($data['channel'])) {
            $fields[] = "`channel` = :channel";
            $params[':channel'] = $data['channel'];
        }
        if (isset($data['is_enabled'])) {
            $fields[] = "`is_enabled` = :is_enabled";
            $params[':is_enabled'] = $data['is_enabled'] ? 1 : 0;
        }
        if (isset($data['template_name'])) {
            $fields[] = "`template_name` = :template_name";
            $params[':template_name'] = $data['template_name'];
        }
        if (isset($data['template_text'])) {
            $fields[] = "`template_text` = :template_text";
            $params[':template_text'] = $data['template_text'];
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE `notification_settings` SET " . implode(', ', $fields) . " WHERE `trigger_key` = :key";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Get paginated logs with filtering
     */
    public function getLogs(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $where = [];
        $params = [];

        if (!empty($filters['channel'])) {
            $where[] = "l.channel = :channel";
            $params[':channel'] = $filters['channel'];
        }

        if (!empty($filters['event_type'])) {
            $where[] = "l.event_type = :event_type";
            $params[':event_type'] = $filters['event_type'];
        }

        if (!empty($filters['status'])) {
            $where[] = "l.status = :status";
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['search'])) {
            $where[] = "(l.recipient_name LIKE :search OR l.recipient_phone LIKE :search OR l.message_text LIKE :search OR l.message_id LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        if (!empty($filters['user_id'])) {
            $where[] = "l.user_id = :user_id";
            $params[':user_id'] = (int) $filters['user_id'];
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        $offset = max(0, ($page - 1) * $perPage);

        // Count total
        $countSql = "SELECT COUNT(*) FROM `notification_logs` l $whereClause";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        // Get rows
        $sql = "
            SELECT l.*, u.full_name AS user_full_name, u.email AS user_email, u.designation AS user_designation
            FROM `notification_logs` l
            LEFT JOIN `users` u ON l.user_id = u.id
            $whereClause
            ORDER BY l.created_at DESC
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'data'  => $stmt->fetchAll(),
            'total' => $total,
            'page'  => $page,
            'per_page' => $perPage,
            'total_pages' => (int) ceil($total / max(1, $perPage))
        ];
    }

    /**
     * Find log by ID
     */
    public function findLogById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM `notification_logs` WHERE `id` = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Find log by Message ID
     */
    public function findLogByMessageId(string $messageId): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM `notification_logs` WHERE `message_id` = :msg_id LIMIT 1");
        $stmt->execute([':msg_id' => $messageId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Record a new message log
     */
    public function logMessage(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO `notification_logs` 
            (`user_id`, `recipient_phone`, `recipient_name`, `channel`, `event_type`, `template_name`, `message_text`, `message_id`, `status`, `raw_payload`, `api_response`, `error_message`, `sent_at`, `delivered_at`, `read_at`)
            VALUES 
            (:user_id, :recipient_phone, :recipient_name, :channel, :event_type, :template_name, :message_text, :message_id, :status, :raw_payload, :api_response, :error_message, :sent_at, :delivered_at, :read_at)
        ");

        $now = date('Y-m-d H:i:s');

        $stmt->execute([
            ':user_id'         => $data['user_id'] ?? null,
            ':recipient_phone' => $data['recipient_phone'],
            ':recipient_name'  => $data['recipient_name'] ?? null,
            ':channel'         => $data['channel'] ?? 'whatsapp',
            ':event_type'      => $data['event_type'] ?? 'custom_broadcast',
            ':template_name'   => $data['template_name'] ?? null,
            ':message_text'    => $data['message_text'],
            ':message_id'      => $data['message_id'] ?? ('msg_' . bin2hex(random_bytes(10))),
            ':status'          => $data['status'] ?? 'sent',
            ':raw_payload'     => isset($data['raw_payload']) ? json_encode($data['raw_payload']) : null,
            ':api_response'    => isset($data['api_response']) ? json_encode($data['api_response']) : null,
            ':error_message'   => $data['error_message'] ?? null,
            ':sent_at'         => $data['sent_at'] ?? $now,
            ':delivered_at'    => $data['delivered_at'] ?? null,
            ':read_at'         => $data['read_at'] ?? null,
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Update log status via webhook ingestion
     */
    public function updateStatusByMessageId(string $messageId, string $status, array $extra = []): bool
    {
        $fields = ["`status` = :status"];
        $params = [
            ':message_id' => $messageId,
            ':status'     => $status,
        ];

        $now = date('Y-m-d H:i:s');
        if ($status === 'delivered') {
            $fields[] = "`delivered_at` = COALESCE(`delivered_at`, :delivered_at)";
            $params[':delivered_at'] = $now;
        } elseif ($status === 'read') {
            $fields[] = "`delivered_at` = COALESCE(`delivered_at`, :delivered_at)";
            $fields[] = "`read_at` = :read_at";
            $params[':delivered_at'] = $now;
            $params[':read_at'] = $now;
        } elseif ($status === 'failed') {
            if (!empty($extra['reason']) || !empty($extra['error'])) {
                $fields[] = "`error_message` = :error_msg";
                $params[':error_msg'] = $extra['reason'] ?? $extra['error'];
            }
        }

        if (!empty($extra['raw_callback'])) {
            $fields[] = "`api_response` = :api_response";
            $params[':api_response'] = json_encode($extra['raw_callback']);
        }

        $sql = "UPDATE `notification_logs` SET " . implode(', ', $fields) . " WHERE `message_id` = :message_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Update log status by log id
     */
    public function updateStatusById(int $id, string $status): bool
    {
        $now = date('Y-m-d H:i:s');
        $fields = ["`status` = :status"];
        $params = [':id' => $id, ':status' => $status];

        if ($status === 'delivered') {
            $fields[] = "`delivered_at` = COALESCE(`delivered_at`, :now)";
            $params[':now'] = $now;
        } elseif ($status === 'read') {
            $fields[] = "`delivered_at` = COALESCE(`delivered_at`, :now1)";
            $fields[] = "`read_at` = :now2";
            $params[':now1'] = $now;
            $params[':now2'] = $now;
        }

        $sql = "UPDATE `notification_logs` SET " . implode(', ', $fields) . " WHERE `id` = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Aggregate notification analytics & KPIs
     */
    public function getStats(): array
    {
        $total = (int) $this->db->query("SELECT COUNT(*) FROM `notification_logs`")->fetchColumn();
        $sent = (int) $this->db->query("SELECT COUNT(*) FROM `notification_logs` WHERE `status` = 'sent'")->fetchColumn();
        $delivered = (int) $this->db->query("SELECT COUNT(*) FROM `notification_logs` WHERE `status` = 'delivered'")->fetchColumn();
        $read = (int) $this->db->query("SELECT COUNT(*) FROM `notification_logs` WHERE `status` = 'read'")->fetchColumn();
        $failed = (int) $this->db->query("SELECT COUNT(*) FROM `notification_logs` WHERE `status` = 'failed'")->fetchColumn();

        $whatsappCount = (int) $this->db->query("SELECT COUNT(*) FROM `notification_logs` WHERE `channel` = 'whatsapp'")->fetchColumn();
        $smsCount = (int) $this->db->query("SELECT COUNT(*) FROM `notification_logs` WHERE `channel` = 'sms'")->fetchColumn();

        $successfulDelivered = $delivered + $read;
        $deliveryRate = $total > 0 ? round(($successfulDelivered / $total) * 100, 1) : 100;
        $readRate = $successfulDelivered > 0 ? round(($read / $successfulDelivered) * 100, 1) : 0;

        // Breakdown by event type
        $eventBreakdownStmt = $this->db->query("
            SELECT `event_type`, COUNT(*) as count 
            FROM `notification_logs` 
            GROUP BY `event_type`
        ");
        $eventBreakdown = $eventBreakdownStmt->fetchAll(PDO::FETCH_KEY_PAIR);

        return [
            'total'          => $total,
            'sent'           => $sent,
            'delivered'      => $delivered,
            'read'           => $read,
            'failed'         => $failed,
            'successful'     => $successfulDelivered,
            'delivery_rate'  => $deliveryRate,
            'read_rate'      => $readRate,
            'whatsapp_count' => $whatsappCount,
            'sms_count'      => $smsCount,
            'event_breakdown'=> $eventBreakdown,
            'gateway_health' => [
                'provider'       => 'Tubelight Communications',
                'whatsapp_status'=> 'Connected',
                'sms_status'     => 'Active Fallback',
                'webhook_url'    => '/api/notifications/webhook'
            ]
        ];
    }
}
