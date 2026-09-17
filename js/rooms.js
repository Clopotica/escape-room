/* =====================================================================
   rooms.js — cele 10 camere clasice (desenate manual) + cele 90 de camere
   din lumile 2–10 (worlds.js) + camera misterioasă (generată aleatoriu).
   pool = tipurile de probe potrivite temei; la fiecare joc se aleg 4
   ===================================================================== */
(function (global) {
  'use strict';

  var ROOMS = [
    {
      id: 'piramida', nr: 1, name: 'Piramida Faraonului', sub: 'Egiptul Antic', emoji: '🔺',
      theme: 'piramida', target: 300,
      story: 'Ușa de piatră s-a închis în urma ta! Faraonul a ascuns <b>codul de ieșire</b> în {n} locuri din camera funerară. Caută-le prin cameră și atinge ce ți se pare suspect.',
      pool: ['math', 'riddle', 'cipher', 'count', 'sequence', 'culture', 'anagram', 'weights', 'dial']
    },
    {
      id: 'castel', nr: 2, name: 'Castelul Cavalerilor', sub: 'Evul Mediu', emoji: '🏰',
      theme: 'castel', target: 300,
      story: 'Sala tronului este încuiată, iar cavalerii au plecat la turnir. Rezolvă cele <b>{n} probe ale cavalerului</b> ca să afli codul porții.',
      pool: ['math', 'riddle', 'culture', 'order', 'count', 'anagram', 'logic', 'dial', 'weights']
    },
    {
      id: 'spatiu', nr: 3, name: 'Nava Spațială', sub: 'Misiune printre stele', emoji: '🚀',
      theme: 'spatiu', target: 320,
      story: 'Pilotul automat s-a blocat! Ca să deschizi sasul și să ajungi la capsula de salvare, trebuie să <b>repari cele {n} sisteme</b> ale navei.',
      pool: ['math', 'culture', 'sequence', 'count', 'logic', 'clock', 'cipher', 'sliders', 'dial']
    },
    {
      id: 'jungla', nr: 4, name: 'Jungla Pierdută', sub: 'Templul din adâncuri', emoji: '🌴',
      theme: 'jungla', target: 320,
      story: 'Ai găsit templul ascuns în junglă, dar poarta de piatră s-a închis. Animalele, totemul și tot ce mai găsești prin jur păzesc fiecare câte o <b>cifră din cod</b>.',
      pool: ['riddle', 'math', 'culture', 'count', 'anagram', 'match', 'logic', 'weights']
    },
    {
      id: 'laborator', nr: 5, name: 'Laboratorul Savantului', sub: 'Experimente năstrușnice', emoji: '🧪',
      theme: 'laborator', target: 340,
      story: 'Savantul a plecat în grabă și a activat sistemul de siguranță. Termină cele <b>{n} experimente</b> ca ușa blindată să se deschidă.',
      pool: ['math', 'shapes', 'sequence', 'culture', 'count', 'clock', 'logic', 'sliders', 'dial', 'weights']
    },
    {
      id: 'pirati', nr: 6, name: 'Corabia Piraților', sub: 'Comoara de pe mare', emoji: '🏴‍☠️',
      theme: 'pirati', target: 340,
      story: 'Căpitanul a ascuns cheia cabinei într-un cod din patru cifre. Sunt <b>{n} probe</b> pe corabie, iar fiecare îți dă câte o cifră.',
      pool: ['math', 'riddle', 'money', 'cipher', 'order', 'culture', 'anagram', 'dial', 'weights']
    },
    {
      id: 'gheata', nr: 7, name: 'Peștera de Gheață', sub: 'Departe, la Polul Nord', emoji: '❄️',
      theme: 'gheata', target: 360,
      story: 'Viscolul a blocat ieșirea din peșteră. Prietenii de la pol — pinguinul și ursul polar — te ajută dacă rezolvi <b>probele de gheață</b>.',
      pool: ['math', 'culture', 'count', 'sequence', 'riddle', 'shapes', 'match', 'weights', 'sliders']
    },
    {
      id: 'biblioteca', nr: 8, name: 'Biblioteca Fermecată', sub: 'Cărți care vorbesc', emoji: '📚',
      theme: 'biblioteca', target: 360,
      story: 'Cartea magică s-a deschis singură și a încuiat ușa bibliotecii. Doar cine dezleagă <b>{n} enigme ale cuvintelor</b> poate ieși.',
      pool: ['riddle', 'anagram', 'proverb', 'culture', 'math', 'logic', 'order', 'dial']
    },
    {
      id: 'bomboane', nr: 9, name: 'Fabrica de Bomboane', sub: 'Dulce, dar încuiat', emoji: '🍭',
      theme: 'bomboane', target: 380,
      story: 'Mașinăriile s-au oprit și ușa de ciocolată s-a blocat. Pornește-le la loc rezolvând <b>{n} probleme dulci</b>.',
      pool: ['math', 'money', 'count', 'shapes', 'sequence', 'riddle', 'match', 'weights', 'sliders']
    },
    {
      id: 'roboti', nr: 10, name: 'Orașul Roboților', sub: 'Ultima provocare', emoji: '🤖',
      theme: 'roboti', target: 400,
      story: 'Ești în centrul de comandă al orașului roboților. Sistemul îți cere <b>{n} dovezi de inteligență</b> înainte să deschidă poarta blindată.',
      pool: ['math', 'sequence', 'logic', 'cipher', 'shapes', 'culture', 'order', 'clock', 'sliders', 'dial']
    }
  ];

  /* lumea 1 = camerele de mai sus; lumile 2–10 vin din worlds.js */
  ROOMS.forEach(function (r) { r.world = 0; });
  ROOMS = ROOMS.concat(global.Worlds.rooms);
  ROOMS.forEach(function (r, i) { r.nr = i + 1; });

  var WORLDS = global.Worlds.list.map(function (w, i) {
    return { id: w.id, name: w.name, emoji: w.emoji, desc: w.desc, index: i,
             rooms: ROOMS.filter(function (r) { return r.world === i; }) };
  });

  var MYSTERY = {
    id: 'mister', nr: ROOMS.length + 1, name: 'Camera Misterioasă', sub: 'Generată la întâmplare', emoji: '🎲',
    theme: 'mister', target: 340,
    story: 'Portalul te-a adus într-o cameră care <b>nu arată niciodată la fel</b>. Nici măcar eu nu știu ce probe te așteaptă de data asta!',
    pool: null /* toate tipurile */
  };

  /* Camera misterioasă nu refolosește niciodată una dintre cele 10 camere:
     are locurile ei, care apar doar aici. */
  var MYSTERY_ROOMS = [
    { theme: 'mister', name: 'Camera Portalului', emoji: '🌀',
      story: 'Portalul te-a adus într-o cameră care <b>nu arată niciodată la fel</b>. Nici măcar eu nu știu ce probe te așteaptă de data asta!' },
    { theme: 'ceasornicar', name: 'Atelierul Ceasornicarului', emoji: '⏳',
      story: 'Toate ceasurile s-au oprit în aceeași clipă, iar ușa s-a încuiat singură. <b>Pornește mecanismele</b> ca să pleci de aici.' },
    { theme: 'submarin', name: 'Submarinul Abisal', emoji: '🐙',
      story: 'Ești la o mie de metri sub apă, iar trapa s-a blocat. <b>Repornește aparatele</b> ca să poți urca la suprafață.' },
    { theme: 'tren', name: 'Vagonul de Noapte', emoji: '🚂',
      story: 'Trenul gonește prin noapte, iar ușa compartimentului nu se mai deschide. <b>Găsește codul conductorului</b>.' },
    { theme: 'circ', name: 'Circul Magic', emoji: '🎪',
      story: 'Spectacolul s-a terminat, luminile s-au stins și cortul e încuiat. <b>Rezolvă numerele artiștilor</b> ca să ieși din arenă.' }
  ];

  var THEMES = ['piramida', 'castel', 'spatiu', 'jungla', 'laborator', 'pirati', 'gheata', 'biblioteca', 'bomboane', 'roboti'];
  var MYSTERY_THEMES = MYSTERY_ROOMS.map(function (r) { return r.theme; });

  /* variantele de lungime pentru o cameră */
  var SIZES = [
    { n: 4, name: 'Scurtă', desc: '4 probe — o partidă de 5–10 minute', emoji: '🐇' },
    { n: 8, name: 'Medie', desc: '8 probe, în 2 lacăte pe rând', emoji: '🦊' },
    { n: 12, name: 'Lungă', desc: '12 probe, în 3 lacăte pe rând', emoji: '🐢' }
  ];

  function byId(id) {
    for (var i = 0; i < ROOMS.length; i++) if (ROOMS[i].id === id) return ROOMS[i];
    return id === 'mister' ? MYSTERY : null;
  }

  /* construiește o cameră aleatorie pornind de la o sămânță */
  function makeMystery(seed, level, count) {
    var rnd = global.U.makeRng(seed);
    var m = rnd.pick(MYSTERY_ROOMS);
    var n = count || 4;
    return {
      id: 'mister', nr: ROOMS.length + 1, name: m.name, sub: 'Cod cameră: ' + global.U.seedToCode(seed),
      emoji: m.emoji, theme: m.theme, target: MYSTERY.target, story: m.story,
      types: spread(rnd, global.Puzzles.typesFor(level), n),
      seed: seed, random: true
    };
  }

  /* alege atâtea tipuri de probe câte are camera (4, 8 sau 12), fără să
     repete un tip înainte să le fi folosit pe toate cele disponibile */
  function spread(rnd, pool, n) {
    var out = [];
    while (out.length < n) out = out.concat(rnd.shuffle(pool));
    return out.slice(0, n);
  }
  function pickTypes(room, rnd, level, count) {
    var allowed = global.Puzzles.typesFor(level);
    var pool = (room.pool || allowed).filter(function (t) { return allowed.indexOf(t) >= 0; });
    if (pool.length < 4) pool = allowed;
    return spread(rnd, pool, count || 4);
  }

  global.Rooms = {
    list: ROOMS, worlds: WORLDS, mystery: MYSTERY, themes: THEMES,
    mysteryRooms: MYSTERY_ROOMS, mysteryThemes: MYSTERY_THEMES, sizes: SIZES,
    byId: byId, makeMystery: makeMystery, pickTypes: pickTypes
  };
})(window);
