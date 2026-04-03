<?php
/* UniConnect — API Router */

$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

// Remove base path prefix if behind a subdirectory
$basePath = '/api/';
if (strpos($path, $basePath) === 0) {
    $endpoint = substr($path, strlen($basePath));
} else {
    $endpoint = ltrim($path, '/');
}

// Remove .php extension if present
$endpoint = str_replace('.php', '', $endpoint);

$routes = [
    'auth'          => __DIR__ . '/auth.php',
    'messages'      => __DIR__ . '/messages.php',
    'assignments'   => __DIR__ . '/assignments.php',
    'announcements' => __DIR__ . '/announcements.php',
    'materials'     => __DIR__ . '/materials.php',
    'users'         => __DIR__ . '/users.php',
    'courses'       => __DIR__ . '/courses.php',
];

if (isset($routes[$endpoint])) {
    require $routes[$endpoint];
} else {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Endpoint not found: ' . $endpoint]);
}
