// Stripe sends buyers here right after paying (Payment Link → After payment → redirect to
// https://www.shedoesai.com/api/start?session_id={CHECKOUT_SESSION_ID}). We check the payment with Stripe
// and log them straight in, so they never wait for an email to get started.
const { setSession, normalEmail, redirect } = require("../lib/auth");
const { getSession, grantsAccess } = require("../lib/stripe");

module.exports = async (req, res) => {
  const id = new URL(req.url, "http://x").searchParams.get("session_id");
  if (!id || !/^cs_[A-Za-z0-9_]+$/.test(id)) return redirect(res, "/editing/login");
  try {
    const s = await getSession(id);
    const email = normalEmail((s.customer_details || {}).email || s.customer_email);
    if (!grantsAccess(s) || !email) return redirect(res, "/editing/login?e=payment");
    setSession(res, email);
    return redirect(res, "/editing/course?welcome=1");
  } catch (err) {
    console.error("start error", err);
    return redirect(res, "/editing/login?e=payment");
  }
};
