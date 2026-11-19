const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadHandler() {
  const calls = [];
  const context = {
    module: { exports: {} }, process: { env: {} }, console,
    require: id => {
      assert.equal(id, '../lib/email-list');
      return { addToList: async data => { calls.push(data); } };
    }
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../api/subscribe'), 'utf8'), context);
  return { handler: context.module.exports, calls, context };
}

async function request(handler, body, method = 'POST') {
  const res = { status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
  await handler({ method, body, headers: { referer: 'https://example.com/editing' } }, res);
  return res;
}

test('normalizes valid object and JSON requests and forwards subscription options', async () => {
  const { handler, calls } = loadHandler();
  for (const encode of [body => body, JSON.stringify]) {
    assert.equal((await request(handler, encode({ email: ' Test+Tag@Example.COM ', first_name: ' Ada ' }))).code, 200);
  }
  assert.equal(calls.length, 2);
  for (const call of calls) {
    assert.equal(call.email, 'test+tag@example.com');
    assert.equal(call.firstName, 'Ada');
    assert.equal(call.tag, 'course-waitlist');
    assert.equal(call.welcomeEmail, true);
  }
});

test('rejects malformed and oversized input before calling the provider', async () => {
  const { handler, calls } = loadHandler();
  for (const email of ['', 'a@b', 'a@.b', 'a@b.', 'a@@b.c', 'a b@c.d', 'a@b. c',
    'a@' + '.'.repeat(16384) + '@', 'a'.repeat(249) + '@b.com']) {
    const res = await request(handler, { email });
    assert.equal(res.code, 400, email.slice(0, 40));
    assert.equal(res.data.error, 'email');
  }
  assert.equal((await request(handler, '{')).code, 400);
  assert.equal(calls.length, 0);
});

test('accepts the length boundary and preserves method and honeypot controls', async () => {
  const { handler, calls } = loadHandler();
  assert.equal((await request(handler, { email: 'a'.repeat(248) + '@b.com' })).code, 200);
  assert.equal(calls[0].email.length, 254);
  assert.equal((await request(handler, { email: 'invalid', company: 'bot' })).code, 200);
  assert.equal((await request(handler, {}, 'GET')).code, 405);
  assert.equal(calls.length, 1);
});

test('preserves prior syntax acceptance for bounded addresses', () => {
  const { context } = loadHandler();
  const old = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const alphabet = ['a', '.', '@', ' ', '\n'];
  function check(value, depth) {
    assert.equal(context.validEmail(value), old.test(value), JSON.stringify(value));
    if (depth) for (const char of alphabet) check(value + char, depth - 1);
  }
  check('', 7);
});
