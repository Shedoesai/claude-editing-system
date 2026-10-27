// Sends the course's own emails (login links, welcome) through Resend.
// Marketing emails stay in beehiiv; see lib/email-list.js.
//   RESEND_API_KEY  from resend.com → API Keys
//   MAIL_FROM       e.g. "Gunhild from shedoesai <course@shedoesai.com>"; the domain must be verified in Resend
//   SUPPORT_EMAIL   optional, where replies and help requests go (shown in emails)
async function send({ to, subject, text, html }) {
  const key = process.env.RESEND_API_KEY, from = process.env.MAIL_FROM;
  if (!key || !from) throw new Error("not_configured");
  const body = { from, to: [to], subject, text, html };
  if (process.env.SUPPORT_EMAIL) body.reply_to = process.env.SUPPORT_EMAIL;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!r.ok) { console.error("resend failed", r.status, await r.text()); return false; }
  return true;
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function layout(paragraphs, button) {
  const p = paragraphs.map(t => `<p style="margin:0 0 16px">${t}</p>`).join("");
  return `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#1E1A17;max-width:520px;margin:0 auto;padding:24px">
${p}<p style="margin:24px 0"><a href="${esc(button.href)}" style="background:#E08A5F;color:#151311;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;display:inline-block">${esc(button.label)}</a></p>
<p style="margin:0;color:#6B625A;font-size:14px">Button not working? Copy this link into your browser:<br>${esc(button.href)}</p></div>`;
}

function sendLoginLink(to, link, minutes) {
  return send({
    to,
    subject: "Your login link for The Claude Editing System",
    text: `Here is your login link. It works for ${minutes} minutes:\n\n${link}\n\nDidn't ask for it? Just ignore this email.`,
    html: layout([`Here is your login link for The Claude Editing System. It works for ${minutes} minutes.`, "Didn't ask for it? Just ignore this email."], { href: link, label: "Open the course" })
  });
}

function sendWelcome(to, firstName, link, loginPage) {
  const hi = firstName ? `Hi ${esc(firstName)},` : "Hi,";
  const help = process.env.SUPPORT_EMAIL ? ` If anything doesn't work, just reply to this email.` : "";
  return send({
    to,
    subject: "You're in: The Claude Editing System",
    text: `${hi.replace(/&amp;/g, "&")}\n\nThank you so much for buying The Claude Editing System. Start here:\n\n${link}\n\nNext time, go to ${loginPage}, type this email address and you'll get a login link. No password needed.${help}\n\nGunhild`,
    html: layout([
      hi,
      "Thank you so much for buying The Claude Editing System. Start with Module 1, and grab the student pack from the course page.",
      `Next time, go to <a href="${esc(loginPage)}">${esc(loginPage.replace(/^https?:\/\//, ""))}</a>, type this email address and you'll get a login link. No password needed.${help}`,
      "Gunhild"
    ], { href: link, label: "Start the course" })
  });
}

module.exports = { sendLoginLink, sendWelcome };
