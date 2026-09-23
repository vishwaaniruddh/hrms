<?php
/**
 * Asset Allocation & IT Inventory Test Suite
 */
class AssetTest
{
    private AssetModel $model;
    private AssetService $service;
    private PDO $db;
    private int $passed = 0;
    private int $failed = 0;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->model = new AssetModel($this->db);
        $this->service = new AssetService($this->db);
    }

    public function run(): void
    {
        echo "── Asset & Inventory Management Tests ──\n";

        $this->testCategories();
        $this->testAssetRetrieval();
        $this->testAssetCreate();
        $this->testAssignmentAndReturnFlow();
        $this->testAssetStats();

        echo "  Asset Tests: {$this->passed} passed, {$this->failed} failed\n";
    }

    private function testCategories(): void
    {
        $categories = $this->model->getCategories();
        $this->assert('Asset categories retrieved', count($categories) >= 5);
        $names = array_column($categories, 'name');
        $this->assert('Categories include Laptops & Desktops', in_array('Laptops & Desktops', $names));
    }

    private function testAssetRetrieval(): void
    {
        $result = $this->model->getAll(['per_page' => 10]);
        $this->assert('Assets retrieved with pagination', isset($result['data']) && count($result['data']) >= 5);
        $this->assert('Assets contain category and status info', isset($result['data'][0]['category_name']));

        // Test filter by status
        $assigned = $this->model->getAll(['status' => 'Assigned']);
        $this->assert('Filter by assigned status returns results', count($assigned['data']) >= 1);
    }

    private function testAssetCreate(): void
    {
        $tag = 'TEST-TAG-' . time();
        $serial = 'SN-TEST-' . time();

        $createRes = $this->service->createAsset([
            'asset_tag' => $tag,
            'name' => 'Unit Test ThinkPad',
            'category_id' => 1,
            'brand' => 'Lenovo',
            'model' => 'T14 Gen 4',
            'serial_number' => $serial,
            'purchase_cost' => 1299.99,
            'condition' => 'Good',
            'notes' => 'Created via unit test suite'
        ]);

        $this->assert('Asset created successfully with numeric ID', isset($createRes['id']) && $createRes['id'] > 0);
        $assetId = $createRes['id'];

        $fetched = $this->model->getById($assetId);
        $this->assert('Asset retrieved by ID with correct tag', $fetched !== null && $fetched['asset_tag'] === $tag);
        $this->assert('Asset starts with status Available', $fetched['status'] === 'Available');

        // Clean up test asset
        $this->model->delete($assetId);
    }

    private function testAssignmentAndReturnFlow(): void
    {
        // 1. Create a dedicated asset for flow test
        $tag = 'FLOW-TAG-' . time();
        $serial = 'FLOW-SN-' . time();

        $createRes = $this->service->createAsset([
            'asset_tag' => $tag,
            'name' => 'Flow Test MacBook',
            'category_id' => 1,
            'brand' => 'Apple',
            'model' => 'M3 Air',
            'serial_number' => $serial,
            'purchase_cost' => 1499.00,
            'condition' => 'Good'
        ]);
        $assetId = $createRes['id'];

        // 2. Assign to employee (user_id 1)
        $assignRes = $this->service->assignAsset($assetId, [
            'user_id' => 1,
            'assigned_by' => 1,
            'notes' => 'Assigned for testing purposes'
        ]);
        $this->assert('Asset assignment transaction succeeds', isset($assignRes['assignment_id']) && $assignRes['assignment_id'] > 0);

        // 3. Verify status changed to assigned
        $updated = $this->model->getById($assetId);
        $this->assert('Asset status updated to Assigned', $updated['status'] === 'Assigned');
        $this->assert('Asset current_user_id matches user 1', (int)$updated['current_user_id'] === 1);

        // 4. Return asset
        $returnRes = $this->service->returnAsset($assetId, [
            'condition' => 'Good',
            'notes' => 'Returned successfully during test run'
        ]);
        $this->assert('Asset return transaction succeeds', isset($returnRes['success']) && $returnRes['success'] === true);

        // 5. Verify status changed back to available
        $returned = $this->model->getById($assetId);
        $this->assert('Asset status reverted to Available', $returned['status'] === 'Available');
        $this->assert('Asset current user is null', $returned['current_user_id'] === null);

        // 6. Verify assignment history logged
        $history = $this->model->getAssignments($assetId);
        $this->assert('Assignment history log contains record', count($history) >= 1);
        $this->assert('Assignment record is marked Returned', $history[0]['status'] === 'Returned');

        // Cleanup
        $this->model->delete($assetId);
    }

    private function testAssetStats(): void
    {
        $stats = $this->model->getStats();
        $this->assert('Stats contains total_assets', isset($stats['total_assets']) && $stats['total_assets'] >= 5);
        $this->assert('Stats contains assigned_count', isset($stats['assigned_count']));
        $this->assert('Stats contains available_count', isset($stats['available_count']));
        $this->assert('Stats contains total_valuation', isset($stats['total_valuation']) && $stats['total_valuation'] > 0);
    }

    private function assert(string $label, bool $condition): void
    {
        if ($condition) {
            $this->passed++;
            echo "  ✅ PASS: {$label}\n";
        } else {
            $this->failed++;
            echo "  ❌ FAIL: {$label}\n";
        }
    }

    public function getPassed(): int { return $this->passed; }
    public function getFailed(): int { return $this->failed; }
}
