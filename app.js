// ============================================================
// AI BOS — App shell, auth, router
// ============================================================
const NAV = [
  { group: 'Command Center', items: [
    { route: 'dashboard', label: 'Dashboard' },
    { route: 'assistant', label: 'Master AI' },
    { route: 'tasks', label: 'Tasks' },
  ]},
  { group: 'AI Co-workers', items: [
    { route: 'content', label: 'Content & Publishing' },
    { route: 'comms', label: 'Communication' },
    { route: 'market', label: 'Market & Stock' },
    { route: 'escrow', label: 'Escrow & Transactions' },
    { route: 'feedback', label: 'Customer Feedback' },
    { route: 'website', label: 'Website Management' },
    { route: 'bi', label: 'Business Intelligence' },
  ]},
  { group: 'System', items: [
    { route: 'security', label: 'Security & Privacy' },
  ]},
];

const TITLES = {
  dashboard: ['Business Command Center', 'Real-time overview of your operations'],
  assistant: ['Master AI Assistant', 'Your central AI executive — voice & chat'],
  tasks: ['Task Management', 'Coordinated across all AI co-workers'],
  content: ['Content & Publishing AI', 'Creates & schedules content for approval'],
  comms: ['Communication AI', 'Drafts emails, replies & support'],
  market: ['Market & Stock Analysis AI', 'Watchlists, alerts & financial news'],
  escrow: ['Escrow & Transaction AI', 'Payment monitoring & risk flagging'],
  feedback: ['Customer Feedback AI', 'Reviews & sentiment analysis'],
  website: ['Website Management AI', 'Performance, SEO & technical health'],
  bi: ['Business Intelligence AI', 'Reports, forecasts & strategy'],
  security: ['Security & Privacy', 'Access control, encryption & audit trails'],
};

let currentRoute = 'dashboard';

// ============================================================
// AUTH SCREENS
// ============================================================
function renderAuth(mode = 'login') {
  const root = document.getElementById('root');
  root.innerHTML = `
  <div class="auth-wrap"><div class="auth-card">
    <div class="auth-logo"><div class="badge">🧠</div><h1 class="gradient-text">AI BOS</h1></div>
    <div class="auth-sub">AI Business Operating System — your centralized AI executive command center.</div>
    <div id="authErr"></div>
    ${mode === 'register' ? `<div class="field"><label>Full Name</label><input id="aName" placeholder="Alex Morgan" /></div>
      <div class="field"><label>Company</label><input id="aCompany" placeholder="Nova Ventures" /></div>` : ''}
    <div class="field"><label>Email</label><input id="aEmail" type="email" placeholder="you@company.com" value="${mode === 'login' ? 'demo@aibos.app' : ''}" /></div>
    <div class="field"><label>Password</label><input id="aPass" type="password" placeholder="••••••••" value="${mode === 'login' ? 'demo1234' : ''}" /></div>
    <button class="btn btn-primary" id="authBtn" style="width:100%;justify-content:center;margin-top:6px">${mode === 'login' ? 'Sign In' : 'Create Account'}</button>
    <div class="auth-switch">${mode === 'login' ? `New here? <b id="switchMode">Create an account</b>` : `Have an account? <b id="switchMode">Sign in</b>`}</div>
    ${mode === 'login' ? `<div class="demo-hint">🔓 <b>Demo account</b> pre-filled. Just click Sign In to explore the full platform with sample data.</div>` : ''}
  </div></div>`;

  $('#switchMode').addEventListener('click', () => renderAuth(mode === 'login' ? 'register' : 'login'));
  const submit = async () => {
    const btn = $('#authBtn'); btn.disabled = true; btn.textContent = 'Please wait…';
    try {
      let r;
      if (mode === 'login') r = await API.post('/auth/login', { email: $('#aEmail').value, password: $('#aPass').value });
      else r = await API.post('/auth/register', { name: $('#aName').value, company: $('#aCompany').value, email: $('#aEmail').value, password: $('#aPass').value });
      API.setAuth(r.token, r.user);
      renderApp();
    } catch (e) {
      $('#authErr').innerHTML = `<div class="err-msg">${esc(e.message)}</div>`;
      btn.disabled = false; btn.textContent = mode === 'login' ? 'Sign In' : 'Create Account';
    }
  };
  $('#authBtn').addEventListener('click', submit);
  $('#aPass').addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
}

