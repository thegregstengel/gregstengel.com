(function () {
  "use strict";

  /* ------------------------------------------------------------------
   * Theme toggle — persisted in localStorage; falls back to OS preference.
   * ------------------------------------------------------------------ */
  const root = document.documentElement;
  const STORAGE_KEY = "gs-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    const btn = document.querySelector(".theme-toggle");
    if (btn) btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }

  function initTheme() {
    let theme = "light";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        theme = stored;
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        theme = "dark";
      }
    } catch (_) {
      // localStorage unavailable (private mode, etc.) — ignore.
    }
    applyTheme(theme);
  }

  function bindThemeToggle() {
    const btn = document.querySelector(".theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
    });
  }

  /* ------------------------------------------------------------------
   * Scroll reveal — sections fade in and their hairline rules draw across
   * once they enter the viewport.
   * ------------------------------------------------------------------ */
  function initReveal() {
    const targets = document.querySelectorAll(".manual-section, .reach, .abstract");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
    );
    targets.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------
   * Hidden /whoami console — opens on `?` (Shift+/), closes on Esc.
   * Lines stream in with a brief typewriter effect.
   * ------------------------------------------------------------------ */
  const consoleEl = document.getElementById("console");
  const consoleBody = document.getElementById("console-body");
  const consoleClose = document.querySelector(".console-close");

  const SESSION = [
    { prompt: "$ ", cmd: "whoami" },
    { out: "greg stengel · operator, builder, lifer" },
    { prompt: "$ ", cmd: "ls /interests" },
    { out: "ai-agents/  homelab/  warzones/  signal/  writing/" },
    { prompt: "$ ", cmd: "uname -a" },
    { out: "Florida 25.0 #1 SINCE 2001 x86_64 GNU/curious" },
    { prompt: "$ ", cmd: "echo 'hey'" },
    { out: "hey." },
  ];

  let typing = false;
  let typeAbort = false;

  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async function runSession() {
    if (!consoleBody) return;
    typing = true;
    typeAbort = false;
    consoleBody.textContent = "";

    for (const step of SESSION) {
      if (typeAbort) break;
      if (step.prompt) {
        consoleBody.append(step.prompt);
        await sleep(60);
        // type the command letter by letter
        for (const ch of step.cmd) {
          if (typeAbort) break;
          consoleBody.append(ch);
          await sleep(28 + Math.random() * 28);
        }
        consoleBody.append("\n");
        await sleep(220);
      } else if (step.out) {
        consoleBody.append(step.out + "\n");
        await sleep(380);
      }
    }
    typing = false;
    if (!typeAbort) {
      const cursor = document.createElement("span");
      cursor.className = "console-cursor";
      consoleBody.appendChild(document.createTextNode("$ "));
      consoleBody.appendChild(cursor);
    }
  }

  function openConsole() {
    if (!consoleEl) return;
    if (!consoleEl.hidden) return;
    consoleEl.hidden = false;
    runSession();
    if (consoleClose) consoleClose.focus({ preventScroll: true });
  }

  function closeConsole() {
    if (!consoleEl || consoleEl.hidden) return;
    typeAbort = true;
    consoleEl.hidden = true;
  }

  function bindConsole() {
    if (!consoleEl) return;

    document.addEventListener("keydown", (e) => {
      // Don't trigger if user is typing in a form field.
      const target = e.target;
      const tag = target && target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (target && target.isContentEditable)) {
        return;
      }
      // `?` — Shift+/ on most layouts
      if (e.key === "?") {
        e.preventDefault();
        if (consoleEl.hidden) openConsole();
        else closeConsole();
      } else if (e.key === "Escape" && !consoleEl.hidden) {
        e.preventDefault();
        closeConsole();
      }
    });

    if (consoleClose) consoleClose.addEventListener("click", closeConsole);
    consoleEl.addEventListener("click", (e) => {
      if (e.target === consoleEl) closeConsole();
    });
  }

  /* ------------------------------------------------------------------
   * Boot
   * ------------------------------------------------------------------ */
  function init() {
    bindThemeToggle();
    initReveal();
    bindConsole();
  }

  initTheme(); // run synchronously so there's no flash of light mode

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
