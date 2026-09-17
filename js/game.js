/* =====================================================================
   game.js — motorul jocului: ecrane, camere, probe, lacăt, stele
   ===================================================================== */
(function (global) {
  'use strict';

  var U = global.U, S = global.Sound, P = global.Puzzles, R = global.Rooms, D = global.DATA;
  var $ = U.$, $$ = U.$$, on = U.on;
  var SVGNS = 'http://www.w3.org/2000/svg';

  /* ------------------------------- starea ------------------------------ */
  var G = {
    level: 2, size: 4, world: 0, name: '', room: null, puzzles: [], solved: [], digits: [],
    total: 4, ring: [], locks: 0, locksTotal: 1,
    hints: 0, wrong: 0, seconds: 0, timer: null, activeSlot: -1,
    input: null, usedQuestions: {}, opened: false, doorOpen: false
  };

  /* --------------------------- ajutoare SVG ---------------------------- */
  function svgEl(tag, attrs, text) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }

  /* ------------------------------ ecrane ------------------------------- */
  function showScreen(id) {
    U.confettiClear();
    $$('.screen').forEach(function (s) { s.classList.remove('is-active'); });
    var el = document.getElementById('screen-' + id);
    if (el) el.classList.add('is-active');
    window.scrollTo(0, 0);
  }

  /* ------------------------------- sunet ------------------------------- */
  function refreshMuteButtons() {
    var t = S.isMuted() ? '🔇' : '🔊';
    ['btn-mute', 'btn-mute2'].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) { b.textContent = t; b.setAttribute('aria-pressed', S.isMuted() ? 'true' : 'false'); }
    });
  }
  function toggleMute() {
    var m = S.toggle();
    U.Store.set('muted', m);
    refreshMuteButtons();
    if (!m) S.play('click');
    U.toast(m ? 'Sunet oprit 🔇' : 'Sunet pornit 🔊', 1500);
  }

  /* =============================== START =============================== */
  function initStart() {
    var d = U.Store.load();
    G.level = d.level || 2;
    G.name = d.name || '';
    $('#input-name').value = G.name;
    G.size = d.size || 4;
    G.world = Math.min(d.world || 0, R.worlds.length - 1);
    setLevel(G.level, true);
    setSize(G.size, true);
    $('#logo-art').innerHTML = logoSvg();

    $$('#level-grid .level-card').forEach(function (card) {
      on(card, 'click', function () { S.play('click'); setLevel(parseInt(card.dataset.level, 10)); });
    });
    $$('#size-grid .level-card').forEach(function (card) {
      on(card, 'click', function () { S.play('click'); setSize(parseInt(card.dataset.size, 10)); });
    });
    on($('#btn-start'), 'click', function () {
      S.unlockOnGesture();
      S.play('open');
      var nm = ($('#input-name').value || '').trim();
      G.name = nm || 'Explorator';
      U.Store.set('name', G.name);
      U.Store.set('level', G.level);
      U.Store.set('size', G.size);
      goToMap();
    });
    on($('#btn-how'), 'click', function () {
      var box = $('#how-box');
      box.hidden = !box.hidden;
      S.play('click');
      if (!box.hidden) box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    on($('#input-name'), 'keydown', function (e) { if (e.key === 'Enter') $('#btn-start').click(); });
  }
  function setLevel(lv, silent) {
    G.level = lv;
    $$('#level-grid .level-card').forEach(function (c) {
      c.setAttribute('aria-checked', parseInt(c.dataset.level, 10) === lv ? 'true' : 'false');
    });
    U.Store.set('level', lv);
    if (!silent) updateLevelChip();
  }
  function setSize(n, silent) {
    G.size = n;
    $$('#size-grid .level-card').forEach(function (c) {
      c.setAttribute('aria-checked', parseInt(c.dataset.size, 10) === n ? 'true' : 'false');
    });
    U.Store.set('size', n);
    if (!silent) updateSizeChip();
  }
  var LEVEL_NAME = { 1: 'Clasa I–II', 2: 'Clasa a III-a', 3: 'Clasa a IV-a' };
  function updateLevelChip() {
    var c = $('#btn-change-level');
    if (c) c.textContent = LEVEL_NAME[G.level] + ' ▾';
  }
  function updateSizeChip() {
    var c = $('#btn-change-size');
    if (c) c.textContent = G.size + ' probe ▾';
  }
  function logoSvg() {
    return '<svg viewBox="0 0 240 150" xmlns="' + SVGNS + '">' +
      '<defs><linearGradient id="lg-g" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#fde68a"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient>' +
      '<linearGradient id="lg-d" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0%" stop-color="#a78bfa"/><stop offset="100%" stop-color="#6d28d9"/></linearGradient></defs>' +
      '<ellipse cx="120" cy="132" rx="86" ry="12" fill="#000" opacity=".3"/>' +
      '<path d="M52 128 L52 44 q68 -50 136 0 L188 128 Z" fill="#4c1d95"/>' +
      '<path d="M60 122 L60 50 q60 -42 120 0 L180 122 Z" fill="url(#lg-d)"/>' +
      '<g stroke="#4c1d95" stroke-width="4" opacity=".55"><path d="M120 50 V122 M60 84 H180"/></g>' +
      '<circle cx="150" cy="88" r="9" fill="#fde68a"/>' +
      '<g class="twinkle"><path d="M96 74 l7 16 l16 7 l-16 7 l-7 16 l-7 -16 l-16 -7 l16 -7 Z" fill="url(#lg-g)"/></g>' +
      '<g class="floaty"><circle cx="46" cy="40" r="20" fill="none" stroke="url(#lg-g)" stroke-width="8"/>' +
      '<path d="M60 54 L88 82" stroke="url(#lg-g)" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="M78 72 l8 -8 M88 82 l9 -9" stroke="url(#lg-g)" stroke-width="7" stroke-linecap="round"/></g>' +
      '<g class="twinkle d2"><circle cx="204" cy="46" r="5" fill="#fde68a"/></g>' +
      '<g class="twinkle d1"><circle cx="30" cy="96" r="4" fill="#fde68a"/></g>' +
      '</svg>';
  }

  /* ================================ HARTA ============================== */
  function goToMap() {
    showScreen('map');
    renderMap();
  }
  function renderMap() {
    var d = U.Store.load();
    $('#map-name').textContent = G.name || d.name || 'Explorator';
    $('#map-avatar').textContent = d.avatar || '🙂';
    updateLevelChip();
    updateSizeChip();
    var total = U.Store.totalStars();
    $('#map-stars').textContent = total;
    var done = U.Store.doneCount();
    $('#map-progress-txt').innerHTML = done ? 'Ai terminat deja <b>' + done + '</b> din ' + R.list.length + ' camere.' : '';

    renderWorldTabs();
    var world = R.worlds[G.world] || R.worlds[0];
    $('#world-desc').textContent = world.emoji + ' ' + world.name + ' — ' + world.desc;
    var grid = $('#room-grid');
    grid.innerHTML = '';
    world.rooms.forEach(function (room) {
      grid.appendChild(roomCard(room, U.Store.roomResult(room.id)));
    });
    grid.appendChild(mysteryCard(d.mystery));
    refreshMuteButtons();
  }
  /* cele 10 lumi, ca butoane deasupra hărții; fiecare arată câte camere
     din ea sunt rezolvate */
  function worldDone(world) {
    var n = 0;
    world.rooms.forEach(function (r) { var res = U.Store.roomResult(r.id); if (res && res.done) n++; });
    return n;
  }
  function renderWorldTabs() {
    var wrap = $('#world-tabs');
    wrap.innerHTML = '';
    R.worlds.forEach(function (world, i) {
      var b = document.createElement('button');
      var n = worldDone(world);
      b.className = 'world-tab' + (i === G.world ? ' active' : '') + (n >= world.rooms.length ? ' complete' : '');
      b.setAttribute('aria-pressed', i === G.world ? 'true' : 'false');
      b.title = world.desc;
      b.innerHTML = '<span class="wt-emoji">' + world.emoji + '</span>' +
        '<span class="wt-name">' + world.name + '</span>' +
        '<span class="wt-count">' + n + '/' + world.rooms.length + '</span>';
      on(b, 'click', function () {
        if (G.world === i) return;
        S.play('click');
        G.world = i;
        U.Store.set('world', i);
        renderMap();
      });
      wrap.appendChild(b);
    });
    /* lumea activă rămâne la vedere și pe telefon, unde lista se derulează */
    var act = wrap.querySelector('.world-tab.active');
    if (act) wrap.scrollLeft = Math.max(0, act.offsetLeft - (wrap.clientWidth - act.offsetWidth) / 2);
  }
  /* miniaturile se desenează o singură dată și se refolosesc, ca revenirea
     pe hartă să fie instantanee */
  var thumbCache = {};
  function thumbHtml(theme) {
    if (thumbCache[theme]) return thumbCache[theme];
    var svg = global.Scenes[theme] ? global.Scenes[theme]() : '';
    /* miniaturile nu au nevoie de filtre grele și nici de interacțiune */
    thumbCache[theme] = svg
      .replace(/filter="url\(#soft2?_\d+\)"/g, '')
      .replace('class="scene"', 'class="scene thumb-svg"');
    return thumbCache[theme];
  }
  function starsHtml(n) {
    var s = '';
    for (var i = 0; i < 3; i++) s += '<span style="opacity:' + (i < n ? 1 : .3) + '">⭐</span>';
    return s;
  }
  function roomCard(room, res) {
    var b = document.createElement('button');
    b.className = 'room-card' + (res && res.done ? ' done' : '');
    b.setAttribute('aria-label', 'Camera ' + room.nr + ': ' + room.name);
    b.innerHTML =
      '<span class="thumb">' + thumbHtml(room.theme) + '</span>' +
      '<span class="veil"></span>' +
      '<span class="card-num">' + room.nr + '</span>' +
      '<span class="card-txt">' +
        '<span class="card-name">' + room.emoji + ' ' + room.name + '</span>' +
        '<span class="card-sub">' + room.sub + '</span>' +
        '<span class="card-stars">' + (res && res.done ? starsHtml(res.stars) + ' &nbsp;<small>' + U.fmtTime(res.best) + '</small>' : 'Neexplorată') + '</span>' +
      '</span>';
    on(b, 'click', function () { S.play('open'); openRoom(room); });
    return b;
  }
  function mysteryCard(m) {
    var b = document.createElement('button');
    b.className = 'room-card mystery';
    b.setAttribute('aria-label', 'Camera misterioasă, generată aleatoriu');
    /* miniatura arată, pe rând, unul dintre locurile care apar doar aici */
    var peek = R.mysteryThemes[Math.floor(Math.random() * R.mysteryThemes.length)];
    b.innerHTML =
      '<span class="thumb">' + thumbHtml(peek) + '</span>' +
      '<span class="veil"></span>' +
      '<span class="card-num">🎲</span>' +
      '<span class="card-txt">' +
        '<span class="card-name">🎲 Camera Misterioasă</span>' +
        '<span class="card-sub">' + R.mysteryRooms.length + ' locuri care apar doar aici — mereu altul</span>' +
        '<span class="card-stars">' + (m && m.plays ? starsHtml(m.stars) + ' &nbsp;<small>' + m.plays + ' încercări</small>' : 'Apasă ca să vezi ce iese!') + '</span>' +
      '</span>';
    on(b, 'click', function () {
      S.play('open');
      var seed = (Math.random() * 4294967295) >>> 0;
      openRoom(R.makeMystery(seed, G.level, G.size));
    });
    return b;
  }

  /* ============================ PORNIREA CAMEREI ======================= */
  function openRoom(room) {
    var i;
    G.room = room;
    if (room.world != null) { G.world = room.world; U.Store.set('world', G.world); }
    G.total = room.total || G.size || 4;
    G.locksTotal = Math.max(1, Math.round(G.total / 4));
    G.locks = 0;
    G.ring = [];
    G.solved = [];
    G.digits = [];
    for (i = 0; i < G.total; i++) G.solved.push(false);
    G.hints = 0; G.wrong = 0; G.seconds = 0;
    G.usedQuestions = {};
    G.doorOpen = false;
    G.activeSlot = -1;

    var seed = room.seed != null ? room.seed : ((Math.random() * 4294967295) >>> 0);
    var rnd = U.makeRng(seed);
    var types = room.types || R.pickTypes(room, rnd, G.level, G.total);
    G.puzzles = types.map(function (t) {
      return P.make(t, G.level, rnd, room.theme, G.usedQuestions);
    });
    for (i = 0; i < G.total; i++) G.digits.push(rnd.int(1, 9));

    $('#room-emoji').textContent = room.emoji;
    $('#room-name').textContent = room.name;
    $('#room-sub').textContent = room.sub;
    var NUM_RO = { 4: 'patru', 8: 'opt', 12: 'douăsprezece' };
    $('#story-strip').innerHTML = room.story.replace('{n}', NUM_RO[G.total] || G.total);
    $('#stage-inner').innerHTML = global.Scenes.build(room.theme, G.total);

    bindScene();
    paintCode();
    paintOverlay();
    showScreen('room');
    startTimer();
    refreshMuteButtons();
  }

  function bindScene() {
    var svg = $('#stage-inner svg');
    if (!svg) return;
    on($('#stage-inner'), 'pointerdown', function (e) {
      markActivity();
      var t = e.target;
      if (t && t.closest && t.closest('.hotspot, .door-group')) return;
      sparkleAt(e.clientX, e.clientY);
      S.play('hover');
    });
    $$('.hotspot', svg).forEach(function (h) {
      on(h, 'click', function () { onHotspot(h); });
      on(h, 'keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onHotspot(h); }
      });
    });
    var door = $('.door-group', svg);
    if (door) {
      on(door, 'click', tryDoor);
      on(door, 'keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tryDoor(); } });
    }
  }
  function onHotspot(h) {
    var slot = parseInt(h.dataset.slot, 10);
    if (G.solved[slot]) {
      S.play('click');
      U.toast('Ai rezolvat deja proba asta 😊');
      return;
    }
    if (G.ring.length >= 4 && !G.doorOpen) {
      S.play('wrong');
      U.toast('Ai deja 4 cifre — deschide întâi lacătul! 🔓');
      return;
    }
    S.play('open');
    openPuzzle(slot, h.getAttribute('aria-label') || '');
  }

  /* ---------------------- insigne, inele, bara de cod ------------------ */
  function paintOverlay() {
    var svg = $('#stage-inner svg');
    if (!svg) return;
    var ov = svg.querySelector('.overlay');
    if (!ov) return;
    while (ov.firstChild) ov.removeChild(ov.firstChild);

    $$('.hotspot', svg).forEach(function (h) {
      var slot = parseInt(h.dataset.slot, 10);
      var x = parseFloat(h.dataset.bx), y = parseFloat(h.dataset.by);
      if (G.solved[slot]) {
        h.classList.add('solved');
        var g = svgEl('g', { 'class': 'slot-badge' });
        g.appendChild(svgEl('circle', { 'class': 'disc', cx: x, cy: y, r: 23 }));
        g.appendChild(svgEl('text', { x: x, y: y + 10, 'font-size': 28 }, String(G.digits[slot])));
        ov.appendChild(g);
      }
      /* obiectele nerezolvate NU sunt marcate: copilul le caută singur.
         Butonul „🔍 Unde caut?” le arată câteva secunde, la cerere. */
    });

    var door = svg.querySelector('.door-group');
    var ready = G.ring.length === 4;
    if (door) door.classList.toggle('ready', ready && !G.doorOpen);
    var btn = $('#btn-door');
    btn.disabled = !ready || G.doorOpen;
    btn.textContent = G.doorOpen ? '✅ Ușa este deschisă'
      : (ready ? '🔓 Deschide lacătul!' : '🔒 Ușa e încuiată');
  }
  /* ---- descoperire: obiectele se caută, nu se arată ---- */
  var revealTimer = null;
  function revealHotspots(ms) {
    var svg = $('#stage-inner svg');
    if (!svg) return;
    var ov = svg.querySelector('.overlay');
    if (!ov) return;
    clearTimeout(revealTimer);
    dropRings(ov);
    $$('.hotspot', svg).forEach(function (h) {
      if (G.solved[parseInt(h.dataset.slot, 10)]) return;
      var x = parseFloat(h.dataset.bx), y = parseFloat(h.dataset.by);
      ov.appendChild(svgEl('circle', { 'class': 'pulse-ring reveal-ring', cx: x, cy: y, r: 24 }));
      ov.appendChild(svgEl('circle', { 'class': 'pulse-ring b reveal-ring', cx: x, cy: y, r: 24 }));
    });
    revealTimer = setTimeout(function () { dropRings(ov); }, ms || 3200);
  }
  function dropRings(ov) {
    $$('.reveal-ring', ov).forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
  }
  /* mică sclipire oriunde atinge copilul, ca scena să pară vie */
  function sparkleAt(clientX, clientY) {
    var host = $('#stage-inner');
    if (!host) return;
    var r = host.getBoundingClientRect();
    var sp = U.el('span', 'tap-spark');
    sp.style.left = (clientX - r.left) + 'px';
    sp.style.top = (clientY - r.top) + 'px';
    host.appendChild(sp);
    setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 640);
  }
  function markActivity() { G.lastAction = Date.now(); }

  /* Bara de jos arată cele 4 cifre ale lacătului la care lucrezi acum.
     O cameră lungă are mai multe lacăte, unul după altul. */
  function paintCode() {
    var w = $('#code-slots'), i, s;
    w.innerHTML = '';
    for (i = 0; i < 4; i++) {
      s = document.createElement('div');
      s.className = 'code-slot' + (i < G.ring.length ? ' filled' : '');
      s.innerHTML = i < G.ring.length ? String(G.ring[i]) : '<span class="q">?</span>';
      w.appendChild(s);
    }
    var lc = $('#lock-count');
    if (!lc) return;
    if (G.locksTotal > 1) {
      lc.innerHTML = '🔒 Lacătul <b>' + Math.min(G.locks + 1, G.locksTotal) + '</b> din <b>' + G.locksTotal +
        '</b> &nbsp;·&nbsp; probe rezolvate <b>' + G.solved.filter(Boolean).length + '</b>/' + G.total;
      lc.hidden = false;
    } else {
      lc.hidden = true;
    }
  }

  /* ------------------------------ cronometru --------------------------- */
  function startTimer() {
    stopTimer();
    $('#room-timer').textContent = '00:00';
    $('#room-hints').textContent = '0';
    G.lastAction = Date.now();
    G.timer = setInterval(function () {
      G.seconds++;
      $('#room-timer').textContent = U.fmtTime(G.seconds);
      /* dacă s-a blocat un minut, îi facem cu ochiul unde sunt obiectele */
      if (!G.doorOpen && $('#modal-layer').hidden && Date.now() - G.lastAction > 60000) {
        markActivity();
        revealHotspots(2600);
        U.toast('Ai rămas fără idei? Obiectele care ascund probe strălucesc acum ✨', 3200);
      }
    }, 1000);
  }
  function stopTimer() { if (G.timer) { clearInterval(G.timer); G.timer = null; } }

  /* =============================== PROBELE ============================= */
  var M = {};
  function cacheModal() {
    M.layer = $('#modal-layer'); M.box = $('#modal'); M.body = $('#modal-body');
    M.title = $('#modal-title'); M.kicker = $('#modal-kicker'); M.icon = $('#modal-icon');
    M.fb = $('#modal-feedback'); M.check = $('#btn-check'); M.hint = $('#btn-hint');
  }
  function openModal() {
    /* „shake” rămâne pe cutie după un răspuns greșit; dacă nu îl scoatem
       aici, la următoarea deschidere rulează iar clătinarea în loc de modalIn */
    M.box.classList.remove('shake');
    M.layer.hidden = false; document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    U.confettiClear();
    M.layer.hidden = true; document.body.style.overflow = '';
    G.activeSlot = -1; G.input = null; G.mode = null;
  }

  function openPuzzle(slot, objName) {
    markActivity();
    G.activeSlot = slot;
    G.mode = 'puzzle';
    G.hintStep = 0;
    var p = G.puzzles[slot];
    M.icon.textContent = p.icon || '🧩';
    M.title.textContent = p.title;
    M.kicker.textContent = objName ? objName + ' — ' + p.kicker : p.kicker;
    M.fb.textContent = ''; M.fb.className = 'modal-feedback';
    M.check.style.display = '';
    M.check.textContent = 'Verifică';
    M.hint.style.display = '';
    M.hint.disabled = false;
    M.hint.parentNode.classList.remove('solo');
    M.hint.textContent = '💡 Indiciu';
    renderPuzzle(p);
    openModal();
  }

  function renderPuzzle(p) {
    var h = '<p class="puzzle-prompt">' + p.prompt + '</p>';
    if (p.svg) h += '<div class="puzzle-visual">' + p.svg + '</div>';
    M.body.innerHTML = h;
    var box = document.createElement('div');
    M.body.appendChild(box);

    if (p.input === 'choice') renderChoice(p, box);
    else if (p.input === 'number') renderNumber(p, box);
    else if (p.input === 'letters') renderLetters(p, box);
    else if (p.input === 'order') renderOrder(p, box);
    else if (p.input === 'match') renderMatch(p, box);
    else if (p.input === 'dial') renderDial(p, box);
    else if (p.input === 'sliders') renderSliders(p, box);
    else if (p.input === 'weights') renderWeights(p, box);
  }

  /* --- variante --- */
  function renderChoice(p, box) {
    G.input = { kind: 'choice', value: null };
    var wrap = document.createElement('div');
    var longest = p.choices.reduce(function (a, c) { return Math.max(a, String(c).length); }, 0);
    wrap.className = 'choices' + (longest > 16 ? ' one-col' : '');
    p.choices.forEach(function (c, i) {
      var b = document.createElement('button');
      b.className = 'choice';
      b.innerHTML = '<span class="ci">' + 'ABCD'[i] + '</span><span>' + c + '</span>';
      on(b, 'click', function () {
        S.play('keypad');
        $$('.choice', wrap).forEach(function (x) { x.classList.remove('selected'); });
        b.classList.add('selected');
        G.input.value = c;
      });
      wrap.appendChild(b);
    });
    box.appendChild(wrap);
  }

  /* --- tastatură numerică --- */
  function renderNumber(p, box) {
    G.input = { kind: 'number', value: '' };
    var disp = document.createElement('div');
    disp.className = 'numpad-display empty';
    disp.textContent = '—';
    box.appendChild(disp);
    var pad = document.createElement('div');
    pad.className = 'numpad';
    var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];
    keys.forEach(function (k) {
      var b = document.createElement('button');
      b.className = 'numkey' + (k === 'C' ? ' wide del' : '') + (k === '⌫' ? ' wide del' : '');
      b.textContent = k;
      on(b, 'click', function () {
        S.play('keypad');
        if (k === 'C') G.input.value = '';
        else if (k === '⌫') G.input.value = G.input.value.slice(0, -1);
        else if (G.input.value.length < 6) G.input.value += k;
        disp.textContent = G.input.value || '—';
        disp.classList.toggle('empty', !G.input.value);
      });
      pad.appendChild(b);
    });
    box.appendChild(pad);
  }

  /* --- litere (anagrame, coduri) --- */
  function renderLetters(p, box) {
    G.input = { kind: 'letters', value: [] };
    var ans = document.createElement('div');
    ans.className = 'letters-answer';
    var pool = document.createElement('div');
    pool.className = 'letters-pool';
    box.appendChild(ans); box.appendChild(pool);

    function draw() {
      ans.innerHTML = '';
      if (!G.input.value.length) {
        ans.innerHTML = '<span class="ph">apasă literele de mai jos…</span>';
      } else {
        G.input.value.forEach(function (item, idx) {
          var t = document.createElement('button');
          t.className = 'letter-tile';
          t.textContent = item.ch;
          on(t, 'click', function () {
            S.play('keypad');
            G.input.value.splice(idx, 1);
            $$('.letters-pool .letter-tile', box)[item.i].classList.remove('used');
            draw();
          });
          ans.appendChild(t);
        });
      }
    }
    p.letters.forEach(function (ch, i) {
      var t = document.createElement('button');
      t.className = 'letter-tile';
      t.textContent = ch;
      on(t, 'click', function () {
        if (t.classList.contains('used')) return;
        S.play('keypad');
        t.classList.add('used');
        G.input.value.push({ ch: ch, i: i });
        draw();
      });
      pool.appendChild(t);
    });
    draw();
  }

  /* --- ordonare --- */
  function renderOrder(p, box) {
    G.input = { kind: 'order', value: [] };
    var note = document.createElement('p');
    note.className = 'order-hintline';
    note.textContent = p.orderHint || '';
    box.appendChild(note);
    var pool = document.createElement('div');
    pool.className = 'order-pool';
    box.appendChild(pool);

    function redraw() {
      $$('.order-item', pool).forEach(function (el) {
        var pos = G.input.value.indexOf(el.dataset.val);
        el.classList.toggle('picked', pos >= 0);
        var b = el.querySelector('.badge-n');
        if (pos >= 0) {
          if (!b) { b = document.createElement('span'); b.className = 'badge-n'; el.appendChild(b); }
          b.textContent = pos + 1;
        } else if (b) { el.removeChild(b); }
      });
    }
    p.items.forEach(function (v) {
      var b = document.createElement('button');
      b.className = 'order-item';
      b.dataset.val = v;
      b.appendChild(document.createTextNode(v));
      on(b, 'click', function () {
        S.play('keypad');
        var i = G.input.value.indexOf(v);
        if (i >= 0) G.input.value.splice(i, 1);
        else G.input.value.push(v);
        redraw();
      });
      pool.appendChild(b);
    });
  }

  /* --- potriviri --- */
  function renderMatch(p, box) {
    G.input = { kind: 'match', done: 0, pick: null };
    var grid = document.createElement('div');
    grid.className = 'match-grid';
    var cl = document.createElement('div'), cr = document.createElement('div');
    cl.className = 'match-col'; cr.className = 'match-col';
    grid.appendChild(cl); grid.appendChild(cr);
    box.appendChild(grid);

    function pairFor(left) {
      for (var i = 0; i < p.pairs.length; i++) if (p.pairs[i][0] === left) return p.pairs[i][1];
      return null;
    }
    p.left.forEach(function (v) {
      var b = document.createElement('button');
      b.className = 'match-item'; b.textContent = v; b.dataset.v = v;
      on(b, 'click', function () {
        if (b.classList.contains('locked')) return;
        S.play('keypad');
        $$('.match-item', cl).forEach(function (x) { x.classList.remove('picked'); });
        b.classList.add('picked');
        G.input.pick = b;
      });
      cl.appendChild(b);
    });
    p.right.forEach(function (v) {
      var b = document.createElement('button');
      b.className = 'match-item'; b.textContent = v; b.dataset.v = v;
      on(b, 'click', function () {
        if (b.classList.contains('locked')) return;
        if (!G.input.pick) { flash('Alege întâi ceva din coloana din stânga 👈', 'hint'); return; }
        var left = G.input.pick.dataset.v;
        if (pairFor(left) === v) {
          S.play('digit');
          G.input.pick.classList.remove('picked');
          G.input.pick.classList.add('locked');
          b.classList.add('locked');
          G.input.pick = null;
          G.input.done++;
          flash(G.input.done === 4 ? 'Toate perechile sunt gata! Apasă „Verifică”.' : 'Corect! Mai ai ' + (4 - G.input.done) + '.', 'ok');
        } else {
          S.play('wrong');
          b.classList.add('wrong');
          setTimeout(function () { b.classList.remove('wrong'); }, 500);
          flash('Nu se potrivesc. Mai încearcă!', 'bad');
        }
      });
      cr.appendChild(b);
    });
  }


  /* ------------------------- SEIFUL CU CIFRU --------------------------- */
  function renderDial(p, box) {
    G.input = { kind: 'dial', value: 0, step: 0, done: false, lastDir: 0 };
    var max = p.max, tick = 360 / max, C = 150, R = 118, i, a;

    var face = '';
    for (i = 0; i < max; i++) {
      a = -i * tick;
      var big = (max <= 12) || (i % 5 === 0);
      face += '<g transform="rotate(' + a.toFixed(2) + ' ' + C + ' ' + C + ')">' +
        '<line x1="' + C + '" y1="' + (C - R) + '" x2="' + C + '" y2="' + (C - R + (big ? 14 : 8)) +
        '" stroke="' + (big ? '#3b0764' : '#a78bfa') + '" stroke-width="' + (big ? 4 : 2.5) + '" stroke-linecap="round"/>' +
        (big ? '<text x="' + C + '" y="' + (C - R + 36) + '" text-anchor="middle" font-family="Fredoka, sans-serif" ' +
               'font-size="' + (max > 20 ? 16 : 20) + '" font-weight="600" fill="#3b0764">' + i + '</text>' : '') +
        '</g>';
    }
    box.innerHTML =
      '<div class="dial-wrap">' +
      '<ol class="dial-steps"></ol>' +
      '<svg class="dial-svg" viewBox="0 0 300 300" xmlns="' + SVGNS + '">' +
        '<defs><radialGradient id="dl-metal" cx="38%" cy="32%" r="72%">' +
        '<stop offset="0%" stop-color="#fdfbff"/><stop offset="55%" stop-color="#ddd6fe"/><stop offset="100%" stop-color="#8b5cf6"/></radialGradient></defs>' +
        '<circle cx="150" cy="150" r="140" fill="#4c1d95"/>' +
        '<circle cx="150" cy="150" r="132" fill="#ede9fe"/>' +
        '<g class="dial-face">' + face +
          '<circle cx="150" cy="150" r="68" fill="url(#dl-metal)" stroke="#7c3aed" stroke-width="5"/>' +
          '<g stroke="#7c3aed" stroke-width="6" stroke-linecap="round" opacity=".55">' +
          '<path d="M150 92 v18 M150 190 v18 M92 150 h18 M190 150 h18"/></g>' +
          '<circle cx="150" cy="150" r="24" fill="#7c3aed"/>' +
          '<circle cx="150" cy="150" r="11" fill="#ede9fe"/>' +
          '<path d="M150 126 v-14" stroke="#ede9fe" stroke-width="6" stroke-linecap="round"/>' +
        '</g>' +
        '<path d="M150 8 l16 30 h-32 Z" fill="#ef4444"/>' +
        '<circle cx="150" cy="150" r="140" fill="none" stroke="#3b0764" stroke-width="7"/>' +
      '</svg>' +
      '<div class="dial-readout"><span class="dial-num">0</span></div>' +
      '<div class="dial-btns">' +
        '<button class="dial-btn" data-d="-1" aria-label="Rotește la stânga">⟲<small>stânga</small></button>' +
        '<button class="dial-btn" data-d="1" aria-label="Rotește la dreapta">⟳<small>dreapta</small></button>' +
      '</div>' +
      '</div>';

    var faceEl = box.querySelector('.dial-face');
    var numEl = box.querySelector('.dial-num');
    var stepsEl = box.querySelector('.dial-steps');
    var svgEl2 = box.querySelector('.dial-svg');

    function drawSteps() {
      stepsEl.innerHTML = '';
      p.steps.forEach(function (st, idx) {
        var li = document.createElement('li');
        li.className = 'dial-step' + (idx < G.input.step ? ' ok' : (idx === G.input.step ? ' now' : ''));
        li.innerHTML = (idx < G.input.step ? '✅ ' : (idx === G.input.step ? '👉 ' : '⬜ ')) +
          (st.dir > 0 ? 'dreapta' : 'stânga') + ' până la <b>' + st.label + '</b>';
        stepsEl.appendChild(li);
      });
    }
    function paint() {
      faceEl.setAttribute('transform', 'rotate(' + (G.input.value * tick).toFixed(2) + ' 150 150)');
      numEl.textContent = G.input.value;
    }
    function nudge(d) {
      if (G.input.done) return;
      G.input.value = (G.input.value + d + max) % max;
      G.input.lastDir = d > 0 ? 1 : -1;
      paint();
      var st = p.steps[G.input.step];
      if (st && G.input.value === st.n && G.input.lastDir === st.dir) {
        G.input.step++;
        drawSteps();
        if (G.input.step >= p.steps.length) {
          G.input.done = true;
          S.play('unlock');
          flash('Toate opririle sunt corecte! Apasă „Verifică”.', 'ok');
        } else {
          S.play('digit');
          flash('Bine! Acum rotește ' + (p.steps[G.input.step].dir > 0 ? 'la dreapta' : 'la stânga') + '.', 'ok');
        }
      } else {
        S.play('keypad');
      }
    }
    /* butoane cu repetare la ținut apăsat */
    $$('.dial-btn', box).forEach(function (b) {
      var rep = null, del = null;
      var d = parseInt(b.dataset.d, 10);
      function start(e) {
        e.preventDefault();
        nudge(d);
        del = setTimeout(function () { rep = setInterval(function () { nudge(d); }, 110); }, 420);
      }
      function stop() { clearTimeout(del); clearInterval(rep); rep = null; }
      on(b, 'pointerdown', start);
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { on(b, ev, stop); });
    });
    /* rotire prin tragere directă de disc */
    var dragging = false, lastAng = 0, acc = 0;
    function angleAt(e) {
      var r = svgEl2.getBoundingClientRect();
      return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
    }
    on(svgEl2, 'pointerdown', function (e) {
      dragging = true; acc = 0; lastAng = angleAt(e);
      if (svgEl2.setPointerCapture) { try { svgEl2.setPointerCapture(e.pointerId); } catch (err) {} }
    });
    on(svgEl2, 'pointermove', function (e) {
      if (!dragging) return;
      var a2 = angleAt(e), d = a2 - lastAng;
      if (d > 180) d -= 360; else if (d < -180) d += 360;
      lastAng = a2; acc += d;
      while (Math.abs(acc) >= tick) {
        var dir = acc > 0 ? 1 : -1;
        acc -= dir * tick;
        nudge(dir);
      }
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      on(svgEl2, ev, function () { dragging = false; });
    });
    drawSteps();
    paint();
  }


  /* ------------------------ PANOUL CU MANETE --------------------------- */
  function renderSliders(p, box) {
    G.input = { kind: 'sliders', value: [0, 0, 0] };
    var html = '<div class="lever-panel">';
    p.levers.forEach(function (lv, i) {
      html +=
        '<div class="lever" data-i="' + i + '">' +
          '<button class="lever-pm" data-i="' + i + '" data-d="1" aria-label="mai mult">+</button>' +
          '<div class="lever-track" data-i="' + i + '">' +
            '<div class="lever-fill"></div>' +
            '<div class="lever-knob"><span>0</span></div>' +
          '</div>' +
          '<button class="lever-pm" data-i="' + i + '" data-d="-1" aria-label="mai puțin">−</button>' +
          '<div class="lever-label">' + lv.label + '</div>' +
        '</div>';
    });
    html += '</div>';
    box.innerHTML = html;

    function paint(i) {
      var el = box.querySelector('.lever[data-i="' + i + '"]');
      var track = el.querySelector('.lever-track');
      var knob = el.querySelector('.lever-knob');
      var v = G.input.value[i];
      var ratio = v / p.max;
      /* mânerul rămâne mereu întreg în interiorul canalului */
      var travel = Math.max(0, track.clientHeight - knob.offsetHeight);
      el.querySelector('.lever-fill').style.height = (ratio * 100) + '%';
      knob.style.bottom = (ratio * travel) + 'px';
      knob.querySelector('span').textContent = v;
      el.classList.toggle('done', v === p.levers[i].value);
    }
    function setVal(i, v) {
      v = Math.max(0, Math.min(p.max, Math.round(v)));
      if (v === G.input.value[i]) return;
      G.input.value[i] = v;
      paint(i);
      S.play('keypad');
      if (v === p.levers[i].value) S.play('digit');
    }
    $$('.lever-pm', box).forEach(function (b) {
      on(b, 'click', function () {
        var i = parseInt(b.dataset.i, 10);
        setVal(i, G.input.value[i] + parseInt(b.dataset.d, 10));
      });
    });
    $$('.lever-track', box).forEach(function (tr) {
      var i = parseInt(tr.dataset.i, 10), dragging = false;
      function fromEvent(e) {
        var r = tr.getBoundingClientRect();
        var ratio = 1 - (e.clientY - r.top) / r.height;
        setVal(i, ratio * p.max);
      }
      on(tr, 'pointerdown', function (e) {
        dragging = true; fromEvent(e);
        if (tr.setPointerCapture) { try { tr.setPointerCapture(e.pointerId); } catch (err) {} }
      });
      on(tr, 'pointermove', function (e) { if (dragging) fromEvent(e); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
        on(tr, ev, function () { dragging = false; });
      });
    });
    [0, 1, 2].forEach(paint);
  }

  /* ---------------------------- BALANȚA -------------------------------- */
  function renderWeights(p, box) {
    G.input = { kind: 'weights', value: [] };
    box.innerHTML =
      '<div class="scale-wrap">' +
      '<svg class="scale-svg" viewBox="0 0 420 220" xmlns="' + SVGNS + '">' +
        '<g class="scale-beam">' +
          '<rect x="60" y="52" width="300" height="12" rx="6" fill="#7c3aed"/>' +
          '<g class="pan-l"><path d="M110 58 L70 104 M110 58 L150 104" stroke="#a78bfa" stroke-width="4"/>' +
          '<path d="M60 104 h100 l-18 34 h-64 Z" fill="#c4b5fd" stroke="#6d28d9" stroke-width="3"/>' +
          '<text class="pan-l-txt" x="110" y="130" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="24" font-weight="600" fill="#3b0764">0</text></g>' +
          '<g class="pan-r"><path d="M310 58 L270 104 M310 58 L350 104" stroke="#a78bfa" stroke-width="4"/>' +
          '<path d="M260 104 h100 l-18 34 h-64 Z" fill="#fde68a" stroke="#b45309" stroke-width="3"/>' +
          '<text class="pan-r-txt" x="310" y="130" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="24" font-weight="600" fill="#78350f">0</text></g>' +
          '<circle cx="210" cy="58" r="11" fill="#5b21b6"/>' +
        '</g>' +
        '<path d="M196 62 L210 46 L224 62 L216 190 h-12 Z" fill="#6d28d9"/>' +
        '<path d="M150 190 h120 l14 22 h-148 Z" fill="#4c1d95"/>' +
      '</svg>' +
      '<p class="scale-state"></p>' +
      '<div class="weight-bank"></div>' +
      '<div class="weight-pan"></div>' +
      '</div>';

    var beam = box.querySelector('.scale-beam');
    var state = box.querySelector('.scale-state');
    var bank = box.querySelector('.weight-bank');
    var panEl = box.querySelector('.weight-pan');
    var lt = box.querySelector('.pan-l-txt'), rt = box.querySelector('.pan-r-txt');

    function total() {
      return G.input.value.reduce(function (a, b) { return a + b; }, 0);
    }
    function paint() {
      var t = total(), diff = t - p.target;
      /* talerul mai greu coboară: diferență pozitivă în dreapta = rotire în sensul acelor de ceas */
      var ang = Math.max(-14, Math.min(14, diff * 1.6));
      beam.setAttribute('transform', 'rotate(' + ang.toFixed(1) + ' 210 58)');
      lt.textContent = p.target; rt.textContent = t;
      state.textContent = diff === 0 ? '⚖️ Perfect echilibrată! Apasă „Verifică”.'
        : (diff < 0 ? 'Mai trebuie ' + (-diff) + ' kg în dreapta.' : 'Ai pus cu ' + diff + ' kg prea mult.');
      state.className = 'scale-state' + (diff === 0 ? ' ok' : '');
      panEl.innerHTML = '';
      if (!G.input.value.length) {
        panEl.innerHTML = '<span class="pan-empty">talerul este gol</span>';
      }
      G.input.value.forEach(function (w, idx) {
        var b = document.createElement('button');
        b.className = 'weight-chip on';
        b.innerHTML = w + '<small>kg</small>';
        on(b, 'click', function () {
          S.play('keypad');
          G.input.value.splice(idx, 1);
          paint();
        });
        panEl.appendChild(b);
      });
    }
    p.set.forEach(function (w) {
      var b = document.createElement('button');
      b.className = 'weight-chip';
      b.innerHTML = w + '<small>kg</small>';
      on(b, 'click', function () {
        if (G.input.value.length >= 12) { flash('Talerul e plin! Ia câteva greutăți jos.', 'hint'); return; }
        S.play('keypad');
        G.input.value.push(w);
        paint();
        if (total() === p.target) S.play('digit');
      });
      bank.appendChild(b);
    });
    paint();
  }

  function flash(msg, cls) {
    M.fb.textContent = msg;
    M.fb.className = 'modal-feedback ' + (cls || '');
  }

  /* --------------------------- verificarea ---------------------------- */
  function sameArray(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (String(a[i]) !== String(b[i])) return false;
    return true;
  }
  function checkPuzzle() {
    var p = G.puzzles[G.activeSlot], inp = G.input, ok = false;
    if (!inp) return;
    if (inp.kind === 'choice') {
      if (inp.value == null) { flash('Alege mai întâi un răspuns 🙂', 'hint'); return; }
      ok = U.norm(inp.value) === U.norm(p.answer);
    } else if (inp.kind === 'number') {
      if (!inp.value.length) { flash('Tastează răspunsul folosind cifrele 🙂', 'hint'); return; }
      ok = parseInt(inp.value, 10) === parseInt(p.answer, 10);
    } else if (inp.kind === 'letters') {
      var w = inp.value.map(function (x) { return x.ch; }).join('');
      if (!w.length) { flash('Apasă literele ca să formezi cuvântul 🙂', 'hint'); return; }
      ok = U.norm(w) === U.norm(p.answer);
    } else if (inp.kind === 'order') {
      if (inp.value.length < p.answer.length) { flash('Mai apasă ' + (p.answer.length - inp.value.length) + ' 🙂', 'hint'); return; }
      ok = sameArray(inp.value, p.answer);
    } else if (inp.kind === 'match') {
      ok = inp.done === 4;
      if (!ok) { flash('Mai ai ' + (4 - inp.done) + ' perechi de format.', 'hint'); return; }
    } else if (inp.kind === 'dial') {
      ok = inp.done;
      if (!ok) { flash('Mai ai de rotit — urmărește lista de sub disc 🔽', 'hint'); return; }
    } else if (inp.kind === 'sliders') {
      ok = sameArray(inp.value, p.answer);
    } else if (inp.kind === 'weights') {
      ok = inp.value.reduce(function (a, b) { return a + b; }, 0) === parseInt(p.answer, 10);
    }
    if (ok) onCorrect(p); else onWrong(p);
  }

  var BRAVO = ['Bravo! 🎉', 'Excelent! 🌟', 'Ai reușit! 💪', 'Perfect! ✨', 'Ce isteț ești! 🧠', 'Corect! 🎯'];
  function onCorrect(p) {
    S.play('correct');
    var slot = G.activeSlot;
    G.solved[slot] = true;
    G.ring.push(G.digits[slot]);
    var r = M.box.getBoundingClientRect();
    U.confettiBurst(70, { x: r.left + r.width / 2, y: r.top + r.height / 3 });
    M.body.innerHTML =
      '<div class="solved-note">' +
      '<div class="big">🔓</div>' +
      '<p>' + BRAVO[Math.floor(Math.random() * BRAVO.length)] + '</p>' +
      '<p style="font-weight:700;color:#4b3a72;font-size:16px">' + p.success + '</p>' +
      '<div class="numpad-display" style="margin-top:16px">Cifra ta: ' + G.digits[slot] + '</div>' +
      '</div>';
    M.hint.style.display = 'none';
    M.check.parentNode.classList.add('solo');
    M.check.textContent = 'Mai departe →';
    flash(G.ring.length === 4
      ? 'Ai toate cele 4 cifre — mergi la lacăt! 🔓'
      : 'Ai primit cifra ' + G.digits[slot] + '. Îți mai trebuie ' + (4 - G.ring.length) + '.', 'ok');
    G.mode = 'solved';
    paintCode(); paintOverlay();
    setTimeout(function () { S.play('digit'); }, 260);
  }
  function onWrong(p) {
    S.play('wrong');
    G.wrong++;
    M.box.classList.remove('shake');
    void M.box.offsetWidth;
    M.box.classList.add('shake');
    var msgs = ['Nu chiar… mai încearcă o dată! 💪', 'Aproape! Mai gândește-te puțin 🤔', 'Hopa! Verifică încă o dată 🔍'];
    flash(msgs[Math.min(G.wrong - 1, msgs.length - 1)] + (G.wrong >= 2 ? ' (Poți folosi butonul 💡 Indiciu)' : ''), 'bad');
  }
  function useHint() {
    var p = G.puzzles[G.activeSlot];
    if (!p || G.hintStep >= p.hints.length) return;
    S.play('hint');
    flash('💡 ' + p.hints[G.hintStep], 'hint');
    G.hintStep++;
    G.hints++;
    $('#room-hints').textContent = G.hints;
    if (G.hintStep >= p.hints.length) { M.hint.disabled = true; M.hint.textContent = '💡 Gata indiciile'; }
  }

  /* ============================== LACĂTUL ============================== */
  function tryDoor() {
    if (G.doorOpen) return;
    if (G.ring.length < 4) {
      S.play('wrong');
      var left = 4 - G.ring.length;
      U.toast('Mai ai ' + left + (left === 1 ? ' probă până la lacăt!' : ' probe până la lacăt!'));
      return;
    }
    S.play('open');
    openKeypad();
  }
  function openKeypad() {
    G.mode = 'door';
    G.input = { kind: 'code', value: [0, 0, 0, 0], pos: 0 };
    M.icon.textContent = '🔐';
    M.title.textContent = 'Lacătul cu role';
    M.kicker.textContent = 'Învârte fiecare rolă până apare cifra potrivită';
    M.fb.textContent = ''; M.fb.className = 'modal-feedback';
    M.hint.style.display = 'none';
    M.check.parentNode.classList.add('solo');
    M.check.style.display = '';
    M.check.textContent = 'Deschide ușa';

    M.body.innerHTML =
      '<div class="wheel-lock" id="wheel-lock"></div>' +
      '<p class="order-hintline">Cifrele adunate până acum: <b>' + G.ring.join(' · ') + '</b></p>';
    buildWheels();
    openModal();
  }
  function buildWheels() {
    var host = $('#wheel-lock');
    if (!host) return;
    host.innerHTML = '';
    for (var i = 0; i < 4; i++) {
      var w = document.createElement('div');
      w.className = 'wheel';
      w.dataset.i = i;
      w.innerHTML =
        '<button class="wheel-arrow" data-d="1" aria-label="mai sus">▲</button>' +
        '<div class="wheel-window" tabindex="0" role="spinbutton" aria-label="Rola ' + (i + 1) + '">' +
          '<span class="wheel-side prev"></span>' +
          '<span class="wheel-cur"></span>' +
          '<span class="wheel-side next"></span>' +
        '</div>' +
        '<button class="wheel-arrow" data-d="-1" aria-label="mai jos">▼</button>';
      host.appendChild(w);
      bindWheel(w, i);
    }
    drawCode();
  }
  function spinWheel(i, d) {
    G.input.value[i] = (G.input.value[i] + d + 10) % 10;
    G.input.pos = i;
    S.play('keypad');
    drawCode();
  }
  function bindWheel(w, i) {
    $$('.wheel-arrow', w).forEach(function (b) {
      on(b, 'click', function () { spinWheel(i, parseInt(b.dataset.d, 10)); });
    });
    var win = w.querySelector('.wheel-window');
    var startY = null, acc = 0;
    on(win, 'pointerdown', function (e) {
      startY = e.clientY; acc = 0; G.input.pos = i; drawCode();
      if (win.setPointerCapture) { try { win.setPointerCapture(e.pointerId); } catch (err) {} }
    });
    on(win, 'pointermove', function (e) {
      if (startY === null) return;
      acc += (startY - e.clientY);
      startY = e.clientY;
      while (Math.abs(acc) >= 26) {
        var d = acc > 0 ? 1 : -1;
        acc -= d * 26;
        spinWheel(i, d);
      }
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      on(win, ev, function () { startY = null; });
    });
    on(win, 'keydown', function (e) {
      if (e.key === 'ArrowUp') { e.preventDefault(); spinWheel(i, 1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); spinWheel(i, -1); }
      else if (/^[0-9]$/.test(e.key)) { G.input.value[i] = parseInt(e.key, 10); S.play('keypad'); drawCode(); }
    });
  }
  function drawCode() {
    var host = $('#wheel-lock');
    if (!host) return;
    $$('.wheel', host).forEach(function (w, i) {
      var v = G.input.value[i];
      w.classList.toggle('active', G.input.pos === i);
      w.querySelector('.wheel-cur').textContent = v;
      w.querySelector('.prev').textContent = (v + 1) % 10;
      w.querySelector('.next').textContent = (v + 9) % 10;
    });
  }
  function checkCode() {
    if (G.input.value.join('') === G.ring.join('')) {
      S.play('unlock');
      G.locks++;
      G.ring = [];
      if (G.locks >= G.locksTotal) {
        /* ultimul lacăt: ușa se deschide de tot */
        G.doorOpen = true;
        flash('CLIC! Ușa s-a deschis! 🎉', 'ok');
        var svg = $('#stage-inner svg');
        if (svg) svg.classList.add('opened');
        paintCode(); paintOverlay();
        setTimeout(function () { closeModal(); }, 700);
        setTimeout(winRoom, 1700);
      } else {
        var ramase = G.locksTotal - G.locks;
        flash('CLIC! Lacătul ' + G.locks + ' s-a deschis! 🎉', 'ok');
        paintCode(); paintOverlay();
        setTimeout(function () {
          closeModal();
          U.toast('Lacătul ' + G.locks + ' e deschis. Mai ' +
            (ramase === 1 ? 'este unul' : 'sunt ' + ramase) + ' — caută alte 4 probe! 🔎', 3400);
        }, 900);
      }
    } else {
      S.play('wrong');
      M.box.classList.remove('shake'); void M.box.offsetWidth; M.box.classList.add('shake');
      flash('Codul nu este bun. Verifică ordinea cifrelor! 🔍', 'bad');
    }
  }

  /* ============================== VICTORIE ============================= */
  function winRoom() {
    stopTimer();
    var stars = 3;
    if (G.hints >= 1) stars--;
    if (G.hints >= 3) stars--;
    /* timpul țintă crește proporțional cu numărul de probe din cameră */
    if (G.seconds > G.room.target * (G.total / 4)) stars--;
    stars = Math.max(1, Math.min(3, stars));

    if (G.room.random) U.Store.saveMystery(stars);
    else U.Store.saveRoom(G.room.id, stars, G.seconds);

    S.play('win');
    showScreen('win');
    setTimeout(function () { U.confettiBurst(140, { y: window.innerHeight * 0.3 }); }, 150);
    setTimeout(function () { U.confettiBurst(90, { x: window.innerWidth * 0.25, y: window.innerHeight * 0.35 }); }, 600);

    $('#win-badge').textContent = stars === 3 ? '🏆' : (stars === 2 ? '🎉' : '🙌');
    $('#win-room').innerHTML = G.room.emoji + ' ' + G.room.name + (G.room.random ? ' <small>(' + G.room.sub + ')</small>' : '');
    var st = '';
    for (var i = 0; i < 3; i++) st += '<span class="st s' + (i + 1) + (i < stars ? '' : ' off') + '">⭐</span>';
    $('#win-stars').innerHTML = st;
    $('#win-stats').innerHTML =
      '<div class="win-stat"><b>' + U.fmtTime(G.seconds) + '</b><span>timp</span></div>' +
      '<div class="win-stat"><b>' + G.hints + '</b><span>indicii</span></div>' +
      '<div class="win-stat"><b>' + U.Store.totalStars() + '</b><span>stele total</span></div>';

    var facts = D.CURIOZITATI[G.room.theme] || D.CURIOZITATI.mister;
    var fact = '💡 <b>Știai că…</b> ' + facts[Math.floor(Math.random() * facts.length)];
    if (G.room.random && G.room.seed != null) {
      fact += '<br><br>🔑 Codul acestei camere: <b>' + U.seedToCode(G.room.seed) +
              '</b> — scrie-l pe hartă la „Joacă un cod” ca să o joace și un prieten.';
    }
    $('#win-fact').innerHTML = fact;

    var done = U.Store.doneCount();
    var next = nextRoom();
    var nb = $('#btn-next-room');
    if (done >= R.list.length) {
      nb.textContent = '🏆 Vezi diploma';
      nb.onclick = function () { S.play('open'); showDiploma(); };
    } else if (next) {
      nb.textContent = 'Camera următoare: ' + next.emoji + ' →';
      nb.onclick = function () { S.play('open'); openRoom(next); };
    } else {
      nb.textContent = 'Înapoi la hartă';
      nb.onclick = function () { S.play('click'); goToMap(); };
    }
  }
  function nextRoom() {
    var i, cur = -1;
    for (i = 0; i < R.list.length; i++) if (R.list[i].id === G.room.id) cur = i;
    for (i = cur + 1; i < R.list.length; i++) if (!U.Store.roomResult(R.list[i].id)) return R.list[i];
    for (i = 0; i < R.list.length; i++) if (!U.Store.roomResult(R.list[i].id)) return R.list[i];
    return null;
  }

  /* =============================== DIPLOMA ============================= */
  function showDiploma() {
    var d = U.Store.load();
    var done = U.Store.doneCount(), tot = U.Store.totalStars();
    var nume = (d.name || 'Explorator').toUpperCase();
    var azi = new Date();
    var LUNI = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
    var data = azi.getDate() + ' ' + LUNI[azi.getMonth()] + ' ' + azi.getFullYear();
    var total = R.list.length;
    var titlu = done >= total ? 'MAESTRU AL EVADĂRILOR' : (done >= 60 ? 'EXPLORATOR LEGENDAR' :
                (done >= 30 ? 'EXPLORATOR CURAJOS' : (done >= 10 ? 'AVENTURIER ISTEȚ' : 'UCENIC ISTEȚ')));

    /* o stea pentru fiecare lume terminată complet */
    var stars = '';
    for (var i = 0; i < R.worlds.length; i++) {
      var x = 150 + i * 78;
      var filled = worldDone(R.worlds[i]) >= R.worlds[i].rooms.length;
      stars += '<path d="M' + x + ' 476 l9 20 l22 3 l-16 15 l4 22 l-19 -11 l-19 11 l4 -22 l-16 -15 l22 -3 Z" fill="' + (filled ? '#f59e0b' : '#e5e7eb') + '"/>';
    }
    var svg =
      '<svg viewBox="0 0 1000 640" xmlns="' + SVGNS + '">' +
      '<defs><linearGradient id="dp-b" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#7c3aed"/><stop offset="50%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#7c3aed"/></linearGradient>' +
      '<linearGradient id="dp-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fde68a"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient></defs>' +
      '<rect width="1000" height="640" fill="#fffdf5"/>' +
      '<rect x="14" y="14" width="972" height="612" rx="18" fill="none" stroke="url(#dp-b)" stroke-width="10"/>' +
      '<rect x="34" y="34" width="932" height="572" rx="10" fill="none" stroke="#e9d5ff" stroke-width="3"/>' +
      '<g opacity=".12"><circle cx="120" cy="120" r="70" fill="#7c3aed"/><circle cx="880" cy="540" r="80" fill="#f59e0b"/></g>' +
      '<text x="500" y="106" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="34" fill="#7c3aed">DIPLOMĂ DE EVADARE</text>' +
      '<text x="500" y="150" text-anchor="middle" font-family="Nunito, sans-serif" font-size="19" font-weight="700" fill="#6b7280">se acordă cu mândrie</text>' +
      '<text x="500" y="232" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="62" font-weight="700" fill="#1b1040">' + U.esc(nume) + '</text>' +
      '<path d="M250 254 H750" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>' +
      '<text x="500" y="304" text-anchor="middle" font-family="Nunito, sans-serif" font-size="21" font-weight="700" fill="#4b3a72">pentru curaj, isteţime şi răbdare în</text>' +
      '<text x="500" y="360" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="44" fill="#7c3aed">EVADAREA MAGICĂ</text>' +
      '<text x="500" y="398" text-anchor="middle" font-family="Nunito, sans-serif" font-size="22" font-weight="800" fill="#16a34a">' +
        done + ' din ' + total + ' camere rezolvate &#160;•&#160; ' + tot + ' stele adunate</text>' +
      '<text x="500" y="440" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="30" fill="#d97706">titlul obţinut: ' + titlu + '</text>' +
      stars +
      '<text x="180" y="590" text-anchor="middle" font-family="Nunito, sans-serif" font-size="17" font-weight="700" fill="#6b7280">' + data + '</text>' +
      '<path d="M100 566 H260" stroke="#9ca3af" stroke-width="2"/>' +
      '<text x="820" y="590" text-anchor="middle" font-family="Nunito, sans-serif" font-size="17" font-weight="700" fill="#6b7280">Evadarea Magică</text>' +
      '<path d="M740 566 H900" stroke="#9ca3af" stroke-width="2"/>' +
      '<g transform="translate(500,588)">' +
        '<path d="M-26 -46 l14 34 h24 l14 -34 h-18 l-8 20 l-8 -20 Z" fill="#dc2626"/>' +
        '<circle r="38" fill="url(#dp-g)" stroke="#b45309" stroke-width="4"/>' +
        '<circle r="30" fill="none" stroke="#b45309" stroke-width="2.5" opacity=".7"/>' +
        '<path d="M0 -22 l7 15 l17 2 l-12 12 l3 17 l-15 -8 l-15 8 l3 -17 l-12 -12 l17 -2 Z" fill="#b45309"/>' +
      '</g>' +
      '</svg>';
    $('#diploma-sheet').innerHTML = svg;
    showScreen('diploma');
  }

  /* ============================== LEGĂTURI ============================= */
  function bindUI() {
    cacheModal();

    on($('#btn-mute'), 'click', toggleMute);
    on($('#btn-mute2'), 'click', toggleMute);

    on($('#btn-reset'), 'click', function () {
      if (confirm('Ștergi tot progresul (camerele rezolvate și stelele)?\nNumele și nivelul rămân salvate.')) {
        U.Store.reset();
        renderMap();
        U.toast('Progres șters. Poți lua totul de la capăt! ♻️');
      }
    });

    on($('#btn-change-level'), 'click', function () {
      S.play('click');
      G.level = G.level === 3 ? 1 : G.level + 1;
      U.Store.set('level', G.level);
      setLevel(G.level, true);
      updateLevelChip();
      U.toast('Nivel schimbat: ' + LEVEL_NAME[G.level]);
    });

    on($('#btn-change-size'), 'click', function () {
      S.play('click');
      G.size = G.size === 12 ? 4 : G.size + 4;
      setSize(G.size, true);
      updateSizeChip();
      var l = G.size / 4;
      U.toast('De acum camerele au ' + G.size + ' probe și ' + l + (l === 1 ? ' lacăt' : ' lacăte') + '.');
    });

    on($('#btn-back'), 'click', function () {
      S.play('click');
      stopTimer();
      goToMap();
    });
    on($('#btn-door'), 'click', tryDoor);
    on($('#btn-look'), 'click', function () {
      S.play('hint');
      markActivity();
      revealHotspots(3200);
    });
    on($('#btn-to-map'), 'click', function () { S.play('click'); goToMap(); });
    on($('#btn-diploma'), 'click', function () { S.play('open'); showDiploma(); });
    on($('#btn-code'), 'click', playByCode);
    on($('#btn-diploma-back'), 'click', function () { S.play('click'); goToMap(); });
    on($('#btn-print'), 'click', function () { window.print(); });

    on($('#modal-close'), 'click', function () { S.play('click'); closeModal(); });
    on($('#modal-backdrop'), 'click', function () { closeModal(); });
    on($('#btn-hint'), 'click', useHint);
    on($('#btn-check'), 'click', function () {
      if (G.mode === 'door') checkCode();
      else if (G.mode === 'solved') { S.play('click'); closeModal(); }
      else checkPuzzle();
    });

    /* tastatura fizică */
    on(document, 'keydown', function (e) {
      if ($('#modal-layer').hidden) return;
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'Enter') { e.preventDefault(); $('#btn-check').click(); return; }
      if (!G.input) return;
      if (G.input.kind === 'code') {
        if (/^[0-9]$/.test(e.key)) {
          G.input.value[G.input.pos] = parseInt(e.key, 10);
          G.input.pos = Math.min(3, G.input.pos + 1);
          S.play('keypad');
        } else if (e.key === 'Backspace') {
          G.input.pos = Math.max(0, G.input.pos - 1);
        } else if (e.key === 'ArrowLeft') {
          G.input.pos = Math.max(0, G.input.pos - 1);
        } else if (e.key === 'ArrowRight') {
          G.input.pos = Math.min(3, G.input.pos + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          spinWheel(G.input.pos, e.key === 'ArrowUp' ? 1 : -1);
          return;
        } else return;
        drawCode();
      } else if (G.input.kind === 'number') {
        if (/^[0-9]$/.test(e.key)) {
          if (G.input.value.length < 6) { G.input.value += e.key; S.play('keypad'); }
        } else if (e.key === 'Backspace') {
          G.input.value = G.input.value.slice(0, -1);
        } else return;
        var disp = $('.numpad-display', M.body);
        if (disp) { disp.textContent = G.input.value || '—'; disp.classList.toggle('empty', !G.input.value); }
      } else if (G.input.kind === 'choice' && /^[1-4a-dA-D]$/.test(e.key)) {
        var idx = 'abcd'.indexOf(e.key.toLowerCase());
        if (idx < 0) idx = parseInt(e.key, 10) - 1;
        var btns = $$('.choice', M.body);
        if (btns[idx]) btns[idx].click();
      }
    });

    /* primul gest pornește sunetul (politica browserelor) */
    ['click', 'touchstart', 'keydown'].forEach(function (ev) {
      document.addEventListener(ev, function once() {
        S.unlockOnGesture();
        document.removeEventListener(ev, once);
      }, { once: true });
    });
  }

  /* ---- camere aleatorii cu cod: aceeași cameră pentru toată clasa ----- */
  function playByCode(code) {
    if (typeof code !== 'string') {
      code = window.prompt('Scrie codul camerei (5 litere sau cifre). Toți copiii care folosesc același cod primesc exact aceeași cameră.');
    }
    if (!code) return;
    code = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 5) { U.toast('Codul trebuie să aibă exact 5 caractere.'); return; }
    S.play('open');
    openRoom(R.makeMystery(U.codeToSeed(code), G.level, G.size));
  }
  function codeFromUrl() {
    var m = /[#&?]cod=([A-Za-z0-9]{5})/.exec(location.hash + location.search);
    return m ? m[1].toUpperCase() : null;
  }

  /* ================================ START ============================== */
  function boot() {
    var d = U.Store.load();
    S.setMuted(!!d.muted);
    bindUI();
    initStart();
    refreshMuteButtons();
    showScreen('start');
    var urlCode = codeFromUrl();
    if (urlCode) {
      G.name = d.name || 'Explorator';
      goToMap();
      playByCode(urlCode);
    }
    /* dacă cineva deschide un link cu #cod= fiind deja în joc */
    on(window, 'hashchange', function () {
      var c = codeFromUrl();
      if (c) playByCode(c);
    });
  }

  global.Game = { boot: boot, state: G, openRoom: openRoom, goToMap: goToMap, playByCode: playByCode };
})(window);
