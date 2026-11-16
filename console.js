(function () {
  "use strict";

  /* ------------------------------------------------------------------
   * Hidden /whoami console — the 5% fun. Opens on the π in the page foot or `?`, closes on Esc
   * or click-outside. Types out a short session for the curious.
   * ------------------------------------------------------------------ */
  const consoleEl = document.getElementById("console");
  const consoleBody = document.getElementById("console-body");
  const consoleClose = document.querySelector(".console-close");
  const consoleOpen = document.querySelector('[aria-controls="console"]');
  const panel = document.querySelector(".panel");
  if (!consoleEl || !consoleBody || !consoleClose) return;

  const SESSION = [
    { prompt: "$ ", cmd: "whoami" },
    { out: "greg stengel · staff infrastructure engineer" },
    { prompt: "$ ", cmd: "cat /etc/motto" },
    { out: "automate the boring, document the rest." },
    { prompt: "$ ", cmd: "uptime" },
    { out: "~20 years in production · load average: caffeinated" },
    { prompt: "$ ", cmd: "ls ~/unlisted" },
    { out: "blog/", href: "/blog/" },
    { prompt: "$ ", cmd: "echo $PURPOSE" },
    { out: "all the things." },
  ];

  const reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let typeAbort = false;
  let lastFocus = null;
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  async function runSession() {
    typeAbort = false;
    consoleBody.textContent = "";

    for (const step of SESSION) {
      if (typeAbort) break;
      if (step.prompt) {
        consoleBody.append(step.prompt);
        if (reduceMotion) {
          consoleBody.append(step.cmd + "\n");
          continue;
        }
        await sleep(70);
        for (const ch of step.cmd) {
          if (typeAbort) break;
          consoleBody.append(ch);
          await sleep(26 + Math.random() * 30);
        }
        consoleBody.append("\n");
        await sleep(200);
      } else if (step.out) {
        if (step.href) {
          // The blog isn't linked from the page itself; this is the way in.
          const a = document.createElement("a");
          a.href = step.href;
          a.textContent = step.out;
          consoleBody.append(a, "\n");
        } else {
          consoleBody.append(step.out + "\n");
        }
        if (!reduceMotion) await sleep(340);
      }
    }
    if (!typeAbort) {
      const cursor = document.createElement("span");
      cursor.className = "console-cursor";
      consoleBody.append("$ ");
      consoleBody.appendChild(cursor);
    }
  }

  function openConsole() {
    if (!consoleEl.hidden) return;
    lastFocus = document.activeElement;
    consoleEl.hidden = false;
    if (panel) panel.inert = true;
    runSession();
    if (consoleClose) consoleClose.focus({ preventScroll: true });
  }

  function closeConsole() {
    if (consoleEl.hidden) return;
    typeAbort = true;
    consoleEl.hidden = true;
    if (panel) panel.inert = false;
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus({ preventScroll: true });
    }
  }

  document.addEventListener("keydown", (e) => {
    // Keep Tab inside the console: the close button plus any typed-out links.
    if (e.key === "Tab" && !consoleEl.hidden) {
      const stops = Array.from(consoleEl.querySelectorAll("button, a[href]"));
      const at = stops.indexOf(document.activeElement);
      const next = at < 0 ? 0 : (at + (e.shiftKey ? -1 : 1) + stops.length) % stops.length;
      e.preventDefault();
      stops[next].focus({ preventScroll: true });
      return;
    }
    const t = e.target;
    const tag = t && t.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || (t && t.isContentEditable)) return;
    if (e.key === "?") {
      e.preventDefault();
      if (consoleEl.hidden) openConsole();
      else closeConsole();
    } else if (e.key === "Escape" && !consoleEl.hidden) {
      e.preventDefault();
      closeConsole();
    }
  });

  if (consoleOpen) consoleOpen.addEventListener("click", openConsole);
  if (consoleClose) consoleClose.addEventListener("click", closeConsole);
  consoleEl.addEventListener("click", (e) => {
    if (e.target === consoleEl) closeConsole();
  });
})();
