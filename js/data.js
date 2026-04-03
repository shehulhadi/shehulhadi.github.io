/* UniConnect — Mock Data */
/* All mock data lives here. Swap individual functions for real API calls later. */

'use strict';

const Data = (() => {
  /* ───── Users ───── */
  const USERS = {
    'CSC/21/0042': {
      id: 'CSC/21/0042',
      name: 'Hadi',
      email: 'hadi@student.unilagos.edu.ng',
      role: 'student',
      dept: 'Computer Science',
      deptCode: 'CSC',
      level: '400',
      avatar: 'H',
      password: 'student123',
    },
    'STAFF/LEC/0089': {
      id: 'STAFF/LEC/0089',
      name: 'Dr. A. Ibrahim',
      email: 'a.ibrahim@unilagos.edu.ng',
      role: 'lecturer',
      dept: 'Computer Science',
      deptCode: 'CSC',
      position: 'Lecturer',
      avatar: 'AI',
      password: 'lecturer123',
      courses: ['CSC401', 'CSC403'],
    },
    'SL/CSC/0014': {
      id: 'SL/CSC/0014',
      name: 'O. Adeyemi',
      email: 'o.adeyemi@unilagos.edu.ng',
      role: 'senior-lecturer',
      dept: 'Computer Science',
      deptCode: 'CSC',
      position: 'Senior Lecturer',
      avatar: 'OA',
      password: 'senior123',
    },
    'LEADERSHIP/VC/001': {
      id: 'LEADERSHIP/VC/001',
      name: 'Prof. A. Okafor',
      email: 'vc@unilagos.edu.ng',
      role: 'leadership',
      dept: 'University',
      deptCode: 'UNI',
      position: 'Vice-Chancellor',
      avatar: 'AO',
      password: 'leader123',
    },
    'CSC/21/0043': {
      id: 'CSC/21/0043',
      name: 'Amina Bello',
      email: 'amina@student.unilagos.edu.ng',
      role: 'student',
      dept: 'Computer Science',
      deptCode: 'CSC',
      level: '400',
      avatar: 'AB',
      password: 'student123',
    },
    'CSC/21/0044': {
      id: 'CSC/21/0044',
      name: 'Chidi Okonkwo',
      email: 'chidi@student.unilagos.edu.ng',
      role: 'student',
      dept: 'Computer Science',
      deptCode: 'CSC',
      level: '400',
      avatar: 'CO',
      password: 'student123',
    },
  };

  /* ───── Departments ───── */
  const DEPARTMENTS = [
    { id: 1, name: 'Computer Science', code: 'CSC' },
    { id: 2, name: 'Mathematics', code: 'MTH' },
    { id: 3, name: 'Physics', code: 'PHY' },
    { id: 4, name: 'Chemistry', code: 'CHM' },
  ];

  /* ───── Courses ───── */
  const COURSES = [
    { id: 'CSC401', code: 'CSC 401', name: 'Artificial Intelligence', deptCode: 'CSC', level: '400', semester: 1, lecturerId: 'STAFF/LEC/0089' },
    { id: 'CSC403', code: 'CSC 403', name: 'Computer Networks', deptCode: 'CSC', level: '400', semester: 1, lecturerId: 'STAFF/LEC/0089' },
    { id: 'CSC405', code: 'CSC 405', name: 'Software Engineering', deptCode: 'CSC', level: '400', semester: 1, lecturerId: 'STAFF/LEC/0089' },
    { id: 'CSC407', code: 'CSC 407', name: 'Database Management', deptCode: 'CSC', level: '400', semester: 1, lecturerId: 'STAFF/LEC/0089' },
  ];

  /* ───── Channels ───── */
  const CHANNELS = [
    { id: 'csc-general', name: 'CSC General', type: 'dept', deptCode: 'CSC', icon: 'hash' },
    { id: 'csc-400', name: '400 Level', type: 'level', deptCode: 'CSC', level: '400', icon: 'users' },
    { id: 'csc401-channel', name: 'CSC 401 — AI', type: 'course', courseId: 'CSC401', icon: 'book' },
    { id: 'csc403-channel', name: 'CSC 403 — Networks', type: 'course', courseId: 'CSC403', icon: 'book' },
    { id: 'csc-staff', name: 'CSC Staff', type: 'staff', deptCode: 'CSC', icon: 'briefcase' },
    { id: 'university-broadcast', name: 'University Broadcast', type: 'broadcast', icon: 'radio' },
  ];

  /* ───── Messages ───── */
  const MESSAGES = {
    'csc-general': [
      { id: 1, userId: 'SL/CSC/0014', body: 'Welcome back to a new semester. Please check the updated timetable on your dashboards.', type: 'text', createdAt: '2026-03-28T09:00:00Z' },
      { id: 2, userId: 'CSC/21/0042', body: 'Thank you sir. When does registration close?', type: 'text', createdAt: '2026-03-28T09:05:00Z' },
      { id: 3, userId: 'SL/CSC/0014', body: 'Registration closes April 15th. Make sure all your documents are submitted.', type: 'text', createdAt: '2026-03-28T09:08:00Z' },
    ],
    'csc401-channel': [
      { id: 4, userId: 'STAFF/LEC/0089', body: 'First assignment posted — Introduction to Search Algorithms. Due April 10.', type: 'notice', createdAt: '2026-03-29T14:00:00Z' },
      { id: 5, userId: 'CSC/21/0043', body: 'Dr., can we use Python or only pseudocode?', type: 'text', createdAt: '2026-03-29T14:15:00Z' },
      { id: 6, userId: 'STAFF/LEC/0089', body: 'Python is fine. Include comments explaining your logic.', type: 'text', createdAt: '2026-03-29T14:20:00Z' },
    ],
    'csc-400': [
      { id: 7, userId: 'CSC/21/0044', body: 'Anyone have notes from last week\'s AI class?', type: 'text', createdAt: '2026-04-01T10:00:00Z' },
      { id: 8, userId: 'CSC/21/0042', body: 'I\'ll upload them to the materials section later today.', type: 'text', createdAt: '2026-04-01T10:05:00Z' },
    ],
    'university-broadcast': [
      { id: 9, userId: 'LEADERSHIP/VC/001', body: 'The university will observe a public holiday on April 5th. All activities resume April 7th.', type: 'notice', createdAt: '2026-04-02T08:00:00Z' },
    ],
  };

  /* ───── DM Conversations ───── */
  const DMS = {
    'dm-hadi-ibrahim': {
      participants: ['CSC/21/0042', 'STAFF/LEC/0089'],
      messages: [
        { id: 101, userId: 'CSC/21/0042', body: 'Good afternoon Dr., I have a question about the assignment.', createdAt: '2026-04-01T14:00:00Z' },
        { id: 102, userId: 'STAFF/LEC/0089', body: 'Go ahead.', createdAt: '2026-04-01T14:02:00Z' },
        { id: 103, userId: 'CSC/21/0042', body: 'For question 3, should we implement BFS or DFS?', createdAt: '2026-04-01T14:03:00Z' },
        { id: 104, userId: 'STAFF/LEC/0089', body: 'Implement both and compare their performance. That\'s the whole point of the exercise.', createdAt: '2026-04-01T14:05:00Z' },
      ],
    },
    'dm-hadi-amina': {
      participants: ['CSC/21/0042', 'CSC/21/0043'],
      messages: [
        { id: 201, userId: 'CSC/21/0043', body: 'Hey Hadi, study group at the library tomorrow 4pm?', createdAt: '2026-04-02T18:00:00Z' },
        { id: 202, userId: 'CSC/21/0042', body: 'Sure! I\'ll bring my laptop.', createdAt: '2026-04-02T18:03:00Z' },
      ],
    },
  };

  /* ───── Announcements ───── */
  const ANNOUNCEMENTS = [
    {
      id: 1,
      userId: 'LEADERSHIP/VC/001',
      title: 'University Public Holiday',
      body: 'The university will observe a public holiday on April 5th. All lectures and examinations are postponed. Activities resume April 7th.',
      targetRole: 'all',
      targetDept: null,
      priority: 'high',
      pinned: true,
      createdAt: '2026-04-02T08:00:00Z',
    },
    {
      id: 2,
      userId: 'SL/CSC/0014',
      title: 'CSC Department — Timetable Update',
      body: 'The updated timetable for the 2025/2026 session second semester is now available. All students should check their dashboards for changes.',
      targetRole: 'all',
      targetDept: 'CSC',
      priority: 'medium',
      pinned: false,
      createdAt: '2026-03-28T09:00:00Z',
    },
    {
      id: 3,
      userId: 'STAFF/LEC/0089',
      title: 'CSC 401 — First Assignment Posted',
      body: 'Introduction to Search Algorithms assignment is now available. Deadline: April 10, 2026. Submit via the assignments page.',
      targetRole: 'student',
      targetDept: 'CSC',
      priority: 'normal',
      pinned: false,
      createdAt: '2026-03-29T14:00:00Z',
    },
    {
      id: 4,
      userId: 'SL/CSC/0014',
      title: 'Registration Deadline Reminder',
      body: 'Course registration for second semester closes April 15, 2026. Late registrations will not be accepted.',
      targetRole: 'student',
      targetDept: 'CSC',
      priority: 'high',
      pinned: true,
      createdAt: '2026-04-01T07:00:00Z',
    },
  ];

  /* ───── Assignments ───── */
  const ASSIGNMENTS = [
    {
      id: 1,
      courseId: 'CSC401',
      lecturerId: 'STAFF/LEC/0089',
      title: 'Introduction to Search Algorithms',
      instructions: 'Implement BFS and DFS. Compare performance on a provided graph dataset. Submit Python code with comments.',
      dueAt: '2026-04-10T23:59:00Z',
      createdAt: '2026-03-29T14:00:00Z',
      totalPoints: 20,
    },
    {
      id: 2,
      courseId: 'CSC403',
      lecturerId: 'STAFF/LEC/0089',
      title: 'Network Protocol Analysis',
      instructions: 'Capture and analyze network traffic using Wireshark. Document the TCP handshake and identify at least 5 protocols.',
      dueAt: '2026-04-15T23:59:00Z',
      createdAt: '2026-04-01T10:00:00Z',
      totalPoints: 25,
    },
  ];

  /* ───── Submissions ───── */
  const SUBMISSIONS = [
    {
      id: 1,
      assignmentId: 1,
      studentId: 'CSC/21/0042',
      submittedAt: '2026-04-08T22:30:00Z',
      grade: null,
      feedback: null,
      filename: 'hadi_search_algorithms.py',
    },
    {
      id: 2,
      assignmentId: 1,
      studentId: 'CSC/21/0043',
      submittedAt: '2026-04-09T18:45:00Z',
      grade: 18,
      gradedAt: '2026-04-11T10:00:00Z',
      feedback: 'Excellent implementation. Minor efficiency issue with DFS recursion.',
      filename: 'amina_search.py',
    },
  ];

  /* ───── Materials ───── */
  const MATERIALS = [
    { id: 1, courseId: 'CSC401', userId: 'STAFF/LEC/0089', title: 'Lecture 1 — Intro to AI', type: 'pdf', filename: 'ai_lecture_1.pdf', createdAt: '2026-03-25T08:00:00Z' },
    { id: 2, courseId: 'CSC401', userId: 'STAFF/LEC/0089', title: 'Lecture 2 — Search Algorithms', type: 'pdf', filename: 'ai_lecture_2.pdf', createdAt: '2026-03-27T08:00:00Z' },
    { id: 3, courseId: 'CSC403', userId: 'STAFF/LEC/0089', title: 'Lecture 1 — OSI Model', type: 'pdf', filename: 'networks_lecture_1.pdf', createdAt: '2026-03-26T08:00:00Z' },
    { id: 4, courseId: 'CSC403', userId: 'STAFF/LEC/0089', title: 'Lab Guide — Wireshark Setup', type: 'pdf', filename: 'wireshark_guide.pdf', createdAt: '2026-04-01T09:00:00Z' },
  ];

  /* ───── Timetable ───── */
  const TIMETABLE = {
    'CSC-400': [
      { day: 'Monday', time: '09:00 - 11:00', course: 'CSC 401', room: 'LT 201', lecturer: 'Dr. A. Ibrahim' },
      { day: 'Monday', time: '14:00 - 16:00', course: 'CSC 405', room: 'LT 105', lecturer: 'Dr. A. Ibrahim' },
      { day: 'Tuesday', time: '10:00 - 12:00', course: 'CSC 403', room: 'Lab 3', lecturer: 'Dr. A. Ibrahim' },
      { day: 'Wednesday', time: '09:00 - 11:00', course: 'CSC 407', room: 'LT 201', lecturer: 'Dr. A. Ibrahim' },
      { day: 'Thursday', time: '13:00 - 15:00', course: 'CSC 401', room: 'Lab 2', lecturer: 'Dr. A. Ibrahim' },
      { day: 'Friday', time: '10:00 - 12:00', course: 'CSC 403', room: 'LT 301', lecturer: 'Dr. A. Ibrahim' },
    ],
  };

  /* ───── Notifications ───── */
  const NOTIFICATIONS = [
    { id: 1, userId: 'CSC/21/0042', type: 'announcement', body: 'New announcement: University Public Holiday', read: false, createdAt: '2026-04-02T08:00:00Z' },
    { id: 2, userId: 'CSC/21/0042', type: 'assignment', body: 'CSC 401 assignment due in 2 days', read: false, createdAt: '2026-04-08T07:00:00Z' },
    { id: 3, userId: 'CSC/21/0042', type: 'message', body: 'New message from Amina Bello', read: true, createdAt: '2026-04-02T18:03:00Z' },
  ];

  /* ───── Stats ───── */
  const STATS = {
    student: {
      coursesEnrolled: 4,
      assignmentsPending: 1,
      assignmentsCompleted: 1,
      unreadMessages: 3,
      gpa: '3.72',
    },
    lecturer: {
      totalStudents: 145,
      activeCourses: 3,
      pendingGrading: 12,
      unreadMessages: 5,
      submissionRate: '87%',
    },
    'senior-lecturer': {
      deptStudents: 520,
      deptLecturers: 18,
      pendingApprovals: 7,
      unreadMessages: 2,
      avgSubmissionRate: '82%',
    },
    leadership: {
      totalStudents: 12450,
      totalStaff: 890,
      totalDepartments: 42,
      activeSessions: 3,
    },
  };

  /* ───── Approval Queue ───── */
  const APPROVAL_QUEUE = [
    { id: 1, userId: 'new-student-1', name: 'John Eze', type: 'student', dept: 'CSC', level: '100', status: 'pending', submittedAt: '2026-04-01T10:00:00Z' },
    { id: 2, userId: 'new-student-2', name: 'Mary Adamu', type: 'student', dept: 'CSC', level: '200', status: 'pending', submittedAt: '2026-04-01T11:00:00Z' },
    { id: 3, userId: 'new-lec-1', name: 'Dr. K. Bola', type: 'lecturer', dept: 'CSC', status: 'pending', submittedAt: '2026-04-02T09:00:00Z' },
  ];

  /* ───── Data Access Functions ───── */

  async function login(userId, password) {
    const user = USERS[userId];
    if (!user) return { success: false, error: 'User not found' };
    if (user.password !== password) return { success: false, error: 'Invalid password' };
    return { success: true, user: { ...user, password: undefined } };
  }

  async function getUser(userId) {
    const u = USERS[userId];
    return u ? { ...u, password: undefined } : null;
  }

  async function getUsersByRole(role) {
    return Object.values(USERS)
      .filter(u => u.role === role)
      .map(u => ({ ...u, password: undefined }));
  }

  async function getUsersByDept(deptCode) {
    return Object.values(USERS)
      .filter(u => u.deptCode === deptCode)
      .map(u => ({ ...u, password: undefined }));
  }

  async function getChannels(role, deptCode, level) {
    return CHANNELS.filter(ch => {
      if (ch.type === 'broadcast') return role === 'leadership' || true;
      if (ch.type === 'staff') return role !== 'student';
      if (ch.type === 'dept') return ch.deptCode === deptCode;
      if (ch.type === 'level') return ch.deptCode === deptCode && ch.level === level;
      if (ch.type === 'course') return true;
      return true;
    });
  }

  async function getMessages(channelId) {
    return (MESSAGES[channelId] || []).map(msg => ({
      ...msg,
      user: USERS[msg.userId] ? { name: USERS[msg.userId].name, avatar: USERS[msg.userId].avatar, role: USERS[msg.userId].role } : null,
    }));
  }

  async function getDMs(userId) {
    const result = [];
    for (const [dmId, dm] of Object.entries(DMS)) {
      if (dm.participants.includes(userId)) {
        const otherId = dm.participants.find(p => p !== userId);
        const other = USERS[otherId];
        const lastMsg = dm.messages[dm.messages.length - 1];
        result.push({
          id: dmId,
          otherUser: other ? { id: otherId, name: other.name, avatar: other.avatar, role: other.role } : null,
          lastMessage: lastMsg ? lastMsg.body : '',
          lastMessageAt: lastMsg ? lastMsg.createdAt : '',
          unread: 1,
        });
      }
    }
    return result;
  }

  async function getDMMessages(dmId) {
    const dm = DMS[dmId];
    if (!dm) return [];
    return dm.messages.map(msg => ({
      ...msg,
      user: USERS[msg.userId] ? { name: USERS[msg.userId].name, avatar: USERS[msg.userId].avatar, role: USERS[msg.userId].role } : null,
    }));
  }

  async function getAnnouncements(role, deptCode) {
    return ANNOUNCEMENTS.filter(a => {
      if (a.targetDept && a.targetDept !== deptCode && role !== 'leadership') return false;
      return true;
    });
  }

  async function getAssignments(role, userId) {
    if (role === 'student') {
      return ASSIGNMENTS.map(a => {
        const sub = SUBMISSIONS.find(s => s.assignmentId === a.id && s.studentId === userId);
        const course = COURSES.find(c => c.id === a.courseId);
        return { ...a, courseName: course ? course.name : '', submission: sub || null };
      });
    }
    if (role === 'lecturer') {
      return ASSIGNMENTS.filter(a => a.lecturerId === userId).map(a => {
        const subs = SUBMISSIONS.filter(s => s.assignmentId === a.id);
        const course = COURSES.find(c => c.id === a.courseId);
        return { ...a, courseName: course ? course.name : '', submissions: subs, submissionCount: subs.length };
      });
    }
    return [];
  }

  async function getMaterials(role, userId, deptCode) {
    if (role === 'student') {
      return MATERIALS.filter(m => COURSES.some(c => c.id === m.courseId && c.deptCode === deptCode));
    }
    if (role === 'lecturer') {
      return MATERIALS.filter(m => m.userId === userId);
    }
    return MATERIALS.filter(m => COURSES.some(c => c.id === m.courseId && c.deptCode === deptCode));
  }

  async function getCourses(role, userId, deptCode, level) {
    if (role === 'student') {
      return COURSES.filter(c => c.deptCode === deptCode && c.level === level);
    }
    if (role === 'lecturer') {
      return COURSES.filter(c => c.lecturerId === userId);
    }
    return COURSES.filter(c => c.deptCode === deptCode);
  }

  async function getTimetable(deptCode, level) {
    return TIMETABLE[`${deptCode}-${level}`] || [];
  }

  async function getNotifications(userId) {
    return NOTIFICATIONS.filter(n => n.userId === userId);
  }

  async function getStats(role) {
    return STATS[role] || {};
  }

  async function getApprovalQueue(deptCode) {
    return APPROVAL_QUEUE.filter(a => a.dept === deptCode && a.status === 'pending');
  }

  async function getDepartments() {
    return DEPARTMENTS;
  }

  return {
    login,
    getUser,
    getUsersByRole,
    getUsersByDept,
    getChannels,
    getMessages,
    getDMs,
    getDMMessages,
    getAnnouncements,
    getAssignments,
    getMaterials,
    getCourses,
    getTimetable,
    getNotifications,
    getStats,
    getApprovalQueue,
    getDepartments,
    USERS,
  };
})();
