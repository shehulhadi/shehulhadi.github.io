<?php
/* UniConnect — Announcements API */
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$user = requireAuth();
$db = getDB();

// GET /api/announcements.php?action=list — list announcements
if ($method === 'GET' && $action === 'list') {
    $stmt = $db->prepare('
        SELECT a.*, u.name as author_name, u.avatar as author_avatar, u.role as author_role,
            d.name as dept_name
        FROM announcements a
        JOIN users u ON u.id = a.user_id
        LEFT JOIN departments d ON d.id = a.target_dept_id
        WHERE (a.target_role = "all" OR a.target_role = ? OR a.target_role IS NULL)
            AND (a.target_dept_id IS NULL OR a.target_dept_id = ?)
        ORDER BY a.pinned DESC, a.created_at DESC
    ');
    $stmt->execute([$user['role'], $user['dept_id']]);
    $announcements = $stmt->fetchAll();
    jsonResponse(['success' => true, 'announcements' => $announcements]);
}

// GET /api/announcements.php?action=detail&id=X
if ($method === 'GET' && $action === 'detail') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonError('Announcement ID is required');

    $stmt = $db->prepare('
        SELECT a.*, u.name as author_name, u.avatar as author_avatar, u.role as author_role
        FROM announcements a JOIN users u ON u.id = a.user_id WHERE a.id = ?
    ');
    $stmt->execute([$id]);
    $announcement = $stmt->fetch();
    if (!$announcement) jsonError('Announcement not found', 404);

    jsonResponse(['success' => true, 'announcement' => $announcement]);
}

// POST /api/announcements.php?action=create — create announcement
if ($method === 'POST' && $action === 'create') {
    if ($user['role'] === 'student') {
        jsonError('Students cannot create announcements', 403);
    }

    $input = getInput();
    $title = trim($input['title'] ?? '');
    $body = trim($input['body'] ?? '');
    $targetRole = $input['target_role'] ?? 'all';
    $targetDeptId = $input['target_dept_id'] ?? null;
    $priority = $input['priority'] ?? 'normal';
    $pinned = (int)($input['pinned'] ?? 0);

    if (empty($title) || empty($body)) {
        jsonError('Title and body are required');
    }

    if (!in_array($priority, ['normal', 'medium', 'high'])) {
        jsonError('Invalid priority');
    }

    // Only leadership can broadcast (no dept restriction)
    if ($user['role'] !== 'leadership' && empty($targetDeptId)) {
        $targetDeptId = $user['dept_id'];
    }

    $stmt = $db->prepare('INSERT INTO announcements (user_id, title, body, target_role, target_dept_id, priority, pinned) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([$user['id'], $title, $body, $targetRole, $targetDeptId, $priority, $pinned]);

    jsonResponse(['success' => true, 'announcement_id' => $db->lastInsertId()], 201);
}

// PUT /api/announcements.php?action=pin&id=X — toggle pin
if ($method === 'PUT' && $action === 'pin') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonError('Announcement ID is required');

    if ($user['role'] === 'student') jsonError('Not allowed', 403);

    $stmt = $db->prepare('UPDATE announcements SET pinned = NOT pinned WHERE id = ?');
    $stmt->execute([$id]);

    jsonResponse(['success' => true, 'message' => 'Pin toggled']);
}

// DELETE /api/announcements.php?action=delete&id=X
if ($method === 'DELETE' && $action === 'delete') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonError('Announcement ID is required');

    // Only author or leadership can delete
    $stmt = $db->prepare('SELECT user_id FROM announcements WHERE id = ?');
    $stmt->execute([$id]);
    $ann = $stmt->fetch();
    if (!$ann) jsonError('Announcement not found', 404);

    if ($ann['user_id'] !== $user['id'] && $user['role'] !== 'leadership') {
        jsonError('Not authorized to delete this announcement', 403);
    }

    $stmt = $db->prepare('DELETE FROM announcements WHERE id = ?');
    $stmt->execute([$id]);
    jsonResponse(['success' => true, 'message' => 'Deleted']);
}

jsonError('Invalid endpoint', 404);
