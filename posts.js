(function () {
  "use strict";

  // The landing page is not processed by Jekyll, so pull the blog's latest
  // posts at runtime from the Atom feed jekyll-feed emits at /blog/feed.xml.
  const FEED_URL = "/blog/feed.xml";
  const MAX_POSTS = 3;

  const list = document.getElementById("post-list");
  if (!list) return;

  function fmtDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    });
  }

  function render(posts) {
    list.replaceChildren();
    for (const post of posts) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = post.href;

      const title = document.createElement("span");
      title.className = "post-title";
      title.textContent = post.title;

      const date = document.createElement("span");
      date.className = "post-date";
      date.textContent = fmtDate(post.date);

      a.appendChild(title);
      if (date.textContent) a.appendChild(date);
      li.appendChild(a);
      list.appendChild(li);
    }
  }

  function fail() {
    // The "the blog →" CTA below still routes, so a feed hiccup is non-fatal.
    list.innerHTML = '<li class="post-error">couldn’t load the feed — head to the blog ↓</li>';
  }

  fetch(FEED_URL, { headers: { "Accept": "application/atom+xml" } })
    .then(function (res) {
      if (!res.ok) throw new Error("feed " + res.status);
      return res.text();
    })
    .then(function (xml) {
      const doc = new DOMParser().parseFromString(xml, "application/xml");
      if (doc.querySelector("parsererror")) throw new Error("bad feed xml");

      const entries = Array.from(doc.querySelectorAll("entry")).slice(0, MAX_POSTS);
      if (!entries.length) throw new Error("empty feed");

      const posts = entries.map(function (entry) {
        const link = entry.querySelector("link");
        const published = entry.querySelector("published") || entry.querySelector("updated");
        return {
          title: (entry.querySelector("title") || {}).textContent || "Untitled",
          href: link ? link.getAttribute("href") : "/blog/",
          date: published ? published.textContent : ""
        };
      });

      render(posts);
    })
    .catch(fail);
})();
