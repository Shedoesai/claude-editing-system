const { clearSession, redirect } = require("../lib/auth");

module.exports = (req, res) => {
  clearSession(res);
  return redirect(res, "/editing/login?e=out");
};
