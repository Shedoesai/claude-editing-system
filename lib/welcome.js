// The course welcome email, sent once per purchase (called from the Stripe webhook in api/purchase.js).
const { siteUrl, loginLink, normalEmail } = require("./auth");
const { getSession, grantsAccess, claimWelcome } = require("./stripe");
const { sendWelcome } = require("./mailer");

async function sendWelcomeOnce(req, sessionId) {
  const s = await getSession(sessionId);
  const d = s.customer_details || {};
  const email = normalEmail(d.email || s.customer_email);
  if (!email || !grantsAccess(s)) return false;
  if (!(await claimWelcome(s))) return false;
  const firstName = String(d.name || "").trim().split(/\s+/)[0].slice(0, 60);
  return sendWelcome(email, firstName, loginLink(req, email, { welcome: true }), `${siteUrl(req)}/editing/login`);
}

module.exports = { sendWelcomeOnce };
