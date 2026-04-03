-- UniConnect — Seed Data
USE uniconnect;

-- Departments
INSERT INTO departments (name, code) VALUES
('Computer Science', 'CSC'),
('Mathematics', 'MTH'),
('Physics', 'PHY'),
('Chemistry', 'CHM');

-- Users (passwords are hashed with PHP password_hash)
-- student123, lecturer123, senior123, leader123
INSERT INTO users (matric_no, name, email, password_hash, role, dept_id, level, position, avatar, verified) VALUES
('CSC/21/0042', 'Hadi', 'hadi@student.unilagos.edu.ng', '$2y$10$KYhK0e4JiIpjpI1yrTlSkugd5igZeujISIxhJr7z86eMI6VvmPIpC', 'student', 1, '400', NULL, 'H', 1),
('STAFF/LEC/0089', 'Dr. A. Ibrahim', 'a.ibrahim@unilagos.edu.ng', '$2y$10$Idot14Ll2FSQO24l7DcfCOy6ocBWgz2GK9ItxiVxh6AZwFSHrW6pK', 'lecturer', 1, NULL, 'Lecturer', 'AI', 1),
('SL/CSC/0014', 'O. Adeyemi', 'o.adeyemi@unilagos.edu.ng', '$2y$10$Oxlfn/8Xu/hYnXenraUQ1..5weWdIBXpyRa0aFbA8KkuAgFZjjs0m', 'senior-lecturer', 1, NULL, 'Senior Lecturer', 'OA', 1),
('LEADERSHIP/VC/001', 'Prof. A. Okafor', 'vc@unilagos.edu.ng', '$2y$10$vJInlvv.RlV1x447brt60uvW3ODMLyWznAd48MOb9eInJP3bSNq3K', 'leadership', NULL, NULL, 'Vice-Chancellor', 'AO', 1),
('CSC/21/0043', 'Amina Bello', 'amina@student.unilagos.edu.ng', '$2y$10$KYhK0e4JiIpjpI1yrTlSkugd5igZeujISIxhJr7z86eMI6VvmPIpC', 'student', 1, '400', NULL, 'AB', 1),
('CSC/21/0044', 'Chidi Okonkwo', 'chidi@student.unilagos.edu.ng', '$2y$10$KYhK0e4JiIpjpI1yrTlSkugd5igZeujISIxhJr7z86eMI6VvmPIpC', 'student', 1, '400', NULL, 'CO', 1);

-- Courses
INSERT INTO courses (code, name, dept_id, level, semester, year) VALUES
('CSC 401', 'Artificial Intelligence', 1, '400', 1, 2026),
('CSC 403', 'Computer Networks', 1, '400', 1, 2026),
('CSC 405', 'Software Engineering', 1, '400', 1, 2026),
('CSC 407', 'Database Management', 1, '400', 1, 2026);

-- Course Enrollments
INSERT INTO course_enrollments (user_id, course_id, role) VALUES
(1, 1, 'student'), (1, 2, 'student'), (1, 3, 'student'), (1, 4, 'student'),
(5, 1, 'student'), (5, 2, 'student'), (5, 3, 'student'), (5, 4, 'student'),
(6, 1, 'student'), (6, 2, 'student'), (6, 3, 'student'), (6, 4, 'student'),
(2, 1, 'lecturer'), (2, 2, 'lecturer');

-- Channels
INSERT INTO channels (name, slug, type, dept_id, course_id, level_val) VALUES
('CSC General', 'csc-general', 'dept', 1, NULL, NULL),
('400 Level', 'csc-400', 'level', 1, NULL, '400'),
('CSC 401 — AI', 'csc401-channel', 'course', 1, 1, NULL),
('CSC 403 — Networks', 'csc403-channel', 'course', 1, 2, NULL),
('CSC Staff', 'csc-staff', 'staff', 1, NULL, NULL),
('University Broadcast', 'university-broadcast', 'broadcast', NULL, NULL, NULL);

-- Channel Members
INSERT INTO channel_members (channel_id, user_id) VALUES
(1,1),(1,2),(1,3),(1,5),(1,6),
(2,1),(2,5),(2,6),
(3,1),(3,2),(3,5),(3,6),
(4,1),(4,2),(4,5),(4,6),
(5,2),(5,3),
(6,4);

