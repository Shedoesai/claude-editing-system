// Login without passwords: signed, short-lived links by email and a signed session cookie.
// Nothing is stored on the server; everything is checked with AUTH_SECRET.
//   AUTH_SECRET  a long random string (e.g. 64 characters); changing it logs everyone out
//   SITE_URL     optional, e.g. https://www.shedoesai.com (otherwise taken from the request)
const crypto = require("crypto");

const COOKIE = "ces_session";
const SESSION_DAYS = 30;
const LOGIN_LINK_MINUTES = 15;
const WELCOME_LINK_DAYS = 7;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("not_configured");
  return s;
}

const b64url = buf => Buffer.from(buf).toString("base64url");
const mac = data => crypto.createHmac("sha256", secret()).update(data).digest("base64url");

// A token is "<payload>.<signature>"; the payload carries the email, its purpose and an expiry time.
function sign(payload, ttlSeconds) {
  const body = b64url(JSON.stringify({ ...payload, x: Math.floor(Date.now() / 1000) + ttlSeconds }));
  return `${body}.${mac(body)}`;
}

function verify(token, purpose) {
  const [body, sig] = String(token || "").split(".");
  if (!body || !sig) return null;
  const expected = mac(body);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  let p;
  try { p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")); } catch (_) { return null; }
  if (p.p !== purpose || !p.e || !p.x || p.x < Date.now() / 1000) return null;
  return p;
}

function siteUrl(req) {
  return (process.env.SITE_URL || `https://${req.headers["x-forwarded-host"] || req.headers.host}`).replace(/\/$/, "");
}

function loginLink(req, email, { welcome } = {}) {
  const ttl = welcome ? WELCOME_LINK_DAYS * 86400 : LOGIN_LINK_MINUTES * 60;
  return `${siteUrl(req)}/api/verify?t=${sign({ e: email, p: "login" }, ttl)}`;
}

function setSession(res, email) {
  const token = sign({ e: email, p: "session" }, SESSION_DAYS * 86400);
  res.setHeader("Set-Cookie", `${COOKIE}=${token}; Path=/; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`);
}

function clearSession(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
}

// Returns the logged-in email, or null.
function sessionEmail(req) {
  const m = String(req.headers.cookie || "").match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  const p = m && verify(m[1], "session");
  return p ? p.e : null;
}

function normalEmail(e) {
  const email = String(e || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function redirect(res, location) {
  res.statusCode = 302;
  res.setHeader("Location", location);
  res.setHeader("Cache-Control", "no-store");
  res.end();
}

module.exports = { verify, siteUrl, loginLink, setSession, clearSession, sessionEmail, normalEmail, redirect, LOGIN_LINK_MINUTES };
