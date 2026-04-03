/* UniConnect — Chat (channels + DMs) */

'use strict';

const Chat = (() => {
  let activeChannel = null;
  let activeType = 'channels'; // 'channels' or 'dms'
  let activeDM = null;

  async function init() {
    const user = App.getUser();
    const role = App.getRole();
    if (!user || !role) return;

    UI.renderAppShell('chat');
    const content = document.getElementById('page-content');
    if (!content) return;

    content.style.padding = '0';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.height = 'calc(100vh - var(--header-height))';

    await renderChat(content, user, role);
  }

  async function renderChat(el, user, role) {
    const channels = await Data.getChannels(role, user.deptCode, user.level);
    const dms = await Data.getDMs(user.id);

    el.innerHTML = `
      <div class="chat-layout">
        <div class="chat-sidebar" id="chat-sidebar">
          <div class="chat-sidebar__tabs">
            <button class="chat-tab chat-tab--active" id="tab-channels" onclick="Chat.switchTab('channels')">Channels</button>
            <button class="chat-tab" id="tab-dms" onclick="Chat.switchTab('dms')">DMs</button>
          </div>
          <div class="chat-sidebar__search">
            <input type="text" class="form-input" placeholder="Search..." style="font-size:0.8125rem;padding:6px 10px">
          </div>
          <div class="chat-sidebar__list" id="chat-list">
            ${renderChannelList(channels)}
          </div>
        </div>
        <div class="chat-main" id="chat-main">
          <div class="chat-empty">
            <div class="empty-state">
              <div class="empty-state__icon">${UI.icon('chat', 48)}</div>
              <div class="empty-state__title">Select a conversation</div>
              <div class="empty-state__text">Choose a channel or DM from the sidebar to start chatting.</div>
            </div>
          </div>
        </div>
      </div>
    `;

    addChatStyles();
  }

  function renderChannelList(channels) {
    return channels.map(ch => `
      <button class="chat-list-item" onclick="Chat.openChannel('${ch.id}','${ch.name}')">
        <span class="chat-list-item__icon">${UI.icon(ch.icon || 'hash', 16)}</span>
        <span class="chat-list-item__name">${ch.name}</span>
      </button>
    `).join('');
  }

  function renderDMList(dms) {
    if (dms.length === 0) {
      return '<p style="padding:12px;font-size:0.8125rem;color:var(--c-text-muted)">No conversations yet</p>';
    }
    return dms.map(dm => `
      <button class="chat-list-item" onclick="Chat.openDM('${dm.id}','${dm.otherUser ? dm.otherUser.name : 'Unknown'}')">
        <div class="avatar avatar--sm">${dm.otherUser ? dm.otherUser.avatar : '?'}</div>
        <div style="flex:1;min-width:0">
          <div class="chat-list-item__name">${dm.otherUser ? dm.otherUser.name : 'Unknown'}</div>
          <div style="font-size:0.75rem;color:var(--c-text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${dm.lastMessage}</div>
        </div>
        ${dm.unread ? `<span class="nav-item__badge">${dm.unread}</span>` : ''}
      </button>
    `).join('');
  }

  async function switchTab(tab) {
    activeType = tab;
    const user = App.getUser();
    const role = App.getRole();

    document.getElementById('tab-channels').classList.toggle('chat-tab--active', tab === 'channels');
    document.getElementById('tab-dms').classList.toggle('chat-tab--active', tab === 'dms');

    const list = document.getElementById('chat-list');
    if (tab === 'channels') {
      const channels = await Data.getChannels(role, user.deptCode, user.level);
      list.innerHTML = renderChannelList(channels);
    } else {
      const dms = await Data.getDMs(user.id);
      list.innerHTML = renderDMList(dms);
    }
  }

  async function openChannel(channelId, channelName) {
    activeChannel = channelId;
    activeDM = null;
    const messages = await Data.getMessages(channelId);
    renderMessages(channelName, messages, 'channel');
    highlightActive(channelId);
  }

  async function openDM(dmId, name) {
    activeDM = dmId;
    activeChannel = null;
    const messages = await Data.getDMMessages(dmId);
    renderMessages(name, messages, 'dm');
    highlightActive(dmId);
  }

  function highlightActive(id) {
    document.querySelectorAll('.chat-list-item').forEach(el => el.classList.remove('chat-list-item--active'));
    const items = document.querySelectorAll('.chat-list-item');
    items.forEach(item => {
      if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(id)) {
        item.classList.add('chat-list-item--active');
      }
    });
  }

  function renderMessages(title, messages, type) {
    const chatMain = document.getElementById('chat-main');
    const user = App.getUser();

    chatMain.innerHTML = `
      <div class="chat-header">
        <button class="btn--icon chat-back-btn" onclick="Chat.showSidebar()">${UI.icon('menu', 18)}</button>
        <h3 class="chat-header__title">${title}</h3>
        <div class="chat-header__actions">
          <button class="btn--icon" onclick="UI.toast('Search coming soon','info')">${UI.icon('search', 18)}</button>
        </div>
      </div>
      <div class="chat-messages" id="chat-messages">
        ${messages.length === 0 ? '<p style="text-align:center;padding:40px;color:var(--c-text-muted);font-size:0.875rem">No messages yet. Start the conversation!</p>' :
          messages.map(msg => {
            const isOwn = msg.userId === user.id;
            const userName = msg.user ? msg.user.name : 'Unknown';
            const userAvatar = msg.user ? msg.user.avatar : '?';
            const userRole = msg.user ? msg.user.role : '';
            return `
              <div class="chat-message ${isOwn ? 'chat-message--own' : ''} ${msg.type === 'notice' ? 'chat-message--notice' : ''}">
                ${!isOwn ? `<div class="avatar avatar--sm">${userAvatar}</div>` : ''}
                <div class="chat-message__content">
                  ${!isOwn ? `<div class="chat-message__author">
                    <span class="chat-message__name">${userName}</span>
                    <span class="badge badge--${userRole}" style="font-size:0.625rem">${userRole.replace('-', ' ')}</span>
                  </div>` : ''}
                  <div class="chat-message__bubble">${msg.body}</div>
                  <div class="chat-message__time">${App.formatDate(msg.createdAt)}</div>
                </div>
              </div>
            `;
          }).join('')}
      </div>
      <div class="chat-input">
        <input type="text" class="form-input" id="msg-input" placeholder="Type a message..." onkeydown="if(event.key==='Enter')Chat.sendMessage()">
        <button class="btn btn--primary btn--icon" onclick="Chat.sendMessage()">${UI.icon('send', 18)}</button>
      </div>
    `;

    const messagesEl = document.getElementById('chat-messages');
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function sendMessage() {
    const input = document.getElementById('msg-input');
    if (!input || !input.value.trim()) return;

    const user = App.getUser();
    const messagesEl = document.getElementById('chat-messages');

    const msgHTML = `
      <div class="chat-message chat-message--own">
        <div class="chat-message__content">
          <div class="chat-message__bubble">${input.value.trim()}</div>
          <div class="chat-message__time">Just now</div>
        </div>
      </div>
    `;

    const noMsgEl = messagesEl.querySelector('p');
    if (noMsgEl && noMsgEl.textContent.includes('No messages')) noMsgEl.remove();

    messagesEl.insertAdjacentHTML('beforeend', msgHTML);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    input.value = '';
  }

  function showSidebar() {
    const sidebar = document.getElementById('chat-sidebar');
    if (sidebar) sidebar.classList.toggle('chat-sidebar--mobile-open');
  }

  function addChatStyles() {
    if (document.getElementById('chat-styles')) return;
    const style = document.createElement('style');
    style.id = 'chat-styles';
    style.textContent = `
      .chat-layout {
        display: flex;
        height: 100%;
        overflow: hidden;
      }
      .chat-sidebar {
        width: 280px;
        border-right: 1px solid var(--c-border);
        background: var(--c-surface);
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
      }
      .chat-sidebar__tabs {
        display: flex;
        border-bottom: 1px solid var(--c-border);
      }
      .chat-tab {
        flex: 1;
        padding: 10px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--c-text-secondary);
        border-bottom: 2px solid transparent;
        text-align: center;
      }
      .chat-tab--active {
        color: var(--c-accent, var(--c-primary));
        border-bottom-color: var(--c-accent, var(--c-primary));
      }
      .chat-sidebar__search {
        padding: 8px;
      }
      .chat-sidebar__list {
        flex: 1;
        overflow-y: auto;
      }
      .chat-list-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        width: 100%;
        text-align: left;
        font-size: 0.875rem;
        color: var(--c-text-secondary);
        transition: background 0.15s;
        border: none;
        background: none;
        cursor: pointer;
      }
      .chat-list-item:hover { background: var(--c-bg); }
      .chat-list-item--active {
        background: var(--c-accent-light, var(--c-primary-light));
        color: var(--c-accent, var(--c-primary));
      }
      .chat-list-item__icon { flex-shrink: 0; }
      .chat-list-item__name { font-weight: 500; }
      .chat-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .chat-empty {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .chat-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        border-bottom: 1px solid var(--c-border);
        background: var(--c-surface);
      }
      .chat-header__title {
        flex: 1;
        font-family: var(--font-body);
        font-size: 0.9375rem;
        font-weight: 600;
      }
      .chat-back-btn { display: none; }
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .chat-message {
        display: flex;
        gap: 8px;
        max-width: 80%;
      }
      .chat-message--own {
        margin-left: auto;
        flex-direction: row-reverse;
      }
      .chat-message__content { min-width: 0; }
      .chat-message__author {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 2px;
      }
      .chat-message__name {
        font-size: 0.8125rem;
        font-weight: 600;
      }
      .chat-message__bubble {
        background: var(--c-bg);
        padding: 8px 12px;
        border-radius: 12px 12px 12px 4px;
        font-size: 0.875rem;
        line-height: 1.5;
        word-break: break-word;
      }
      .chat-message--own .chat-message__bubble {
        background: var(--c-accent, var(--c-primary));
        color: #fff;
        border-radius: 12px 12px 4px 12px;
      }
      .chat-message--notice .chat-message__bubble {
        background: var(--c-accent-light, var(--c-primary-light));
        border-left: 3px solid var(--c-accent, var(--c-primary));
        border-radius: 4px;
      }
      .chat-message__time {
        font-size: 0.6875rem;
        color: var(--c-text-muted);
        margin-top: 2px;
      }
      .chat-message--own .chat-message__time { text-align: right; }
      .chat-input {
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid var(--c-border);
        background: var(--c-surface);
      }
      .chat-input .form-input { flex: 1; }

      @media (max-width: 767px) {
        .chat-sidebar {
          position: fixed;
          left: 0;
          top: var(--header-height);
          bottom: 0;
          z-index: 80;
          transform: translateX(-100%);
          transition: transform 0.25s;
          width: 280px;
        }
        .chat-sidebar--mobile-open { transform: translateX(0); }
        .chat-back-btn { display: flex; }
      }
    `;
    document.head.appendChild(style);
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    init,
    switchTab,
    openChannel,
    openDM,
    sendMessage,
    showSidebar,
  };
})();
