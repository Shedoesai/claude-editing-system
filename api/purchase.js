// Vercel serverless function: the payment provider calls this when someone buys the course.
// It checks the call really came from the provider, then tags the buyer on the email list,
// so sales emails can go to "course-waitlist but not course-buyer".
// Works with Stripe or Lemon Squeezy; set the secret for the one in use in Vercel → Settings → Environment Variables:
//   STRIPE_WEBHOOK_SECRET        starts with "whsec_" (Stripe → Developers → Webhooks, event "checkout.session.completed")
//   LEMONSQUEEZY_WEBHOOK_SECRET  the signing secret typed into Lemon Squeezy → Settings → Webhooks (event "order_created")
//   BUYER_TAG                    optional, defaults to "course-buyer"
// Webhook URL for either: https://www.shedoesai.com/api/purchase
const crypto = require("crypto");
const { addToList } = require("../lib/email-list");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const raw = await readRaw(req);
  let buyer;
  if (req.headers["stripe-signature"]) buyer = fromStripe(raw, String(req.headers["stripe-signature"]));
  else if (req.headers["x-signature"]) buyer = fromLemonSqueezy(raw, String(req.headers["x-signature"]));
  if (!buyer) return res.status(401).json({ ok: false });
  // Events we don't act on are acknowledged so the provider stops retrying.
  if (!buyer.email) return res.status(200).json({ ok: true, skipped: true });

  try {
    const ok = await addToList({ email: buyer.email, firstName: buyer.firstName, tag: process.env.BUYER_TAG || "course-buyer", source: buyer.source, welcomeEmail: false });
    // A non-2xx makes the provider retry later, which is what we want if tagging failed.
    return res.status(ok ? 200 : 502).json({ ok });
  } catch (err) {
    console.error("purchase tagging error", err);
    return res.status(502).json({ ok: false });
  }
};

// Signature checks need the exact bytes the provider sent, so Vercel must not parse the body.
module.exports.config = { api: { bodyParser: false } };

// Returns null when the signature is wrong, {} for events to ignore, or the buyer.
function fromStripe(raw, header) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return null;
  const parts = Object.fromEntries(header.split(",").map(p => p.split("=")));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return null;
  const expected = crypto.createHmac("sha256", secret).update(`${parts.t}.${raw.toString("utf8")}`).digest("hex");
  const sigs = header.split(",").filter(p => p.startsWith("v1=")).map(p => p.slice(3));
  if (!sigs.some(s => safeEqual(s, expected))) return null;

  const event = safeJson(raw.toString("utf8"));
  const s = (event.data && event.data.object) || {};
  if (event.type !== "checkout.session.completed" || s.payment_status !== "paid") return {};
  const d = s.customer_details || {};
  return buyerFrom(d.email || s.customer_email, d.name, "stripe");
}

function fromLemonSqueezy(raw, given) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return null;
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  if (!safeEqual(given, expected)) return null;

  const event = safeJson(raw.toString("utf8"));
  const order = (event.data && event.data.attributes) || {};
  if (!event.meta || event.meta.event_name !== "order_created" || order.status !== "paid") return {};
  return buyerFrom(order.user_email, order.user_name, "lemonsqueezy");
}

function buyerFrom(email, name, source) {
  return {
    email: String(email || "").trim().toLowerCase(),
    firstName: String(name || "").trim().split(/\s+/)[0].slice(0, 60),
    source
  };
}

function safeEqual(a, b) {
  return a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function safeJson(s) { try { return JSON.parse(s); } catch (_) { return {}; } }
