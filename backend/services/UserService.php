<?php
/**
 * User Service
 * Business logic layer with caching for member operations
 */
class UserService
{
    private UserModel $model;
    private Cache $cache;

    private const CACHE_TTL = 300; // 5 minutes
    private const CACHE_TAG = 'members';

    public function __construct()
    {
        $this->model = new UserModel(Database::getInstance());
        $this->cache = Cache::getInstance();
    }

    /**
     * Get paginated members with caching
     */
    public function getMembers(array $filters = [], int $page = 1, int $perPage = 10): array
    {
        $cacheKey = 'members_list_' . md5(json_encode($filters) . "_p{$page}_pp{$perPage}");

        return $this->cache->remember($cacheKey, self::CACHE_TTL, function () use ($filters, $page, $perPage) {
            return $this->model->getAll($filters, $page, $perPage);
        });
    }

    /**
     * Get a single member by ID with caching
     */
    public function getMember(int $id): ?array
    {
        $cacheKey = 'member_' . $id;

        $member = $this->cache->get($cacheKey);
        if ($member !== null) {
            return $member;
        }

        $member = $this->model->findById($id);
        if ($member) {
            // Also fetch documents and settings
            $member['documents'] = $this->model->getDocuments($id);
            $member['settings'] = $this->model->getSettings($id);
            $this->cache->setWithTags($cacheKey, $member, [self::CACHE_TAG], self::CACHE_TTL);
        }

        return $member;
    }

    /**
     * Create a new member
     */
    public function createMember(array $data): array
    {
        // Validate required fields
        $errors = $this->validate($data);
        if (!empty($errors)) {
            return ['errors' => $errors];
        }

        // Check email uniqueness
        $existing = $this->model->findByEmail($data['email']);
        if ($existing) {
            return ['errors' => ['email' => 'Email already exists']];
        }

        $id = $this->model->create($data);
        $this->invalidateCache();

        return $this->model->findById($id);
    }

    /**
     * Update a member
     */
    public function updateMember(int $id, array $data): array|null
    {
        $existing = $this->model->findById($id);
        if (!$existing) {
            return null;
        }

        // Check email uniqueness if email changed
        if (isset($data['email']) && $data['email'] !== $existing['email']) {
            $emailExists = $this->model->findByEmail($data['email']);
            if ($emailExists) {
                return ['errors' => ['email' => 'Email already exists']];
            }
        }

        $this->model->update($id, $data);
        $this->invalidateCache();
        $this->cache->delete('member_' . $id);

        return $this->model->findById($id);
    }

    /**
     * Delete a member
     */
    public function deleteMember(int $id): bool
    {
        $existing = $this->model->findById($id);
        if (!$existing) {
            return false;
        }

        $result = $this->model->delete($id);
        if ($result) {
            $this->invalidateCache();
            $this->cache->delete('member_' . $id);
        }

        return $result;
    }

    /**
     * Get member count statistics
     */
    public function getMemberStats(): array
    {
        return $this->cache->remember('members_stats', self::CACHE_TTL, function () {
            return $this->model->countByStatus();
        });
    }

    /**
     * Validate member data
     */
    private function validate(array $data): array
    {
        $errors = [];

        if (empty($data['full_name'])) {
            $errors['full_name'] = 'Full name is required';
        }

        if (empty($data['email'])) {
            $errors['email'] = 'Email is required';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Invalid email format';
        }

        if (empty($data['designation'])) {
            $errors['designation'] = 'Designation is required';
        }

        $validDesignations = ['Admin', 'Manager', 'Pharmacist', 'Accountant', 'Salesman', 'Cleaner'];
        if (!empty($data['designation']) && !in_array($data['designation'], $validDesignations)) {
            $errors['designation'] = 'Invalid designation';
        }

        return $errors;
    }

    /**
     * Invalidate all member-related caches
     */
    private function invalidateCache(): void
    {
        $this->cache->invalidateByTag(self::CACHE_TAG);
        $this->cache->delete('members_stats');
        $this->cache->delete('dashboard_stats');
    }
}
