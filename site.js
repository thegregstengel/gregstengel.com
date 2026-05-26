(function () {
  "use strict";

  const root = document.documentElement;
  const STORAGE_KEY = "gs-theme";

  /* ------------------------------------------------------------------
   * Theme toggle — dark default; persisted in localStorage.
   * ------------------------------------------------------------------ */
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    const btn = document.querySelector(".theme-toggle");
    if (btn) btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }

  function initTheme() {
    let theme = "dark";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        theme = stored;
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        // Only flip to light if the OS *explicitly* asks for it.
        theme = "light";
      }
    } catch (_) {}
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
   * Scroll reveal — chapters fade in as they enter the viewport.
   * ------------------------------------------------------------------ */
  function initReveal() {
    const targets = document.querySelectorAll(".chapter");
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
      { rootMargin: "0px 0px -12% 0px", threshold: 0.18 }
    );
    targets.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------
   * Hidden /whoami console — opens on `?`, closes on Esc.
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

  let typeAbort = false;

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  async function runSession() {
    if (!consoleBody) return;
    typeAbort = false;
    consoleBody.textContent = "";

    for (const step of SESSION) {
      if (typeAbort) break;
      if (step.prompt) {
        consoleBody.append(step.prompt);
        await sleep(70);
        for (const ch of step.cmd) {
          if (typeAbort) break;
          consoleBody.append(ch);
          await sleep(26 + Math.random() * 30);
        }
        consoleBody.append("\n");
        await sleep(220);
      } else if (step.out) {
        consoleBody.append(step.out + "\n");
        await sleep(360);
      }
    }
    if (!typeAbort) {
      consoleBody.append("$ ");
      const cursor = document.createElement("span");
      cursor.className = "console-cursor";
      consoleBody.appendChild(cursor);
    }
  }

  function openConsole() {
    if (!consoleEl || !consoleEl.hidden) return;
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

  initTheme();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
