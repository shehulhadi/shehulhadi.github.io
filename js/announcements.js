/* UniConnect — Announcements Page */

'use strict';

const Announcements = (() => {
  async function init() {
    const user = App.getUser();
    const role = App.getRole();
    if (!user || !role) return;

    UI.renderAppShell('announcements');
    const content = document.getElementById('page-content');

    const announcements = await Data.getAnnouncements(role, user.deptCode);
    const canPost = Permissions.can(role, 'post_announcements');
    const canBroadcast = Permissions.can(role, 'broadcast_university');

    const pinned = announcements.filter(a => a.pinned);
    const regular = announcements.filter(a => !a.pinned);

    content.innerHTML = `
      <div class="content__header">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="content__title">Announcements</h2>
            <p class="content__subtitle">${announcements.length} announcements</p>
          </div>
          ${canPost ? `<button class="btn btn--primary" onclick="Announcements.openCreate()">${UI.icon('plus', 16)} New Announcement</button>` : ''}
        </div>
      </div>

      ${pinned.length > 0 ? `
        <div class="mb-4">
          <h3 style="font-family:var(--font-body);font-size:0.8125rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--c-text-muted);margin-bottom:var(--sp-3)">${UI.icon('pin', 14)} Pinned</h3>
          ${pinned.map(a => renderAnnouncement(a)).join('')}
        </div>
      ` : ''}

      ${regular.map(a => renderAnnouncement(a)).join('')}

      ${announcements.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state__icon">${UI.icon('megaphone', 48)}</div>
          <div class="empty-state__title">No Announcements</div>
          <div class="empty-state__text">There are no announcements at this time.</div>
        </div>
      ` : ''}

      <div class="modal" id="modal-announce">
        <div class="modal__backdrop" onclick="UI.closeModal('modal-announce')"></div>
        <div class="modal__dialog">
          <div class="modal__header">
            <h3 class="modal__title">${canBroadcast ? 'University Broadcast' : 'New Announcement'}</h3>
            <button class="modal__close" onclick="UI.closeModal('modal-announce')">${UI.icon('x')}</button>
          </div>
          <div class="modal__body">
            <div class="form-group">
              <label class="form-label">Title</label>
              <input type="text" class="form-input" id="announce-title" placeholder="Announcement title">
            </div>
            <div class="form-group">
              <label class="form-label">Message</label>
              <textarea class="form-input" id="announce-body" placeholder="Write your announcement..." style="min-height:120px"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Priority</label>
              <select class="form-input" id="announce-priority">
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="high">High / Urgent</option>
              </select>
            </div>
            ${canBroadcast ? `
              <div class="form-group">
                <label class="form-label">Target Audience</label>
                <select class="form-input" id="announce-target">
                  <option value="all">Entire University</option>
                  <option value="students">All Students</option>
                  <option value="staff">All Staff</option>
                </select>
              </div>
            ` : ''}
          </div>
          <div class="modal__footer">
            <button class="btn btn--secondary" onclick="UI.closeModal('modal-announce')">Cancel</button>
            <button class="btn btn--primary" onclick="Announcements.handleCreate()">Post Announcement</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderAnnouncement(a) {
    const author = Data.USERS[a.userId];
    const authorName = author ? author.name : 'Unknown';
    const authorRole = author ? author.role : '';

    return `
      <div class="card mb-3" style="${a.priority === 'high' ? 'border-left:3px solid var(--c-red)' : ''}">
        <div class="flex items-center justify-between mb-2">
          <h3 class="card__title" style="margin:0">${a.title}</h3>
          ${a.priority === 'high' ? '<span class="badge badge--danger">Important</span>' : ''}
          ${a.priority === 'medium' ? '<span class="badge badge--warning">Medium</span>' : ''}
        </div>
        <p style="font-size:0.875rem;margin-bottom:var(--sp-3);line-height:1.6">${a.body}</p>
        <div class="flex items-center gap-3" style="font-size:0.8125rem;color:var(--c-text-muted)">
          <div class="flex items-center gap-2">
            <div class="avatar avatar--sm" style="width:24px;height:24px;font-size:0.625rem">${author ? author.avatar : '?'}</div>
            <span>${authorName}</span>
            <span class="badge badge--${authorRole}" style="font-size:0.5625rem">${authorRole.replace('-', ' ')}</span>
          </div>
          <span>${App.formatDate(a.createdAt)}</span>
          ${a.targetDept ? `<span>Dept: ${a.targetDept}</span>` : '<span>University-wide</span>'}
        </div>
      </div>
    `;
  }

  function openCreate() {
    UI.openModal('modal-announce');
  }

  function handleCreate() {
    UI.closeModal('modal-announce');
    UI.toast('Announcement posted successfully!', 'success');
  }

  document.addEventListener('DOMContentLoaded', init);

  return { init, openCreate, handleCreate };
})();
