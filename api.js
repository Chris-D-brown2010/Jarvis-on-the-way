// ============================================================
// AI BOS — API client + small helpers
// ============================================================
const API = {
  token: localStorage.getItem('aibos_token') || null,
  user: JSON.parse(localStorage.getItem('aibos_user') || 'null'),

  setAuth(token, user) {
    this.token = token; this.user = user;
    localStorage.setItem('aibos_token', token);
    localStorage.setItem('aibos_user', JSON.stringify(user));
  },
  clearAuth() {
    this.token = null; this.user = null;
    localStorage.removeItem('aibos_token');
    localStorage.removeItem('aibos_user');
  },

  async req(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers.Authorization = 'Bearer ' + this.token;
    const res = await fetch('/api' + path, {
      method, headers, body: body ? JSON.stringify(body) : undefined,
    });
    let data = {};
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  },
  get(p) { return this.req('GET', p); },
  post(p, b) { return this.req('POST', p, b); },
  patch(p, b) { return this.req('PATCH', p, b); },
  del(p) { return this.req('DELETE', p); },
};

// ---------- DOM helpers ----------
function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return [...root.querySelectorAll(sel)]; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
// markdown-ish: **bold** and newlines (used inside already-escaped text)
function mdBold(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }

function toast(msg, type = '') {
  const t = el(`<div class="toast ${type}">${type === 'success' ? '✅' : type === 'error' ? '⚠️' : '💬'} <span>${esc(msg)}</span></div>`);
  $('#toastWrap').appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3200);
}

function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T') + (iso.includes('Z') ? '' : 'Z'));
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

function openModal(html) {
  $('#modalBox').innerHTML = html;
  $('#modalBack').classList.add('open');
}
function closeModal() { $('#modalBack').classList.remove('open'); }
$('#modalBack')?.addEventListener('click', (e) => { if (e.target.id === 'modalBack') closeModal(); });
