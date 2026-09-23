<?php
/**
 * Cloud Database Importer
 * Usage: php scratch/cloud_import.php <host> <port> <dbname> <user> <password>
 */

if ($argc < 6) {
    echo "Usage: php scratch/cloud_import.php <host> <port> <dbname> <user> <password>\n";
    exit(1);
}

$host = $argv[1];
$port = $argv[2];
$dbname = $argv[3];
$user = $argv[4];
$pass = $argv[5];

echo "Connecting to MySQL at {$host}:{$port} / {$dbname} as {$user}...\n";

$dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_EMULATE_PREPARES => false,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8mb4'",
    PDO::MYSQL_ATTR_MULTI_STATEMENTS => true
];

if (defined('PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT')) {
    $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
}

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "Connected successfully!\n";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

$sqlFile = __DIR__ . '/../database.sql';
if (!file_exists($sqlFile)) {
    echo "Error: database.sql not found at {$sqlFile}\n";
    exit(1);
}

echo "Reading database.sql...\n";
$sql = file_get_contents($sqlFile);
$sql = preg_replace('/^\xEF\xBB\xBF/', '', $sql);
file_put_contents($sqlFile, $sql); // also rewrite clean database.sql without BOM

echo "Importing schema and seed data into cloud database...\n";
try {
    $pdo->exec("SET foreign_key_checks = 0;");
    $pdo->exec($sql);
    $pdo->exec("SET foreign_key_checks = 1;");
    echo "All tables, indexes, and seed records imported successfully!\n";

    // Verify row counts
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Found " . count($tables) . " tables in database: " . implode(', ', array_slice($tables, 0, 5)) . "...\n";
} catch (PDOException $e) {
    echo "Import failed: " . $e->getMessage() . "\n";
    exit(1);
}
