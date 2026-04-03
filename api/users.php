<?php
/* UniConnect — Users API */
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$user = requireAuth();
$db = getDB();

// GET /api/users.php?action=me — current user profile
if ($method === 'GET' && $action === 'me') {
    // Get user's courses
    $stmt = $db->prepare('
        SELECT c.code, c.name, ce.role as enrollment_role
        FROM course_enrollments ce
        JOIN courses c ON c.id = ce.course_id
        WHERE ce.user_id = ?
    ');
    $stmt->execute([$user['id']]);
    $courses = $stmt->fetchAll();

    // Get stats
    $stats = [];
    if ($user['role'] === 'student') {
        $stmt = $db->prepare('SELECT COUNT(*) as count FROM submissions WHERE student_id = ?');
        $stmt->execute([$user['id']]);
        $stats['submissions'] = $stmt->fetch()['count'];

        $stmt = $db->prepare('SELECT COUNT(*) as count FROM messages WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $stats['messages_sent'] = $stmt->fetch()['count'];

        $stmt = $db->prepare('
            SELECT AVG(s.grade / a.total_points * 100) as avg_grade
            FROM submissions s
            JOIN assignments a ON a.id = s.assignment_id
            WHERE s.student_id = ? AND s.grade IS NOT NULL
        ');
        $stmt->execute([$user['id']]);
        $row = $stmt->fetch();
        $stats['avg_grade'] = $row['avg_grade'] ? round($row['avg_grade'], 1) : null;
    } elseif ($user['role'] === 'lecturer') {
        $stmt = $db->prepare('SELECT COUNT(*) as count FROM assignments WHERE lecturer_id = ?');
        $stmt->execute([$user['id']]);
        $stats['assignments_created'] = $stmt->fetch()['count'];

        $stmt = $db->prepare('SELECT COUNT(*) as count FROM materials WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $stats['materials_uploaded'] = $stmt->fetch()['count'];
    }

    $user['courses'] = $courses;
    $user['stats'] = $stats;
    jsonResponse(['success' => true, 'user' => $user]);
}

// PUT /api/users.php?action=update — update profile
if ($method === 'PUT' && $action === 'update') {
    $input = getInput();
    $name = trim($input['name'] ?? '');

    if (empty($name)) jsonError('Name is required');

    $avatar = strtoupper(substr($name, 0, 1)) . strtoupper(substr($name, strpos($name, ' ') + 1, 1) ?: '');

    $stmt = $db->prepare('UPDATE users SET name = ?, avatar = ? WHERE id = ?');
    $stmt->execute([$name, $avatar, $user['id']]);

    jsonResponse(['success' => true, 'message' => 'Profile updated']);
}

// GET /api/users.php?action=list — list users (for DM search, etc.)
if ($method === 'GET' && $action === 'list') {
    $search = $_GET['search'] ?? '';
    $role = $_GET['role'] ?? '';

    $sql = 'SELECT id, name, matric_no, email, role, avatar, dept_id FROM users WHERE 1=1';
    $params = [];

    if (!empty($search)) {
        $sql .= ' AND (name LIKE ? OR matric_no LIKE ?)';
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    if (!empty($role)) {
        $sql .= ' AND role = ?';
        $params[] = $role;
    }

    $sql .= ' ORDER BY name ASC LIMIT 50';
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $users = $stmt->fetchAll();

    jsonResponse(['success' => true, 'users' => $users]);
}

// GET /api/users.php?action=stats — dashboard stats
if ($method === 'GET' && $action === 'stats') {
    $stats = [];

    if ($user['role'] === 'student') {
        $stmt = $db->prepare('SELECT COUNT(*) as c FROM course_enrollments WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $stats['courses'] = $stmt->fetch()['c'];

        $stmt = $db->prepare('
            SELECT COUNT(*) as c FROM assignments a
            JOIN course_enrollments ce ON ce.course_id = a.course_id AND ce.user_id = ?
            LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = ?
            WHERE s.id IS NULL AND a.due_at > NOW()
        ');
        $stmt->execute([$user['id'], $user['id']]);
        $stats['pending_assignments'] = $stmt->fetch()['c'];

        $stmt = $db->prepare('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0');
        $stmt->execute([$user['id']]);
        $stats['unread_notifications'] = $stmt->fetch()['c'];

        $stmt = $db->prepare('SELECT COUNT(*) as c FROM messages WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $stats['messages'] = $stmt->fetch()['c'];

    } elseif ($user['role'] === 'lecturer') {
        $stmt = $db->prepare('SELECT COUNT(*) as c FROM course_enrollments WHERE user_id = ? AND role = "lecturer"');
        $stmt->execute([$user['id']]);
        $stats['courses'] = $stmt->fetch()['c'];

        $stmt = $db->prepare('SELECT COUNT(*) as c FROM assignments WHERE lecturer_id = ?');
        $stmt->execute([$user['id']]);
        $stats['assignments'] = $stmt->fetch()['c'];

        $stmt = $db->prepare('
            SELECT COUNT(*) as c FROM submissions s
            JOIN assignments a ON a.id = s.assignment_id
            WHERE a.lecturer_id = ? AND s.grade IS NULL
        ');
        $stmt->execute([$user['id']]);
        $stats['pending_grading'] = $stmt->fetch()['c'];

        $stmt = $db->prepare('SELECT COUNT(*) as c FROM materials WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $stats['materials'] = $stmt->fetch()['c'];

    } elseif ($user['role'] === 'senior-lecturer') {
        $stmt = $db->prepare('SELECT COUNT(*) as c FROM users WHERE dept_id = ? AND role = "lecturer"');
        $stmt->execute([$user['dept_id']]);
        $stats['dept_lecturers'] = $stmt->fetch()['c'];

        $stmt = $db->prepare('SELECT COUNT(*) as c FROM users WHERE dept_id = ? AND role = "student"');
        $stmt->execute([$user['dept_id']]);
        $stats['dept_students'] = $stmt->fetch()['c'];

        $stmt = $db->prepare('SELECT COUNT(*) as c FROM courses WHERE dept_id = ?');
        $stmt->execute([$user['dept_id']]);
        $stats['dept_courses'] = $stmt->fetch()['c'];

        $stmt = $db->prepare('SELECT COUNT(*) as c FROM announcements WHERE target_dept_id = ?');
        $stmt->execute([$user['dept_id']]);
        $stats['dept_announcements'] = $stmt->fetch()['c'];

    } elseif ($user['role'] === 'leadership') {
        $stmt = $db->prepare('SELECT COUNT(*) as c FROM users');
        $stats['total_users'] = $db->query('SELECT COUNT(*) as c FROM users')->fetch()['c'];
        $stats['total_students'] = $db->query("SELECT COUNT(*) as c FROM users WHERE role='student'")->fetch()['c'];
        $stats['total_staff'] = $db->query("SELECT COUNT(*) as c FROM users WHERE role IN ('lecturer','senior-lecturer')")->fetch()['c'];
        $stats['total_departments'] = $db->query('SELECT COUNT(*) as c FROM departments')->fetch()['c'];
        $stats['total_courses'] = $db->query('SELECT COUNT(*) as c FROM courses')->fetch()['c'];
        $stats['total_announcements'] = $db->query('SELECT COUNT(*) as c FROM announcements')->fetch()['c'];
    }

    jsonResponse(['success' => true, 'stats' => $stats]);
}

// GET /api/users.php?action=notifications — get user notifications
if ($method === 'GET' && $action === 'notifications') {
    $stmt = $db->prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50');
    $stmt->execute([$user['id']]);
    $notifications = $stmt->fetchAll();
    jsonResponse(['success' => true, 'notifications' => $notifications]);
}

// PUT /api/users.php?action=read_notification&id=X — mark notification as read
if ($method === 'PUT' && $action === 'read_notification') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonError('Notification ID is required');

    $stmt = $db->prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $user['id']]);
    jsonResponse(['success' => true]);
}

jsonError('Invalid endpoint', 404);
