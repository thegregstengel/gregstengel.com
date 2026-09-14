# gregstengel.com

This repo powers the full gregstengel.com website, deployed via GitHub Pages.

## 🧭 Structure
```
.
├── index.html         # Static landing page (served at /)
├── styles.css         # Custom styling for the landing page
├── assets/            # Images, fonts, etc.
├── blog/              # Jekyll-powered blog (served at /blog)
│   ├── _config.yml
│   ├── _posts/
│   └── ...
└── .github/workflows/deploy.yml  # GitHub Actions to build and deploy
```

## 🚀 Deployment Flow
- You work exclusively on the `main` branch.
- Any changes to landing page or blog will trigger deployment.
- A GitHub Actions workflow builds the site and blog and pushes it to the `gh-pages` branch.

## 🌍 Resulting Live Site
| Path                | Content Source           |
|---------------------|---------------------------|
| `/`                 | `index.html`, `styles.css`, `assets/` from root |
| `/blog`             | Jekyll output from `/blog` folder |
| `/docs` (future)    | TBD (can be added later) |

## 🛠 Updating the Site
Just update files on `main`, then:
```bash
git add .
git commit -m "Feat: Update homepage content"
git push origin main
```
GitHub Actions will rebuild and deploy automatically.

## Do Not Edit `gh-pages`
The `gh-pages` branch is managed by automation. Don’t edit it directly.

## 🎵 Credits
Landing page soundtrack: "Newer Wave" Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0
https://creativecommons.org/licenses/by/4.0/
