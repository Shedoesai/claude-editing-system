// Vercel serverless function: adds a waitlist sign-up to beehiiv and tags it.
// Set these in Vercel → Project → Settings → Environment Variables (never in the code):
//   BEEHIIV_API_KEY         an API key from beehiiv (Settings → API)
//   BEEHIIV_PUBLICATION_ID  the publication id, starts with "pub_"
//   BEEHIIV_TAG             optional, defaults to "course-waitlist"
//   BEEHIIV_NAME_FIELD      optional, the exact name of a beehiiv custom field for first name (e.g. "First Name")
const API = "https://api.beehiiv.com/v2";

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const body = typeof req.body === "string" ? safeJson(req.body) : (req.body || {});
  const email = String(body.email || "").trim().toLowerCase();
  const firstName = String(body.first_name || "").trim().slice(0, 60);

  // Honeypot: bots fill the hidden "company" field. Pretend it worked.
  if (body.company) return res.status(200).json({ ok: true });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, error: "email" });

  const key = process.env.BEEHIIV_API_KEY, pub = process.env.BEEHIIV_PUBLICATION_ID;
  if (!key || !pub) return res.status(500).json({ ok: false, error: "not_configured" });
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

  const sub = {
    email,
    reactivate_existing: false,
    send_welcome_email: true,
    utm_source: "waitlist-page",
    referring_site: req.headers.referer || undefined
  };
  if (firstName && process.env.BEEHIIV_NAME_FIELD) sub.custom_fields = [{ name: process.env.BEEHIIV_NAME_FIELD, value: firstName }];

  try {
    const r = await fetch(`${API}/publications/${pub}/subscriptions`, { method: "POST", headers, body: JSON.stringify(sub) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { console.error("beehiiv subscribe failed", r.status, JSON.stringify(data)); return res.status(502).json({ ok: false }); }

    const id = data && data.data && data.data.id;
    if (id) {
      const t = await fetch(`${API}/publications/${pub}/subscriptions/${id}/tags`, {
        method: "POST", headers, body: JSON.stringify({ tags: [process.env.BEEHIIV_TAG || "course-waitlist"] })
      });
      if (!t.ok) console.error("beehiiv tag failed", t.status, await t.text());
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("beehiiv request error", err);
    return res.status(502).json({ ok: false });
  }
};

function safeJson(s) { try { return JSON.parse(s); } catch (_) { return {}; } }
