(function () {
  "use strict";

  /* ------------------------------------------------------------------
   * Hidden /whoami console — the 5% fun. Opens on `?`, closes on Esc
   * or click-outside. Types out a short session for the curious.
   * ------------------------------------------------------------------ */
  const consoleEl = document.getElementById("console");
  const consoleBody = document.getElementById("console-body");
  const consoleClose = document.querySelector(".console-close");
  if (!consoleEl || !consoleBody) return;

  const SESSION = [
    { prompt: "$ ", cmd: "whoami" },
    { out: "greg stengel · staff infrastructure engineer" },
    { prompt: "$ ", cmd: "cat /etc/motto" },
    { out: "automate the boring, document the rest." },
    { prompt: "$ ", cmd: "uptime" },
    { out: "~20 years in production · load average: caffeinated" },
    { prompt: "$ ", cmd: "ls ~/after-hours" },
    { out: "wopr/  truenas/  joshua/  paperclip/  the-blog/" },
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
        consoleBody.append(step.out + "\n");
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
    runSession();
    if (consoleClose) consoleClose.focus({ preventScroll: true });
  }

  function closeConsole() {
    if (consoleEl.hidden) return;
    typeAbort = true;
    consoleEl.hidden = true;
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus({ preventScroll: true });
    }
  }

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
})();
