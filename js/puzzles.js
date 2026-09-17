/* =====================================================================
   puzzles.js — generatoarele de probe.
   Fiecare probă este creată din nou de fiecare dată (numere aleatorii),
   așa că aceeași cameră nu se joacă niciodată identic.

   Obiectul returnat:
   { type, title, icon, kicker, prompt, svg, input, choices, answer,
     hints[], success }
   input: 'number' | 'choice' | 'letters' | 'order' | 'match'
   ===================================================================== */
(function (global) {
  'use strict';

  var D = global.DATA;

  /* ------------------------------ ajutoare ------------------------------ */
  function shuffleWith(rnd, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  /* variante numerice greșite, plauzibile și distincte */
  function numChoices(rnd, correct, spread) {
    var set = {}, out = [correct], guard = 0;
    set[correct] = 1;
    while (out.length < 4 && guard++ < 300) {
      var d = Math.floor(rnd() * (spread || 6)) + 1;
      var v = rnd() < 0.5 ? correct - d : correct + d;
      if (v < 0 || set[v]) continue;
      set[v] = 1; out.push(v);
    }
    var f = correct + 1;
    while (out.length < 4) { if (!set[f]) { set[f] = 1; out.push(f); } f++; }
    return shuffleWith(rnd, out).map(String);
  }
  function mkChoices(rnd, correct, wrongs) {
    return shuffleWith(rnd, [correct].concat(wrongs.slice(0, 3)));
  }
  function svgBox(w, h, inner) {
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
  }

  /* ================================ CALCUL =============================== */
  function pMath(level, rnd) {
    var a, b, c, ans, txt, extra = '';
    if (level === 1) {
      switch (rnd.int(0, 4)) {
        case 0: a = rnd.int(3, 9); b = rnd.int(2, 9); ans = a + b; txt = a + ' + ' + b + ' = ?'; break;
        case 1: a = rnd.int(11, 20); b = rnd.int(2, 9); ans = a - b; txt = a + ' &minus; ' + b + ' = ?'; break;
        case 2: a = rnd.int(2, 9); ans = a + a; txt = 'Cât este dublul lui ' + a + '?'; break;
        case 3: a = rnd.int(11, 40); b = rnd.int(10, 40); ans = a + b; txt = a + ' + ' + b + ' = ?'; break;
        default:
          a = rnd.int(3, 9); b = rnd.int(2, 8); ans = a + b;
          txt = 'În cufăr sunt ' + a + ' monede de aur. Mai găsești încă ' + b + '. Câte monede ai acum?';
      }
      return mathOut(txt, ans, extra, ['Numără mai departe, încet, pe degete.', 'Răspunsul este cu 1 mai mare decât ' + (ans - 1) + '.']);
    }
    if (level === 2) {
      switch (rnd.int(0, 5)) {
        case 0: a = rnd.int(3, 9); b = rnd.int(3, 9); ans = a * b; txt = a + ' × ' + b + ' = ?'; break;
        case 1: b = rnd.int(2, 9); ans = rnd.int(2, 9); a = b * ans; txt = a + ' : ' + b + ' = ?'; break;
        case 2: a = rnd.int(20, 90); b = rnd.int(10, 40); c = rnd.int(5, 20); ans = a + b - c; txt = a + ' + ' + b + ' &minus; ' + c + ' = ?'; break;
        case 3: a = rnd.int(3, 9); b = rnd.int(2, 6); ans = a * b; txt = 'Sunt ' + b + ' cufere cu câte ' + a + ' rubine în fiecare. Câte rubine sunt în total?'; break;
        case 4: a = rnd.int(4, 9); ans = rnd.int(3, 9); b = a * ans; txt = b + ' bomboane se împart în mod egal la ' + a + ' copii. Câte bomboane primește fiecare?'; break;
        default: a = rnd.int(30, 80); ans = rnd.int(10, 40); txt = a + ' + <b>?</b> = ' + (a + ans); extra = 'Ce număr lipsește?';
      }
      return mathOut(txt, ans, extra, ['Desparte calculul în pași mici.', 'Poți verifica făcând operația inversă.']);
    }
    switch (rnd.int(0, 5)) {
      case 0: a = rnd.int(120, 890); b = rnd.int(110, 800); ans = a + b; txt = a + ' + ' + b + ' = ?'; break;
      case 1: a = rnd.int(400, 990); b = rnd.int(120, 390); ans = a - b; txt = a + ' &minus; ' + b + ' = ?'; break;
      case 2: a = rnd.int(12, 49); b = rnd.int(3, 9); ans = a * b; txt = a + ' × ' + b + ' = ?'; break;
      case 3: a = rnd.int(2, 9); b = rnd.int(3, 9); c = rnd.int(2, 9); ans = a + b * c; txt = a + ' + ' + b + ' × ' + c + ' = ?'; extra = 'Atenție la ordinea operațiilor!'; break;
      case 4: ans = rnd.int(6, 30); a = ans * 4; txt = 'Cât este un sfert din ' + a + '?'; break;
      default: b = rnd.int(4, 9); ans = rnd.int(12, 40); a = b * ans; txt = a + ' : ' + b + ' = ?';
    }
    return mathOut(txt, ans, extra, ['Scrie calculul pe hârtie, cifră cu cifră.', extra ? 'Fă întâi înmulțirea, apoi adunarea.' : 'Estimează întâi: răspunsul e aproape de ' + (ans - ans % 10) + '.']);
  }
  function mathOut(txt, ans, extra, hints) {
    return {
      type: 'math', title: 'Calcul magic', icon: '🧮',
      kicker: extra || 'Rezolvă și tastează rezultatul',
      prompt: txt, input: 'number', answer: String(ans),
      hints: hints, success: 'Corect! Răspunsul este ' + ans + '.'
    };
  }

  /* ============================= GHICITOARE ============================== */
  function pRiddle(level, rnd, theme, used) {
    var it = D.byLevel(D.GHICITORI, level, rnd, used);
    return {
      type: 'riddle', title: 'Ghicitoare', icon: '🎭',
      kicker: 'Alege răspunsul potrivit',
      prompt: it.q, input: 'choice',
      choices: mkChoices(rnd, it.a, it.w), answer: it.a,
      hints: ['Citește ghicitoarea încă o dată, cuvânt cu cuvânt.', 'Răspunsul începe cu litera „' + it.a.charAt(0).toUpperCase() + '”.'],
      success: 'Exact! Răspunsul este ' + it.a + '.'
    };
  }

  /* ========================== CULTURĂ GENERALĂ =========================== */
  function pCulture(level, rnd, theme, used) {
    var it = D.byLevel(D.CULTURA, level, rnd, used);
    return {
      type: 'culture', title: 'Cultură generală', icon: '🌍',
      kicker: 'Ce știi despre lumea din jur?',
      prompt: it.q, input: 'choice',
      choices: mkChoices(rnd, it.a, it.w), answer: it.a,
      hints: ['Gândește-te la ce ai văzut acasă, pe stradă sau la ce ți-au spus părinții.', 'Răspunsul începe cu „' + it.a.charAt(0).toUpperCase() + '”.'],
      success: 'Corect! Răspunsul este: ' + it.a + '.'
    };
  }

  /* ============================== PROVERB ================================ */
  function pProverb(level, rnd, theme, used) {
    var it = D.byLevel(D.PROVERBE, level < 2 ? 2 : level, rnd, used);
    return {
      type: 'proverb', title: 'Proverbul rupt în două', icon: '📜',
      kicker: 'Completează cuvântul care lipsește',
      prompt: it.q, input: 'choice',
      choices: mkChoices(rnd, it.a, it.w), answer: it.a,
      hints: ['Spune proverbul cu voce tare, pe rând, cu fiecare variantă.', 'Începe cu litera „' + it.a.charAt(0).toUpperCase() + '”.'],
      success: 'Așa e! „' + it.q.replace('___', it.a) + '”'
    };
  }

  /* ================================ ȘIRUL ================================ */
  function pSequence(level, rnd) {
    var seq = [], ans, rule, i, start, step, k;
    if (level === 1) {
      step = rnd.pick([1, 2, 5, 10]);
      if (rnd.chance(0.35)) {
        step = rnd.pick([1, 2, 5]);
        start = 5 * step + rnd.int(2, 25);
        for (i = 0; i < 5; i++) seq.push(start - i * step);
        ans = start - 5 * step; rule = 'scade cu ' + step;
      } else {
        start = rnd.int(1, 10);
        for (i = 0; i < 5; i++) seq.push(start + i * step);
        ans = start + 5 * step; rule = 'crește cu ' + step;
      }
    } else if (level === 2) {
      k = rnd.int(0, 2);
      if (k === 2) {
        start = rnd.int(1, 3);
        for (i = 0; i < 5; i++) seq.push(start * Math.pow(2, i));
        ans = start * 32; rule = 'fiecare număr este dublul celui dinainte';
      } else {
        step = rnd.pick([3, 4, 6, 7, 8, 9]);
        start = rnd.int(2, 12);
        for (i = 0; i < 5; i++) seq.push(start + i * step);
        ans = start + 5 * step; rule = 'crește cu ' + step;
      }
    } else {
      k = rnd.int(0, 3);
      if (k === 0) {
        for (i = 1; i <= 5; i++) seq.push(i * i);
        ans = 36; rule = 'sunt pătratele numerelor: 1×1, 2×2, 3×3 și așa mai departe';
      } else if (k === 1) {
        seq = [1, 1, 2, 3, 5]; ans = 8;
        rule = 'fiecare număr este suma celor două dinaintea lui';
      } else if (k === 2) {
        start = rnd.int(2, 5);
        for (i = 0; i < 5; i++) seq.push(start * Math.pow(3, i));
        ans = start * 243; rule = 'fiecare număr se înmulțește cu 3';
      } else {
        step = rnd.int(11, 25); start = rnd.int(100, 300);
        for (i = 0; i < 5; i++) seq.push(start + i * step);
        ans = start + 5 * step; rule = 'crește cu ' + step;
      }
    }
    return {
      type: 'sequence', title: 'Șirul secret', icon: '🔢',
      kicker: 'Ce număr urmează?',
      prompt: seq.join(' , ') + ' , <b>?</b>',
      input: 'number', answer: String(ans),
      hints: ['Uită-te ce se întâmplă de la un număr la următorul.', 'Regula este: ' + rule + '.'],
      success: 'Bravo! Regula era: ' + rule + '. Urma ' + ans + '.'
    };
  }

  /* =========================== NUMĂRARE VIZUALĂ ========================== */
  var ICONS = {
    star: { d: 'M12 1.6 L15 8.4 L22.4 9.2 L16.8 14.1 L18.5 21.4 L12 17.5 L5.5 21.4 L7.2 14.1 L1.6 9.2 L9 8.4 Z', c: '#fbbf24', n: 'stele' },
    gem:  { d: 'M12 1.8 L20.5 9 L12 22.2 L3.5 9 Z', c: '#38bdf8', n: 'cristale' },
    heart:{ d: 'M12 21.2 C 3.8 15 1.8 9.8 5.2 6.4 C 7.8 3.7 11 5.2 12 7.2 C 13 5.2 16.2 3.7 18.8 6.4 C 22.2 9.8 20.2 15 12 21.2 Z', c: '#f472b6', n: 'inimioare' },
    leaf: { d: 'M12 22 C 3.6 18 3 7.6 21 1.8 C 21 14 16.4 20 12 22 Z', c: '#4ade80', n: 'frunze' },
    bolt: { d: 'M13.6 1.8 L4 13.8 H10.6 L9.6 22.2 L20 8.8 H13 Z', c: '#a78bfa', n: 'fulgere' },
    coin: { d: 'M12 2 A10 10 0 1 1 11.9 2 Z', c: '#f59e0b', n: 'monede' }
  };
  function drawIcons(rnd, list) {
    /* list = [{key, count}] ; le amestecă pe o grilă 7×4 cu mici abateri */
    var cells = [], i, j;
    for (j = 0; j < 4; j++) for (i = 0; i < 7; i++) cells.push([i, j]);
    cells = shuffleWith(rnd, cells);
    var items = [], k, n;
    for (k = 0; k < list.length; k++) for (n = 0; n < list[k].count; n++) items.push(list[k].key);
    items = shuffleWith(rnd, items);
    var out = '<rect width="490" height="270" rx="16" fill="#fbf7ff"/>';
    for (n = 0; n < items.length && n < cells.length; n++) {
      var ic = ICONS[items[n]];
      var cx = 40 + cells[n][0] * 68 + (rnd() * 18 - 9);
      var cy = 42 + cells[n][1] * 62 + (rnd() * 14 - 7);
      var sc = 1.55 + rnd() * 0.25;
      var rot = (rnd() * 24 - 12).toFixed(1);
      out += '<g transform="translate(' + cx.toFixed(1) + ',' + cy.toFixed(1) + ') rotate(' + rot + ') scale(' + sc.toFixed(2) + ') translate(-12,-12)">' +
             '<path d="' + ic.d + '" fill="' + ic.c + '" stroke="rgba(0,0,0,.18)" stroke-width="1"/></g>';
    }
    return svgBox(490, 270, out);
  }
  function pCount(level, rnd) {
    var keys = shuffleWith(rnd, ['star', 'gem', 'heart', 'leaf', 'bolt', 'coin']);
    var A = keys[0], B = keys[1], na, nb, ans, txt, hint2;
    if (level === 1) {
      na = rnd.int(6, 13);
      txt = 'Câte ' + ICONS[A].n + ' vezi în imagine?';
      ans = na;
      hint2 = 'Numără pe rânduri, de sus în jos.';
      return countOut(txt, ans, drawIcons(rnd, [{ key: A, count: na }]), hint2);
    }
    if (level === 2) {
      na = rnd.int(7, 14); nb = rnd.int(4, 9);
      txt = 'Câte ' + ICONS[A].n + ' sunt în imagine? (Ai grijă, sunt amestecate!)';
      ans = na;
      hint2 = 'Ignoră celelalte forme și numără doar ' + ICONS[A].n + '.';
      return countOut(txt, ans, drawIcons(rnd, [{ key: A, count: na }, { key: B, count: nb }]), hint2);
    }
    na = rnd.int(9, 15); nb = rnd.int(3, 8);
    if (rnd.chance(0.5)) {
      ans = na + nb;
      txt = 'Câte forme sunt în total în imagine?';
      hint2 = 'Numără-le separat și apoi adună.';
    } else {
      ans = na - nb;
      txt = 'Cu cât sunt mai multe ' + ICONS[A].n + ' decât ' + ICONS[B].n + '?';
      hint2 = 'Numără fiecare fel, apoi scade numărul mai mic din cel mare.';
    }
    return countOut(txt, ans, drawIcons(rnd, [{ key: A, count: na }, { key: B, count: nb }]), hint2);
  }
  function countOut(txt, ans, svg, hint2) {
    return {
      type: 'count', title: 'Ochi de vultur', icon: '👁️',
      kicker: 'Numără cu atenție',
      prompt: txt, svg: svg, input: 'number', answer: String(ans),
      hints: ['Atinge fiecare formă cu degetul pe ecran, ca să nu numeri de două ori.', hint2],
      success: 'Perfect! Sunt exact ' + ans + '.'
    };
  }

  /* =============================== CEASUL ================================ */
  function drawClock(h, m) {
    var i, s = '<rect width="280" height="280" rx="20" fill="#fbf7ff"/>';
    s += '<circle cx="140" cy="140" r="122" fill="#fff" stroke="#7c3aed" stroke-width="9"/>';
    s += '<circle cx="140" cy="140" r="108" fill="none" stroke="#ede9fe" stroke-width="3"/>';
    for (i = 0; i < 60; i++) {
      var a = i * 6 * Math.PI / 180, big = (i % 5 === 0);
      var r1 = big ? 96 : 103, r2 = 110;
      s += '<line x1="' + (140 + Math.sin(a) * r1).toFixed(1) + '" y1="' + (140 - Math.cos(a) * r1).toFixed(1) +
           '" x2="' + (140 + Math.sin(a) * r2).toFixed(1) + '" y2="' + (140 - Math.cos(a) * r2).toFixed(1) +
           '" stroke="' + (big ? '#7c3aed' : '#c4b5fd') + '" stroke-width="' + (big ? 4 : 2) + '" stroke-linecap="round"/>';
    }
    for (i = 1; i <= 12; i++) {
      var an = i * 30 * Math.PI / 180;
      s += '<text x="' + (140 + Math.sin(an) * 78).toFixed(1) + '" y="' + (140 - Math.cos(an) * 78 + 9).toFixed(1) +
           '" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="24" font-weight="600" fill="#4c1d95">' + i + '</text>';
    }
    var ha = ((h % 12) * 30 + m * 0.5) * Math.PI / 180;
    var ma = (m * 6) * Math.PI / 180;
    s += '<line x1="140" y1="140" x2="' + (140 + Math.sin(ha) * 52).toFixed(1) + '" y2="' + (140 - Math.cos(ha) * 52).toFixed(1) +
         '" stroke="#1b1040" stroke-width="11" stroke-linecap="round"/>';
    s += '<line x1="140" y1="140" x2="' + (140 + Math.sin(ma) * 82).toFixed(1) + '" y2="' + (140 - Math.cos(ma) * 82).toFixed(1) +
         '" stroke="#ef4444" stroke-width="7" stroke-linecap="round"/>';
    s += '<circle cx="140" cy="140" r="9" fill="#1b1040"/><circle cx="140" cy="140" r="4" fill="#fbbf24"/>';
    return svgBox(280, 280, s);
  }
  function fmtHM(h, m) { return h + ':' + (m < 10 ? '0' : '') + m; }
  function pClock(level, rnd) {
    var h = rnd.int(1, 12), m, opts = [], ans, txt, i;
    if (level === 1) {
      m = 0; txt = 'Ce oră arată ceasul?';
      ans = fmtHM(h, 0);
      var used = { }; used[h] = 1;
      while (opts.length < 3) { var x = rnd.int(1, 12); if (!used[x]) { used[x] = 1; opts.push(fmtHM(x, 0)); } }
    } else if (level === 2) {
      m = rnd.pick([0, 15, 30, 45]); txt = 'Ce oră arată ceasul?';
      ans = fmtHM(h, m);
      var seen = {}; seen[ans] = 1;
      while (opts.length < 3) {
        var hh = rnd.chance(0.5) ? h : rnd.int(1, 12), mm = rnd.pick([0, 15, 30, 45]);
        var v = fmtHM(hh, mm);
        if (!seen[v]) { seen[v] = 1; opts.push(v); }
      }
    } else {
      m = rnd.pick([5, 10, 20, 25, 35, 40, 50, 55]);
      var plus = rnd.pick([10, 15, 20, 30]);
      var tot = (h % 12) * 60 + m + plus;
      var nh = Math.floor(tot / 60) % 12; if (nh === 0) nh = 12;
      var nm = tot % 60;
      txt = 'Ceasul arată ora din imagine. Ce oră va fi peste ' + plus + ' de minute?';
      ans = fmtHM(nh, nm);
      var s3 = {}; s3[ans] = 1;
      while (opts.length < 3) {
        var d = rnd.pick([-20, -15, -10, -5, 5, 10, 15, 60]);
        var t2 = tot + d, h2 = Math.floor(((t2 % 720) + 720) % 720 / 60); if (h2 === 0) h2 = 12;
        var m2 = ((t2 % 60) + 60) % 60, v2 = fmtHM(h2, m2);
        if (!s3[v2]) { s3[v2] = 1; opts.push(v2); }
      }
    }
    return {
      type: 'clock', title: 'Ceasul din turn', icon: '⏰',
      kicker: 'Citește acele ceasului',
      prompt: txt, svg: drawClock(h, m), input: 'choice',
      choices: shuffleWith(rnd, [ans].concat(opts)), answer: ans,
      hints: ['Acul scurt și gros arată ORA, cel roșu și lung arată MINUTELE.', 'Fiecare linie mică înseamnă un minut, iar de la un număr la altul sunt 5 minute.'],
      success: 'Corect! Ceasul arată ' + ans + '.'
    };
  }

  /* ============================= GEOMETRIE =============================== */
  var POLY_NAME = { 3: 'triunghi', 4: 'pătrat', 5: 'pentagon', 6: 'hexagon', 8: 'octogon' };
  function polyPts(n, cx, cy, r, rot) {
    var p = [], i;
    for (i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2 - Math.PI / 2 + (rot || 0);
      p.push((cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1));
    }
    return p.join(' ');
  }
  function pShapes(level, rnd) {
    var COLORS = ['#a78bfa', '#38bdf8', '#4ade80', '#fbbf24', '#f472b6', '#fb923c'];
    var s, i, ans, txt, hint2, svg;
    if (level === 1) {
      var nTri = rnd.int(3, 6), nSq = rnd.int(2, 5), nCi = rnd.int(2, 5);
      var bag = [];
      for (i = 0; i < nTri; i++) bag.push('t');
      for (i = 0; i < nSq; i++) bag.push('s');
      for (i = 0; i < nCi; i++) bag.push('c');
      bag = shuffleWith(rnd, bag);
      s = '<rect width="490" height="230" rx="16" fill="#fbf7ff"/>';
      for (i = 0; i < bag.length; i++) {
        var cx = 46 + (i % 7) * 66 + (rnd() * 12 - 6);
        var cy = 60 + Math.floor(i / 7) * 78 + (rnd() * 10 - 5);
        var col = COLORS[i % COLORS.length];
        if (bag[i] === 't') s += '<polygon points="' + polyPts(3, cx, cy, 27, 0) + '" fill="' + col + '" stroke="#00000022" stroke-width="2"/>';
        else if (bag[i] === 's') s += '<rect x="' + (cx - 22) + '" y="' + (cy - 22) + '" width="44" height="44" rx="5" fill="' + col + '" stroke="#00000022" stroke-width="2"/>';
        else s += '<circle cx="' + cx + '" cy="' + cy + '" r="24" fill="' + col + '" stroke="#00000022" stroke-width="2"/>';
      }
      return {
        type: 'shapes', title: 'Figuri geometrice', icon: '📐', kicker: 'Recunoaște formele',
        prompt: 'Câte <b>triunghiuri</b> sunt în imagine?', svg: svgBox(490, 230, s),
        input: 'number', answer: String(nTri),
        hints: ['Triunghiul are exact 3 laturi și 3 colțuri.', 'Numără doar formele ascuțite, cu trei vârfuri.'],
        success: 'Corect! Sunt ' + nTri + ' triunghiuri.'
      };
    }
    if (level === 2) {
      var n = rnd.pick([3, 4, 5, 6, 8]);
      svg = svgBox(300, 230, '<rect width="300" height="230" rx="16" fill="#fbf7ff"/>' +
        '<polygon points="' + polyPts(n, 150, 115, 82, 0) + '" fill="#c4b5fd" stroke="#5b21b6" stroke-width="6" stroke-linejoin="round"/>');
      if (rnd.chance(0.5)) {
        return {
          type: 'shapes', title: 'Figuri geometrice', icon: '📐', kicker: 'Numără laturile',
          prompt: 'Câte <b>laturi</b> are figura de mai jos?', svg: svg,
          input: 'number', answer: String(n),
          hints: ['O latură este o linie dreaptă dintre două colțuri.', 'Numără colțurile: sunt tot atâtea câte laturi.'],
          success: 'Da! Figura are ' + n + ' laturi și se numește ' + POLY_NAME[n] + '.'
        };
      }
      var wrongN = shuffleWith(rnd, [3, 4, 5, 6, 8].filter(function (x) { return x !== n; })).slice(0, 3);
      return {
        type: 'shapes', title: 'Figuri geometrice', icon: '📐', kicker: 'Cum se numește figura?',
        prompt: 'Cum se numește această figură geometrică?', svg: svg,
        input: 'choice',
        choices: shuffleWith(rnd, [POLY_NAME[n]].concat(wrongN.map(function (x) { return POLY_NAME[x]; }))),
        answer: POLY_NAME[n],
        hints: ['Numără întâi laturile figurii.', 'Are ' + n + ' laturi.'],
        success: 'Exact, este un ' + POLY_NAME[n] + ' (are ' + n + ' laturi).'
      };
    }
    var L = rnd.int(6, 18), l = rnd.int(3, L - 1);
    var perim = rnd.chance(0.5);
    ans = perim ? 2 * (L + l) : L * l;
    txt = perim ? 'Cât este <b>perimetrul</b> dreptunghiului?' : 'Cât este <b>aria</b> dreptunghiului?';
    hint2 = perim ? 'Perimetrul = L + l + L + l, adică 2 × (L + l).' : 'Aria = lungimea × lățimea.';
    s = '<rect width="360" height="230" rx="16" fill="#fbf7ff"/>' +
        '<rect x="70" y="55" width="220" height="120" fill="#ddd6fe" stroke="#5b21b6" stroke-width="6"/>' +
        '<text x="180" y="42" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="24" fill="#4c1d95">' + L + ' cm</text>' +
        '<text x="40" y="122" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="24" fill="#4c1d95">' + l + '</text>' +
        '<text x="40" y="146" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="18" fill="#7c3aed">cm</text>' +
        '<text x="180" y="205" text-anchor="middle" font-family="Nunito, sans-serif" font-size="17" fill="#7c3aed">dreptunghi</text>';
    return {
      type: 'shapes', title: 'Geometrie', icon: '📐', kicker: perim ? 'Perimetru' : 'Arie',
      prompt: txt + ' (L = ' + L + ' cm, l = ' + l + ' cm)', svg: svgBox(360, 230, s),
      input: 'number', answer: String(ans),
      hints: [hint2, 'Calculul este: ' + (perim ? '2 × (' + L + ' + ' + l + ')' : L + ' × ' + l) + '.'],
      success: 'Corect! ' + (perim ? 'Perimetrul' : 'Aria') + ' este ' + ans + (perim ? ' cm.' : ' cm².')
    };
  }

  /* ================================ BANI ================================= */
  function pMoney(level, rnd) {
    var pret, buc, plata, ans, txt, obj;
    var OBIECTE = [['o acadea', 3], ['un baton de ciocolată', 5], ['un caiet', 4], ['un creion', 2], ['o carte de povești', 12], ['o minge', 15], ['un suc', 6]];
    obj = rnd.pick(OBIECTE);
    if (level === 1) {
      pret = obj[1]; buc = rnd.int(2, 4); ans = pret * buc;
      txt = 'Cumperi ' + buc + ' bucăți din ' + obj[0] + '. Una costă ' + pret + ' lei. Câți lei plătești în total?';
      return moneyOut(txt, ans, ['Adună prețul de ' + buc + ' ori: ' + new Array(buc + 1).join(pret + ' + ').slice(0, -3) + '.', 'Sau înmulțește: ' + buc + ' × ' + pret + '.']);
    }
    if (level === 2) {
      pret = obj[1] + rnd.int(0, 4); plata = 50;
      buc = rnd.int(2, Math.max(2, Math.min(5, Math.floor((plata - 3) / pret))));
      ans = plata - pret * buc;
      txt = 'Ai o bancnotă de 50 de lei și cumperi ' + buc + ' bucăți din ' + obj[0] + ', câte ' + pret + ' lei una. Câți lei rest primești?';
      return moneyOut(txt, ans, ['Întâi află cât costă tot: ' + buc + ' × ' + pret + '.', 'Apoi scade din 50 de lei.']);
    }
    pret = obj[1] * 2 + rnd.int(1, 6); plata = 100;
    var maxBuc = Math.floor((plata - 5) / pret);
    if (maxBuc < 2) { pret = rnd.int(12, 24); maxBuc = Math.floor((plata - 5) / pret); }
    buc = rnd.int(2, Math.min(6, maxBuc));
    ans = plata - pret * buc;
    txt = 'Ai 100 de lei. Cumperi ' + buc + ' bucăți din ' + obj[0] + ', câte ' + pret + ' lei fiecare. Câți lei îți rămân?';
    return moneyOut(txt, ans, ['Calculează întâi ' + buc + ' × ' + pret + ' lei.', 'Apoi scade rezultatul din 100.']);
  }
  function moneyOut(txt, ans, hints) {
    return {
      type: 'money', title: 'Problema cu bani', icon: '🪙', kicker: 'Socotește lei',
      prompt: txt, input: 'number', answer: String(ans), hints: hints,
      success: 'Corect! Răspunsul este ' + ans + ' lei.'
    };
  }

  /* =============================== INTRUSUL ============================== */
  var GRUPE = [
    { lv: 1, tema: 'animale de casă', in: ['pisică', 'câine', 'hamster', 'papagal'], out: 'tigru' },
    { lv: 1, tema: 'fructe', in: ['măr', 'pară', 'cireașă', 'banană'], out: 'morcov' },
    { lv: 1, tema: 'culori', in: ['roșu', 'albastru', 'verde', 'galben'], out: 'pătrat' },
    { lv: 1, tema: 'lucruri din ghiozdan', in: ['creion', 'caiet', 'gumă', 'riglă'], out: 'frigider' },
    { lv: 2, tema: 'păsări', in: ['vrabie', 'rândunică', 'cioară', 'barză'], out: 'liliac' },
    { lv: 2, tema: 'instrumente muzicale', in: ['vioară', 'pian', 'chitară', 'tobă'], out: 'ciocan' },
    { lv: 2, tema: 'planete', in: ['Marte', 'Venus', 'Jupiter', 'Saturn'], out: 'Luna' },
    { lv: 2, tema: 'legume', in: ['roșie', 'castravete', 'ardei', 'ceapă'], out: 'zmeură' },
    { lv: 3, tema: 'numere pare', in: ['12', '48', '30', '76'], out: '35' },
    { lv: 3, tema: 'orașe din România', in: ['Cluj-Napoca', 'Timișoara', 'Constanța', 'Craiova'], out: 'Budapesta' },
    { lv: 3, tema: 'mamifere', in: ['delfin', 'liliac', 'balenă', 'cal'], out: 'crocodil' },
    { lv: 3, tema: 'unități de măsură pentru lungime', in: ['metru', 'centimetru', 'kilometru', 'milimetru'], out: 'litru' }
  ];
  function pLogic(level, rnd, theme, used) {
    var g = D.byLevel(GRUPE.map(function (x) { return { lv: x.lv, q: x.tema, ref: x }; }), level, rnd, used).ref;
    var trei = shuffleWith(rnd, g.in).slice(0, 3);
    return {
      type: 'logic', title: 'Găsește intrusul', icon: '🕵️',
      kicker: 'Un cuvânt nu se potrivește cu celelalte',
      prompt: 'Care cuvânt <b>nu se potrivește</b> în grup?',
      input: 'choice',
      choices: shuffleWith(rnd, trei.concat([g.out])),
      answer: g.out,
      hints: ['Întreabă-te: ce au trei dintre ele în comun?', 'Trei dintre ele sunt din grupa „' + g.tema + '”.'],
      success: 'Exact! Celelalte sunt ' + g.tema + ', iar „' + g.out + '” nu face parte din grup.'
    };
  }

  /* ============================== ANAGRAMĂ =============================== */
  function pAnagram(level, rnd, theme) {
    var bank = D.CUVINTE[theme] || D.CUVINTE.mister;
    var pool = bank.filter(function (x) { return level === 1 ? x[0].length <= 6 : (level === 2 ? x[0].length <= 8 : true); });
    if (!pool.length) pool = bank;
    var it = pool[Math.floor(rnd() * pool.length)];
    var word = it[0], letters = shuffleWith(rnd, word.split(''));
    if (letters.join('') === word) letters = shuffleWith(rnd, letters);
    return {
      type: 'anagram', title: 'Cuvântul amestecat', icon: '🔤',
      kicker: 'Apasă literele în ordinea corectă',
      prompt: it[1] + '.<br><span class="small-note">Are ' + word.length + ' litere.</span>',
      input: 'letters', letters: letters, answer: word,
      hints: ['Prima literă este „' + word.charAt(0) + '”.', 'Cuvântul este: ' + word.charAt(0) + word.charAt(1) + new Array(word.length - 1).join('•')],
      success: 'Bravo! Cuvântul era ' + word + '.'
    };
  }

  /* ============================== COD SECRET ============================= */
  var SIMBOLURI = ['★', '▲', '■', '●', '◆', '✚', '☾', '☀', '⚑', '✿', '❄', '♣'];
  function pCipher(level, rnd, theme) {
    var bank = D.CUVINTE[theme] || D.CUVINTE.mister;
    var pool = bank.filter(function (x) { return x[0].length <= (level === 1 ? 5 : 7); });
    if (!pool.length) pool = bank;
    var it = pool[Math.floor(rnd() * pool.length)];
    var word = it[0];
    var uniq = [], i, ch;
    for (i = 0; i < word.length; i++) { ch = word.charAt(i); if (uniq.indexOf(ch) < 0) uniq.push(ch); }

    var mapSym = {}, s, x, legend = '', code = '';
    var useNumbers = (level === 3);
    var syms = shuffleWith(rnd, SIMBOLURI);
    for (i = 0; i < uniq.length; i++) {
      mapSym[uniq[i]] = useNumbers ? String(uniq[i].charCodeAt(0) - 64) : syms[i];
    }
    var cols = uniq.length, cw = 74, W = Math.max(360, cols * cw + 40), H = 210;
    s = '<rect width="' + W + '" height="' + H + '" rx="16" fill="#fbf7ff"/>';
    s += '<text x="' + (W / 2) + '" y="30" text-anchor="middle" font-family="Nunito, sans-serif" font-size="16" font-weight="800" fill="#7c3aed">CHEIA CODULUI</text>';
    for (i = 0; i < uniq.length; i++) {
      x = 20 + i * cw + (W - 40 - cols * cw) / 2;
      s += '<rect x="' + x + '" y="44" width="' + (cw - 10) + '" height="62" rx="12" fill="#fff" stroke="#ddd6fe" stroke-width="3"/>';
      s += '<text x="' + (x + (cw - 10) / 2) + '" y="76" text-anchor="middle" font-size="26" fill="#4c1d95">' + mapSym[uniq[i]] + '</text>';
      s += '<text x="' + (x + (cw - 10) / 2) + '" y="99" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="20" font-weight="600" fill="#16a34a">' + uniq[i] + '</text>';
    }
    s += '<text x="' + (W / 2) + '" y="140" text-anchor="middle" font-family="Nunito, sans-serif" font-size="16" font-weight="800" fill="#7c3aed">MESAJUL SECRET</text>';
    var lw = Math.min(56, (W - 40) / word.length);
    for (i = 0; i < word.length; i++) {
      x = (W - word.length * lw) / 2 + i * lw;
      s += '<rect x="' + x + '" y="152" width="' + (lw - 6) + '" height="44" rx="10" fill="#ede9fe" stroke="#c4b5fd" stroke-width="2"/>';
      s += '<text x="' + (x + (lw - 6) / 2) + '" y="182" text-anchor="middle" font-size="' + (useNumbers ? 20 : 24) + '" fill="#4c1d95">' + mapSym[word.charAt(i)] + '</text>';
    }
    legend = useNumbers ? 'Fiecare număr este poziția literei în alfabet (A = 1, B = 2, C = 3 …).' : 'Fiecare semn înseamnă o literă.';
    return {
      type: 'cipher', title: 'Mesajul cifrat', icon: '🔐',
      kicker: legend,
      prompt: 'Descifrează mesajul folosind cheia. Indiciu: <i>' + it[1].toLowerCase() + '</i>.',
      svg: svgBox(W, H, s),
      input: 'letters', letters: shuffleWith(rnd, word.split('')), answer: word,
      hints: ['Ia semnele unul câte unul și caută-le în cheia de sus.', 'Cuvântul începe cu „' + word.charAt(0) + '”.'],
      success: 'Ai spart codul! Mesajul era ' + word + '.'
    };
  }

  /* ============================== ORDONARE =============================== */
  function pOrder(level, rnd) {
    var n = level === 1 ? 4 : 5, vals = [], v, i, guard = 0;
    var max = level === 1 ? 30 : (level === 2 ? 200 : 2000);
    while (vals.length < n && guard++ < 400) {
      v = rnd.int(level === 1 ? 1 : 10, max);
      if (vals.indexOf(v) < 0) vals.push(v);
    }
    var cresc = rnd.chance(0.6);
    var sorted = vals.slice().sort(function (a, b) { return cresc ? a - b : b - a; });
    return {
      type: 'order', title: 'Pune ordine', icon: '📊',
      kicker: cresc ? 'De la cel mai mic la cel mai mare' : 'De la cel mai mare la cel mai mic',
      prompt: 'Apasă numerele în ordine <b>' + (cresc ? 'crescătoare' : 'descrescătoare') + '</b>:',
      input: 'order',
      items: shuffleWith(rnd, vals).map(String),
      answer: sorted.map(String),
      orderHint: cresc ? 'Începe cu cel mai mic număr.' : 'Începe cu cel mai mare număr.',
      hints: ['Compară întâi câte cifre are fiecare număr.', (cresc ? 'Cel mai mic este ' : 'Cel mai mare este ') + sorted[0] + '.'],
      success: 'Perfect! Ordinea corectă: ' + sorted.join(' , ') + '.'
    };
  }

  /* ============================== POTRIVIRI ============================== */
  var PERECHI = [
    { lv: 1, tema: 'Potrivește animalul cu puiul lui', p: [['vacă', 'vițel'], ['oaie', 'miel'], ['cal', 'mânz'], ['pisică', 'pisoi'], ['câine', 'cățel'], ['găină', 'pui']] },
    { lv: 1, tema: 'Potrivește animalul cu sunetul lui', p: [['câine', 'ham-ham'], ['pisică', 'miau'], ['vacă', 'muu'], ['rață', 'mac-mac'], ['oaie', 'beee'], ['broască', 'oac-oac']] },
    { lv: 2, tema: 'Potrivește țara cu capitala ei', p: [['România', 'București'], ['Franța', 'Paris'], ['Italia', 'Roma'], ['Anglia', 'Londra'], ['Spania', 'Madrid'], ['Grecia', 'Atena']] },
    { lv: 2, tema: 'Potrivește animalul cu locul unde trăiește', p: [['cămilă', 'deșert'], ['pinguin', 'Polul Sud'], ['maimuță', 'junglă'], ['delfin', 'ocean'], ['cârtiță', 'sub pământ'], ['veveriță', 'pădure']] },
    { lv: 3, tema: 'Potrivește inventatorul cu invenția', p: [['Edison', 'becul'], ['Coandă', 'avionul cu reacție'], ['Bell', 'telefonul'], ['Gutenberg', 'tiparul'], ['frații Wright', 'avionul'], ['Marconi', 'radioul']] },
    { lv: 3, tema: 'Potrivește planeta cu descrierea', p: [['Marte', 'planeta roșie'], ['Saturn', 'are inele'], ['Jupiter', 'cea mai mare'], ['Mercur', 'cea mai apropiată de Soare'], ['Venus', 'cea mai fierbinte'], ['Neptun', 'cea mai îndepărtată']] },
    { lv: 3, tema: 'Potrivește opera cu autorul', p: [['Amintiri din copilărie', 'Ion Creangă'], ['Luceafărul', 'Mihai Eminescu'], ['D-l Goe', 'I. L. Caragiale'], ['Coloana Infinitului', 'C. Brâncuși']] }
  ];
  function pMatch(level, rnd, theme, used) {
    var set = D.byLevel(PERECHI.map(function (x) { return { lv: x.lv, q: x.tema, ref: x }; }), level, rnd, used).ref;
    var pairs = shuffleWith(rnd, set.p).slice(0, 4);
    return {
      type: 'match', title: 'Potrivește perechile', icon: '🧩',
      kicker: 'Apasă unul din stânga, apoi perechea lui din dreapta',
      prompt: set.tema + ':',
      input: 'match',
      pairs: pairs,
      left: shuffleWith(rnd, pairs.map(function (p) { return p[0]; })),
      right: shuffleWith(rnd, pairs.map(function (p) { return p[1]; })),
      answer: 'match',
      hints: ['Începe cu perechea de care ești cel mai sigur.', 'Prima pereche este: ' + pairs[0][0] + ' → ' + pairs[0][1] + '.'],
      success: 'Toate perechile sunt corecte!'
    };
  }


  /* ========================= SEIFUL CU CIFRU ============================ */
  /* Nu se tastează nimic: copilul rotește discul stânga-dreapta, exact ca
     la un seif adevărat, și trebuie să oprească pe numerele cerute. */
  function pDial(level, rnd) {
    var max = level === 1 ? 10 : (level === 2 ? 20 : 40);
    var count = level === 1 ? 2 : 3;
    var steps = [], used = {}, i, n, label, a, b, bmax, c, guard;
    var dir = rnd.chance(0.5) ? 1 : -1;
    for (i = 0; i < count; i++) {
      guard = 0;
      if (level === 3) {
        /* ținta e dată ca înmulțire; o generăm întâi, apoi verificăm unicitatea */
        do {
          a = rnd.int(2, 9);
          bmax = Math.floor((max - 1) / a);
          if (bmax < 2) { a = 2; bmax = Math.floor((max - 1) / 2); }
          b = rnd.int(2, bmax);
          n = a * b;
          guard++;
        } while (used[n] && guard < 90);
        label = a + ' × ' + b;
      } else {
        do { n = rnd.int(1, max - 1); guard++; } while (used[n] && guard < 90);
        label = String(n);
        if (level === 2 && n >= 5 && rnd.chance(0.5)) {
          c = rnd.int(2, n - 2);
          label = c + ' + ' + (n - c);
        }
      }
      used[n] = 1;
      steps.push({ dir: dir, n: n, label: label });
      dir = -dir;
    }
    return {
      type: 'dial', title: 'Seiful cu cifru', icon: '🔐',
      kicker: 'Rotește discul cu săgețile sau trăgând de el',
      prompt: 'Deschide seiful rotind discul, pas cu pas:',
      input: 'dial', max: max, steps: steps, answer: 'dial',
      hints: [
        'Ține apăsat pe o săgeată ca discul să se rotească mai repede.',
        'Prima oprire este la ' + steps[0].n + ', rotind spre ' + (steps[0].dir > 0 ? 'dreapta' : 'stânga') + '.'
      ],
      success: 'CLIC! Seiful s-a deschis.'
    };
  }

  /* ========================== PANOUL CU MANETE ========================== */
  /* Trei manete pe care copilul le trage în sus/jos până arată rezultatul
     calculului scris pe fiecare. */
  function pSliders(level, rnd) {
    var maxv = level === 1 ? 10 : (level === 2 ? 20 : 30);
    var levers = [], i;
    for (i = 0; i < 3; i++) {
      var a, b, v, lab;
      if (level === 1) {
        a = rnd.int(1, 6); b = rnd.int(1, 4); v = a + b; lab = a + ' + ' + b;
      } else if (level === 2) {
        if (rnd.chance(0.5)) { a = rnd.int(2, 5); b = rnd.int(2, 4); v = a * b; lab = a + ' × ' + b; }
        else { a = rnd.int(12, maxv); b = rnd.int(2, 9); v = a - b; lab = a + ' − ' + b; }
      } else {
        if (rnd.chance(0.5)) { a = rnd.int(3, 6); b = rnd.int(3, 5); v = a * b; lab = a + ' × ' + b; }
        else { b = rnd.int(2, 6); v = rnd.int(3, 5); a = b * v; lab = a + ' : ' + b; }
      }
      if (v > maxv) v = maxv;
      levers.push({ label: lab, value: v });
    }
    return {
      type: 'sliders', title: 'Panoul cu manete', icon: '🎚️',
      kicker: 'Trage fiecare manetă până la numărul potrivit',
      prompt: 'Fiecare manetă trebuie să arate rezultatul calculului scris sub ea.',
      input: 'sliders', levers: levers, max: maxv,
      answer: levers.map(function (l) { return String(l.value); }),
      hints: ['Poți trage de mâner sau poți apăsa pe butoanele + și −.',
              'Prima manetă trebuie să arate ' + levers[0].value + '.'],
      success: 'Toate manetele sunt la locul lor!'
    };
  }


  /* ============================== BALANȚA =============================== */
  /* Copilul pune greutăți pe talerul din dreapta până când balanța stă
     dreaptă. Talerul se înclină în timp real. */
  function pWeights(level, rnd) {
    var set = level === 1 ? [1, 2, 5] : (level === 2 ? [1, 2, 5, 10] : [1, 2, 5, 10, 20]);
    var target;
    if (level === 1) target = rnd.int(6, 14);
    else if (level === 2) target = rnd.int(12, 33);
    else target = rnd.int(24, 68);
    return {
      type: 'weights', title: 'Balanța din depozit', icon: '⚖️',
      kicker: 'Apasă greutățile ca să le pui pe taler; apasă din nou ca să le iei',
      prompt: 'Pune pe talerul din dreapta exact <b>' + target + ' kg</b>, ca balanța să stea dreaptă.',
      input: 'weights', set: set, target: target, answer: String(target),
      hints: ['Începe cu greutățile mari, apoi completează cu cele mici.',
              'Încearcă ' + Math.floor(target / set[set.length - 1]) + ' greutăți de ' + set[set.length - 1] + ' kg pentru început.'],
      success: 'Balanța stă perfect dreaptă la ' + target + ' kg!'
    };
  }

  /* ============================== DISPECER =============================== */
  var GEN = {
    math: pMath, riddle: pRiddle, culture: pCulture, proverb: pProverb,
    sequence: pSequence, count: pCount, clock: pClock, shapes: pShapes,
    money: pMoney, logic: pLogic, anagram: pAnagram, cipher: pCipher,
    order: pOrder, match: pMatch,
    dial: pDial, sliders: pSliders, weights: pWeights
  };
  var ALL_TYPES = ['math', 'riddle', 'culture', 'sequence', 'count', 'clock', 'shapes', 'money', 'logic',
                   'anagram', 'cipher', 'order', 'match', 'proverb', 'dial', 'sliders', 'weights'];
  /* tipuri potrivite pentru clasele mici (fără proverbe) */
  var TYPES_L1 = ['math', 'riddle', 'culture', 'sequence', 'count', 'clock', 'shapes', 'logic',
                  'anagram', 'cipher', 'order', 'match', 'money', 'dial', 'sliders', 'weights'];

  function make(type, level, rnd, theme, used) {
    var fn = GEN[type] || GEN.math;
    var p;
    try {
      p = fn(level, rnd, theme || 'mister', used || {});
    } catch (e) {
      p = pMath(level, rnd);
    }
    if (!p.hints) p.hints = ['Citește încă o dată cu atenție.', 'Nu te grăbi, ești aproape!'];
    p.svg = p.svg || null;
    return p;
  }

  function typesFor(level) { return level === 1 ? TYPES_L1.slice() : ALL_TYPES.slice(); }

  global.Puzzles = {
    make: make,
    typesFor: typesFor,
    ALL_TYPES: ALL_TYPES,
    shuffleWith: shuffleWith
  };
})(window);
