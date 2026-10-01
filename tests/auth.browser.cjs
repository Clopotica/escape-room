// Run with Playwright installed and LOGIN_TEST_PASSWORDS set to a JSON array
// containing the 20 passwords in account order. Never commit those passwords.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const passwords = JSON.parse(process.env.LOGIN_TEST_PASSWORDS || '[]');
assert.equal(passwords.length, 20, 'Supply all 20 passwords using LOGIN_TEST_PASSWORDS');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'}[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});
(async () => {
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    browser = await chromium.launch({ channel: process.env.TEST_BROWSER_CHANNEL || 'msedge', headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const url = 'http://localhost:' + server.address().port;
    const sessionKey = 'evadarea-magica-session-v1';
    const visible = id => page.locator(id).isVisible();
    async function login(user, password) {
      await page.locator('#login-username').fill(user);
      await page.locator('#login-password').fill(password);
      await page.locator('#btn-login').click();
      await page.locator('#app').waitFor({state:'visible'});
    }
    async function logout() {
      await page.locator('#btn-logout').click();
      await page.locator('#login-wall').waitFor({state:'visible'});
      assert.equal(await visible('#app'), false);
    }
    await page.goto(url + '/#cod=KM4T9');
    assert.equal(await visible('#app'), false, 'Deep link must wait for login');
    await page.locator('#login-username').fill('user01');
    await page.locator('#login-password').fill(passwords[0].toUpperCase());
    await page.locator('#btn-login').click();
    await page.locator('#login-error').waitFor({state:'visible'});
    assert.equal(await visible('#app'), false);
    await page.locator('#login-username').fill('constructor');
    await page.locator('#login-password').fill(passwords[0]);
    await page.locator('#btn-login').click();
    await page.waitForFunction(() => !document.getElementById('btn-login').disabled);
    assert.equal(await visible('#app'), false, 'Unknown accounts must fail');
    await login(' USER01 ', passwords[0]);
    assert.equal(await visible('#screen-room'), true, 'Deep link resumes after login');
    await page.locator('#btn-back').click();
    await page.evaluate(() => U.Store.saveRoom('piramida', 3, 42));
    await page.reload();
    await page.locator('#app').waitFor({state:'visible'});
    assert.equal(await page.locator('#account-username').textContent(), 'user01');
    await logout();
    assert.equal(await page.evaluate(key => sessionStorage.getItem(key), sessionKey), null);
    await page.goto(url);
    for (let i = 1; i < 20; i++) {
      const user = 'user' + String(i + 1).padStart(2, '0');
      await login(user, passwords[i]);
      assert.equal(await page.locator('#account-username').textContent(), user);
      assert.equal(await page.evaluate(() => U.Store.doneCount()), 0, 'No progress leaks between accounts');
      await logout();
    }
    await login('user01', passwords[0]);
    assert.equal(await page.evaluate(() => U.Store.roomResult('piramida').best), 42, 'Progress survives account switching');
    await page.locator('#input-name').fill('Explorator test');
    await page.locator('#btn-start').click();
    assert.equal(await visible('#screen-map'), true);
    await page.evaluate(key => sessionStorage.setItem(key, JSON.stringify({username:'user01', expiresAt:Date.now()-1})), sessionKey);
    await page.reload();
    assert.equal(await visible('#app'), false, 'Expired session rejected');
    for (const invalid of ['{bad json', JSON.stringify({username:'user21',expiresAt:Date.now()+5000})]) {
      await page.evaluate(([key,value]) => sessionStorage.setItem(key,value), [sessionKey,invalid]);
      await page.reload();
      assert.equal(await visible('#app'), false, 'Malformed/unknown session rejected');
    }
    await page.setViewportSize({width:375,height:812});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Mobile login does not overflow');
    if (process.env.TEST_SCREENSHOT_PATH) await page.screenshot({path:process.env.TEST_SCREENSHOT_PATH,fullPage:true});
    await page.locator('#login-show-password').check();
    assert.equal(await page.locator('#login-password').getAttribute('type'), 'text');
    await page.locator('#login-show-password').uncheck();
    const blocked = await browser.newContext();
    await blocked.addInitScript(() => {
      Object.defineProperty(window, 'sessionStorage', {get(){throw new Error('blocked');}});
      Object.defineProperty(window, 'localStorage', {get(){throw new Error('blocked');}});
    });
    const blockedPage = await blocked.newPage();
    await blockedPage.goto(url);
    await blockedPage.locator('#login-username').fill('user01');
    await blockedPage.locator('#login-password').fill(passwords[0]);
    await blockedPage.locator('#btn-login').click();
    await blockedPage.locator('#app').waitFor({state:'visible'});
    await blockedPage.reload();
    assert.equal(await blockedPage.locator('#app').isVisible(), false, 'Blocked storage falls back to memory');
    await blocked.close();
    assert.deepEqual(errors, [], 'No browser runtime errors');
    console.log('PASS: all 20 accounts, bad credentials, deep links, refresh, logout, account isolation, expired/malformed sessions, mobile layout, blocked storage.');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
