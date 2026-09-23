<?php
/**
 * JSON Response builder with standardized envelope
 */
class Response
{
    /**
     * Send a JSON response with standard envelope
     */
    public static function json(mixed $data, int $statusCode = 200, array $meta = []): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');

        $envelope = [
            'success' => $statusCode >= 200 && $statusCode < 300,
        ];

        if (isset($data['error'])) {
            $envelope['error'] = $data['error'];
            if (isset($data['errors'])) {
                $envelope['errors'] = $data['errors'];
            }
        } else {
            $envelope['data'] = $data;
        }

        if (!empty($meta)) {
            $envelope['meta'] = $meta;
        }

        echo json_encode($envelope, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    /**
     * Send a success response
     */
    public static function success(mixed $data, string $message = '', array $meta = []): void
    {
        $response = $data;
        if (!empty($message)) {
            $meta['message'] = $message;
        }
        self::json($response, 200, $meta);
    }

    /**
     * Send a created response (201)
     */
    public static function created(mixed $data, string $message = 'Created successfully'): void
    {
        self::json($data, 201, ['message' => $message]);
    }

    /**
     * Send a paginated response
     */
    public static function paginated(array $data, int $total, int $page, int $perPage): void
    {
        self::json($data, 200, [
            'total'        => $total,
            'page'         => $page,
            'per_page'     => $perPage,
            'total_pages'  => (int) ceil($total / $perPage),
        ]);
    }

    /**
     * Send an error response
     */
    public static function error(string $message, int $statusCode = 400, array $errors = []): void
    {
        $data = ['error' => $message];
        if (!empty($errors)) {
            $data['errors'] = $errors;
        }
        self::json($data, $statusCode);
    }

    /**
     * Send a not found response
     */
    public static function notFound(string $message = 'Resource not found'): void
    {
        self::error($message, 404);
    }

    /**
     * Send a validation error response
     */
    public static function validationError(array $errors): void
    {
        self::error('Validation failed', 422, $errors);
    }
}
