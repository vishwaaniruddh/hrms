<?php
/**
 * HTTP Request wrapper
 * Parses JSON body, query params, headers, and route parameters
 */
class Request
{
    private array $params = [];
    private array $queryParams;
    private array $body;
    private string $method;
    private string $uri;
    private array $headers;

    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        
        // Parse URI - strip query string and base path
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $uri = parse_url($uri, PHP_URL_PATH);
        
        // Remove base path (e.g., /hrms/backend/api)
        $basePath = '/hrms/backend/api';
        if (str_starts_with($uri, $basePath)) {
            $uri = substr($uri, strlen($basePath));
        }
        if (empty($uri)) {
            $uri = '/';
        }
        
        $this->uri = $uri;
        $this->queryParams = $_GET ?? [];
        $this->headers = $this->parseHeaders();

        // Parse JSON body for POST/PUT requests
        $rawBody = file_get_contents('php://input');
        $this->body = [];
        if (!empty($rawBody)) {
            $decoded = json_decode($rawBody, true);
            if (is_array($decoded)) {
                $this->body = $decoded;
            }
        }
        if (empty($this->body) && !empty($_POST)) {
            $this->body = $_POST;
        }
    }

    public function getMethod(): string
    {
        // Support method override via X-HTTP-Method-Override header
        $override = $this->getHeader('X-HTTP-Method-Override');
        if ($override && in_array(strtoupper($override), ['PUT', 'DELETE', 'PATCH'])) {
            return strtoupper($override);
        }
        return strtoupper($this->method);
    }

    public function getUri(): string
    {
        return $this->uri;
    }

    public function getParam(string $key, mixed $default = null): mixed
    {
        return $this->params[$key] ?? $default;
    }

    public function setParams(array $params): void
    {
        $this->params = $params;
    }

    public function getQuery(string $key, mixed $default = null): mixed
    {
        return $this->queryParams[$key] ?? $default;
    }

    public function getAllQuery(): array
    {
        return $this->queryParams;
    }

    public function getBody(string $key = null, mixed $default = null): mixed
    {
        if ($key === null) {
            return $this->body;
        }
        return $this->body[$key] ?? $default;
    }

    public function getHeader(string $name): ?string
    {
        $normalized = strtolower($name);
        return $this->headers[$normalized] ?? null;
    }

    /**
     * Get pagination parameters
     */
    public function getPage(): int
    {
        return max(1, (int) ($this->queryParams['page'] ?? 1));
    }

    public function getPerPage(int $default = 10): int
    {
        $perPage = (int) ($this->queryParams['per_page'] ?? $default);
        return min(max(1, $perPage), 100); // Cap at 100
    }

    private function parseHeaders(): array
    {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $headerName = strtolower(str_replace('_', '-', substr($key, 5)));
                $headers[$headerName] = $value;
            }
        }
        return $headers;
    }
}
