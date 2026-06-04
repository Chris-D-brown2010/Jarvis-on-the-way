// ============================================================
// AI BOS — Voice Engine
// Hands-free wake-word listening ("Jarvis") + spoken replies.
// Uses the browser's built-in Web Speech API (no API keys).
// ============================================================
const Voice = {
  // ---- Settings (saved in the browser) ----
  settings: JSON.parse(localStorage.getItem('aibos_voice') || 'null') || {
    enabled: false,        // hands-free wake-word mode on/off
    wakeWord: 'jarvis',    // what you say to wake it
    voiceGender: 'female', // preferred voice
    speakReplies: true,    // read answers out loud
    rate: 1.0,
    pitch: 1.05,
  },
  save() { localStorage.setItem('aibos_voice', JSON.stringify(this.settings)); },

  // ---- Internal state ----
  rec: null,
  listening: false,       // engine actively running
  awaitingCommand: false, // wake word heard, capturing the command
  speaking: false,
  chosenVoice: null,
  onStatus: null,         // UI callback(stateString, detail)
  onCommand: null,        // callback(commandText) -> Promise<replyText>
  _restartTimer: null,
  _commandTimer: null,
  _buffer: '',

  supported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition) && 'speechSynthesis' in window;
  },

  // ---------- Text-to-Speech ----------
  loadVoices() {
    const all = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    if (!all.length) return;
    const want = this.settings.voiceGender;
    const en = all.filter((v) => /en[-_]/i.test(v.lang) || /english/i.test(v.name));
    const pool = en.length ? en : all;
    const femaleHints = /(female|woman|samantha|victoria|zira|susan|karen|moira|tessa|fiona|google us english|aria|jenny|sonia)/i;
    const maleHints = /(male|man|david|daniel|alex|fred|mark|george|guy|rishi)/i;
    let pick = null;
    if (want === 'female') pick = pool.find((v) => femaleHints.test(v.name));
    else if (want === 'male') pick = pool.find((v) => maleHints.test(v.name));
    this.chosenVoice = pick || pool.find((v) => /google/i.test(v.name)) || pool[0] || all[0];
  },

  speak(text, onEnd) {
    if (!('speechSynthesis' in window) || !this.settings.speakReplies) { if (onEnd) onEnd(); return; }
    // Clean text for natural speech: drop markdown, emojis, bullets
    const clean = String(text)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/[#*_`>]/g, '')
      .replace(/[•▲▼·🚀📋📈📝💬🔐⭐🌐🧠🎯📄🔔🚩😊😐😞✉️📰⚡✅⚠️🚨💡]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (!clean) { if (onEnd) onEnd(); return; }

    // Pause listening while we talk so it doesn't hear itself
    this.speaking = true;
    this._pauseRecognition();
    try { window.speechSynthesis.cancel(); } catch (e) {}
    const u = new SpeechSynthesisUtterance(clean);
    if (this.chosenVoice) u.voice = this.chosenVoice;
    u.rate = this.settings.rate; u.pitch = this.settings.pitch; u.lang = (this.chosenVoice && this.chosenVoice.lang) || 'en-US';
    u.onend = () => {
      this.speaking = false;
      if (onEnd) onEnd();
      // resume hands-free listening after speaking
      if (this.settings.enabled) this._resumeRecognition();
    };
    u.onerror = () => { this.speaking = false; if (onEnd) onEnd(); if (this.settings.enabled) this._resumeRecognition(); };
    window.speechSynthesis.speak(u);
  },

  stopSpeaking() { try { window.speechSynthesis.cancel(); } catch (e) {} this.speaking = false; },

  // ---------- Speech Recognition (continuous) ----------
  _build() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t; else interim += t;
      }
      const heard = (final || interim).toLowerCase().trim();
      if (!heard) return;

      if (!this.awaitingCommand) {
        // Listening for the wake word
        const ww = this.settings.wakeWord.toLowerCase();
        if (heard.includes(ww)) {
          // Did they say the command in the same breath? e.g. "jarvis, market summary"
          const after = heard.split(ww).pop().replace(/^[\s,.:;-]+/, '').trim();
          this._wake(after && after.length > 2 ? after : '');
        } else {
          this._status('listening', 'Say "' + this.cap(this.settings.wakeWord) + '" to wake me');
        }
      } else {
        // Capturing the command after wake word
        this._buffer = (final || interim).trim();
        this._status('capturing', this._buffer || 'Listening for your command…');
        if (final) {
          // Got a final command — run it
          clearTimeout(this._commandTimer);
          this._runCommand(this._buffer);
        } else {
          // Reset the silence timer while interim text keeps coming
          clearTimeout(this._commandTimer);
          this._commandTimer = setTimeout(() => {
            if (this._buffer) this._runCommand(this._buffer);
            else this._endCommandWindow();
          }, 1800);
        }
      }
    };

    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        this.stop();
        this._status('error', 'Microphone permission denied. Allow mic access and try again.');
        return;
      }
      // 'no-speech' / 'aborted' / 'network' -> just let onend restart it
    };

    rec.onend = () => {
      // Browser stops recognition periodically; auto-restart while enabled & not speaking
      if (this.settings.enabled && !this.speaking) {
        clearTimeout(this._restartTimer);
        this._restartTimer = setTimeout(() => { try { rec.start(); } catch (e) {} }, 300);
      }
    };

    return rec;
  },

  _wake(commandSaidNow) {
    this.awaitingCommand = true;
    this._buffer = '';
    this._beep();
    this._status('awake', 'Yes? I\'m listening…');
    if (commandSaidNow) {
      this._buffer = commandSaidNow;
      // small delay to let the rest of the phrase finalize
      clearTimeout(this._commandTimer);
      this._commandTimer = setTimeout(() => this._runCommand(this._buffer), 1200);
    } else {
      // wait for the command, with a timeout if nothing comes
      clearTimeout(this._commandTimer);
      this._commandTimer = setTimeout(() => this._endCommandWindow(), 6000);
    }
  },

  async _runCommand(text) {
    clearTimeout(this._commandTimer);
    const cmd = (text || '').trim();
    this.awaitingCommand = false;
    this._buffer = '';
    if (!cmd) { this._endCommandWindow(); return; }
    this._status('thinking', cmd);
    try {
      const reply = this.onCommand ? await this.onCommand(cmd) : '';
      this._status('speaking', reply || '');
      this.speak(reply || 'Done.', () => {
        this._status('listening', 'Say "' + this.cap(this.settings.wakeWord) + '" to wake me');
      });
    } catch (err) {
      const msg = 'Sorry, I hit an error processing that.';
      this.speak(msg);
      this._status('listening', 'Say "' + this.cap(this.settings.wakeWord) + '" to wake me');
    }
  },

  _endCommandWindow() {
    this.awaitingCommand = false; this._buffer = '';
    this._status('listening', 'Say "' + this.cap(this.settings.wakeWord) + '" to wake me');
  },

  _pauseRecognition() { try { if (this.rec) this.rec.abort(); } catch (e) {} },
  _resumeRecognition() {
    if (!this.settings.enabled) return;
    clearTimeout(this._restartTimer);
    this._restartTimer = setTimeout(() => { try { this.rec && this.rec.start(); } catch (e) {} }, 300);
  },

  // ---------- Public controls ----------
  start() {
    if (!this.supported()) { this._status('error', 'Voice not supported in this browser. Use Chrome.'); return false; }
    this.settings.enabled = true; this.save();
    this.loadVoices();
    if (!this.rec) this.rec = this._build();
    this.listening = true;
    this.awaitingCommand = false;
    try { this.rec.start(); } catch (e) {}
    this._status('listening', 'Say "' + this.cap(this.settings.wakeWord) + '" to wake me');
    // friendly greeting
    this.speak(`Voice mode on. Say ${this.settings.wakeWord} anytime to give me a command.`);
    return true;
  },

  stop() {
    this.settings.enabled = false; this.save();
    this.listening = false; this.awaitingCommand = false;
    clearTimeout(this._restartTimer); clearTimeout(this._commandTimer);
    try { this.rec && this.rec.abort(); } catch (e) {}
    this.stopSpeaking();
    this._status('off', 'Voice mode off');
  },

  toggle() { return this.settings.enabled ? (this.stop(), false) : this.start(); },

  // One-shot push-to-talk (used by the mic button in chat)
  listenOnce(onResult) {
    if (!this.supported()) { toast('Voice not supported. Use Chrome.', 'error'); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR(); r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 1;
    r.onresult = (e) => onResult(e.results[0][0].transcript);
    r.onerror = () => toast('Could not hear you. Try again.', 'error');
    try { r.start(); } catch (e) {}
    return r;
  },

  // ---------- Helpers ----------
  _status(state, detail) { if (this.onStatus) this.onStatus(state, detail); },
  cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); },
  _beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880; o.type = 'sine';
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      o.start(); o.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  },
};

// Load voices when they become available (some browsers load async)
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => Voice.loadVoices();
  Voice.loadVoices();
}
