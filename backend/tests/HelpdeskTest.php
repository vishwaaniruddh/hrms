<?php
/**
 * Automated Unit Tests for Internal HR Helpdesk & Employee Ticketing System
 */
require_once __DIR__ . '/../models/HelpdeskModel.php';
require_once __DIR__ . '/../config/Database.php';

class HelpdeskTest
{
    private PDO $db;
    private HelpdeskModel $model;
    private array $results = [];

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->model = new HelpdeskModel($this->db);
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
        echo "\n── Internal HR Helpdesk & Employee Ticketing System Tests ──\n";

        $this->testCategoriesMaster();
        $this->testTicketCreationWithSLA();
        $this->testConfidentialTicketAccessControl();
        $this->testMessageThreadAndInternalNotes();
        $this->testTicketStatusWorkflow();
        $this->testTicketAssignment();
        $this->testCsatSubmission();
        $this->testHelpdeskStats();

        return $this->results;
    }

    private function testCategoriesMaster(): void
    {
        $categories = $this->model->getCategories();
        $this->assert(is_array($categories) && count($categories) >= 5, "Helpdesk categories master loaded with at least 5 categories (got: " . count($categories) . ")");

        $codes = array_column($categories, 'code');
        $this->assert(in_array('PAYROLL', $codes), "Category PAYROLL exists");
        $this->assert(in_array('GRIEVANCE', $codes), "Category GRIEVANCE exists");
        $this->assert(in_array('IT-SUPPORT', $codes), "Category IT-SUPPORT exists");

        // Verify SLA hours
        $payroll = null;
        foreach ($categories as $cat) {
            if ($cat['code'] === 'PAYROLL') {
                $payroll = $cat;
                break;
            }
        }
        $this->assert($payroll !== null && (int)$payroll['sla_high_hrs'] === 12, "PAYROLL has default 12h High SLA configured");
    }

    private function testTicketCreationWithSLA(): void
    {
        // Get category ID for IT-SUPPORT
        $stmt = $this->db->query("SELECT id FROM helpdesk_categories WHERE code = 'IT-SUPPORT' LIMIT 1");
        $catId = (int)$stmt->fetchColumn();

        // Get an employee user
        $userStmt = $this->db->query("SELECT id FROM users ORDER BY id ASC LIMIT 1");
        $empId = (int)$userStmt->fetchColumn();

        $ticketData = [
            'category_id' => $catId,
            'user_id' => $empId,
            'subject' => 'TEST: Second Monitor Display Cable Flickering',
            'description' => 'HDMI port flickering intermittently during team meetings.',
            'priority' => 'High', // High priority = 12h SLA
            'is_confidential' => 0
        ];

        $newTicket = $this->model->createTicket($ticketData);
        $this->assert(!empty($newTicket['ticket_number']), "New ticket created with auto-generated ticket number: {$newTicket['ticket_number']}");
        $this->assert(str_starts_with($newTicket['ticket_number'], 'TKT-'), "Ticket number follows TKT- prefix standard");
        $this->assert(!empty($newTicket['sla_due_at']), "SLA deadline computed automatically: {$newTicket['sla_due_at']}");

        // Verify initial message and ticket details
        $ticketId = $newTicket['ticket_id'];
        $details = $this->model->getTicketById($ticketId, $empId, 'Employee');
        $this->assert($details !== null && $details['status'] === 'Open', "Initial ticket status is Open");
        $this->assert(count($details['messages']) >= 1, "Initial description recorded in ticket message thread");
        $this->assert($details['messages'][0]['message'] === $ticketData['description'], "Initial message content matches ticket description");
    }

    private function testConfidentialTicketAccessControl(): void
    {
        $stmt = $this->db->query("SELECT id FROM helpdesk_categories WHERE code = 'GRIEVANCE' LIMIT 1");
        $catId = (int)$stmt->fetchColumn();

        // Two distinct users
        $users = $this->db->query("SELECT id FROM users ORDER BY id ASC LIMIT 2")->fetchAll(PDO::FETCH_COLUMN);
        $ownerId = (int)$users[0];
        $otherEmpId = isset($users[1]) ? (int)$users[1] : $ownerId + 999;

        $ticketData = [
            'category_id' => $catId,
            'user_id' => $ownerId,
            'subject' => 'TEST: Strictly Confidential Inquiry',
            'description' => 'Discreet inquiry regarding workplace atmosphere.',
            'priority' => 'Urgent',
            'is_confidential' => 1
        ];

        $confTicket = $this->model->createTicket($ticketData);
        $ticketId = $confTicket['ticket_id'];

        // Owner (Employee) CAN access
        $ownerAccess = $this->model->getTicketById($ticketId, $ownerId, 'Employee');
        $this->assert($ownerAccess !== null, "Ticket creator employee can access their own confidential ticket");

        // Admin CAN access
        $adminAccess = $this->model->getTicketById($ticketId, 9999, 'Admin');
        $this->assert($adminAccess !== null, "Admin can access confidential grievance ticket");

        // Another employee CANNOT access
        $otherAccess = $this->model->getTicketById($ticketId, $otherEmpId, 'Employee');
        $this->assert($otherAccess === null, "Unrelated employee CANNOT view confidential ticket");

        // Verify listing filtering: another employee will not see confidential ticket belonging to others
        $otherList = $this->model->getTickets(['role' => 'Employee', 'viewer_user_id' => $otherEmpId]);
        $otherListIds = array_column($otherList, 'id');
        $this->assert(!in_array($ticketId, $otherListIds), "Confidential ticket is excluded from other employees' ticket listings");
    }

    private function testMessageThreadAndInternalNotes(): void
    {
        $users = $this->db->query("SELECT id FROM users ORDER BY id ASC LIMIT 2")->fetchAll(PDO::FETCH_COLUMN);
        $empId = (int)$users[0];
        $adminId = isset($users[1]) ? (int)$users[1] : 1;

        $catStmt = $this->db->query("SELECT id FROM helpdesk_categories LIMIT 1");
        $catId = (int)$catStmt->fetchColumn();

        $ticket = $this->model->createTicket([
            'category_id' => $catId,
            'user_id' => $empId,
            'subject' => 'TEST: Thread Communication Ticket',
            'description' => 'Main issue description.',
            'priority' => 'Medium',
            'is_confidential' => 0
        ]);
        $ticketId = $ticket['ticket_id'];

        // Employee adds a public response
        $empMsgId = $this->model->addMessage($ticketId, $empId, 'Here is the screenshot and additional details.', 0);
        $this->assert($empMsgId > 0, "Employee successfully posted public response to ticket");

        // HR Admin adds an INTERNAL note
        $hrNoteId = $this->model->addMessage($ticketId, $adminId, 'Internal HR: Checked IT asset warranty, covered until Dec 2026.', 1);
        $this->assert($hrNoteId > 0, "HR Admin successfully posted private internal note");

        // Verify Admin sees both messages + internal note
        $adminView = $this->model->getTicketById($ticketId, $adminId, 'Admin');
        $adminInternalCount = count(array_filter($adminView['messages'], fn($m) => (int)$m['is_internal_note'] === 1));
        $this->assert($adminInternalCount === 1, "Admin view includes private internal HR note");

        // Verify Employee does NOT see the internal note
        $empView = $this->model->getTicketById($ticketId, $empId, 'Employee');
        $empInternalCount = count(array_filter($empView['messages'], fn($m) => (int)$m['is_internal_note'] === 1));
        $this->assert($empInternalCount === 0, "Employee view strictly HIDES private internal HR notes");
    }

    private function testTicketStatusWorkflow(): void
    {
        $userStmt = $this->db->query("SELECT id FROM users ORDER BY id ASC LIMIT 1");
        $userId = (int)$userStmt->fetchColumn();
        $catStmt = $this->db->query("SELECT id FROM helpdesk_categories LIMIT 1");
        $catId = (int)$catStmt->fetchColumn();

        $ticket = $this->model->createTicket([
            'category_id' => $catId,
            'user_id' => $userId,
            'subject' => 'TEST: Workflow Lifecycle Ticket',
            'description' => 'Testing status changes.',
            'priority' => 'Low',
            'is_confidential' => 0
        ]);
        $ticketId = $ticket['ticket_id'];

        // Step 1: In Progress
        $res1 = $this->model->updateStatus($ticketId, 'In Progress');
        $t1 = $this->model->getTicketById($ticketId);
        $this->assert($res1 && $t1['status'] === 'In Progress', "Ticket status transitioned to In Progress");

        // Step 2: Waiting on Employee
        $res2 = $this->model->updateStatus($ticketId, 'Waiting on Employee');
        $t2 = $this->model->getTicketById($ticketId);
        $this->assert($res2 && $t2['status'] === 'Waiting on Employee', "Ticket status transitioned to Waiting on Employee");

        // Step 3: Resolved
        $res3 = $this->model->updateStatus($ticketId, 'Resolved');
        $t3 = $this->model->getTicketById($ticketId);
        $this->assert($res3 && $t3['status'] === 'Resolved', "Ticket status transitioned to Resolved");
        $this->assert(!empty($t3['resolved_at']), "Resolved timestamp set upon resolution: {$t3['resolved_at']}");

        // Step 4: Closed
        $res4 = $this->model->updateStatus($ticketId, 'Closed');
        $t4 = $this->model->getTicketById($ticketId);
        $this->assert($res4 && $t4['status'] === 'Closed', "Ticket status transitioned to Closed");
    }

    private function testTicketAssignment(): void
    {
        $users = $this->db->query("SELECT id FROM users ORDER BY id ASC LIMIT 2")->fetchAll(PDO::FETCH_COLUMN);
        $empId = (int)$users[0];
        $assigneeId = isset($users[1]) ? (int)$users[1] : $empId;

        $catStmt = $this->db->query("SELECT id FROM helpdesk_categories LIMIT 1");
        $catId = (int)$catStmt->fetchColumn();

        $ticket = $this->model->createTicket([
            'category_id' => $catId,
            'user_id' => $empId,
            'subject' => 'TEST: Assignment Verification',
            'description' => 'Testing agent assignment.',
            'priority' => 'Medium',
            'is_confidential' => 0
        ]);
        $ticketId = $ticket['ticket_id'];

        $assigned = $this->model->assignTicket($ticketId, $assigneeId);
        $t = $this->model->getTicketById($ticketId);
        $this->assert($assigned && (int)$t['assigned_to'] === $assigneeId, "Ticket successfully assigned to user ID {$assigneeId}");
    }

    private function testCsatSubmission(): void
    {
        $userStmt = $this->db->query("SELECT id FROM users ORDER BY id ASC LIMIT 1");
        $userId = (int)$userStmt->fetchColumn();
        $catStmt = $this->db->query("SELECT id FROM helpdesk_categories LIMIT 1");
        $catId = (int)$catStmt->fetchColumn();

        $ticket = $this->model->createTicket([
            'category_id' => $catId,
            'user_id' => $userId,
            'subject' => 'TEST: CSAT Rating Test',
            'description' => 'Checking CSAT feedback submission.',
            'priority' => 'Low',
            'is_confidential' => 0
        ]);
        $ticketId = $ticket['ticket_id'];

        // Resolve ticket first
        $this->model->updateStatus($ticketId, 'Resolved');

        // Submit CSAT 5 stars
        $res = $this->model->submitCsat($ticketId, $userId, 5, 'Super fast response and issue was resolved within 2 hours!');
        $t = $this->model->getTicketById($ticketId);
        $this->assert($res && (int)$t['csat_rating'] === 5, "CSAT 5-star rating recorded");
        $this->assert($t['csat_feedback'] === 'Super fast response and issue was resolved within 2 hours!', "CSAT feedback text recorded");
        $this->assert($t['status'] === 'Closed', "Ticket automatically marked Closed after CSAT submission");
    }

    private function testHelpdeskStats(): void
    {
        $stats = $this->model->getStats();
        $this->assert(isset($stats['total_tickets']) && $stats['total_tickets'] >= 4, "Helpdesk stats returns total tickets count ({$stats['total_tickets']})");
        $this->assert(isset($stats['open_tickets']), "Stats includes open tickets count ({$stats['open_tickets']})");
        $this->assert(isset($stats['sla_compliance_rate']), "Stats includes SLA compliance percentage: {$stats['sla_compliance_rate']}%");
        $this->assert(isset($stats['avg_csat']), "Stats includes Average CSAT: {$stats['avg_csat']}/5");
        $this->assert(isset($stats['avg_resolution_hrs']), "Stats includes average resolution hours: {$stats['avg_resolution_hrs']} hrs");
    }
}
