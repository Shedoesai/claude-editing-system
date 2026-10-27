// Vercel serverless function: adds a waitlist sign-up to the email list and tags it.
// Set these in Vercel → Project → Settings → Environment Variables (never in the code):
//   BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID, BEEHIIV_NAME_FIELD (see lib/email-list.js)
//   BEEHIIV_TAG             optional, defaults to "course-waitlist"
const { addToList } = require("../lib/email-list");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const body = typeof req.body === "string" ? safeJson(req.body) : (req.body || {});
  const email = String(body.email || "").trim().toLowerCase();
  const firstName = String(body.first_name || "").trim().slice(0, 60);

  // Honeypot: bots fill the hidden "company" field. Pretend it worked.
  if (body.company) return res.status(200).json({ ok: true });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, error: "email" });

  try {
    // Tagging can fail after the sign-up itself worked; the visitor still counts as signed up.
    await addToList({
      email, firstName,
      tag: process.env.BEEHIIV_TAG || "course-waitlist",
      source: "waitlist-page",
      referrer: req.headers.referer,
      welcomeEmail: true
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("email list error", err);
    return res.status(err.message === "not_configured" ? 500 : 502).json({ ok: false, error: err.message === "not_configured" ? "not_configured" : undefined });
  }
};

function safeJson(s) { try { return JSON.parse(s); } catch (_) { return {}; } }
