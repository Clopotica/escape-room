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
    if (!window.Auth) {
      document.getElementById('login-error').textContent = 'Autentificarea nu s-a încărcat. Reîncarcă pagina.';
      return;
    }
    window.Auth.init(function (username) {
      window.U.Store.useAccount(username);
      window.Game.boot();
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
