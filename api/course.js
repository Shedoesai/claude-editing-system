// The course page (served at /editing/course). Only logged-in students see it; everyone else goes to the login page.
// Content comes from course/content.js; videos get signed Bunny links valid for a few hours.
const { sessionEmail, redirect } = require("../lib/auth");
const { videoEmbedUrl } = require("../lib/bunny");
const content = require("../course/content");

module.exports = (req, res) => {
  let email = null;
  try { email = sessionEmail(req); } catch (err) { console.error("course auth error", err); }
  if (!email) return redirect(res, "/editing/login");

  const welcome = new URL(req.url, "http://x").searchParams.has("welcome");
  const lessons = [];
  content.modules.forEach((m, mi) => m.lessons.forEach(l => lessons.push({ id: l.id, title: l.title, module: mi, embed: videoEmbedUrl(l.video) })));

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  res.end(page({ email, welcome, lessons }));
};

const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function page({ email, welcome, lessons }) {
  const nav = content.modules.map((m, mi) => `
      <li class="mod"><span class="mod-n">Module ${mi + 1}</span><span class="mod-t">${esc(m.title)}</span>
        <ol>${m.lessons.map(l => `<li><a href="#${esc(l.id)}" data-id="${esc(l.id)}"><span class="tick" aria-hidden="true"></span><span>${esc(l.title)}</span></a></li>`).join("")}</ol>
      </li>`).join("");
  const files = content.files.length
    ? content.files.map((f, i) => `<li><a class="file" href="/api/download?f=${i}"><b>${esc(f.name)}</b>${f.note ? `<span>${esc(f.note)}</span>` : ""}</a></li>`).join("")
    : `<li class="soon">The student pack will appear here as soon as it's ready.</li>`;
  const data = JSON.stringify({ lessons, modules: content.modules.map(m => m.title) }).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(content.title)} | Course</title>
<meta name="robots" content="noindex">
<meta name="theme-color" content="#151311">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;800&family=Caveat:wght@700&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
/* Course room in the site's "Dark + Moodboard" look: lesson list on the left, the current lesson on the right,
   student pack below. Progress is saved in the student's browser. */
