/* Phosphor roulette: the page alternates between amber and green on every
   load. Loaded synchronously in <head>, before the stylesheet paints, so
   there is no flash of the other colour. The palettes themselves live at the
   top of styles.css (amber is the default; green is [data-palette="green"]). */
(function () {
  "use strict";
  var THEME_COLOR = { amber: "#0d0c0a", green: "#0a0c0a" };
  var next;
  try {
    var last = localStorage.getItem("palette");
    if (last === "amber") next = "green";
    else if (last === "green") next = "amber";
    else next = Math.random() < 0.5 ? "amber" : "green";   // first visit
    localStorage.setItem("palette", next);
  } catch (_) {
    // Storage blocked (private window etc.): fall back to a coin flip.
    next = Math.random() < 0.5 ? "amber" : "green";
  }
  document.documentElement.dataset.palette = next;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLOR[next]);
})();
