// Name + email waitlist form at the bottom of the guides. Posts to the same /api/subscribe
// function as /editing (beehiiv, tag course-waitlist), then goes to the same thank-you page.
(function () {
  var HOSTED_FORM = "https://subscribe-forms.beehiiv.com/5f39e1e3-9737-4e6a-8ac1-00fab0608023";
  document.querySelectorAll("form.wl-inline").forEach(function (form) {
    var btn = form.querySelector('button[type="submit"]'), err = form.querySelector(".err");
    function fail(msg) { err.innerHTML = msg; err.hidden = false; btn.disabled = false; btn.textContent = "Join the waitlist"; }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.first_name.value.trim(), email = form.email.value.trim();
      err.hidden = true;
      if (!name) return fail("Add your first name.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("That email doesn't look right.");
      btn.disabled = true; btn.textContent = "Joining…";
      fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: name, email: email, company: form.company.value }) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); location.href = "/editing/thanks?n=" + encodeURIComponent(name.split(/\s+/)[0]); })
        .catch(function () { fail('Something went wrong on my end. <a href="' + HOSTED_FORM + '" target="_blank" rel="noopener">Join here instead</a>.'); });
    });
  });
})();
