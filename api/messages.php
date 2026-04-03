<?php
/* UniConnect — Messages API */
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$user = requireAuth();
$db = getDB();

// GET /api/messages.php?action=channels — list user's channels
if ($method === 'GET' && $action === 'channels') {
    $stmt = $db->prepare('
        SELECT c.*, 
            (SELECT COUNT(*) FROM messages m WHERE m.channel_id = c.id) as message_count,
            (SELECT m2.body FROM messages m2 WHERE m2.channel_id = c.id ORDER BY m2.created_at DESC LIMIT 1) as last_message,
            (SELECT m3.created_at FROM messages m3 WHERE m3.channel_id = c.id ORDER BY m3.created_at DESC LIMIT 1) as last_activity
        FROM channels c
        JOIN channel_members cm ON cm.channel_id = c.id
        WHERE cm.user_id = ?
        ORDER BY last_activity DESC
    ');
    $stmt->execute([$user['id']]);
    $channels = $stmt->fetchAll();
    jsonResponse(['success' => true, 'channels' => $channels]);
}

// GET /api/messages.php?action=messages&channel_id=X — get messages for a channel
if ($method === 'GET' && $action === 'messages') {
    $channelId = (int)($_GET['channel_id'] ?? 0);
    if (!$channelId) jsonError('channel_id is required');

    // Verify user is a member
    $stmt = $db->prepare('SELECT 1 FROM channel_members WHERE channel_id = ? AND user_id = ?');
    $stmt->execute([$channelId, $user['id']]);
    if (!$stmt->fetch()) jsonError('Not a member of this channel', 403);

    $limit = min((int)($_GET['limit'] ?? 50), 100);
    $offset = max((int)($_GET['offset'] ?? 0), 0);

    $stmt = $db->prepare('
        SELECT m.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
        FROM messages m
        JOIN users u ON u.id = m.user_id
        WHERE m.channel_id = ?
        ORDER BY m.created_at ASC
        LIMIT ? OFFSET ?
    ');
    $stmt->execute([$channelId, $limit, $offset]);
    $messages = $stmt->fetchAll();
    jsonResponse(['success' => true, 'messages' => $messages]);
}

// POST /api/messages.php?action=send — send a message
if ($method === 'POST' && $action === 'send') {
    $input = getInput();
    $channelId = (int)($input['channel_id'] ?? 0);
    $body = trim($input['body'] ?? '');
    $type = $input['type'] ?? 'text';
    $replyToId = $input['reply_to_id'] ?? null;

    if (!$channelId || empty($body)) {
        jsonError('channel_id and body are required');
    }

    // Verify user is a member
    $stmt = $db->prepare('SELECT 1 FROM channel_members WHERE channel_id = ? AND user_id = ?');
    $stmt->execute([$channelId, $user['id']]);
    if (!$stmt->fetch()) jsonError('Not a member of this channel', 403);

    $stmt = $db->prepare('INSERT INTO messages (channel_id, user_id, body, type, reply_to_id) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$channelId, $user['id'], $body, $type, $replyToId]);

    $messageId = $db->lastInsertId();
    $stmt = $db->prepare('
        SELECT m.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
        FROM messages m JOIN users u ON u.id = m.user_id WHERE m.id = ?
    ');
    $stmt->execute([$messageId]);
    $message = $stmt->fetch();

    jsonResponse(['success' => true, 'message' => $message], 201);
}

// GET /api/messages.php?action=dms — list DM conversations
if ($method === 'GET' && $action === 'dms') {
    // Find channels where the user has DMs (type = 'dm')
    $stmt = $db->prepare('
        SELECT c.id as channel_id, u.id as user_id, u.name, u.avatar, u.role,
            (SELECT m.body FROM messages m WHERE m.channel_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
            (SELECT m.created_at FROM messages m WHERE m.channel_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_activity
        FROM channels c
        JOIN channel_members cm ON cm.channel_id = c.id AND cm.user_id = ?
        JOIN channel_members cm2 ON cm2.channel_id = c.id AND cm2.user_id != ?
        JOIN users u ON u.id = cm2.user_id
        WHERE c.type = "dm"
        ORDER BY last_activity DESC
    ');
    $stmt->execute([$user['id'], $user['id']]);
    $dms = $stmt->fetchAll();
    jsonResponse(['success' => true, 'dms' => $dms]);
}

// POST /api/messages.php?action=start_dm — start a DM conversation
if ($method === 'POST' && $action === 'start_dm') {
    $input = getInput();
    $targetUserId = (int)($input['user_id'] ?? 0);
    if (!$targetUserId) jsonError('user_id is required');

    // Check if DM already exists
    $stmt = $db->prepare('
        SELECT c.id FROM channels c
        JOIN channel_members cm1 ON cm1.channel_id = c.id AND cm1.user_id = ?
        JOIN channel_members cm2 ON cm2.channel_id = c.id AND cm2.user_id = ?
        WHERE c.type = "dm"
    ');
    $stmt->execute([$user['id'], $targetUserId]);
    $existing = $stmt->fetch();

    if ($existing) {
        jsonResponse(['success' => true, 'channel_id' => $existing['id']]);
    }

    // Create new DM channel
    $targetUser = $db->prepare('SELECT name FROM users WHERE id = ?');
    $targetUser->execute([$targetUserId]);
    $target = $targetUser->fetch();
    if (!$target) jsonError('User not found');

    $slug = 'dm-' . min($user['id'], $targetUserId) . '-' . max($user['id'], $targetUserId);
    $stmt = $db->prepare('INSERT INTO channels (name, slug, type) VALUES (?, ?, "dm")');
    $stmt->execute(['DM: ' . $user['name'] . ' & ' . $target['name'], $slug]);
    $channelId = $db->lastInsertId();

    $stmt = $db->prepare('INSERT INTO channel_members (channel_id, user_id) VALUES (?, ?), (?, ?)');
    $stmt->execute([$channelId, $user['id'], $channelId, $targetUserId]);

    jsonResponse(['success' => true, 'channel_id' => $channelId], 201);
}

// GET /api/messages.php?action=members&channel_id=X — get channel members
if ($method === 'GET' && $action === 'members') {
    $channelId = (int)($_GET['channel_id'] ?? 0);
    if (!$channelId) jsonError('channel_id is required');

    $stmt = $db->prepare('
        SELECT u.id, u.name, u.avatar, u.role, u.matric_no
        FROM users u
        JOIN channel_members cm ON cm.user_id = u.id
        WHERE cm.channel_id = ?
    ');
    $stmt->execute([$channelId]);
    $members = $stmt->fetchAll();
    jsonResponse(['success' => true, 'members' => $members]);
}

jsonError('Invalid endpoint', 404);
