<?php
/**
 * Database Configuration - Singleton PDO Connection
 * Connects to hrms_db on local XAMPP MySQL
 */
class Database
{
    private static ?PDO $instance = null;

    private function __construct() {}

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            $host = getenv('DB_HOST') ?: 'localhost';
            $port = getenv('DB_PORT') ?: '3306';
            $dbName = getenv('DB_NAME') ?: 'hrms_db';
            $username = getenv('DB_USER') ?: 'root';
            $password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
            $charset = 'utf8mb4';

            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                $host,
                $port,
                $dbName,
                $charset
            );

            self::$instance = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8mb4'"
            ]);
        }

        return self::$instance;
    }

    /**
     * Reset connection (used in testing)
     */
    public static function reset(): void
    {
        self::$instance = null;
    }
}
