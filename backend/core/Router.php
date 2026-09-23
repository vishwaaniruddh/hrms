<?php
/**
 * Simple RESTful Router
 * Maps HTTP methods + URI patterns to controller actions
 */
class Router
{
    private array $routes = [];
    private array $middlewares = [];

    /**
     * Register a route
     */
    public function addRoute(string $method, string $pattern, callable|array $handler): self
    {
        $this->routes[] = [
            'method'  => strtoupper($method),
            'pattern' => $this->compilePattern($pattern),
            'raw'     => $pattern,
            'handler' => $handler,
        ];
        return $this;
    }

    public function get(string $pattern, callable|array $handler): self
    {
        return $this->addRoute('GET', $pattern, $handler);
    }

    public function post(string $pattern, callable|array $handler): self
    {
        return $this->addRoute('POST', $pattern, $handler);
    }

    public function put(string $pattern, callable|array $handler): self
    {
        return $this->addRoute('PUT', $pattern, $handler);
    }

    public function delete(string $pattern, callable|array $handler): self
    {
        return $this->addRoute('DELETE', $pattern, $handler);
    }

    /**
     * Dispatch the current request to the matching route
     */
    public function dispatch(Request $request): void
    {
        $method = $request->getMethod();
        $uri = $request->getUri();

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (preg_match($route['pattern'], $uri, $matches)) {
                // Extract named parameters
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                $request->setParams($params);

                $handler = $route['handler'];

                if (is_array($handler)) {
                    [$controllerClass, $method] = $handler;
                    $controller = new $controllerClass();
                    $controller->$method($request);
                } else {
                    $handler($request);
                }
                return;
            }
        }

        // No route matched
        Response::json(['error' => 'Route not found'], 404);
    }

    /**
     * Convert a route pattern like /members/{id} into a regex
     */
    private function compilePattern(string $pattern): string
    {
        // Replace {param} with named capture groups
        $regex = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $pattern);
        return '#^' . $regex . '$#';
    }
}
