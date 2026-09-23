<?php
/**
 * Base Controller
 * Provides common utilities for all controllers
 */
abstract class Controller
{
    protected PDO $db;
    protected Cache $cache;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->cache = Cache::getInstance();
    }

    /**
     * Validate required fields from request body
     * Returns array of error messages (empty = valid)
     */
    protected function validateRequired(array $data, array $requiredFields): array
    {
        $errors = [];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
                $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' is required';
            }
        }
        return $errors;
    }

    /**
     * Validate email format
     */
    protected function validateEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
}
