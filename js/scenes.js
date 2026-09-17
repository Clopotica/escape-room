/* =====================================================================
   scenes.js — ilustrațiile camerelor, desenate în SVG.
   Fiecare scenă are 4 obiecte interactive (hotspot) și o ușă.

   Contract cu motorul jocului (game.js):
     .hotspot[data-slot="0..3"][data-bx][data-by]  → obiect de rezolvat
     .door-group[data-bx][data-by]                 → ușa finală
     g.overlay                                     → aici se pun insignele
   ===================================================================== */
(function (global) {
  'use strict';

  var VB = '0 0 1000 560';

  /* Aceeași scenă poate apărea de mai multe ori în pagină (miniaturi pe hartă
     + scena mare). Dacă degradeurile ar păstra același id, browserul le-ar
     confunda, așa că fiecare scenă primește un sufix unic pentru toate
     id-urile ei și pentru toate referințele url(#...). */
  var uid = 0;
  function wrap(defs, body) {
    var svg = '<svg class="scene" viewBox="' + VB + '" xmlns="http://www.w3.org/2000/svg" ' +
              'preserveAspectRatio="xMidYMid meet">' +
              '<defs>' + defsCommon() + defs + '</defs>' + body +
              '<g class="extra-slot"></g>' +
              '<rect width="1000" height="560" fill="url(#vignette)" pointer-events="none"/>' +
              '<g class="overlay"></g></svg>';
    var n = '_' + (++uid);
    return svg
      .replace(/id="([A-Za-z][\w-]*)"/g, function (m, id) { return 'id="' + id + n + '"'; })
      .replace(/url\(#([A-Za-z][\w-]*)\)/g, function (m, id) { return 'url(#' + id + n + ')'; });
  }
  function defsCommon() {
    return '<radialGradient id="vignette" cx="50%" cy="45%" r="75%">' +
             '<stop offset="55%" stop-color="#000" stop-opacity="0"/>' +
             '<stop offset="100%" stop-color="#000" stop-opacity=".42"/>' +
           '</radialGradient>' +
           '<linearGradient id="badgeGrad" x1="0" y1="0" x2="0" y2="1">' +
             '<stop offset="0%" stop-color="#bbf7d0"/><stop offset="100%" stop-color="#22c55e"/>' +
           '</linearGradient>' +
           '<filter id="soft" x="-40%" y="-40%" width="180%" height="180%">' +
             '<feGaussianBlur stdDeviation="9"/></filter>' +
           '<filter id="soft2" x="-40%" y="-40%" width="180%" height="180%">' +
             '<feGaussianBlur stdDeviation="22"/></filter>';
  }
  /* un obiect interactiv */
  function hs(slot, label, bx, by, hit, art) {
    return '<g class="hotspot" data-slot="' + slot + '" data-bx="' + bx + '" data-by="' + by + '" ' +
           'tabindex="0" role="button" aria-label="' + label + '">' +
           '<rect class="hit" x="' + hit[0] + '" y="' + hit[1] + '" width="' + hit[2] + '" height="' + hit[3] + '" rx="14"/>' +
           '<g class="art">' + art + '</g></g>';
  }
  /* ușa finală */
  function door(bx, by, hit, art) {
    return '<g class="door-group" data-door="1" data-bx="' + bx + '" data-by="' + by + '" ' +
           'tabindex="0" role="button" aria-label="Ușa de ieșire">' +
           '<rect class="hit" x="' + hit[0] + '" y="' + hit[1] + '" width="' + hit[2] + '" height="' + hit[3] + '" rx="14"/>' +
           '<g class="door-body">' + art + '</g></g>';
  }
  /* mici ajutoare de desen */
  function stars(n, x0, y0, w, h, seedTxt) {
    var s = '', i, r = 1;
    function rnd() { r = (r * 9301 + 49297) % 233280; return r / 233280; }
    r = (seedTxt || 7) * 977 % 233280;
    for (i = 0; i < n; i++) {
      var x = (x0 + rnd() * w).toFixed(0), y = (y0 + rnd() * h).toFixed(0);
      var rad = (0.9 + rnd() * 1.9).toFixed(1);
      s += '<circle class="twinkle d' + (i % 4) + '" cx="' + x + '" cy="' + y + '" r="' + rad + '" fill="#fff"/>';
    }
    return s;
  }
  function bricks(x, y, w, h, bw, bh, fill, line) {
    var s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"/>';
    var row = 0;
    for (var yy = y; yy < y + h; yy += bh, row++) {
      s += '<line x1="' + x + '" y1="' + yy + '" x2="' + (x + w) + '" y2="' + yy + '" stroke="' + line + '" stroke-width="2"/>';
      for (var xx = x + (row % 2 ? bw / 2 : 0); xx < x + w; xx += bw) {
        s += '<line x1="' + xx.toFixed(0) + '" y1="' + yy + '" x2="' + xx.toFixed(0) + '" y2="' + Math.min(yy + bh, y + h) + '" stroke="' + line + '" stroke-width="2"/>';
      }
    }
    return s;
  }
  function torch(x, y, scale) {
    var s = '<g transform="translate(' + x + ',' + y + ') scale(' + (scale || 1) + ')">';
    s += '<ellipse cx="0" cy="-46" rx="52" ry="52" fill="#fb923c" opacity=".22" filter="url(#soft2)"/>';
    s += '<rect x="-6" y="-16" width="12" height="56" rx="4" fill="#78350f"/>';
    s += '<path d="M-16 -16 h32 l-5 -13 h-22 Z" fill="#57534e"/>';
    s += '<g class="flicker"><path d="M0 -74 C 13 -56 17 -44 12 -33 C 8 -24 -8 -24 -12 -33 C -17 -44 -13 -56 0 -74 Z" fill="#fbbf24"/>';
    s += '<path d="M0 -62 C 7 -50 9 -43 6 -37 C 3 -31 -3 -31 -6 -37 C -9 -43 -7 -50 0 -62 Z" fill="#fef3c7"/></g>';
    return s + '</g>';
  }
  /* ATENȚIE: clasele de animație (floaty, sway, spin, twinkle, bubble) pun
     un `transform` din CSS, care ar anula un atribut transform de pe același
     element. De aceea poziționăm mereu într-un <g> exterior, iar animația o
     punem pe un <g> interior — exact ce face funcția `at`. */
  function at(x, y, cls, inner, scale) {
    return '<g transform="translate(' + x + ',' + y + ')' + (scale ? ' scale(' + scale + ')' : '') + '">' +
           '<g class="' + (cls || '') + '">' + inner + '</g></g>';
  }

  var SCENES = {};

  /* ========================= 1. PIRAMIDA FARAONULUI ====================== */
  SCENES.piramida = function () {
    var defs =
      '<linearGradient id="pz-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c8952f"/><stop offset="55%" stop-color="#a9762a"/><stop offset="100%" stop-color="#7a5320"/></linearGradient>' +
      '<linearGradient id="pz-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8a6224"/><stop offset="100%" stop-color="#523716"/></linearGradient>' +
      '<linearGradient id="pz-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fde68a"/><stop offset="45%" stop-color="#f6c445"/><stop offset="100%" stop-color="#b8860b"/></linearGradient>' +
      '<linearGradient id="pz-door" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#8a6224"/><stop offset="50%" stop-color="#b07f2c"/><stop offset="100%" stop-color="#6b4718"/></linearGradient>';

    var b = '<rect width="1000" height="560" fill="url(#pz-wall)"/>' +
      bricks(0, 0, 1000, 440, 96, 56, 'none', 'rgba(80,50,10,.30)') +
      '<rect y="430" width="1000" height="130" fill="url(#pz-floor)"/>' +
      '<path d="M0 430 L1000 430 L1000 448 L0 448 Z" fill="rgba(0,0,0,.25)"/>' +
      /* dâre de lumină */
      '<path d="M120 0 L260 0 L200 440 L150 440 Z" fill="#ffe9a8" opacity=".10"/>' +
      '<path d="M640 0 L740 0 L700 440 L660 440 Z" fill="#ffe9a8" opacity=".08"/>' +
      torch(180, 210, 1) + torch(612, 200, .9) +
      /* firicele de praf */
      '<g opacity=".5">' + stars(26, 60, 40, 880, 380, 3) + '</g>';

    /* --- statuia lui Anubis --- */
    var anubis =
      '<rect x="52" y="392" width="118" height="48" rx="6" fill="#6b4718"/>' +
      '<rect x="60" y="376" width="102" height="20" rx="4" fill="#8a6224"/>' +
      '<path d="M78 376 L144 376 L136 250 L86 250 Z" fill="url(#pz-gold)"/>' +
      '<rect x="86" y="252" width="50" height="10" fill="#1f2937"/>' +
      '<path d="M92 252 q19 -26 38 0 Z" fill="#111827"/>' +
      '<path d="M96 250 c-4 -34 4 -52 15 -52 c11 0 19 18 15 52 Z" fill="#1f2937"/>' +
      '<path d="M92 200 l6 -44 l16 26 Z" fill="#1f2937"/>' +
      '<path d="M130 200 l-6 -44 l-16 26 Z" fill="#1f2937"/>' +
      '<circle cx="104" cy="216" r="3.4" fill="#fbbf24"/><circle cx="118" cy="216" r="3.4" fill="#fbbf24"/>' +
      '<path d="M104 228 q7 8 14 0" stroke="#fbbf24" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      '<rect x="84" y="284" width="54" height="9" fill="#0f172a" opacity=".55"/>' +
      '<rect x="84" y="312" width="54" height="9" fill="#0f172a" opacity=".55"/>';

    /* --- sarcofagul --- */
    var sarcofag =
      '<ellipse cx="292" cy="446" rx="86" ry="14" fill="#000" opacity=".3"/>' +
      '<path d="M232 434 L232 236 q60 -84 120 0 L352 434 Z" fill="#8a6224"/>' +
      '<path d="M240 428 L240 240 q52 -72 104 0 L344 428 Z" fill="url(#pz-gold)"/>' +
      '<path d="M258 268 q34 -44 68 0 l0 34 q-34 -30 -68 0 Z" fill="#1e3a8a"/>' +
      '<path d="M262 300 q30 -22 60 0 l0 46 q-30 26 -60 0 Z" fill="#f6c445"/>' +
      '<circle cx="278" cy="318" r="5" fill="#0f172a"/><circle cx="306" cy="318" r="5" fill="#0f172a"/>' +
      '<path d="M276 338 q16 10 32 0" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<rect x="270" y="350" width="44" height="12" rx="4" fill="#1e3a8a"/>' +
      '<rect x="252" y="372" width="80" height="8" rx="3" fill="#1e3a8a"/>' +
      '<rect x="252" y="388" width="80" height="8" rx="3" fill="#0e7490"/>' +
      '<rect x="252" y="404" width="80" height="8" rx="3" fill="#1e3a8a"/>' +
      '<path d="M292 236 l-10 -18 h20 Z" fill="#0e7490"/>';

    /* --- peretele cu hieroglife --- */
    var glif = ['M0 0 h22 M11 0 v26 M4 8 h14', 'M2 20 q10 -22 20 0 q-10 8 -20 0', 'M0 4 h20 l-6 18 h-8 Z',
                'M2 22 c6 -20 14 -20 20 0', 'M11 0 a9 9 0 1 1 0 24 a9 9 0 1 1 0 -24 M11 12 h0',
                'M0 22 l11 -22 l11 22 Z', 'M0 6 h22 M0 14 h22 M0 22 h22', 'M4 0 v24 M4 6 q14 6 0 12'];
    var panel = '<rect x="418" y="150" width="204" height="188" rx="8" fill="#7a5320"/>' +
                '<rect x="428" y="160" width="184" height="168" rx="5" fill="#c8952f"/>' +
                '<rect x="428" y="160" width="184" height="168" rx="5" fill="none" stroke="#5b3d12" stroke-width="3"/>';
    for (var gy = 0; gy < 5; gy++) {
      for (var gx = 0; gx < 5; gx++) {
        var gd = glif[(gy * 5 + gx * 3) % glif.length];
        panel += '<g transform="translate(' + (444 + gx * 34) + ',' + (176 + gy * 32) + ')">' +
                 '<path d="' + gd + '" fill="none" stroke="#5b3d12" stroke-width="3.2" stroke-linecap="round"/></g>';
      }
    }
    panel += '<circle cx="520" cy="140" r="15" fill="url(#pz-gold)"/>' +
             '<path d="M505 140 h-12 M535 140 h12 M520 125 v-12" stroke="#f6c445" stroke-width="3" stroke-linecap="round"/>';

    /* --- vasul canopic --- */
    var vas =
      '<ellipse cx="716" cy="440" rx="62" ry="12" fill="#000" opacity=".3"/>' +
      '<rect x="662" y="386" width="108" height="48" rx="5" fill="#6b4718"/>' +
      '<rect x="670" y="374" width="92" height="16" rx="4" fill="#8a6224"/>' +
      '<path d="M684 374 q-16 -70 32 -70 q48 0 32 70 Z" fill="url(#pz-gold)"/>' +
      '<rect x="686" y="330" width="60" height="8" fill="#0e7490" opacity=".8"/>' +
      '<rect x="686" y="350" width="60" height="8" fill="#1e3a8a" opacity=".8"/>' +
      '<path d="M692 304 q24 -22 48 0 Z" fill="#b8860b"/>' +
      '<ellipse cx="716" cy="292" rx="26" ry="22" fill="#0e7490"/>' +
      '<path d="M700 276 q16 -20 32 0" fill="#0e7490"/>' +
      '<circle cx="707" cy="290" r="3.2" fill="#0f172a"/><circle cx="725" cy="290" r="3.2" fill="#0f172a"/>' +
      '<path d="M706 300 q10 7 20 0" stroke="#0f172a" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<circle cx="716" cy="266" r="7" fill="url(#pz-gold)"/>';

    /* --- ușa de piatră --- */
    var usa =
      '<rect x="836" y="118" width="152" height="322" rx="6" fill="#5b3d12"/>' +
      '<g class="door-panel">' +
      '<rect x="844" y="126" width="136" height="306" rx="4" fill="url(#pz-door)"/>' +
      '<rect x="856" y="140" width="112" height="278" rx="3" fill="none" stroke="#5b3d12" stroke-width="4"/>' +
      '<circle cx="912" cy="206" r="34" fill="url(#pz-gold)"/>' +
      '<circle cx="912" cy="206" r="24" fill="none" stroke="#7a5320" stroke-width="4"/>' +
      '<path d="M912 158 v-14 M912 268 v14 M864 206 h-14 M960 206 h14 M878 172 l-10 -10 M946 240 l10 10 M946 172 l10 -10 M878 240 l-10 10" stroke="#f6c445" stroke-width="4" stroke-linecap="round"/>' +
      '<rect x="872" y="300" width="80" height="70" rx="6" fill="#4b310f"/>' +
      '<circle cx="892" cy="322" r="8" fill="#c8952f"/><circle cx="932" cy="322" r="8" fill="#c8952f"/>' +
      '<circle cx="892" cy="350" r="8" fill="#c8952f"/><circle cx="932" cy="350" r="8" fill="#c8952f"/>' +
      '<rect x="838" y="270" width="10" height="26" rx="3" fill="#f6c445"/>' +
      '</g>' +
      '<rect class="door-light" x="844" y="126" width="136" height="306" rx="4" fill="#fff8e1" opacity="0"/>';

    var body = b +
      hs(3, 'Statuia lui Anubis', 111, 246, [46, 190, 130, 254], anubis) +
      hs(0, 'Sarcofagul faraonului', 292, 232, [224, 218, 138, 224], sarcofag) +
      hs(1, 'Peretele cu hieroglife', 520, 146, [414, 128, 214, 216], panel) +
      hs(2, 'Vasul canopic', 716, 262, [656, 250, 122, 196], vas) +
      door(912, 112, [830, 112, 164, 334], usa);
    return wrap(defs, body);
  };

  /* ======================== 2. CASTELUL CAVALERILOR ====================== */
  SCENES.castel = function () {
    var defs =
      '<linearGradient id="ct-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6b7280"/><stop offset="60%" stop-color="#4b5563"/><stop offset="100%" stop-color="#374151"/></linearGradient>' +
      '<linearGradient id="ct-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#57534e"/><stop offset="100%" stop-color="#292524"/></linearGradient>' +
      '<linearGradient id="ct-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0b1e3d"/><stop offset="100%" stop-color="#2b4a7d"/></linearGradient>' +
      '<linearGradient id="ct-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#dc2626"/><stop offset="100%" stop-color="#7f1d1d"/></linearGradient>' +
      '<linearGradient id="ct-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#78350f"/><stop offset="50%" stop-color="#92400e"/><stop offset="100%" stop-color="#5c2c08"/></linearGradient>' +
      '<linearGradient id="ct-steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e5e7eb"/><stop offset="45%" stop-color="#9ca3af"/><stop offset="100%" stop-color="#4b5563"/></linearGradient>';

    var b = '<rect width="1000" height="560" fill="url(#ct-wall)"/>' +
      bricks(0, 0, 1000, 440, 110, 62, 'none', 'rgba(20,20,25,.35)') +
      '<rect y="430" width="1000" height="130" fill="url(#ct-floor)"/>' +
      /* dale pe podea */
      '<g stroke="rgba(0,0,0,.35)" stroke-width="2">' +
      '<path d="M0 462 H1000 M0 496 H1000 M0 530 H1000"/>' +
      '<path d="M120 430 L60 560 M320 430 L290 560 M520 430 L520 560 M720 430 L750 560 M900 430 L950 560"/></g>' +
      /* fereastra gotică */
      '<path d="M446 96 q54 -74 108 0 L554 300 L446 300 Z" fill="#1e293b"/>' +
      '<path d="M456 104 q44 -60 88 0 L544 290 L456 290 Z" fill="url(#ct-night)"/>' +
      stars(24, 460, 110, 84, 170, 11) +
      '<circle cx="524" cy="150" r="20" fill="#fef3c7" opacity=".92"/><circle cx="516" cy="144" r="17" fill="#1e293b" opacity=".85"/>' +
      '<path d="M500 104 v186 M456 200 h88" stroke="#374151" stroke-width="7"/>' +
      /* steaguri */
      '<g transform="translate(742,74)"><g class="sway"><path d="M-36 0 h72 v128 l-36 -26 l-36 26 Z" fill="url(#ct-red)"/>' +
      '<path d="M0 26 l10 22 h24 l-19 16 l7 24 l-22 -14 l-22 14 l7 -24 l-19 -16 h24 Z" fill="#fbbf24"/></g></g>' +
      '<g transform="translate(372,70)"><g class="sway"><path d="M-32 0 h64 v118 l-32 -24 l-32 24 Z" fill="#1d4ed8"/>' +
      '<circle cx="0" cy="44" r="18" fill="#fbbf24"/><path d="M0 30 v28 M-14 44 h28" stroke="#1d4ed8" stroke-width="5"/></g></g>' +
      torch(120, 240, 1) + torch(870, 240, 1);

    /* --- tronul --- */
    var tron =
      '<ellipse cx="248" cy="452" rx="92" ry="14" fill="#000" opacity=".35"/>' +
      '<path d="M186 440 L186 300 q0 -20 20 -20 h84 q20 0 20 20 L310 440 Z" fill="url(#ct-wood)"/>' +
      '<path d="M196 280 L196 178 q52 -46 104 0 L300 280 Z" fill="url(#ct-wood)"/>' +
      '<path d="M206 272 L206 190 q42 -36 84 0 L290 272 Z" fill="#a3620f"/>' +
      '<path d="M248 196 l12 26 h28 l-22 20 l8 28 l-26 -16 l-26 16 l8 -28 l-22 -20 h28 Z" fill="#fbbf24"/>' +
      '<rect x="190" y="286" width="116" height="22" rx="6" fill="#b91c1c"/>' +
      '<rect x="182" y="330" width="132" height="16" rx="6" fill="#7f1d1d"/>' +
      '<rect x="180" y="436" width="18" height="24" fill="#5c2c08"/><rect x="298" y="436" width="18" height="24" fill="#5c2c08"/>' +
      '<circle cx="196" cy="172" r="9" fill="#fbbf24"/><circle cx="300" cy="172" r="9" fill="#fbbf24"/>';

    /* --- cufărul cu comori --- */
    var cufar =
      '<ellipse cx="470" cy="464" rx="76" ry="12" fill="#000" opacity=".35"/>' +
      '<rect x="404" y="392" width="132" height="66" rx="8" fill="url(#ct-wood)"/>' +
      '<path d="M404 396 q66 -56 132 0 Z" fill="#a3620f"/>' +
      '<path d="M414 394 q56 -44 112 0 Z" fill="#c2740f"/>' +
      '<rect x="404" y="390" width="132" height="12" fill="#78350f"/>' +
      '<rect x="456" y="356" width="28" height="102" rx="4" fill="#fbbf24" opacity=".85"/>' +
      '<rect x="404" y="418" width="132" height="9" fill="#fbbf24" opacity=".7"/>' +
      '<rect x="458" y="416" width="24" height="26" rx="5" fill="#f59e0b"/>' +
      '<circle cx="470" cy="428" r="5" fill="#78350f"/>' +
      '<circle cx="424" cy="386" r="9" fill="#fbbf24"/><circle cx="446" cy="380" r="7" fill="#fde68a"/>' +
      '<circle cx="500" cy="382" r="8" fill="#f59e0b"/>';

    /* --- armura cavalerului --- */
    var armura =
      '<ellipse cx="668" cy="452" rx="60" ry="12" fill="#000" opacity=".35"/>' +
      '<rect x="640" y="418" width="56" height="26" rx="6" fill="#4b5563"/>' +
      '<path d="M628 418 L636 300 h64 l8 118 Z" fill="url(#ct-steel)"/>' +
      '<path d="M646 300 h44 l4 44 h-52 Z" fill="#d1d5db"/>' +
      '<path d="M636 340 q32 16 64 0" stroke="#6b7280" stroke-width="3" fill="none"/>' +
      '<path d="M636 366 q32 16 64 0" stroke="#6b7280" stroke-width="3" fill="none"/>' +
      '<path d="M636 392 q32 16 64 0" stroke="#6b7280" stroke-width="3" fill="none"/>' +
      '<path d="M642 296 q26 -30 52 0 Z" fill="#9ca3af"/>' +
      '<path d="M640 252 q28 -40 56 0 l0 44 q-28 14 -56 0 Z" fill="url(#ct-steel)"/>' +
      '<rect x="646" y="266" width="44" height="9" rx="3" fill="#111827"/>' +
      '<path d="M668 232 l0 -26 M660 214 l16 0" stroke="#dc2626" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M668 288 v10" stroke="#111827" stroke-width="3"/>' +
      /* sabia */
      '<g transform="translate(614,300) rotate(14)"><rect x="-5" y="-8" width="10" height="132" rx="3" fill="url(#ct-steel)"/>' +
      '<rect x="-20" y="-14" width="40" height="10" rx="4" fill="#92400e"/>' +
      '<rect x="-6" y="-38" width="12" height="26" rx="4" fill="#78350f"/>' +
      '<circle cx="0" cy="-42" r="7" fill="#fbbf24"/></g>' +
      /* scutul din mână */
      '<g transform="translate(716,344)"><path d="M-26 -34 h52 v34 q0 34 -26 48 q-26 -14 -26 -48 Z" fill="#1d4ed8" stroke="#e5e7eb" stroke-width="4"/>' +
      '<path d="M0 -22 l7 16 h17 l-13 12 l5 18 l-16 -10 l-16 10 l5 -18 l-13 -12 h17 Z" fill="#fbbf24"/></g>';

    /* --- scutul cu blazon de pe perete --- */
    var blazon =
      '<circle cx="150" cy="176" r="66" fill="#1f2937" opacity=".35"/>' +
      '<path d="M104 118 h92 v60 q0 58 -46 82 q-46 -24 -46 -82 Z" fill="#b91c1c" stroke="#fbbf24" stroke-width="6"/>' +
      '<path d="M104 148 h92" stroke="#fbbf24" stroke-width="5"/>' +
      '<path d="M150 156 q22 10 22 34 q0 24 -22 38 q-22 -14 -22 -38 q0 -24 22 -34 Z" fill="#fde68a"/>' +
      '<path d="M150 168 l6 14 h15 l-12 11 l5 16 l-14 -9 l-14 9 l5 -16 l-12 -11 h15 Z" fill="#b91c1c"/>' +
      '<path d="M118 126 l-16 -22 M182 126 l16 -22" stroke="#9ca3af" stroke-width="9" stroke-linecap="round"/>';

    /* --- ușa de lemn --- */
    var usa =
      '<path d="M812 440 L812 190 q76 -84 152 0 L964 440 Z" fill="#3f2107"/>' +
      '<g class="door-panel">' +
      '<path d="M820 434 L820 196 q68 -74 136 0 L956 434 Z" fill="url(#ct-wood)"/>' +
      '<g stroke="#5c2c08" stroke-width="3">' +
      '<path d="M854 200 V434 M888 190 V434 M922 200 V434"/></g>' +
      '<rect x="820" y="248" width="136" height="16" fill="#57534e"/>' +
      '<rect x="820" y="366" width="136" height="16" fill="#57534e"/>' +
      '<g fill="#9ca3af"><circle cx="836" cy="256" r="4"/><circle cx="940" cy="256" r="4"/><circle cx="836" cy="374" r="4"/><circle cx="940" cy="374" r="4"/></g>' +
      '<circle cx="908" cy="318" r="16" fill="none" stroke="#fbbf24" stroke-width="7"/>' +
      '<rect x="864" y="300" width="34" height="34" rx="5" fill="#111827"/>' +
      '<rect x="874" y="312" width="14" height="10" rx="2" fill="#fbbf24"/>' +
      '<rect x="856" y="290" width="86" height="56" rx="6" fill="none" stroke="#5c2c08" stroke-width="4"/>' +
      '</g>' +
      '<path class="door-light" d="M820 434 L820 196 q68 -74 136 0 L956 434 Z" fill="#fff8e1" opacity="0"/>';

    var body = b +
      hs(3, 'Scutul cu blazon', 150, 112, [96, 106, 108, 150], blazon) +
      hs(0, 'Tronul regal', 248, 172, [176, 164, 144, 300], tron) +
      hs(2, 'Cufărul cu comori', 470, 350, [396, 344, 148, 122], cufar) +
      hs(1, 'Armura cavalerului', 668, 224, [606, 194, 128, 262], armura) +
      door(888, 180, [806, 178, 166, 268], usa);
    return wrap(defs, body);
  };

  /* =========================== 3. NAVA SPAȚIALĂ ========================== */
  SCENES.spatiu = function () {
    var defs =
      '<linearGradient id="sp-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#334155"/><stop offset="60%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>' +
      '<radialGradient id="sp-space" cx="50%" cy="45%" r="70%"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#020617"/></radialGradient>' +
      '<linearGradient id="sp-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#475569"/></linearGradient>' +
      '<radialGradient id="sp-planet" cx="35%" cy="32%" r="72%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="55%" stop-color="#ef4444"/><stop offset="100%" stop-color="#7f1d1d"/></radialGradient>' +
      '<linearGradient id="sp-screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0ea5e9"/><stop offset="100%" stop-color="#0c4a6e"/></linearGradient>';

    var b = '<rect width="1000" height="560" fill="url(#sp-wall)"/>' +
      '<g stroke="rgba(148,163,184,.18)" stroke-width="3" fill="none">' +
      '<path d="M0 60 H1000 M0 120 H1000 M0 380 H1000"/>' +
      '<path d="M90 0 V440 M340 0 V440 M660 0 V440 M910 0 V440"/></g>' +
      '<rect y="430" width="1000" height="130" fill="#1e293b"/>' +
      '<g stroke="rgba(148,163,184,.25)" stroke-width="3"><path d="M0 470 H1000 M0 512 H1000 M170 430 V560 M420 430 V560 M660 430 V560 M880 430 V560"/></g>' +
      /* hublou mare */
      '<circle cx="500" cy="216" r="152" fill="#0f172a"/>' +
      '<circle cx="500" cy="216" r="140" fill="url(#sp-space)"/>' +
      stars(46, 366, 84, 268, 264, 5) +
      '<circle cx="560" cy="176" r="52" fill="url(#sp-planet)"/>' +
      '<ellipse cx="560" cy="176" rx="76" ry="17" fill="none" stroke="#fbbf24" stroke-width="6" opacity=".85" transform="rotate(-18 560 176)"/>' +
      '<circle cx="546" cy="160" r="11" fill="#7f1d1d" opacity=".6"/><circle cx="576" cy="196" r="8" fill="#7f1d1d" opacity=".5"/>' +
      '<circle cx="424" cy="284" r="18" fill="#cbd5e1"/><circle cx="418" cy="279" r="5" fill="#94a3b8"/><circle cx="431" cy="290" r="3.6" fill="#94a3b8"/>' +
      '<circle cx="500" cy="216" r="140" fill="none" stroke="url(#sp-metal)" stroke-width="16"/>' +
      '<circle cx="500" cy="216" r="150" fill="none" stroke="#334155" stroke-width="8"/>' +
      '<g fill="#64748b"><circle cx="500" cy="70" r="7"/><circle cx="500" cy="362" r="7"/><circle cx="354" cy="216" r="7"/><circle cx="646" cy="216" r="7"/></g>' +
      /* lumini de tavan */
      '<rect x="150" y="0" width="120" height="16" rx="8" fill="#38bdf8" opacity=".8"/>' +
      '<rect x="730" y="0" width="120" height="16" rx="8" fill="#38bdf8" opacity=".8"/>' +
      '<ellipse cx="210" cy="40" rx="120" ry="54" fill="#38bdf8" opacity=".13" filter="url(#soft2)"/>' +
      '<ellipse cx="790" cy="40" rx="120" ry="54" fill="#38bdf8" opacity=".13" filter="url(#soft2)"/>';

    /* --- panoul de comandă --- */
    var panou =
      '<path d="M120 440 L152 336 h196 l32 104 Z" fill="#475569"/>' +
      '<path d="M136 430 L164 348 h172 l28 82 Z" fill="#1e293b"/>' +
      '<rect x="176" y="358" width="148" height="52" rx="6" fill="url(#sp-screen)"/>' +
      '<path d="M184 396 l16 -18 l14 12 l18 -26 l16 22 l14 -12 l16 22" stroke="#7dd3fc" stroke-width="3" fill="none"/>' +
      '<g><circle class="blinkled" cx="164" cy="424" r="7" fill="#22c55e"/>' +
      '<circle class="blinkled d1" cx="188" cy="424" r="7" fill="#fbbf24"/>' +
      '<circle class="blinkled d2" cx="212" cy="424" r="7" fill="#ef4444"/></g>' +
      '<rect x="240" y="416" width="90" height="16" rx="8" fill="#334155"/>' +
      '<circle cx="262" cy="424" r="9" fill="#38bdf8"/>' +
      '<rect x="150" y="332" width="200" height="10" rx="5" fill="#94a3b8"/>';

    /* --- robotul asistent --- */
    var robot =
      '<ellipse cx="784" cy="452" rx="56" ry="12" fill="#000" opacity=".4"/>' +
      '<rect x="744" y="330" width="80" height="98" rx="18" fill="url(#sp-metal)"/>' +
      '<rect x="756" y="348" width="56" height="40" rx="8" fill="#0ea5e9"/>' +
      '<path d="M762 372 h10 l6 -12 l8 22 l7 -14 h11" stroke="#e0f2fe" stroke-width="3" fill="none"/>' +
      '<circle cx="768" cy="406" r="6" fill="#22c55e"/><circle cx="800" cy="406" r="6" fill="#ef4444"/>' +
      '<rect x="732" y="352" width="14" height="52" rx="7" fill="#64748b"/>' +
      '<rect x="822" y="352" width="14" height="52" rx="7" fill="#64748b"/>' +
      '<rect x="756" y="428" width="18" height="24" rx="6" fill="#475569"/>' +
      '<rect x="794" y="428" width="18" height="24" rx="6" fill="#475569"/>' +
      '<rect x="754" y="286" width="60" height="46" rx="16" fill="#cbd5e1"/>' +
      '<rect x="762" y="298" width="44" height="22" rx="11" fill="#0f172a"/>' +
      '<circle cx="774" cy="309" r="6" fill="#38bdf8"/><circle cx="794" cy="309" r="6" fill="#38bdf8"/>' +
      '<path d="M784 286 v-16" stroke="#94a3b8" stroke-width="4"/><circle cx="784" cy="264" r="8" fill="#fbbf24"/>';

    /* --- capsula cu eșantioane --- */
    var capsula =
      '<ellipse cx="640" cy="452" rx="46" ry="10" fill="#000" opacity=".4"/>' +
      '<rect x="600" y="418" width="80" height="26" rx="8" fill="#475569"/>' +
      '<rect x="606" y="300" width="68" height="122" rx="12" fill="#0f172a"/>' +
      '<rect x="612" y="306" width="56" height="110" rx="10" fill="#22d3ee" opacity=".35"/>' +
      at(640, 396, 'bubble', '<circle cx="-12" cy="0" r="6" fill="#a5f3fc" opacity=".9"/>') +
      at(640, 400, 'bubble d1', '<circle cx="10" cy="0" r="4" fill="#a5f3fc" opacity=".9"/>') +
      at(640, 404, 'bubble d2', '<circle cx="0" cy="0" r="5" fill="#e0f2fe" opacity=".9"/>') +
      '<g transform="translate(640,352)"><g class="floaty">' +
      '<path d="M0 -26 L8 -8 L28 -6 L13 7 L18 26 L0 15 L-18 26 L-13 7 L-28 -6 L-8 -8 Z" fill="#fbbf24"/></g></g>' +
      '<rect x="600" y="288" width="80" height="20" rx="8" fill="url(#sp-metal)"/>' +
      '<circle cx="640" cy="278" r="8" fill="#38bdf8"/>';

    /* --- harta stelară --- */
    var harta =
      '<rect x="52" y="132" width="196" height="140" rx="12" fill="#0f172a" stroke="#475569" stroke-width="6"/>' +
      '<rect x="62" y="142" width="176" height="120" rx="8" fill="#020617"/>' +
      stars(20, 66, 146, 168, 112, 9) +
      '<g stroke="#38bdf8" stroke-width="2.5" fill="none" opacity=".9">' +
      '<path d="M92 236 L120 186 L164 208 L206 168"/></g>' +
      '<g fill="#fbbf24"><circle cx="92" cy="236" r="6"/><circle cx="120" cy="186" r="5"/><circle cx="164" cy="208" r="6"/><circle cx="206" cy="168" r="7"/></g>' +
      '<circle cx="206" cy="168" r="13" fill="none" stroke="#fbbf24" stroke-width="2" opacity=".6"/>' +
      '<rect x="62" y="242" width="176" height="20" fill="#0ea5e9" opacity=".18"/>' +
      '<text x="150" y="258" text-anchor="middle" font-family="Nunito, sans-serif" font-size="14" font-weight="800" fill="#7dd3fc">HARTA STELARĂ</text>';

    /* --- sasul de ieșire --- */
    var usa =
      '<rect x="840" y="140" width="150" height="300" rx="14" fill="#0f172a" stroke="#475569" stroke-width="8"/>' +
      '<g class="door-panel">' +
      '<rect x="852" y="152" width="126" height="276" rx="10" fill="url(#sp-metal)"/>' +
      '<rect x="852" y="152" width="126" height="276" rx="10" fill="none" stroke="#1e293b" stroke-width="4"/>' +
      '<path d="M852 290 h126" stroke="#1e293b" stroke-width="8"/>' +
      '<circle cx="915" cy="230" r="40" fill="#0f172a"/>' +
      '<circle cx="915" cy="230" r="32" fill="#0c4a6e"/>' +
      stars(9, 890, 206, 50, 48, 4) +
      '<circle cx="915" cy="230" r="40" fill="none" stroke="#94a3b8" stroke-width="7"/>' +
      '<g fill="#64748b"><circle cx="915" cy="184" r="5"/><circle cx="915" cy="276" r="5"/><circle cx="869" cy="230" r="5"/><circle cx="961" cy="230" r="5"/></g>' +
      '<rect x="876" y="330" width="78" height="62" rx="10" fill="#0f172a"/>' +
      '<g><circle class="blinkled" cx="896" cy="350" r="7" fill="#ef4444"/>' +
      '<circle class="blinkled d1" cx="934" cy="350" r="7" fill="#ef4444"/></g>' +
      '<rect x="888" y="368" width="54" height="12" rx="6" fill="#334155"/>' +
      '</g>' +
      '<rect class="door-light" x="852" y="152" width="126" height="276" rx="10" fill="#e0f2fe" opacity="0"/>';

    var body = b +
      hs(3, 'Harta stelară', 150, 128, [44, 124, 212, 156], harta) +
      hs(0, 'Panoul de comandă', 250, 330, [114, 326, 274, 120], panou) +
      hs(2, 'Capsula cu eșantioane', 640, 274, [592, 268, 96, 186], capsula) +
      hs(1, 'Robotul asistent', 784, 262, [726, 258, 116, 200], robot) +
      door(915, 136, [834, 134, 162, 312], usa);
    return wrap(defs, body);
  };

  /* ========================== 4. JUNGLA PIERDUTĂ ========================= */
  SCENES.jungla = function () {
    var defs =
      '<linearGradient id="jg-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#bbf7d0"/><stop offset="45%" stop-color="#4ade80"/><stop offset="100%" stop-color="#166534"/></linearGradient>' +
      '<linearGradient id="jg-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3f6212"/><stop offset="100%" stop-color="#1c2b0a"/></linearGradient>' +
      '<linearGradient id="jg-stone" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a8a29e"/><stop offset="55%" stop-color="#78716c"/><stop offset="100%" stop-color="#44403c"/></linearGradient>' +
      '<linearGradient id="jg-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#78350f"/><stop offset="55%" stop-color="#a16207"/><stop offset="100%" stop-color="#4a2408"/></linearGradient>';

    function leaf(x, y, r, col, rot) {
      return '<g transform="translate(' + x + ',' + y + ') rotate(' + rot + ')">' +
             '<path d="M0 0 C ' + r + ' ' + (-r * .8) + ' ' + (r * 1.7) + ' ' + (-r * .25) + ' ' + (r * 2) + ' 0 C ' + (r * 1.7) + ' ' + (r * .25) + ' ' + r + ' ' + (r * .8) + ' 0 0 Z" fill="' + col + '"/>' +
             '<path d="M0 0 L' + (r * 2) + ' 0" stroke="rgba(0,0,0,.18)" stroke-width="2"/></g>';
    }
    var canopy = '';
    for (var i = 0; i < 14; i++) {
      canopy += leaf(-20 + i * 78, 6 + (i % 3) * 26, 26 + (i % 4) * 6, i % 2 ? '#166534' : '#15803d', 25 + (i % 5) * 22);
    }
    var b = '<rect width="1000" height="560" fill="url(#jg-sky)"/>' +
      /* templu în ceață */
      '<g opacity=".35"><path d="M300 300 L420 140 L540 300 Z" fill="#1c3d1c"/>' +
      '<path d="M560 310 L680 150 L800 310 Z" fill="#14532d"/></g>' +
      /* raze de soare */
      '<path d="M180 0 L300 0 L230 430 L180 430 Z" fill="#fef9c3" opacity=".16"/>' +
      '<path d="M560 0 L640 0 L610 430 L560 430 Z" fill="#fef9c3" opacity=".12"/>' +
      '<rect y="420" width="1000" height="140" fill="url(#jg-ground)"/>' +
      '<path d="M0 420 q120 -22 250 4 q140 26 280 -6 q160 -32 300 6 q100 20 170 -2 L1000 460 L0 460 Z" fill="#4d7c0f"/>' +
      /* tufe */
      '<g fill="#166534"><ellipse cx="90" cy="452" rx="88" ry="34"/><ellipse cx="520" cy="462" rx="106" ry="30"/><ellipse cx="930" cy="450" rx="90" ry="32"/></g>' +
      '<g fill="#15803d"><ellipse cx="250" cy="470" rx="80" ry="26"/><ellipse cx="740" cy="468" rx="94" ry="26"/></g>' +
      canopy +
      /* liane */
      '<g stroke="#166534" stroke-width="7" fill="none" stroke-linecap="round">' +
      '<path d="M120 0 q22 90 -8 170"/><path d="M330 0 q-18 110 14 190"/><path d="M690 0 q26 80 -6 150"/><path d="M880 0 q-20 70 8 130"/></g>';

    /* --- totemul de piatră --- */
    var totem =
      '<ellipse cx="140" cy="452" rx="66" ry="14" fill="#000" opacity=".35"/>' +
      '<rect x="86" y="196" width="108" height="252" rx="10" fill="url(#jg-stone)"/>' +
      '<path d="M78 196 h124 l-16 -30 h-92 Z" fill="#57534e"/>' +
      '<g fill="#292524" opacity=".9">' +
      '<circle cx="114" cy="238" r="11"/><circle cx="166" cy="238" r="11"/>' +
      '<path d="M104 274 q36 26 72 0 q-36 12 -72 0 Z"/></g>' +
      '<circle cx="114" cy="236" r="4" fill="#facc15"/><circle cx="166" cy="236" r="4" fill="#facc15"/>' +
      '<path d="M96 300 h88 M96 316 h88" stroke="#44403c" stroke-width="5"/>' +
      '<g fill="#57534e"><circle cx="118" cy="356" r="16"/><circle cx="162" cy="356" r="16"/>' +
      '<path d="M96 392 h88 v16 h-88 Z"/></g>' +
      '<path d="M140 336 l10 18 h-20 Z" fill="#22c55e"/>' +
      '<rect x="96" y="418" width="88" height="14" fill="#44403c"/>' +
      '<path d="M86 196 q-16 26 6 40 M194 196 q16 26 -6 40" stroke="#22c55e" stroke-width="6" fill="none"/>';

    /* --- maimuța pe liană --- */
    var maimuta =
      '<path d="M400 0 q28 92 -6 152" stroke="#166534" stroke-width="9" fill="none" stroke-linecap="round"/>' +
      at(392, 196, 'floaty',
        '<ellipse cx="0" cy="34" rx="34" ry="40" fill="#a16207"/>' +
        '<ellipse cx="0" cy="40" rx="22" ry="27" fill="#d6a24a"/>' +
        '<circle cx="0" cy="-8" r="30" fill="#a16207"/>' +
        '<circle cx="-27" cy="-16" r="12" fill="#a16207"/><circle cx="27" cy="-16" r="12" fill="#a16207"/>' +
        '<circle cx="-27" cy="-16" r="6" fill="#d6a24a"/><circle cx="27" cy="-16" r="6" fill="#d6a24a"/>' +
        '<ellipse cx="0" cy="2" rx="21" ry="18" fill="#d6a24a"/>' +
        '<circle cx="-9" cy="-8" r="4.6" fill="#1c1917"/><circle cx="9" cy="-8" r="4.6" fill="#1c1917"/>' +
        '<circle cx="-9" cy="-9.6" r="1.6" fill="#fff"/><circle cx="9" cy="-9.6" r="1.6" fill="#fff"/>' +
        '<path d="M-8 6 q8 8 16 0" stroke="#1c1917" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
        '<path d="M-28 22 q-22 -14 -18 -40" stroke="#a16207" stroke-width="11" fill="none" stroke-linecap="round"/>' +
        '<path d="M28 22 q24 -10 22 -34" stroke="#a16207" stroke-width="11" fill="none" stroke-linecap="round"/>' +
        '<path d="M-16 68 q-30 24 -6 44" stroke="#a16207" stroke-width="10" fill="none" stroke-linecap="round"/>' +
        '<path d="M18 68 q28 20 8 42" stroke="#a16207" stroke-width="10" fill="none" stroke-linecap="round"/>');

    /* --- cufărul exploratorului --- */
    var cufar =
      '<ellipse cx="596" cy="464" rx="80" ry="13" fill="#000" opacity=".35"/>' +
      '<rect x="530" y="392" width="132" height="68" rx="8" fill="url(#jg-wood)"/>' +
      '<path d="M530 396 q66 -58 132 0 Z" fill="#a16207"/>' +
      '<path d="M540 394 q56 -46 112 0 Z" fill="#ca8a04"/>' +
      '<rect x="530" y="390" width="132" height="12" fill="#78350f"/>' +
      '<rect x="582" y="352" width="28" height="108" rx="4" fill="#e5e7eb" opacity=".8"/>' +
      '<rect x="530" y="420" width="132" height="8" fill="#e5e7eb" opacity=".7"/>' +
      '<rect x="584" y="418" width="24" height="26" rx="5" fill="#9ca3af"/>' +
      '<circle cx="596" cy="430" r="5" fill="#44403c"/>' +
      '<path d="M508 452 q30 -26 22 -60" stroke="#166534" stroke-width="8" fill="none" stroke-linecap="round"/>' +
      leaf(508, 396, 12, '#22c55e', -40) +
      '<path d="M662 448 q26 -22 18 -50" stroke="#166534" stroke-width="7" fill="none" stroke-linecap="round"/>';

    /* --- tucanul --- */
    var tucan =
      '<path d="M646 232 q60 -14 116 6" stroke="#4a2408" stroke-width="14" fill="none" stroke-linecap="round"/>' +
      leaf(752, 226, 16, '#15803d', -30) + leaf(646, 236, 14, '#166534', 200) +
      at(702, 194, 'floaty2',
        '<ellipse cx="0" cy="10" rx="30" ry="36" fill="#1c1917"/>' +
        '<ellipse cx="-4" cy="16" rx="18" ry="24" fill="#fbbf24"/>' +
        '<circle cx="2" cy="-24" r="24" fill="#1c1917"/>' +
        '<path d="M-2 -34 q26 -6 24 10 q-4 6 -24 4 Z" fill="#f8fafc"/>' +
        '<path d="M18 -32 C 62 -34 76 -18 74 -6 C 60 -2 36 -8 18 -16 Z" fill="#f97316"/>' +
        '<path d="M18 -32 C 52 -33 68 -24 72 -14" stroke="#facc15" stroke-width="5" fill="none"/>' +
        '<path d="M60 -10 q10 2 14 4" stroke="#dc2626" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<circle cx="4" cy="-28" r="6" fill="#f8fafc"/><circle cx="5" cy="-28" r="3.4" fill="#1c1917"/>' +
        '<path d="M-26 4 q-24 12 -14 34 q10 -14 22 -18 Z" fill="#0f172a"/>' +
        '<path d="M-8 44 v12 M8 44 v12" stroke="#f97316" stroke-width="5" stroke-linecap="round"/>');

    /* --- poarta templului --- */
    var usa =
      '<path d="M812 440 L812 200 q78 -70 156 0 L968 440 Z" fill="#57534e"/>' +
      '<g class="door-panel">' +
      '<path d="M822 434 L822 206 q68 -60 136 0 L958 434 Z" fill="url(#jg-stone)"/>' +
      '<path d="M834 428 L834 214 q56 -50 112 0 L946 428 Z" fill="#57534e"/>' +
      '<g fill="#292524" opacity=".85">' +
      '<circle cx="866" cy="264" r="13"/><circle cx="914" cy="264" r="13"/>' +
      '<path d="M858 302 q32 26 64 0 q-32 12 -64 0 Z"/></g>' +
      '<g fill="#22c55e"><circle cx="866" cy="262" r="4.6"/><circle cx="914" cy="262" r="4.6"/></g>' +
      '<path d="M846 336 h88 M846 356 h88 M846 376 h88" stroke="#44403c" stroke-width="5"/>' +
      '<rect x="862" y="392" width="56" height="36" rx="6" fill="#292524"/>' +
      '<circle cx="878" cy="410" r="6" fill="#84cc16"/><circle cx="902" cy="410" r="6" fill="#84cc16"/>' +
      '</g>' +
      '<path class="door-light" d="M822 434 L822 206 q68 -60 136 0 L958 434 Z" fill="#ecfccb" opacity="0"/>' +
      '<path d="M806 446 q40 -40 24 -90" stroke="#166534" stroke-width="9" fill="none" stroke-linecap="round"/>' +
      leaf(806, 358, 15, '#22c55e', -50);

    var body = b +
      hs(0, 'Totemul de piatră', 140, 178, [74, 160, 132, 296], totem) +
      hs(1, 'Maimuța de pe liană', 392, 188, [348, 140, 92, 132], maimuta) +
      hs(2, 'Cufărul exploratorului', 596, 350, [520, 344, 156, 126], cufar) +
      hs(3, 'Tucanul curios', 704, 168, [652, 136, 118, 118], tucan) +
      door(890, 194, [806, 192, 168, 256], usa);
    return wrap(defs, body);
  };

  /* ====================== 5. LABORATORUL SAVANTULUI ===================== */
  SCENES.laborator = function () {
    var defs =
      '<linearGradient id="lb-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e3a5f"/><stop offset="60%" stop-color="#15293f"/><stop offset="100%" stop-color="#0b1725"/></linearGradient>' +
      '<linearGradient id="lb-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#475569"/></linearGradient>' +
      '<linearGradient id="lb-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e0f2fe" stop-opacity=".55"/><stop offset="100%" stop-color="#7dd3fc" stop-opacity=".25"/></linearGradient>';

    function flask(x, y, col, s) {
      return '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')">' +
        '<path d="M-7 -34 h14 v20 l16 34 a10 10 0 0 1 -9 15 h-28 a10 10 0 0 1 -9 -15 l16 -34 Z" fill="url(#lb-glass)" stroke="#bae6fd" stroke-width="2.5"/>' +
        '<path d="M-16 12 l6 -13 h20 l6 13 a8 8 0 0 1 -7 11 h-18 a8 8 0 0 1 -7 -11 Z" fill="' + col + '"/>' +
        '<rect x="-9" y="-38" width="18" height="7" rx="3" fill="#cbd5e1"/>' +
        '<circle cx="-3" cy="10" r="2.6" fill="#fff" opacity=".65"/></g>';
    }

    var b = '<rect width="1000" height="560" fill="url(#lb-wall)"/>' +
      /* faianță */
      '<g stroke="rgba(148,197,255,.10)" stroke-width="2">' +
      '<path d="M0 70 H1000 M0 140 H1000 M0 210 H1000 M0 280 H1000 M0 350 H1000"/>' +
      '<path d="M70 0 V420 M210 0 V420 M350 0 V420 M490 0 V420 M630 0 V420 M770 0 V420 M910 0 V420"/></g>' +
      '<rect y="418" width="1000" height="142" fill="#0b1725"/>' +
      '<g stroke="rgba(148,197,255,.14)" stroke-width="2"><path d="M0 470 H1000 M0 520 H1000 M180 418 V560 M480 418 V560 M780 418 V560"/></g>' +
      /* raft cu sticle */
      '<rect x="40" y="96" width="250" height="12" rx="4" fill="#334155"/>' +
      flask(80, 78, '#22c55e', .85) + flask(130, 76, '#f472b6', .95) + flask(180, 80, '#38bdf8', .8) + flask(232, 76, '#fbbf24', .9) +
      '<rect x="40" y="200" width="250" height="12" rx="4" fill="#334155"/>' +
      flask(88, 182, '#a78bfa', .8) + flask(148, 184, '#f97316', .75) + flask(206, 180, '#22d3ee', .85) +
      /* lampă */
      '<path d="M700 0 v40" stroke="#475569" stroke-width="5"/>' +
      '<path d="M660 40 h80 l-16 26 h-48 Z" fill="#64748b"/>' +
      '<ellipse cx="700" cy="120" rx="90" ry="70" fill="#fde68a" opacity=".12" filter="url(#soft2)"/>' +
      '<circle cx="700" cy="70" r="8" fill="#fde68a"/>';

    /* --- masa cu experimente --- */
    var masa =
      '<rect x="330" y="356" width="250" height="16" rx="6" fill="url(#lb-table)"/>' +
      '<rect x="348" y="372" width="16" height="76" fill="#475569"/><rect x="546" y="372" width="16" height="76" fill="#475569"/>' +
      '<rect x="340" y="404" width="230" height="10" fill="#334155"/>' +
      /* becher care fierbe */
      '<path d="M392 356 v-52 h44 v52 Z" fill="url(#lb-glass)" stroke="#bae6fd" stroke-width="3"/>' +
      '<path d="M392 330 h44 v26 h-44 Z" fill="#a855f7" opacity=".85"/>' +
      at(402, 322, 'bubble', '<circle r="4" fill="#e9d5ff"/>') +
      at(420, 326, 'bubble d1', '<circle r="3" fill="#f5d0fe"/>') +
      at(412, 330, 'bubble d2', '<circle r="3.4" fill="#faf5ff"/>') +
      '<rect x="386" y="298" width="56" height="8" rx="4" fill="#cbd5e1"/>' +
      /* stativ cu eprubete */
      '<rect x="470" y="330" width="90" height="26" rx="5" fill="#78350f"/>' +
      '<rect x="470" y="300" width="90" height="7" rx="3" fill="#78350f"/>' +
      '<g>' +
      '<rect x="482" y="286" width="17" height="58" rx="8" fill="url(#lb-glass)" stroke="#bae6fd" stroke-width="2"/><rect x="484" y="316" width="13" height="26" rx="6" fill="#ef4444"/>' +
      '<rect x="506" y="286" width="17" height="58" rx="8" fill="url(#lb-glass)" stroke="#bae6fd" stroke-width="2"/><rect x="508" y="310" width="13" height="32" rx="6" fill="#22c55e"/>' +
      '<rect x="530" y="286" width="17" height="58" rx="8" fill="url(#lb-glass)" stroke="#bae6fd" stroke-width="2"/><rect x="532" y="322" width="13" height="20" rx="6" fill="#38bdf8"/></g>' +
      '<ellipse cx="414" cy="292" rx="42" ry="26" fill="#a855f7" opacity=".18" filter="url(#soft)"/>';

    /* --- tabla cu formule --- */
    var tabla =
      '<rect x="352" y="112" width="230" height="150" rx="10" fill="#78350f"/>' +
      '<rect x="362" y="122" width="210" height="130" rx="6" fill="#14532d"/>' +
      '<g stroke="#e2e8f0" stroke-width="3" fill="none" stroke-linecap="round" opacity=".92">' +
      '<path d="M382 156 h26 M395 143 v26"/>' +
      '<path d="M432 156 h26"/>' +
      '<path d="M482 143 l24 26 M506 143 l-24 26"/>' +
      '<path d="M528 150 h26 M528 164 h26"/>' +
      '<path d="M382 200 q14 -22 28 0 t28 0"/>' +
      '<path d="M462 186 v28 h30"/>' +
      '<circle cx="530" cy="200" r="14"/><path d="M530 186 v28"/></g>' +
      '<rect x="362" y="252" width="210" height="10" fill="#92400e"/>' +
      '<rect x="452" y="256" width="34" height="7" rx="3" fill="#f8fafc"/>';

    /* --- bobina Tesla --- */
    var tesla =
      '<ellipse cx="700" cy="452" rx="56" ry="12" fill="#000" opacity=".4"/>' +
      '<rect x="654" y="410" width="92" height="34" rx="8" fill="#334155"/>' +
      '<rect x="672" y="300" width="56" height="112" rx="6" fill="#475569"/>' +
      '<g stroke="#b45309" stroke-width="5">' +
      '<path d="M672 314 h56 M672 328 h56 M672 342 h56 M672 356 h56 M672 370 h56 M672 384 h56 M672 398 h56"/></g>' +
      '<ellipse cx="700" cy="292" rx="52" ry="20" fill="#94a3b8"/>' +
      '<ellipse cx="700" cy="288" rx="52" ry="18" fill="#cbd5e1"/>' +
      '<ellipse cx="700" cy="244" rx="80" ry="52" fill="#38bdf8" opacity=".16" filter="url(#soft2)"/>' +
      '<g stroke="#7dd3fc" stroke-width="3.5" fill="none" stroke-linecap="round" class="blinkled">' +
      '<path d="M700 270 l-16 -26 l14 -6 l-18 -28"/><path d="M700 270 l20 -22 l-14 -8 l22 -26"/></g>' +
      '<g stroke="#e0f2fe" stroke-width="2.5" fill="none" stroke-linecap="round" class="blinkled d1">' +
      '<path d="M700 268 l-26 -14 l10 -12 l-16 -18"/><path d="M700 268 l30 -10 l-8 -14 l18 -14"/></g>' +
      '<circle cx="668" cy="424" r="6" fill="#22c55e" class="blinkled d2"/>' +
      '<rect x="686" y="418" width="46" height="12" rx="6" fill="#0f172a"/>';

    /* --- microscopul --- */
    var micro =
      '<ellipse cx="216" cy="452" rx="52" ry="11" fill="#000" opacity=".4"/>' +
      '<path d="M172 444 h88 l-8 -22 h-72 Z" fill="#334155"/>' +
      '<rect x="180" y="404" width="72" height="20" rx="5" fill="#475569"/>' +
      '<rect x="206" y="330" width="18" height="76" rx="6" fill="#64748b"/>' +
      '<path d="M224 344 q46 -6 40 -54" stroke="#94a3b8" stroke-width="15" fill="none" stroke-linecap="round"/>' +
      '<rect x="248" y="264" width="34" height="30" rx="8" fill="#cbd5e1" transform="rotate(18 265 279)"/>' +
      '<circle cx="272" cy="252" r="13" fill="#0ea5e9"/>' +
      '<rect x="196" y="372" width="42" height="9" rx="3" fill="#0ea5e9"/>' +
      '<circle cx="217" cy="376" r="5" fill="#f8fafc"/>' +
      '<path d="M186 340 q-22 6 -22 26" stroke="#64748b" stroke-width="8" fill="none" stroke-linecap="round"/>' +
      '<circle cx="164" cy="374" r="10" fill="#94a3b8"/>';

    /* --- ușa blindată --- */
    var usa =
      '<rect x="836" y="140" width="152" height="300" rx="12" fill="#0f172a" stroke="#334155" stroke-width="8"/>' +
      '<g class="door-panel">' +
      '<rect x="848" y="152" width="128" height="276" rx="8" fill="url(#lb-table)"/>' +
      '<rect x="860" y="164" width="104" height="252" rx="6" fill="none" stroke="#334155" stroke-width="4"/>' +
      '<circle cx="912" cy="234" r="42" fill="#0b1725"/>' +
      '<circle cx="912" cy="234" r="34" fill="#0ea5e9" opacity=".28"/>' +
      '<path d="M888 250 q24 -34 48 0" stroke="#7dd3fc" stroke-width="4" fill="none"/>' +
      '<circle cx="912" cy="234" r="42" fill="none" stroke="#94a3b8" stroke-width="8"/>' +
      '<g stroke="#64748b" stroke-width="6" stroke-linecap="round"><path d="M912 176 v-14 M912 306 v14 M854 234 h-14 M970 234 h14"/></g>' +
      '<rect x="874" y="330" width="76" height="60" rx="8" fill="#0b1725"/>' +
      '<g fill="#22c55e" class="blinkled"><rect x="886" y="344" width="52" height="8" rx="4"/></g>' +
      '<g fill="#38bdf8"><circle cx="892" cy="370" r="6"/><circle cx="912" cy="370" r="6"/><circle cx="932" cy="370" r="6"/></g>' +
      '<rect x="964" y="250" width="14" height="60" rx="6" fill="#64748b"/>' +
      '</g>' +
      '<rect class="door-light" x="848" y="152" width="128" height="276" rx="8" fill="#e0f2fe" opacity="0"/>';

    var body = b +
      hs(3, 'Microscopul', 216, 246, [156, 240, 132, 214], micro) +
      hs(1, 'Tabla cu formule', 466, 108, [344, 104, 246, 166], tabla) +
      hs(0, 'Masa cu experimente', 466, 292, [326, 284, 258, 170], masa) +
      hs(2, 'Bobina electrică', 700, 236, [640, 230, 120, 226], tesla) +
      door(912, 136, [830, 134, 164, 312], usa);
    return wrap(defs, body);
  };

  /* ========================= 6. CORABIA PIRAȚILOR ======================= */
  SCENES.pirati = function () {
    var defs =
      '<linearGradient id="pr-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="45%" stop-color="#7c3aed"/><stop offset="72%" stop-color="#f97316"/><stop offset="100%" stop-color="#fbbf24"/></linearGradient>' +
      '<linearGradient id="pr-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0e7490"/><stop offset="100%" stop-color="#083344"/></linearGradient>' +
      '<linearGradient id="pr-deck" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a16207"/><stop offset="100%" stop-color="#4a2408"/></linearGradient>' +
      '<linearGradient id="pr-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#78350f"/><stop offset="50%" stop-color="#a16207"/><stop offset="100%" stop-color="#4a2408"/></linearGradient>';

    var b = '<rect width="1000" height="560" fill="url(#pr-sky)"/>' +
      stars(30, 20, 10, 960, 130, 13) +
      '<circle cx="838" cy="112" r="34" fill="#fef3c7" opacity=".9"/>' +
      '<circle cx="826" cy="104" r="28" fill="#7c3aed" opacity=".55"/>' +
      '<rect y="268" width="1000" height="120" fill="url(#pr-sea)"/>' +
      '<g fill="#0891b2" opacity=".7">' +
      '<path d="M0 288 q40 -12 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 v18 H0 Z"/></g>' +
      '<g fill="#22d3ee" opacity=".35">' +
      '<path d="M0 320 q50 -14 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 v16 H0 Z"/></g>' +
      '<path d="M760 300 l-10 -34 l24 22 Z" fill="#0f172a" opacity=".55"/>' +
      /* puntea */
      '<rect y="366" width="1000" height="194" fill="url(#pr-deck)"/>' +
      '<g stroke="rgba(60,30,5,.55)" stroke-width="3">' +
      '<path d="M0 400 H1000 M0 446 H1000 M0 496 H1000"/>' +
      '<path d="M140 366 V560 M340 366 V560 M540 366 V560 M740 366 V560 M920 366 V560"/></g>' +
      /* balustradă */
      '<rect y="352" width="1000" height="16" fill="#78350f"/>' +
      '<g fill="#92400e"><rect x="60" y="300" width="14" height="56" rx="4"/><rect x="220" y="300" width="14" height="56" rx="4"/>' +
      '<rect x="380" y="300" width="14" height="56" rx="4"/><rect x="620" y="300" width="14" height="56" rx="4"/><rect x="780" y="300" width="14" height="56" rx="4"/></g>' +
      '<rect y="294" width="1000" height="12" rx="6" fill="#a16207"/>' +
      /* catarg + parâme */
      '<rect x="454" y="0" width="26" height="372" fill="#78350f"/>' +
      '<rect x="382" y="70" width="170" height="12" rx="5" fill="#92400e"/>' +
      '<g stroke="#d6b48a" stroke-width="3" fill="none" opacity=".8">' +
      '<path d="M382 76 L300 300 M552 76 L640 300 M410 76 L466 300 M524 76 L470 300"/></g>' +
      '<path d="M382 82 q84 60 170 0 l0 -6 q-84 56 -170 0 Z" fill="#e7e5e4" opacity=".35"/>';

    /* --- cârma corabiei --- */
    var carma =
      '<ellipse cx="140" cy="466" rx="60" ry="12" fill="#000" opacity=".3"/>' +
      '<rect x="128" y="356" width="24" height="106" rx="6" fill="#78350f"/>' +
      at(140, 320, 'spin',
        '<circle r="56" fill="none" stroke="#92400e" stroke-width="16"/>' +
        '<circle r="18" fill="#a16207"/><circle r="8" fill="#fbbf24"/>' +
        '<g stroke="#92400e" stroke-width="11" stroke-linecap="round">' +
        '<path d="M0 -70 V-14 M0 14 V70 M-70 0 H-14 M14 0 H70 M-49 -49 L-10 -10 M49 49 L10 10 M49 -49 L10 -10 M-49 49 L-10 10"/></g>') +
      at(196, 256, 'floaty2',
        '<ellipse cx="0" cy="6" rx="17" ry="24" fill="#dc2626"/>' +
        '<ellipse cx="-4" cy="10" rx="10" ry="15" fill="#f87171"/>' +
        '<circle cx="2" cy="-18" r="14" fill="#dc2626"/>' +
        '<path d="M12 -20 l16 4 l-16 7 Z" fill="#fbbf24"/>' +
        '<circle cx="6" cy="-21" r="4" fill="#fff"/><circle cx="7" cy="-21" r="2" fill="#0f172a"/>' +
        '<path d="M-14 -2 q-16 16 -6 34 q8 -12 18 -14 Z" fill="#1d4ed8"/>' +
        '<path d="M8 30 q14 14 4 24" stroke="#22c55e" stroke-width="7" fill="none" stroke-linecap="round"/>' +
        '<path d="M-4 30 v10 M6 30 v10" stroke="#fbbf24" stroke-width="4" stroke-linecap="round"/>');

    /* --- cufărul comorii --- */
    var cufar =
      '<ellipse cx="322" cy="486" rx="92" ry="14" fill="#000" opacity=".3"/>' +
      '<rect x="248" y="404" width="148" height="76" rx="8" fill="url(#pr-wood)"/>' +
      '<path d="M248 408 q74 -64 148 0 Z" fill="#a16207"/>' +
      '<path d="M258 406 q64 -52 128 0 Z" fill="#ca8a04"/>' +
      '<rect x="248" y="402" width="148" height="13" fill="#78350f"/>' +
      '<rect x="306" y="360" width="32" height="120" rx="4" fill="#fbbf24" opacity=".9"/>' +
      '<rect x="248" y="436" width="148" height="9" fill="#fbbf24" opacity=".75"/>' +
      '<rect x="308" y="434" width="28" height="30" rx="6" fill="#f59e0b"/>' +
      '<circle cx="322" cy="448" r="6" fill="#78350f"/>' +
      '<g><circle cx="270" cy="396" r="10" fill="#fbbf24"/><circle cx="292" cy="390" r="8" fill="#fde68a"/>' +
      '<circle cx="368" cy="392" r="9" fill="#f59e0b"/><circle cx="350" cy="386" r="6" fill="#fde68a"/>' +
      '<circle cx="378" cy="378" r="5" fill="#f472b6"/><circle cx="262" cy="382" r="5" fill="#38bdf8"/></g>';

    /* --- masa cu harta --- */
    var masa =
      '<rect x="470" y="392" width="180" height="14" rx="5" fill="#92400e"/>' +
      '<rect x="486" y="406" width="14" height="72" fill="#78350f"/><rect x="620" y="406" width="14" height="72" fill="#78350f"/>' +
      '<rect x="478" y="440" width="164" height="10" fill="#78350f"/>' +
      '<g transform="translate(560,368) rotate(-3)">' +
      '<rect x="-84" y="-32" width="168" height="60" rx="5" fill="#fde68a"/>' +
      '<rect x="-84" y="-32" width="168" height="60" rx="5" fill="none" stroke="#b45309" stroke-width="3"/>' +
      '<path d="M-70 4 q26 -22 52 -4 t54 -8" stroke="#b45309" stroke-width="3" fill="none" stroke-dasharray="7 6"/>' +
      '<path d="M36 -12 l12 12 l-12 12 l-12 -12 Z" fill="#dc2626"/>' +
      '<path d="M-62 -14 q10 -10 20 0 q-10 8 -20 0 Z" fill="#65a30d" opacity=".8"/>' +
      '<circle cx="-40" cy="12" r="5" fill="#0891b2" opacity=".7"/>' +
      '<path d="M-84 -32 q-10 30 0 60" fill="#fcd34d"/><path d="M84 -32 q10 30 0 60" fill="#fcd34d"/></g>' +
      /* busola */
      '<g transform="translate(636,378)"><circle r="24" fill="#a16207"/><circle r="19" fill="#fef3c7"/>' +
      '<path d="M0 -14 L5 0 L0 14 L-5 0 Z" fill="#dc2626"/><path d="M0 14 L5 0 L0 -14 L-5 0 Z" fill="#f8fafc" opacity=".01"/>' +
      '<circle r="3" fill="#78350f"/><circle r="24" fill="none" stroke="#78350f" stroke-width="3"/></g>' +
      '<g transform="translate(490,372)"><rect x="-16" y="-8" width="32" height="18" rx="4" fill="#7f1d1d"/>' +
      '<rect x="-16" y="-14" width="32" height="8" rx="3" fill="#a16207"/></g>';

    /* --- tunul --- */
    var tun =
      '<ellipse cx="760" cy="486" rx="82" ry="14" fill="#000" opacity=".3"/>' +
      '<rect x="700" y="426" width="126" height="20" rx="6" fill="#78350f"/>' +
      '<path d="M706 426 l14 -34 h94 l12 34 Z" fill="#92400e"/>' +
      '<circle cx="726" cy="452" r="24" fill="#4a2408"/><circle cx="726" cy="452" r="10" fill="#a16207"/>' +
      '<circle cx="806" cy="452" r="24" fill="#4a2408"/><circle cx="806" cy="452" r="10" fill="#a16207"/>' +
      '<path d="M700 402 h130 l-12 -34 h-106 Z" fill="#334155"/>' +
      '<rect x="690" y="356" width="160" height="34" rx="17" fill="#475569"/>' +
      '<rect x="836" y="352" width="26" height="42" rx="10" fill="#64748b"/>' +
      '<circle cx="862" cy="373" r="15" fill="#0f172a"/>' +
      '<circle cx="694" cy="373" r="18" fill="#334155"/><circle cx="694" cy="373" r="8" fill="#1e293b"/>' +
      '<circle cx="742" cy="410" r="16" fill="#1e293b"/><circle cx="774" cy="414" r="13" fill="#1e293b"/>';

    /* --- ușa cabinei --- */
    var usa =
      '<rect x="862" y="176" width="130" height="200" rx="8" fill="#4a2408"/>' +
      '<g class="door-panel">' +
      '<rect x="870" y="184" width="114" height="184" rx="6" fill="url(#pr-wood)"/>' +
      '<g stroke="#5c2c08" stroke-width="3"><path d="M898 188 V366 M926 184 V366 M954 188 V366"/></g>' +
      '<rect x="870" y="212" width="114" height="12" fill="#334155"/>' +
      '<rect x="870" y="328" width="114" height="12" fill="#334155"/>' +
      '<circle cx="927" cy="272" r="30" fill="#0f172a"/><circle cx="927" cy="272" r="23" fill="#0e7490"/>' +
      '<path d="M906 280 q21 -16 42 0" stroke="#67e8f9" stroke-width="3" fill="none"/>' +
      '<circle cx="927" cy="272" r="30" fill="none" stroke="#fbbf24" stroke-width="6"/>' +
      '<g fill="#fbbf24"><circle cx="927" cy="238" r="4"/><circle cx="927" cy="306" r="4"/><circle cx="893" cy="272" r="4"/><circle cx="961" cy="272" r="4"/></g>' +
      '<circle cx="884" cy="290" r="7" fill="#fbbf24"/>' +
      '</g>' +
      '<rect class="door-light" x="870" y="184" width="114" height="184" rx="6" fill="#fff7ed" opacity="0"/>' +
      /* pavilion cu craniu */
      '<rect x="920" y="120" width="8" height="60" fill="#4a2408"/>' +
      at(958, 128, 'sway',
        '<path d="M-30 -18 h60 v44 l-30 -10 l-30 10 Z" fill="#1c1917"/>' +
        '<circle cx="0" cy="-2" r="10" fill="#f8fafc"/>' +
        '<circle cx="-4" cy="-4" r="2.6" fill="#1c1917"/><circle cx="4" cy="-4" r="2.6" fill="#1c1917"/>' +
        '<path d="M-6 8 h12 v4 h-12 Z" fill="#f8fafc"/>');

    var body = b +
      hs(3, 'Cârma corabiei', 140, 264, [78, 200, 154, 268], carma) +
      hs(0, 'Cufărul comorii', 322, 362, [238, 356, 168, 132], cufar) +
      hs(1, 'Masa cu harta', 560, 336, [462, 330, 196, 152], masa) +
      hs(2, 'Tunul de pe punte', 764, 350, [676, 344, 200, 138], tun) +
      door(927, 172, [856, 170, 142, 212], usa);
    return wrap(defs, body);
  };

  /* ======================== 7. PEȘTERA DE GHEAȚĂ ======================== */
  SCENES.gheata = function () {
    var defs =
      '<linearGradient id="ic-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e3a8a"/><stop offset="50%" stop-color="#1d4ed8"/><stop offset="100%" stop-color="#0c2461"/></linearGradient>' +
      '<linearGradient id="ic-ice" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e0f2fe"/><stop offset="50%" stop-color="#7dd3fc"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>' +
      '<linearGradient id="ic-snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#bae6fd"/></linearGradient>' +
      '<linearGradient id="ic-aurora" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4ade80" stop-opacity=".75"/><stop offset="50%" stop-color="#22d3ee" stop-opacity=".6"/><stop offset="100%" stop-color="#a78bfa" stop-opacity=".7"/></linearGradient>';

    function icicle(x, y, w, h) {
      return '<path d="M' + (x - w) + ' ' + y + ' L' + (x + w) + ' ' + y + ' L' + x + ' ' + (y + h) + ' Z" fill="url(#ic-ice)" opacity=".92"/>';
    }
    var ice = '';
    for (var i = 0; i < 16; i++) ice += icicle(24 + i * 64, 0, 15 + (i % 3) * 7, 48 + (i % 5) * 34);

    var b = '<rect width="1000" height="560" fill="url(#ic-wall)"/>' +
      /* deschiderea peșterii cu auroră */
      '<path d="M330 340 q0 -190 170 -190 q170 0 170 190 Z" fill="#0c1b4d"/>' +
      stars(28, 348, 170, 300, 150, 17) +
      '<path d="M340 260 q90 -70 170 -20 q80 50 152 -14 l0 44 q-84 62 -164 12 q-78 -48 -158 20 Z" fill="url(#ic-aurora)" filter="url(#soft)"/>' +
      '<path d="M344 300 q100 -50 168 -8 q70 42 146 -18 l0 34 q-80 56 -152 16 q-72 -40 -162 14 Z" fill="url(#ic-aurora)" opacity=".6" filter="url(#soft)"/>' +
      '<path d="M330 340 q0 -190 170 -190 q170 0 170 190" fill="none" stroke="#bae6fd" stroke-width="12" opacity=".85"/>' +
      /* zăpadă pe jos */
      '<path d="M0 400 q120 -34 250 -6 q140 30 280 -10 q160 -36 300 6 q100 24 170 -6 L1000 560 L0 560 Z" fill="url(#ic-snow)"/>' +
      '<path d="M0 430 q140 -22 280 4 q150 26 300 -10 q170 -34 420 8 L1000 560 L0 560 Z" fill="#e0f2fe"/>' +
      ice +
      /* fulgi care cad */
      '<g opacity=".85">' + stars(22, 40, 60, 920, 340, 23) + '</g>';

    /* --- cristalul de gheață --- */
    var cristal =
      '<ellipse cx="500" cy="452" rx="72" ry="16" fill="#0369a1" opacity=".35"/>' +
      '<path d="M456 434 h88 l-10 -30 h-68 Z" fill="#bae6fd"/>' +
      at(500, 350, 'floaty',
        '<ellipse rx="66" ry="66" fill="#7dd3fc" opacity=".22" filter="url(#soft2)"/>' +
        '<path d="M0 -76 L34 -22 L22 56 L-22 56 L-34 -22 Z" fill="url(#ic-ice)" stroke="#e0f2fe" stroke-width="4"/>' +
        '<path d="M0 -76 L0 56 M-34 -22 L34 -22" stroke="#e0f2fe" stroke-width="3" opacity=".8"/>' +
        '<path d="M0 -76 L-34 -22 L0 -34 Z" fill="#f0f9ff" opacity=".85"/>' +
        '<path d="M0 -34 L34 -22 L22 56 L0 30 Z" fill="#38bdf8" opacity=".5"/>') +
      '<g class="twinkle"><path d="M562 300 l4 12 l12 4 l-12 4 l-4 12 l-4 -12 l-12 -4 l12 -4 Z" fill="#fff"/></g>' +
      '<g class="twinkle d2"><path d="M436 322 l3 9 l9 3 l-9 3 l-3 9 l-3 -9 l-9 -3 l9 -3 Z" fill="#fff"/></g>';

    /* --- pinguinul --- */
    var pinguin =
      '<ellipse cx="176" cy="466" rx="54" ry="12" fill="#0369a1" opacity=".3"/>' +
      at(176, 380, 'floaty2',
        '<ellipse cx="0" cy="28" rx="46" ry="58" fill="#1e293b"/>' +
        '<ellipse cx="0" cy="36" rx="32" ry="46" fill="#f8fafc"/>' +
        '<circle cx="0" cy="-26" r="36" fill="#1e293b"/>' +
        '<path d="M-22 -18 q22 26 44 0 q-22 16 -44 0 Z" fill="#f8fafc"/>' +
        '<circle cx="-12" cy="-30" r="7" fill="#f8fafc"/><circle cx="12" cy="-30" r="7" fill="#f8fafc"/>' +
        '<circle cx="-11" cy="-29" r="4" fill="#0f172a"/><circle cx="13" cy="-29" r="4" fill="#0f172a"/>' +
        '<path d="M-10 -14 l10 -8 l10 8 l-10 8 Z" fill="#f97316"/>' +
        '<path d="M-46 12 q-22 26 -6 54 q10 -22 12 -44 Z" fill="#0f172a"/>' +
        '<path d="M46 12 q22 26 6 54 q-10 -22 -12 -44 Z" fill="#0f172a"/>' +
        '<path d="M-24 82 q-18 6 -4 14 h28 q6 -10 -6 -14 Z" fill="#f97316"/>' +
        '<path d="M6 82 q18 6 4 14 h-6 q-6 -10 2 -14 Z" fill="#f97316"/>' +
        '<path d="M-30 -56 q6 -22 16 -10" stroke="#1e293b" stroke-width="6" fill="none" stroke-linecap="round"/>');

    /* --- iglu-ul --- */
    var iglu =
      '<ellipse cx="770" cy="446" rx="106" ry="18" fill="#0369a1" opacity=".28"/>' +
      '<path d="M670 434 a100 84 0 0 1 200 0 Z" fill="url(#ic-snow)"/>' +
      '<g stroke="#93c5fd" stroke-width="3" fill="none">' +
      '<path d="M676 396 a96 78 0 0 1 188 0"/><path d="M690 366 a82 62 0 0 1 160 0"/>' +
      '<path d="M712 340 a60 44 0 0 1 116 0"/>' +
      '<path d="M716 434 V398 M760 434 V396 M804 434 V398 M848 434 V404"/>' +
      '<path d="M700 396 V368 M740 394 V366 M780 394 V366 M820 396 V368"/></g>' +
      '<path d="M736 434 a34 40 0 0 1 68 0 Z" fill="#93c5fd"/>' +
      '<path d="M742 434 a28 34 0 0 1 56 0 Z" fill="#0c2461"/>' +
      '<path d="M736 434 a34 40 0 0 1 68 0" fill="none" stroke="#e0f2fe" stroke-width="6"/>' +
      '<g class="twinkle d1"><circle cx="770" cy="416" r="6" fill="#fde68a" opacity=".9"/></g>' +
      '<path d="M770 350 v-24" stroke="#e0f2fe" stroke-width="5"/><circle cx="770" cy="318" r="9" fill="#fbbf24"/>';

    /* --- ursul polar --- */
    var urs =
      '<ellipse cx="316" cy="470" rx="76" ry="14" fill="#0369a1" opacity=".3"/>' +
      '<ellipse cx="316" cy="418" rx="76" ry="50" fill="#f8fafc"/>' +
      '<ellipse cx="316" cy="428" rx="58" ry="36" fill="#e0f2fe"/>' +
      '<circle cx="252" cy="368" r="38" fill="#f8fafc"/>' +
      '<circle cx="228" cy="340" r="12" fill="#f8fafc"/><circle cx="272" cy="336" r="12" fill="#f8fafc"/>' +
      '<circle cx="228" cy="340" r="6" fill="#fbcfe8"/><circle cx="272" cy="336" r="6" fill="#fbcfe8"/>' +
      '<ellipse cx="240" cy="386" rx="22" ry="16" fill="#f1f5f9"/>' +
      '<circle cx="234" cy="382" r="7" fill="#1e293b"/>' +
      '<circle cx="236" cy="380" r="2.4" fill="#fff"/>' +
      '<circle cx="240" cy="362" r="4.6" fill="#1e293b"/><circle cx="266" cy="360" r="4.6" fill="#1e293b"/>' +
      '<path d="M232 394 q10 8 18 2" stroke="#94a3b8" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="270" cy="462" rx="24" ry="14" fill="#f1f5f9"/>' +
      '<ellipse cx="356" cy="462" rx="24" ry="14" fill="#f1f5f9"/>' +
      '<g fill="#cbd5e1"><circle cx="262" cy="466" r="3"/><circle cx="270" cy="468" r="3"/><circle cx="278" cy="466" r="3"/></g>' +
      '<path d="M390 404 q28 -12 22 -34" stroke="#f8fafc" stroke-width="12" fill="none" stroke-linecap="round"/>' +
      '<g class="twinkle d3"><circle cx="300" cy="330" r="4" fill="#fff"/></g>';

    /* --- poarta de gheață --- */
    var usa =
      '<path d="M846 440 L846 190 q66 -74 132 0 L978 440 Z" fill="#0c2461"/>' +
      '<g class="door-panel">' +
      '<path d="M854 434 L854 196 q58 -64 116 0 L970 434 Z" fill="url(#ic-ice)"/>' +
      '<path d="M866 428 L866 202 q46 -52 92 0 L958 428 Z" fill="#7dd3fc" opacity=".7"/>' +
      '<g stroke="#f0f9ff" stroke-width="4" opacity=".9">' +
      '<path d="M912 216 V420 M866 260 H958 M866 330 H958"/>' +
      '<path d="M880 232 L944 296 M944 232 L880 296 M880 350 L944 414 M944 350 L880 414"/></g>' +
      '<circle cx="912" cy="296" r="30" fill="#e0f2fe" opacity=".9"/>' +
      '<path d="M912 268 v56 M888 282 l48 28 M936 282 l-48 28" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="912" cy="296" r="9" fill="#0284c7"/>' +
      '<g fill="#e0f2fe"><circle cx="886" cy="380" r="7"/><circle cx="938" cy="380" r="7"/></g>' +
      '</g>' +
      '<path class="door-light" d="M854 434 L854 196 q58 -64 116 0 L970 434 Z" fill="#f0f9ff" opacity="0"/>' +
      icicle(880, 190, 12, 40) + icicle(944, 192, 10, 32);

    var body = b +
      hs(1, 'Pinguinul curajos', 176, 306, [124, 300, 106, 170], pinguin) +
      hs(3, 'Ursul polar', 300, 336, [230, 328, 180, 152], urs) +
      hs(0, 'Cristalul de gheață', 500, 268, [440, 264, 122, 178], cristal) +
      hs(2, 'Iglu-ul de zăpadă', 770, 312, [664, 306, 214, 136], iglu) +
      door(912, 186, [840, 184, 146, 262], usa);
    return wrap(defs, body);
  };

  /* ======================= 8. BIBLIOTECA FERMECATĂ ====================== */
  SCENES.biblioteca = function () {
    var defs =
      '<linearGradient id="bl-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4a2c12"/><stop offset="55%" stop-color="#35200d"/><stop offset="100%" stop-color="#1c1206"/></linearGradient>' +
      '<linearGradient id="bl-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#7c4a1e"/><stop offset="50%" stop-color="#9a5f26"/><stop offset="100%" stop-color="#5c3312"/></linearGradient>' +
      '<linearGradient id="bl-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7c4a1e"/><stop offset="100%" stop-color="#3a2210"/></linearGradient>';

    var BOOKC = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#be185d', '#ca8a04'];
    function books(x, y, n, h) {
      var s = '', xx = x;
      for (var i = 0; i < n; i++) {
        var w = 12 + (i * 7) % 11, hh = h - (i * 5) % 14;
        s += '<rect x="' + xx + '" y="' + (y - hh) + '" width="' + w + '" height="' + hh + '" rx="2.5" fill="' + BOOKC[(i + x) % BOOKC.length] + '"/>';
        s += '<rect x="' + (xx + 2) + '" y="' + (y - hh + 5) + '" width="' + (w - 4) + '" height="3" fill="#fde68a" opacity=".55"/>';
        xx += w + 3;
      }
      return s;
    }
    function shelf(x, y, w, rows) {
      var s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + (rows * 76 + 12) + '" rx="6" fill="url(#bl-wood)"/>';
      s += '<rect x="' + (x + 8) + '" y="' + (y + 8) + '" width="' + (w - 16) + '" height="' + (rows * 76 - 4) + '" fill="#231508"/>';
      for (var r = 0; r < rows; r++) {
        var by = y + 8 + (r + 1) * 76 - 8;
        s += books(x + 14, by, Math.floor((w - 28) / 20), 58);
        s += '<rect x="' + (x + 8) + '" y="' + by + '" width="' + (w - 16) + '" height="9" fill="url(#bl-wood)"/>';
      }
      return s;
    }

    var b = '<rect width="1000" height="560" fill="url(#bl-wall)"/>' +
      '<rect y="426" width="1000" height="134" fill="url(#bl-floor)"/>' +
      '<g stroke="rgba(20,10,0,.45)" stroke-width="3"><path d="M0 466 H1000 M0 512 H1000 M120 426 V560 M380 426 V560 M640 426 V560 M880 426 V560"/></g>' +
      '<rect y="418" width="1000" height="12" fill="#5c3312"/>' +
      /* fereastră arcuită */
      '<path d="M596 120 q68 -76 136 0 L732 300 L596 300 Z" fill="#1e1b4b"/>' +
      stars(20, 604, 130, 120, 160, 29) +
      '<circle cx="700" cy="176" r="22" fill="#fde68a" opacity=".9"/>' +
      '<path d="M664 120 v180 M596 200 h136" stroke="#5c3312" stroke-width="8"/>' +
      '<path d="M596 120 q68 -76 136 0 L732 300 L596 300 Z" fill="none" stroke="#7c4a1e" stroke-width="10"/>' +
      '<path d="M596 300 h136 l14 16 h-164 Z" fill="#7c4a1e"/>' +
      /* rafturi */
      shelf(20, 96, 200, 4) +
      /* candelabru */
      '<path d="M420 0 v52" stroke="#78350f" stroke-width="5"/>' +
      '<path d="M356 52 h128" stroke="#a16207" stroke-width="8" stroke-linecap="round"/>' +
      '<g fill="#fde68a">' +
      '<rect x="352" y="34" width="10" height="20" rx="3" fill="#f8fafc"/><rect x="415" y="26" width="10" height="28" rx="3" fill="#f8fafc"/><rect x="478" y="34" width="10" height="20" rx="3" fill="#f8fafc"/></g>' +
      '<g class="flicker"><ellipse cx="357" cy="28" rx="6" ry="10" fill="#fbbf24"/><ellipse cx="420" cy="20" rx="6" ry="10" fill="#fbbf24"/><ellipse cx="483" cy="28" rx="6" ry="10" fill="#fbbf24"/></g>' +
      '<ellipse cx="420" cy="80" rx="150" ry="80" fill="#fbbf24" opacity=".10" filter="url(#soft2)"/>' +
      /* cărți plutitoare */
      at(300, 300, 'floaty', '<g transform="rotate(-14)"><rect x="-24" y="-16" width="48" height="32" rx="3" fill="#2563eb"/><path d="M0 -16 v32" stroke="#1e3a8a" stroke-width="3"/><path d="M-24 -16 q24 -8 24 0 q0 -8 24 0 v32 q-24 -8 -24 0 q0 -8 -24 0 Z" fill="#f8fafc" opacity=".92"/></g>') +
      at(560, 366, 'floaty2', '<g transform="rotate(11)"><rect x="-20" y="-14" width="40" height="28" rx="3" fill="#16a34a"/><path d="M-20 -14 q20 -7 20 0 q0 -7 20 0 v28 q-20 -7 -20 0 q0 -7 -20 0 Z" fill="#fef3c7" opacity=".92"/></g>') +
      '<g class="twinkle d1"><circle cx="620" cy="360" r="4" fill="#fde68a"/></g>' +
      '<g class="twinkle d3"><circle cx="352" cy="240" r="3.4" fill="#fde68a"/></g>';

    /* --- cartea magică pe pupitru --- */
    var carte =
      '<ellipse cx="440" cy="474" rx="86" ry="14" fill="#000" opacity=".35"/>' +
      '<path d="M410 462 h60 l14 -70 h-88 Z" fill="#5c3312"/>' +
      '<rect x="392" y="380" width="96" height="16" rx="5" fill="#7c4a1e"/>' +
      '<g transform="translate(440,352)">' +
      '<ellipse rx="86" ry="52" fill="#fbbf24" opacity=".16" filter="url(#soft2)"/>' +
      '<path d="M-70 -6 q34 -22 68 -6 q34 -16 68 6 l0 34 q-34 -20 -68 -4 q-34 -16 -68 4 Z" fill="#8b5cf6"/>' +
      '<path d="M-64 -8 q32 -20 62 -6 v34 q-30 -14 -62 4 Z" fill="#f8fafc"/>' +
      '<path d="M64 -8 q-32 -20 -62 -6 v34 q30 -14 62 4 Z" fill="#f1f5f9"/>' +
      '<g stroke="#94a3b8" stroke-width="2" opacity=".8"><path d="M-52 2 h34 M-52 10 h34 M-52 18 h26 M18 2 h34 M18 10 h34 M18 18 h26"/></g>' +
      '<path d="M0 -14 v40" stroke="#6d28d9" stroke-width="4"/>' +
      '<g class="twinkle"><path d="M0 -46 l6 14 l14 6 l-14 6 l-6 14 l-6 -14 l-14 -6 l14 -6 Z" fill="#fde68a"/></g>' +
      '<g class="twinkle d2"><circle cx="-40" cy="-34" r="4" fill="#fde68a"/></g>' +
      '<g class="twinkle d1"><circle cx="44" cy="-30" r="3.4" fill="#fde68a"/></g>' +
      '</g>';

    /* --- globul pământesc --- */
    var glob =
      '<ellipse cx="176" cy="470" rx="58" ry="12" fill="#000" opacity=".35"/>' +
      '<path d="M152 458 h48 l10 -30 h-68 Z" fill="#5c3312"/>' +
      '<rect x="150" y="418" width="52" height="12" rx="5" fill="#7c4a1e"/>' +
      '<path d="M120 356 a56 56 0 0 0 112 0" fill="none" stroke="#a16207" stroke-width="7"/>' +
      '<rect x="172" y="404" width="8" height="20" fill="#a16207"/>' +
      at(176, 350, 'spin-r',
        '<circle r="52" fill="#0ea5e9"/>' +
        '<path d="M-40 -20 q22 -14 40 -2 q16 10 34 0 l-6 18 q-20 10 -36 0 q-18 -10 -34 4 Z" fill="#22c55e"/>' +
        '<path d="M-30 22 q22 -10 44 2 q10 6 22 2 l-4 14 q-16 4 -28 -2 q-20 -10 -36 -2 Z" fill="#16a34a"/>' +
        '<circle r="52" fill="none" stroke="#0369a1" stroke-width="3" opacity=".5"/>' +
        '<ellipse rx="52" ry="20" fill="none" stroke="#e0f2fe" stroke-width="2" opacity=".45"/>' +
        '<path d="M0 -52 a52 52 0 0 1 0 104 a30 52 0 0 1 0 -104" fill="#fff" opacity=".12"/>');

    /* --- clepsidra fermecată --- */
    var clepsidra =
      '<ellipse cx="700" cy="472" rx="56" ry="12" fill="#000" opacity=".35"/>' +
      '<rect x="650" y="446" width="100" height="18" rx="6" fill="#7c4a1e"/>' +
      '<rect x="650" y="336" width="100" height="16" rx="6" fill="#7c4a1e"/>' +
      '<rect x="656" y="352" width="10" height="94" fill="#a16207"/><rect x="734" y="352" width="10" height="94" fill="#a16207"/>' +
      '<path d="M672 352 h56 l-28 46 Z" fill="#bae6fd" opacity=".65"/>' +
      '<path d="M672 446 h56 l-28 -46 Z" fill="#bae6fd" opacity=".65"/>' +
      '<path d="M672 352 h56 l-28 46 l28 48 h-56 l28 -48 Z" fill="none" stroke="#e0f2fe" stroke-width="3"/>' +
      '<path d="M678 358 h44 l-22 36 Z" fill="#fbbf24"/>' +
      '<path d="M682 440 h36 l-18 -28 Z" fill="#f59e0b"/>' +
      '<rect x="698" y="392" width="4" height="26" fill="#fbbf24"/>' +
      '<ellipse cx="700" cy="398" rx="46" ry="60" fill="#fbbf24" opacity=".12" filter="url(#soft)"/>' +
      '<g class="twinkle d2"><circle cx="742" cy="330" r="4" fill="#fde68a"/></g>';

    /* --- raftul cu cărți colorate --- */
    var raft =
      '<rect x="272" y="112" width="196" height="120" rx="8" fill="url(#bl-wood)"/>' +
      '<rect x="282" y="122" width="176" height="100" fill="#231508"/>' +
      books(290, 214, 8, 76) +
      '<rect x="282" y="214" width="176" height="10" fill="url(#bl-wood)"/>' +
      '<g class="twinkle"><path d="M300 148 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z" fill="#fde68a"/></g>' +
      '<rect x="272" y="230" width="196" height="12" rx="5" fill="#5c3312"/>';

    /* --- ușa bibliotecii --- */
    var usa =
      '<path d="M812 200 q0 -84 84 -84 q84 0 84 84 L980 440 L812 440 Z" fill="#3a2210"/>' +
      '<g class="door-panel">' +
      '<path d="M822 204 q0 -74 74 -74 q74 0 74 74 L970 432 L822 432 Z" fill="url(#bl-wood)"/>' +
      '<path d="M834 206 q0 -62 62 -62 q62 0 62 62 L958 420 L834 420 Z" fill="none" stroke="#5c3312" stroke-width="5"/>' +
      '<g stroke="#5c3312" stroke-width="3"><path d="M896 144 V420 M846 250 H946 M846 330 H946"/></g>' +
      '<circle cx="896" cy="196" r="28" fill="#231508"/>' +
      '<path d="M896 174 l6 14 l14 6 l-14 6 l-6 14 l-6 -14 l-14 -6 l14 -6 Z" fill="#fde68a" class="twinkle"/>' +
      '<circle cx="866" cy="290" r="12" fill="#a16207"/><circle cx="866" cy="290" r="5" fill="#5c3312"/>' +
      '<rect x="908" y="276" width="34" height="28" rx="5" fill="#231508"/>' +
      '<rect x="918" y="286" width="14" height="9" rx="2" fill="#fbbf24"/>' +
      '</g>' +
      '<path class="door-light" d="M822 204 q0 -74 74 -74 q74 0 74 74 L970 432 L822 432 Z" fill="#fffbeb" opacity="0"/>';

    var body = b +
      hs(1, 'Globul pământesc', 176, 296, [116, 290, 122, 184], glob) +
      hs(3, 'Raftul cu cărți colorate', 370, 108, [264, 104, 212, 144], raft) +
      hs(0, 'Cartea magică', 440, 302, [354, 296, 174, 182], carte) +
      hs(2, 'Clepsidra fermecată', 700, 322, [640, 316, 122, 166], clepsidra) +
      door(896, 122, [806, 112, 182, 334], usa);
    return wrap(defs, body);
  };

  /* ======================= 9. FABRICA DE BOMBOANE ======================= */
  SCENES.bomboane = function () {
    var defs =
      '<linearGradient id="cd-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fbcfe8"/><stop offset="55%" stop-color="#f9a8d4"/><stop offset="100%" stop-color="#db2777"/></linearGradient>' +
      '<linearGradient id="cd-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a21caf"/><stop offset="100%" stop-color="#581c87"/></linearGradient>' +
      '<linearGradient id="cd-choc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a16207"/><stop offset="100%" stop-color="#451a03"/></linearGradient>' +
      '<linearGradient id="cd-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f1f5f9"/><stop offset="50%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient>';

    var dots = '';
    for (var i = 0; i < 40; i++) {
      dots += '<circle cx="' + (30 + (i % 10) * 106) + '" cy="' + (30 + Math.floor(i / 10) * 100) + '" r="' + (9 + (i % 3) * 4) + '" fill="#fff" opacity=".18"/>';
    }
    var b = '<rect width="1000" height="560" fill="url(#cd-wall)"/>' + dots +
      /* ghirlande */
      '<path d="M0 40 q120 70 250 0 t250 0 t250 0 t250 0" fill="none" stroke="#fff" stroke-width="6" opacity=".5"/>' +
      '<g fill="#fef08a"><circle cx="126" cy="66" r="9"/><circle cx="376" cy="66" r="9"/><circle cx="626" cy="66" r="9"/><circle cx="876" cy="66" r="9"/></g>' +
      '<rect y="420" width="1000" height="140" fill="url(#cd-floor)"/>' +
      /* dale în carouri */
      '<g fill="#c026d3" opacity=".55">' +
      '<rect x="0" y="420" width="70" height="34"/><rect x="140" y="420" width="70" height="34"/><rect x="280" y="420" width="70" height="34"/><rect x="420" y="420" width="70" height="34"/><rect x="560" y="420" width="70" height="34"/><rect x="700" y="420" width="70" height="34"/><rect x="840" y="420" width="70" height="34"/>' +
      '<rect x="70" y="454" width="80" height="42"/><rect x="230" y="454" width="80" height="42"/><rect x="390" y="454" width="80" height="42"/><rect x="550" y="454" width="80" height="42"/><rect x="710" y="454" width="80" height="42"/><rect x="870" y="454" width="80" height="42"/>' +
      '<rect x="0" y="496" width="90" height="64"/><rect x="180" y="496" width="90" height="64"/><rect x="360" y="496" width="90" height="64"/><rect x="540" y="496" width="90" height="64"/><rect x="720" y="496" width="90" height="64"/><rect x="900" y="496" width="90" height="64"/></g>' +
      /* râul de ciocolată */
      '<path d="M0 396 q120 -18 250 0 t250 0 t250 0 t250 0 v30 H0 Z" fill="url(#cd-choc)"/>' +
      '<path d="M0 400 q120 -16 250 2 t250 -2 t250 2 t250 -2" fill="none" stroke="#c2740f" stroke-width="5" opacity=".7"/>' +
      /* conducte */
      '<g stroke="#f472b6" stroke-width="18" fill="none" stroke-linecap="round" opacity=".9">' +
      '<path d="M0 130 h150 q30 0 30 30 v40"/><path d="M1000 118 h-140 q-30 0 -30 30 v40"/></g>' +
      '<g stroke="#fff" stroke-width="5" fill="none" opacity=".45"><path d="M0 124 h146"/><path d="M1000 112 h-136"/></g>';

    /* --- mașina de bomboane --- */
    var masina =
      '<ellipse cx="150" cy="440" rx="94" ry="16" fill="#000" opacity=".25"/>' +
      '<rect x="72" y="250" width="156" height="180" rx="16" fill="url(#cd-metal)"/>' +
      '<rect x="88" y="266" width="124" height="84" rx="10" fill="#7c3aed"/>' +
      '<circle cx="150" cy="308" r="32" fill="#c4b5fd"/>' +
      at(150, 308, 'spin', '<g fill="#db2777"><circle cx="0" cy="-18" r="7"/><circle cx="16" cy="9" r="7" fill="#f59e0b"/><circle cx="-16" cy="9" r="7" fill="#22c55e"/></g>') +
      '<rect x="88" y="360" width="124" height="26" rx="8" fill="#0f172a"/>' +
      '<g><circle class="blinkled" cx="106" cy="373" r="6" fill="#4ade80"/><circle class="blinkled d1" cx="128" cy="373" r="6" fill="#fbbf24"/><circle class="blinkled d2" cx="150" cy="373" r="6" fill="#f472b6"/></g>' +
      '<rect x="96" y="396" width="108" height="30" rx="8" fill="#94a3b8"/>' +
      '<rect x="116" y="404" width="68" height="14" rx="7" fill="#1e293b"/>' +
      '<path d="M72 250 h156 l-18 -26 h-120 Z" fill="#f472b6"/>' +
      '<rect x="132" y="196" width="36" height="30" rx="6" fill="#94a3b8"/>' +
      '<circle cx="150" cy="186" r="16" fill="#f472b6"/><circle cx="150" cy="186" r="8" fill="#fff" opacity=".7"/>' +
      '<g fill="#fbbf24"><circle cx="112" cy="440" r="8"/><circle cx="150" cy="444" r="9" fill="#f472b6"/><circle cx="188" cy="440" r="8" fill="#38bdf8"/></g>';

    /* --- cazanul cu ciocolată --- */
    var cazan =
      '<ellipse cx="392" cy="452" rx="86" ry="15" fill="#000" opacity=".25"/>' +
      '<path d="M320 340 h144 l-16 106 h-112 Z" fill="url(#cd-metal)"/>' +
      '<path d="M320 340 h144 l-4 26 h-136 Z" fill="#94a3b8"/>' +
      '<ellipse cx="392" cy="340" rx="72" ry="18" fill="#7c2d12"/>' +
      '<ellipse cx="392" cy="338" rx="64" ry="14" fill="#a16207"/>' +
      at(370, 330, 'bubble', '<circle r="6" fill="#c2740f"/>') +
      at(408, 334, 'bubble d1', '<circle r="5" fill="#d97706"/>') +
      at(392, 332, 'bubble d2', '<circle r="4" fill="#e8a33d"/>') +
      '<rect x="336" y="382" width="112" height="14" rx="6" fill="#64748b"/>' +
      '<circle cx="392" cy="416" r="14" fill="#f472b6"/><path d="M392 404 v24 M380 416 h24" stroke="#fff" stroke-width="4"/>' +
      '<path d="M392 292 v46" stroke="#94a3b8" stroke-width="10"/>' +
      '<path d="M352 292 h80" stroke="#cbd5e1" stroke-width="14" stroke-linecap="round"/>';

    /* --- tortul de pe bandă --- */
    var tort =
      '<rect x="486" y="416" width="164" height="22" rx="11" fill="#334155"/>' +
      '<g fill="#64748b"><circle cx="504" cy="427" r="9"/><circle cx="568" cy="427" r="9"/><circle cx="632" cy="427" r="9"/></g>' +
      '<ellipse cx="568" cy="410" rx="66" ry="10" fill="#000" opacity=".2"/>' +
      '<rect x="508" y="368" width="120" height="42" rx="6" fill="#fde68a"/>' +
      '<path d="M508 372 q30 22 60 0 q30 22 60 0 v-10 q-30 20 -60 0 q-30 20 -60 0 Z" fill="#f472b6"/>' +
      '<rect x="524" y="326" width="88" height="42" rx="6" fill="#fef3c7"/>' +
      '<path d="M524 330 q22 20 44 0 q22 20 44 0 v-8 q-22 18 -44 0 q-22 18 -44 0 Z" fill="#a16207"/>' +
      '<rect x="544" y="292" width="48" height="34" rx="6" fill="#fde68a"/>' +
      '<circle cx="568" cy="288" r="10" fill="#dc2626"/>' +
      '<rect x="565" y="264" width="6" height="24" rx="3" fill="#f8fafc"/>' +
      '<g class="flicker"><ellipse cx="568" cy="258" rx="5" ry="9" fill="#fbbf24"/></g>' +
      '<g fill="#38bdf8"><circle cx="530" cy="352" r="4"/><circle cx="600" cy="348" r="4" fill="#4ade80"/><circle cx="556" cy="392" r="4" fill="#a78bfa"/><circle cx="612" cy="390" r="4" fill="#fb7185"/></g>';

    /* --- copacul cu acadele --- */
    var copac =
      '<ellipse cx="726" cy="452" rx="72" ry="14" fill="#000" opacity=".25"/>' +
      '<path d="M712 446 h28 l8 -120 h-44 Z" fill="#a16207"/>' +
      '<path d="M726 366 q-30 -10 -40 -34" stroke="#a16207" stroke-width="9" fill="none" stroke-linecap="round"/>' +
      '<path d="M726 346 q32 -12 42 -34" stroke="#a16207" stroke-width="9" fill="none" stroke-linecap="round"/>' +
      at(726, 268, 'floaty2',
        '<circle r="46" fill="#f472b6"/>' +
        '<path d="M0 -46 a46 46 0 0 1 0 92 Z" fill="#fb7185" opacity=".7"/>' +
        '<g stroke="#fff" stroke-width="7" fill="none" opacity=".85">' +
        '<path d="M-30 -26 a44 44 0 0 1 22 -14"/><path d="M-10 30 a44 44 0 0 0 34 -18"/></g>' +
        '<circle r="46" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/>') +
      at(686, 332, 'floaty',
        '<circle r="24" fill="#38bdf8"/><path d="M0 -24 a24 24 0 0 1 0 48 Z" fill="#0ea5e9" opacity=".7"/>' +
        '<circle r="24" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>') +
      at(770, 318, 'floaty2',
        '<circle r="20" fill="#4ade80"/><path d="M0 -20 a20 20 0 0 1 0 40 Z" fill="#22c55e" opacity=".7"/>' +
        '<circle r="20" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>') +
      '<g fill="#fef08a"><circle cx="700" cy="440" r="7"/><circle cx="746" cy="442" r="6" fill="#c084fc"/></g>';

    /* --- ușa de ciocolată --- */
    var usa =
      '<rect x="846" y="150" width="140" height="290" rx="14" fill="#451a03"/>' +
      '<g class="door-panel">' +
      '<rect x="856" y="160" width="120" height="270" rx="10" fill="url(#cd-choc)"/>' +
      '<g stroke="#7c2d12" stroke-width="4" fill="none">' +
      '<path d="M856 226 h120 M856 292 h120 M856 358 h120 M916 160 V430"/></g>' +
      '<g fill="#c2740f" opacity=".55">' +
      '<rect x="866" y="170" width="42" height="48" rx="6"/><rect x="924" y="170" width="42" height="48" rx="6"/>' +
      '<rect x="866" y="236" width="42" height="48" rx="6"/><rect x="924" y="236" width="42" height="48" rx="6"/>' +
      '<rect x="866" y="302" width="42" height="48" rx="6"/><rect x="924" y="302" width="42" height="48" rx="6"/>' +
      '<rect x="866" y="368" width="42" height="52" rx="6"/><rect x="924" y="368" width="42" height="52" rx="6"/></g>' +
      '<circle cx="916" cy="292" r="26" fill="#f472b6"/>' +
      '<circle cx="916" cy="292" r="26" fill="none" stroke="#fff" stroke-width="5" opacity=".8"/>' +
      '<path d="M916 292 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0" fill="#fff" opacity=".85"/>' +
      '<rect x="960" y="270" width="14" height="44" rx="7" fill="#fbbf24"/>' +
      '</g>' +
      '<rect class="door-light" x="856" y="160" width="120" height="270" rx="10" fill="#fff7ed" opacity="0"/>' +
      '<path d="M846 150 h140 l-14 -26 h-112 Z" fill="#f472b6"/>' +
      '<g fill="#fff" opacity=".75"><circle cx="880" cy="138" r="5"/><circle cx="916" cy="136" r="5"/><circle cx="952" cy="138" r="5"/></g>';

    var body = b +
      hs(0, 'Mașina de bomboane', 150, 182, [62, 178, 176, 268], masina) +
      hs(1, 'Cazanul cu ciocolată', 392, 288, [312, 284, 160, 174], cazan) +
      hs(2, 'Tortul de pe bandă', 568, 254, [480, 248, 176, 190], tort) +
      hs(3, 'Copacul cu acadele', 726, 222, [660, 216, 132, 240], copac) +
      door(916, 146, [840, 118, 152, 328], usa);
    return wrap(defs, body);
  };

  /* ======================== 10. ORAȘUL ROBOȚILOR ======================== */
  SCENES.roboti = function () {
    var defs =
      '<linearGradient id="rb-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#312e81"/><stop offset="55%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#0b0a24"/></linearGradient>' +
      '<linearGradient id="rb-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e2e8f0"/><stop offset="45%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#475569"/></linearGradient>' +
      '<linearGradient id="rb-neon" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#22d3ee"/><stop offset="50%" stop-color="#a78bfa"/><stop offset="100%" stop-color="#f472b6"/></linearGradient>';

    var circ = '<g stroke="#22d3ee" stroke-width="2.5" fill="none" opacity=".38">';
    for (var i = 0; i < 9; i++) {
      var yy = 30 + i * 44;
      circ += '<path d="M0 ' + yy + ' h' + (90 + i * 40) + ' v' + (i % 2 ? 26 : -26) + ' h' + (140 + i * 20) + '"/>';
      circ += '<circle cx="' + (90 + i * 40) + '" cy="' + yy + '" r="4" fill="#22d3ee"/>';
    }
    circ += '</g>';

    var b = '<rect width="1000" height="560" fill="url(#rb-wall)"/>' + circ +
      /* zgârie-nori în fundal */
      '<g fill="#1e1b4b" opacity=".9">' +
      '<rect x="60" y="150" width="70" height="270" rx="6"/><rect x="150" y="196" width="54" height="224" rx="6"/>' +
      '<rect x="806" y="170" width="66" height="250" rx="6"/><rect x="884" y="212" width="50" height="208" rx="6"/></g>' +
      '<g fill="#fbbf24" opacity=".85">' +
      '<rect x="72" y="166" width="12" height="14"/><rect x="94" y="166" width="12" height="14"/><rect x="72" y="196" width="12" height="14"/><rect x="106" y="212" width="12" height="14"/>' +
      '<rect x="162" y="214" width="11" height="13"/><rect x="182" y="240" width="11" height="13"/>' +
      '<rect x="818" y="188" width="12" height="14"/><rect x="842" y="216" width="12" height="14"/><rect x="896" y="230" width="11" height="13"/></g>' +
      '<rect y="418" width="1000" height="142" fill="#111031"/>' +
      '<g stroke="#22d3ee" stroke-width="3" opacity=".35"><path d="M0 460 H1000 M0 510 H1000 M160 418 V560 M420 418 V560 M680 418 V560 M900 418 V560"/></g>' +
      '<rect y="410" width="1000" height="10" fill="url(#rb-neon)" opacity=".8"/>' +
      '<ellipse cx="500" cy="424" rx="420" ry="40" fill="#a78bfa" opacity=".12" filter="url(#soft2)"/>';

    /* --- robotul mare --- */
    var robot =
      '<ellipse cx="196" cy="452" rx="82" ry="14" fill="#000" opacity=".45"/>' +
      '<rect x="140" y="300" width="112" height="126" rx="20" fill="url(#rb-metal)"/>' +
      '<rect x="156" y="320" width="80" height="56" rx="10" fill="#0b0a24"/>' +
      '<g stroke="#22d3ee" stroke-width="3" fill="none"><path d="M164 356 l12 -16 l10 12 l14 -24 l12 20 l10 -10 h12"/></g>' +
      '<rect x="164" y="388" width="64" height="20" rx="8" fill="#312e81"/>' +
      '<g><circle class="blinkled" cx="180" cy="398" r="6" fill="#4ade80"/><circle class="blinkled d1" cx="198" cy="398" r="6" fill="#fbbf24"/><circle class="blinkled d2" cx="216" cy="398" r="6" fill="#f472b6"/></g>' +
      '<rect x="112" y="316" width="24" height="80" rx="12" fill="#64748b"/>' +
      '<rect x="256" y="316" width="24" height="80" rx="12" fill="#64748b"/>' +
      '<circle cx="124" cy="406" r="15" fill="#94a3b8"/><circle cx="268" cy="406" r="15" fill="#94a3b8"/>' +
      '<rect x="158" y="426" width="26" height="26" rx="8" fill="#475569"/>' +
      '<rect x="208" y="426" width="26" height="26" rx="8" fill="#475569"/>' +
      '<rect x="152" y="242" width="88" height="60" rx="18" fill="#cbd5e1"/>' +
      '<rect x="162" y="256" width="68" height="30" rx="14" fill="#0b0a24"/>' +
      '<circle cx="180" cy="271" r="8" fill="#22d3ee"/><circle cx="212" cy="271" r="8" fill="#22d3ee"/>' +
      '<circle cx="180" cy="271" r="3" fill="#e0f2fe"/><circle cx="212" cy="271" r="3" fill="#e0f2fe"/>' +
      '<path d="M196 242 v-18" stroke="#94a3b8" stroke-width="5"/>' +
      '<g class="twinkle"><circle cx="196" cy="216" r="9" fill="#f472b6"/></g>' +
      '<rect x="146" y="296" width="100" height="10" rx="5" fill="#64748b"/>';

    /* --- panoul cu ecrane --- */
    var ecrane =
      '<rect x="352" y="140" width="290" height="196" rx="14" fill="#0b0a24" stroke="#475569" stroke-width="6"/>' +
      '<rect x="366" y="154" width="130" height="80" rx="8" fill="#0c4a6e"/>' +
      '<g stroke="#7dd3fc" stroke-width="3" fill="none"><path d="M376 216 l20 -30 l18 20 l22 -40 l20 32 l16 -18 h14"/></g>' +
      '<rect x="508" y="154" width="120" height="80" rx="8" fill="#1e1b4b"/>' +
      '<g fill="#a78bfa"><rect x="520" y="200" width="16" height="26" rx="3"/><rect x="544" y="184" width="16" height="42" rx="3"/><rect x="568" y="194" width="16" height="32" rx="3"/><rect x="592" y="172" width="16" height="54" rx="3"/></g>' +
      '<rect x="366" y="248" width="262" height="74" rx="8" fill="#111031"/>' +
      '<g fill="#22d3ee" opacity=".9"><rect x="380" y="262" width="60" height="10" rx="5"/><rect x="452" y="262" width="90" height="10" rx="5"/><rect x="380" y="282" width="120" height="10" rx="5"/><rect x="512" y="282" width="46" height="10" rx="5"/><rect x="380" y="302" width="80" height="10" rx="5"/></g>' +
      '<g><circle class="blinkled" cx="600" cy="302" r="8" fill="#4ade80"/></g>' +
      '<rect x="352" y="336" width="290" height="14" rx="6" fill="#475569"/>' +
      '<ellipse cx="497" cy="238" rx="180" ry="90" fill="#22d3ee" opacity=".08" filter="url(#soft2)"/>';

    /* --- roțile dințate --- */
    function gear(r, teeth, col) {
      var s = '<circle r="' + r + '" fill="' + col + '"/>', k;
      for (k = 0; k < teeth; k++) {
        var a = k * 360 / teeth;
        s += '<rect x="' + (-r * 0.16) + '" y="' + (-r - r * 0.26) + '" width="' + (r * 0.32) + '" height="' + (r * 0.3) + '" rx="3" fill="' + col + '" transform="rotate(' + a + ')"/>';
      }
      s += '<circle r="' + (r * 0.34) + '" fill="#0b0a24"/><circle r="' + (r * 0.16) + '" fill="' + col + '"/>';
      return s;
    }
    var roti =
      '<rect x="676" y="230" width="16" height="200" fill="#334155"/>' +
      at(716, 288, 'spin', gear(52, 10, '#94a3b8')) +
      at(792, 344, 'spin-r', gear(38, 8, '#f472b6')) +
      at(690, 380, 'spin-r', gear(30, 8, '#22d3ee')) +
      '<circle cx="716" cy="288" r="10" fill="#e2e8f0"/>' +
      '<circle cx="792" cy="344" r="8" fill="#fce7f3"/>' +
      '<rect x="660" y="424" width="180" height="16" rx="7" fill="#475569"/>';

    /* --- bateria uriașă --- */
    var baterie =
      '<ellipse cx="500" cy="446" rx="62" ry="12" fill="#000" opacity=".45"/>' +
      '<rect x="452" y="356" width="96" height="84" rx="12" fill="#1e293b" stroke="#64748b" stroke-width="5"/>' +
      '<rect x="474" y="344" width="52" height="14" rx="6" fill="#94a3b8"/>' +
      '<rect x="462" y="418" width="76" height="14" rx="5" fill="#4ade80"/>' +
      '<rect x="462" y="398" width="76" height="14" rx="5" fill="#4ade80"/>' +
      '<rect x="462" y="378" width="76" height="14" rx="5" fill="#facc15" class="blinkled"/>' +
      '<path d="M508 338 l-16 -34 h12 l-8 -26 l24 34 h-12 l10 26 Z" fill="#fbbf24"/>' +
      '<ellipse cx="500" cy="300" rx="52" ry="40" fill="#fbbf24" opacity=".14" filter="url(#soft)"/>';

    /* --- poarta blindată --- */
    var usa =
      '<rect x="846" y="140" width="146" height="300" rx="12" fill="#0b0a24" stroke="#475569" stroke-width="8"/>' +
      '<g class="door-panel">' +
      '<rect x="858" y="152" width="122" height="276" rx="8" fill="url(#rb-metal)"/>' +
      '<path d="M858 200 h122 M858 380 h122" stroke="#334155" stroke-width="6"/>' +
      '<path d="M858 152 l122 60 M980 152 l-122 60" stroke="#64748b" stroke-width="4" opacity=".5"/>' +
      '<rect x="874" y="216" width="90" height="150" rx="8" fill="#111031"/>' +
      '<rect x="884" y="228" width="70" height="46" rx="6" fill="#0c4a6e"/>' +
      '<g stroke="#7dd3fc" stroke-width="3" fill="none"><path d="M892 258 l12 -16 l10 12 l14 -20 l12 18 h12"/></g>' +
      '<g fill="#22d3ee"><rect x="884" y="288" width="70" height="10" rx="5"/><rect x="884" y="306" width="46" height="10" rx="5"/></g>' +
      '<g><circle class="blinkled" cx="894" cy="342" r="8" fill="#ef4444"/>' +
      '<circle class="blinkled d1" cx="920" cy="342" r="8" fill="#fbbf24"/>' +
      '<circle class="blinkled d2" cx="946" cy="342" r="8" fill="#4ade80"/></g>' +
      '<rect x="964" y="264" width="14" height="52" rx="7" fill="#f472b6"/>' +
      '<rect x="858" y="152" width="122" height="276" rx="8" fill="none" stroke="#94a3b8" stroke-width="4"/>' +
      '</g>' +
      '<rect class="door-light" x="858" y="152" width="122" height="276" rx="8" fill="#ecfeff" opacity="0"/>';

    var body = b +
      hs(0, 'Robotul păzitor', 196, 208, [104, 204, 184, 254], robot) +
      hs(1, 'Panoul cu ecrane', 497, 136, [344, 132, 306, 222], ecrane) +
      hs(3, 'Bateria uriașă', 500, 296, [444, 290, 112, 162], baterie) +
      hs(2, 'Roțile dințate', 716, 232, [652, 226, 196, 218], roti) +
      door(919, 136, [840, 134, 160, 312], usa);
    return wrap(defs, body);
  };


  /* ======================= 11. CAMERA MISTERELOR ======================== */
  SCENES.mister = function () {
    var defs =
      '<radialGradient id="ms-bg" cx="50%" cy="42%" r="78%"><stop offset="0%" stop-color="#4c1d95"/><stop offset="55%" stop-color="#2e1065"/><stop offset="100%" stop-color="#0b0620"/></radialGradient>' +
      '<radialGradient id="ms-portal" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fef3c7"/><stop offset="35%" stop-color="#c084fc"/><stop offset="70%" stop-color="#6d28d9"/><stop offset="100%" stop-color="#2e1065"/></radialGradient>' +
      '<linearGradient id="ms-stone" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6d28d9"/><stop offset="55%" stop-color="#4c1d95"/><stop offset="100%" stop-color="#2e1065"/></linearGradient>' +
      '<linearGradient id="ms-crystal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f0abfc"/><stop offset="50%" stop-color="#c084fc"/><stop offset="100%" stop-color="#7e22ce"/></linearGradient>';

    var b = '<rect width="1000" height="560" fill="url(#ms-bg)"/>' +
      stars(60, 20, 20, 960, 400, 31) +
      at(500, 280, 'spin',
        '<circle r="196" fill="none" stroke="#a78bfa" stroke-width="2" opacity=".3" stroke-dasharray="16 20"/>' +
        '<circle r="158" fill="none" stroke="#c084fc" stroke-width="1.6" opacity=".24" stroke-dasharray="6 14"/>') +
      at(500, 280, 'spin-r',
        '<circle r="232" fill="none" stroke="#f0abfc" stroke-width="2" opacity=".18" stroke-dasharray="30 26"/>') +
      '<path d="M0 430 q140 -26 260 -4 q150 28 300 -8 q160 -34 300 8 q80 20 140 0 L1000 560 L0 560 Z" fill="#1b0f3d"/>' +
      '<g stroke="#7c3aed" stroke-width="2.5" opacity=".45"><path d="M0 470 H1000 M0 516 H1000 M200 430 V560 M500 430 V560 M800 430 V560"/></g>' +
      '<g fill="url(#ms-stone)"><rect x="30" y="60" width="46" height="380" rx="8"/><rect x="924" y="60" width="46" height="380" rx="8"/></g>' +
      '<g fill="#5b21b6"><rect x="20" y="46" width="66" height="22" rx="6"/><rect x="914" y="46" width="66" height="22" rx="6"/>' +
      '<rect x="20" y="430" width="66" height="20" rx="6"/><rect x="914" y="430" width="66" height="20" rx="6"/></g>' +
      '<g class="twinkle"><circle cx="53" cy="140" r="6" fill="#f0abfc"/></g>' +
      '<g class="twinkle d2"><circle cx="947" cy="176" r="6" fill="#f0abfc"/></g>';

    /* --- sfera de cristal --- */
    var sfera =
      '<ellipse cx="216" cy="460" rx="62" ry="13" fill="#000" opacity=".45"/>' +
      '<path d="M180 452 h72 l-11 -38 h-50 Z" fill="#5b21b6"/>' +
      '<path d="M190 414 h52 l-7 -16 h-38 Z" fill="#7c3aed"/>' +
      at(216, 352, 'floaty',
        '<circle r="70" fill="#c084fc" opacity=".18" filter="url(#soft2)"/>' +
        '<circle r="48" fill="url(#ms-crystal)" opacity=".92"/>' +
        '<circle r="48" fill="none" stroke="#f5d0fe" stroke-width="3" opacity=".8"/>' +
        '<ellipse cx="-14" cy="-16" rx="16" ry="11" fill="#fff" opacity=".55" transform="rotate(-25)"/>' +
        '<g fill="#fef3c7"><circle cx="9" cy="7" r="3.6"/><circle cx="-12" cy="16" r="2.8"/><circle cx="19" cy="-12" r="3"/></g>') +
      '<g class="twinkle d1"><path d="M276 310 l4 11 l11 4 l-11 4 l-4 11 l-4 -11 l-11 -4 l11 -4 Z" fill="#fde68a"/></g>';

    /* --- harta constelațiilor --- */
    var harta =
      '<rect x="150" y="86" width="200" height="150" rx="12" fill="#3b0764" stroke="#7c3aed" stroke-width="6"/>' +
      '<rect x="162" y="98" width="176" height="126" rx="8" fill="#150a33"/>' +
      stars(18, 168, 104, 164, 114, 41) +
      '<g stroke="#f0abfc" stroke-width="2.4" fill="none" opacity=".9">' +
      '<path d="M190 194 L220 144 L264 166 L298 124 L322 162"/></g>' +
      '<g fill="#fde68a"><circle cx="190" cy="194" r="5.5"/><circle cx="220" cy="144" r="5"/><circle cx="264" cy="166" r="6"/><circle cx="298" cy="124" r="5"/><circle cx="322" cy="162" r="6.5"/></g>' +
      '<circle cx="322" cy="162" r="12" fill="none" stroke="#fde68a" stroke-width="2" opacity=".6"/>' +
      '<rect x="150" y="236" width="200" height="12" rx="5" fill="#5b21b6"/>';

    /* --- cheia plutitoare --- */
    var cheie =
      at(716, 232, 'floaty2',
        '<ellipse rx="66" ry="66" fill="#fbbf24" opacity=".16" filter="url(#soft2)"/>' +
        '<g transform="rotate(-30)">' +
        '<circle cx="0" cy="-34" r="20" fill="none" stroke="#fbbf24" stroke-width="9"/>' +
        '<rect x="-5" y="-14" width="10" height="66" rx="4" fill="#fbbf24"/>' +
        '<rect x="0" y="34" width="18" height="9" rx="3" fill="#fbbf24"/>' +
        '<rect x="0" y="16" width="14" height="9" rx="3" fill="#fbbf24"/>' +
        '<circle cx="0" cy="-34" r="8" fill="#3b0764"/></g>') +
      '<g class="twinkle d2"><circle cx="770" cy="188" r="5" fill="#fde68a"/></g>' +
      '<g class="twinkle"><circle cx="664" cy="286" r="4" fill="#fde68a"/></g>';

    /* --- cufărul zăvorât --- */
    var cufar =
      '<ellipse cx="784" cy="476" rx="86" ry="14" fill="#000" opacity=".45"/>' +
      '<rect x="712" y="398" width="144" height="72" rx="8" fill="#4c1d95"/>' +
      '<path d="M712 402 q72 -60 144 0 Z" fill="#6d28d9"/>' +
      '<path d="M722 400 q62 -48 124 0 Z" fill="#7c3aed"/>' +
      '<rect x="712" y="396" width="144" height="13" fill="#3b0764"/>' +
      '<rect x="768" y="358" width="32" height="112" rx="4" fill="#f0abfc" opacity=".85"/>' +
      '<rect x="712" y="430" width="144" height="9" fill="#f0abfc" opacity=".7"/>' +
      '<rect x="770" y="428" width="28" height="30" rx="6" fill="#c084fc"/>' +
      '<circle cx="784" cy="442" r="6" fill="#3b0764"/>' +
      '<g class="twinkle"><circle cx="730" cy="386" r="5" fill="#fde68a"/></g>' +
      '<g class="twinkle d3"><circle cx="840" cy="382" r="4" fill="#fde68a"/></g>';

    /* --- portalul (ușa) --- */
    var usa =
      '<ellipse cx="500" cy="308" rx="106" ry="134" fill="#2e1065"/>' +
      '<g class="door-panel">' +
      '<ellipse cx="500" cy="308" rx="92" ry="120" fill="url(#ms-portal)"/>' +
      at(500, 308, 'spin',
        '<ellipse rx="70" ry="96" fill="none" stroke="#f5d0fe" stroke-width="4" opacity=".55"/>' +
        '<ellipse rx="44" ry="68" fill="none" stroke="#fef3c7" stroke-width="3" opacity=".5"/>') +
      '<ellipse cx="500" cy="308" rx="92" ry="120" fill="none" stroke="#f0abfc" stroke-width="8"/>' +
      '<g class="twinkle"><circle cx="474" cy="258" r="5" fill="#fff"/></g>' +
      '<g class="twinkle d1"><circle cx="530" cy="352" r="4" fill="#fff"/></g>' +
      '<g class="twinkle d3"><circle cx="510" cy="286" r="4" fill="#fff"/></g>' +
      '</g>' +
      '<ellipse class="door-light" cx="500" cy="308" rx="92" ry="120" fill="#fff" opacity="0"/>' +
      '<path d="M394 308 q-12 -152 106 -166 q118 14 106 166" fill="none" stroke="#7c3aed" stroke-width="13" opacity=".7"/>' +
      '<circle cx="500" cy="144" r="15" fill="#f0abfc"/><circle cx="500" cy="144" r="6" fill="#fef3c7"/>';

    var body = b +
      hs(1, 'Harta constelațiilor', 250, 82, [142, 78, 216, 178], harta) +
      hs(0, 'Sfera de cristal', 216, 286, [148, 280, 136, 194], sfera) +
      hs(3, 'Cheia plutitoare', 716, 168, [652, 164, 128, 136], cheie) +
      hs(2, 'Cufărul zăvorât', 784, 356, [702, 350, 164, 134], cufar) +
      door(500, 172, [396, 176, 208, 268], usa);
    return wrap(defs, body);
  };

  /* ================ 12. ATELIERUL CEASORNICARULUI (mister) ============== */
  SCENES.ceasornicar = function () {
    var defs =
      '<linearGradient id="cs-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7c5230"/><stop offset="55%" stop-color="#5a3a1f"/><stop offset="100%" stop-color="#33200f"/></linearGradient>' +
      '<linearGradient id="cs-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#8b5a2b"/><stop offset="50%" stop-color="#a9703a"/><stop offset="100%" stop-color="#63401d"/></linearGradient>' +
      '<linearGradient id="cs-brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fde68a"/><stop offset="45%" stop-color="#d4a017"/><stop offset="100%" stop-color="#8a6410"/></linearGradient>' +
      '<linearGradient id="cs-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6b4423"/><stop offset="100%" stop-color="#2c1a0c"/></linearGradient>';

    function gearArt(r, teeth, col) {
      var s = '<circle r="' + r + '" fill="' + col + '"/>', k;
      for (k = 0; k < teeth; k++) {
        s += '<rect x="' + (-r * 0.15) + '" y="' + (-r - r * 0.24) + '" width="' + (r * 0.3) + '" height="' + (r * 0.28) +
             '" rx="3" fill="' + col + '" transform="rotate(' + (k * 360 / teeth) + ')"/>';
      }
      return s + '<circle r="' + (r * 0.32) + '" fill="#33200f"/><circle r="' + (r * 0.14) + '" fill="' + col + '"/>';
    }

    var b = '<rect width="1000" height="560" fill="url(#cs-wall)"/>' +
      '<g stroke="rgba(30,16,4,.45)" stroke-width="3">' +
      '<path d="M0 120 H1000 M0 250 H1000 M0 380 H1000"/>' +
      '<path d="M110 0 V430 M280 0 V430 M470 0 V430 M660 0 V430 M840 0 V430"/></g>' +
      '<rect y="424" width="1000" height="136" fill="url(#cs-floor)"/>' +
      '<g stroke="rgba(20,10,2,.5)" stroke-width="3"><path d="M0 466 H1000 M0 512 H1000 M180 424 V560 M470 424 V560 M760 424 V560"/></g>' +
      '<rect y="416" width="1000" height="12" fill="#8b5a2b"/>' +
      at(300, 96, 'spin', gearArt(40, 10, '#8a6410')) +
      at(372, 140, 'spin-r', gearArt(26, 8, '#a9703a')) +
      '<path d="M500 0 v34" stroke="#63401d" stroke-width="5"/>' +
      '<path d="M462 34 h76 l-16 26 h-44 Z" fill="#d4a017"/>' +
      '<ellipse cx="500" cy="120" rx="120" ry="80" fill="#fde68a" opacity=".12" filter="url(#soft2)"/>' +
      '<circle cx="500" cy="64" r="8" fill="#fef3c7"/>';

    /* --- ceasul cu pendul --- */
    var pendul =
      '<ellipse cx="150" cy="446" rx="66" ry="12" fill="#000" opacity=".4"/>' +
      '<rect x="96" y="120" width="108" height="316" rx="10" fill="url(#cs-wood)"/>' +
      '<path d="M88 120 h124 l-14 -26 h-96 Z" fill="#a9703a"/>' +
      '<rect x="108" y="136" width="84" height="88" rx="8" fill="#f5e7cf"/>' +
      '<circle cx="150" cy="180" r="34" fill="#fffaf0" stroke="#8a6410" stroke-width="4"/>' +
      '<g stroke="#63401d" stroke-width="2.5"><path d="M150 152 v6 M150 202 v6 M122 180 h6 M172 180 h6"/></g>' +
      '<path d="M150 180 l0 -20 M150 180 l14 10" stroke="#33200f" stroke-width="3.5" stroke-linecap="round"/>' +
      '<circle cx="150" cy="180" r="4" fill="#d4a017"/>' +
      '<rect x="108" y="238" width="84" height="176" rx="6" fill="#2c1a0c"/>' +
      '<rect x="114" y="244" width="72" height="164" rx="4" fill="#1a0f06"/>' +
      at(150, 250, 'sway', '<rect x="-3" y="0" width="6" height="118" fill="#d4a017"/>' +
        '<circle cx="0" cy="130" r="22" fill="url(#cs-brass)"/><circle cx="0" cy="130" r="10" fill="#8a6410"/>') +
      '<rect x="96" y="416" width="108" height="20" rx="5" fill="#63401d"/>';

    /* --- masa ceasornicarului --- */
    var masa =
      '<rect x="360" y="330" width="270" height="16" rx="6" fill="url(#cs-wood)"/>' +
      '<rect x="378" y="346" width="16" height="86" fill="#63401d"/><rect x="596" y="346" width="16" height="86" fill="#63401d"/>' +
      '<rect x="370" y="380" width="250" height="10" fill="#8b5a2b"/>' +
      '<circle cx="440" cy="300" r="30" fill="#fffaf0" stroke="#8a6410" stroke-width="5"/>' +
      '<path d="M440 300 v-18 M440 300 l13 8" stroke="#33200f" stroke-width="3" stroke-linecap="round"/>' +
      '<g transform="translate(510,306)">' + gearArt(24, 9, '#d4a017') + '</g>' +
      '<g transform="translate(556,314)">' + gearArt(16, 8, '#a9703a') + '</g>' +
      '<rect x="580" y="300" width="40" height="26" rx="4" fill="#63401d"/>' +
      '<g stroke="#e5e7eb" stroke-width="4" stroke-linecap="round"><path d="M586 296 v-22 M598 296 v-26 M610 296 v-20"/></g>' +
      '<rect x="384" y="308" width="34" height="20" rx="5" fill="#8a6410"/>' +
      '<circle cx="401" cy="318" r="6" fill="#f5e7cf"/>';

    /* --- peretele cu rotițe --- */
    var perete =
      '<rect x="700" y="150" width="196" height="176" rx="12" fill="#33200f"/>' +
      '<rect x="712" y="162" width="172" height="152" rx="8" fill="#1a0f06"/>' +
      at(760, 214, 'spin', gearArt(38, 10, '#d4a017')) +
      at(830, 258, 'spin-r', gearArt(28, 9, '#a9703a')) +
      at(818, 190, 'spin', gearArt(20, 8, '#8a6410')) +
      '<rect x="700" y="326" width="196" height="14" rx="5" fill="url(#cs-wood)"/>' +
      '<g class="twinkle"><circle cx="726" cy="180" r="4" fill="#fde68a"/></g>';

    /* --- ceasul cu cuc --- */
    var cuc =
      '<path d="M596 96 h108 l-54 -46 Z" fill="#8b5a2b"/>' +
      '<rect x="600" y="96" width="100" height="96" rx="8" fill="url(#cs-wood)"/>' +
      '<circle cx="650" cy="140" r="30" fill="#fffaf0" stroke="#8a6410" stroke-width="4"/>' +
      '<path d="M650 140 v-16 M650 140 l12 8" stroke="#33200f" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="638" y="98" width="24" height="18" rx="4" fill="#2c1a0c"/>' +
      at(650, 108, 'floaty2', '<ellipse cx="0" cy="0" rx="10" ry="8" fill="#facc15"/>' +
        '<path d="M8 -2 l8 3 l-8 3 Z" fill="#f97316"/><circle cx="3" cy="-2" r="2" fill="#33200f"/>') +
      '<path d="M614 192 v26 M686 192 v26" stroke="#63401d" stroke-width="4"/>' +
      '<circle cx="614" cy="228" r="10" fill="url(#cs-brass)"/><circle cx="686" cy="228" r="10" fill="url(#cs-brass)"/>' +
      '<path d="M650 192 v40" stroke="#8a6410" stroke-width="3"/>' +
      at(650, 232, 'sway', '<rect x="-2" y="0" width="4" height="46" fill="#8a6410"/><circle cx="0" cy="52" r="12" fill="url(#cs-brass)"/>');

    /* --- ușa atelierului --- */
    var usa =
      '<rect x="900" y="150" width="96" height="290" rx="8" fill="#33200f"/>' +
      '<g class="door-panel">' +
      '<rect x="908" y="158" width="80" height="274" rx="6" fill="url(#cs-wood)"/>' +
      '<rect x="918" y="170" width="60" height="106" rx="5" fill="none" stroke="#63401d" stroke-width="4"/>' +
      '<rect x="918" y="292" width="60" height="126" rx="5" fill="none" stroke="#63401d" stroke-width="4"/>' +
      '<circle cx="948" cy="222" r="24" fill="#fffaf0" stroke="#8a6410" stroke-width="4"/>' +
      '<path d="M948 222 v-14 M948 222 l10 7" stroke="#33200f" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="928" cy="352" r="8" fill="url(#cs-brass)"/>' +
      '</g>' +
      '<rect class="door-light" x="908" y="158" width="80" height="274" rx="6" fill="#fff7ed" opacity="0"/>';

    var body = b +
      hs(0, 'Ceasul cu pendul', 150, 116, [86, 90, 130, 356], pendul) +
      hs(2, 'Masa ceasornicarului', 495, 268, [352, 264, 286, 176], masa) +
      hs(3, 'Ceasul cu cuc', 650, 60, [590, 46, 120, 200], cuc) +
      hs(1, 'Peretele cu rotițe', 798, 146, [692, 142, 212, 202], perete) +
      door(948, 146, [894, 144, 108, 302], usa);
    return wrap(defs, body);
  };

  /* ================= 13. SUBMARINUL ABISAL (mister) ==================== */
  SCENES.submarin = function () {
    var defs =
      '<linearGradient id="sb-hull" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3f6b7a"/><stop offset="55%" stop-color="#274d5c"/><stop offset="100%" stop-color="#12303c"/></linearGradient>' +
      '<radialGradient id="sb-deep" cx="50%" cy="40%" r="70%"><stop offset="0%" stop-color="#0e7490"/><stop offset="60%" stop-color="#083344"/><stop offset="100%" stop-color="#041a24"/></radialGradient>' +
      '<linearGradient id="sb-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#cbd5e1"/><stop offset="50%" stop-color="#7c98a6"/><stop offset="100%" stop-color="#3f5a66"/></linearGradient>' +
      '<linearGradient id="sb-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#274d5c"/><stop offset="100%" stop-color="#0b2230"/></linearGradient>';

    function fish(x, y, col, s, cls) {
      return at(x, y, cls || 'floaty', '<g transform="scale(' + (s || 1) + ')">' +
        '<ellipse cx="0" cy="0" rx="20" ry="12" fill="' + col + '"/>' +
        '<path d="M18 0 l16 -11 v22 Z" fill="' + col + '"/>' +
        '<path d="M-2 -12 q8 -12 14 -2 Z" fill="' + col + '" opacity=".75"/>' +
        '<circle cx="-9" cy="-3" r="3.4" fill="#fff"/><circle cx="-10" cy="-3" r="1.8" fill="#0f172a"/></g>');
    }

    var b = '<rect width="1000" height="560" fill="url(#sb-hull)"/>' +
      /* nituri și panouri */
      '<g stroke="rgba(8,30,40,.5)" stroke-width="3"><path d="M0 96 H1000 M0 300 H1000 M0 420 H1000"/></g>' +
      '<g fill="#5b7f8d"><circle cx="40" cy="60" r="6"/><circle cx="960" cy="60" r="6"/><circle cx="40" cy="200" r="6"/><circle cx="960" cy="200" r="6"/><circle cx="40" cy="360" r="6"/><circle cx="960" cy="360" r="6"/></g>' +
      '<rect y="424" width="1000" height="136" fill="url(#sb-floor)"/>' +
      '<g stroke="rgba(6,26,34,.6)" stroke-width="3"><path d="M0 468 H1000 M0 514 H1000 M200 424 V560 M500 424 V560 M800 424 V560"/></g>' +
      '<rect y="416" width="1000" height="12" fill="#5b7f8d"/>' +
      /* țevi pe tavan */
      '<g stroke="#5b7f8d" stroke-width="16" fill="none" stroke-linecap="round"><path d="M0 44 h300 q26 0 26 26 v22"/><path d="M1000 40 h-240 q-26 0 -26 26 v20"/></g>' +
      '<g stroke="#93b4c0" stroke-width="4" fill="none" opacity=".5"><path d="M0 38 h296"/><path d="M1000 34 h-236"/></g>' +
      '<ellipse cx="500" cy="70" rx="150" ry="60" fill="#67e8f9" opacity=".10" filter="url(#soft2)"/>';

    /* --- hubloul cu pești --- */
    var hublou =
      '<circle cx="470" cy="236" r="132" fill="#0b2230"/>' +
      '<circle cx="470" cy="236" r="118" fill="url(#sb-deep)"/>' +
      stars(16, 380, 150, 180, 170, 19) +
      '<g opacity=".55"><path d="M368 330 q30 -34 60 0 q30 34 60 0 q30 -34 60 0" stroke="#22d3ee" stroke-width="4" fill="none"/></g>' +
      fish(432, 210, '#fbbf24', 1, 'floaty') +
      fish(516, 266, '#f472b6', .8, 'floaty2') +
      fish(470, 172, '#4ade80', .6, 'floaty') +
      at(400, 300, 'bubble', '<circle r="5" fill="#a5f3fc" opacity=".8"/>') +
      at(520, 310, 'bubble d2', '<circle r="4" fill="#a5f3fc" opacity=".8"/>') +
      '<path d="M394 340 q22 -30 14 -58" stroke="#16a34a" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<circle cx="470" cy="236" r="118" fill="none" stroke="url(#sb-metal)" stroke-width="18"/>' +
      '<circle cx="470" cy="236" r="130" fill="none" stroke="#3f5a66" stroke-width="8"/>' +
      '<g fill="#93b4c0"><circle cx="470" cy="112" r="7"/><circle cx="470" cy="360" r="7"/><circle cx="346" cy="236" r="7"/><circle cx="594" cy="236" r="7"/>' +
      '<circle cx="382" cy="148" r="6"/><circle cx="558" cy="324" r="6"/><circle cx="558" cy="148" r="6"/><circle cx="382" cy="324" r="6"/></g>';

    /* --- ecranul sonarului --- */
    var sonar =
      '<rect x="80" y="188" width="200" height="196" rx="16" fill="#0b2230" stroke="#5b7f8d" stroke-width="7"/>' +
      '<circle cx="180" cy="270" r="66" fill="#052e16"/>' +
      '<g stroke="#22c55e" stroke-width="2" fill="none" opacity=".7">' +
      '<circle cx="180" cy="270" r="22"/><circle cx="180" cy="270" r="44"/><circle cx="180" cy="270" r="64"/>' +
      '<path d="M180 206 v128 M116 270 h128"/></g>' +
      at(180, 270, 'spin', '<path d="M0 0 L0 -64 A64 64 0 0 1 46 -44 Z" fill="#22c55e" opacity=".35"/>') +
      '<g fill="#4ade80"><circle cx="206" cy="240" r="5" class="blinkled"/><circle cx="150" cy="296" r="4" class="blinkled d1"/></g>' +
      '<rect x="96" y="348" width="168" height="24" rx="8" fill="#12303c"/>' +
      '<g fill="#67e8f9"><rect x="106" y="356" width="56" height="8" rx="4"/><rect x="176" y="356" width="30" height="8" rx="4"/></g>' +
      '<text x="180" y="180" text-anchor="middle" font-family="Nunito, sans-serif" font-size="15" font-weight="800" fill="#67e8f9">SONAR</text>';

    /* --- periscopul --- */
    var periscop =
      '<rect x="700" y="60" width="34" height="300" rx="10" fill="url(#sb-metal)"/>' +
      '<rect x="694" y="120" width="46" height="18" rx="6" fill="#3f5a66"/>' +
      '<rect x="694" y="300" width="46" height="18" rx="6" fill="#3f5a66"/>' +
      '<path d="M700 60 h96 v46 h-62 Z" fill="#7c98a6"/>' +
      '<circle cx="782" cy="82" r="16" fill="#0b2230"/><circle cx="782" cy="82" r="9" fill="#22d3ee"/>' +
      '<rect x="676" y="352" width="82" height="30" rx="10" fill="#3f5a66"/>' +
      '<path d="M666 366 h-34 M768 366 h34" stroke="#93b4c0" stroke-width="12" stroke-linecap="round"/>' +
      '<circle cx="628" cy="366" r="13" fill="#ef4444"/><circle cx="806" cy="366" r="13" fill="#ef4444"/>' +
      '<ellipse cx="717" cy="392" rx="52" ry="12" fill="#000" opacity=".35"/>' +
      '<g class="twinkle"><circle cx="800" cy="66" r="5" fill="#a5f3fc"/></g>';

    /* --- roata de valve --- */
    var valve =
      '<circle cx="180" cy="470" r="14" fill="#3f5a66"/>' +
      '<rect x="164" y="404" width="32" height="70" rx="8" fill="#5b7f8d"/>' +
      at(180, 400, 'spin-r',
        '<circle r="52" fill="none" stroke="#7c98a6" stroke-width="14"/>' +
        '<g stroke="#7c98a6" stroke-width="11" stroke-linecap="round">' +
        '<path d="M0 -52 V52 M-52 0 H52 M-37 -37 L37 37 M37 -37 L-37 37"/></g>' +
        '<circle r="15" fill="#cbd5e1"/><circle r="7" fill="#ef4444"/>') +
      '<rect x="120" y="452" width="120" height="16" rx="6" fill="#3f5a66"/>';

    /* --- trapa etanșă --- */
    var usa =
      '<rect x="838" y="146" width="150" height="290" rx="22" fill="#0b2230" stroke="#3f5a66" stroke-width="8"/>' +
      '<g class="door-panel">' +
      '<rect x="850" y="158" width="126" height="266" rx="16" fill="url(#sb-metal)"/>' +
      '<rect x="864" y="172" width="98" height="238" rx="12" fill="none" stroke="#3f5a66" stroke-width="5"/>' +
      '<circle cx="913" cy="238" r="42" fill="#0b2230"/>' +
      '<circle cx="913" cy="238" r="33" fill="#083344"/>' +
      fish(905, 232, '#38bdf8', .5, 'floaty2') +
      '<circle cx="913" cy="238" r="42" fill="none" stroke="#93b4c0" stroke-width="8"/>' +
      at(913, 344, 'spin',
        '<circle r="36" fill="none" stroke="#7c98a6" stroke-width="11"/>' +
        '<g stroke="#7c98a6" stroke-width="9" stroke-linecap="round"><path d="M0 -36 V36 M-36 0 H36 M-25 -25 L25 25 M25 -25 L-25 25"/></g>' +
        '<circle r="11" fill="#cbd5e1"/>') +
      '<g fill="#93b4c0"><circle cx="866" cy="176" r="5"/><circle cx="960" cy="176" r="5"/><circle cx="866" cy="406" r="5"/><circle cx="960" cy="406" r="5"/></g>' +
      '</g>' +
      '<rect class="door-light" x="850" y="158" width="126" height="266" rx="16" fill="#ecfeff" opacity="0"/>';

    var body = b +
      hs(1, 'Ecranul sonarului', 180, 184, [72, 180, 216, 212], sonar) +
      hs(3, 'Roata de valve', 180, 348, [118, 344, 124, 132], valve) +
      hs(0, 'Hubloul spre adâncuri', 470, 104, [336, 102, 268, 268], hublou) +
      hs(2, 'Periscopul', 717, 56, [620, 52, 200, 348], periscop) +
      door(913, 142, [832, 140, 162, 302], usa);
    return wrap(defs, body);
  };

  /* ================= 14. VAGONUL DE NOAPTE (mister) ==================== */
  SCENES.tren = function () {
    var defs =
      '<linearGradient id="tr-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7f6a4f"/><stop offset="55%" stop-color="#5c4a34"/><stop offset="100%" stop-color="#33281b"/></linearGradient>' +
      '<linearGradient id="tr-seat" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#166e5a"/><stop offset="100%" stop-color="#0b3d33"/></linearGradient>' +
      '<linearGradient id="tr-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="65%" stop-color="#1e293b"/><stop offset="100%" stop-color="#312e81"/></linearGradient>' +
      '<linearGradient id="tr-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#8b5a2b"/><stop offset="50%" stop-color="#a9703a"/><stop offset="100%" stop-color="#5c3b1c"/></linearGradient>';

    var b = '<rect width="1000" height="560" fill="url(#tr-wall)"/>' +
      '<g stroke="rgba(30,22,10,.4)" stroke-width="3">' +
      '<path d="M0 90 H1000 M0 400 H1000"/>' +
      '<path d="M90 90 V400 M210 90 V400 M330 90 V400 M660 90 V400 M780 90 V400 M900 90 V400"/></g>' +
      '<rect y="400" width="1000" height="160" fill="#3d3122"/>' +
      '<g stroke="rgba(20,14,6,.55)" stroke-width="3"><path d="M0 452 H1000 M0 506 H1000 M160 400 V560 M480 400 V560 M820 400 V560"/></g>' +
      '<rect y="392" width="1000" height="12" fill="#8b5a2b"/>' +
      /* plafonieră */
      '<path d="M500 0 v26" stroke="#5c3b1c" stroke-width="5"/>' +
      '<path d="M456 26 h88 l-14 26 h-60 Z" fill="#d4a017"/>' +
      '<ellipse cx="500" cy="110" rx="150" ry="80" fill="#fde68a" opacity=".13" filter="url(#soft2)"/>' +
      '<circle cx="500" cy="56" r="8" fill="#fef3c7"/>' +
      /* plasa de bagaje */
      '<rect x="60" y="120" width="260" height="12" rx="5" fill="url(#tr-wood)"/>' +
      '<g stroke="#8b5a2b" stroke-width="3" opacity=".8"><path d="M70 132 v22 M110 132 v22 M150 132 v22 M190 132 v22 M230 132 v22 M270 132 v22 M310 132 v22 M60 154 h260"/></g>' +
      /* bancheta */
      '<path d="M96 392 L96 250 q0 -16 16 -16 h180 q16 0 16 16 L308 392 Z" fill="url(#tr-seat)"/>' +
      '<rect x="86" y="300" width="232" height="26" rx="10" fill="#0f5346"/>' +
      '<g stroke="#0b3d33" stroke-width="3"><path d="M140 234 V300 M202 234 V300 M264 234 V300"/></g>' +
      '<rect x="86" y="386" width="232" height="14" rx="5" fill="#5c3b1c"/>';

    /* --- geamul cu peisaj --- */
    var geam =
      '<rect x="392" y="126" width="264" height="212" rx="18" fill="#5c3b1c"/>' +
      '<rect x="404" y="138" width="240" height="188" rx="12" fill="url(#tr-night)"/>' +
      stars(22, 412, 146, 224, 100, 27) +
      '<circle cx="600" cy="184" r="22" fill="#fef3c7" opacity=".9"/>' +
      '<path d="M404 268 l52 -50 l40 34 l46 -60 l58 62 l44 -30 v82 h-240 Z" fill="#1e1b4b"/>' +
      '<path d="M404 296 h240" stroke="#312e81" stroke-width="4"/>' +
      '<g class="floaty2"><path d="M420 250 l14 -20 l14 20 Z" fill="#0f172a"/></g>' +
      '<rect x="404" y="308" width="240" height="18" fill="#0b1020" opacity=".7"/>' +
      '<rect x="392" y="126" width="264" height="212" rx="18" fill="none" stroke="#8b5a2b" stroke-width="9"/>' +
      '<rect x="392" y="338" width="264" height="16" rx="6" fill="url(#tr-wood)"/>' +
      '<path d="M524 138 v188" stroke="#8b5a2b" stroke-width="7"/>' +
      /* perdeluță */
      '<path d="M392 126 q30 40 0 76 q30 -10 30 -76 Z" fill="#b45309" opacity=".85"/>' +
      '<path d="M656 126 q-30 40 0 76 q-30 -10 -30 -76 Z" fill="#b45309" opacity=".85"/>';

    /* --- valiza de pe raft --- */
    var valiza =
      '<rect x="112" y="56" width="164" height="66" rx="10" fill="url(#tr-wood)"/>' +
      '<rect x="122" y="66" width="144" height="46" rx="6" fill="#a9703a"/>' +
      '<g stroke="#5c3b1c" stroke-width="5"><path d="M150 56 V122 M238 56 V122"/></g>' +
      '<rect x="176" y="40" width="36" height="18" rx="8" fill="none" stroke="#5c3b1c" stroke-width="6"/>' +
      '<rect x="182" y="80" width="24" height="18" rx="4" fill="#d4a017"/>' +
      '<circle cx="194" cy="89" r="4" fill="#5c3b1c"/>' +
      '<g fill="#dc2626" opacity=".9"><rect x="128" y="72" width="16" height="12" rx="2"/></g>' +
      '<g fill="#38bdf8" opacity=".9"><rect x="246" y="96" width="14" height="11" rx="2"/></g>';

    /* --- felinarul --- */
    var felinar =
      '<path d="M760 92 v30" stroke="#5c3b1c" stroke-width="6"/>' +
      '<path d="M736 122 h48 l-8 -14 h-32 Z" fill="#3f3a2f"/>' +
      '<rect x="734" y="122" width="52" height="76" rx="6" fill="#3f3a2f"/>' +
      '<rect x="742" y="130" width="36" height="60" rx="4" fill="#fef3c7" opacity=".92"/>' +
      '<g class="flicker"><ellipse cx="760" cy="164" rx="12" ry="20" fill="#fbbf24"/></g>' +
      '<path d="M734 198 h52 l-10 16 h-32 Z" fill="#3f3a2f"/>' +
      '<ellipse cx="760" cy="170" rx="86" ry="70" fill="#fde68a" opacity=".13" filter="url(#soft2)"/>' +
      '<circle cx="760" cy="222" r="6" fill="#d4a017"/>';

    /* --- frâna de urgență --- */
    var frana =
      '<rect x="700" y="262" width="124" height="112" rx="12" fill="#7f1d1d"/>' +
      '<rect x="710" y="272" width="104" height="92" rx="8" fill="#b91c1c"/>' +
      '<rect x="722" y="284" width="80" height="34" rx="6" fill="#fee2e2"/>' +
      '<text x="762" y="308" text-anchor="middle" font-family="Nunito, sans-serif" font-size="15" font-weight="800" fill="#7f1d1d">STOP</text>' +
      '<circle cx="762" cy="342" r="17" fill="#f8fafc"/>' +
      at(762, 342, 'floaty2', '<rect x="-5" y="-2" width="10" height="34" rx="4" fill="#d4a017"/><circle cx="0" cy="34" r="10" fill="#facc15"/>') +
      '<g fill="#fca5a5"><circle cx="712" cy="274" r="4"/><circle cx="812" cy="274" r="4"/><circle cx="712" cy="362" r="4"/><circle cx="812" cy="362" r="4"/></g>';

    /* --- ușa culisantă --- */
    var usa =
      '<rect x="862" y="140" width="128" height="290" rx="8" fill="#33281b"/>' +
      '<g class="door-panel">' +
      '<rect x="872" y="150" width="108" height="272" rx="6" fill="url(#tr-wood)"/>' +
      '<rect x="886" y="166" width="80" height="112" rx="6" fill="#1e293b"/>' +
      stars(8, 892, 172, 68, 100, 33) +
      '<rect x="886" y="166" width="80" height="112" rx="6" fill="none" stroke="#5c3b1c" stroke-width="5"/>' +
      '<path d="M926 166 v112 M886 222 h80" stroke="#5c3b1c" stroke-width="4"/>' +
      '<rect x="886" y="300" width="80" height="106" rx="6" fill="none" stroke="#5c3b1c" stroke-width="4"/>' +
      '<rect x="890" y="336" width="30" height="14" rx="7" fill="#d4a017"/>' +
      '<rect x="932" y="330" width="14" height="26" rx="7" fill="#d4a017"/>' +
      '</g>' +
      '<rect class="door-light" x="872" y="150" width="108" height="272" rx="6" fill="#fff7ed" opacity="0"/>' +
      '<rect x="862" y="132" width="128" height="12" rx="5" fill="#5c3b1c"/>';

    var body = b +
      hs(1, 'Valiza din plasa de bagaje', 194, 36, [104, 32, 180, 100], valiza) +
      hs(0, 'Geamul spre noapte', 524, 122, [384, 118, 280, 244], geam) +
      hs(2, 'Felinarul vagonului', 760, 88, [726, 84, 70, 148], felinar) +
      hs(3, 'Frâna de urgență', 762, 256, [692, 254, 140, 148], frana) +
      door(926, 136, [856, 128, 140, 306], usa);
    return wrap(defs, body);
  };

  /* =================== 15. CIRCUL MAGIC (mister) ======================= */
  SCENES.circ = function () {
    var defs =
      '<linearGradient id="cr-tent" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7f1d1d"/><stop offset="60%" stop-color="#9f1239"/><stop offset="100%" stop-color="#4c0519"/></linearGradient>' +
      '<linearGradient id="cr-ring" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b45309"/><stop offset="100%" stop-color="#5b2b06"/></linearGradient>' +
      '<linearGradient id="cr-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fde68a"/><stop offset="50%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></linearGradient>';

    /* dungile cortului */
    var stripes = '';
    for (var i = 0; i < 12; i++) {
      stripes += '<path d="M500 -40 L' + (-140 + i * 190) + ' 430 L' + (-140 + (i + 1) * 190) + ' 430 Z" fill="' +
                 (i % 2 ? '#fef3c7' : '#dc2626') + '" opacity="' + (i % 2 ? '.30' : '.55') + '"/>';
    }
    var b = '<rect width="1000" height="560" fill="url(#cr-tent)"/>' + stripes +
      '<path d="M0 430 H1000 V560 H0 Z" fill="#7c2d12"/>' +
      /* arena */
      '<ellipse cx="500" cy="500" rx="470" ry="86" fill="#a16207"/>' +
      '<ellipse cx="500" cy="494" rx="440" ry="76" fill="#ca8a04"/>' +
      '<path d="M60 494 a440 76 0 0 0 880 0" fill="none" stroke="url(#cr-ring)" stroke-width="16"/>' +
      /* stâlpul central */
      '<rect x="484" y="0" width="32" height="440" fill="#7c2d12"/>' +
      '<g fill="#fbbf24"><circle cx="500" cy="60" r="10"/><circle cx="500" cy="200" r="10"/><circle cx="500" cy="340" r="10"/></g>' +
      /* ghirlande de steaguri */
      '<path d="M0 60 q250 90 500 20 q250 -70 500 20" fill="none" stroke="#fde68a" stroke-width="5" opacity=".8"/>' +
      '<g>' +
      '<path d="M120 92 l18 0 l-9 22 Z" fill="#38bdf8"/><path d="M240 108 l18 0 l-9 22 Z" fill="#4ade80"/>' +
      '<path d="M360 114 l18 0 l-9 22 Z" fill="#f472b6"/><path d="M620 104 l18 0 l-9 22 Z" fill="#fbbf24"/>' +
      '<path d="M740 92 l18 0 l-9 22 Z" fill="#a78bfa"/><path d="M860 78 l18 0 l-9 22 Z" fill="#38bdf8"/></g>' +
      /* proiectoare */
      '<path d="M120 0 L60 430 L280 430 Z" fill="#fef3c7" opacity=".12"/>' +
      '<path d="M880 0 L720 430 L940 430 Z" fill="#fef3c7" opacity=".10"/>' +
      '<g class="twinkle"><circle cx="200" cy="180" r="4" fill="#fff"/></g>' +
      '<g class="twinkle d2"><circle cx="810" cy="220" r="4" fill="#fff"/></g>';

    /* --- toba mare --- */
    var toba =
      '<ellipse cx="300" cy="474" rx="86" ry="16" fill="#000" opacity=".3"/>' +
      '<rect x="232" y="352" width="136" height="112" rx="10" fill="#dc2626"/>' +
      '<ellipse cx="300" cy="352" rx="68" ry="24" fill="#fef3c7"/>' +
      '<ellipse cx="300" cy="352" rx="56" ry="18" fill="#fffbeb"/>' +
      '<ellipse cx="300" cy="464" rx="68" ry="24" fill="#b91c1c"/>' +
      '<g stroke="#fde68a" stroke-width="5" opacity=".9">' +
      '<path d="M240 372 l40 70 M280 366 l40 78 M320 370 l38 70"/></g>' +
      '<rect x="226" y="346" width="148" height="14" rx="7" fill="url(#cr-gold)"/>' +
      '<rect x="226" y="456" width="148" height="14" rx="7" fill="url(#cr-gold)"/>' +
      at(360, 320, 'sway', '<rect x="-4" y="0" width="8" height="60" rx="4" fill="#a16207"/><circle cx="0" cy="66" r="13" fill="#fef3c7"/>');

    /* --- trapezul --- */
    var trapez =
      '<path d="M628 40 v70 M772 40 v70" stroke="#fde68a" stroke-width="5"/>' +
      at(700, 40, 'sway',
        '<path d="M-72 0 v104 M72 0 v104" stroke="#fef3c7" stroke-width="6"/>' +
        '<rect x="-80" y="104" width="160" height="14" rx="7" fill="url(#cr-gold)"/>' +
        '<circle cx="-72" cy="104" r="8" fill="#b45309"/><circle cx="72" cy="104" r="8" fill="#b45309"/>' +
        '<path d="M0 118 q-16 34 0 56 q16 -22 0 -56 Z" fill="#f472b6"/>' +
        '<circle cx="0" cy="182" r="16" fill="#fde68a"/>' +
        '<path d="M-14 174 q14 -18 28 0" fill="#7c2d12"/>' +
        '<circle cx="-6" cy="182" r="2.6" fill="#7c2d12"/><circle cx="6" cy="182" r="2.6" fill="#7c2d12"/>' +
        '<path d="M-6 190 q6 6 12 0" stroke="#7c2d12" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<path d="M-14 198 q14 40 28 0 l0 44 q-14 12 -28 0 Z" fill="#38bdf8"/>' +
        '<path d="M-12 242 v22 M12 242 v22" stroke="#38bdf8" stroke-width="7" stroke-linecap="round"/>');

    /* --- cutia iluzionistului --- */
    var cutie =
      '<ellipse cx="470" cy="486" rx="76" ry="14" fill="#000" opacity=".3"/>' +
      '<rect x="406" y="380" width="128" height="98" rx="10" fill="#4c1d95"/>' +
      '<rect x="416" y="390" width="108" height="78" rx="6" fill="#6d28d9"/>' +
      '<path d="M406 380 h128 l-14 -22 h-100 Z" fill="#7c3aed"/>' +
      '<g stroke="#fde68a" stroke-width="4" opacity=".9"><path d="M416 412 h108 M470 390 v78"/></g>' +
      '<path d="M470 402 l5 12 l13 5 l-13 5 l-5 12 l-5 -12 l-13 -5 l13 -5 Z" fill="#fde68a" class="twinkle"/>' +
      '<circle cx="442" cy="444" r="9" fill="#fbbf24"/><circle cx="500" cy="444" r="9" fill="#f472b6"/>' +
      at(470, 344, 'floaty', '<path d="M-30 0 h60 v-8 h-60 Z" fill="#1f2937"/>' +
        '<path d="M-18 -8 q18 -34 36 0 Z" fill="#111827"/>' +
        '<path d="M-18 -22 h36" stroke="#dc2626" stroke-width="5"/>') +
      '<g class="twinkle d1"><circle cx="530" cy="352" r="4" fill="#fde68a"/></g>';

    /* --- tunul de circ --- */
    var tun =
      '<ellipse cx="770" cy="486" rx="88" ry="15" fill="#000" opacity=".3"/>' +
      '<rect x="712" y="440" width="120" height="26" rx="8" fill="#7c2d12"/>' +
      '<circle cx="736" cy="472" r="20" fill="#4c0519"/><circle cx="736" cy="472" r="8" fill="#a16207"/>' +
      '<circle cx="806" cy="472" r="20" fill="#4c0519"/><circle cx="806" cy="472" r="8" fill="#a16207"/>' +
      '<g transform="rotate(-24 770 424)">' +
      '<rect x="690" y="398" width="170" height="52" rx="26" fill="#b91c1c"/>' +
      '<rect x="690" y="398" width="170" height="52" rx="26" fill="none" stroke="url(#cr-gold)" stroke-width="6"/>' +
      '<circle cx="862" cy="424" r="30" fill="#1f2937"/>' +
      '<circle cx="862" cy="424" r="22" fill="#111827"/>' +
      '<g stroke="#fde68a" stroke-width="5"><path d="M714 398 v52 M756 398 v52 M798 398 v52"/></g>' +
      '</g>' +
      '<g class="twinkle"><path d="M902 340 l6 14 l14 6 l-14 6 l-6 14 l-6 -14 l-14 -6 l14 -6 Z" fill="#fde68a"/></g>' +
      '<rect x="748" y="418" width="44" height="30" rx="8" fill="#7c2d12"/>';

    /* --- ieșirea din cort --- */
    var usa =
      '<path d="M40 430 L40 200 q78 -84 156 0 L196 430 Z" fill="#4c0519"/>' +
      '<g class="door-panel">' +
      '<path d="M50 424 L50 206 q68 -74 136 0 L186 424 Z" fill="#1f2937"/>' +
      '<path d="M50 424 L50 206 q34 -37 68 -37 L118 424 Z" fill="#7f1d1d"/>' +
      '<path d="M186 424 L186 206 q-34 -37 -68 -37 L118 424 Z" fill="#9f1239"/>' +
      '<g stroke="#4c0519" stroke-width="3" opacity=".8">' +
      '<path d="M76 190 L76 424 M96 176 L96 424 M140 176 L140 424 M160 190 L160 424"/></g>' +
      '<path d="M50 206 q68 -74 136 0" fill="none" stroke="url(#cr-gold)" stroke-width="9"/>' +
      '<circle cx="118" cy="300" r="26" fill="url(#cr-gold)"/>' +
      '<path d="M118 280 l6 13 l14 2 l-10 10 l2 14 l-12 -7 l-12 7 l2 -14 l-10 -10 l14 -2 Z" fill="#7f1d1d"/>' +
      '<circle cx="118" cy="360" r="9" fill="#fde68a"/>' +
      '</g>' +
      '<path class="door-light" d="M50 424 L50 206 q68 -74 136 0 L186 424 Z" fill="#fff7ed" opacity="0"/>' +
      '<path d="M28 196 h180 l-14 -22 h-152 Z" fill="url(#cr-gold)"/>' +
      '<text x="118" y="164" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="22" font-weight="600" fill="#fde68a">IEȘIRE</text>';

    var body = b +
      hs(0, 'Toba mare', 300, 316, [216, 310, 168, 168], toba) +
      hs(2, 'Cutia iluzionistului', 470, 310, [396, 306, 148, 180], cutie) +
      hs(1, 'Trapezul', 700, 36, [606, 32, 190, 292], trapez) +
      hs(3, 'Tunul de circ', 770, 336, [676, 332, 190, 158], tun) +
      door(118, 158, [24, 156, 190, 280], usa);
    return wrap(defs, body);
  };


  /* =====================================================================
     OBIECTE SUPLIMENTARE
     Camerele pot avea 4, 8 sau 12 probe. Primele 4 sunt obiectele mari,
     desenate special pentru fiecare scenă. Peste ele se pot adăuga până la
     8 obiecte de recuzită, așezate pe podea, colorate după paleta camerei.
     Sunt desenate fără degradeuri, ca să poată fi injectate în scena deja
     construită (unde id-urile au primit deja sufixul unic).
     ===================================================================== */
  var PROPS = {
    lada: function (c) {
      return '<rect x="-34" y="-52" width="68" height="52" rx="4" fill="' + c[0] + '"/>' +
        '<rect x="-34" y="-52" width="68" height="52" rx="4" fill="none" stroke="' + c[1] + '" stroke-width="4"/>' +
        '<path d="M-34 -52 L34 0 M34 -52 L-34 0" stroke="' + c[1] + '" stroke-width="4"/>' +
        '<rect x="-34" y="-56" width="68" height="9" rx="3" fill="' + c[1] + '"/>' +
        '<circle cx="0" cy="-26" r="6" fill="' + c[2] + '"/>';
    },
    sac: function (c) {
      return '<path d="M-26 0 q-8 -34 8 -44 q18 -8 36 0 q16 10 8 44 Z" fill="' + c[0] + '"/>' +
        '<path d="M-18 -44 q18 -10 36 0 l-4 -12 q-14 -6 -28 0 Z" fill="' + c[1] + '"/>' +
        '<path d="M-16 -56 q16 -8 32 0" stroke="' + c[2] + '" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<path d="M-14 -18 h28" stroke="' + c[1] + '" stroke-width="4" opacity=".6"/>';
    },
    felinar: function (c) {
      return '<rect x="-20" y="-8" width="40" height="10" rx="4" fill="' + c[1] + '"/>' +
        '<rect x="-16" y="-48" width="32" height="42" rx="4" fill="' + c[1] + '"/>' +
        '<rect x="-10" y="-42" width="20" height="30" rx="3" fill="#fef3c7"/>' +
        '<g class="flicker"><ellipse cx="0" cy="-27" rx="7" ry="11" fill="#fbbf24"/></g>' +
        '<path d="M-18 -48 h36 l-6 -10 h-24 Z" fill="' + c[1] + '"/>' +
        '<path d="M0 -58 v-8" stroke="' + c[2] + '" stroke-width="4" stroke-linecap="round"/>';
    },
    borcan: function (c) {
      return '<path d="M-20 0 v-40 q0 -8 20 -8 q20 0 20 8 V0 Z" fill="#e0f2fe" opacity=".55"/>' +
        '<path d="M-20 0 v-40 q0 -8 20 -8 q20 0 20 8 V0 Z" fill="none" stroke="#f8fafc" stroke-width="3"/>' +
        '<path d="M-17 0 v-20 h34 V0 Z" fill="' + c[2] + '"/>' +
        '<rect x="-22" y="-56" width="44" height="12" rx="4" fill="' + c[1] + '"/>' +
        '<circle cx="-6" cy="-12" r="4" fill="' + c[0] + '"/><circle cx="8" cy="-8" r="3.4" fill="' + c[0] + '"/>';
    },
    carti: function (c) {
      return '<rect x="-30" y="-16" width="60" height="16" rx="3" fill="' + c[0] + '"/>' +
        '<rect x="-30" y="-14" width="60" height="4" fill="#fef3c7" opacity=".8"/>' +
        '<rect x="-26" y="-32" width="54" height="16" rx="3" fill="' + c[2] + '"/>' +
        '<rect x="-26" y="-30" width="54" height="4" fill="#fef3c7" opacity=".8"/>' +
        '<rect x="-22" y="-48" width="48" height="16" rx="3" fill="' + c[1] + '"/>' +
        '<rect x="-22" y="-46" width="48" height="4" fill="#fef3c7" opacity=".8"/>';
    },
    butoi: function (c) {
      return '<path d="M-26 0 q-8 -26 0 -52 h52 q8 26 0 52 Z" fill="' + c[0] + '"/>' +
        '<path d="M-26 0 q-8 -26 0 -52 h52 q8 26 0 52 Z" fill="none" stroke="' + c[1] + '" stroke-width="3"/>' +
        '<path d="M-29 -38 h58 M-29 -16 h58" stroke="' + c[1] + '" stroke-width="6"/>' +
        '<ellipse cx="0" cy="-52" rx="26" ry="7" fill="' + c[2] + '"/>' +
        '<path d="M0 -52 v52" stroke="' + c[1] + '" stroke-width="2" opacity=".5"/>';
    },
    cufaras: function (c) {
      return '<rect x="-30" y="-30" width="60" height="30" rx="4" fill="' + c[0] + '"/>' +
        '<path d="M-30 -30 q30 -26 60 0 Z" fill="' + c[2] + '"/>' +
        '<rect x="-30" y="-33" width="60" height="7" fill="' + c[1] + '"/>' +
        '<rect x="-6" y="-46" width="12" height="46" fill="' + c[1] + '" opacity=".9"/>' +
        '<rect x="-8" y="-20" width="16" height="14" rx="3" fill="' + c[2] + '"/>' +
        '<circle cx="0" cy="-13" r="3" fill="' + c[1] + '"/>';
    },
    vas: function (c) {
      return '<path d="M-24 0 q-14 -30 0 -44 h48 q14 14 0 44 Z" fill="' + c[0] + '"/>' +
        '<ellipse cx="0" cy="-44" rx="24" ry="8" fill="' + c[1] + '"/>' +
        '<path d="M-24 -34 q-14 6 -6 18" stroke="' + c[1] + '" stroke-width="6" fill="none"/>' +
        '<path d="M24 -34 q14 6 6 18" stroke="' + c[1] + '" stroke-width="6" fill="none"/>' +
        '<path d="M-14 -18 q14 8 28 0" stroke="' + c[2] + '" stroke-width="4" fill="none"/>';
    }
  };
  var PROP_ORDER = ['lada', 'butoi', 'borcan', 'sac', 'cufaras', 'felinar', 'carti', 'vas'];
  var PROP_NAME = {
    lada: 'Lada de lemn', butoi: 'Butoiul', borcan: 'Borcanul', sac: 'Sacul',
    cufaras: 'Cufărașul', felinar: 'Felinarul', carti: 'Teancul de cărți', vas: 'Vasul'
  };
  var PROP_PAL = {
    piramida:    ['#c8952f', '#7a5320', '#0e7490'],
    castel:      ['#92400e', '#5c2c08', '#b91c1c'],
    spatiu:      ['#94a3b8', '#475569', '#38bdf8'],
    jungla:      ['#a16207', '#4a2408', '#22c55e'],
    laborator:   ['#64748b', '#334155', '#a855f7'],
    pirati:      ['#a16207', '#4a2408', '#fbbf24'],
    gheata:      ['#7dd3fc', '#0369a1', '#f8fafc'],
    biblioteca:  ['#9a5f26', '#5c3312', '#dc2626'],
    bomboane:    ['#f472b6', '#be185d', '#fde68a'],
    roboti:      ['#94a3b8', '#334155', '#22d3ee'],
    mister:      ['#7c3aed', '#3b0764', '#f0abfc'],
    ceasornicar: ['#a9703a', '#5c3b1c', '#d4a017'],
    submarin:    ['#7c98a6', '#3f5a66', '#22d3ee'],
    tren:        ['#a9703a', '#5c3b1c', '#166e5a'],
    circ:        ['#dc2626', '#7f1d1d', '#fde68a']
  };

  function buildExtras(theme, n) {
    var pal = PROP_PAL[theme] || PROP_PAL.mister, out = '', i;
    for (i = 0; i < n; i++) {
      var kind = PROP_ORDER[i % PROP_ORDER.length];
      var x = 76 + i * 121;
      var y = 534 + ((i % 3) - 1) * 7;
      var sc = (0.92 + (i % 4) * 0.05).toFixed(2);
      var art = '<g transform="translate(' + x + ',' + y + ') scale(' + sc + ')">' +
                '<ellipse cx="0" cy="2" rx="34" ry="8" fill="#000" opacity=".32"/>' +
                PROPS[kind](pal) + '</g>';
      out += hs(4 + i, PROP_NAME[kind], x, y - 62, [x - 42, y - 60, 84, 70], art);
    }
    return out;
  }

  /* construiește scena cu numărul cerut de obiecte (4, 8 sau 12) */
  function build(theme, count) {
    var fn = SCENES[theme] || SCENES.mister;
    var svg = fn();
    var extra = Math.max(0, Math.min(8, (count || 4) - 4));
    return svg.replace('<g class="extra-slot"></g>', extra ? buildExtras(theme, extra) : '');
  }

  SCENES.build = build;
  /* paleta de recuzită pentru camerele generate (scenegen.js) */
  SCENES.setPropPal = function (theme, pal) { PROP_PAL[theme] = pal; };
  /* ajutoarele de desen, refolosite de generatorul de scene */
  SCENES._h = { wrap: wrap, hs: hs, door: door, at: at, stars: stars, bricks: bricks, torch: torch };
  global.Scenes = SCENES;
})(window);
