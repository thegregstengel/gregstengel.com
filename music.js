/* ========================================
   Sound control — a small always-running soundtrack you can un-mute.

   Modelled on omarchy.org's music control:
   - The track is conceptually *always playing* from the moment the page loads
     (a virtual clock). Un-muting joins it in progress instead of restarting,
     and muting just ramps the gain to zero so the audio keeps its place.
   - The EQ bars move even while muted, driven by a precomputed spectrum
     (assets/music/<slug>.json, made by scripts/gen-music.py). Once sound is
     on they switch to a live AnalyserNode.
   - Nothing is fetched or decoded until the first un-mute except the small
     spectrum JSON. No autoplay is ever attempted.
   ======================================== */
(() => {
  "use strict";

  const TRACK = {
    title: "Phosphor Idle",
    artist: "placeholder synth",
    src: "/assets/music/phosphor-idle.mp3",
    meta: "/assets/music/phosphor-idle.json",
  };
  const BARS = 4;             // EQ bars in the control
  const BAR_MAX = 12;         // px, tallest bar
  const RAMP = 0.08;          // seconds, mute/unmute gain ramp
  const FFT = 2048;
  const DB_FLOOR = -90, DB_SPAN = 90;

  const root = document.getElementById("music");
  if (!root) return;
  const toggleBtn = root.querySelector(".music-toggle");
  const titleEl = root.querySelector(".music-title");
  const timeEl = root.querySelector(".music-time");
  const bars = Array.from(root.querySelectorAll(".music-bars i"));
  const progressEl = root.querySelector(".music-progress");
  const seekEl = root.querySelector(".music-seek");
  const footBtn = document.querySelector("[data-music-toggle]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ---- state -----------------------------------------------------------
  let state = "muted";        // muted | loading | playing | failed
  let touched = false;
  let meta = null;            // { duration, fps, bands, spectrum: Uint8Array }
  let audio = null, ctx = null, analyser = null, gain = null;
  let freq = null, bandRanges = [];
  let clock0 = performance.now();   // virtual clock origin (ms)
  let scrubbing = false;
  let raf = 0;
  const peak = new Float32Array(BARS).fill(0.3);
  const floor = new Float32Array(BARS).fill(0);
  const smooth = new Float32Array(BARS).fill(0);
  const levels = new Float32Array(BARS);

  const sounding = () => state === "playing" || state === "loading";
  const audible = () => !!audio && !audio.paused && state !== "muted";
  const duration = () => (meta && meta.duration) || (audio && isFinite(audio.duration) ? audio.duration : 0);
  const fmt = (s) => {
    s = Math.max(0, Math.floor(s || 0));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  // The track's "current position", whether or not anyone can hear it.
  function virtualTime(now = performance.now()) {
    const d = duration();
    if (!d) return 0;
    return ((now - clock0) / 1000) % d;
  }
  function currentTime() {
    return audible() ? audio.currentTime : virtualTime();
  }

  // ---- spectrum (muted visualizer) ------------------------------------
  fetch(TRACK.meta)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((m) => {
      const bin = atob(m.spectrum);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      meta = { duration: m.duration, fps: m.fps, bands: m.bands, spectrum: arr };
    })
    .catch(() => { meta = null; });

  function precomputedLevels(time, out) {
    if (!meta) { out.fill(0); return; }
    const { bands, fps, spectrum } = meta;
    const frames = spectrum.length / bands;
    const pos = time * fps;
    const f0 = Math.floor(pos) % frames;
    const f1 = (f0 + 1) % frames;
    const mix = pos - Math.floor(pos);
    const per = bands / out.length;
    for (let i = 0; i < out.length; i++) {
      let v = 0;
      for (let b = Math.floor(i * per); b < Math.floor((i + 1) * per); b++) {
        const a = spectrum[f0 * bands + b] * (1 - mix) + spectrum[f1 * bands + b] * mix;
        v = Math.max(v, a / 255);
      }
      out[i] = v;
    }
  }

  // ---- live analyser -----------------------------------------------------
  function setupBands(sampleRate) {
    const hz = sampleRate / FFT;
    bandRanges = [];
    for (let i = 0; i < BARS; i++) {
      const lo = 50 * (10000 / 50) ** (i / BARS);
      const hi = 50 * (10000 / 50) ** ((i + 1) / BARS);
      const a = Math.max(1, Math.round(lo / hz));
      const b = Math.max(a + 1, Math.round(hi / hz));
      bandRanges.push([a, Math.min(b, FFT / 2)]);
    }
  }
  function liveLevels(out) {
    analyser.getFloatFrequencyData(freq);
    for (let i = 0; i < BARS; i++) {
      const [a, b] = bandRanges[i];
      let sum = 0;
      for (let k = a; k < b; k++) if (freq[k] > DB_FLOOR) sum += 10 ** (freq[k] / 10);
      const db = sum > 0 ? 10 * Math.log10(sum / (b - a)) : DB_FLOOR;
      const raw = Math.max(0, Math.min(1, (db - DB_FLOOR) / DB_SPAN));
      // adaptive floor/ceiling so quiet passages still move the bars
      peak[i] = Math.max(peak[i] * 0.9993, raw, 0.2);
      floor[i] = Math.min(raw, floor[i] + (peak[i] - floor[i]) * 0.003);
      out[i] = Math.max(0, Math.min(1, (raw - floor[i]) / Math.max(0.15, peak[i] - floor[i])));
    }
  }

  // ---- audio graph (built lazily on first un-mute) ----------------------
  function ensureAudio() {
    if (audio) return;
    audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    audio.src = TRACK.src;
    audio.addEventListener("playing", () => { if (state === "loading") setState("playing"); });
    audio.addEventListener("waiting", () => { if (state === "playing") setState("loading"); });
    audio.addEventListener("error", () => setState("failed"));
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      ctx = new AC();
      analyser = ctx.createAnalyser();
      analyser.fftSize = FFT;
      analyser.smoothingTimeConstant = 0;
      freq = new Float32Array(analyser.frequencyBinCount);
      setupBands(ctx.sampleRate);
      gain = ctx.createGain();
      gain.gain.value = 0;
      ctx.createMediaElementSource(audio).connect(analyser);
      analyser.connect(gain);
      gain.connect(ctx.destination);
    }
  }
  function rampGain(to) {
    if (!ctx || !gain) { if (audio) audio.muted = to === 0; return; }
    const t = ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(to, t + RAMP);
  }

  async function unmute() {
    touched = true;
    root.classList.add("is-touched");
    if (audible()) { rampGain(1); setState("playing"); return; }
    try {
      ensureAudio();
      setState("loading");
      if (ctx && ctx.state !== "running") await ctx.resume();
      audio.currentTime = virtualTime();
      rampGain(1);
      await audio.play();
    } catch (_) {
      if (state === "loading") setState("failed");
    }
  }
  function mute() {
    if (audible()) {
      rampGain(0);            // keep the element playing so its position stays live
      clock0 = performance.now() - audio.currentTime * 1000;
    } else if (audio) {
      audio.pause();
    }
    setState("muted");
  }
  function toggle() { sounding() ? mute() : unmute(); }

  function seek(seconds) {
    const d = duration();
    if (!d) return;
    const t = Math.max(0, Math.min(d - 0.5, seconds));
    if (audio && !audio.paused) audio.currentTime = t;
    clock0 = performance.now() - t * 1000;
  }

  // ---- UI --------------------------------------------------------------
  function setState(next) {
    state = next;
    root.dataset.state = state;
    const on = sounding();
    toggleBtn.setAttribute("aria-pressed", String(on));
    toggleBtn.setAttribute("aria-label", on ? "Turn the sound off" : "Turn the sound on");
    toggleBtn.title = on ? "Sound off" : "Sound on";
    titleEl.textContent = state === "failed" ? "The sound could not start" : TRACK.title;
    if (footBtn) {
      footBtn.setAttribute("aria-pressed", String(on));
      footBtn.querySelector(".music-foot-label").textContent =
        state === "failed" ? "sound unavailable" : on ? "sound on" : "sound off";
    }
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    const d = duration();
    const t = currentTime();
    if (!scrubbing && d) {
      const p = t / d;
      progressEl.style.transform = `scaleX(${p})`;
      seekEl.value = String(Math.round(p * 1000));
      timeEl.textContent = `${fmt(t)} / ${fmt(d)}`;
    }
    if (audible() && analyser) liveLevels(levels);
    else if (reduceMotion.matches) levels.fill(0);
    else precomputedLevels(t, levels);
    for (let i = 0; i < BARS; i++) {
      const rising = levels[i] > smooth[i];
      smooth[i] += (levels[i] - smooth[i]) * (rising ? 0.7 : 0.2);
      bars[i].style.height = `${Math.max(2, Math.round(smooth[i] * BAR_MAX))}px`;
    }
  }
  function start() { if (!raf) raf = requestAnimationFrame(frame); }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  toggleBtn.addEventListener("click", toggle);
  if (footBtn) footBtn.addEventListener("click", toggle);

  seekEl.addEventListener("pointerdown", () => { scrubbing = true; });
  seekEl.addEventListener("pointerup", () => { scrubbing = false; });
  seekEl.addEventListener("pointercancel", () => { scrubbing = false; });
  seekEl.addEventListener("input", () => {
    const d = duration();
    const p = Number(seekEl.value) / 1000;
    progressEl.style.transform = `scaleX(${p})`;
    timeEl.textContent = `${fmt(p * d)} / ${fmt(d)}`;
    seek(p * d);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "m" || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    const tag = t && t.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || (t && t.isContentEditable)) return;
    const dialog = document.getElementById("console");
    if (dialog && !dialog.hidden) return;
    e.preventDefault();
    toggle();
  });

  // Don't burn frames in a background tab; the virtual clock keeps time anyway.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop(); else start();
  });

  setState("muted");
  root.hidden = false;
  start();
})();
