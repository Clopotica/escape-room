/* =====================================================================
   scenegen.js — generatorul de scene pentru camerele din lumile 2–10.

   O cameră generată este descrisă printr-o „rețetă” (spec):
     wall:    { style, colors:[sus, mijloc, jos] }   — peretele din spate
     floor:   { style, colors:[sus, jos] }           — podeaua
     light:   'torches' | 'lamp' | 'windows' | 'neon' | 'candles' | 'bulbs' | 'moon' | 'none'
     sky:     'day' | 'night' | 'sunset' | 'sea' | 'snow'  (ce se vede pe fereastră)
     door:    stilul ușii (vezi DOORS)
     accent, accent2, wood, metal — culorile din care se colorează obiectele
     objects: [[fel, etichetă], ×4] — cele 4 obiecte cu probe (vezi OBJ)
     flip:    true = obiectele se așază în oglindă

   Scena respectă același contract cu game.js ca scenele desenate manual:
     .hotspot[data-slot][data-bx][data-by], .door-group, g.overlay, g.extra-slot
   ===================================================================== */
(function (global) {
  'use strict';

  var H = global.Scenes._h;
  var GOLD = '#fbbf24', GOLD2 = '#fde68a', GLASS = '#e0f2fe', INK = '#1f2937', FIRE = '#fb923c', WHITE = '#fff';

  /* ---------------------------- ajutoare ---------------------------- */
  function rect(x, y, w, h, fill, rx, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"' + (rx ? ' rx="' + rx + '"' : '') +
      ' fill="' + fill + '"' + (extra || '') + '/>';
  }
  function circ(cx, cy, r, fill, extra) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function ell(cx, cy, rx, ry, fill, extra) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function path(d, fill, stroke, sw, extra) {
    return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="' + (sw || 3) + '"' : '') + (extra || '') + '/>';
  }
  function line(x1, y1, x2, y2, stroke, sw, extra) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + stroke + '" stroke-width="' + (sw || 3) + '" stroke-linecap="round"' + (extra || '') + '/>';
  }
  function g(inner, extra) { return '<g' + (extra || '') + '>' + inner + '</g>'; }
  function shadow(rx) { return ell(0, 2, rx, rx * 0.22, '#000', ' opacity=".35"'); }
  function star5(cx, cy, r, fill) {
    var s = '', i;
    for (i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      s += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
    }
    return path(s + 'Z', fill);
  }
  function twinkle(cx, cy, r, d, fill) { return '<g class="twinkle' + (d ? ' d' + d : '') + '">' + circ(cx, cy, r, fill || GOLD2) + '</g>'; }
  function hashStr(str) {
    var h = 7, i;
    for (i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  }
  function darken(hex, f) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, gg = (n >> 8) & 255, b = n & 255;
    r = Math.round(r * f); gg = Math.round(gg * f); b = Math.round(b * f);
    return '#' + ((1 << 24) + (r << 16) + (gg << 8) + b).toString(16).slice(1);
  }

  /* ============================== PEREȚI ============================== */
  var WALLS = {
    plain: function () { return ''; },
    bricks: function (c) { return H.bricks(0, 0, 1000, 440, 100, 56, 'none', c.line || 'rgba(0,0,0,.28)'); },
    stone: function (c) {
      var s = '', y, x, row = 0;
      for (y = 0; y < 440; y += 68, row++) {
        for (x = (row % 2 ? -60 : 0); x < 1000; x += 120) {
          var w = 110 + ((x * 7 + y) % 3) * 6, h = 60;
          s += '<rect x="' + (x + 4) + '" y="' + (y + 4) + '" width="' + w + '" height="' + h + '" rx="12" fill="none" stroke="' + (c.line || 'rgba(0,0,0,.30)') + '" stroke-width="3"/>';
        }
      }
      return s;
    },
    planks: function (c) {
      var s = '', y;
      for (y = 0; y < 440; y += 44) {
        s += line(0, y, 1000, y, c.line || 'rgba(0,0,0,.30)', 3);
        s += circ(30 + (y % 88) * 2, y + 22, 3, c.line || 'rgba(0,0,0,.35)') + circ(970 - (y % 88) * 2, y + 22, 3, c.line || 'rgba(0,0,0,.35)');
      }
      return s;
    },
    panels: function (c) {
      var s = rect(0, 300, 1000, 140, 'rgba(0,0,0,.18)') + line(0, 300, 1000, 300, 'rgba(255,255,255,.18)', 4), x;
      for (x = 60; x < 1000; x += 140) {
        s += '<rect x="' + x + '" y="316" width="90" height="106" rx="6" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="4"/>';
        s += line(x, 0, x, 300, 'rgba(255,255,255,.07)', 22);
      }
      return s;
    },
    tiles: function (c) {
      var s = '', x, y;
      for (y = 0; y < 440; y += 55) s += line(0, y, 1000, y, c.line || 'rgba(0,0,0,.18)', 3);
      for (x = 0; x < 1000; x += 55) s += line(x, 0, x, 440, c.line || 'rgba(0,0,0,.18)', 3);
      return s;
    },
    metal: function (c) {
      var s = '', x, y;
      for (y = 0; y < 440; y += 110) for (x = 0; x < 1000; x += 200) {
        s += '<rect x="' + (x + 6) + '" y="' + (y + 6) + '" width="188" height="98" rx="8" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="4"/>';
        s += circ(x + 18, y + 18, 4, 'rgba(255,255,255,.35)') + circ(x + 182, y + 18, 4, 'rgba(255,255,255,.35)') +
             circ(x + 18, y + 92, 4, 'rgba(255,255,255,.35)') + circ(x + 182, y + 92, 4, 'rgba(255,255,255,.35)');
      }
      return s;
    },
    cave: function (c) {
      var s = '', x;
      for (x = 20; x < 1000; x += 90) {
        var h = 40 + ((x * 13) % 50);
        s += path('M' + (x - 30) + ' 0 L' + x + ' ' + h + ' L' + (x + 30) + ' 0 Z', c.line || 'rgba(0,0,0,.35)');
      }
      s += path('M0 0 H1000 V30 Q900 60 800 30 T600 30 T400 30 T200 30 T0 30 Z', 'rgba(0,0,0,.25)');
      s += ell(300, 250, 80, 40, 'rgba(0,0,0,.14)') + ell(760, 330, 90, 44, 'rgba(0,0,0,.14)');
      return s;
    },
    tent: function (c) {
      var s = '', i;
      for (i = 0; i < 12; i++) {
        var x1 = -300 + i * 140, x2 = x1 + 70;
        s += path('M500 -40 L' + x1 + ' 440 L' + x2 + ' 440 Z', c.line || 'rgba(255,255,255,.14)');
      }
      return s;
    },
    night: function (c) { return H.stars(70, 10, 10, 980, 400, 19); },
    bamboo: function (c) {
      var s = '', x;
      for (x = 14; x < 1000; x += 46) {
        s += rect(x, 0, 30, 440, 'rgba(0,0,0,.12)', 12) + line(x + 4, 0, x + 4, 440, 'rgba(255,255,255,.14)', 4);
        s += line(x, 120 + (x % 90), x + 30, 120 + (x % 90), 'rgba(0,0,0,.35)', 4) + line(x, 300 + (x % 70), x + 30, 300 + (x % 70), 'rgba(0,0,0,.35)', 4);
      }
      return s;
    },
    ice: function (c) {
      return path('M0 60 L180 120 L60 260 Z M240 0 L420 90 L300 180 Z M700 40 L900 110 L760 220 Z M520 260 L640 320 L560 420 Z M860 300 L1000 260 L940 420 Z', 'rgba(255,255,255,.10)') +
             path('M0 60 L180 120 M60 260 L180 120 M240 0 L420 90 M760 220 L900 110 M700 40 L900 110', null, 'rgba(255,255,255,.28)', 3);
    },
    leaves: function (c) {
      var s = '', i;
      for (i = 0; i < 14; i++) {
        var x = -20 + i * 78, y = 10 + ((i * 37) % 60);
        s += ell(x, y, 46, 30, i % 2 ? '#15803d' : '#166534', ' transform="rotate(' + ((i % 3) * 20 - 20) + ' ' + x + ' ' + y + ')" opacity=".9"');
      }
      s += ell(120, 200, 60, 90, 'rgba(0,0,0,.14)') + ell(880, 230, 60, 90, 'rgba(0,0,0,.14)');
      return s;
    },
    dots: function (c) {
      var s = '', x, y;
      for (y = 26; y < 440; y += 52) for (x = 26 + ((y / 52) % 2) * 26; x < 1000; x += 52) s += circ(x, y, 5, c.line || 'rgba(255,255,255,.16)');
      return s;
    },
    beams: function (c) {
      return rect(0, 0, 1000, 40, 'rgba(0,0,0,.28)') + line(0, 40, 1000, 40, 'rgba(0,0,0,.4)', 6) +
             rect(140, 0, 34, 440, 'rgba(0,0,0,.22)') + rect(826, 0, 34, 440, 'rgba(0,0,0,.22)') + rect(483, 0, 34, 170, 'rgba(0,0,0,.22)');
    }
  };

  /* ============================== PODELE ============================== */
  var FLOORS = {
    plain: function () { return ''; },
    planks: function (c) {
      return line(0, 462, 1000, 462, 'rgba(0,0,0,.32)', 3) + line(0, 494, 1000, 494, 'rgba(0,0,0,.32)', 3) + line(0, 526, 1000, 526, 'rgba(0,0,0,.32)', 3) +
             path('M180 430 V462 M520 462 V494 M840 430 V462 M300 494 V526 M700 494 V526 M120 526 V560 M600 526 V560', null, 'rgba(0,0,0,.3)', 3);
    },
    tiles: function (c) {
      return g(path('M0 462 H1000 M0 496 H1000 M0 530 H1000 M120 430 L60 560 M320 430 L290 560 M520 430 L520 560 M720 430 L750 560 M900 430 L950 560', null, 'rgba(0,0,0,.35)', 2));
    },
    stone: function (c) {
      var s = '', x, y, r = 0;
      for (y = 440; y < 560; y += 30, r++) for (x = (r % 2 ? 20 : 0); x < 1000; x += 64) s += ell(x + 30, y + 14, 30, 12, 'rgba(0,0,0,.16)', ' stroke="rgba(0,0,0,.25)" stroke-width="2"');
      return s;
    },
    grass: function (c) {
      var s = '', x;
      for (x = 10; x < 1000; x += 38) s += path('M' + x + ' 470 q4 -14 8 0 M' + (x + 14) + ' 500 q4 -16 8 0 M' + (x + 4) + ' 536 q4 -12 8 0', null, 'rgba(0,0,0,.28)', 3);
      return s;
    },
    sand: function (c) {
      return path('M0 470 q60 -14 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 M0 520 q60 -12 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0', null, 'rgba(0,0,0,.18)', 3);
    },
    metal: function (c) {
      var s = '', x, y;
      for (y = 430; y < 560; y += 26) s += line(0, y, 1000, y, 'rgba(0,0,0,.28)', 2);
      for (x = 0; x < 1000; x += 100) s += line(x, 430, x, 560, 'rgba(0,0,0,.28)', 2);
      return s;
    },
    carpet: function (c) {
      return rect(0, 450, 1000, 110, c.rug || 'rgba(0,0,0,.2)') + rect(0, 462, 1000, 4, 'rgba(255,255,255,.35)') + rect(0, 540, 1000, 4, 'rgba(255,255,255,.35)') +
             rect(0, 472, 1000, 60, 'rgba(255,255,255,.08)');
    },
    ice: function (c) {
      return path('M120 440 L200 500 L160 560 M700 430 L640 490 L720 560 M420 470 L480 520', null, 'rgba(255,255,255,.55)', 3) + rect(0, 430, 1000, 12, 'rgba(255,255,255,.35)');
    },
    checker: function (c) {
      var s = '', x, y, r = 0;
      for (y = 430; y < 560; y += 43, r++) for (x = ((r % 2) * 62); x < 1000; x += 124) s += rect(x, y, 62, 43, 'rgba(0,0,0,.28)');
      return s;
    },
    water: function (c) {
      return rect(0, 430, 1000, 130, 'rgba(255,255,255,.08)') + path('M0 470 q50 -10 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 M0 520 q50 -10 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0', null, 'rgba(255,255,255,.35)', 3);
    }
  };

  /* ============================== LUMINI ============================== */
  function windowArt(sky, w, h) {
    var s = '';
    var x = -w / 2, y = -h / 2;
    if (sky === 'night') s += rect(x, y, w, h, '#0b1e3d', 8) + H.stars(10, x + 6, y + 6, w - 12, h - 30, 5) + circ(x + w * 0.68, y + h * 0.3, 12, '#fef3c7');
    else if (sky === 'sunset') s += rect(x, y, w, h, '#f97316', 8) + rect(x, y + h * 0.55, w, h * 0.45, '#7c2d12') + circ(x + w / 2, y + h * 0.55, 18, '#fde68a');
    else if (sky === 'sea') s += rect(x, y, w, h, '#7dd3fc', 8) + rect(x, y + h * 0.5, w, h * 0.5, '#0369a1') + path('M' + (x + 8) + ' ' + (y + h * 0.7) + ' q10 -6 20 0 t20 0 t20 0 t20 0', null, '#bae6fd', 3);
    else if (sky === 'snow') s += rect(x, y, w, h, '#bae6fd', 8) + path('M' + x + ' ' + (y + h * 0.6) + ' q' + (w / 2) + ' -40 ' + w + ' 0 V' + (y + h) + ' H' + x + ' Z', '#f8fafc') + circ(x + w * 0.3, y + h * 0.25, 4, WHITE) + circ(x + w * 0.7, y + h * 0.4, 4, WHITE) + circ(x + w * 0.5, y + h * 0.15, 3, WHITE);
    else s += rect(x, y, w, h, '#7dd3fc', 8) + circ(x + w * 0.3, y + h * 0.3, 16, '#fde047') + ell(x + w * 0.65, y + h * 0.55, 20, 10, WHITE) + path('M' + x + ' ' + (y + h * 0.75) + ' q' + (w / 2) + ' -30 ' + w + ' 0 V' + (y + h) + ' H' + x + ' Z', '#4ade80');
    s += rect(x, y, w, h, 'none', 8, ' stroke="rgba(255,255,255,.65)" stroke-width="3"');
    return s;
  }
  var LIGHTS = {
    none: function () { return ''; },
    torches: function (spec) { return H.torch(56, 262, .95) + H.torch(944, 262, .95); },
    lamp: function (spec, P) {
      return line(500, 0, 500, 46, INK, 4) +
        g(path('M460 100 L540 100 L522 50 L478 50 Z', P.a) + ell(500, 100, 40, 8, darken(P.a, .7)) + circ(500, 104, 9, GOLD2) +
          ell(500, 130, 60, 30, GOLD2, ' opacity=".18" filter="url(#soft2)"'), ' class="sway"');
    },
    windows: function (spec) {
      return g(windowArt(spec.sky || 'day', 96, 140), ' transform="translate(340,150)"') + g(windowArt(spec.sky || 'day', 96, 140), ' transform="translate(660,150)"') +
        rect(292, 224, 96, 8, 'rgba(0,0,0,.3)', 3) + rect(612, 224, 96, 8, 'rgba(0,0,0,.3)', 3);
    },
    neon: function (spec, P) {
      return rect(60, 26, 380, 8, P.a, 4, ' opacity=".95"') + rect(560, 26, 380, 8, P.b, 4, ' opacity=".95"') +
        rect(60, 26, 380, 8, P.a, 4, ' opacity=".6" filter="url(#soft)"') + rect(560, 26, 380, 8, P.b, 4, ' opacity=".6" filter="url(#soft)"') +
        g(rect(60, 26, 380, 8, WHITE, 4, ' opacity=".35"'), ' class="blinkled d1"') + g(rect(560, 26, 380, 8, WHITE, 4, ' opacity=".35"'), ' class="blinkled"');
    },
    candles: function (spec) {
      var s = line(500, 0, 500, 40, INK, 4) + path('M430 70 Q500 30 570 70', null, INK, 8) + rect(496, 40, 8, 26, INK) , i;
      var xs = [430, 500, 570];
      for (i = 0; i < 3; i++) {
        var x = xs[i], y = i === 1 ? 62 : 70;
        s += rect(x - 5, y - 26, 10, 26, '#fef3c7', 2) + g(ell(x, y - 34, 5, 9, GOLD) + ell(x, y - 36, 2, 4, '#fef3c7'), ' class="flicker"') +
             circ(x, y - 34, 26, GOLD, ' opacity=".16" filter="url(#soft2)"');
      }
      return s;
    },
    bulbs: function (spec, P) {
      var s = path('M0 20 Q250 70 500 30 T1000 20', null, INK, 3), i, cols = [P.a, P.b, GOLD, '#4ade80'];
      for (i = 0; i < 12; i++) {
        var t = i / 11, x = t * 1000, y = 26 + Math.sin(t * Math.PI * 2) * 12 + (t < .5 ? t * 40 : (1 - t) * 40);
        s += line(x, y, x, y + 10, INK, 3) + g(ell(x, y + 22, 8, 12, cols[i % 4]) + circ(x, y + 22, 18, cols[i % 4], ' opacity=".25" filter="url(#soft)"'), ' class="blinkled' + (i % 3 ? ' d' + (i % 3) : '') + '"');
      }
      return s;
    },
    moon: function (spec) {
      return circ(500, 80, 44, '#fef3c7') + circ(486, 70, 38, 'rgba(0,0,0,.28)') + circ(500, 80, 80, '#fef3c7', ' opacity=".14" filter="url(#soft2)"') + H.stars(20, 380, 20, 240, 120, 9);
    },
    sun: function (spec) {
      return circ(500, 70, 46, '#fde047') + circ(500, 70, 90, '#fde047', ' opacity=".18" filter="url(#soft2)"') +
        g(path('M500 6 v-4 M556 36 l4 -4 M580 70 h4 M556 104 l4 4 M444 36 l-4 -4 M420 70 h-4 M444 104 l-4 4', null, '#fde047', 6), ' class="spin"');
    }
  };

  /* ================================ UȘI =============================== */
  /* toate ușile sunt desenate între x=405..595 și y=180..440 */
  var DOORS = {
    wood: function (P) {
      return path('M400 440 V200 q100 -90 200 0 V440 Z', darken(P.wood, .55)) +
        '<g class="door-panel">' + path('M410 434 V206 q90 -78 180 0 V434 Z', P.wood) +
        path('M455 208 V434 M500 190 V434 M545 208 V434', null, darken(P.wood, .7), 3) +
        rect(410, 250, 180, 14, P.metal) + rect(410, 360, 180, 14, P.metal) +
        circ(420, 257, 4, '#e5e7eb') + circ(580, 257, 4, '#e5e7eb') + circ(420, 367, 4, '#e5e7eb') + circ(580, 367, 4, '#e5e7eb') +
        circ(556, 316, 14, 'none', ' stroke="' + GOLD + '" stroke-width="6"') + rect(478, 300, 44, 34, INK, 5) + rect(490, 312, 20, 10, GOLD, 2) + '</g>' +
        path('M410 434 V206 q90 -78 180 0 V434 Z', '#fff8e1', null, 0, ' class="door-light" opacity="0"');
    },
    metal: function (P) {
      return rect(398, 176, 204, 264, darken(P.metal, .5), 10) +
        '<g class="door-panel">' + rect(408, 186, 184, 248, P.metal, 8) + rect(420, 198, 160, 224, 'none', 6, ' stroke="' + darken(P.metal, .6) + '" stroke-width="4"') +
        circ(420, 198, 4, '#e5e7eb') + circ(580, 198, 4, '#e5e7eb') + circ(420, 422, 4, '#e5e7eb') + circ(580, 422, 4, '#e5e7eb') +
        circ(500, 300, 34, 'none', ' stroke="' + P.a + '" stroke-width="9"') + path('M500 266 V334 M466 300 H534 M476 276 L524 324 M524 276 L476 324', null, P.a, 6) +
        rect(440, 210, 120, 22, INK, 4) + g(circ(456, 221, 6, '#ef4444'), ' class="blinkled"') + g(circ(476, 221, 6, '#22c55e'), ' class="blinkled d1"') + '</g>' +
        rect(408, 186, 184, 248, '#fff8e1', 8, ' class="door-light" opacity="0"');
    },
    vault: function (P) {
      return circ(500, 310, 128, darken(P.metal, .5)) +
        '<g class="door-panel">' + circ(500, 310, 116, P.metal) + circ(500, 310, 96, 'none', ' stroke="' + darken(P.metal, .7) + '" stroke-width="6"') +
        g(circ(500, 310, 46, darken(P.metal, .8)) + path('M500 262 V358 M452 310 H548 M466 276 L534 344 M534 276 L466 344', null, P.a, 8) + circ(500, 310, 14, P.a), ' class="spin-r"') +
        circ(500, 200, 7, '#e5e7eb') + circ(500, 420, 7, '#e5e7eb') + circ(390, 310, 7, '#e5e7eb') + circ(610, 310, 7, '#e5e7eb') + '</g>' +
        circ(500, 310, 116, '#fff8e1', ' class="door-light" opacity="0"');
    },
    portal: function (P) {
      return ell(500, 310, 106, 134, darken(P.a, .35)) +
        '<g class="door-panel">' + ell(500, 310, 92, 120, P.a) + ell(500, 310, 60, 80, P.b, ' opacity=".85"') + ell(500, 310, 28, 40, '#fef3c7', ' opacity=".9"') +
        H.at(500, 310, 'spin', ell(0, 0, 70, 96, 'none', ' stroke="#fff" stroke-width="4" opacity=".5" stroke-dasharray="18 14"')) +
        twinkle(474, 258, 5, 0, WHITE) + twinkle(530, 352, 4, 1, WHITE) + '</g>' +
        ell(500, 310, 92, 120, '#fff', ' class="door-light" opacity="0"') +
        path('M394 310 q-12 -152 106 -166 q118 14 106 166', null, P.b, 12, ' opacity=".8"');
    },
    gate: function (P) {
      var s = path('M398 440 V200 q102 -100 204 0 V440 Z', darken(P.metal, .5)) + '<g class="door-panel">' + path('M408 434 V206 q92 -84 184 0 V434 Z', 'rgba(0,0,0,.35)'), x;
      for (x = 428; x <= 572; x += 24) s += rect(x - 4, 200 + Math.abs(x - 500) * 0.5, 8, 240 - Math.abs(x - 500) * 0.5, P.metal, 3) + path('M' + (x - 8) + ' ' + (206 + Math.abs(x - 500) * 0.5) + ' l8 -16 l8 16 Z', GOLD);
      s += rect(408, 300, 184, 12, P.metal) + rect(408, 380, 184, 12, P.metal) + rect(486, 330, 28, 36, GOLD, 5) + circ(500, 342, 6, INK) + '</g>' +
        path('M408 434 V206 q92 -84 184 0 V434 Z', '#fff8e1', null, 0, ' class="door-light" opacity="0"');
      return s;
    },
    curtain: function (P) {
      return rect(392, 176, 216, 14, GOLD, 6) + circ(392, 183, 10, GOLD) + circ(608, 183, 10, GOLD) + rect(400, 190, 200, 250, INK) +
        '<g class="door-panel">' + path('M404 190 H596 V440 H404 Z', P.a) +
        path('M424 190 q10 130 -6 250 M454 190 q10 130 -6 250 M484 190 q10 130 -6 250 M514 190 q10 130 -6 250 M544 190 q10 130 -6 250 M574 190 q10 130 -6 250', null, darken(P.a, .7), 4) +
        path('M404 330 q96 30 192 0', null, GOLD, 10) + circ(500, 342, 12, GOLD2) + '</g>' +
        rect(404, 190, 192, 250, '#fff8e1', 0, ' class="door-light" opacity="0"');
    },
    cave: function (P) {
      return path('M386 440 L392 260 Q420 176 500 170 Q580 176 608 260 L614 440 Z', darken(P.wood, .45)) +
        '<g class="door-panel">' + path('M402 436 L406 268 Q428 194 500 188 Q572 194 594 268 L598 436 Z', darken(P.wood, .7)) +
        ell(500, 330, 78, 92, darken(P.wood, .85)) + path('M450 300 q30 -20 60 0 M470 360 q30 20 60 0', null, darken(P.wood, .6), 5) + '</g>' +
        path('M402 436 L406 268 Q428 194 500 188 Q572 194 594 268 L598 436 Z', '#fff8e1', null, 0, ' class="door-light" opacity="0"');
    },
    hatch: function (P) {
      return circ(500, 310, 122, darken(P.metal, .5)) + circ(500, 310, 112, 'none', ' stroke="' + darken(P.metal, .75) + '" stroke-width="8"') +
        '<g class="door-panel">' + circ(500, 310, 100, P.metal) + circ(500, 280, 44, GLASS, ' opacity=".85"') + circ(500, 280, 44, 'none', ' stroke="' + darken(P.metal, .6) + '" stroke-width="7"') + ell(486, 266, 12, 7, WHITE, ' opacity=".6"') +
        g(circ(500, 360, 30, darken(P.metal, .8)) + path('M500 330 V390 M470 360 H530 M479 339 L521 381 M521 339 L479 381', null, P.a, 7), ' class="spin"') +
        circ(430, 244, 6, '#e5e7eb') + circ(570, 244, 6, '#e5e7eb') + circ(430, 376, 6, '#e5e7eb') + circ(570, 376, 6, '#e5e7eb') + '</g>' +
        circ(500, 310, 100, '#fff8e1', ' class="door-light" opacity="0"');
    },
    garage: function (P) {
      var s = rect(396, 176, 208, 264, darken(P.metal, .5), 8) + '<g class="door-panel">' + rect(406, 186, 188, 248, P.a, 6), y;
      for (y = 216; y < 434; y += 36) s += line(406, y, 594, y, darken(P.a, .6), 5) + line(406, y + 4, 594, y + 4, 'rgba(255,255,255,.25)', 2);
      s += rect(470, 380, 60, 14, P.metal, 5) + rect(420, 194, 160, 16, INK, 4) + g(rect(424, 197, 14, 10, '#ef4444', 2), ' class="blinkled"') + '</g>' +
        rect(406, 186, 188, 248, '#fff8e1', 6, ' class="door-light" opacity="0"');
      return s;
    },
    glass: function (P) {
      return rect(396, 176, 208, 264, P.metal, 8) + '<g class="door-panel">' + rect(406, 186, 188, 248, GLASS, 4, ' opacity=".75"') +
        rect(406, 186, 188, 248, 'none', 4, ' stroke="' + darken(P.metal, .7) + '" stroke-width="5"') + line(500, 186, 500, 434, darken(P.metal, .7), 5) +
        path('M420 200 L470 420', null, WHITE, 8, ' opacity=".35"') + rect(482, 290, 8, 50, P.metal, 3) + rect(510, 290, 8, 50, P.metal, 3) +
        rect(430, 250, 50, 20, P.a, 4) + rect(520, 250, 50, 20, P.a, 4) + '</g>' +
        rect(406, 186, 188, 248, '#fff8e1', 4, ' class="door-light" opacity="0"');
    },
    stone: function (P) {
      return rect(392, 176, 216, 264, darken(P.wood, .5), 6) + '<g class="door-panel">' + rect(404, 188, 192, 246, P.wood, 4) +
        rect(404, 188, 192, 246, 'none', 4, ' stroke="' + darken(P.wood, .7) + '" stroke-width="5"') + line(404, 270, 596, 270, darken(P.wood, .7), 4) + line(404, 352, 596, 352, darken(P.wood, .7), 4) +
        g(circ(500, 229, 16, P.a) + path('M470 300 h60 M470 320 h60 M480 310 h40', null, P.b, 6) + path('M480 380 l20 30 l20 -30 Z', P.a), '') + '</g>' +
        rect(404, 188, 192, 246, '#fff8e1', 4, ' class="door-light" opacity="0"');
    },
    elevator: function (P) {
      return rect(392, 170, 216, 270, darken(P.metal, .55), 6) + rect(440, 150, 120, 26, INK, 6) + g(circ(470, 163, 6, P.a), ' class="blinkled"') + g(circ(500, 163, 6, P.b), ' class="blinkled d1"') + g(circ(530, 163, 6, GOLD), ' class="blinkled d2"') +
        '<g class="door-panel">' + rect(404, 184, 94, 250, P.metal, 3) + rect(502, 184, 94, 250, P.metal, 3) + line(500, 184, 500, 434, INK, 4) +
        rect(410, 190, 82, 238, 'none', 3, ' stroke="rgba(255,255,255,.3)" stroke-width="3"') + rect(508, 190, 82, 238, 'none', 3, ' stroke="rgba(255,255,255,.3)" stroke-width="3"') + '</g>' +
        rect(404, 184, 192, 250, '#fff8e1', 3, ' class="door-light" opacity="0"') + rect(560, 300, 22, 40, INK, 5) + circ(571, 312, 5, P.a) + circ(571, 328, 5, P.b);
    },
    shoji: function (P) {
      var s = rect(392, 176, 216, 264, darken(P.wood, .6), 4) + '<g class="door-panel">' + rect(404, 188, 192, 246, '#fef3c7', 3), x, y;
      for (x = 452; x < 596; x += 48) s += line(x, 188, x, 434, P.wood, 5);
      for (y = 236; y < 434; y += 48) s += line(404, y, 596, y, P.wood, 5);
      s += rect(404, 188, 192, 246, 'none', 3, ' stroke="' + P.wood + '" stroke-width="8"') + circ(560, 320, 14, 'none', ' stroke="' + P.a + '" stroke-width="5"') + '</g>' +
        rect(404, 188, 192, 246, '#fff8e1', 3, ' class="door-light" opacity="0"');
      return s;
    },
    saloon: function (P) {
      return path('M400 440 V200 q100 -90 200 0 V440 Z', 'rgba(0,0,0,.45)') + '<g class="door-panel">' +
        rect(410, 270, 86, 120, P.wood, 6) + rect(504, 270, 86, 120, P.wood, 6) + rect(418, 278, 70, 104, 'none', 4, ' stroke="' + darken(P.wood, .7) + '" stroke-width="4"') + rect(512, 278, 70, 104, 'none', 4, ' stroke="' + darken(P.wood, .7) + '" stroke-width="4"') +
        path('M418 330 L488 330 M512 330 L582 330', null, darken(P.wood, .7), 4) + '</g>' +
        path('M410 434 V206 q90 -78 180 0 V434 Z', '#fff8e1', null, 0, ' class="door-light" opacity="0"');
    },
    ice: function (P) {
      return path('M392 440 V210 q108 -80 216 0 V440 Z', '#7dd3fc') + '<g class="door-panel">' + path('M404 434 V216 q96 -66 192 0 V434 Z', '#bae6fd') +
        path('M430 240 L470 300 L440 360 M540 250 L520 330 L560 400', null, WHITE, 4, ' opacity=".7"') + ell(500, 320, 46, 56, WHITE, ' opacity=".35"') + circ(500, 320, 16, P.a) + '</g>' +
        path('M404 434 V216 q96 -66 192 0 V434 Z', '#fff8e1', null, 0, ' class="door-light" opacity="0"');
    },
    vine: function (P) {
      return path('M400 440 V200 q100 -90 200 0 V440 Z', darken(P.wood, .5)) + '<g class="door-panel">' + path('M410 434 V206 q90 -78 180 0 V434 Z', P.wood) +
        path('M455 208 V434 M545 208 V434', null, darken(P.wood, .7), 4) + circ(500, 320, 20, 'none', ' stroke="' + GOLD + '" stroke-width="6"') + '</g>' +
        path('M410 434 V206 q90 -78 180 0 V434 Z', '#fff8e1', null, 0, ' class="door-light" opacity="0"') +
        path('M396 200 q40 60 20 120 q-10 60 30 110', null, '#15803d', 8) + path('M604 200 q-40 60 -20 120 q10 60 -30 110', null, '#15803d', 8) +
        ell(410, 250, 16, 9, '#22c55e', ' transform="rotate(-30 410 250)"') + ell(420, 330, 16, 9, '#22c55e', ' transform="rotate(20 420 330)"') + ell(590, 250, 16, 9, '#22c55e', ' transform="rotate(30 590 250)"') + ell(580, 330, 16, 9, '#22c55e', ' transform="rotate(-20 580 330)"') +
        circ(430, 290, 7, P.a) + circ(572, 300, 7, P.b);
    }
  };

  /* ============================== OBIECTE ============================= */
  /* wall: true  → desenat centrat în (0,0), w × h
     wall: false → desenat cu baza în (0,0), se ridică până la -h        */
  var OBJ = {
    /* ---- pe perete ---- */
    tablou: { wall: true, w: 160, h: 120, draw: function (P) {
      return rect(-80, -60, 160, 120, P.wood, 6) + rect(-68, -48, 136, 96, '#7dd3fc') + circ(-30, -22, 14, '#fde047') +
        path('M-68 20 q40 -40 70 -10 q30 -30 66 10 V48 H-68 Z', '#4ade80') + path('M-68 40 q60 -14 136 0 V48 H-68 Z', '#166534') + rect(-80, -60, 160, 120, 'none', 6, ' stroke="' + GOLD + '" stroke-width="4"');
    } },
    ceas: { wall: true, w: 130, h: 130, draw: function (P) {
      return circ(0, 0, 64, P.wood) + circ(0, 0, 54, '#fef3c7') + circ(0, 0, 54, 'none', ' stroke="' + darken(P.wood, .7) + '" stroke-width="3"') +
        path('M0 -44 v8 M0 44 v-8 M-44 0 h8 M44 0 h-8', null, INK, 4) + path('M0 0 L0 -32 M0 0 L22 12', null, INK, 5) + circ(0, 0, 5, P.a);
    } },
    oglinda: { wall: true, w: 120, h: 150, draw: function (P) {
      return ell(0, 0, 60, 75, P.a) + ell(0, 0, 48, 62, GLASS) + path('M-24 -40 q30 -20 46 0 M-34 -10 L20 50', null, WHITE, 6, ' opacity=".6" stroke-linecap="round"') + circ(0, -72, 8, GOLD) + circ(-30, 66, 6, GOLD) + circ(30, 66, 6, GOLD);
    } },
    raft: { wall: true, w: 170, h: 110, draw: function (P) {
      return rect(-85, -52, 170, 10, P.wood, 3) + rect(-85, 40, 170, 10, P.wood, 3) + rect(-85, -42, 8, 82, P.wood) + rect(77, -42, 8, 82, P.wood) +
        rect(-70, -40, 26, 38, P.a, 4) + rect(-70, -32, 26, 8, GOLD2) + rect(-38, -34, 30, 32, P.b, 12) + rect(-38, -34, 30, 8, INK, 3) +
        rect(0, -30, 22, 28, GOLD, 4) + rect(30, -42, 40, 40, '#e0f2fe', 6, ' opacity=".8"') + rect(30, -22, 40, 20, P.a, 4) + rect(-70, 12, 40, 28, P.b, 3) + rect(-24, 14, 30, 26, P.a, 3) + rect(14, 10, 50, 30, P.wood, 3) + rect(14, 18, 50, 6, GOLD2);
    } },
    harta: { wall: true, w: 170, h: 120, draw: function (P) {
      return rect(-85, -56, 170, 112, '#f5deb3', 8) + rect(-85, -56, 170, 112, 'none', 8, ' stroke="' + P.wood + '" stroke-width="6"') +
        path('M-60 -20 q30 -30 60 -10 q30 10 40 40 q-30 20 -60 10 q-30 0 -40 -40 Z', '#86efac') + path('M-40 20 q20 -10 40 5', null, '#0369a1', 3) +
        path('M28 -6 l14 14 M42 -6 l-14 14', null, '#dc2626', 5) + circ(-56, 36, 10, 'none', ' stroke="' + INK + '" stroke-width="3"') + path('M-56 26 v20 M-66 36 h20', null, INK, 2);
    } },
    masca: { wall: true, w: 110, h: 140, draw: function (P) {
      return path('M-52 -60 h104 v70 q0 60 -52 60 q-52 0 -52 -60 Z', P.a) + path('M-52 -60 h104 l-8 -14 h-88 Z', P.b) +
        ell(-22, -12, 14, 10, '#fef3c7') + ell(22, -12, 14, 10, '#fef3c7') + circ(-22, -12, 5, INK) + circ(22, -12, 5, INK) +
        path('M-24 30 q24 22 48 0', null, INK, 6) + path('M-52 -30 h-12 M52 -30 h12 M-50 10 h-14 M50 10 h14', null, P.b, 8) + rect(-6, 0, 12, 20, P.b, 4);
    } },
    scut: { wall: true, w: 120, h: 140, draw: function (P) {
      return path('M-56 -68 h112 v64 q0 60 -56 74 q-56 -14 -56 -74 Z', P.a, GOLD, 6) + line(-56, -32, 56, -32, GOLD, 5) + star5(0, 12, 26, GOLD2) + path('M-40 -76 l-14 -18 M40 -76 l14 -18', null, P.metal, 9);
    } },
    fereastra: { wall: true, w: 120, h: 150, draw: function (P, spec) { return windowArt(spec.sky || 'day', 110, 140) + line(0, -70, 0, 70, P.wood, 6) + line(-55, 0, 55, 0, P.wood, 6) + rect(-64, 70, 128, 10, P.wood, 3); } },
    afis: { wall: true, w: 130, h: 150, draw: function (P) {
      return rect(-65, -75, 130, 150, '#fef3c7', 4) + rect(-65, -75, 130, 46, P.a) + rect(-65, 29, 130, 46, P.b) + star5(0, 0, 34, GOLD) + circ(-56, -66, 6, P.metal) + circ(56, -66, 6, P.metal) + circ(-56, 66, 6, P.metal) + circ(56, 66, 6, P.metal);
    } },
    ecran: { wall: true, w: 170, h: 120, draw: function (P) {
      return rect(-85, -60, 170, 120, INK, 10) + rect(-75, -50, 150, 90, '#0f172a', 6) + path('M-66 0 l16 -20 l14 30 l16 -44 l14 40 l14 -16 l12 8 l14 -30 l14 24 l16 -10', null, P.a, 4) +
        g(circ(60, -38, 5, '#22c55e'), ' class="blinkled"') + rect(-40, 44, 80, 10, P.metal, 3);
    } },
    coarne: { wall: true, w: 150, h: 120, draw: function (P) {
      return path('M-70 30 h140 l-14 30 h-112 Z', P.wood) + path('M0 24 q-10 -50 -40 -60 M-30 -14 q-16 -10 -24 -30 M-14 0 q-30 4 -46 -6 M0 24 q10 -50 40 -60 M30 -14 q16 -10 24 -30 M14 0 q30 4 46 -6', null, '#d6c39b', 9) + circ(0, 30, 12, P.a);
    } },
    tinta: { wall: true, w: 130, h: 130, draw: function (P) {
      return circ(0, 0, 64, '#dc2626') + circ(0, 0, 50, '#fef3c7') + circ(0, 0, 36, '#dc2626') + circ(0, 0, 22, '#fef3c7') + circ(0, 0, 9, INK) + line(-44, -50, -4, -6, P.a, 5) + path('M-56 -60 l10 -4 l-2 10 Z', P.b);
    } },
    calendar: { wall: true, w: 120, h: 140, draw: function (P) {
      var s = rect(-60, -60, 120, 130, '#fef3c7', 8) + rect(-60, -60, 120, 34, P.a, 8) + rect(-60, -40, 120, 14, P.a) + circ(-30, -70, 6, P.metal) + circ(30, -70, 6, P.metal), i;
      for (i = 0; i < 12; i++) s += rect(-48 + (i % 4) * 28, -14 + Math.floor(i / 4) * 26, 20, 18, i === 6 ? P.b : '#e5e7eb', 3);
      return s + circ(22, 40, 12, 'none', ' stroke="#dc2626" stroke-width="3"');
    } },
    steag: { wall: true, w: 120, h: 150, draw: function (P) {
      return rect(-60, -75, 120, 12, P.wood, 4) + g(path('M-50 -63 h100 v110 l-50 -26 l-50 26 Z', P.a) + rect(-50, -30, 100, 14, P.b) + star5(0, 10, 22, GOLD), ' class="sway"');
    } },
    semn: { wall: true, w: 160, h: 100, draw: function (P) {
      return rect(-8, -50, 16, 100, P.wood) + path('M-76 -36 h130 l20 18 l-20 18 h-130 Z', P.a) + path('M-76 -36 h130 l20 18 l-20 18 h-130 Z', 'none', darken(P.a, .6), 4) +
        path('M-60 -18 h80 M-60 0 h60', null, '#fef3c7', 7) + path('M-56 24 h100 l-16 -10 M-56 24 l16 10', null, P.b, 6);
    } },
    vitrina: { wall: true, w: 150, h: 130, draw: function (P) {
      return rect(-75, -65, 150, 130, P.wood, 8) + rect(-63, -53, 126, 106, GLASS, 4, ' opacity=".7"') + line(0, -53, 0, 53, P.wood, 4) +
        path('M-44 20 l14 -30 l14 30 Z', P.a) + path('M-10 20 l12 -24 l12 24 Z', P.b) + path('M24 20 l14 -30 l14 30 Z', GOLD) + rect(-63, 20, 126, 8, darken(P.wood, .8)) + twinkle(-30, -18, 3, 1) + twinkle(38, -14, 3, 2);
    } },
    cheie: { wall: true, w: 110, h: 140, draw: function (P) {
      return circ(0, -66, 8, P.metal) + g(circ(0, -30, 26, 'none', ' stroke="' + GOLD + '" stroke-width="10"') + rect(-6, -6, 12, 74, GOLD, 4) + rect(0, 44, 22, 10, GOLD, 3) + rect(0, 24, 18, 10, GOLD, 3) + circ(0, -30, 9, P.a), ' class="sway"');
    } },
    portret: { wall: true, w: 130, h: 150, draw: function (P) {
      return rect(-65, -75, 130, 150, GOLD, 8) + rect(-55, -65, 110, 130, P.a) + ell(0, 30, 40, 30, P.b) + circ(0, -14, 26, '#fcd7b6') + path('M-26 -22 q26 -30 52 0 v-8 q-26 -20 -52 0 Z', P.wood) +
        circ(-9, -14, 3, INK) + circ(9, -14, 3, INK) + path('M-8 -2 q8 6 16 0', null, INK, 2) + circ(0, 28, 6, GOLD);
    } },
    panou: { wall: true, w: 170, h: 120, draw: function (P) {
      var s = rect(-85, -60, 170, 120, P.metal, 8) + rect(-75, -50, 150, 44, INK, 6), i;
      for (i = 0; i < 6; i++) s += g(circ(-60 + i * 24, -28, 7, [P.a, P.b, GOLD, '#22c55e', '#ef4444', P.a][i]), ' class="blinkled' + (i % 3 ? ' d' + (i % 3) : '') + '"');
      for (i = 0; i < 4; i++) s += rect(-70 + i * 38, 6, 30, 42, darken(P.metal, .7), 4) + rect(-63 + i * 38, 12 + (i % 2) * 20, 16, 10, i % 2 ? P.a : P.b, 2);
      return s;
    } },
    cadran: { wall: true, w: 130, h: 130, draw: function (P) {
      return circ(0, 0, 64, P.metal) + circ(0, 0, 54, '#fef3c7') + path('M-40 24 A46 46 0 0 1 -30 -34', null, '#22c55e', 8) + path('M-30 -34 A46 46 0 0 1 30 -34', null, GOLD, 8) + path('M30 -34 A46 46 0 0 1 40 24', null, '#ef4444', 8) +
        path('M0 0 L26 -30', null, INK, 5) + circ(0, 0, 6, P.a) + circ(0, 0, 64, 'none', ' stroke="' + darken(P.metal, .7) + '" stroke-width="4"');
    } },
    chitara: { wall: true, w: 100, h: 160, draw: function (P) {
      return g(rect(-7, -80, 14, 70, P.wood, 3) + rect(-13, -84, 26, 16, darken(P.wood, .7), 3) + ell(0, 20, 30, 24, P.a) + ell(0, 54, 36, 28, P.a) + circ(0, 30, 11, INK) + rect(-14, 44, 28, 8, P.wood) + path('M-4 -70 V50 M0 -70 V50 M4 -70 V50', null, '#e5e7eb', 1), ' class="sway"');
    } },
    panza: { wall: true, w: 120, h: 120, draw: function (P) {
      return g(path('M0 0 L-60 -60 M0 0 L0 -60 M0 0 L60 -60 M0 0 L-60 0 M0 0 L60 0 M0 0 L-60 60 M0 0 L0 60 M0 0 L60 60', null, '#e5e7eb', 2) + circ(0, 0, 20, 'none', ' stroke="#e5e7eb" stroke-width="2"') + circ(0, 0, 40, 'none', ' stroke="#e5e7eb" stroke-width="2"'), ' opacity=".8"') +
        g(circ(0, 0, 12, INK) + circ(0, -14, 8, INK) + path('M-10 -4 l-16 -10 M10 -4 l16 -10 M-12 4 l-16 6 M12 4 l16 6', null, INK, 3) + circ(-3, -15, 2, '#ef4444') + circ(3, -15, 2, '#ef4444'), ' class="floaty"');
    } },
    tabla: { wall: true, w: 170, h: 120, draw: function (P) {
      return rect(-85, -60, 170, 120, P.wood, 6) + rect(-75, -50, 150, 100, '#14532d', 4) + path('M-60 -30 h40 M-60 -10 h70 M-60 10 h50', null, '#fef3c7', 4) + circ(36, -20, 16, 'none', ' stroke="#fef3c7" stroke-width="3"') + path('M20 30 l16 -20 l16 20 Z', 'none', GOLD2, 3) + rect(-60, 40, 30, 8, '#fef3c7', 2);
    } },
    dulapior: { wall: true, w: 130, h: 140, draw: function (P) {
      return rect(-65, -70, 130, 140, P.wood, 8) + rect(-57, -62, 56, 124, P.a, 4) + rect(1, -62, 56, 124, P.a, 4) + circ(-12, 0, 5, GOLD) + circ(12, 0, 5, GOLD) + path('M-10 -30 v20 M-20 -20 h20', null, '#fef3c7', 5) + path('M10 -30 v20 M0 -20 h20', null, '#fef3c7', 5);
    } },
    oale: { wall: true, w: 150, h: 110, draw: function (P) {
      return rect(-75, -55, 150, 10, P.metal, 4) + line(-50, -45, -50, -20, INK, 3) + line(0, -45, 0, -10, INK, 3) + line(50, -45, 50, -24, INK, 3) +
        path('M-74 -20 h48 v30 q0 10 -10 10 h-28 q-10 0 -10 -10 Z', P.metal) + path('M-26 -30 q8 12 0 26', null, P.metal, 5) + path('M-20 -10 h40 v40 q0 10 -10 10 h-20 q-10 0 -10 -10 Z', P.a) + path('M-24 -10 h48', null, INK, 4) +
        ell(50, 0, 24, 22, P.b) + path('M26 -24 h48', null, INK, 4) + ell(50, -24, 24, 6, darken(P.b, .7));
    } },
    unelte: { wall: true, w: 150, h: 120, draw: function (P) {
      return rect(-75, -60, 150, 120, P.wood, 6) + g(path('M-50 -40 v80', null, P.wood, 8) + rect(-64, -50, 28, 16, P.metal, 3), ' transform="rotate(-6 -50 0)"') +
        g(rect(-4, -46, 8, 90, P.metal, 3) + path('M-14 -50 a14 14 0 1 1 28 0 l-6 10 h-16 Z', P.metal), ' transform="rotate(8 0 0)"') +
        g(path('M40 -44 l14 14 l-30 30 M54 -30 l-14 -14', null, P.a, 8) + path('M22 0 l-12 12', null, P.metal, 8), '') + rect(30, 20, 34, 30, P.b, 4) + circ(-2, 36, 4, INK) + circ(52, 44, 4, INK);
    } },
    /* ---- pe podea ---- */
    cufar: { wall: false, w: 160, h: 110, draw: function (P) {
      return shadow(84) + rect(-76, -68, 152, 68, P.wood, 8) + path('M-76 -64 q76 -60 152 0 Z', darken(P.wood, 1.15)) + rect(-76, -70, 152, 12, darken(P.wood, .7)) +
        rect(-16, -100, 32, 100, GOLD, 4, ' opacity=".85"') + rect(-76, -40, 152, 9, GOLD, 0, ' opacity=".7"') + rect(-14, -42, 28, 28, P.a, 5) + circ(0, -30, 5, INK);
    } },
    butoi: { wall: false, w: 120, h: 140, draw: function (P) {
      return shadow(60) + path('M-50 0 q-14 -70 0 -140 h100 q14 70 0 140 Z', P.wood) + path('M-58 -108 h116 M-60 -32 h120', null, P.metal, 9) + ell(0, -140, 50, 12, darken(P.wood, .8)) + path('M0 -140 V0 M-28 -136 V-4 M28 -136 V-4', null, darken(P.wood, .7), 2) + ell(-20, -110, 16, 16, P.a, ' opacity=".9"');
    } },
    cazan: { wall: false, w: 150, h: 150, draw: function (P) {
      return shadow(70) + g(path('M-44 0 q-16 -30 4 -50 q0 30 18 36 q4 -30 22 -34 q-2 26 14 36 q12 -24 22 -40 q16 30 -6 52 Z', FIRE) + path('M-24 0 q-4 -20 10 -30 q4 20 16 26 q10 -18 14 -30 q10 22 -8 34 Z', GOLD), ' class="flicker"') +
        rect(-40, -6, 80, 6, INK, 2) + path('M-60 -110 q0 100 60 100 q60 0 60 -100 Z', INK) + ell(0, -110, 66, 16, darken(P.a, .8)) + ell(0, -112, 54, 10, P.a) +
        g(circ(-20, -128, 8, P.b) + circ(14, -136, 6, P.b), ' class="bubble"') + g(circ(4, -124, 5, P.b), ' class="bubble d2"') + path('M-70 -100 h-10 M70 -100 h10', null, INK, 8) + path('M-60 -110 q-10 -30 -30 -50 M60 -110 q10 -30 30 -50', null, '#9ca3af', 5);
    } },
    statuie: { wall: false, w: 120, h: 200, draw: function (P) {
      return shadow(60) + rect(-50, -40, 100, 40, P.metal, 4) + rect(-40, -60, 80, 20, darken(P.metal, .8), 3) +
        rect(-24, -140, 48, 80, '#d6d3d1', 8) + circ(0, -160, 22, '#d6d3d1') + path('M-24 -130 l-20 40 l10 4 M24 -130 l20 40 l-10 4', null, '#d6d3d1', 14, ' stroke-linecap="round"') + path('M-22 -170 q22 -20 44 0', null, GOLD, 6) + rect(-10, -60, 20, 10, P.a);
    } },
    planta: { wall: false, w: 120, h: 180, draw: function (P) {
      return shadow(50) + path('M-40 -60 h80 l-10 60 h-60 Z', P.a) + rect(-44, -66, 88, 12, darken(P.a, .8), 4) +
        g(path('M0 -60 q-40 -40 -50 -110 M0 -60 q40 -40 50 -110 M0 -60 q-10 -60 0 -120 M0 -60 q-50 -10 -60 -50 M0 -60 q50 -10 60 -50', null, '#15803d', 10, ' stroke-linecap="round"') +
          ell(-50, -110, 18, 10, '#22c55e', ' transform="rotate(-50 -50 -110)"') + ell(50, -110, 18, 10, '#22c55e', ' transform="rotate(50 50 -110)"') + ell(0, -124, 12, 20, '#22c55e') + ell(-60, -50, 16, 9, '#22c55e', ' transform="rotate(-20 -60 -50)"') + ell(60, -50, 16, 9, '#22c55e', ' transform="rotate(20 60 -50)"'), ' class="sway"');
    } },
    nicovala: { wall: false, w: 150, h: 110, draw: function (P) {
      return shadow(70) + rect(-50, -30, 100, 30, P.wood, 4) + path('M-70 -70 h140 l-10 -22 h-80 l-40 12 Z', P.metal) + path('M-30 -70 h60 l6 40 h-72 Z', darken(P.metal, .8)) + g(rect(-6, -128, 12, 40, P.wood, 3) + rect(-22, -136, 32, 14, INK, 3), ' transform="rotate(-25 0 -90)"') + twinkle(52, -86, 4, 1);
    } },
    seif: { wall: false, w: 130, h: 150, draw: function (P) {
      return shadow(66) + rect(-62, -146, 124, 146, P.metal, 8) + rect(-52, -136, 104, 126, darken(P.metal, .75), 6) + g(circ(-8, -80, 26, P.a) + path('M-8 -104 V-56 M-32 -80 H16', null, INK, 5), ' class="spin-r"') + rect(30, -100, 8, 40, GOLD, 3) + rect(-56, -2, 16, 4, INK) + rect(40, -2, 16, 4, INK);
    } },
    colivie: { wall: false, w: 110, h: 180, draw: function (P) {
      var s = shadow(50) + rect(-44, -12, 88, 12, P.metal, 4) + path('M-40 -12 V-120 q40 -60 80 0 V-12', 'none', P.metal, 5), x;
      for (x = -30; x <= 30; x += 15) s += line(x, -12, x, -132 - (30 - Math.abs(x)) * 0.8, P.metal, 2);
      s += rect(-3, -180, 6, 20, P.metal) + circ(0, -184, 6, P.metal) + line(-40, -60, 40, -60, P.metal, 4) +
        g(ell(0, -72, 14, 10, P.a) + circ(12, -80, 7, P.a) + path('M18 -80 l8 2 l-8 3 Z', GOLD) + circ(14, -82, 1.5, INK) + path('M-4 -62 v6 M4 -62 v6', null, GOLD, 2), ' class="floaty"');
      return s;
    } },
    toba: { wall: false, w: 130, h: 120, draw: function (P) {
      return shadow(64) + rect(-60, -90, 120, 90, P.a, 6) + path('M-60 -80 l30 70 M-30 -80 l30 70 M0 -80 l30 70 M30 -80 l30 70', null, GOLD2, 4) + ell(0, -90, 60, 16, '#fef3c7') + ell(0, -90, 60, 16, 'none', ' stroke="' + P.metal + '" stroke-width="5"') + ell(0, -4, 60, 10, 'none', ' stroke="' + P.metal + '" stroke-width="5"') +
        g(line(-30, -140, 10, -96, P.wood, 5) + circ(-32, -142, 6, '#fef3c7'), '') + g(line(40, -136, 14, -94, P.wood, 5) + circ(42, -138, 6, '#fef3c7'), '');
    } },
    robot: { wall: false, w: 120, h: 170, draw: function (P) {
      return shadow(56) + rect(-22, -20, 18, 20, P.metal, 3) + rect(4, -20, 18, 20, P.metal, 3) + rect(-40, -110, 80, 90, P.a, 10) + rect(-30, -90, 60, 40, INK, 6) +
        g(rect(-24, -84, 12, 8, '#22c55e', 2) + rect(-6, -84, 12, 8, GOLD, 2) + rect(12, -84, 12, 8, '#ef4444', 2), ' class="blinkled"') + circ(0, -60, 8, P.b) +
        rect(-56, -100, 12, 50, P.metal, 5) + rect(44, -100, 12, 50, P.metal, 5) + circ(-50, -46, 9, P.b) + circ(50, -46, 9, P.b) +
        rect(-30, -166, 60, 50, P.metal, 12) + circ(-14, -142, 8, '#7dd3fc') + circ(14, -142, 8, '#7dd3fc') + circ(-14, -142, 3, INK) + circ(14, -142, 3, INK) + line(0, -166, 0, -180, P.metal, 4) + g(circ(0, -184, 6, '#ef4444'), ' class="blinkled d1"');
    } },
    fantana: { wall: false, w: 150, h: 180, draw: function (P) {
      return shadow(76) + path('M-60 0 v-50 q60 -20 120 0 V0 Z', P.metal) + ell(0, -50, 60, 16, darken(P.metal, .7)) + ell(0, -52, 46, 10, '#0369a1') +
        line(-50, -50, -50, -150, P.wood, 8) + line(50, -50, 50, -150, P.wood, 8) + path('M-66 -150 L0 -190 L66 -150 Z', P.a) + path('M-66 -150 L0 -190 L66 -150', null, darken(P.a, .7), 5) + rect(-20, -152, 40, 8, P.wood, 3) + rect(-6, -140, 12, 50, P.wood) + path('M-30 -100 h60', null, INK, 3) + rect(-10, -100, 20, 22, P.b, 3);
    } },
    telescop: { wall: false, w: 150, h: 190, draw: function (P) {
      return shadow(60) + path('M0 -70 L-40 0 M0 -70 L40 0 M0 -70 V0', null, P.wood, 7) + g(rect(-16, -46, 32, 92, P.a, 8) + rect(-24, -60, 48, 22, darken(P.a, .8), 6) + circ(0, -60, 20, GLASS) + rect(-8, 40, 16, 12, INK, 3) + rect(12, -10, 12, 20, P.metal, 3), ' transform="translate(0,-110) rotate(-36)"') + twinkle(70, -180, 4, 1) + twinkle(52, -160, 3, 2);
    } },
    glob: { wall: false, w: 120, h: 170, draw: function (P) {
      return shadow(50) + rect(-30, -14, 60, 14, P.wood, 4) + rect(-6, -40, 12, 30, P.metal) + path('M-50 -100 a52 52 0 1 0 100 0', null, P.metal, 6) +
        g(circ(0, -100, 46, '#0369a1') + path('M-30 -120 q20 -14 40 0 q10 10 -6 22 q-20 6 -34 -6 Z M10 -80 q20 -6 26 12 q-12 14 -30 4 Z', '#22c55e') + path('M-46 -100 h92', null, 'rgba(255,255,255,.4)', 2), ' class="spin"') + circ(0, -156, 6, P.metal);
    } },
    masa: { wall: false, w: 180, h: 130, draw: function (P) {
      return shadow(90) + rect(-80, -70, 12, 70, P.wood) + rect(68, -70, 12, 70, P.wood) + rect(-90, -84, 180, 16, P.wood, 4) +
        rect(-60, -110, 40, 26, P.a, 4) + ell(-40, -110, 20, 6, darken(P.a, .8)) + circ(10, -96, 18, '#fef3c7') + ell(10, -96, 18, 6, P.b) + rect(40, -112, 30, 28, GLASS, 4, ' opacity=".8"') + rect(40, -96, 30, 12, P.b, 2) + rect(-10, -92, 50, 6, P.wood, 2);
    } },
    tron: { wall: false, w: 130, h: 180, draw: function (P) {
      return shadow(64) + rect(-50, -60, 100, 60, darken(P.wood, .8), 4) + rect(-40, -170, 80, 110, P.wood, 10) + rect(-32, -160, 64, 90, P.a, 8) + rect(-60, -100, 16, 50, P.wood, 4) + rect(44, -100, 16, 50, P.wood, 4) + star5(0, -140, 16, GOLD) + circ(-40, -174, 8, GOLD) + circ(40, -174, 8, GOLD) + rect(-50, -66, 100, 14, P.b, 4);
    } },
    dulap: { wall: false, w: 140, h: 200, draw: function (P) {
      return shadow(70) + rect(-70, -196, 140, 196, P.wood, 8) + rect(-62, -186, 60, 176, darken(P.wood, 1.12), 4) + rect(2, -186, 60, 176, darken(P.wood, 1.12), 4) + circ(-10, -96, 6, GOLD) + circ(10, -96, 6, GOLD) + rect(-50, -172, 36, 40, P.a, 3, ' opacity=".7"') + rect(14, -172, 36, 40, P.b, 3, ' opacity=".7"') + rect(-70, -204, 140, 10, darken(P.wood, .7), 4);
    } },
    cutii: { wall: false, w: 150, h: 150, draw: function (P) {
      return shadow(76) + rect(-72, -68, 70, 68, P.wood, 4) + rect(2, -68, 70, 68, darken(P.wood, 1.1), 4) + rect(-36, -136, 72, 68, P.wood, 4) +
        path('M-72 -68 l70 68 M-2 -68 l-70 68 M2 -68 l70 68 M72 -68 l-70 68 M-36 -136 l72 68 M36 -136 l-72 68', null, darken(P.wood, .65), 4) + rect(-26, -110, 52, 16, P.a, 3) + circ(0, -102, 5, '#fef3c7');
    } },
    lada_fructe: { wall: false, w: 150, h: 100, draw: function (P) {
      return shadow(76) + rect(-70, -50, 140, 50, P.wood, 4) + path('M-70 -30 h140 M-70 -12 h140', null, darken(P.wood, .65), 4) + circ(-46, -58, 14, '#ef4444') + circ(-16, -62, 14, '#f97316') + circ(14, -58, 14, '#facc15') + circ(44, -62, 14, '#ef4444') + circ(0, -78, 14, '#22c55e') + circ(-30, -80, 13, '#a855f7') + circ(30, -80, 13, '#ef4444') + path('M-46 -70 l4 -8 M14 -70 l4 -8', null, '#15803d', 3);
    } },
    bicicleta: { wall: false, w: 180, h: 120, draw: function (P) {
      return shadow(90) + circ(-56, -34, 34, 'none', ' stroke="' + INK + '" stroke-width="6"') + circ(56, -34, 34, 'none', ' stroke="' + INK + '" stroke-width="6"') + path('M-56 -34 L-16 -94 L56 -34 M-16 -94 L10 -34 L-56 -34 M10 -34 L-16 -94', null, P.a, 6) + path('M-30 -100 h30 M52 -100 l-4 -12 h-20', null, INK, 6) + circ(-56, -34, 5, P.metal) + circ(56, -34, 5, P.metal) + rect(-30, -104, 30, 6, P.wood, 3) + path('M10 -34 l10 -8', null, INK, 5) + path('M-56 -34 l0 -34 M-56 -34 l30 18 M56 -34 l0 -34 M56 -34 l-30 18', null, INK, 2, ' opacity=".5"');
    } },
    sanie: { wall: false, w: 160, h: 90, draw: function (P) {
      return shadow(80) + path('M-80 -6 h150 q14 0 14 -14 q0 -12 -12 -12', null, P.metal, 7) + rect(-64, -30, 130, 14, P.wood, 4) + rect(-56, -50, 114, 14, P.wood, 4) + rect(-60, -16, 10, 12, P.wood) + rect(40, -16, 10, 12, P.wood) + rect(-40, -60, 30, 10, P.a, 3) + rect(10, -60, 30, 10, P.b, 3) + line(-64, -24, -84, -34, P.metal, 5);
    } },
    tort: { wall: false, w: 120, h: 150, draw: function (P) {
      return shadow(60) + rect(-30, -20, 60, 20, P.metal, 4) + ell(0, -20, 56, 12, P.metal) + rect(-50, -60, 100, 40, P.a, 6) + path('M-50 -60 q10 16 20 0 t20 0 t20 0 t20 0 t20 0 v10 h-100 Z', '#fef3c7') + rect(-36, -96, 72, 36, P.b, 6) + path('M-36 -96 q9 14 18 0 t18 0 t18 0 t18 0 v10 h-72 Z', '#fef3c7') + rect(-3, -126, 6, 30, '#fef3c7') + g(ell(0, -132, 5, 9, GOLD), ' class="flicker"') + circ(-30, -50, 5, '#ef4444') + circ(0, -46, 5, '#ef4444') + circ(30, -50, 5, '#ef4444');
    } },
    acvariu: { wall: false, w: 160, h: 150, draw: function (P) {
      return shadow(80) + rect(-70, -40, 140, 40, P.wood, 4) + rect(-76, -146, 152, 106, '#0369a1', 6) + rect(-76, -146, 152, 106, GLASS, 6, ' opacity=".28"') + rect(-76, -146, 152, 106, 'none', 6, ' stroke="' + P.metal + '" stroke-width="5"') +
        g(ell(-26, -96, 18, 11, P.a) + path('M-44 -96 l-12 -9 v18 Z', P.a) + circ(-18, -98, 2.5, INK), ' class="floaty"') + g(ell(30, -76, 14, 9, P.b) + path('M44 -76 l10 -7 v14 Z', P.b) + circ(24, -78, 2, INK), ' class="floaty2"') +
        path('M-60 -46 q10 -40 0 -70 M-50 -46 q-10 -30 0 -50 M56 -46 q-8 -36 4 -60', null, '#22c55e', 5) + g(circ(50, -120, 4, WHITE, ' opacity=".7"'), ' class="bubble"') + g(circ(-40, -110, 3, WHITE, ' opacity=".7"'), ' class="bubble d1"');
    } },
    foc: { wall: false, w: 140, h: 130, draw: function (P) {
      return shadow(70) + circ(0, -20, 70, FIRE, ' opacity=".25" filter="url(#soft2)"') + g(path('M-50 -14 l100 -20 M-50 -34 l100 20', null, P.wood, 12, ' stroke-linecap="round"'), '') +
        g(path('M0 -120 C 26 -90 34 -70 22 -46 C 14 -30 -14 -30 -22 -46 C -34 -70 -26 -90 0 -120 Z', FIRE) + path('M0 -96 C 14 -76 16 -62 10 -50 C 5 -40 -5 -40 -10 -50 C -16 -62 -14 -76 0 -96 Z', GOLD) + path('M0 -72 C 7 -62 8 -56 5 -50 C 2 -46 -2 -46 -5 -50 C -8 -56 -7 -62 0 -72 Z', '#fef3c7'), ' class="flicker"') +
        circ(-60, -14, 14, '#78716c') + circ(62, -12, 14, '#78716c') + circ(-40, -6, 10, '#a8a29e') + circ(40, -4, 10, '#a8a29e');
    } },
    soba: { wall: false, w: 130, h: 180, draw: function (P) {
      return shadow(64) + rect(-24, -8, 14, 8, INK) + rect(10, -8, 14, 8, INK) + rect(-60, -130, 120, 122, INK, 8) + rect(-50, -120, 100, 100, darken(P.metal, .7), 6) + rect(-36, -100, 72, 40, INK, 4) + g(path('M-28 -66 q6 -20 14 -10 q6 -16 14 0 q6 -14 14 6 q4 -14 12 4 v10 h-54 Z', FIRE), ' class="flicker"') + rect(-36, -100, 72, 40, 'none', 4, ' stroke="' + P.metal + '" stroke-width="4"') + circ(30, -46, 6, GOLD) + rect(-10, -178, 20, 48, INK) + rect(-14, -184, 28, 10, INK, 3) + g(path('M0 -190 q-12 -14 0 -26 q12 -10 0 -24', null, '#9ca3af', 5, ' opacity=".7"'), ' class="floaty"');
    } },
    pian: { wall: false, w: 180, h: 150, draw: function (P) {
      var s = shadow(90) + rect(-80, -30, 10, 30, INK) + rect(70, -30, 10, 30, INK) + rect(-90, -146, 180, 116, INK, 8) + rect(-84, -78, 168, 26, '#fef3c7', 3) + rect(-70, -150, 140, 40, darken(P.a, .7), 4) + rect(-60, -144, 120, 26, P.a, 3), x;
      for (x = -84; x < 84; x += 12) s += line(x, -78, x, -52, INK, 2);
      for (x = -78; x < 84; x += 12) if ((x + 78) % 84 !== 36 && (x + 78) % 84 !== 72) s += rect(x - 3, -78, 7, 16, INK, 1);
      return s + rect(-84, -46, 168, 8, darken(P.wood, .7), 2) + rect(-30, -166, 60, 20, '#fef3c7', 2) + path('M-20 -156 h40', null, INK, 2);
    } },
    valiza: { wall: false, w: 130, h: 100, draw: function (P) {
      return shadow(64) + rect(-60, -80, 120, 80, P.a, 8) + rect(-60, -50, 120, 10, darken(P.a, .7)) + rect(-20, -96, 40, 18, 'none', 6, ' stroke="' + P.wood + '" stroke-width="7"') + rect(-14, -56, 28, 22, P.metal, 3) + circ(0, -45, 4, INK) + rect(-50, -70, 30, 20, GOLD2, 3) + circ(36, -68, 8, P.b) + rect(-60, -8, 120, 8, darken(P.a, .7));
    } },
    cos_flori: { wall: false, w: 130, h: 120, draw: function (P) {
      return shadow(64) + path('M-50 -50 h100 l-12 50 h-76 Z', P.wood) + path('M-46 -36 h92 M-44 -22 h88 M-42 -8 h84', null, darken(P.wood, .7), 3) + path('M-40 -50 q40 -60 80 0', null, P.wood, 7) +
        g(circ(-30, -70, 13, P.a) + circ(-30, -70, 5, GOLD) + circ(0, -80, 14, P.b) + circ(0, -80, 5, GOLD) + circ(30, -68, 13, '#ef4444') + circ(30, -68, 5, GOLD) + circ(-14, -58, 10, '#fef3c7') + circ(16, -58, 10, '#f472b6') + path('M-30 -58 v8 M0 -66 v14 M30 -56 v6', null, '#15803d', 3), ' class="sway"');
    } },
    dovleac: { wall: false, w: 130, h: 100, draw: function (P) {
      return shadow(64) + ell(-40, -40, 24, 40, '#ea580c') + ell(40, -40, 24, 40, '#ea580c') + ell(-20, -42, 26, 44, '#f97316') + ell(20, -42, 26, 44, '#f97316') + ell(0, -44, 20, 46, '#fb923c') + rect(-6, -100, 12, 20, '#15803d', 4) + path('M6 -92 q20 -10 24 -28', null, '#22c55e', 4) + path('M-30 -56 l12 12 l-24 0 Z M30 -56 l12 12 l-24 0 Z', INK) + path('M-24 -30 q24 16 48 0 l-6 -8 h-36 Z', INK);
    } },
    cactus: { wall: false, w: 110, h: 170, draw: function (P) {
      return shadow(50) + path('M-34 -40 h68 l-8 40 h-52 Z', P.a) + rect(-38, -46, 76, 10, darken(P.a, .8), 3) + rect(-16, -150, 32, 106, '#16a34a', 16) + path('M-16 -110 h-20 v-40', null, '#16a34a', 16, ' stroke-linecap="round"') + path('M16 -96 h22 v-30', null, '#16a34a', 16, ' stroke-linecap="round"') + path('M-10 -140 h4 M6 -128 h4 M-8 -110 h4 M4 -94 h4 M-6 -76 h4 M-38 -134 h4 M36 -116 h4', null, '#fef3c7', 3) + circ(0, -154, 10, '#f472b6') + circ(0, -154, 4, GOLD);
    } },
    lampadar: { wall: false, w: 100, h: 200, draw: function (P) {
      return shadow(40) + ell(0, -6, 30, 8, P.metal) + rect(-4, -170, 8, 164, P.metal) + path('M-46 -150 h92 l-16 -50 h-60 Z', P.a) + rect(-46, -152, 92, 6, darken(P.a, .7)) + ell(0, -140, 64, 28, GOLD2, ' opacity=".2" filter="url(#soft2)"') + circ(0, -160, 8, GOLD2);
    } },
    sperietoare: { wall: false, w: 140, h: 200, draw: function (P) {
      return shadow(60) + rect(-5, -140, 10, 140, P.wood) + rect(-66, -120, 132, 10, P.wood, 3) + rect(-34, -128, 68, 70, P.a, 8) + path('M-34 -100 h68 M-34 -80 h68', null, darken(P.a, .7), 3) + path('M-40 -70 l-14 20 M40 -70 l14 20 M-66 -116 l-10 -8 M66 -116 l10 -8', null, GOLD, 6) +
        circ(0, -158, 26, '#f5deb3') + circ(-9, -162, 3, INK) + circ(9, -162, 3, INK) + path('M-10 -148 q10 8 20 0', null, INK, 3) + path('M-40 -176 h80 l-10 -12 h-60 Z', P.wood) + path('M-24 -188 h48 v-14 h-48 Z', P.wood) + g(ell(38, -182, 10, 7, INK) + circ(46, -186, 5, INK) + path('M50 -186 l6 2 l-6 2 Z', GOLD), ' class="floaty"');
    } },
    borcan: { wall: false, w: 110, h: 140, draw: function (P) {
      return shadow(50) + path('M-44 0 V-100 q0 -14 44 -14 q44 0 44 14 V0 Z', GLASS, ' opacity=".7"') + path('M-44 0 V-100 q0 -14 44 -14 q44 0 44 14 V0 Z', 'none', WHITE, 3) + path('M-40 -4 V-60 h80 V-4 Z', P.a, ' opacity=".85"') + rect(-48, -132, 96, 20, P.b, 6) + g(circ(-12, -30, 8, GOLD2) + circ(14, -22, 6, GOLD2), ' class="floaty"') + path('M-30 -100 v60', null, WHITE, 5, ' opacity=".5"');
    } },
    birou: { wall: false, w: 180, h: 140, draw: function (P) {
      return shadow(90) + rect(-84, -70, 14, 70, P.wood) + rect(70, -70, 14, 70, P.wood) + rect(-90, -80, 180, 12, P.wood, 3) + rect(30, -70, 54, 60, P.wood, 3) + circ(56, -40, 4, GOLD) + rect(-40, -140, 90, 60, INK, 6) + rect(-34, -134, 78, 48, '#0f172a', 4) + path('M-24 -120 h40 M-24 -108 h50 M-24 -96 h30', null, P.a, 3) + rect(-4, -80, 18, 6, INK) + rect(-60, -86, 50, 8, INK, 3) + rect(-80, -96, 24, 16, P.b, 3) + circ(-56, -86, 6, '#fef3c7');
    } },
    mingi: { wall: false, w: 140, h: 100, draw: function (P) {
      return shadow(70) + circ(-40, -28, 28, '#f97316') + path('M-68 -28 h56 M-40 -56 v56 M-60 -48 q20 20 40 0 M-60 -8 q20 -20 40 0', null, INK, 2) + circ(30, -30, 30, WHITE) + path('M30 -60 l14 20 l-6 22 h-16 l-6 -22 Z', INK) + path('M10 -50 l10 8 M50 -50 l-10 8 M12 -12 l8 -8 M48 -12 l-8 -8', null, INK, 2) + circ(0, -74, 18, P.a) + path('M-18 -74 a18 18 0 0 1 36 0', null, WHITE, 3) + circ(-4, -74, 5, WHITE);
    } },
    tun: { wall: false, w: 170, h: 120, draw: function (P) {
      return shadow(84) + circ(-30, -24, 26, P.wood) + circ(-30, -24, 26, 'none', ' stroke="' + darken(P.wood, .6) + '" stroke-width="6"') + path('M-30 -50 V2 M-56 -24 H-4', null, darken(P.wood, .6), 5) + path('M-40 -40 L74 -104', null, '#4b5563', 40, ' stroke-linecap="round"') + path('M-30 -46 L64 -100', null, '#6b7280', 14, ' stroke-linecap="round"') + circ(74, -104, 22, '#374151') + circ(74, -104, 13, '#111827') + circ(-30, -24, 7, P.metal) + g(path('M-52 -60 q-8 -22 4 -30', null, GOLD, 4, ' stroke-linecap="round"') + circ(-56, -58, 5, INK), ' class="flicker"') + circ(38, -20, 14, INK) + circ(58, -14, 12, INK);
    } },
    semafor: { wall: false, w: 90, h: 200, draw: function (P) {
      return shadow(40) + rect(-6, -80, 12, 80, P.metal) + ell(0, -4, 26, 7, P.metal) + rect(-30, -200, 60, 124, INK, 12) + g(circ(0, -176, 16, '#ef4444'), ' class="blinkled"') + circ(0, -138, 16, '#f59e0b', ' opacity=".4"') + g(circ(0, -100, 16, '#22c55e'), ' class="blinkled d2"') + path('M-30 -190 h60 M-30 -152 h60 M-30 -114 h60', null, '#374151', 6);
    } },
    cutie_postala: { wall: false, w: 90, h: 180, draw: function (P) {
      return shadow(40) + rect(-6, -100, 12, 100, P.wood) + path('M-40 -100 v-50 q0 -30 40 -30 q40 0 40 30 v50 Z', P.a) + rect(-40, -100, 80, 10, darken(P.a, .7)) + rect(-30, -140, 60, 8, INK, 3) + rect(-24, -128, 48, 24, '#fef3c7', 3) + path('M-20 -122 h40 M-20 -112 h28', null, INK, 3) + g(path('M40 -160 v-20 l16 6 l-16 6', GOLD), ' class="sway"') + line(40, -160, 40, -140, P.metal, 4);
    } },
    hidrant: { wall: false, w: 90, h: 140, draw: function (P) {
      return shadow(40) + rect(-30, -14, 60, 14, '#dc2626', 4) + rect(-22, -110, 44, 96, '#ef4444', 10) + rect(-40, -80, 80, 16, '#dc2626', 6) + circ(-40, -72, 10, '#b91c1c') + circ(40, -72, 10, '#b91c1c') + path('M-22 -110 q22 -30 44 0 Z', '#ef4444') + rect(-10, -134, 20, 14, '#b91c1c', 4) + rect(-16, -54, 32, 26, '#fecaca', 4) + path('M-16 -30 h32', null, '#b91c1c', 3) + rect(-6, -128, 12, 10, '#dc2626');
    } },
    vaza: { wall: false, w: 110, h: 160, draw: function (P) {
      return shadow(50) + path('M-28 0 H28 V-16 C48 -40 52 -90 16 -120 L30 -150 H-30 L-16 -120 C-52 -90 -48 -40 -28 -16 Z', P.a) + path('M-34 -150 h68', null, darken(P.a, .7), 8, ' stroke-linecap="round"') + path('M-40 -76 q40 -16 80 0', null, P.b, 8) + path('M-32 -44 q32 12 64 0', null, P.b, 6) + path('M-30 -60 q0 -30 14 -50', null, WHITE, 5, ' opacity=".35"');
    } },
    ou: { wall: false, w: 120, h: 140, draw: function (P) {
      return shadow(60) + path('M-60 -20 q60 30 120 0 q-10 30 -60 30 q-50 0 -60 -30 Z', P.wood) + path('M-56 -22 q56 20 112 0 M-44 -34 q44 20 88 0', null, darken(P.wood, .7), 4) + path('M-40 -60 q0 -70 40 -80 q40 10 40 80 q0 40 -40 44 q-40 -4 -40 -44 Z', '#fef3c7') + circ(-10, -100, 8, P.a) + circ(14, -70, 10, P.b) + circ(-18, -60, 6, P.a) + circ(20, -108, 5, P.b) + twinkle(30, -136, 4, 1);
    } },
    cristal: { wall: false, w: 140, h: 150, draw: function (P) {
      return shadow(70) + ell(0, -6, 60, 14, '#78716c') + path('M-40 -10 l-10 -70 l30 -20 l14 90 Z', P.a) + path('M-4 -10 l0 -120 l30 20 l6 100 Z', P.b) + path('M34 -10 l10 -60 l24 -10 l-4 70 Z', P.a) + path('M-46 -80 l30 -20 M-4 -130 l30 20 M44 -70 l24 -10', null, WHITE, 3, ' opacity=".6"') + circ(0, -80, 60, P.b, ' opacity=".2" filter="url(#soft2)"') + twinkle(-30, -100, 4, 1) + twinkle(20, -128, 3, 3);
    } },
    ancora: { wall: false, w: 130, h: 170, draw: function (P) {
      return shadow(60) + rect(-8, -140, 16, 120, P.metal, 4) + circ(0, -152, 16, 'none', ' stroke="' + P.metal + '" stroke-width="9"') + rect(-40, -110, 80, 12, P.metal, 4) + path('M-56 -60 q0 50 56 56 q56 -6 56 -56', null, P.metal, 16, ' stroke-linecap="round"') + path('M-56 -60 l-12 -14 M-56 -60 l14 -12 M56 -60 l12 -14 M56 -60 l-14 -12', null, P.metal, 9, ' stroke-linecap="round"') + path('M-16 -150 q-40 -10 -60 20', null, P.wood, 7, ' stroke-linecap="round"');
    } },
    clopot: { wall: false, w: 120, h: 170, draw: function (P) {
      return shadow(60) + rect(-56, -14, 112, 14, P.wood, 4) + rect(-50, -140, 8, 126, P.wood) + rect(42, -140, 8, 126, P.wood) + rect(-58, -150, 116, 12, P.wood, 4) + g(path('M-36 -40 q0 -60 36 -70 q36 10 36 70 q10 8 -6 10 h-60 q-16 -2 -6 -10 Z', GOLD) + path('M-30 -44 q0 -50 30 -60', null, GOLD2, 4) + circ(0, -30, 7, darken(GOLD, .6)) + rect(-6, -118, 12, 12, P.metal, 3), ' class="sway"');
    } },
    ceainic: { wall: false, w: 140, h: 110, draw: function (P) {
      return shadow(70) + rect(-56, -30, 112, 8, P.wood, 3) + path('M-40 -34 q-8 -50 40 -60 q48 10 40 60 Z', P.a) + ell(0, -94, 20, 8, darken(P.a, .8)) + circ(0, -100, 6, P.b) + path('M40 -76 q30 -4 30 30 l-8 0 q0 -22 -22 -20', P.a) + path('M-40 -70 q-30 8 -20 36', null, P.a, 9, ' stroke-linecap="round"') + path('M-30 -60 h60', null, P.b, 5) + g(path('M66 -50 q-8 -12 0 -24 q8 -10 0 -20', null, '#e5e7eb', 4, ' opacity=".7"'), ' class="floaty"');
    } },
    roata: { wall: false, w: 150, h: 150, draw: function (P) {
      return shadow(70) + rect(-30, -30, 60, 30, P.wood, 4) + g(circ(0, -80, 58, 'none', ' stroke="' + P.wood + '" stroke-width="12"') + path('M0 -138 V-22 M-58 -80 H58 M-41 -121 L41 -39 M41 -121 L-41 -39', null, P.wood, 8) + circ(0, -80, 14, P.metal) + circ(0, -146, 8, P.a) + circ(0, -14, 8, P.a) + circ(-66, -80, 8, P.a) + circ(66, -80, 8, P.a), ' class="spin-r"');
    } },
    baloane: { wall: false, w: 130, h: 190, draw: function (P) {
      return shadow(40) + rect(-20, -24, 40, 24, P.metal, 4) + g(path('M0 -30 L-30 -120 M0 -30 L0 -130 M0 -30 L34 -116', null, INK, 2) + ell(-30, -140, 24, 30, P.a) + ell(0, -156, 24, 30, P.b) + ell(34, -138, 24, 30, '#ef4444') + ell(-38, -150, 6, 10, WHITE, ' opacity=".5"') + ell(-8, -166, 6, 10, WHITE, ' opacity=".5"') + ell(26, -148, 6, 10, WHITE, ' opacity=".5"'), ' class="floaty"');
    } },
    carucior: { wall: false, w: 170, h: 130, draw: function (P) {
      return shadow(84) + circ(-46, -18, 18, INK) + circ(46, -18, 18, INK) + circ(-46, -18, 6, P.metal) + circ(46, -18, 6, P.metal) + path('M-80 -110 h150 l-16 76 h-118 Z', P.wood) + path('M-72 -90 h134 M-68 -70 h126 M-64 -50 h118', null, darken(P.wood, .7), 3) + path('M70 -110 l30 -20', null, P.metal, 7, ' stroke-linecap="round"') + rect(-60, -130, 40, 20, P.a, 4) + rect(-10, -134, 34, 24, P.b, 4) + circ(40, -120, 12, GOLD);
    } },
    cort: { wall: false, w: 170, h: 140, draw: function (P) {
      return shadow(84) + path('M-84 0 L0 -136 L84 0 Z', P.a) + path('M0 -136 L84 0 H0 Z', darken(P.a, .8)) + path('M-28 0 L0 -70 L28 0 Z', INK) + path('M0 -136 v-14', null, P.wood, 5) + path('M0 -150 h26 l-8 8 l8 8 h-26 Z', P.b) + path('M-84 0 L-100 10 M84 0 L100 10', null, P.wood, 4);
    } }
  };

  /* ============================== ASAMBLARE =========================== */
  var LAYOUT = {
    /* [x, y] pentru obiecte de perete, [x] pentru obiecte de podea (baza la 440) */
    wall: [[158, 168], [842, 168], [330, 130], [670, 130]],
    floor: [[262], [738], [128], [872]]
  };

  function buildScene(id, spec) {
    var P = {
      a: spec.accent || '#f59e0b', b: spec.accent2 || '#38bdf8',
      wood: spec.wood || '#92400e', metal: spec.metal || '#94a3b8'
    };
    var wc = spec.wall.colors, fc = spec.floor.colors;
    var defs =
      '<linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + wc[0] + '"/><stop offset="55%" stop-color="' + wc[1] + '"/><stop offset="100%" stop-color="' + wc[2] + '"/></linearGradient>' +
      '<linearGradient id="gf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + fc[0] + '"/><stop offset="100%" stop-color="' + fc[1] + '"/></linearGradient>';

    var body = rect(0, 0, 1000, 560, 'url(#gw)') + (WALLS[spec.wall.style] || WALLS.plain)(spec.wall, P) +
      rect(0, 430, 1000, 130, 'url(#gf)') + (FLOORS[spec.floor.style] || FLOORS.plain)(spec.floor, P) +
      rect(0, 430, 1000, 16, 'rgba(0,0,0,.25)') +
      /* lumină caldă dinspre ușă */
      path('M400 0 L600 0 L640 440 L360 440 Z', '#fff', null, 0, ' opacity=".05"') +
      (LIGHTS[spec.light || 'none'] || LIGHTS.none)(spec, P);

    var seed = hashStr(id), wi = 0, fi = 0, i, hot = '';
    var flip = !!spec.flip;
    for (i = 0; i < 4; i++) {
      var kind = spec.objects[i][0], label = spec.objects[i][1], o = OBJ[kind];
      if (!o) { o = OBJ.cufar; kind = 'cufar'; }
      var art = o.draw(P, spec), cx, cy, hit, bx, by, sc = 1;
      var jx = ((seed >> (i * 3)) % 21) - 10;
      if (o.wall) {
        var wp = LAYOUT.wall[wi++]; cx = wp[0] + jx; cy = wp[1] + ((seed >> (i * 2 + 1)) % 15) - 7;
        if (flip) cx = 1000 - cx;
        hit = [cx - o.w / 2 - 10, cy - o.h / 2 - 10, o.w + 20, o.h + 20];
        bx = cx; by = cy - o.h / 2 - 4;
        art = '<g transform="translate(' + cx + ',' + cy + ')">' + art + '</g>';
      } else {
        var fp = LAYOUT.floor[fi++]; cx = fp[0] + jx; cy = 440 + ((seed >> (i * 2)) % 9);
        if (flip) cx = 1000 - cx;
        if (fi > 2) sc = 0.86;
        hit = [cx - o.w * sc / 2 - 10, cy - o.h * sc - 10, o.w * sc + 20, o.h * sc + 20];
        bx = cx; by = cy - o.h * sc - 4;
        art = '<g transform="translate(' + cx + ',' + cy + ')' + (sc !== 1 ? ' scale(' + sc + ')' : '') + '">' + art + '</g>';
      }
      hot += H.hs(i, label, bx, by, hit, art);
    }
    var usa = (DOORS[spec.door] || DOORS.wood)(P);
    body += hot + H.door(500, 176, [392, 172, 216, 272], usa);
    return H.wrap(defs, body);
  }

  /* înregistrează o cameră generată: Scenes[id]() desenează scena, iar
     recuzita de pe podea (camerele medii și lungi) primește paleta camerei */
  function register(id, spec) {
    global.Scenes[id] = function () { return buildScene(id, spec); };
    global.Scenes.setPropPal(id, [spec.wood || '#92400e', darken(spec.wood || '#92400e', .6), spec.accent || '#f59e0b']);
  }

  global.SceneGen = { register: register, build: buildScene, objects: OBJ, doors: DOORS, walls: WALLS, floors: FLOORS, lights: LIGHTS };
})(window);
