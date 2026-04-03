/* UniConnect — App Core */
/* Router, state management, role detection */

'use strict';

const App = (() => {
  let currentUser = null;

  function init() {
    const stored = sessionStorage.getItem('uc_user');
    if (stored) {
      try {
        currentUser = JSON.parse(stored);
      } catch (e) {
        currentUser = null;
      }
    }

    if (currentUser) {
      document.body.dataset.role = currentUser.role;
    }

    const page = getPageName();
    if (!currentUser && page !== 'auth' && page !== 'index') {
      window.location.href = 'auth.html';
      return;
    }
    if (currentUser && (page === 'auth' || page === 'index')) {
      window.location.href = 'dashboard.html';
      return;
    }
  }

  function getPageName() {
    const path = window.location.pathname;
    const file = path.split('/').pop() || 'index.html';
    return file.replace('.html', '') || 'index';
  }

  function getRole() {
    return currentUser ? currentUser.role : null;
  }

  function getUser() {
    return currentUser;
  }

  function setUser(user) {
    currentUser = user;
    sessionStorage.setItem('uc_user', JSON.stringify(user));
    document.body.dataset.role = user.role;
  }

  function logout() {
    currentUser = null;
    sessionStorage.removeItem('uc_user');
    window.location.href = 'auth.html';
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  }

  function formatDateTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NG', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  }

  function isOverdue(dateStr) {
    return new Date(dateStr) < new Date();
  }

  function daysUntil(dateStr) {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / 86400000);
  }

  return {
    init,
    getPageName,
    getRole,
    getUser,
    setUser,
    logout,
    formatDate,
    formatDateTime,
    formatTime,
    isOverdue,
    daysUntil,
  };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
