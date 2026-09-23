<?php
/**
 * User Model Tests
 * Tests database connectivity, user CRUD, and validation
 */
class UserModelTest
{
    private UserModel $model;
    private PDO $db;
    private int $passed = 0;
    private int $failed = 0;
    private ?int $testUserId = null;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->model = new UserModel($this->db);
    }

    public function run(): array
    {
        $this->testDatabaseConnection();
        $this->testCreateUser();
        $this->testFindById();
        $this->testFindByEmail();
        $this->testUpdateUser();
        $this->testGetAll();
        $this->testCountByStatus();
        $this->testSearchFilter();
        $this->testDeleteUser();

        return ['passed' => $this->passed, 'failed' => $this->failed];
    }

    private function testDatabaseConnection(): void
    {
        try {
            $stmt = $this->db->query("SELECT 1");
            $this->assert($stmt !== false, 'Database Connection');
        } catch (\Exception $e) {
            $this->assert(false, 'Database Connection: ' . $e->getMessage());
        }
    }

    private function testCreateUser(): void
    {
        $this->testUserId = $this->model->create([
            'full_name'    => 'Test User HRMS',
            'display_name' => 'Tester',
            'email'        => 'test_hrms_' . time() . '@example.com',
            'password'     => 'test123',
            'phone'        => '+1 555-0000',
            'designation'  => 'Pharmacist',
            'role_id'      => 3,
            'joining_date' => date('Y-m-d'),
            'status'       => 'Active',
        ]);

        $this->assert($this->testUserId > 0, 'Create User');
    }

    private function testFindById(): void
    {
        if (!$this->testUserId) {
            $this->assert(false, 'Find By ID (no test user)');
            return;
        }

        $user = $this->model->findById($this->testUserId);
        $this->assert($user !== null && $user['full_name'] === 'Test User HRMS', 'Find By ID');
    }

    private function testFindByEmail(): void
    {
        if (!$this->testUserId) {
            $this->assert(false, 'Find By Email (no test user)');
            return;
        }

        $user = $this->model->findById($this->testUserId);
        $found = $this->model->findByEmail($user['email']);
        $this->assert($found !== null && $found['id'] == $this->testUserId, 'Find By Email');
    }

    private function testUpdateUser(): void
    {
        if (!$this->testUserId) {
            $this->assert(false, 'Update User (no test user)');
            return;
        }

        $result = $this->model->update($this->testUserId, ['display_name' => 'Updated Tester']);
        $updated = $this->model->findById($this->testUserId);
        $this->assert($result && $updated['display_name'] === 'Updated Tester', 'Update User');
    }

    private function testGetAll(): void
    {
        $result = $this->model->getAll([], 1, 10);
        $this->assert(
            isset($result['data']) && isset($result['total']) && $result['total'] > 0,
            'Get All Members'
        );
    }

    private function testCountByStatus(): void
    {
        $counts = $this->model->countByStatus();
        $this->assert(
            isset($counts['Active']) && isset($counts['total']) && $counts['total'] > 0,
            'Count By Status'
        );
    }

    private function testSearchFilter(): void
    {
        $result = $this->model->getAll(['search' => 'Test User HRMS'], 1, 10);
        $this->assert($result['total'] >= 1, 'Search Filter');
    }

    private function testDeleteUser(): void
    {
        if (!$this->testUserId) {
            $this->assert(false, 'Delete User (no test user)');
            return;
        }

        $result = $this->model->delete($this->testUserId);
        $deleted = $this->model->findById($this->testUserId);
        $this->assert($result && $deleted === null, 'Delete User');
    }

    private function assert(bool $condition, string $testName): void
    {
        if ($condition) {
            $this->passed++;
            echo "  ✅ PASS: $testName\n";
        } else {
            $this->failed++;
            echo "  ❌ FAIL: $testName\n";
        }
    }
}
