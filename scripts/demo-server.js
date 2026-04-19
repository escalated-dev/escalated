#!/usr/bin/env node
/**
 * Minimal demo server that serves a realistic Escalated UI mock for recording.
 * Used by the GitHub Action when no real backend is available.
 */
import { createServer } from 'http';

const PORT = process.env.PORT || 3000;

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Escalated — Support</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; color: #1e293b; }
    .layout { display: flex; height: 100vh; }
    .sidebar { width: 240px; background: #1e293b; color: #94a3b8; padding: 20px 0; flex-shrink: 0; }
    .sidebar .logo { padding: 0 20px 24px; font-size: 18px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.5px; }
    .sidebar .logo span { color: #6366f1; }
    .sidebar nav a { display: flex; align-items: center; gap: 10px; padding: 10px 20px; font-size: 14px; color: #94a3b8; text-decoration: none; cursor: pointer; transition: all 0.15s; }
    .sidebar nav a:hover, .sidebar nav a.active { background: rgba(99,102,241,0.15); color: #e2e8f0; }
    .sidebar nav a.active { border-left: 3px solid #6366f1; }
    .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .topbar { height: 60px; border-bottom: 1px solid #e2e8f0; background: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; }
    .topbar h1 { font-size: 16px; font-weight: 600; }
    .btn { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.15s; }
    .btn-primary { background: #6366f1; color: #fff; }
    .btn-primary:hover { background: #4f46e5; }
    .btn-secondary { background: #f1f5f9; color: #475569; }
    .content { flex: 1; padding: 24px; overflow-y: auto; }
    .ticket-list { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .ticket-row { display: flex; align-items: center; gap: 16px; padding: 14px 20px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.1s; }
    .ticket-row:hover { background: #f8fafc; }
    .ticket-row:last-child { border-bottom: none; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .badge-open { background: #dbeafe; color: #1d4ed8; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-resolved { background: #d1fae5; color: #065f46; }
    .ticket-subject { font-size: 14px; font-weight: 500; flex: 1; }
    .ticket-meta { font-size: 12px; color: #94a3b8; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; opacity: 0; transition: opacity 0.2s; pointer-events: none; }
    .modal-overlay.open { opacity: 1; pointer-events: all; }
    .modal { background: #fff; border-radius: 16px; padding: 28px; width: 540px; max-width: 90vw; box-shadow: 0 25px 50px rgba(0,0,0,0.15); transform: translateY(16px); transition: transform 0.2s; }
    .modal-overlay.open .modal { transform: translateY(0); }
    .modal h2 { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 500; color: #475569; margin-bottom: 6px; }
    .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.15s; }
    .form-group input:focus, .form-group textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
    .form-group textarea { resize: vertical; min-height: 100px; }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .thread { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; display: none; }
    .thread.visible { display: block; }
    .thread-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
    .thread-header h2 { font-size: 16px; font-weight: 600; }
    .thread-messages { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; min-height: 200px; }
    .message { display: flex; gap: 12px; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: #6366f1; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; flex-shrink: 0; }
    .avatar.customer { background: #e2e8f0; color: #475569; }
    .message-body { flex: 1; }
    .message-sender { font-size: 13px; font-weight: 600; color: #1e293b; }
    .message-time { font-size: 12px; color: #94a3b8; margin-left: 8px; }
    .message-text { font-size: 14px; color: #475569; margin-top: 4px; line-height: 1.6; }
    .reply-area { border-top: 1px solid #f1f5f9; padding: 16px 24px; }
    .reply-area textarea { width: 100%; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 14px; resize: none; outline: none; min-height: 80px; }
    .reply-area textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
    .reply-actions { display: flex; justify-content: flex-end; margin-top: 10px; }
    .notification { position: fixed; bottom: 24px; right: 24px; background: #1e293b; color: #f1f5f9; padding: 14px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.2); transform: translateY(80px); opacity: 0; transition: all 0.3s; z-index: 200; display: flex; align-items: center; gap: 10px; }
    .notification.show { transform: translateY(0); opacity: 1; }
    .notification .dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }
  </style>
</head>
<body>
  <div class="layout">
    <div class="sidebar">
      <div class="logo">esca<span>lated</span></div>
      <nav>
        <a class="active" onclick="showView('tickets')">📋 Tickets</a>
        <a onclick="showView('tickets')">💬 Conversations</a>
        <a onclick="showView('tickets')">📊 Reports</a>
        <a onclick="showView('tickets')">⚙️ Settings</a>
      </nav>
    </div>
    <div class="main">
      <div class="topbar">
        <h1>All Tickets</h1>
        <button class="btn btn-primary" onclick="openModal()" id="new-ticket-btn">+ New Ticket</button>
      </div>
      <div class="content">
        <div class="ticket-list" id="ticket-list">
          <div class="ticket-row" onclick="openThread('Billing not updated after plan upgrade', 'Sarah K.', 'open')">
            <div class="ticket-subject">Billing not updated after plan upgrade</div>
            <div class="ticket-meta">Sarah K. · 2h ago</div>
            <span class="badge badge-open">Open</span>
          </div>
          <div class="ticket-row" onclick="openThread('Export to CSV missing columns', 'James L.', 'pending')">
            <div class="ticket-subject">Export to CSV missing columns</div>
            <div class="ticket-meta">James L. · 5h ago</div>
            <span class="badge badge-pending">Pending</span>
          </div>
          <div class="ticket-row" onclick="openThread('Dark mode text contrast issues', 'Priya M.', 'open')">
            <div class="ticket-subject">Dark mode text contrast issues</div>
            <div class="ticket-meta">Priya M. · 1d ago</div>
            <span class="badge badge-open">Open</span>
          </div>
          <div class="ticket-row" onclick="openThread('API rate limits not documented', 'Tom R.', 'resolved')">
            <div class="ticket-subject">API rate limits not documented</div>
            <div class="ticket-meta">Tom R. · 2d ago</div>
            <span class="badge badge-resolved">Resolved</span>
          </div>
        </div>

        <div class="thread" id="thread-view">
          <div class="thread-header">
            <h2 id="thread-title"></h2>
            <span class="badge badge-open" style="margin-top:6px;display:inline-block" id="thread-badge"></span>
          </div>
          <div class="thread-messages" id="thread-messages"></div>
          <div class="reply-area">
            <textarea placeholder="Type a reply..." id="reply-box"></textarea>
            <div class="reply-actions">
              <button class="btn btn-primary" onclick="sendReply()">Send Reply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- New Ticket Modal -->
  <div class="modal-overlay" id="modal-overlay">
    <div class="modal">
      <h2>New Ticket</h2>
      <div class="form-group">
        <label for="subject">Subject</label>
        <input type="text" id="subject" placeholder="Brief description of the issue" />
      </div>
      <div class="form-group">
        <label for="requester">Requester</label>
        <input type="text" id="requester" placeholder="Customer name or email" />
      </div>
      <div class="form-group">
        <label for="priority">Priority</label>
        <select id="priority">
          <option>Normal</option>
          <option>High</option>
          <option>Low</option>
        </select>
      </div>
      <div class="form-group">
        <label for="body">Message</label>
        <textarea id="body" placeholder="Describe the issue in detail..."></textarea>
      </div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitTicket()">Create Ticket</button>
      </div>
    </div>
  </div>

  <!-- Notification -->
  <div class="notification" id="notification">
    <span class="dot"></span>
    <span id="notification-text">Ticket created successfully</span>
  </div>

  <script>
    function openModal() {
      document.getElementById('modal-overlay').classList.add('open');
    }
    function closeModal() {
      document.getElementById('modal-overlay').classList.remove('open');
    }
    function showView(view) {}
    function submitTicket() {
      const subject = document.getElementById('subject').value || 'New ticket';
      closeModal();
      const list = document.getElementById('ticket-list');
      const row = document.createElement('div');
      row.className = 'ticket-row';
      row.innerHTML = \`
        <div class="ticket-subject">\${subject}</div>
        <div class="ticket-meta">You · just now</div>
        <span class="badge badge-open">Open</span>
      \`;
      row.onclick = () => openThread(subject, 'You', 'open');
      list.insertBefore(row, list.firstChild);
      showNotification('Ticket created successfully');
      setTimeout(() => openThread(subject, 'You', 'open'), 600); // generate-demo.js pause(1400) must exceed this
    }
    function openThread(title, sender, status) {
      document.getElementById('ticket-list').style.display = 'none';
      const thread = document.getElementById('thread-view');
      thread.classList.add('visible');
      document.getElementById('thread-title').textContent = title;
      document.getElementById('thread-badge').textContent = status.charAt(0).toUpperCase() + status.slice(1);
      document.getElementById('thread-messages').innerHTML = \`
        <div class="message">
          <div class="avatar customer">\${sender[0]}</div>
          <div class="message-body">
            <span class="message-sender">\${sender}</span>
            <span class="message-time">2 minutes ago</span>
            <div class="message-text">Hi, I'm having an issue with \${title.toLowerCase()}. Could you help me resolve this?</div>
          </div>
        </div>
      \`;
      document.getElementById('reply-box').value = '';
    }
    function sendReply() {
      const text = document.getElementById('reply-box').value;
      if (!text.trim()) return;
      const msgs = document.getElementById('thread-messages');
      msgs.innerHTML += \`
        <div class="message">
          <div class="avatar">A</div>
          <div class="message-body">
            <span class="message-sender">Agent</span>
            <span class="message-time">just now</span>
            <div class="message-text">\${text}</div>
          </div>
        </div>
      \`;
      document.getElementById('reply-box').value = '';
      showNotification('Reply sent');
    }
    function showNotification(msg) {
      const el = document.getElementById('notification');
      document.getElementById('notification-text').textContent = msg;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 3000);
    }
  </script>
</body>
</html>`;

const server = createServer((req, res) => {
    if (req.url !== '/') {
        res.writeHead(204);
        res.end();
        return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
});

server.listen(PORT, () => {
    console.log(`[demo-server] Running at http://localhost:${PORT}`);
});
