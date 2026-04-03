<?php
/* UniConnect — Courses API */
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$user = requireAuth();
$db = getDB();

// GET /api/courses.php?action=list — list user's courses
if ($method === 'GET' && $action === 'list') {
    $stmt = $db->prepare('
        SELECT c.*, d.name as dept_name, ce.role as enrollment_role,
            (SELECT COUNT(*) FROM course_enrollments ce2 WHERE ce2.course_id = c.id AND ce2.role = "student") as student_count,
            (SELECT u2.name FROM course_enrollments ce3 JOIN users u2 ON u2.id = ce3.user_id WHERE ce3.course_id = c.id AND ce3.role = "lecturer" LIMIT 1) as lecturer_name
        FROM courses c
        JOIN departments d ON d.id = c.dept_id
        JOIN course_enrollments ce ON ce.course_id = c.id AND ce.user_id = ?
        ORDER BY c.code ASC
    ');
    $stmt->execute([$user['id']]);
    $courses = $stmt->fetchAll();
    jsonResponse(['success' => true, 'courses' => $courses]);
}

// GET /api/courses.php?action=detail&id=X — get course details
if ($method === 'GET' && $action === 'detail') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonError('Course ID is required');

    $stmt = $db->prepare('
        SELECT c.*, d.name as dept_name
        FROM courses c
        JOIN departments d ON d.id = c.dept_id
        WHERE c.id = ?
    ');
    $stmt->execute([$id]);
    $course = $stmt->fetch();
    if (!$course) jsonError('Course not found', 404);

    // Get enrolled students and lecturers
    $stmt = $db->prepare('
        SELECT u.id, u.name, u.matric_no, u.role, u.avatar, ce.role as enrollment_role
        FROM course_enrollments ce
        JOIN users u ON u.id = ce.user_id
        WHERE ce.course_id = ?
        ORDER BY ce.role ASC, u.name ASC
    ');
    $stmt->execute([$id]);
    $course['members'] = $stmt->fetchAll();

    jsonResponse(['success' => true, 'course' => $course]);
}

// GET /api/courses.php?action=all — list all courses (for senior-lecturer/leadership)
if ($method === 'GET' && $action === 'all') {
    if (!in_array($user['role'], ['senior-lecturer', 'leadership'])) {
        jsonError('Not authorized', 403);
    }

    $sql = 'SELECT c.*, d.name as dept_name,
        (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id AND ce.role = "student") as student_count
        FROM courses c JOIN departments d ON d.id = c.dept_id';

    if ($user['role'] === 'senior-lecturer') {
        $sql .= ' WHERE c.dept_id = ?';
        $stmt = $db->prepare($sql . ' ORDER BY c.code ASC');
        $stmt->execute([$user['dept_id']]);
    } else {
        $stmt = $db->prepare($sql . ' ORDER BY c.code ASC');
        $stmt->execute();
    }

    $courses = $stmt->fetchAll();
    jsonResponse(['success' => true, 'courses' => $courses]);
}

jsonError('Invalid endpoint', 404);