-- Messages
INSERT INTO messages (channel_id, user_id, body, type, created_at) VALUES
(1, 3, 'Welcome back to a new semester. Please check the updated timetable on your dashboards.', 'text', '2026-03-28 09:00:00'),
(1, 1, 'Thank you sir. When does registration close?', 'text', '2026-03-28 09:05:00'),
(1, 3, 'Registration closes April 15th. Make sure all your documents are submitted.', 'text', '2026-03-28 09:08:00'),
(3, 2, 'First assignment posted — Introduction to Search Algorithms. Due April 10.', 'notice', '2026-03-29 14:00:00'),
(3, 5, 'Dr., can we use Python or only pseudocode?', 'text', '2026-03-29 14:15:00'),
(3, 2, 'Python is fine. Include comments explaining your logic.', 'text', '2026-03-29 14:20:00'),
(2, 6, 'Anyone have notes from last week''s AI class?', 'text', '2026-04-01 10:00:00'),
(2, 1, 'I''ll upload them to the materials section later today.', 'text', '2026-04-01 10:05:00'),
(6, 4, 'The university will observe a public holiday on April 5th. All activities resume April 7th.', 'notice', '2026-04-02 08:00:00');

-- Announcements
INSERT INTO announcements (user_id, title, body, target_role, target_dept_id, priority, pinned, created_at) VALUES
(4, 'University Public Holiday', 'The university will observe a public holiday on April 5th. All lectures and examinations are postponed. Activities resume April 7th.', 'all', NULL, 'high', 1, '2026-04-02 08:00:00'),
(3, 'CSC Department — Timetable Update', 'The updated timetable for the 2025/2026 session second semester is now available. All students should check their dashboards for changes.', 'all', 1, 'medium', 0, '2026-03-28 09:00:00'),
(2, 'CSC 401 — First Assignment Posted', 'Introduction to Search Algorithms assignment is now available. Deadline: April 10, 2026. Submit via the assignments page.', 'student', 1, 'normal', 0, '2026-03-29 14:00:00'),
(3, 'Registration Deadline Reminder', 'Course registration for second semester closes April 15, 2026. Late registrations will not be accepted.', 'student', 1, 'high', 1, '2026-04-01 07:00:00');

-- Assignments
INSERT INTO assignments (course_id, lecturer_id, title, instructions, due_at, total_points, created_at) VALUES
(1, 2, 'Introduction to Search Algorithms', 'Implement BFS and DFS. Compare performance on a provided graph dataset. Submit Python code with comments.', '2026-04-10 23:59:00', 20, '2026-03-29 14:00:00'),
(2, 2, 'Network Protocol Analysis', 'Capture and analyze network traffic using Wireshark. Document the TCP handshake and identify at least 5 protocols.', '2026-04-15 23:59:00', 25, '2026-04-01 10:00:00');

-- Submissions
INSERT INTO submissions (assignment_id, student_id, filename, submitted_at, grade, graded_at, feedback) VALUES
(1, 1, 'hadi_search_algorithms.py', '2026-04-08 22:30:00', NULL, NULL, NULL),
(1, 5, 'amina_search.py', '2026-04-09 18:45:00', 18, '2026-04-11 10:00:00', 'Excellent implementation. Minor efficiency issue with DFS recursion.');

-- Materials
INSERT INTO materials (course_id, user_id, title, filename, type, created_at) VALUES
(1, 2, 'Lecture 1 — Intro to AI', 'ai_lecture_1.pdf', 'pdf', '2026-03-25 08:00:00'),
(1, 2, 'Lecture 2 — Search Algorithms', 'ai_lecture_2.pdf', 'pdf', '2026-03-27 08:00:00'),
(2, 2, 'Lecture 1 — OSI Model', 'networks_lecture_1.pdf', 'pdf', '2026-03-26 08:00:00'),
(2, 2, 'Lab Guide — Wireshark Setup', 'wireshark_guide.pdf', 'pdf', '2026-04-01 09:00:00');

-- Notifications
INSERT INTO notifications (user_id, type, body, is_read, created_at) VALUES
(1, 'announcement', 'New announcement: University Public Holiday', 0, '2026-04-02 08:00:00'),
(1, 'assignment', 'CSC 401 assignment due in 2 days', 0, '2026-04-08 07:00:00'),
(1, 'message', 'New message from Amina Bello', 1, '2026-04-02 18:03:00');
