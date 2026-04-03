/* UniConnect — Auth (Login, Register, Verify) */

'use strict';

const Auth = (() => {
  const card = document.getElementById('auth-card');
  let currentView = 'login';

  function init() {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'register') currentView = 'register';
    else if (hash === 'verify') currentView = 'verify';
    else currentView = 'login';

    render();
  }

  function render() {
    if (currentView === 'login') renderLogin();
    else if (currentView === 'register') renderRegister();
    else if (currentView === 'verify') renderVerify();
  }

  function switchView(view) {
    currentView = view;
    window.location.hash = view;
    render();
  }

  /* ───── Login ───── */
  function renderLogin() {
    card.innerHTML = `
      <h1 class="auth-card__logo">UniConnect</h1>
      <p class="auth-card__subtitle">Sign in to your account</p>
      <form id="login-form" onsubmit="Auth.handleLogin(event)">
        <div class="form-group">
          <label class="form-label" for="login-id">Matric / Staff ID</label>
          <input class="form-input" type="text" id="login-id" placeholder="e.g. CSC/21/0042" required autocomplete="username">
        </div>
        <div class="form-group">
          <label class="form-label" for="login-password">Password</label>
          <input class="form-input" type="password" id="login-password" placeholder="Enter password" required autocomplete="current-password">
        </div>
        <div id="login-error" class="form-error" style="margin-bottom:var(--sp-3);display:none"></div>
        <button type="submit" class="btn btn--primary btn--block btn--lg" id="login-btn">Sign In</button>
      </form>
      <div class="auth-card__footer">
        Don't have an account? <a href="#register" onclick="Auth.switchView('register');return false">Register</a>
      </div>
      <div style="margin-top:var(--sp-6);padding-top:var(--sp-4);border-top:1px solid var(--c-border)">
        <p style="font-size:0.8125rem;color:var(--c-text-muted);text-align:center;margin-bottom:var(--sp-3)">Demo accounts (password shown):</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-2)">
          <button class="btn btn--secondary btn--sm" onclick="Auth.fillDemo('CSC/21/0042','student123')">Student</button>
          <button class="btn btn--secondary btn--sm" onclick="Auth.fillDemo('STAFF/LEC/0089','lecturer123')">Lecturer</button>
          <button class="btn btn--secondary btn--sm" onclick="Auth.fillDemo('SL/CSC/0014','senior123')">Sr. Lecturer</button>
          <button class="btn btn--secondary btn--sm" onclick="Auth.fillDemo('LEADERSHIP/VC/001','leader123')">Leadership</button>
        </div>
      </div>
    `;
  }

  function fillDemo(id, pw) {
    document.getElementById('login-id').value = id;
    document.getElementById('login-password').value = pw;
  }

  async function handleLogin(e) {
    e.preventDefault();
    const id = document.getElementById('login-id').value.trim();
    const pw = document.getElementById('login-password').value;
    const errEl = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');

    btn.textContent = 'Signing in...';
    btn.disabled = true;
    errEl.style.display = 'none';

    const result = await Data.login(id, pw);

    if (result.success) {
      App.setUser(result.user);
      window.location.href = 'dashboard.html';
    } else {
      errEl.textContent = result.error;
      errEl.style.display = 'block';
      btn.textContent = 'Sign In';
      btn.disabled = false;
    }
  }

  /* ───── Register ───── */
  function renderRegister() {
    card.innerHTML = `
      <h1 class="auth-card__logo">UniConnect</h1>
      <p class="auth-card__subtitle">Create your account</p>
      <form id="register-form" onsubmit="Auth.handleRegister(event)">
        <div class="form-group">
          <label class="form-label" for="reg-name">Full Name</label>
          <input class="form-input" type="text" id="reg-name" placeholder="Enter your full name" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-email">University Email</label>
          <input class="form-input" type="email" id="reg-email" placeholder="you@university.edu.ng" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-role">Role</label>
          <select class="form-input" id="reg-role" required onchange="Auth.onRoleChange()">
            <option value="">Select your role</option>
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
            <option value="senior-lecturer">Senior Lecturer</option>
            <option value="leadership">Leadership</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-dept">Department</label>
          <select class="form-input" id="reg-dept" required>
            <option value="">Select department</option>
            <option value="CSC">Computer Science</option>
            <option value="MTH">Mathematics</option>
            <option value="PHY">Physics</option>
            <option value="CHM">Chemistry</option>
          </select>
        </div>
        <div class="form-group" id="reg-level-group">
          <label class="form-label" for="reg-level">Level</label>
          <select class="form-input" id="reg-level">
            <option value="">Select level</option>
            <option value="100">100 Level</option>
            <option value="200">200 Level</option>
            <option value="300">300 Level</option>
            <option value="400">400 Level</option>
            <option value="500">500 Level</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-id">Matric / Staff ID</label>
          <input class="form-input" type="text" id="reg-id" placeholder="e.g. CSC/21/0042" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-password">Password</label>
          <input class="form-input" type="password" id="reg-password" placeholder="Create a password" required minlength="6">
        </div>
        <div id="register-error" class="form-error" style="margin-bottom:var(--sp-3);display:none"></div>
        <button type="submit" class="btn btn--primary btn--block btn--lg">Create Account</button>
      </form>
      <div class="auth-card__footer">
        Already have an account? <a href="#login" onclick="Auth.switchView('login');return false">Sign In</a>
      </div>
    `;
    onRoleChange();
  }

  function onRoleChange() {
    const role = document.getElementById('reg-role');
    const levelGroup = document.getElementById('reg-level-group');
    if (!role || !levelGroup) return;
    levelGroup.style.display = role.value === 'student' ? '' : 'none';
  }

  async function handleRegister(e) {
    e.preventDefault();
    UI.toast('Registration submitted! In a real system, your account would await verification by a senior lecturer.', 'success');
    setTimeout(() => switchView('verify'), 1500);
  }

  /* ───── Verify ───── */
  function renderVerify() {
    card.innerHTML = `
      <h1 class="auth-card__logo">UniConnect</h1>
      <p class="auth-card__subtitle">Verify your account</p>
      <div style="text-align:center;padding:var(--sp-4) 0">
        <div style="font-size:3rem;margin-bottom:var(--sp-4)">&#9993;</div>
        <p style="font-size:0.9375rem;margin-bottom:var(--sp-4)">
          A verification request has been sent. Your account will be activated once approved by your department's senior lecturer.
        </p>
        <p style="font-size:0.875rem;color:var(--c-text-muted);margin-bottom:var(--sp-6)">
          You will receive an email notification once your account is verified.
        </p>
        <a href="#login" class="btn btn--primary btn--block btn--lg" onclick="Auth.switchView('login');return false">Back to Sign In</a>
      </div>
    `;
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    switchView,
    handleLogin,
    handleRegister,
    fillDemo,
    onRoleChange,
  };
})();
