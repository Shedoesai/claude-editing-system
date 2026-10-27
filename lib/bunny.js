// Signed links for Bunny, so videos and files only open for logged-in students.
//   BUNNY_LIBRARY_ID       Stream → your library → API → Library ID
//   BUNNY_STREAM_TOKEN_KEY Stream → library → Security → Embed view token authentication key
//   BUNNY_FILES_HOST       the pull zone hostname in front of the storage zone with the student pack, e.g. shedoesai-files.b-cdn.net
//   BUNNY_FILES_TOKEN_KEY  that pull zone → Security → Token Authentication → URL token authentication key
const crypto = require("crypto");

const VIDEO_HOURS = 6;
const FILE_MINUTES = 10;
const now = () => Math.floor(Date.now() / 1000);

function videoEmbedUrl(videoId) {
  const lib = process.env.BUNNY_LIBRARY_ID;
  if (!lib || !videoId) return null;
  const base = `https://iframe.mediadelivery.net/embed/${lib}/${encodeURIComponent(videoId)}`;
  const key = process.env.BUNNY_STREAM_TOKEN_KEY;
  if (!key) return `${base}?preload=false&responsive=true`;
  const expires = now() + VIDEO_HOURS * 3600;
  const token = crypto.createHash("sha256").update(key + videoId + expires).digest("hex");
  return `${base}?token=${token}&expires=${expires}&preload=false&responsive=true`;
}

function fileUrl(path) {
  const host = process.env.BUNNY_FILES_HOST;
  if (!host) return null;
  const p = "/" + String(path).replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/");
  const key = process.env.BUNNY_FILES_TOKEN_KEY;
  if (!key) return `https://${host}${p}`;
  const expires = now() + FILE_MINUTES * 60;
  const token = crypto.createHash("sha256").update(key + p + expires).digest("base64url");
  return `https://${host}${p}?token=${token}&expires=${expires}`;
}

module.exports = { videoEmbedUrl, fileUrl };
