// The login form posts an email here. If that email has bought the course, we email a login link.
// The answer is the same either way, so the form can't be used to find out who bought.
const { loginLink, normalEmail, LOGIN_LINK_MINUTES } = require("../lib/auth");
const { hasPaid } = require("../lib/stripe");
const { sendLoginLink } = require("../lib/mailer");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const body = typeof req.body === "string" ? safeJson(req.body) : (req.body || {});
  if (body.company) return res.status(200).json({ ok: true }); // honeypot for bots
  const email = normalEmail(body.email);
  if (!email) return res.status(400).json({ ok: false, error: "email" });

  try {
    if (await hasPaid(email, body.email)) {
      const sent = await sendLoginLink(email, loginLink(req, email), LOGIN_LINK_MINUTES);
      if (!sent) return res.status(502).json({ ok: false, error: "send" });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ ok: false, error: "server" });
  }
};

function safeJson(s) { try { return JSON.parse(s); } catch (_) { return {}; } }
