/* Login local pentru GitHub Pages: barieră de interfață, nu autorizare pe server.
   Parolele nu sunt incluse în clar. Verificatorii publici pot fi testați offline. */
(function (global) {
  'use strict';
  var ACCOUNTS = {
  "user01": {
    "salt": "87c26704d86ec1832b485ef58007adf0",
    "hash": "dea52f45fb0ff0a7c0d90a3a0c1de95591a9f2879129b5c9be38705a711fb25b"
  },
  "user02": {
    "salt": "3d0e7b3fed95df9aa40a1c25c79d6d96",
    "hash": "07f396e3d7e9e7b9a50cb48a8d0377e782e45dc3c2614c870b095d6fa66342c3"
  },
  "user03": {
    "salt": "81ac088455d593ce830b058d390927bd",
    "hash": "2dd2e4d0a94ebf6e769d016b64d4624f774f0c7c416b682acd965c8575c0b813"
  },
  "user04": {
    "salt": "b2e84611fdb913583aa53f57cb244a4b",
    "hash": "695a9ccb3f6d2cc9e80b0df64ecb6f05c3348c39a537161762c7ceae6f82dad9"
  },
  "user05": {
    "salt": "8b8119c05b8fb351a1063dde6f51b15f",
    "hash": "8f0a99505b7de79498fc12e5e6c68e1ec90e5567ea67645b41ba3c1a4993ff01"
  },
  "user06": {
    "salt": "d595819c0ba9a3c0d90a6e13ba2f9ebe",
    "hash": "25a575da01f9ea070e85f52231e4df8b7a8d13b9ba69d8db88443be67b45f4ba"
  },
  "user07": {
    "salt": "0764573567478d096a737d6e555852bd",
    "hash": "b2c522960ab9bb42d141e15402cfff0d672c005695ff2d9bb0d6ca2cab6f2a81"
  },
  "user08": {
    "salt": "50a19587baf027e191b8cad8eec0809f",
    "hash": "ab5543399f77ac5de0a9508006ad6cf265cf868fd8fc8d5c7ef48c76d90639a2"
  },
  "user09": {
    "salt": "34b1bd2adc88744a6cf5185033c4b989",
    "hash": "03c2e0186e1ee769e9b7449df2907c42ec6f484bbd9fe39cbad4be2594fcf65d"
  },
  "user10": {
    "salt": "e23a56744627b450754c80e3d45cdb8e",
    "hash": "64521ea38ef91cb0816e7fcc32e90075747945732b3327b2a309bbe96e4dc1cd"
  },
  "user11": {
    "salt": "58e84f660e192eec90189f6746d53c50",
    "hash": "3672cb104b9626b94e3c193ee284b8873f5b224d8d52ad1dc1f6046641c0a7bb"
  },
  "user12": {
    "salt": "b1d6f934379e6dc37357dd550c91b223",
    "hash": "3ad4069ea277c758d536e042537befd759b2b904f309f00dc57d69a38204e21e"
  },
  "user13": {
    "salt": "dfc532827768649f7464eec89f863174",
    "hash": "097bf107322247f319642bef2cdc85a9ca3182c9d4cc56b27f3b157107dfb2db"
  },
  "user14": {
    "salt": "a7fd55dd8c83ab240de3825341ddd300",
    "hash": "d9eab71f09be99f734b6df78539d35db70969327fad3d2b1c845092525ebf8c9"
  },
  "user15": {
    "salt": "26051f5b7730f09ae5cb6cbb1a2b951a",
    "hash": "8999cb9606f7f50f65d96df6e587e20c371de94b550a8a34cc4ad9c60b3e81ec"
  },
  "user16": {
    "salt": "7673067c0f8a972adea3f47fac530637",
    "hash": "03d944166230e662762c03a99223391a9c83f53eca0cd98ddd860658e23da5fc"
  },
  "user17": {
    "salt": "c3ed929f2116eac91f24c9bd55e7dcc9",
    "hash": "126d47a861e963eaf2d24039f58aceb43b8153eb36b04458f7adc91c62f5ea6e"
  },
  "user18": {
    "salt": "540d7f3079bd0f2190df4ec454976f6a",
    "hash": "914cc33736771449630b4723a8f78d05c9a9b1070b3baeec277cba2f87f8bbaf"
  },
  "user19": {
    "salt": "9412fb8f8a22cdb198640da4c465b9d3",
    "hash": "72da689bc2af50c7d14e3ff248ed4eb107ab4ee21abbd86b27bdcb4427ef6ab8"
  },
  "user20": {
    "salt": "b0d76d809e9a09b4d4752a6ff791f2ae",
    "hash": "41d6172b45780bb1b30a6aaca9d930723f788b243cba36edc788b384c1b0c959"
  }
};
  var SESSION_KEY = 'evadarea-magica-session-v1';
  var SESSION_MS = 8 * 60 * 60 * 1000;
  var active = null;
  var expiryTimer = null;

  function known(username) {
    return Object.prototype.hasOwnProperty.call(ACCOUNTS, username);
  }
  function valid(session) {
    return session && known(session.username) && Number.isFinite(session.expiresAt) &&
      session.expiresAt > Date.now() && session.expiresAt <= Date.now() + SESSION_MS;
  }
  function readSession() {
    try {
      var session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      if (valid(session)) return session;
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) { /* Stocarea poate fi blocată; login-ul funcționează în memorie. */ }
    return null;
  }
  function logout() {
    active = null;
    clearTimeout(expiryTimer);
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* mod privat */ }
    // Reîncărcarea oprește cronometrele, sunetul și toate evenimentele jocului.
    document.getElementById('app').hidden = true;
    document.getElementById('account-bar').hidden = true;
    document.getElementById('modal-layer').hidden = true;
    global.location.reload();
  }
  async function verify(username, password) {
    // Același calcul pentru un cont necunoscut: mesaj și durată similare.
    var account = known(username) ? ACCOUNTS[username] : ACCOUNTS.user01;
    var key = await global.crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    var bits = await global.crypto.subtle.deriveBits({
      name: 'PBKDF2', salt: new TextEncoder().encode(account.salt), iterations: 210000, hash: 'SHA-256'
    }, key, 256);
    var hash = Array.from(new Uint8Array(bits)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    return known(username) && hash === account.hash;
  }
  function init(onLogin) {
    var form = document.getElementById('login-form');
    var username = document.getElementById('login-username');
    var password = document.getElementById('login-password');
    var error = document.getElementById('login-error');
    var button = document.getElementById('btn-login');
    var busy = false;
    function enter(session) {
      active = session;
      onLogin(session.username);
      password.value = '';
      document.getElementById('account-username').textContent = session.username;
      document.getElementById('login-wall').hidden = true;
      document.getElementById('account-bar').hidden = false;
      document.getElementById('app').hidden = false;
      expiryTimer = setTimeout(logout, Math.max(0, session.expiresAt - Date.now()));
      document.getElementById('btn-logout').focus();
      global.scrollTo(0, 0);
    }
    document.getElementById('btn-logout').addEventListener('click', logout);
    document.getElementById('login-show-password').addEventListener('change', function (event) {
      password.type = event.target.checked ? 'text' : 'password';
    });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && active && !valid(active)) logout();
    });
    global.addEventListener('pageshow', function () {
      if (active && !valid(active)) logout();
    });
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (busy) return;
      busy = true;
      button.disabled = true;
      button.textContent = 'Se verifică…';
      error.textContent = '';
      try {
        var name = username.value.trim().toLowerCase();
        if (!await verify(name, password.value)) {
          error.textContent = 'Utilizator sau parolă incorectă. Încearcă din nou.';
          password.value = '';
          password.focus();
          return;
        }
        var session = { username: name, expiresAt: Date.now() + SESSION_MS };
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (e) { /* sesiune în memorie */ }
        enter(session);
      } catch (e) {
        error.textContent = 'Autentificarea nu este disponibilă. Deschide jocul prin HTTPS sau localhost și reîncarcă pagina.';
      } finally {
        busy = false;
        button.disabled = false;
        button.textContent = 'Intră în aventură →';
      }
    });
    var session = readSession();
    if (session) enter(session);
    else username.focus();
  }
  global.Auth = { init: init };
})(window);
