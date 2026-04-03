/* UniConnect — Profile Page */

'use strict';

const Profile = (() => {
  async function init() {
    const user = App.getUser();
    const role = App.getRole();
    if (!user || !role) return;

    UI.renderAppShell('profile');
    const content = document.getElementById('page-content');

    const roleLabel = role === 'senior-lecturer' ? 'Senior Lecturer' : role.charAt(0).toUpperCase() + role.slice(1);
    const stats = await Data.getStats(role);

    content.innerHTML = `
      <div class="content__header">
        <h2 class="content__title">My Profile</h2>
      </div>

      <div class="grid grid--2">
        <div class="card card--accent">
          <div style="display:flex;align-items:center;gap:var(--sp-4);margin-bottom:var(--sp-4)">
            <div class="avatar avatar--lg">${user.avatar}</div>
            <div>
              <h3 style="font-family:var(--font-display);font-size:1.25rem">${user.name}</h3>
              <p style="font-size:0.875rem;color:var(--c-text-secondary)">${roleLabel}</p>
              <span class="badge badge--${role}">${roleLabel}</span>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-3)">
            <div>
              <div style="font-size:0.75rem;color:var(--c-text-muted);margin-bottom:2px">ID</div>
              <div style="font-size:0.875rem;font-weight:500">${user.id}</div>
            </div>
            <div>
              <div style="font-size:0.75rem;color:var(--c-text-muted);margin-bottom:2px">Email</div>
              <div style="font-size:0.875rem;font-weight:500">${user.email}</div>
            </div>
            <div>
              <div style="font-size:0.75rem;color:var(--c-text-muted);margin-bottom:2px">Department</div>
              <div style="font-size:0.875rem;font-weight:500">${user.dept}</div>
            </div>
            ${user.level ? `
              <div>
                <div style="font-size:0.75rem;color:var(--c-text-muted);margin-bottom:2px">Level</div>
                <div style="font-size:0.875rem;font-weight:500">${user.level}</div>
              </div>
            ` : ''}
            ${user.position ? `
              <div>
                <div style="font-size:0.75rem;color:var(--c-text-muted);margin-bottom:2px">Position</div>
                <div style="font-size:0.875rem;font-weight:500">${user.position}</div>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="card">
          <h3 class="card__title">Activity Summary</h3>
          <div style="display:flex;flex-direction:column;gap:var(--sp-3);margin-top:var(--sp-3)">
            ${Object.entries(stats).map(([key, val]) => `
              <div class="flex items-center justify-between" style="padding:var(--sp-2) 0;border-bottom:1px solid var(--c-border)">
                <span style="font-size:0.875rem;color:var(--c-text-secondary)">${formatStatLabel(key)}</span>
                <span style="font-size:0.9375rem;font-weight:600">${val}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="card mt-4">
        <h3 class="card__title">Account Settings</h3>
        <div style="padding:var(--sp-3) 0">
          <div class="form-group">
            <label class="form-label">Display Name</label>
            <input type="text" class="form-input" value="${user.name}" id="profile-name">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" value="${user.email}" disabled>
            <span class="form-hint">Email cannot be changed. Contact administration.</span>
          </div>
          <div class="flex gap-2">
            <button class="btn btn--primary" onclick="Profile.save()">Save Changes</button>
            <button class="btn btn--danger" onclick="App.logout()">Logout</button>
          </div>
        </div>
      </div>
    `;
  }

  function formatStatLabel(key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  function save() {
    const name = document.getElementById('profile-name');
    if (name && name.value.trim()) {
      const user = App.getUser();
      user.name = name.value.trim();
      App.setUser(user);
      UI.toast('Profile updated!', 'success');
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  return { init, save };
})();
