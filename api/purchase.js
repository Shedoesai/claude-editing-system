// Vercel serverless function: Lemon Squeezy calls this when someone buys the course.
// It checks the call really came from Lemon Squeezy, then tags the buyer on the email list,
// so sales emails can go to "course-waitlist but not course-buyer".
// Set in Vercel → Settings → Environment Variables:
//   LEMONSQUEEZY_WEBHOOK_SECRET  the signing secret typed into Lemon Squeezy → Settings → Webhooks
//   BUYER_TAG                    optional, defaults to "course-buyer"
// In Lemon Squeezy, point the webhook at https://www.shedoesai.com/api/purchase with the event "order_created".
const crypto = require("crypto");
const { addToList } = require("../lib/email-list");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ ok: false, error: "not_configured" });

  const raw = await readRaw(req);
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const given = String(req.headers["x-signature"] || "");
  if (given.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected))) {
    return res.status(401).json({ ok: false });
  }

  const event = safeJson(raw.toString("utf8"));
  const name = event.meta && event.meta.event_name;
  const order = (event.data && event.data.attributes) || {};
  // Only paid orders count; anything else is acknowledged so Lemon Squeezy stops retrying.
  if (name !== "order_created" || order.status !== "paid") return res.status(200).json({ ok: true, skipped: true });

  const email = String(order.user_email || "").trim().toLowerCase();
  if (!email) return res.status(200).json({ ok: true, skipped: true });
  const firstName = String(order.user_name || "").trim().split(/\s+/)[0].slice(0, 60);

  try {
    const ok = await addToList({ email, firstName, tag: process.env.BUYER_TAG || "course-buyer", source: "lemonsqueezy", welcomeEmail: false });
    // A non-2xx makes Lemon Squeezy retry later, which is what we want if tagging failed.
    return res.status(ok ? 200 : 502).json({ ok });
  } catch (err) {
    console.error("purchase tagging error", err);
    return res.status(502).json({ ok: false });
  }
};

// Signature checks need the exact bytes Lemon Squeezy sent, so Vercel must not parse the body.
module.exports.config = { api: { bodyParser: false } };

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function safeJson(s) { try { return JSON.parse(s); } catch (_) { return {}; } }
