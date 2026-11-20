# gregstengel.com

This repo powers the full gregstengel.com website, deployed via GitHub Pages.

## 🧭 Structure
```
.
├── index.html         # Static landing page (served at /)
├── 404.html           # Custom 404 for the whole domain
├── styles.css         # Styling for the landing page and 404
├── palette.js         # Rotates the amber / green / Dracula palette on each load
├── background.js      # Animated tech-icon wall
├── console.js         # Hidden console (the π in the page foot)
├── music.js           # Sound control
├── assets/            # Icons, favicons, music
├── scripts/           # Asset generators (not published)
├── blog/              # Jekyll-powered blog (served at /blog)
│   ├── _config.yml
│   ├── _posts/
│   └── ...
└── .github/workflows/
    ├── deploy-site.yml   # Publishes the root files
    └── deploy-blog.yml   # Builds and publishes the blog
```

See `CLAUDE.md` for how the pieces work and `BRIEF.md` for the design direction.

## 🚀 Deployment Flow
- Pushes to `main` trigger deployment; nothing else does.
- `deploy-site.yml` syncs the root files to the `gh-pages` branch;
  `deploy-blog.yml` builds the Jekyll blog into `gh-pages` under `/blog`.
- The two workflows share a concurrency group, so they never push at the same time.

## 🌍 Resulting Live Site
| Path                | Content Source           |
|---------------------|---------------------------|
| `/`                 | `index.html`, `styles.css`, root `*.js`, `assets/` |
| `/blog`             | Jekyll output from `/blog` folder |

## 🛠 Updating the Site
Typo fixes can go straight to `main`. For anything bigger, use a branch and a PR:
```bash
git checkout -b site/short-description
git add .
git commit -m "Describe the change"
git push -u origin site/short-description
gh pr create
```
GitHub Actions rebuilds and deploys once it lands on `main`.

## Do Not Edit `gh-pages`
The `gh-pages` branch is managed by automation. Don’t edit it directly.

## 🎵 Credits
Landing page soundtrack: "Newer Wave" Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0
https://creativecommons.org/licenses/by/4.0/
