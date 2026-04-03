<?php
/* UniConnect — Assignments API */
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$user = requireAuth();
$db = getDB();

// GET /api/assignments.php?action=list — list assignments for the user
if ($method === 'GET' && $action === 'list') {
    if ($user['role'] === 'student') {
        $stmt = $db->prepare('
            SELECT a.*, c.code as course_code, c.name as course_name,
                u.name as lecturer_name,
                s.id as submission_id, s.submitted_at, s.grade, s.feedback, s.filename as submission_file
            FROM assignments a
            JOIN courses c ON c.id = a.course_id
            JOIN users u ON u.id = a.lecturer_id
            JOIN course_enrollments ce ON ce.course_id = a.course_id AND ce.user_id = ?
            LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = ?
            ORDER BY a.due_at ASC
        ');
        $stmt->execute([$user['id'], $user['id']]);
    } else {
        // Lecturers see assignments they created
        $stmt = $db->prepare('
            SELECT a.*, c.code as course_code, c.name as course_name,
                (SELECT COUNT(*) FROM submissions sb WHERE sb.assignment_id = a.id) as submission_count,
                (SELECT COUNT(*) FROM course_enrollments ce2 WHERE ce2.course_id = a.course_id AND ce2.role = "student") as student_count
            FROM assignments a
            JOIN courses c ON c.id = a.course_id
            WHERE a.lecturer_id = ?
            ORDER BY a.due_at ASC
        ');
        $stmt->execute([$user['id']]);
    }
    $assignments = $stmt->fetchAll();
    jsonResponse(['success' => true, 'assignments' => $assignments]);
}

// GET /api/assignments.php?action=detail&id=X — get assignment details
if ($method === 'GET' && $action === 'detail') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonError('Assignment ID is required');

    $stmt = $db->prepare('
        SELECT a.*, c.code as course_code, c.name as course_name, u.name as lecturer_name
        FROM assignments a
        JOIN courses c ON c.id = a.course_id
        JOIN users u ON u.id = a.lecturer_id
        WHERE a.id = ?
    ');
    $stmt->execute([$id]);
    $assignment = $stmt->fetch();
    if (!$assignment) jsonError('Assignment not found', 404);

    // If lecturer, include submissions
    if ($user['role'] !== 'student' && $user['id'] == $assignment['lecturer_id']) {
        $stmt = $db->prepare('
            SELECT s.*, u.name as student_name, u.matric_no
            FROM submissions s
            JOIN users u ON u.id = s.student_id
            WHERE s.assignment_id = ?
            ORDER BY s.submitted_at ASC
        ');
        $stmt->execute([$id]);
        $assignment['submissions'] = $stmt->fetchAll();
    }

    jsonResponse(['success' => true, 'assignment' => $assignment]);
}

// POST /api/assignments.php?action=create — create new assignment (lecturer only)
if ($method === 'POST' && $action === 'create') {
    if ($user['role'] === 'student') jsonError('Students cannot create assignments', 403);

    $input = getInput();
    $courseId = (int)($input['course_id'] ?? 0);
    $title = trim($input['title'] ?? '');
    $instructions = trim($input['instructions'] ?? '');
    $dueAt = $input['due_at'] ?? '';
    $totalPoints = (int)($input['total_points'] ?? 20);

    if (!$courseId || empty($title) || empty($dueAt)) {
        jsonError('course_id, title, and due_at are required');
    }

    $stmt = $db->prepare('INSERT INTO assignments (course_id, lecturer_id, title, instructions, due_at, total_points) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$courseId, $user['id'], $title, $instructions, $dueAt, $totalPoints]);

    jsonResponse(['success' => true, 'assignment_id' => $db->lastInsertId()], 201);
}

// POST /api/assignments.php?action=submit — submit assignment (student only)
if ($method === 'POST' && $action === 'submit') {
    if ($user['role'] !== 'student') jsonError('Only students can submit assignments', 403);

    $input = getInput();
    $assignmentId = (int)($input['assignment_id'] ?? 0);
    $filename = trim($input['filename'] ?? 'submission.txt');

    if (!$assignmentId) jsonError('assignment_id is required');

    // Check assignment exists and is not past due
    $stmt = $db->prepare('SELECT * FROM assignments WHERE id = ?');
    $stmt->execute([$assignmentId]);
    $assignment = $stmt->fetch();
    if (!$assignment) jsonError('Assignment not found', 404);

    // Check if already submitted
    $stmt = $db->prepare('SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?');
    $stmt->execute([$assignmentId, $user['id']]);
    if ($stmt->fetch()) jsonError('Already submitted');

    $stmt = $db->prepare('INSERT INTO submissions (assignment_id, student_id, filename) VALUES (?, ?, ?)');
    $stmt->execute([$assignmentId, $user['id'], $filename]);

    jsonResponse(['success' => true, 'submission_id' => $db->lastInsertId()], 201);
}

// POST /api/assignments.php?action=grade — grade a submission (lecturer only)
if ($method === 'POST' && $action === 'grade') {
    if ($user['role'] === 'student') jsonError('Students cannot grade submissions', 403);

    $input = getInput();
    $submissionId = (int)($input['submission_id'] ?? 0);
    $grade = (int)($input['grade'] ?? 0);
    $feedback = trim($input['feedback'] ?? '');

    if (!$submissionId || $grade < 0) jsonError('submission_id and grade are required');

    $stmt = $db->prepare('UPDATE submissions SET grade = ?, feedback = ?, graded_at = NOW() WHERE id = ?');
    $stmt->execute([$grade, $feedback, $submissionId]);

    if ($stmt->rowCount() === 0) jsonError('Submission not found', 404);

    jsonResponse(['success' => true, 'message' => 'Graded successfully']);
}

jsonError('Invalid endpoint', 404);
