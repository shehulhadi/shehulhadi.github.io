/* UniConnect — Assignments Page */

'use strict';

const Assignments = (() => {
  async function init() {
    const user = App.getUser();
    const role = App.getRole();
    if (!user || !role) return;

    if (!Permissions.can(role, 'submit_assignment') && !Permissions.can(role, 'create_assignment')) {
      UI.renderAppShell('assignments');
      const content = document.getElementById('page-content');
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">${UI.icon('assignment', 48)}</div>
          <div class="empty-state__title">No Access</div>
          <div class="empty-state__text">Your role does not have access to assignments.</div>
        </div>
      `;
      return;
    }

    UI.renderAppShell('assignments');
    const content = document.getElementById('page-content');

    const assignments = await Data.getAssignments(role, user.id);

    if (role === 'student') renderStudentView(content, assignments, user);
    else if (role === 'lecturer') renderLecturerView(content, assignments, user);
  }

  function renderStudentView(el, assignments, user) {
    const pending = assignments.filter(a => !a.submission && !App.isOverdue(a.dueAt));
    const submitted = assignments.filter(a => a.submission);
    const overdue = assignments.filter(a => !a.submission && App.isOverdue(a.dueAt));

    el.innerHTML = `
      <div class="content__header">
        <h2 class="content__title">My Assignments</h2>
        <p class="content__subtitle">${assignments.length} total assignments</p>
      </div>

      <div class="tabs mb-4">
        <button class="tab tab--active" onclick="Assignments.filterTab(this,'all')">All (${assignments.length})</button>
        <button class="tab" onclick="Assignments.filterTab(this,'pending')">Pending (${pending.length})</button>
        <button class="tab" onclick="Assignments.filterTab(this,'submitted')">Submitted (${submitted.length})</button>
        ${overdue.length > 0 ? `<button class="tab" onclick="Assignments.filterTab(this,'overdue')">Overdue (${overdue.length})</button>` : ''}
      </div>

      <div id="assignments-list">
        ${assignments.map(a => renderStudentAssignmentCard(a)).join('')}
      </div>

      ${renderSubmitModal()}
    `;
  }

  function renderStudentAssignmentCard(a) {
    const isOverdue = App.isOverdue(a.dueAt);
    const hasSubmission = !!a.submission;
    let status = 'pending';
    let statusBadge = '<span class="badge badge--warning">Pending</span>';

    if (hasSubmission && a.submission.grade !== null && a.submission.grade !== undefined) {
      status = 'graded';
      statusBadge = `<span class="badge badge--success">Graded: ${a.submission.grade}/${a.totalPoints}</span>`;
    } else if (hasSubmission) {
      status = 'submitted';
      statusBadge = '<span class="badge badge--success">Submitted</span>';
    } else if (isOverdue) {
      status = 'overdue';
      statusBadge = '<span class="badge badge--danger">Overdue</span>';
    }

    return `
      <div class="card mb-3" data-status="${status}">
        <div class="flex items-center justify-between mb-2">
          <h3 class="card__title" style="margin:0">${a.title}</h3>
          ${statusBadge}
        </div>
        <p style="font-size:0.8125rem;color:var(--c-text-secondary);margin-bottom:var(--sp-2)">${a.courseName}</p>
        <p style="font-size:0.875rem;margin-bottom:var(--sp-3)">${a.instructions}</p>
        <div class="flex items-center justify-between">
          <span style="font-size:0.8125rem;color:var(--c-text-muted)">${UI.icon('clock', 14)} Due: ${App.formatDateTime(a.dueAt)}</span>
          ${!hasSubmission && !isOverdue ? `<button class="btn btn--primary btn--sm" onclick="Assignments.openSubmit(${a.id})">Submit</button>` : ''}
        </div>
        ${hasSubmission && a.submission.feedback ? `
          <div style="margin-top:var(--sp-3);padding:var(--sp-3);background:var(--c-bg);border-radius:var(--r-md);font-size:0.8125rem">
            <strong>Feedback:</strong> ${a.submission.feedback}
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderLecturerView(el, assignments, user) {
    el.innerHTML = `
      <div class="content__header">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="content__title">Assignments</h2>
            <p class="content__subtitle">${assignments.length} assignments created</p>
          </div>
          <button class="btn btn--primary" onclick="Assignments.openCreate()">
            ${UI.icon('plus', 16)} New Assignment
          </button>
        </div>
      </div>

      <div id="assignments-list">
        ${assignments.map(a => renderLecturerAssignmentCard(a)).join('')}
      </div>

      ${renderCreateModal()}
      ${renderGradeModal()}
    `;
  }

  function renderLecturerAssignmentCard(a) {
    const isOverdue = App.isOverdue(a.dueAt);

    return `
      <div class="card mb-3">
        <div class="flex items-center justify-between mb-2">
          <h3 class="card__title" style="margin:0">${a.title}</h3>
          ${isOverdue ? '<span class="badge badge--danger">Closed</span>' : `<span class="badge badge--warning">${App.daysUntil(a.dueAt)}d left</span>`}
        </div>
        <p style="font-size:0.8125rem;color:var(--c-text-secondary);margin-bottom:var(--sp-2)">${a.courseName} — ${a.totalPoints} points</p>
        <p style="font-size:0.875rem;margin-bottom:var(--sp-3)">${a.instructions}</p>

        <div style="margin-bottom:var(--sp-3)">
          <div class="flex items-center justify-between" style="font-size:0.8125rem;margin-bottom:var(--sp-1)">
            <span>${a.submissionCount} submissions</span>
            <span>Due: ${App.formatDateTime(a.dueAt)}</span>
          </div>
        </div>

        ${a.submissions && a.submissions.length > 0 ? `
          <div style="border-top:1px solid var(--c-border);padding-top:var(--sp-3)">
            <h4 style="font-family:var(--font-body);font-size:0.8125rem;font-weight:600;margin-bottom:var(--sp-2)">Submissions</h4>
            ${a.submissions.map(s => {
              const student = Data.USERS[s.studentId];
              const name = student ? student.name : s.studentId;
              return `
                <div class="list-item" style="padding:var(--sp-2) 0">
                  <div class="avatar avatar--sm">${student ? student.avatar : '?'}</div>
                  <div class="list-item__content">
                    <div class="list-item__title">${name}</div>
                    <div class="list-item__meta">Submitted ${App.formatDate(s.submittedAt)} — ${s.filename}</div>
                  </div>
                  ${s.grade !== null && s.grade !== undefined
                    ? `<span class="badge badge--success">${s.grade}/${a.totalPoints}</span>`
                    : `<button class="btn btn--primary btn--sm" onclick="Assignments.openGrade(${a.id},${s.id},'${name}')">Grade</button>`
                  }
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderSubmitModal() {
    return `
      <div class="modal" id="modal-submit">
        <div class="modal__backdrop" onclick="UI.closeModal('modal-submit')"></div>
        <div class="modal__dialog">
          <div class="modal__header">
            <h3 class="modal__title">Submit Assignment</h3>
            <button class="modal__close" onclick="UI.closeModal('modal-submit')">${UI.icon('x')}</button>
          </div>
          <div class="modal__body">
            <div class="form-group">
              <label class="form-label">Upload File</label>
              <input type="file" class="form-input" id="submit-file" style="padding:8px">
            </div>
            <div class="form-group">
              <label class="form-label">Comments (optional)</label>
              <textarea class="form-input" id="submit-comments" placeholder="Any notes for the lecturer..."></textarea>
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--secondary" onclick="UI.closeModal('modal-submit')">Cancel</button>
            <button class="btn btn--primary" onclick="Assignments.handleSubmit()">Submit</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderCreateModal() {
    return `
      <div class="modal" id="modal-create">
        <div class="modal__backdrop" onclick="UI.closeModal('modal-create')"></div>
        <div class="modal__dialog">
          <div class="modal__header">
            <h3 class="modal__title">Create Assignment</h3>
            <button class="modal__close" onclick="UI.closeModal('modal-create')">${UI.icon('x')}</button>
          </div>
          <div class="modal__body">
            <div class="form-group">
              <label class="form-label">Course</label>
              <select class="form-input" id="create-course">
                <option value="CSC401">CSC 401 — Artificial Intelligence</option>
                <option value="CSC403">CSC 403 — Computer Networks</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Title</label>
              <input type="text" class="form-input" id="create-title" placeholder="Assignment title">
            </div>
            <div class="form-group">
              <label class="form-label">Instructions</label>
              <textarea class="form-input" id="create-instructions" placeholder="Detailed instructions..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Due Date</label>
              <input type="datetime-local" class="form-input" id="create-due">
            </div>
            <div class="form-group">
              <label class="form-label">Total Points</label>
              <input type="number" class="form-input" id="create-points" value="20" min="1">
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--secondary" onclick="UI.closeModal('modal-create')">Cancel</button>
            <button class="btn btn--primary" onclick="Assignments.handleCreate()">Create</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderGradeModal() {
    return `
      <div class="modal" id="modal-grade">
        <div class="modal__backdrop" onclick="UI.closeModal('modal-grade')"></div>
        <div class="modal__dialog">
          <div class="modal__header">
            <h3 class="modal__title">Grade Submission</h3>
            <button class="modal__close" onclick="UI.closeModal('modal-grade')">${UI.icon('x')}</button>
          </div>
          <div class="modal__body">
            <p id="grade-student-name" style="font-weight:600;margin-bottom:var(--sp-3)"></p>
            <div class="form-group">
              <label class="form-label">Grade</label>
              <input type="number" class="form-input" id="grade-value" min="0" max="100">
            </div>
            <div class="form-group">
              <label class="form-label">Feedback</label>
              <textarea class="form-input" id="grade-feedback" placeholder="Feedback for the student..."></textarea>
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--secondary" onclick="UI.closeModal('modal-grade')">Cancel</button>
            <button class="btn btn--primary" onclick="Assignments.handleGrade()">Save Grade</button>
          </div>
        </div>
      </div>
    `;
  }

  function filterTab(btn, filter) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('tab--active'));
    btn.classList.add('tab--active');

    document.querySelectorAll('#assignments-list .card').forEach(card => {
      if (filter === 'all') {
        card.style.display = '';
      } else {
        card.style.display = card.dataset.status === filter ? '' : 'none';
      }
    });
  }

  function openSubmit(assignmentId) {
    UI.openModal('modal-submit');
  }

  function handleSubmit() {
    UI.closeModal('modal-submit');
    UI.toast('Assignment submitted successfully!', 'success');
    setTimeout(() => init(), 500);
  }

  function openCreate() {
    UI.openModal('modal-create');
  }

  function handleCreate() {
    UI.closeModal('modal-create');
    UI.toast('Assignment created successfully!', 'success');
  }

  function openGrade(assignmentId, submissionId, studentName) {
    document.getElementById('grade-student-name').textContent = studentName;
    UI.openModal('modal-grade');
  }

  function handleGrade() {
    UI.closeModal('modal-grade');
    UI.toast('Grade saved successfully!', 'success');
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    init,
    filterTab,
    openSubmit,
    handleSubmit,
    openCreate,
    handleCreate,
    openGrade,
    handleGrade,
  };
})();
