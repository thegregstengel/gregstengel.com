(function () {
  "use strict";

  const ICONS = [
    "aws", "azure", "google-cloud", "terraform",
    "docker", "kubernetes",
    "datadog", "splunk",
    "python", "bash",
    "firebase",
    "linux", "ubuntu", "fedora", "windows", "wsl",
    "vscode", "vim", "cursor",
    "claude-ai", "chatgpt",
    "git", "github-dark", "github-actions",
    "android", "google-play",
    "truenas", "plex", "tailscale",
    "obsidian", "wikidotjs", "jekyll", "discord",
    "windows-terminal"
  ];

  const ICON_PATH = "assets/icons/";

  // Tuneables
  const CELL = 140;             // grid cell size in px (smaller -> denser)
  const JITTER = 70;            // max random offset from cell center
  const MIN_SIZE = 44;
  const MAX_SIZE = 84;
  const FADE_MIN = 10;          // seconds
  const FADE_MAX = 22;
  const FLOAT_MIN = 22;
  const FLOAT_MAX = 44;
  const PEAK_OPACITY_MIN = 0.14;
  const PEAK_OPACITY_MAX = 0.28;
  const DRIFT_MAX = 36;         // px of drift
  const MAX_ICONS = 110;        // safety cap on large viewports

  const root = document.querySelector(".icon-background");
  if (!root) return;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function build() {
    // Clear any previous render (used on resize).
    root.replaceChildren();

    const w = window.innerWidth;
    const h = window.innerHeight;

    const cols = Math.ceil(w / CELL) + 1;
    const rows = Math.ceil(h / CELL) + 1;
    const total = Math.min(cols * rows, MAX_ICONS);

    // Build a shuffled bag so icons are evenly distributed; refill as needed.
    let bag = shuffled(ICONS);
    let bagIdx = 0;

    const fragment = document.createDocumentFragment();

    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push([c, r]);
      }
    }
    // Shuffle cells so the bag isn't always laid out left-to-right.
    const cellOrder = shuffled(cells).slice(0, total);

    for (const [c, r] of cellOrder) {
      if (bagIdx >= bag.length) {
        bag = shuffled(ICONS);
        bagIdx = 0;
      }
      const slug = bag[bagIdx++];

      const cx = c * CELL + CELL / 2 + rand(-JITTER, JITTER);
      const cy = r * CELL + CELL / 2 + rand(-JITTER, JITTER);

      const size = Math.round(rand(MIN_SIZE, MAX_SIZE));

      const el = document.createElement("div");
      el.className = "bg-icon";
      el.style.left = (cx - size / 2) + "px";
      el.style.top = (cy - size / 2) + "px";
      el.style.setProperty("--size", size + "px");
      el.style.setProperty("--float-duration", rand(FLOAT_MIN, FLOAT_MAX).toFixed(2) + "s");
      el.style.setProperty("--float-delay", (-rand(0, FLOAT_MAX)).toFixed(2) + "s");
      el.style.setProperty("--fade-duration", rand(FADE_MIN, FADE_MAX).toFixed(2) + "s");
      el.style.setProperty("--fade-delay", (-rand(0, FADE_MAX)).toFixed(2) + "s");
      el.style.setProperty("--peak-opacity", rand(PEAK_OPACITY_MIN, PEAK_OPACITY_MAX).toFixed(3));
      el.style.setProperty("--drift-x", rand(-DRIFT_MAX, DRIFT_MAX).toFixed(1) + "px");
      el.style.setProperty("--drift-y", rand(-DRIFT_MAX, DRIFT_MAX).toFixed(1) + "px");
      el.style.setProperty("--drift-rot", rand(-8, 8).toFixed(1) + "deg");

      const img = document.createElement("img");
      img.src = ICON_PATH + slug + ".svg";
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      el.appendChild(img);

      fragment.appendChild(el);
    }

    root.appendChild(fragment);
  }

  // Debounced rebuild on resize so density stays consistent.
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 250);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
