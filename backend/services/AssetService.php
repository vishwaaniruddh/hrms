<?php
/**
 * Asset Service
 * Business logic for IT asset lifecycle, validation, allocations, returns, and cache management
 */
require_once __DIR__ . '/../models/AssetModel.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Cache.php';

class AssetService
{
    private AssetModel $model;
    private Cache $cache;

    public function __construct(?PDO $db = null)
    {
        $database = $db ?? Database::getInstance();
        $this->model = new AssetModel($database);
        $this->cache = Cache::getInstance();
    }

    /**
     * Get categories
     */
    public function getCategories(): array
    {
        return $this->cache->remember('asset_categories', 3600, function () {
            return $this->model->getCategories();
        }, ['assets']);
    }

    /**
     * Get filtered assets
     */
    public function getAssets(array $params = []): array
    {
        $cacheKey = 'assets_list_' . md5(serialize($params));
        return $this->cache->remember($cacheKey, 60, function () use ($params) {
            return $this->model->getAssets($params);
        }, ['assets']);
    }

    /**
     * Get asset by ID
     */
    public function getAsset(int $id): ?array
    {
        return $this->model->getAssetById($id);
    }

    /**
     * Create asset with validation
     */
    public function createAsset(array $data): array
    {
        $errors = [];
        if (empty($data['name'])) $errors['name'] = 'Asset name is required.';
        if (empty($data['category_id'])) $errors['category_id'] = 'Category is required.';
        if (empty($data['asset_tag'])) $errors['asset_tag'] = 'Asset Tag is required.';
        if (empty($data['serial_number'])) $errors['serial_number'] = 'Serial Number is required.';
        if (empty($data['brand'])) $errors['brand'] = 'Brand is required.';

        if (!empty($errors)) {
            throw new InvalidArgumentException(json_encode($errors));
        }

        $id = $this->model->createAsset($data);
        $this->cache->invalidateTags(['assets', 'stats']);

        return [
            'id' => $id,
            'message' => 'Asset registered successfully.'
        ];
    }

    /**
     * Update asset
     */
    public function updateAsset(int $id, array $data): bool
    {
        $res = $this->model->updateAsset($id, $data);
        if ($res) {
            $this->cache->invalidateTags(['assets', 'stats']);
        }
        return $res;
    }

    /**
     * Delete asset
     */
    public function deleteAsset(int $id): bool
    {
        $res = $this->model->deleteAsset($id);
        if ($res) {
            $this->cache->invalidateTags(['assets', 'stats']);
        }
        return $res;
    }

    /**
     * Assign asset to employee
     */
    public function assignAsset(int $assetId, array $data): array
    {
        if (empty($data['user_id'])) {
            throw new InvalidArgumentException(json_encode(['user_id' => 'Employee is required for allocation.']));
        }

        $asset = $this->model->getAssetById($assetId);
        if (!$asset) {
            throw new Exception('Asset not found.');
        }

        if ($asset['status'] === 'Assigned' && $asset['current_user_id'] != $data['user_id']) {
            throw new Exception("Asset is currently assigned to {$asset['assigned_to_name']}. Please return it first.");
        }

        $assignedBy = (int)($data['assigned_by'] ?? 1);
        $assignedDate = $data['assigned_date'] ?? date('Y-m-d');
        $expectedReturnDate = !empty($data['expected_return_date']) ? $data['expected_return_date'] : null;
        $condition = $data['condition'] ?? $asset['condition'] ?? 'Good';
        $notes = $data['notes'] ?? null;

        $assignmentId = $this->model->assignAsset(
            $assetId,
            (int)$data['user_id'],
            $assignedBy,
            $assignedDate,
            $expectedReturnDate,
            $condition,
            $notes
        );

        $this->cache->invalidateTags(['assets', 'stats']);

        return [
            'assignment_id' => $assignmentId,
            'message' => "Asset {$asset['asset_tag']} successfully assigned."
        ];
    }

    /**
     * Return asset to storage
     */
    public function returnAsset(int $assetId, array $data): array
    {
        $returnedDate = $data['returned_date'] ?? date('Y-m-d');
        $condition = $data['condition'] ?? 'Good';
        $notes = $data['notes'] ?? 'Returned to inventory';

        $res = $this->model->returnAsset($assetId, $returnedDate, $condition, $notes);
        $this->cache->invalidateTags(['assets', 'stats']);

        return [
            'success' => $res,
            'message' => 'Asset successfully returned to storage.'
        ];
    }

    /**
     * Get assignment history
     */
    public function getAssignments(?int $assetId = null, ?int $userId = null): array
    {
        return $this->model->getAssignments($assetId, $userId);
    }

    /**
     * Get aggregate inventory metrics
     */
    public function getStats(?int $userId = null): array
    {
        $cacheKey = 'asset_stats_' . ($userId ?? 'all');
        return $this->cache->remember($cacheKey, 60, function () use ($userId) {
            return $this->model->getStats($userId);
        }, ['assets', 'stats']);
    }
}
