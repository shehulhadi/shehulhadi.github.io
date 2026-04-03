/* UniConnect — AI Helper (Students only) */

'use strict';

const AIHelper = (() => {
  const RESPONSES = {
    'search algorithm': 'Search algorithms explore a graph or tree structure to find a target node. Common types include:\n\n- **BFS (Breadth-First Search)**: Explores level by level. Uses a queue. Good for finding shortest path in unweighted graphs.\n- **DFS (Depth-First Search)**: Goes deep before backtracking. Uses a stack. Good for topological sorting and cycle detection.\n\nTime complexity for both: O(V + E) where V = vertices, E = edges.',
    'tcp handshake': 'The TCP three-way handshake establishes a reliable connection:\n\n1. **SYN**: Client sends a SYN packet to the server\n2. **SYN-ACK**: Server responds with SYN-ACK\n3. **ACK**: Client sends ACK to confirm\n\nAfter this, data transfer can begin. The handshake ensures both sides are ready and agree on sequence numbers.',
    'osi model': 'The OSI Model has 7 layers (bottom to top):\n\n1. **Physical** — Cables, signals\n2. **Data Link** — MAC addresses, switches\n3. **Network** — IP addresses, routers\n4. **Transport** — TCP/UDP, ports\n5. **Session** — Session management\n6. **Presentation** — Encryption, compression\n7. **Application** — HTTP, FTP, DNS\n\nRemember: "Please Do Not Throw Sausage Pizza Away"',
    'default': 'I can help you with course-related questions! Try asking about:\n\n- Search algorithms (BFS, DFS)\n- TCP handshake\n- OSI Model\n- Software engineering concepts\n- Database normalization\n\nI\'m a mock AI helper — in the full version, I\'ll use real AI to answer your questions about course materials.',
  };

  let chatHistory = [];

  async function init() {
    const user = App.getUser();
    const role = App.getRole();
    if (!user || !role) return;

    if (!Permissions.can(role, 'ai_helper')) {
      UI.renderAppShell('ai-helper');
      const content = document.getElementById('page-content');
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">${UI.icon('sparkle', 48)}</div>
          <div class="empty-state__title">AI Helper — Students Only</div>
          <div class="empty-state__text">The AI Helper is available for students only.</div>
        </div>
      `;
      return;
    }

    UI.renderAppShell('ai-helper');
    const content = document.getElementById('page-content');
    content.style.padding = '0';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.height = 'calc(100vh - var(--header-height))';

    content.innerHTML = `
      <div style="flex:1;overflow-y:auto;padding:var(--sp-4)" id="ai-messages">
        <div style="text-align:center;padding:var(--sp-8) var(--sp-4)">
          <div style="font-size:2.5rem;margin-bottom:var(--sp-3)">${UI.icon('sparkle', 48)}</div>
          <h2 style="font-family:var(--font-display);font-size:1.5rem;margin-bottom:var(--sp-2)">AI Helper</h2>
          <p style="color:var(--c-text-secondary);font-size:0.875rem;max-width:400px;margin:0 auto;margin-bottom:var(--sp-4)">
            Ask me anything about your courses. I can help explain concepts, solve problems, and prepare for exams.
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);justify-content:center">
            <button class="btn btn--secondary btn--sm" onclick="AIHelper.askSuggestion('Explain search algorithms')">Search algorithms</button>
            <button class="btn btn--secondary btn--sm" onclick="AIHelper.askSuggestion('What is the TCP handshake?')">TCP handshake</button>
            <button class="btn btn--secondary btn--sm" onclick="AIHelper.askSuggestion('Explain the OSI model')">OSI Model</button>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:var(--sp-2);padding:var(--sp-3) var(--sp-4);border-top:1px solid var(--c-border);background:var(--c-surface)">
        <input type="text" class="form-input" id="ai-input" placeholder="Ask a question..." onkeydown="if(event.key==='Enter')AIHelper.ask()">
        <button class="btn btn--primary btn--icon" onclick="AIHelper.ask()">${UI.icon('send', 18)}</button>
      </div>
    `;
  }

  function askSuggestion(text) {
    document.getElementById('ai-input').value = text;
    ask();
  }

  function ask() {
    const input = document.getElementById('ai-input');
    if (!input || !input.value.trim()) return;

    const question = input.value.trim();
    input.value = '';

    const messagesEl = document.getElementById('ai-messages');
    const welcomeEl = messagesEl.querySelector('[style*="text-align:center"]');
    if (welcomeEl) welcomeEl.remove();

    messagesEl.insertAdjacentHTML('beforeend', `
      <div style="display:flex;justify-content:flex-end;margin-bottom:var(--sp-3)">
        <div style="background:var(--c-accent,var(--c-primary));color:#fff;padding:var(--sp-2) var(--sp-3);border-radius:12px 12px 4px 12px;max-width:80%;font-size:0.875rem">${question}</div>
      </div>
    `);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    setTimeout(() => {
      const response = getResponse(question);
      messagesEl.insertAdjacentHTML('beforeend', `
        <div style="display:flex;gap:var(--sp-2);margin-bottom:var(--sp-3)">
          <div class="avatar avatar--sm" style="background:var(--c-gold);color:var(--c-primary-dark);flex-shrink:0">${UI.icon('sparkle', 14)}</div>
          <div style="background:var(--c-bg);padding:var(--sp-3);border-radius:4px 12px 12px 12px;max-width:80%;font-size:0.875rem;line-height:1.6">${formatResponse(response)}</div>
        </div>
      `);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 800);
  }

  function getResponse(question) {
    const q = question.toLowerCase();
    for (const [key, val] of Object.entries(RESPONSES)) {
      if (key !== 'default' && q.includes(key)) return val;
    }
    return RESPONSES['default'];
  }

  function formatResponse(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  document.addEventListener('DOMContentLoaded', init);

  return { init, ask, askSuggestion };
})();
