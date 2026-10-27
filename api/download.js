// Student pack downloads: only for logged-in students, through a short-lived signed Bunny link.
const { sessionEmail, redirect } = require("../lib/auth");
const { fileUrl } = require("../lib/bunny");
const content = require("../course/content");

module.exports = (req, res) => {
  let email = null;
  try { email = sessionEmail(req); } catch (_) {}
  if (!email) return redirect(res, "/editing/login");
  const i = Number(new URL(req.url, "http://x").searchParams.get("f"));
  const file = Number.isInteger(i) ? content.files[i] : null;
  const url = file && fileUrl(file.path);
  if (!url) return res.status(404).send("File not found");
  return redirect(res, url);
};
