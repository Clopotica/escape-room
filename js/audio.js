/* =====================================================================
   audio.js — sunete și muzică generate din cod (Web Audio API)
   Nu există fișiere audio de descărcat: totul e sintetizat în browser,
   ca jocul să meargă și offline, și de pe GitHub Pages.
   ===================================================================== */
(function (global) {
  'use strict';

  var ctx = null;
  var master = null;
  var musicGain = null;
  var muted = false;
  var musicTimer = null;
  var musicStep = 0;
  var started = false;

  function ensure() {
    if (ctx) return ctx;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.9;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.16;
    musicGain.connect(master);
    return ctx;
  }

  /* o notă simplă */
  function tone(freq, dur, type, vol, delay, target) {
    var c = ensure(); if (!c) return;
    var t0 = c.currentTime + (delay || 0);
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol == null ? 0.25 : vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    osc.connect(g); g.connect(target || master);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  /* alunecare de frecvență (pentru "greșit" sau "whoosh") */
  function slide(f1, f2, dur, type, vol) {
    var c = ensure(); if (!c) return;
    var t0 = c.currentTime;
    var osc = c.createOscillator(); var g = c.createGain();
    osc.type = type || 'sawtooth';
    osc.frequency.setValueAtTime(f1, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t0 + dur);
    g.gain.setValueAtTime(vol == null ? 0.2 : vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  /* zgomot scurt (clic de lacăt, foșnet) */
  function noise(dur, vol, freq) {
    var c = ensure(); if (!c) return;
    var len = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = c.createBufferSource(); src.buffer = buf;
    var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 1400; f.Q.value = 1.2;
    var g = c.createGain(); g.gain.value = vol == null ? 0.28 : vol;
    src.connect(f); f.connect(g); g.connect(master);
    src.start();
  }

  var SFX = {
    click:  function () { tone(660, 0.07, 'triangle', 0.16); },
    hover:  function () { tone(880, 0.04, 'sine', 0.06); },
    open:   function () { tone(523, 0.12, 'triangle', 0.16); tone(784, 0.18, 'triangle', 0.14, 0.07); },
    correct: function () {
      tone(659.25, 0.14, 'triangle', 0.22);
      tone(830.6, 0.14, 'triangle', 0.2, 0.10);
      tone(987.77, 0.30, 'triangle', 0.22, 0.20);
      tone(1318.5, 0.35, 'sine', 0.12, 0.28);
    },
    wrong:  function () { slide(320, 150, 0.30, 'sawtooth', 0.16); },
    hint:   function () { tone(1046.5, 0.09, 'sine', 0.16); tone(1396.9, 0.16, 'sine', 0.13, 0.08); },
    digit:  function () { tone(880, 0.08, 'square', 0.10); tone(1174.7, 0.16, 'triangle', 0.16, 0.06); },
    keypad: function () { tone(440, 0.05, 'square', 0.09); },
    unlock: function () {
      noise(0.14, 0.22, 900);
      tone(196, 0.22, 'sawtooth', 0.12, 0.05);
      tone(392, 0.30, 'triangle', 0.16, 0.18);
    },
    win: function () {
      var mel = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      for (var i = 0; i < mel.length; i++) tone(mel[i], 0.45, 'triangle', 0.22, i * 0.13);
      tone(1567.98, 0.7, 'sine', 0.14, 0.68);
      noise(0.5, 0.10, 3000);
    },
    fail: function () { slide(300, 120, 0.45, 'triangle', 0.14); }
  };

  /* --- muzică de fundal: arpegii blânde, în buclă, foarte discrete --- */
  var CHORDS = [
    [261.63, 329.63, 392.00, 523.25],  /* Do major */
    [220.00, 261.63, 329.63, 440.00],  /* la minor */
    [174.61, 220.00, 261.63, 349.23],  /* Fa major */
    [196.00, 246.94, 293.66, 392.00]   /* Sol major */
  ];
  function musicTick() {
    var c = ensure(); if (!c) return;
    var chord = CHORDS[Math.floor(musicStep / 4) % CHORDS.length];
    var n = chord[musicStep % 4];
    tone(n, 1.5, 'sine', 0.16, 0, musicGain);
    if (musicStep % 8 === 0) tone(chord[0] / 2, 2.4, 'sine', 0.13, 0, musicGain);
    musicStep++;
  }
  function startMusic() {
    if (musicTimer) return;
    ensure();
    musicTick();
    musicTimer = setInterval(musicTick, 900);
  }
  function stopMusic() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  }

  var Audio = {
    play: function (name) {
      if (muted) return;
      var f = SFX[name];
      if (f) { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume(); f(); }
    },
    unlockOnGesture: function () {
      if (started) return;
      started = true;
      var c = ensure();
      if (c && c.state === 'suspended') c.resume();
      if (!muted) startMusic();
    },
    setMuted: function (m) {
      muted = !!m;
      var c = ensure();
      if (master) master.gain.value = muted ? 0 : 0.9;
      if (muted) stopMusic(); else if (started) startMusic();
      return muted;
    },
    isMuted: function () { return muted; },
    toggle: function () { return this.setMuted(!muted); },
    musicVolume: function (v) { if (musicGain) musicGain.gain.value = v; },
    pauseMusic: stopMusic,
    resumeMusic: function () { if (!muted && started) startMusic(); }
  };

  global.Sound = Audio;
})(window);
