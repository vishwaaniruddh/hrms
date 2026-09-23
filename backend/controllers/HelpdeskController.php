<?php
/**
 * HelpdeskController
 * REST endpoints for Internal HR Helpdesk, Ticket Conversation, SLA Tracking, and CSAT Feedback.
 */
require_once __DIR__ . '/../core/Response.php';

class HelpdeskController extends Controller
{
    private HelpdeskModel $model;

    public function __construct()
    {
        parent::__construct();
        $this->model = new HelpdeskModel();
    }

    /**
     * GET /api/helpdesk/categories
     */
    public function getCategories(Request $request): void
    {
        $categories = $this->model->getCategories();
        Response::success($categories);
    }

    /**
     * POST /api/helpdesk/categories
     */
    public function createCategory(Request $request): void
    {
        $body = $request->getBody();
        if (empty($body['name']) || empty($body['code'])) {
            Response::error('Category name and code are required', 422);
        }

        try {
            $catId = $this->model->createCategory($body);
            $cat = $this->model->getCategoryById($catId);
            Response::created($cat, 'Helpdesk category created successfully');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    /**
     * GET /api/helpdesk/tickets
     */
    public function getTickets(Request $request): void
    {
        $filters = [
            'status' => $request->getQuery('status'),
            'category_id' => $request->getQuery('category_id'),
            'priority' => $request->getQuery('priority'),
            'user_id' => $request->getQuery('user_id'),
            'assigned_to' => $request->getQuery('assigned_to'),
            'is_confidential' => $request->getQuery('is_confidential'),
            'search' => $request->getQuery('search'),
            'role' => $request->getQuery('role', 'Admin'),
            'viewer_user_id' => $request->getQuery('viewer_user_id')
        ];

        $tickets = $this->model->getTickets($filters);
        Response::success($tickets);
    }

    /**
     * GET /api/helpdesk/tickets/{id}
     */
    public function getTicket(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $viewerUserId = $request->getQuery('viewer_user_id');
        $viewerRole = $request->getQuery('viewer_role', 'Admin');

        $ticket = $this->model->getTicketById($id, $viewerUserId, $viewerRole);
        if (!$ticket) {
            Response::error('Ticket not found or access restricted', 404);
        }

        Response::success($ticket);
    }

    /**
     * POST /api/helpdesk/tickets
     */
    public function createTicket(Request $request): void
    {
        $body = $request->getBody();

        if (empty($body['user_id']) || empty($body['category_id']) || empty($body['subject']) || empty($body['description'])) {
            Response::error('user_id, category_id, subject, and description are required', 422);
        }

        try {
            $result = $this->model->createTicket($body);
            $ticket = $this->model->getTicketById($result['ticket_id']);

            // Non-blocking WhatsApp Notification to Agent or Employee if Urgent
            if (!empty($body['priority']) && $body['priority'] === 'Urgent') {
                try {
                    if (class_exists('NotificationService')) {
                        $notif = new NotificationService();
                        $db = Database::getInstance();
                        $requester = $db->query("SELECT full_name, phone FROM users WHERE id = {$body['user_id']}")->fetch(PDO::FETCH_ASSOC);
                        if ($requester && !empty($requester['phone'])) {
                            $notif->sendCustomMessage(
                                $body['user_id'],
                                $requester['full_name'],
                                $requester['phone'],
                                "Hello {$requester['full_name']}, your urgent HR Helpdesk ticket {$result['ticket_number']} ('{$body['subject']}') has been logged and assigned high priority. Target response time: 4 hours.",
                                'whatsapp'
                            );
                        }
                    }
                } catch (Exception $ne) {
                    // Suppress notification errors so ticket creation always succeeds
                }
            }

            Response::created($ticket, "Ticket {$result['ticket_number']} created successfully");
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    /**
     * POST /api/helpdesk/tickets/{id}/messages
     */
    public function replyTicket(Request $request): void
    {
        $ticketId = (int) $request->getParam('id');
        $body = $request->getBody();

        if (empty($body['user_id']) || empty($body['message'])) {
            Response::error('user_id and message are required', 422);
        }

        $isInternal = !empty($body['is_internal_note']) ? 1 : 0;
        $attachment = $body['attachment_path'] ?? null;

        try {
            $msgId = $this->model->addMessage($ticketId, $body['user_id'], $body['message'], $isInternal, $attachment);
            $ticket = $this->model->getTicketById($ticketId);

            // If an HR Admin or Agent posted a public reply, notify employee via WhatsApp
            if (!$isInternal && $ticket && $body['user_id'] != $ticket['user_id']) {
                try {
                    if (class_exists('NotificationService')) {
                        $notif = new NotificationService();
                        $db = Database::getInstance();
                        $requester = $db->query("SELECT full_name, phone FROM users WHERE id = {$ticket['user_id']}")->fetch(PDO::FETCH_ASSOC);
                        if ($requester && !empty($requester['phone'])) {
                            $preview = substr($body['message'], 0, 100);
                            $notif->sendCustomMessage(
                                $ticket['user_id'],
                                $requester['full_name'],
                                $requester['phone'],
                                "Hello {$requester['full_name']}, HR Support has updated your ticket {$ticket['ticket_number']}: '{$preview}...' View full updates at http://localhost:5173/hrms/helpdesk",
                                'whatsapp'
                            );
                        }
                    }
                } catch (Exception $ne) {
                    // Non-blocking
                }
            }

            Response::created(['message_id' => $msgId, 'ticket' => $ticket], 'Message added successfully');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    /**
     * PUT /api/helpdesk/tickets/{id}/status
     */
    public function updateStatus(Request $request): void
    {
        $ticketId = (int) $request->getParam('id');
        $body = $request->getBody();

        if (empty($body['status'])) {
            Response::error('status is required', 422);
        }

        try {
            $this->model->updateStatus($ticketId, $body['status']);
            $ticket = $this->model->getTicketById($ticketId);

            // If ticket resolved, notify employee to provide CSAT rating
            if ($body['status'] === 'Resolved' && $ticket) {
                try {
                    if (class_exists('NotificationService')) {
                        $notif = new NotificationService();
                        $db = Database::getInstance();
                        $requester = $db->query("SELECT full_name, phone FROM users WHERE id = {$ticket['user_id']}")->fetch(PDO::FETCH_ASSOC);
                        if ($requester && !empty($requester['phone'])) {
                            $notif->sendCustomMessage(
                                $ticket['user_id'],
                                $requester['full_name'],
                                $requester['phone'],
                                "Hello {$requester['full_name']}, your ticket {$ticket['ticket_number']} ('{$ticket['subject']}') has been marked as Resolved. Please review and provide your satisfaction rating at http://localhost:5173/hrms/helpdesk",
                                'whatsapp'
                            );
                        }
                    }
                } catch (Exception $ne) {
                    // Non-blocking
                }
            }

            Response::success($ticket, "Ticket status updated to {$body['status']}");
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    /**
     * PUT /api/helpdesk/tickets/{id}/assign
     */
    public function assignTicket(Request $request): void
    {
        $ticketId = (int) $request->getParam('id');
        $body = $request->getBody();

        if (!isset($body['assigned_to'])) {
            Response::error('assigned_to is required', 422);
        }

        try {
            $this->model->assignTicket($ticketId, $body['assigned_to']);
            $ticket = $this->model->getTicketById($ticketId);
            Response::success($ticket, 'Ticket assigned successfully');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    /**
     * POST /api/helpdesk/tickets/{id}/csat
     */
    public function submitCsat(Request $request): void
    {
        $ticketId = (int) $request->getParam('id');
        $body = $request->getBody();

        if (empty($body['user_id']) || empty($body['rating'])) {
            Response::error('user_id and rating (1-5) are required', 422);
        }

        try {
            $this->model->submitCsat($ticketId, $body['user_id'], $body['rating'], $body['feedback'] ?? null);
            $ticket = $this->model->getTicketById($ticketId);
            Response::success($ticket, 'Thank you! Your CSAT feedback has been recorded.');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    /**
     * GET /api/helpdesk/stats
     */
    public function getStats(Request $request): void
    {
        $userId = $request->getQuery('user_id');
        $role = $request->getQuery('role', 'Admin');

        $stats = $this->model->getStats($userId, $role);
        Response::success($stats);
    }
}
