/* UniConnect — Materials Page */

'use strict';

const Materials = (() => {
  async function init() {
    const user = App.getUser();
    const role = App.getRole();
    if (!user || !role) return;

    if (!Permissions.can(role, 'view_course_materials') && !Permissions.can(role, 'upload_materials')) {
      UI.renderAppShell('materials');
      const content = document.getElementById('page-content');
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">${UI.icon('folder', 48)}</div>
          <div class="empty-state__title">No Access</div>
          <div class="empty-state__text">Your role does not have access to course materials.</div>
        </div>
      `;
      return;
    }

    UI.renderAppShell('materials');
    const content = document.getElementById('page-content');

    const materials = await Data.getMaterials(role, user.id, user.deptCode);
    const courses = await Data.getCourses(role, user.id, user.deptCode, user.level);

    const canUpload = Permissions.can(role, 'upload_materials');

    const grouped = {};
    materials.forEach(m => {
      const course = courses.find(c => c.id === m.courseId);
      const key = course ? `${course.code} — ${course.name}` : m.courseId;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    });

    content.innerHTML = `
      <div class="content__header">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="content__title">Course Materials</h2>
            <p class="content__subtitle">${materials.length} files across ${Object.keys(grouped).length} courses</p>
          </div>
          ${canUpload ? `<button class="btn btn--primary" onclick="Materials.openUpload()">${UI.icon('upload', 16)} Upload Material</button>` : ''}
        </div>
      </div>

      ${Object.entries(grouped).map(([courseName, files]) => `
        <div class="card mb-4">
          <h3 class="card__title">${courseName}</h3>
          ${files.map(f => `
            <div class="list-item">
              <span style="color:var(--c-accent)">${UI.icon('file', 20)}</span>
              <div class="list-item__content">
                <div class="list-item__title">${f.title}</div>
                <div class="list-item__meta">${f.type.toUpperCase()} — Uploaded ${App.formatDate(f.createdAt)}</div>
              </div>
              <button class="btn btn--ghost btn--sm" onclick="UI.toast('Download starting...','info')">${UI.icon('download', 16)}</button>
            </div>
          `).join('')}
        </div>
      `).join('')}

      ${materials.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state__icon">${UI.icon('folder', 48)}</div>
          <div class="empty-state__title">No Materials Yet</div>
          <div class="empty-state__text">${canUpload ? 'Upload your first course material.' : 'Your lecturers haven\'t uploaded any materials yet.'}</div>
        </div>
      ` : ''}

      <div class="modal" id="modal-upload">
        <div class="modal__backdrop" onclick="UI.closeModal('modal-upload')"></div>
        <div class="modal__dialog">
          <div class="modal__header">
            <h3 class="modal__title">Upload Material</h3>
            <button class="modal__close" onclick="UI.closeModal('modal-upload')">${UI.icon('x')}</button>
          </div>
          <div class="modal__body">
            <div class="form-group">
              <label class="form-label">Course</label>
              <select class="form-input" id="upload-course">
                ${courses.map(c => `<option value="${c.id}">${c.code} — ${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Title</label>
              <input type="text" class="form-input" id="upload-title" placeholder="e.g. Lecture 3 — Neural Networks">
            </div>
            <div class="form-group">
              <label class="form-label">File</label>
              <input type="file" class="form-input" id="upload-file" style="padding:8px">
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--secondary" onclick="UI.closeModal('modal-upload')">Cancel</button>
            <button class="btn btn--primary" onclick="Materials.handleUpload()">Upload</button>
          </div>
        </div>
      </div>
    `;
  }

  function openUpload() {
    UI.openModal('modal-upload');
  }

  function handleUpload() {
    UI.closeModal('modal-upload');
    UI.toast('Material uploaded successfully!', 'success');
  }

  document.addEventListener('DOMContentLoaded', init);

  return { init, openUpload, handleUpload };
})();
