#!/usr/bin/env node
// Regenerates both favicon sets (root + blog) from assets/favicons/favicon.svg.
//
//   cd scripts && npm i --no-save sharp to-ico && node gen-favicons.js
//
// favicon.svg is the source of truth: a rounded tile with the `>_` prompt mark.
// The "full-bleed" variant (no rounded corners, no transparent margin) is derived
// from it for the iOS touch icon and the Android maskable icon, since those
// platforms apply their own mask.
const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const svgPath = path.join(root, 'assets/favicons/favicon.svg');
const svg = fs.readFileSync(svgPath);
const full = Buffer.from(
  svg.toString().replace(/<rect [^>]*rx="[^"]*"[^>]*\/>/, '<rect width="64" height="64" fill="#0f130f"/>')
);

const png = (src, size) =>
  sharp(src, { density: (72 * size) / 64 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

(async () => {
  const ico = await toIco([await png(svg, 16), await png(svg, 32), await png(svg, 48)]);
  const p96 = await png(svg, 96);
  const p192 = await png(svg, 192);
  const p512 = await png(svg, 512);
  const apple = await png(full, 180);
  const maskable = await png(full, 512);

  const write = (rel, buf) => {
    const f = path.join(root, rel);
    fs.writeFileSync(f, buf);
    console.log(`${rel}  ${buf.length} bytes`);
  };

  // Root set (landing page + 404). Browsers/iOS request /favicon.ico and
  // /apple-touch-icon.png by convention, so those live at the root.
  write('favicon.ico', ico);
  write('apple-touch-icon.png', apple);
  write('assets/favicons/favicon-96x96.png', p96);
  write('assets/favicons/icon-192.png', p192);
  write('assets/favicons/icon-512.png', p512);
  write('assets/favicons/icon-maskable-512.png', maskable);

  // Blog set, under the filenames Chirpy's _includes/favicons.html expects.
  const b = 'blog/assets/img/favicons/';
  write(b + 'favicon.svg', svg);
  write(b + 'favicon.ico', ico);
  write(b + 'apple-touch-icon.png', apple);
  write(b + 'favicon-96x96.png', p96);
  write(b + 'web-app-manifest-192x192.png', p192);
  write(b + 'web-app-manifest-512x512.png', p512);
  write(b + 'web-app-manifest-maskable-512x512.png', maskable);
})();