:root{
  --ink:#151311; --ink2:#1E1B18; --ink3:#28241F; --cream:#F2ECE3; --muted:#A9A196; --clay:#E08A5F; --clay-d:#A9542F;
  --sticky:#F3C969; --line:rgba(242,236,227,.14);
  --f-display:"Sora",system-ui,-apple-system,"Segoe UI",sans-serif;
  --f-hand:"Caveat","Comic Sans MS",cursive;
  --f-mono:"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;
  color-scheme:dark;
}
*{box-sizing:border-box}
[hidden]{display:none!important}
body{margin:0;background:var(--ink);color:var(--cream);font-family:var(--f-display);font-weight:300;font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
.wrap{max-width:1180px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
h1,h2,h3{font-weight:800;margin:0;letter-spacing:-.04em;text-wrap:balance}
p{margin:0}
a{color:inherit}
:focus-visible{outline:2px solid var(--clay);outline-offset:3px;border-radius:6px}
.eyebrow{font-family:var(--f-mono);font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:var(--muted)}
.btn{display:inline-flex;align-items:center;gap:8px;background:var(--clay);color:var(--ink);text-decoration:none;font-weight:600;font-size:14.5px;padding:11px 20px;border-radius:999px;border:0;cursor:pointer;font-family:var(--f-display)}
.btn:hover{background:#EB9C74}
.btn.ghost{background:transparent;color:var(--cream);border:1px solid var(--line)}
.btn.ghost:hover{border-color:var(--cream)}

header{border-bottom:1px solid var(--line)}
header .wrap{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-block:14px}
.brand{font-weight:800;font-size:19px;text-decoration:none;letter-spacing:-.04em}
.who{display:flex;align-items:center;gap:14px;font-size:13.5px;color:var(--muted);min-width:0}
.who span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.who a{color:var(--cream)}

.top{padding-block:clamp(32px,6vh,56px) 28px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:end;gap:20px}
.top h1{font-size:clamp(30px,4.4vw,52px);line-height:1.02;margin-top:10px}
.top h1 em{font-family:var(--f-hand);font-style:normal;color:var(--clay);font-size:1.15em;letter-spacing:0}
.progress{min-width:220px;display:grid;gap:8px;font-size:14px;color:var(--muted)}
.bar{height:8px;border-radius:99px;background:var(--ink3);overflow:hidden}
.bar i{display:block;height:100%;width:0;background:var(--clay);transition:width .3s}

.hello{background:var(--sticky);color:#2A2420;padding:16px 20px;border-radius:4px;transform:rotate(-.4deg);margin-bottom:28px;display:flex;flex-wrap:wrap;gap:6px 14px;align-items:baseline}
.hello b{font-family:var(--f-hand);font-size:26px;line-height:1}

.room{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:32px;align-items:start;padding-bottom:56px}
nav ol{list-style:none;margin:0;padding:0}
nav>ol{display:grid;gap:20px}
.mod-n{display:block;font-family:var(--f-mono);font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:var(--muted)}
.mod-t{display:block;font-weight:600;letter-spacing:-.02em;margin:2px 0 8px}
nav li li a{display:flex;gap:10px;align-items:flex-start;padding:7px 10px;border-radius:8px;text-decoration:none;font-size:14.5px;color:var(--muted)}
nav li li a:hover{background:var(--ink2);color:var(--cream)}
nav li li a[aria-current="true"]{background:var(--ink2);color:var(--cream);box-shadow:inset 2px 0 0 var(--clay)}
.tick{flex:none;width:16px;height:16px;margin-top:3px;border-radius:50%;border:1.5px solid var(--muted)}
a.done .tick{background:var(--clay);border-color:var(--clay);box-shadow:inset 0 0 0 3px var(--ink)}

.lesson{display:grid;gap:18px;min-width:0;position:sticky;top:16px}
.player{position:relative;aspect-ratio:16/9;max-width:100%;background:var(--ink2);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.player iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.player .soon{position:absolute;inset:0;display:grid;place-content:center;text-align:center;gap:6px;color:var(--muted);padding:20px}
.player .soon b{font-family:var(--f-hand);font-size:30px;color:var(--clay);line-height:1}
.lesson h2{font-size:clamp(24px,2.6vw,32px);line-height:1.1}
.actions{display:flex;flex-wrap:wrap;gap:10px}

.pack{border-top:1px solid var(--line);padding-block:40px 64px}
.pack h2{font-size:clamp(24px,2.6vw,32px);margin:8px 0 18px}
.pack ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:14px}
.file{display:grid;gap:4px;padding:16px 18px;border:1px solid var(--line);border-radius:10px;text-decoration:none}
.file:hover{border-color:var(--clay)}
.file b{font-weight:600}
.file span{font-size:14px;color:var(--muted)}
.soon{color:var(--muted)}
footer{border-top:1px solid var(--line);color:var(--muted);font-size:13.5px}
footer .wrap{padding-block:24px 36px}

@media (max-width:860px){
  .room{grid-template-columns:minmax(0,1fr)}
  nav{order:2}
  .lesson{position:static}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head><body>
<header>
  <div class="wrap">
    <a class="brand" href="/editing/course">shedoesai</a>
    <div class="who"><span>${esc(email)}</span><a href="/api/logout">Log out</a></div>
  </div>
</header>
<main class="wrap">
  <section class="top">
    <div>
      <p class="eyebrow">${esc(content.subtitle)}</p>
      <h1>${esc(content.title.replace(/ System$/, ""))} <em>System</em></h1>
    </div>
    <div class="progress"><span id="count">0 lessons done</span><div class="bar"><i id="bar"></i></div></div>
  </section>
  ${welcome ? `<div class="hello"><b>You're in!</b><span>Start with Module 1 below. I've also emailed you a link, so you can always find your way back.</span></div>` : ""}
  <div class="room">
    <nav aria-label="Lessons"><ol>${nav}
    </ol></nav>
    <article class="lesson" aria-live="polite">
      <div class="player" id="player"></div>
      <div>
        <p class="eyebrow" id="where"></p>
        <h2 id="title"></h2>
      </div>
      <div class="actions">
        <button class="btn" type="button" id="done">Mark as done</button>
        <a class="btn ghost" id="next" href="#">Next lesson →</a>
      </div>
    </article>
  </div>
  <section class="pack" id="pack">
    <p class="eyebrow">Student pack</p>
    <h2>Your files</h2>
    <ul>${files}</ul>
  </section>
</main>
<footer><div class="wrap">Stuck? ${process.env.SUPPORT_EMAIL ? `Email <span style="user-select:all">${esc(process.env.SUPPORT_EMAIL)}</span>.` : "Reply to your welcome email."}</div></footer>
<script>
const DATA = ${data};
const KEY = "ces-done";
let done = new Set();
try { done = new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch (_) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...done])); } catch (_) {} };
const links = [...document.querySelectorAll("nav a[data-id]")];

function current() {
  const id = location.hash.slice(1);
  const i = DATA.lessons.findIndex(l => l.id === id);
  if (i >= 0) return i;
  const firstOpen = DATA.lessons.findIndex(l => !done.has(l.id));
  return firstOpen >= 0 ? firstOpen : 0;
}

function render() {
  const i = current(), l = DATA.lessons[i], next = DATA.lessons[i + 1];
  const player = document.getElementById("player");
  player.replaceChildren();
  if (l.embed) {
    const f = document.createElement("iframe");
    f.src = l.embed; f.title = l.title; f.allowFullscreen = true;
    f.allow = "accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture";
    player.append(f);
  } else {
    player.innerHTML = '<div class="soon"><b>Coming soon</b><span>This lesson is being filmed.</span></div>';
  }
  document.getElementById("where").textContent = "Module " + (l.module + 1) + " · " + DATA.modules[l.module];
  document.getElementById("title").textContent = l.title;
  const btn = document.getElementById("done");
  btn.textContent = done.has(l.id) ? "Done ✓ (undo)" : "Mark as done";
  btn.onclick = () => { done.has(l.id) ? done.delete(l.id) : done.add(l.id); save(); paint(); render(); };
  const nx = document.getElementById("next");
  nx.hidden = !next;
  if (next) nx.href = "#" + next.id;
  links.forEach(a => a.setAttribute("aria-current", a.dataset.id === l.id ? "true" : "false"));
  paint();
}

function paint() {
  links.forEach(a => a.classList.toggle("done", done.has(a.dataset.id)));
  const n = DATA.lessons.filter(l => done.has(l.id)).length;
  document.getElementById("count").textContent = n + " of " + DATA.lessons.length + " lessons done";
  document.getElementById("bar").style.width = (100 * n / DATA.lessons.length) + "%";
}

addEventListener("hashchange", () => { render(); document.querySelector(".lesson").scrollIntoView({ block: "start", behavior: "smooth" }); });
render();
</script>
</body></html>`;
}
