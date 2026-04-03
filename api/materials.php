<?php
/* UniConnect — Materials API */
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$user = requireAuth();
$db = getDB();

// GET /api/materials.php?action=list — list materials for user's courses
if ($method === 'GET' && $action === 'list') {
    if ($user['role'] === 'student') {
        $stmt = $db->prepare('
            SELECT m.*, c.code as course_code, c.name as course_name, u.name as uploader_name
            FROM materials m
            JOIN courses c ON c.id = m.course_id
            JOIN users u ON u.id = m.user_id
            JOIN course_enrollments ce ON ce.course_id = m.course_id AND ce.user_id = ?
            ORDER BY m.created_at DESC
        ');
        $stmt->execute([$user['id']]);
    } else {
        // Lecturers see materials for courses they teach
        $stmt = $db->prepare('
            SELECT m.*, c.code as course_code, c.name as course_name, u.name as uploader_name
            FROM materials m
            JOIN courses c ON c.id = m.course_id
            JOIN users u ON u.id = m.user_id
            JOIN course_enrollments ce ON ce.course_id = m.course_id AND ce.user_id = ? AND ce.role = "lecturer"
            ORDER BY m.created_at DESC
        ');
        $stmt->execute([$user['id']]);
    }

    $materials = $stmt->fetchAll();

    // Group by course
    $grouped = [];
    foreach ($materials as $mat) {
        $key = $mat['course_code'];
        if (!isset($grouped[$key])) {
            $grouped[$key] = [
                'course_code' => $mat['course_code'],
                'course_name' => $mat['course_name'],
                'materials' => []
            ];
        }
        $grouped[$key]['materials'][] = $mat;
    }

    jsonResponse(['success' => true, 'courses' => array_values($grouped)]);
}

// POST /api/materials.php?action=upload — upload material (lecturers only)
if ($method === 'POST' && $action === 'upload') {
    if ($user['role'] === 'student') jsonError('Students cannot upload materials', 403);

    $input = getInput();
    $courseId = (int)($input['course_id'] ?? 0);
    $title = trim($input['title'] ?? '');
    $filename = trim($input['filename'] ?? '');
    $type = $input['type'] ?? 'pdf';

    if (!$courseId || empty($title) || empty($filename)) {
        jsonError('course_id, title, and filename are required');
    }

    $stmt = $db->prepare('INSERT INTO materials (course_id, user_id, title, filename, type) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$courseId, $user['id'], $title, $filename, $type]);

    jsonResponse(['success' => true, 'material_id' => $db->lastInsertId()], 201);
}

// DELETE /api/materials.php?action=delete&id=X
if ($method === 'DELETE' && $action === 'delete') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonError('Material ID is required');

    $stmt = $db->prepare('SELECT user_id FROM materials WHERE id = ?');
    $stmt->execute([$id]);
    $mat = $stmt->fetch();
    if (!$mat) jsonError('Material not found', 404);

    if ($mat['user_id'] !== $user['id'] && !in_array($user['role'], ['senior-lecturer', 'leadership'])) {
        jsonError('Not authorized', 403);
    }

    $stmt = $db->prepare('DELETE FROM materials WHERE id = ?');
    $stmt->execute([$id]);
    jsonResponse(['success' => true, 'message' => 'Deleted']);
}

jsonError('Invalid endpoint', 404);