// ============================================================
// APP SHELL
// ============================================================
function renderApp() {
  const root = document.getElementById('root');
  const initials = (API.user.name || 'U').split(' ').map((x) => x[0]).slice(0, 2).join('');
  root.innerHTML = `
  <div class="app">
    <aside class="sidebar" id="sidebar">
      <div class="brand"><div class="badge">🧠</div><div><h2 class="gradient-text">AI BOS</h2><small>Command Center</small></div></div>
      <nav id="nav"></nav>
      <div class="sidebar-foot">
        <div class="user-chip" id="userChip">
          <div class="avatar">${esc(initials)}</div>
          <div class="meta"><b>${esc(API.user.name)}</b><span>${esc(API.user.company || API.user.role)}</span></div>
        </div>
      </div>
    </aside>
    <div class="main">
      <header class="topbar">
        <button class="menu-btn" id="menuBtn">☰</button>
        <div><div class="page-title" id="pageTitle">Dashboard</div><div class="page-sub" id="pageSub"></div></div>
        <div class="topbar-actions">
          <button class="icon-btn" id="voiceBtn" title="Hands-free voice mode">🎙️<span class="dot" id="voiceDot" style="display:none;background:var(--green)"></span></button>
          <button class="icon-btn" id="notifBtn">🔔<span class="dot" id="notifDot" style="display:none"></span></button>
          <button class="icon-btn hide-mobile" id="logoutBtn" title="Sign out">⏻</button>
        </div>
      </header>
      <main class="content" id="content"></main>
    </div>

    <!-- Floating hands-free voice orb -->
    <div class="voice-orb" id="voiceOrb" title="Voice assistant">
      <div class="vo-rings"><span></span><span></span><span></span></div>
      <div class="vo-core" id="voOrbCore">🎙️</div>
      <div class="vo-label" id="voOrbLabel">Voice off</div>
    </div>
  </div>`;

  // Build nav
  const nav = $('#nav');
  NAV.forEach((g) => {
    nav.appendChild(el(`<div class="nav-group-label">${g.group}</div>`));
    g.items.forEach((it) => {
      const item = el(`<div class="nav-item" data-route="${it.route}"><span class="ic">${ICONS[it.route]}</span> ${it.label}<span class="nav-badge" data-badge="${it.route}" style="display:none"></span></div>`);
      item.addEventListener('click', () => go(it.route));
      nav.appendChild(item);
    });
  });

  $('#menuBtn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $('#userChip').addEventListener('click', () => go('security'));
  $('#logoutBtn').addEventListener('click', () => { API.clearAuth(); renderAuth('login'); });
  $('#notifBtn').addEventListener('click', openNotifs);
  $('#overlay').addEventListener('click', closeNotifs);
  $('#markReadBtn').addEventListener('click', async () => { await API.post('/notifications/read-all'); loadNotifs(); });

  setupVoice();

  loadNotifs();
  go('dashboard');
}

// ============================================================
// ROUTER
// ============================================================
async function go(route) {
  currentRoute = route;
  if (window.innerWidth <= 760) $('#sidebar').classList.remove('open');
  $$('.nav-item').forEach((n) => n.classList.toggle('active', n.dataset.route === route));
  const [title, sub] = TITLES[route] || [route, ''];
  $('#pageTitle').textContent = title;
  $('#pageSub').textContent = sub;
  const content = $('#content');
  content.innerHTML = `<div class="empty"><div class="typing"><span></span><span></span><span></span></div><div class="mt8">Loading ${esc(title)}…</div></div>`;
  try {
    const view = await Views[route]();
    content.innerHTML = view.html;
    if (view.init) view.init(content, go, () => go(route));
    content.scrollTop = 0;
  } catch (e) {
    if (e.message && e.message.includes('token')) { API.clearAuth(); renderAuth('login'); return; }
    content.innerHTML = `<div class="err-msg">Failed to load: ${esc(e.message)}</div>`;
  }
}

// ============================================================
// NOTIFICATIONS
// ============================================================
async function loadNotifs() {
  try {
    const { items } = await API.get('/notifications');
    const unread = items.filter((n) => !n.read).length;
    $('#notifDot').style.display = unread ? 'block' : 'none';
    const icons = { alert: '🚨', warning: '⚠️', success: '✅', info: '💡' };
    const colors = { alert: 'rgba(248,113,113,.15)', warning: 'rgba(251,191,36,.15)', success: 'rgba(52,211,153,.15)', info: 'rgba(34,211,238,.15)' };
    $('#notifBody').innerHTML = items.length ? items.map((n) => `
      <div class="notif-item ${n.read ? '' : 'unread'}">
        <div class="ni-icon" style="background:${colors[n.level]}">${icons[n.level] || '💡'}</div>
        <div><b>${esc(n.title)}</b><p>${esc(n.body || '')}</p><small>${esc(n.module || '')} · ${timeAgo(n.created_at)}</small></div>
      </div>`).join('') : emptyState('No notifications', '🔔');
    // sidebar badges
    const counts = {};
    items.filter((n) => !n.read).forEach((n) => {
      const map = { 'Content & Publishing': 'content', 'Market & Stock': 'market', 'Escrow & Transactions': 'escrow', 'Website Management': 'website', 'Business Intelligence': 'bi' };
      const r = map[n.module]; if (r) counts[r] = (counts[r] || 0) + 1;
    });
    $$('[data-badge]').forEach((b) => { const c = counts[b.dataset.badge]; if (c) { b.textContent = c; b.style.display = 'grid'; } else b.style.display = 'none'; });
  } catch (e) {}
}
function openNotifs() { $('#notifDrawer').classList.add('open'); $('#overlay').classList.add('show'); }
function closeNotifs() { $('#notifDrawer').classList.remove('open'); $('#overlay').classList.remove('show'); }

// ============================================================
// VOICE ASSISTANT — hands-free wake word + spoken replies
// ============================================================
function setupVoice() {
  const orb = $('#voiceOrb');
  const core = $('#voOrbCore');
  const label = $('#voOrbLabel');
  const btn = $('#voiceBtn');
  const dot = $('#voiceDot');

  if (!Voice.supported()) {
    btn.title = 'Voice not supported (use Chrome)';
    label.textContent = 'Voice n/a';
    return;
  }

  // Update the orb + button whenever the engine changes state
  Voice.onStatus = (state, detail) => {
    orb.dataset.state = state;
    const map = {
      off: ['🎙️', 'Voice off'],
      listening: ['👂', `Listening for "${Voice.cap(Voice.settings.wakeWord)}"`],
      awake: ['✨', 'Yes? Listening…'],
      capturing: ['🎤', detail || 'Listening…'],
      thinking: ['🧠', 'Thinking…'],
      speaking: ['🔊', 'Speaking…'],
      error: ['⚠️', detail || 'Voice error'],
    };
    const [icon, text] = map[state] || ['🎙️', detail || ''];
    core.textContent = icon;
    label.textContent = text.length > 42 ? text.slice(0, 42) + '…' : text;
    const on = state !== 'off' && state !== 'error';
    orb.classList.toggle('active', on);
    dot.style.display = on ? 'block' : 'none';
    btn.classList.toggle('active-voice', on);
    if (state === 'error' && detail) toast(detail, 'error');
  };

  // The brain: turn a spoken command into an action + spoken reply
  Voice.onCommand = (cmd) => handleVoiceCommand(cmd);

  // Toggle from topbar button OR the orb
  const toggle = () => {
    const nowOn = Voice.toggle();
    if (nowOn) toast('🎙️ Voice mode ON — say "' + Voice.cap(Voice.settings.wakeWord) + '"', 'success');
    else toast('Voice mode off');
  };
  btn.addEventListener('click', toggle);
  orb.addEventListener('click', toggle);

  // Restore previous state (auto-resume if it was on)
  if (Voice.settings.enabled) {
    // browsers require a user gesture before mic/audio — wait for first click/tap
    Voice.settings.enabled = false; // will be turned on by the gesture
    const resume = () => {
      Voice.start();
      window.removeEventListener('pointerdown', resume);
    };
    window.addEventListener('pointerdown', resume, { once: true });
    Voice.onStatus('off', '');
    label.textContent = 'Tap to resume voice';
  } else {
    Voice.onStatus('off', '');
  }
}

// Map of spoken phrases -> app routes (so you can navigate by voice)
const VOICE_ROUTES = [
  { k: ['dashboard', 'home', 'overview', 'command center'], r: 'dashboard' },
  { k: ['task', 'to do', 'to-do'], r: 'tasks' },
  { k: ['content', 'publishing', 'post', 'social'], r: 'content' },
  { k: ['communication', 'message', 'email', 'inbox'], r: 'comms' },
  { k: ['market', 'stock', 'watchlist', 'invest'], r: 'market' },
  { k: ['escrow', 'transaction', 'payment', 'finance'], r: 'escrow' },
  { k: ['feedback', 'review', 'sentiment'], r: 'feedback' },
  { k: ['website', 'seo', 'traffic'], r: 'website' },
  { k: ['intelligence', 'report', 'forecast', 'strategy'], r: 'bi' },
  { k: ['security', 'privacy', 'audit'], r: 'security' },
  { k: ['assistant', 'master', 'chat'], r: 'assistant' },
];

async function handleVoiceCommand(cmd) {
  const t = cmd.toLowerCase().trim();

  // 1) Direct app controls
  if (/\b(stop|cancel|never mind|nevermind|quiet|shut up)\b/.test(t)) { Voice.stopSpeaking(); return 'Okay.'; }
  if (/\b(turn off|disable|stop) (voice|listening)\b/.test(t) || t === 'turn off voice') { setTimeout(() => Voice.stop(), 1500); return 'Turning voice off.'; }
  if (/\b(notification|alert)s?\b/.test(t) && /\b(show|open|read|any|what)\b/.test(t)) {
    openNotifs();
    try { const { items } = await API.get('/notifications'); const unread = items.filter((n) => !n.read);
      return unread.length ? `You have ${unread.length} unread notifications. Top one: ${unread[0].title}.` : 'You have no unread notifications.';
    } catch (e) { return 'Opening your notifications.'; }
  }
  if (/\b(log ?out|sign out)\b/.test(t)) { setTimeout(() => { API.clearAuth(); renderAuth('login'); }, 1500); return 'Signing you out.'; }

  // 2) Navigation: "open / go to / show me the <screen>"
  if (/\b(open|go to|show|navigate|take me to|switch to)\b/.test(t)) {
    for (const row of VOICE_ROUTES) {
      if (row.k.some((kw) => t.includes(kw))) {
        go(row.r);
        const [title] = TITLES[row.r] || [row.r];
        // If it's a co-worker screen, also give a quick spoken summary from the AI
        const moduleKeys = ['content', 'comms', 'market', 'escrow', 'feedback', 'website', 'bi'];
        if (moduleKeys.includes(row.r)) {
          try { const r = await API.post('/ai/module/' + row.r, { prompt: cmd }); return `Opening ${title}. ${r.summary}`; }
          catch (e) {}
        }
        return `Opening ${title}.`;
      }
    }
  }

  // 3) Everything else -> Master AI (it will route to the right co-worker)
  try {
    const r = await API.post('/ai/chat', { message: cmd });
    // If we're on the assistant screen, mirror the conversation visually
    if (currentRoute === 'assistant') { go('assistant'); }
    return r.text;
  } catch (e) {
    if (e.message && e.message.includes('token')) { API.clearAuth(); renderAuth('login'); return 'Please sign in again.'; }
    return 'Sorry, I could not reach the server.';
  }
}

// ============================================================
// BOOT
// ============================================================
(async function boot() {
  if (API.token) {
    try { await API.get('/auth/me'); renderApp(); }
    catch (e) { API.clearAuth(); renderAuth('login'); }
  } else {
    renderAuth('login');
  }
})();
