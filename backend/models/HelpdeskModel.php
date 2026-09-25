<?php
/**
 * HelpdeskModel - Internal HR Helpdesk & Employee Ticketing System
 */
require_once __DIR__ . '/../config/Database.php';

class HelpdeskModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Get all active categories with SLA thresholds
     */
    public function getCategories() {
        $stmt = $this->db->query("
            SELECT * FROM `helpdesk_categories` 
            WHERE `is_active` = 1 
            ORDER BY `id` ASC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get single category
     */
    public function getCategoryById($id) {
        $stmt = $this->db->prepare("SELECT * FROM `helpdesk_categories` WHERE `id` = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Create category
     */
    public function createCategory($data) {
        $stmt = $this->db->prepare("
            INSERT INTO `helpdesk_categories` (
                `name`, `code`, `description`, `icon`, `color`, 
                `sla_urgent_hrs`, `sla_high_hrs`, `sla_medium_hrs`, `sla_low_hrs`, `is_active`
            ) VALUES (
                :name, :code, :description, :icon, :color, 
                :sla_urgent_hrs, :sla_high_hrs, :sla_medium_hrs, :sla_low_hrs, :is_active
            )
        ");
        $stmt->execute([
            ':name' => $data['name'],
            ':code' => strtoupper($data['code']),
            ':description' => $data['description'] ?? null,
            ':icon' => $data['icon'] ?? 'HelpCircle',
            ':color' => $data['color'] ?? '#10b981',
            ':sla_urgent_hrs' => $data['sla_urgent_hrs'] ?? 4,
            ':sla_high_hrs' => $data['sla_high_hrs'] ?? 12,
            ':sla_medium_hrs' => $data['sla_medium_hrs'] ?? 24,
            ':sla_low_hrs' => $data['sla_low_hrs'] ?? 48,
            ':is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1
        ]);
        return (int)$this->db->lastInsertId();
    }

    /**
     * List Tickets with filters and SLA status
     */
    public function getTickets($filters = []) {
        $sql = "
            SELECT 
                t.*,
                u.full_name AS requester_name,
                u.email AS requester_email,
                u.designation AS requester_department,
                a.full_name AS assignee_name,
                c.name AS category_name,
                c.code AS category_code,
                c.color AS category_color,
                c.icon AS category_icon,
                (SELECT COUNT(*) FROM `helpdesk_messages` m WHERE m.ticket_id = t.id) AS message_count,
                CASE 
                    WHEN t.status IN ('Resolved', 'Closed') THEN 0
                    WHEN NOW() > t.sla_due_at THEN 1 
                    ELSE 0 
                END AS is_sla_breached,
                TIMESTAMPDIFF(MINUTE, NOW(), t.sla_due_at) AS time_remaining_mins
            FROM `helpdesk_tickets` t
            JOIN `users` u ON t.user_id = u.id
            LEFT JOIN `users` a ON t.assigned_to = a.id
            JOIN `helpdesk_categories` c ON t.category_id = c.id
            WHERE 1=1
        ";

        $params = [];

        // Role-based visibility
        $role = $filters['role'] ?? 'Admin';
        $viewerUserId = $filters['viewer_user_id'] ?? null;

        if ($role === 'Employee' && $viewerUserId) {
            $sql .= " AND t.user_id = :viewer_id";
            $params[':viewer_id'] = $viewerUserId;
        } elseif ($role !== 'Admin') {
            // Non-admin (e.g. Manager) cannot see confidential tickets unless submitted by them or assigned to them
            if ($viewerUserId) {
                $sql .= " AND (t.is_confidential = 0 OR t.user_id = :viewer_conf OR t.assigned_to = :viewer_asgn)";
                $params[':viewer_conf'] = $viewerUserId;
                $params[':viewer_asgn'] = $viewerUserId;
            } else {
                $sql .= " AND t.is_confidential = 0";
            }
        }

        // Explicit filters
        if (!empty($filters['status']) && $filters['status'] !== 'All') {
            $sql .= " AND t.status = :status";
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['category_id']) && $filters['category_id'] !== 'All') {
            $sql .= " AND t.category_id = :category_id";
            $params[':category_id'] = (int)$filters['category_id'];
        }

        if (!empty($filters['priority']) && $filters['priority'] !== 'All') {
            $sql .= " AND t.priority = :priority";
            $params[':priority'] = $filters['priority'];
        }

        if (isset($filters['is_confidential']) && $filters['is_confidential'] !== '') {
            $sql .= " AND t.is_confidential = :is_conf";
            $params[':is_conf'] = (int)$filters['is_confidential'];
        }

        if (!empty($filters['assigned_to'])) {
            $sql .= " AND t.assigned_to = :assigned_to";
            $params[':assigned_to'] = (int)$filters['assigned_to'];
        }

        if (!empty($filters['user_id'])) {
            $sql .= " AND t.user_id = :user_id";
            $params[':user_id'] = (int)$filters['user_id'];
        }

        if (!empty($filters['search'])) {
            $term = '%' . trim($filters['search']) . '%';
            $sql .= " AND (t.ticket_number LIKE :s1 OR t.subject LIKE :s2 OR u.full_name LIKE :s3)";
            $params[':s1'] = $term;
            $params[':s2'] = $term;
            $params[':s3'] = $term;
        }

        $sql .= " ORDER BY 
            CASE t.priority 
                WHEN 'Urgent' THEN 1 
                WHEN 'High' THEN 2 
                WHEN 'Medium' THEN 3 
                WHEN 'Low' THEN 4 
            END ASC,
            t.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get single ticket with message timeline
     */
    public function getTicketById($id, $viewerUserId = null, $viewerRole = 'Admin') {
        $stmt = $this->db->prepare("
            SELECT 
                t.*,
                u.full_name AS requester_name,
                u.email AS requester_email,
                u.designation AS requester_department,
                a.full_name AS assignee_name,
                a.email AS assignee_email,
                c.name AS category_name,
                c.code AS category_code,
                c.color AS category_color,
                c.icon AS category_icon,
                CASE 
                    WHEN t.status IN ('Resolved', 'Closed') THEN 0
                    WHEN NOW() > t.sla_due_at THEN 1 
                    ELSE 0 
                END AS is_sla_breached,
                TIMESTAMPDIFF(MINUTE, NOW(), t.sla_due_at) AS time_remaining_mins
            FROM `helpdesk_tickets` t
            JOIN `users` u ON t.user_id = u.id
            LEFT JOIN `users` a ON t.assigned_to = a.id
            JOIN `helpdesk_categories` c ON t.category_id = c.id
            WHERE t.id = :id
        ");
        $stmt->execute([':id' => $id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$ticket) return null;

        // Confidentiality check
        if ($ticket['is_confidential'] && $viewerRole !== 'Admin') {
            if ($viewerUserId != $ticket['user_id'] && $viewerUserId != $ticket['assigned_to']) {
                return null; // Access restricted
            }
        }

        // Load timeline messages
        // If viewer is an employee, hide internal notes
        $msgSql = "
            SELECT 
                m.*,
                u.full_name AS sender_name,
                r.name AS sender_role
            FROM `helpdesk_messages` m
            JOIN `users` u ON m.user_id = u.id
            LEFT JOIN `roles` r ON u.role_id = r.id
            WHERE m.ticket_id = :ticket_id
        ";
        if ($viewerRole === 'Employee') {
            $msgSql .= " AND m.is_internal_note = 0";
        }
        $msgSql .= " ORDER BY m.created_at ASC";

        $msgStmt = $this->db->prepare($msgSql);
        $msgStmt->execute([':ticket_id' => $id]);
        $ticket['messages'] = $msgStmt->fetchAll(PDO::FETCH_ASSOC);

        return $ticket;
    }

    /**
     * Create Ticket with automatic SLA computation
     */
    public function createTicket($data) {
        // Fetch Category for SLA resolution
        $cat = $this->getCategoryById($data['category_id']);
        if (!$cat) {
            throw new Exception("Invalid helpdesk category specified.");
        }

        $priority = $data['priority'] ?? 'Medium';
        $slaHrs = 24;
        switch ($priority) {
            case 'Urgent':
                $slaHrs = (int)$cat['sla_urgent_hrs'];
                break;
            case 'High':
                $slaHrs = (int)$cat['sla_high_hrs'];
                break;
            case 'Medium':
                $slaHrs = (int)$cat['sla_medium_hrs'];
                break;
            case 'Low':
                $slaHrs = (int)$cat['sla_low_hrs'];
                break;
        }

        $slaDueAt = date('Y-m-d H:i:s', strtotime("+{$slaHrs} hours"));

        // Generate Ticket Number (TKT-YYYY-XXXX)
        $year = date('Y');
        $seq = $this->db->query("SELECT COUNT(*) + 1 FROM `helpdesk_tickets` WHERE YEAR(created_at) = {$year}")->fetchColumn();
        $ticketNumber = 'TKT-' . $year . '-' . str_pad($seq, 4, '0', STR_PAD_LEFT);

        $stmt = $this->db->prepare("
            INSERT INTO `helpdesk_tickets` (
                `ticket_number`, `user_id`, `category_id`, `priority`, `status`,
                `subject`, `description`, `assigned_to`, `is_confidential`, `sla_due_at`
            ) VALUES (
                :ticket_number, :user_id, :category_id, :priority, 'Open',
                :subject, :description, :assigned_to, :is_confidential, :sla_due_at
            )
        ");

        $stmt->execute([
            ':ticket_number' => $ticketNumber,
            ':user_id' => $data['user_id'],
            ':category_id' => $data['category_id'],
            ':priority' => $priority,
            ':subject' => $data['subject'],
            ':description' => $data['description'],
            ':assigned_to' => !empty($data['assigned_to']) ? $data['assigned_to'] : null,
            ':is_confidential' => !empty($data['is_confidential']) ? 1 : 0,
            ':sla_due_at' => $slaDueAt
        ]);

        $ticketId = (int)$this->db->lastInsertId();

        // Add initial message
        $this->addMessage($ticketId, $data['user_id'], $data['description'], 0);

        return [
            'ticket_id' => $ticketId,
            'ticket_number' => $ticketNumber,
            'sla_due_at' => $slaDueAt
        ];
    }

    /**
     * Add message or internal note to ticket
     */
    public function addMessage($ticketId, $userId, $message, $isInternalNote = 0, $attachmentPath = null) {
        $stmt = $this->db->prepare("
            INSERT INTO `helpdesk_messages` (`ticket_id`, `user_id`, `message`, `is_internal_note`, `attachment_path`)
            VALUES (:ticket_id, :user_id, :message, :is_internal, :attachment)
        ");
        $stmt->execute([
            ':ticket_id' => $ticketId,
            ':user_id' => $userId,
            ':message' => $message,
            ':is_internal' => (int)$isInternalNote,
            ':attachment' => $attachmentPath
        ]);
        $msgId = (int)$this->db->lastInsertId();

        // Check if ticket status should transition
        // 🛡️ Sentinel: Security Enhancement - Prevent SQL injection by using parameterized query instead of string interpolation
        $stmt = $this->db->prepare("SELECT user_id, status FROM `helpdesk_tickets` WHERE id = :id");
        $stmt->execute([':id' => $ticketId]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($ticket) {
            // If sender is NOT ticket creator and status is Open, change to In Progress
            if ($userId != $ticket['user_id'] && $ticket['status'] === 'Open' && !$isInternalNote) {
                $updateStmt = $this->db->prepare("UPDATE `helpdesk_tickets` SET `status` = 'In Progress', `updated_at` = NOW() WHERE id = :id");
                $updateStmt->execute([':id' => $ticketId]);
            }
            // If sender is employee and status was Waiting on Employee, change to In Progress
            if ($userId == $ticket['user_id'] && $ticket['status'] === 'Waiting on Employee') {
                $updateStmt = $this->db->prepare("UPDATE `helpdesk_tickets` SET `status` = 'In Progress', `updated_at` = NOW() WHERE id = :id");
                $updateStmt->execute([':id' => $ticketId]);
            }
        }

        return $msgId;
    }

    /**
     * Update Ticket Status
     */
    public function updateStatus($ticketId, $status) {
        $allowed = ['Open', 'In Progress', 'Waiting on Employee', 'Resolved', 'Closed'];
        if (!in_array($status, $allowed)) {
            throw new Exception("Invalid status specified.");
        }

        $extraUpdates = "";
        if ($status === 'Resolved') {
            $extraUpdates = ", `resolved_at` = NOW()";
        } elseif ($status === 'Closed') {
            $extraUpdates = ", `closed_at` = NOW()";
        }

        $stmt = $this->db->prepare("
            UPDATE `helpdesk_tickets` 
            SET `status` = :status, `updated_at` = NOW() {$extraUpdates}
            WHERE `id` = :id
        ");
        return $stmt->execute([
            ':status' => $status,
            ':id' => $ticketId
        ]);
    }

    /**
     * Assign ticket to agent
     */
    public function assignTicket($ticketId, $assignedTo) {
        $stmt = $this->db->prepare("
            UPDATE `helpdesk_tickets` 
            SET `assigned_to` = :assigned_to,
                `status` = CASE WHEN `status` = 'Open' THEN 'In Progress' ELSE `status` END,
                `updated_at` = NOW()
            WHERE `id` = :id
        ");
        return $stmt->execute([
            ':assigned_to' => $assignedTo,
            ':id' => $ticketId
        ]);
    }

    /**
     * Submit CSAT Satisfaction Rating
     */
    public function submitCsat($ticketId, $userId, $rating, $feedback = null) {
        $rating = (int)$rating;
        if ($rating < 1 || $rating > 5) {
            throw new Exception("CSAT rating must be an integer between 1 and 5.");
        }

        $stmt = $this->db->prepare("
            SELECT user_id, status FROM `helpdesk_tickets` WHERE id = :id
        ");
        $stmt->execute([':id' => $ticketId]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$ticket) {
            throw new Exception("Ticket not found.");
        }

        if ($ticket['user_id'] != $userId) {
            throw new Exception("Only the employee who submitted the ticket can provide CSAT feedback.");
        }

        $upd = $this->db->prepare("
            UPDATE `helpdesk_tickets`
            SET `csat_rating` = :rating,
                `csat_feedback` = :feedback,
                `status` = 'Closed',
                `closed_at` = NOW(),
                `updated_at` = NOW()
            WHERE `id` = :id
        ");
        return $upd->execute([
            ':rating' => $rating,
            ':feedback' => $feedback,
            ':id' => $ticketId
        ]);
    }

    /**
     * Helpdesk KPI Stats
     */
    public function getStats($userId = null, $role = 'Admin') {
        $where = "1=1";
        if ($role === 'Employee' && $userId) {
            $where .= " AND user_id = " . (int)$userId;
        }

        // Counts by status
        $statusCounts = $this->db->query("
            SELECT 
                COUNT(*) AS total_tickets,
                SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) AS open_tickets,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_tickets,
                SUM(CASE WHEN status = 'Waiting on Employee' THEN 1 ELSE 0 END) AS waiting_tickets,
                SUM(CASE WHEN status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) AS resolved_tickets,
                SUM(CASE WHEN status NOT IN ('Resolved', 'Closed') AND NOW() > sla_due_at THEN 1 ELSE 0 END) AS breached_tickets,
                SUM(CASE WHEN is_confidential = 1 THEN 1 ELSE 0 END) AS confidential_tickets
            FROM `helpdesk_tickets`
            WHERE {$where}
        ")->fetch(PDO::FETCH_ASSOC);

        // SLA Compliance Rate
        $slaStmt = $this->db->query("
            SELECT 
                COUNT(*) as total_resolved,
                SUM(CASE WHEN resolved_at <= sla_due_at OR (resolved_at IS NULL AND closed_at <= sla_due_at) THEN 1 ELSE 0 END) as met_sla,
                AVG(TIMESTAMPDIFF(HOUR, created_at, COALESCE(resolved_at, closed_at, NOW()))) as avg_resolution_hrs
            FROM `helpdesk_tickets`
            WHERE status IN ('Resolved', 'Closed') AND {$where}
        ")->fetch(PDO::FETCH_ASSOC);

        $totalResolved = (int)($slaStmt['total_resolved'] ?? 0);
        $metSla = (int)($slaStmt['met_sla'] ?? 0);
        $slaRate = $totalResolved > 0 ? round(($metSla / $totalResolved) * 100, 1) : 100.0;
        $avgHrs = $slaStmt['avg_resolution_hrs'] ? round((float)$slaStmt['avg_resolution_hrs'], 1) : 4.5;

        // CSAT Average
        $csatStmt = $this->db->query("
            SELECT 
                COUNT(*) as csat_count,
                AVG(csat_rating) as avg_rating
            FROM `helpdesk_tickets`
            WHERE csat_rating IS NOT NULL AND {$where}
        ")->fetch(PDO::FETCH_ASSOC);

        $avgCsat = $csatStmt['avg_rating'] ? round((float)$csatStmt['avg_rating'], 1) : 4.8;

        return [
            'total_tickets' => (int)$statusCounts['total_tickets'],
            'open_tickets' => (int)$statusCounts['open_tickets'],
            'in_progress_tickets' => (int)$statusCounts['in_progress_tickets'],
            'waiting_tickets' => (int)$statusCounts['waiting_tickets'],
            'resolved_tickets' => (int)$statusCounts['resolved_tickets'],
            'breached_tickets' => (int)$statusCounts['breached_tickets'],
            'confidential_tickets' => (int)$statusCounts['confidential_tickets'],
            'sla_compliance_rate' => $slaRate,
            'avg_resolution_hrs' => $avgHrs,
            'avg_csat' => $avgCsat,
            'csat_count' => (int)$csatStmt['csat_count']
        ];
    }
}
