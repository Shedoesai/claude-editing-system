// The one place that talks to the email tool. Today that is beehiiv.
// To move to another tool later (e.g. Flodesk), rewrite addToList() here; nothing else changes.
//   BEEHIIV_API_KEY         an API key from beehiiv (Settings → API)
//   BEEHIIV_PUBLICATION_ID  the publication id, starts with "pub_"
//   BEEHIIV_NAME_FIELD      optional, the exact name of a beehiiv custom field for first name (e.g. "First Name")
const API = "https://api.beehiiv.com/v2";

// Adds (or finds) the person and gives them a tag. Returns true when it worked.
async function addToList({ email, firstName, tag, source, referrer, welcomeEmail }) {
  const key = process.env.BEEHIIV_API_KEY, pub = process.env.BEEHIIV_PUBLICATION_ID;
  if (!key || !pub) throw new Error("not_configured");
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

  const sub = {
    email,
    reactivate_existing: false,
    send_welcome_email: !!welcomeEmail,
    utm_source: source,
    referring_site: referrer || undefined
  };
  if (firstName && process.env.BEEHIIV_NAME_FIELD) sub.custom_fields = [{ name: process.env.BEEHIIV_NAME_FIELD, value: firstName }];

  const r = await fetch(`${API}/publications/${pub}/subscriptions`, { method: "POST", headers, body: JSON.stringify(sub) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) { console.error("beehiiv subscribe failed", r.status, JSON.stringify(data)); return false; }

  const id = data && data.data && data.data.id;
  if (!id) return false;
  const t = await fetch(`${API}/publications/${pub}/subscriptions/${id}/tags`, {
    method: "POST", headers, body: JSON.stringify({ tags: [tag] })
  });
  if (!t.ok) { console.error("beehiiv tag failed", t.status, await t.text()); return false; }
  return true;
}

module.exports = { addToList };
