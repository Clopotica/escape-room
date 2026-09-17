/* =====================================================================
   main.js — pornirea jocului după încărcarea paginii
   ===================================================================== */
(function () {
  'use strict';
  function start() {
    if (!window.Game) {
      console.error('Fișierele jocului nu s-au încărcat complet.');
      return;
    }
    window.Game.boot();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
