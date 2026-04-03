<?php
/* UniConnect — Auth API */
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'login') {
    $input = getInput();
    $matric = trim($input['matric_no'] ?? '');
    $password = $input['password'] ?? '';

    if (empty($matric) || empty($password)) {
        jsonError('Matric number and password are required');
    }

    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM users WHERE matric_no = ?');
    $stmt->execute([$matric]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        jsonError('Invalid credentials', 401);
    }

    if (!$user['verified']) {
        jsonError('Account not verified. Please verify your email first.', 403);
    }

    // Create session token
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+7 days'));
    $stmt = $db->prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)');
    $stmt->execute([$user['id'], $token, $expires]);

    unset($user['password_hash']);
    jsonResponse([
        'success' => true,
        'token' => $token,
        'user' => $user
    ]);
}

if ($method === 'POST' && $action === 'register') {
    $input = getInput();
    $name = trim($input['name'] ?? '');
    $matric = trim($input['matric_no'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $role = $input['role'] ?? 'student';
    $level = $input['level'] ?? null;

    if (empty($name) || empty($matric) || empty($email) || empty($password)) {
        jsonError('All fields are required');
    }

    if (!in_array($role, ['student', 'lecturer', 'senior-lecturer', 'leadership'])) {
        jsonError('Invalid role');
    }

    $db = getDB();

    // Check if matric or email already exists
    $stmt = $db->prepare('SELECT id FROM users WHERE matric_no = ? OR email = ?');
    $stmt->execute([$matric, $email]);
    if ($stmt->fetch()) {
        jsonError('Matric number or email already registered');
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $avatar = strtoupper(substr($name, 0, 1)) . strtoupper(substr($name, strpos($name, ' ') + 1, 1) ?: '');

    $stmt = $db->prepare('INSERT INTO users (matric_no, name, email, password_hash, role, dept_id, level, avatar, verified) VALUES (?, ?, ?, ?, ?, 1, ?, ?, 0)');
    $stmt->execute([$matric, $name, $email, $hash, $role, $level, $avatar]);

    jsonResponse([
        'success' => true,
        'message' => 'Registration successful. Please verify your account.',
        'user_id' => $db->lastInsertId()
    ], 201);
}

if ($method === 'POST' && $action === 'verify') {
    $input = getInput();
    $email = trim($input['email'] ?? '');
    $code = trim($input['code'] ?? '');

    if (empty($email) || empty($code)) {
        jsonError('Email and verification code are required');
    }

    // For demo purposes, accept code "123456"
    if ($code !== '123456') {
        jsonError('Invalid verification code');
    }

    $db = getDB();
    $stmt = $db->prepare('UPDATE users SET verified = 1 WHERE email = ?');
    $stmt->execute([$email]);

    if ($stmt->rowCount() === 0) {
        jsonError('Email not found');
    }

    jsonResponse(['success' => true, 'message' => 'Account verified successfully']);
}

if ($method === 'POST' && $action === 'logout') {
    $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION'] ?? '');
    if (!empty($token)) {
        $db = getDB();
        $stmt = $db->prepare('DELETE FROM sessions WHERE token = ?');
        $stmt->execute([$token]);
    }
    jsonResponse(['success' => true, 'message' => 'Logged out']);
}

if ($method === 'GET' && $action === 'me') {
    $user = requireAuth();
    jsonResponse(['success' => true, 'user' => $user]);
}

jsonError('Invalid endpoint', 404);
