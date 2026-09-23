<?php
/**
 * User Controller
 * RESTful endpoints for member management
 */
class UserController extends Controller
{
    private UserService $service;

    public function __construct()
    {
        parent::__construct();
        $this->service = new UserService();
    }

    /**
     * GET /api/members
     * List members with search, filter, and pagination
     */
    public function index(Request $request): void
    {
        $filters = [
            'search'      => $request->getQuery('search'),
            'designation'  => $request->getQuery('designation'),
            'status'       => $request->getQuery('status'),
        ];

        // Remove empty filters
        $filters = array_filter($filters);

        $page = $request->getPage();
        $perPage = $request->getPerPage();

        $result = $this->service->getMembers($filters, $page, $perPage);

        Response::paginated($result['data'], $result['total'], $page, $perPage);
    }

    /**
     * GET /api/members/{id}
     * Get a single member with documents and settings
     */
    public function show(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $member = $this->service->getMember($id);

        if (!$member) {
            Response::notFound('Member not found');
        }

        Response::success($member);
    }

    /**
     * POST /api/members
     * Create a new member
     */
    public function store(Request $request): void
    {
        $data = $request->getBody();
        $result = $this->service->createMember($data);

        if (isset($result['errors'])) {
            Response::validationError($result['errors']);
        }

        Response::created($result, 'Member created successfully');
    }

    /**
     * PUT /api/members/{id}
     * Update an existing member
     */
    public function update(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $data = $request->getBody();

        $result = $this->service->updateMember($id, $data);

        if ($result === null) {
            Response::notFound('Member not found');
        }

        if (isset($result['errors'])) {
            Response::validationError($result['errors']);
        }

        Response::success($result, 'Member updated successfully');
    }

    /**
     * DELETE /api/members/{id}
     * Delete a member
     */
    public function destroy(Request $request): void
    {
        $id = (int) $request->getParam('id');
        $result = $this->service->deleteMember($id);

        if (!$result) {
            Response::notFound('Member not found');
        }

        Response::success(['deleted' => true], 'Member deleted successfully');
    }

    /**
     * GET /api/members/stats
     * Get member count statistics
     */
    public function stats(Request $request): void
    {
        $stats = $this->service->getMemberStats();
        Response::success($stats);
    }
}
