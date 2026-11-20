/* Palette roulette: the page steps through amber, green and Dracula, one per
   load. Loaded synchronously in <head>, before the stylesheet paints, so
   there is no flash of the other colour. The palettes themselves live at the
   top of styles.css (amber is the default; the others are [data-palette="..."] blocks). */
(function () {
  "use strict";
  var ORDER = ["amber", "green", "dracula"];
  var THEME_COLOR = { amber: "#0d0c0a", green: "#0a0c0a", dracula: "#21222c" };
  var pick = function () { return ORDER[Math.floor(Math.random() * ORDER.length)]; };
  var next;
  try {
    var last = localStorage.getItem("palette");
    var at = ORDER.indexOf(last);
    next = at < 0 ? pick() : ORDER[(at + 1) % ORDER.length];   // at < 0: first visit
    localStorage.setItem("palette", next);
  } catch (_) {
    // Storage blocked (private window etc.): fall back to a random pick.
    next = pick();
  }
  document.documentElement.dataset.palette = next;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLOR[next]);
})();
