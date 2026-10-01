/* =====================================================================
   utils.js — funcții ajutătoare folosite peste tot în joc
   ===================================================================== */
(function (global) {
  'use strict';

  /* ---------- generator de numere aleatoare cu sămânță (mulberry32) ---- */
  function makeRng(seed) {
    var s = seed >>> 0;
    function rnd() {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    rnd.int = function (min, max) { return Math.floor(rnd() * (max - min + 1)) + min; };
    rnd.pick = function (arr) { return arr[Math.floor(rnd() * arr.length)]; };
    rnd.chance = function (p) { return rnd() < p; };
    rnd.shuffle = function (arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(rnd() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    };
    rnd.sample = function (arr, n) { return rnd.shuffle(arr).slice(0, n); };
    return rnd;
  }

  /* cod de 5 caractere <-> sămânță numerică, pentru camerele aleatorii */
  var ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function seedToCode(seed) {
    var s = seed >>> 0, out = '';
    for (var i = 0; i < 5; i++) { out = ALPH[s % ALPH.length] + out; s = Math.floor(s / ALPH.length); }
    return out;
  }
  function codeToSeed(code) {
    var s = 0, c = String(code).toUpperCase();
    for (var i = 0; i < c.length; i++) {
      var idx = ALPH.indexOf(c[i]);
      if (idx < 0) idx = 0;
      s = s * ALPH.length + idx;
    }
    return s >>> 0;
  }

  /* ---------- DOM ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function on(node, evt, fn, opts) { if (node) node.addEventListener(evt, fn, opts); }

  /* ---------- text ---------- */
  var ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  ESC_MAP[String.fromCharCode(39)] = '&#39;';
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; });
  }
  /* normalizare pentru comparat răspunsuri scrise: fără diacritice, minuscule */
  function norm(s) {
    return String(s)
      .toLowerCase()
      .replace(/[ăâàá]/g, 'a').replace(/[îí]/g, 'i')
      .replace(/[șş]/g, 's').replace(/[țţ]/g, 't')
      .replace(/[éè]/g, 'e').replace(/[óò]/g, 'o').replace(/[úù]/g, 'u')
      .replace(/[^a-z0-9]/g, '');
  }
  function fmtTime(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  /* ---------- confetti ----------
     Atentie: contextul e scalat cu devicePixelRatio, iar la zoom sub 100%
     dpr este subunitar. De aceea stergerea se face MEREU cu transformarea
     resetata la identitate, altfel raman urme pe marginea din dreapta/jos. */
  var cf = { parts: [], raf: 0, killer: 0, canvas: null, ctx: null, dpr: 1, t0: 0 };
  var CF_MAX = 320;
  var CF_LIFE = 2600;   /* cat traieste maxim un jet de confetti (ms) */

  function cfContext() {
    if (!cf.canvas) {
      cf.canvas = document.getElementById('confetti');
      if (!cf.canvas) return null;
      cf.ctx = cf.canvas.getContext('2d');
    }
    var dpr = Math.min(Math.max(window.devicePixelRatio || 1, 0.5), 2);
    var w = Math.round(window.innerWidth * dpr);
    var h = Math.round(window.innerHeight * dpr);
    if (cf.canvas.width !== w || cf.canvas.height !== h) {
      cf.canvas.width = w; cf.canvas.height = h;
    }
    cf.dpr = dpr;
    return cf.ctx;
  }
  function cfWipe() {
    if (!cf.ctx || !cf.canvas) return;
    cf.ctx.setTransform(1, 0, 0, 1, 0, 0);
    cf.ctx.globalAlpha = 1;
    cf.ctx.clearRect(0, 0, cf.canvas.width, cf.canvas.height);
  }
  /* oprire imediata: la schimbarea ecranului sau la inchiderea unei ferestre */
  function confettiClear() {
    cf.parts.length = 0;
    if (cf.raf) { cancelAnimationFrame(cf.raf); cf.raf = 0; }
    if (cf.killer) { clearTimeout(cf.killer); cf.killer = 0; }
    cfWipe();
  }
  function confettiBurst(count, opts) {
    opts = opts || {};
    var ctx = cfContext();
    if (!ctx) return;
    var colors = ['#fbbf24', '#f472b6', '#38bdf8', '#4ade80', '#a78bfa', '#fb7185', '#fde68a'];
    var cx = opts.x != null ? opts.x : window.innerWidth / 2;
    var cy = opts.y != null ? opts.y : window.innerHeight * 0.42;
    var n = Math.min(count || 90, CF_MAX - cf.parts.length);
    for (var i = 0; i < n; i++) {
      var ang = Math.random() * Math.PI * 2;
      var spd = 4 + Math.random() * 11;
      cf.parts.push({
        x: cx, y: cy,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 5,
        g: 0.24 + Math.random() * 0.16,
        w: 6 + Math.random() * 8, h: 8 + Math.random() * 10,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.35,
        col: colors[(Math.random() * colors.length) | 0],
        life: 70 + Math.random() * 45
      });
    }
    /* Plasa de siguranță: dacă browserul suspendă animația (fereastră în
       fundal, filă inactivă), ultimul cadru ar rămâne desenat pe ecran.
       Ceasul de mai jos golește pânza oricum, imediat ce fila revine. */
    if (cf.killer) clearTimeout(cf.killer);
    cf.killer = setTimeout(confettiClear, CF_LIFE + 500);
    cf.deadline = Date.now() + CF_LIFE;
    if (!cf.raf) { cf.t0 = 0; cf.raf = requestAnimationFrame(tickConfetti); }
  }
  function tickConfetti(now) {
    cf.raf = 0;
    var ctx = cf.ctx;
    if (!ctx) return;
    /* pas normalizat la 60 de cadre pe secundă, ca animația să dureze la fel
       și pe un ecran de 120 Hz și pe unul lent */
    var step = 1;
    if (cf.t0 && now) step = Math.min(3, Math.max(0.4, (now - cf.t0) / 16.7));
    cf.t0 = now || 0;
    if (Date.now() > cf.deadline) { confettiClear(); return; }
    cfWipe();
    ctx.setTransform(cf.dpr, 0, 0, cf.dpr, 0, 0);
    for (var i = cf.parts.length - 1; i >= 0; i--) {
      var p = cf.parts[i];
      p.vy += p.g * step; p.x += p.vx * step; p.y += p.vy * step;
      p.vx *= 0.992; p.rot += p.vr * step; p.life -= step;
      if (p.life <= 0 || p.y > window.innerHeight + 60) { cf.parts.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.col;
      ctx.globalAlpha = Math.min(1, p.life / 32);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (cf.parts.length) cf.raf = requestAnimationFrame(tickConfetti);
    else cfWipe();
  }
  if (global.addEventListener) {
    global.addEventListener('resize', function () { if (!cf.parts.length) confettiClear(); });
  }

  /* ---------- toast ---------- */
  var toastTimer = null;
  function toast(msg, ms) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, ms || 2600);
  }

  /* ---------- salvarea progresului (localStorage) ---------- */
  var KEY = 'evadarea-magica-v1';
  var Store = {
    data: null,
    useAccount: function (username) {
      if (!/^user(0[1-9]|1[0-9]|20)$/.test(username)) throw new Error('Cont invalid.');
      KEY = 'evadarea-magica-v1:' + username;
      this.data = null;
    },
    defaults: function () {
      return { name: '', level: 2, size: 4, muted: false, avatar: '🙂', rooms: {}, mystery: { plays: 0, stars: 0 } };
    },
    load: function () {
      if (this.data) return this.data;
      try {
        var raw = localStorage.getItem(KEY);
        var base = this.defaults();
        if (raw) {
          var parsed = JSON.parse(raw);
          for (var k in parsed) if (parsed.hasOwnProperty(k)) base[k] = parsed[k];
        }
        this.data = base;
      } catch (e) { this.data = this.defaults(); }
      if (!this.data.rooms) this.data.rooms = {};
      if (!this.data.mystery) this.data.mystery = { plays: 0, stars: 0 };
      return this.data;
    },
    save: function () {
      try { localStorage.setItem(KEY, JSON.stringify(this.load())); } catch (e) { /* mod privat */ }
    },
    set: function (k, v) { this.load()[k] = v; this.save(); },
    get: function (k) { return this.load()[k]; },
    roomResult: function (id) { return this.load().rooms[id] || null; },
    saveRoom: function (id, stars, seconds) {
      var d = this.load();
      var prev = d.rooms[id];
      d.rooms[id] = {
        done: true,
        stars: Math.max(stars, prev ? prev.stars : 0),
        best: (prev && prev.best) ? Math.min(prev.best, seconds) : seconds,
        plays: (prev ? (prev.plays || 0) : 0) + 1
      };
      this.save();
      return d.rooms[id];
    },
    saveMystery: function (stars) {
      var d = this.load();
      d.mystery.plays = (d.mystery.plays || 0) + 1;
      d.mystery.stars = Math.min(3, Math.max(d.mystery.stars || 0, stars));
      this.save();
      return d.mystery;
    },
    doneCount: function () {
      var d = this.load(), n = 0;
      for (var k in d.rooms) if (d.rooms.hasOwnProperty(k) && d.rooms[k].done) n++;
      return n;
    },
    totalStars: function () {
      var d = this.load(), t = 0;
      for (var k in d.rooms) if (d.rooms.hasOwnProperty(k)) t += d.rooms[k].stars || 0;
      t += (d.mystery && d.mystery.stars) || 0;
      return t;
    },
    reset: function () {
      var d = this.load();
      var keep = { name: d.name, level: d.level, size: d.size, muted: d.muted, avatar: d.avatar };
      this.data = this.defaults();
      this.data.name = keep.name; this.data.level = keep.level; this.data.size = keep.size;
      this.data.muted = keep.muted; this.data.avatar = keep.avatar;
      this.save();
    }
  };

  global.U = {
    makeRng: makeRng, seedToCode: seedToCode, codeToSeed: codeToSeed,
    $: $, $$: $$, el: el, on: on,
    esc: esc, norm: norm, fmtTime: fmtTime,
    confettiBurst: confettiBurst, confettiClear: confettiClear,
    toast: toast, Store: Store
  };
})(window);
