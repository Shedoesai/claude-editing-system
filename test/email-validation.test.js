const assert = require("node:assert/strict");
const { test } = require("node:test");
const { normalEmail } = require("../lib/auth");

const atLimit = `${"é".repeat(121)}@example.com`;
const overLimit = `a${atLimit}`;

test("normalizes email and applies a 254-byte limit to the normalized value", () => {
  assert.equal(normalEmail("  Buyer+Course@Example.COM  "), "buyer+course@example.com");
  assert.equal(normalEmail(`  ${atLimit}  `), atLimit);
  assert.equal(normalEmail(overLimit), null);
});

test("preserves the existing dot and whitespace rules", () => {
  assert.equal(normalEmail("a@.example.com"), "a@.example.com");
  assert.equal(normalEmail("a@example.com."), "a@example.com.");
  for (const email of ["a@.com", "a@example.", "a@exam ple.com", "a@@example.com"]) {
    assert.equal(normalEmail(email), null, email);
  }
});

test("login and subscribe reject overlong email before contacting providers", async (t) => {
  const hasPaid = t.mock.method(require("../lib/stripe"), "hasPaid", async () => false);
  const addToList = t.mock.method(require("../lib/email-list"), "addToList", async () => true);
  const login = require("../api/login");
  const subscribe = require("../api/subscribe");

  for (const body of [{ email: overLimit }, JSON.stringify({ email: overLimit })]) {
    for (const handler of [login, subscribe]) {
      const response = {
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.payload = payload; }
      };
      await handler({ method: "POST", body, headers: {} }, response);
      assert.equal(response.statusCode, 400);
      assert.deepEqual(response.payload, { ok: false, error: "email" });
    }
  }
  assert.equal(hasPaid.mock.callCount(), 0);
  assert.equal(addToList.mock.callCount(), 0);
});
