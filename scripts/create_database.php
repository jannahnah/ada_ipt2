<?php
// Simple helper to create the database specified in .env
$root = dirname(__DIR__);
$envPath = $root . DIRECTORY_SEPARATOR . '.env';
if (! file_exists($envPath)) {
    echo "\.env not found\n";
    exit(1);
}

$env = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$vars = [];
foreach ($env as $line) {
    if (strpos(trim($line), '#') === 0) continue;
    if (! strpos($line, '=')) continue;
    list($k,$v) = explode('=', $line, 2);
    $vars[trim($k)] = trim($v, " \"'\n\r");
}

$dbHost = $vars['DB_HOST'] ?? '127.0.0.1';
$dbPort = $vars['DB_PORT'] ?? '3306';
$dbName = $vars['DB_DATABASE'] ?? 'ada';
$dbUser = $vars['DB_USERNAME'] ?? 'root';
$dbPass = $vars['DB_PASSWORD'] ?? '';

echo "Creating database '{$dbName}' on {$dbHost}:{$dbPort} as {$dbUser}\n";

try {
    $dsn = "mysql:host={$dbHost};port={$dbPort}";
    $pdo = new PDO($dsn, $dbUser, $dbPass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $sql = "CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
    $pdo->exec($sql);
    echo "Database created or already exists.\n";
    exit(0);
} catch (Exception $e) {
    echo "Failed to create database: " . $e->getMessage() . "\n";
    exit(2);
}
