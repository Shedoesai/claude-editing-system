// Asks Stripe directly who has paid, so access never depends on a webhook having arrived.
//   STRIPE_SECRET_KEY        a restricted key is enough: Checkout Sessions read, PaymentIntents write
//   STRIPE_PAYMENT_LINK_ID   optional, plink_...; only purchases through this Payment Link count
//   ACCESS_EMAILS            optional, comma-separated emails that get access without buying (Gunhild, helpers, gifts)
const API = "https://api.stripe.com/v1";

async function stripe(method, path, params) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("not_configured");
  const qs = new URLSearchParams(params || {}).toString();
  const r = await fetch(method === "GET" && qs ? `${API}${path}?${qs}` : `${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: method === "GET" ? undefined : qs
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`stripe ${r.status}: ${data.error && data.error.message}`);
  return data;
}

// A session counts when it is paid, comes from our Payment Link (if one is set) and was not refunded.
function grantsAccess(s) {
  if (!s || s.status !== "complete" || s.payment_status !== "paid") return false;
  const link = process.env.STRIPE_PAYMENT_LINK_ID;
  if (link && s.payment_link !== link) return false;
  const charge = s.payment_intent && s.payment_intent.latest_charge;
  return !(charge && typeof charge === "object" && charge.refunded);
}

function allowList() {
  return String(process.env.ACCESS_EMAILS || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
}

// Stripe matches emails exactly, so we also try the spelling the student typed (e.g. "Ann@Gmail.com").
async function hasPaid(email, asTyped) {
  if (allowList().includes(email)) return true;
  for (const e of new Set([email, String(asTyped || "").trim()].filter(Boolean))) {
    const params = { "customer_details[email]": e, status: "complete", limit: "20", "expand[]": "data.payment_intent.latest_charge" };
    if (process.env.STRIPE_PAYMENT_LINK_ID) params.payment_link = process.env.STRIPE_PAYMENT_LINK_ID;
    const list = await stripe("GET", "/checkout/sessions", params);
    if ((list.data || []).some(grantsAccess)) return true;
  }
  return false;
}

async function getSession(id) {
  return stripe("GET", `/checkout/sessions/${encodeURIComponent(id)}`, { "expand[]": "payment_intent.latest_charge" });
}

// The welcome email goes out once per purchase. The "sent" mark lives on the payment in Stripe,
// so webhook retries and a reloaded thank-you page don't send it again.
async function claimWelcome(session) {
  const pi = session.payment_intent;
  const id = typeof pi === "string" ? pi : pi && pi.id;
  if (!id) return true;
  const current = typeof pi === "object" ? pi : await stripe("GET", `/payment_intents/${id}`);
  if (current.metadata && current.metadata.welcome_sent) return false;
  await stripe("POST", `/payment_intents/${id}`, { "metadata[welcome_sent]": new Date().toISOString() });
  return true;
}

module.exports = { hasPaid, getSession, grantsAccess, claimWelcome };
