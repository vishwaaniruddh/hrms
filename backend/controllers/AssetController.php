<?php
/**
 * Asset Controller
 * RESTful API endpoints for IT Asset Allocation & Inventory
 */
class AssetController extends Controller
{
    private AssetService $service;

    public function __construct()
    {
        parent::__construct();
        $this->service = new AssetService();
    }

    /**
     * GET /assets/categories
     */
    public function categories(Request $request): void
    {
        $data = $this->service->getCategories();
        Response::success($data);
    }

    /**
     * GET /assets
     */
    public function index(Request $request): void
    {
        $page = $request->getPage();
        $perPage = $request->getPerPage();

        $params = [
            'page'        => $page,
            'per_page'    => $perPage,
            'category_id' => $request->getQuery('category_id'),
            'status'      => $request->getQuery('status'),
            'condition'   => $request->getQuery('condition'),
            'user_id'     => $request->getQuery('user_id'),
            'search'      => $request->getQuery('search'),
        ];

        $result = $this->service->getAssets($params);
        Response::paginated($result['data'], $result['meta']['total'], $page, $perPage);
    }

    /**
     * GET /assets/{id}
     */
    public function show(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $asset = $this->service->getAsset($id);

        if (!$asset) {
            Response::error('Asset not found', 404);
        }

        Response::success($asset);
    }

    /**
     * POST /assets
     */
    public function store(Request $request): void
    {
        $body = $request->getBody();

        try {
            $result = $this->service->createAsset($body);
            Response::created($result, 'Asset created successfully');
        } catch (InvalidArgumentException $e) {
            $decoded = json_decode($e->getMessage(), true);
            Response::error('Validation failed', 422, $decoded ?: ['message' => $e->getMessage()]);
        } catch (Exception $e) {
            Response::error('Failed to create asset: ' . $e->getMessage(), 500);
        }
    }

    /**
     * PUT /assets/{id}
     */
    public function update(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $body = $request->getBody();

        $success = $this->service->updateAsset($id, $body);

        if ($success) {
            Response::success(['updated' => true], 'Asset updated successfully');
        } else {
            Response::error('Asset not found or update failed', 404);
        }
    }

    /**
     * DELETE /assets/{id}
     */
    public function destroy(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $success = $this->service->deleteAsset($id);

        if ($success) {
            Response::success(['deleted' => true], 'Asset deleted successfully');
        } else {
            Response::error('Asset not found or delete failed', 404);
        }
    }

    /**
     * POST /assets/{id}/assign
     */
    public function assign(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $body = $request->getBody();

        try {
            $result = $this->service->assignAsset($id, $body);
            Response::success($result, 'Asset assigned successfully');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    /**
     * POST /assets/{id}/return
     */
    public function processReturn(Request $request): void
    {
        $id = (int)$request->getParam('id');
        $body = $request->getBody();

        try {
            $result = $this->service->returnAsset($id, $body);
            Response::success($result, 'Asset returned to inventory');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    /**
     * GET /assets/assignments
     */
    public function assignments(Request $request): void
    {
        $assetId = $request->getQuery('asset_id') ? (int)$request->getQuery('asset_id') : null;
        $userId = $request->getQuery('user_id') ? (int)$request->getQuery('user_id') : null;

        $data = $this->service->getAssignments($assetId, $userId);
        Response::success($data);
    }

    /**
     * GET /assets/stats
     */
    public function stats(Request $request): void
    {
        $userId = $request->getQuery('user_id') ? (int)$request->getQuery('user_id') : null;
        $data = $this->service->getStats($userId);
        Response::success($data);
    }
}
