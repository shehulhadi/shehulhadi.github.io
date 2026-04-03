/* UniConnect — Dashboard (all 4 roles) */

'use strict';

const Dashboard = (() => {
  async function init() {
    const user = App.getUser();
    const role = App.getRole();
    if (!user || !role) return;

    UI.renderAppShell('dashboard');
    const content = document.getElementById('page-content');
    if (!content) return;

    content.innerHTML = '<div class="skeleton" style="height:200px;margin-bottom:16px"></div>';

    const stats = await Data.getStats(role);

    if (role === 'student') await renderStudent(content, user, stats);
    else if (role === 'lecturer') await renderLecturer(content, user, stats);
    else if (role === 'senior-lecturer') await renderSeniorLecturer(content, user, stats);
    else if (role === 'leadership') await renderLeadership(content, user, stats);
  }

  /* ───── Student Dashboard ───── */
  async function renderStudent(el, user, stats) {
    const assignments = await Data.getAssignments('student', user.id);
    const timetable = await Data.getTimetable(user.deptCode, user.level);
    const announcements = await Data.getAnnouncements('student', user.deptCode);

    const pendingAssignments = assignments.filter(a => !a.submission && !App.isOverdue(a.dueAt));
    const recentAnnouncements = announcements.slice(0, 3);

    el.innerHTML = `
      <div class="content__header">
        <h2 class="content__title">Welcome back, ${user.name}</h2>
        <p class="content__subtitle">${user.dept} — ${user.level} Level</p>
      </div>

      <div class="stat-grid mb-4">
        <div class="stat-card">
          <div class="stat-card__label">Courses</div>
          <div class="stat-card__value">${stats.coursesEnrolled}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Pending</div>
          <div class="stat-card__value">${stats.assignmentsPending}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Completed</div>
          <div class="stat-card__value">${stats.assignmentsCompleted}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Messages</div>
          <div class="stat-card__value">${stats.unreadMessages}</div>
        </div>
      </div>

      <div class="grid grid--2 mb-4">
        <div class="card card--accent">
          <h3 class="card__title">Upcoming Assignments</h3>
          ${pendingAssignments.length === 0 ? '<p class="text-muted" style="font-size:0.875rem">No pending assignments</p>' :
            pendingAssignments.map(a => `
              <div class="list-item" style="padding:var(--sp-2) 0;border-bottom:1px solid var(--c-border)">
                <div class="list-item__content">
                  <div class="list-item__title">${a.title}</div>
                  <div class="list-item__meta">${a.courseName} — Due ${App.formatDateTime(a.dueAt)}</div>
                </div>
                <span class="badge badge--warning">${App.daysUntil(a.dueAt)}d left</span>
              </div>
            `).join('')}
          <a href="assignments.html" class="btn btn--ghost btn--sm mt-3">View All</a>
        </div>

        <div class="card card--accent">
          <h3 class="card__title">Recent Announcements</h3>
          ${recentAnnouncements.map(a => `
            <div class="announcement">
              <div class="announcement__title">${a.title}</div>
              <div class="announcement__meta">
                ${a.priority === 'high' ? '<span class="badge badge--danger">Important</span>' : ''}
                <span>${App.formatDate(a.createdAt)}</span>
              </div>
            </div>
          `).join('')}
          <a href="announcements.html" class="btn btn--ghost btn--sm mt-3">View All</a>
        </div>
      </div>

      <div class="card">
        <h3 class="card__title">Today's Timetable</h3>
        ${timetable.length === 0 ? '<p class="text-muted" style="font-size:0.875rem">No classes today</p>' : `
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr><th>Time</th><th>Course</th><th>Room</th><th>Lecturer</th></tr>
              </thead>
              <tbody>
                ${timetable.map(t => `
                  <tr>
                    <td>${t.time}</td>
                    <td>${t.course}</td>
                    <td>${t.room}</td>
                    <td>${t.lecturer}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }

  /* ───── Lecturer Dashboard ───── */
  async function renderLecturer(el, user, stats) {
    const courses = await Data.getCourses('lecturer', user.id);
    const assignments = await Data.getAssignments('lecturer', user.id);
    const announcements = await Data.getAnnouncements('lecturer', user.deptCode);

    el.innerHTML = `
      <div class="content__header">
        <h2 class="content__title">Welcome, ${user.name}</h2>
        <p class="content__subtitle">${user.dept} — ${user.position}</p>
      </div>

      <div class="stat-grid mb-4">
        <div class="stat-card">
          <div class="stat-card__label">Students</div>
          <div class="stat-card__value">${stats.totalStudents}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Courses</div>
          <div class="stat-card__value">${stats.activeCourses}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Pending Grading</div>
          <div class="stat-card__value">${stats.pendingGrading}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Submission Rate</div>
          <div class="stat-card__value">${stats.submissionRate}</div>
        </div>
      </div>

      <div class="grid grid--2 mb-4">
        <div class="card card--accent">
          <h3 class="card__title">My Courses</h3>
          ${courses.map(c => `
            <div class="list-item" style="padding:var(--sp-2) 0;border-bottom:1px solid var(--c-border)">
              <div class="list-item__content">
                <div class="list-item__title">${c.code} — ${c.name}</div>
                <div class="list-item__meta">Level ${c.level}, Semester ${c.semester}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="card card--accent">
          <h3 class="card__title">Active Assignments</h3>
          ${assignments.map(a => `
            <div class="list-item" style="padding:var(--sp-2) 0;border-bottom:1px solid var(--c-border)">
              <div class="list-item__content">
                <div class="list-item__title">${a.title}</div>
                <div class="list-item__meta">${a.courseName} — ${a.submissionCount} submissions</div>
              </div>
              ${App.isOverdue(a.dueAt) ? '<span class="badge badge--danger">Closed</span>' : `<span class="badge badge--warning">${App.daysUntil(a.dueAt)}d left</span>`}
            </div>
          `).join('')}
          <div class="mt-3 flex gap-2">
            <a href="assignments.html" class="btn btn--ghost btn--sm">View All</a>
            <a href="assignments.html#create" class="btn btn--primary btn--sm">+ New Assignment</a>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="card__title">Recent Announcements</h3>
        ${announcements.slice(0, 3).map(a => `
          <div class="announcement">
            <div class="announcement__title">${a.title}</div>
            <div class="announcement__body">${a.body.substring(0, 120)}${a.body.length > 120 ? '...' : ''}</div>
            <div class="announcement__meta">
              ${a.priority === 'high' ? '<span class="badge badge--danger">Important</span>' : ''}
              <span>${App.formatDate(a.createdAt)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ───── Senior Lecturer Dashboard ───── */
  async function renderSeniorLecturer(el, user, stats) {
    const approvals = await Data.getApprovalQueue(user.deptCode);
    const announcements = await Data.getAnnouncements('senior-lecturer', user.deptCode);

    el.innerHTML = `
      <div class="content__header">
        <h2 class="content__title">Welcome, ${user.name}</h2>
        <p class="content__subtitle">${user.dept} — ${user.position}</p>
      </div>

      <div class="stat-grid mb-4">
        <div class="stat-card">
          <div class="stat-card__label">Dept Students</div>
          <div class="stat-card__value">${stats.deptStudents}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Lecturers</div>
          <div class="stat-card__value">${stats.deptLecturers}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Pending Approvals</div>
          <div class="stat-card__value">${stats.pendingApprovals}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Submission Rate</div>
          <div class="stat-card__value">${stats.avgSubmissionRate}</div>
        </div>
      </div>

      <div class="grid grid--2 mb-4">
        <div class="card card--accent" id="approvals">
          <h3 class="card__title">Pending Approvals</h3>
          ${approvals.length === 0 ? '<p class="text-muted" style="font-size:0.875rem">No pending approvals</p>' :
            approvals.map(a => `
              <div class="list-item" style="padding:var(--sp-2) 0;border-bottom:1px solid var(--c-border)">
                <div class="avatar avatar--sm">${a.name.charAt(0)}</div>
                <div class="list-item__content">
                  <div class="list-item__title">${a.name}</div>
                  <div class="list-item__meta">${a.type === 'student' ? `Level ${a.level} Student` : 'Lecturer'} — ${App.formatDate(a.submittedAt)}</div>
                </div>
                <div class="flex gap-2">
                  <button class="btn btn--primary btn--sm" onclick="UI.toast('Approved ${a.name}','success')">Approve</button>
                  <button class="btn btn--danger btn--sm" onclick="UI.toast('Rejected ${a.name}','error')">Reject</button>
                </div>
              </div>
            `).join('')}
        </div>

        <div class="card card--accent" id="analytics">
          <h3 class="card__title">Department Analytics</h3>
          <div style="padding:var(--sp-4) 0">
            <div style="display:flex;justify-content:space-between;margin-bottom:var(--sp-3)">
              <span style="font-size:0.875rem">Submission Rate</span>
              <span style="font-size:0.875rem;font-weight:600">${stats.avgSubmissionRate}</span>
            </div>
            <div style="height:8px;background:var(--c-border);border-radius:var(--r-full);overflow:hidden">
              <div style="height:100%;width:${stats.avgSubmissionRate};background:var(--c-accent);border-radius:var(--r-full)"></div>
            </div>
          </div>
          <div style="font-size:0.875rem;color:var(--c-text-secondary)">
            <p>${stats.deptStudents} students across all levels</p>
            <p>${stats.deptLecturers} active lecturers</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="card__title">Recent Announcements</h3>
        ${announcements.slice(0, 3).map(a => `
          <div class="announcement">
            <div class="announcement__title">${a.title}</div>
            <div class="announcement__body">${a.body.substring(0, 120)}${a.body.length > 120 ? '...' : ''}</div>
            <div class="announcement__meta">
              ${a.priority === 'high' ? '<span class="badge badge--danger">Important</span>' : ''}
              <span>${App.formatDate(a.createdAt)}</span>
            </div>
          </div>
        `).join('')}
        <a href="announcements.html" class="btn btn--ghost btn--sm mt-3">View All</a>
      </div>
    `;
  }

  /* ───── Leadership Dashboard ───── */
  async function renderLeadership(el, user, stats) {
    const announcements = await Data.getAnnouncements('leadership', null);

    el.innerHTML = `
      <div class="content__header">
        <h2 class="content__title">Welcome, ${user.name}</h2>
        <p class="content__subtitle">${user.position}</p>
      </div>

      <div class="stat-grid mb-4">
        <div class="stat-card">
          <div class="stat-card__label">Total Students</div>
          <div class="stat-card__value">${stats.totalStudents.toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Total Staff</div>
          <div class="stat-card__value">${stats.totalStaff}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Departments</div>
          <div class="stat-card__value">${stats.totalDepartments}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Active Sessions</div>
          <div class="stat-card__value">${stats.activeSessions}</div>
        </div>
      </div>

      <div class="grid grid--2 mb-4">
        <div class="card card--accent" id="analytics">
          <h3 class="card__title">University Overview</h3>
          <div style="padding:var(--sp-3) 0">
            <div class="list-item" style="padding:var(--sp-2) 0;border-bottom:1px solid var(--c-border)">
              <div class="list-item__content">
                <div class="list-item__title">Computer Science</div>
                <div class="list-item__meta">520 students, 18 lecturers</div>
              </div>
              <span class="badge badge--success">Active</span>
            </div>
            <div class="list-item" style="padding:var(--sp-2) 0;border-bottom:1px solid var(--c-border)">
              <div class="list-item__content">
                <div class="list-item__title">Mathematics</div>
                <div class="list-item__meta">430 students, 15 lecturers</div>
              </div>
              <span class="badge badge--success">Active</span>
            </div>
            <div class="list-item" style="padding:var(--sp-2) 0;border-bottom:1px solid var(--c-border)">
              <div class="list-item__content">
                <div class="list-item__title">Physics</div>
                <div class="list-item__meta">380 students, 12 lecturers</div>
              </div>
              <span class="badge badge--success">Active</span>
            </div>
          </div>
        </div>

        <div class="card card--accent">
          <h3 class="card__title">Quick Actions</h3>
          <div style="display:flex;flex-direction:column;gap:var(--sp-2);padding:var(--sp-3) 0">
            <a href="announcements.html#create" class="btn btn--primary btn--block">Post University Broadcast</a>
            <a href="chat.html" class="btn btn--secondary btn--block">Message Senior Lecturers</a>
            <button class="btn btn--secondary btn--block" onclick="UI.toast('Calendar coming soon','info')">Create Calendar Event</button>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="card__title">Recent Announcements</h3>
        ${announcements.slice(0, 3).map(a => `
          <div class="announcement">
            <div class="announcement__title">${a.title}</div>
            <div class="announcement__body">${a.body.substring(0, 150)}${a.body.length > 150 ? '...' : ''}</div>
            <div class="announcement__meta">
              ${a.priority === 'high' ? '<span class="badge badge--danger">Important</span>' : ''}
              <span>${App.formatDate(a.createdAt)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  document.addEventListener('DOMContentLoaded', init);

  return { init };
})();
