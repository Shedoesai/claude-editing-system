// The link in the login email lands here: a valid, unexpired link logs the student in.
const { verify, setSession, redirect } = require("../lib/auth");

module.exports = (req, res) => {
  const t = new URL(req.url, "http://x").searchParams.get("t");
  let p = null;
  try { p = verify(t, "login"); } catch (err) { console.error("verify error", err); }
  if (!p) return redirect(res, "/editing/login?e=expired");
  setSession(res, p.e);
  return redirect(res, "/editing/course");
};
