/* UniConnect — Permissions Engine */
/* The law of the app. All permission checks go through here. */

'use strict';

const Permissions = (() => {
  const ROLES = ['student', 'lecturer', 'senior-lecturer', 'leadership'];

  /* ───── Permission Matrix ───── */
  const MATRIX = {
    student: {
      dm_peers: true,
      dm_own_students: false,
      dm_own_lecturer: true,
      dm_senior_lecturer: false,
      dm_leadership: false,
      post_course_channel: true,
      post_dept_notice: false,
      broadcast_university: false,
      manage_channels: false,
      pin_messages: false,
      view_course_materials: true,
      upload_materials: false,
      create_assignment: false,
      submit_assignment: true,
      grade_assignment: false,
      release_grades: false,
      view_own_grades: true,
      view_others_grades: false,
      approve_registrations: false,
      manage_dept_groups: false,
      publish_timetable: false,
      own_activity_stats: true,
      course_level_stats: false,
      dept_level_stats: false,
      university_wide_stats: false,
      ai_helper: true,
      view_announcements: true,
      post_announcements: false,
      view_own_timetable: true,
      view_own_profile: true,
      join_social_groups: true,
    },
    lecturer: {
      dm_peers: true,
      dm_own_students: true,
      dm_own_lecturer: false,
      dm_senior_lecturer: true,
      dm_leadership: false,
      post_course_channel: true,
      post_dept_notice: false,
      broadcast_university: false,
      manage_channels: false,
      pin_messages: 'own_course',
      view_course_materials: true,
      upload_materials: true,
      create_assignment: true,
      submit_assignment: false,
      grade_assignment: true,
      release_grades: true,
      view_own_grades: false,
      view_others_grades: false,
      approve_registrations: false,
      manage_dept_groups: false,
      publish_timetable: false,
      own_activity_stats: true,
      course_level_stats: true,
      dept_level_stats: false,
      university_wide_stats: false,
      ai_helper: false,
      view_announcements: true,
      post_announcements: 'own_course',
      view_own_timetable: true,
      view_own_profile: true,
      join_social_groups: true,
    },
    'senior-lecturer': {
      dm_peers: true,
      dm_own_students: true,
      dm_own_lecturer: true,
      dm_senior_lecturer: true,
      dm_leadership: false,
      post_course_channel: true,
      post_dept_notice: true,
      broadcast_university: false,
      manage_channels: 'dept_only',
      pin_messages: 'dept',
      view_course_materials: true,
      upload_materials: true,
      create_assignment: false,
      submit_assignment: false,
      grade_assignment: false,
      release_grades: false,
      view_own_grades: false,
      view_others_grades: false,
      approve_registrations: 'dept_only',
      manage_dept_groups: true,
      publish_timetable: true,
      own_activity_stats: true,
      course_level_stats: true,
      dept_level_stats: true,
      university_wide_stats: false,
      ai_helper: false,
      view_announcements: true,
      post_announcements: true,
      view_own_timetable: true,
      view_own_profile: true,
      join_social_groups: true,
    },
    leadership: {
      dm_peers: true,
      dm_own_students: false,
      dm_own_lecturer: false,
      dm_senior_lecturer: true,
      dm_leadership: true,
      post_course_channel: false,
      post_dept_notice: true,
      broadcast_university: true,
      manage_channels: true,
      pin_messages: true,
      view_course_materials: false,
      upload_materials: false,
      create_assignment: false,
      submit_assignment: false,
      grade_assignment: false,
      release_grades: false,
      view_own_grades: false,
      view_others_grades: false,
      approve_registrations: false,
      manage_dept_groups: false,
      publish_timetable: false,
      own_activity_stats: true,
      course_level_stats: false,
      dept_level_stats: true,
      university_wide_stats: true,
      ai_helper: false,
      view_announcements: true,
      post_announcements: true,
      view_own_timetable: true,
      view_own_profile: true,
      join_social_groups: false,
    },
  };

  /* ───── Navigation items per role ───── */
  const NAV_ITEMS = {
    student: [
      { id: 'dashboard', label: 'Dashboard', icon: 'home', href: 'dashboard.html' },
      { id: 'chat', label: 'Messages', icon: 'chat', href: 'chat.html', badge: 3 },
      { id: 'assignments', label: 'Assignments', icon: 'assignment', href: 'assignments.html' },
      { id: 'materials', label: 'Materials', icon: 'folder', href: 'materials.html' },
      { id: 'announcements', label: 'Announcements', icon: 'megaphone', href: 'announcements.html' },
      { id: 'ai-helper', label: 'AI Helper', icon: 'sparkle', href: 'ai-helper.html' },
      { id: 'profile', label: 'Profile', icon: 'user', href: 'profile.html' },
    ],
    lecturer: [
      { id: 'dashboard', label: 'Dashboard', icon: 'home', href: 'dashboard.html' },
      { id: 'chat', label: 'Messages', icon: 'chat', href: 'chat.html', badge: 5 },
      { id: 'assignments', label: 'Assignments', icon: 'assignment', href: 'assignments.html' },
      { id: 'materials', label: 'Materials', icon: 'folder', href: 'materials.html' },
      { id: 'announcements', label: 'Announcements', icon: 'megaphone', href: 'announcements.html' },
      { id: 'profile', label: 'Profile', icon: 'user', href: 'profile.html' },
    ],
    'senior-lecturer': [
      { id: 'dashboard', label: 'Dashboard', icon: 'home', href: 'dashboard.html' },
      { id: 'chat', label: 'Messages', icon: 'chat', href: 'chat.html', badge: 2 },
      { id: 'announcements', label: 'Announcements', icon: 'megaphone', href: 'announcements.html' },
      { id: 'materials', label: 'Materials', icon: 'folder', href: 'materials.html' },
      { id: 'approvals', label: 'Approvals', icon: 'check-circle', href: 'dashboard.html#approvals' },
      { id: 'analytics', label: 'Analytics', icon: 'chart', href: 'dashboard.html#analytics' },
      { id: 'profile', label: 'Profile', icon: 'user', href: 'profile.html' },
    ],
    leadership: [
      { id: 'dashboard', label: 'Dashboard', icon: 'home', href: 'dashboard.html' },
      { id: 'chat', label: 'Messages', icon: 'chat', href: 'chat.html' },
      { id: 'announcements', label: 'Announcements', icon: 'megaphone', href: 'announcements.html' },
      { id: 'analytics', label: 'Analytics', icon: 'chart', href: 'dashboard.html#analytics' },
      { id: 'profile', label: 'Profile', icon: 'user', href: 'profile.html' },
    ],
  };

  function can(role, permission) {
    const perms = MATRIX[role];
    if (!perms) return false;
    const val = perms[permission];
    return val === true || (typeof val === 'string' && val.length > 0);
  }

  function canWithScope(role, permission) {
    const perms = MATRIX[role];
    if (!perms) return { allowed: false, scope: null };
    const val = perms[permission];
    if (val === true) return { allowed: true, scope: 'all' };
    if (val === false) return { allowed: false, scope: null };
    return { allowed: true, scope: val };
  }

  function getNavItems(role) {
    return NAV_ITEMS[role] || NAV_ITEMS.student;
  }

  function isValidRole(role) {
    return ROLES.includes(role);
  }

  function canMessage(senderRole, recipientRole) {
    if (senderRole === recipientRole) return true;
    const map = {
      student: ['lecturer'],
      lecturer: ['student', 'senior-lecturer'],
      'senior-lecturer': ['student', 'lecturer', 'leadership'],
      leadership: ['senior-lecturer'],
    };
    return (map[senderRole] || []).includes(recipientRole);
  }

  return {
    ROLES,
    can,
    canWithScope,
    getNavItems,
    isValidRole,
    canMessage,
    MATRIX,
  };
})();
