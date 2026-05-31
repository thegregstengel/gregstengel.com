# gregstengel.com

## What this is

Personal site for Greg Stengel. Two distinct parts:

1. **Landing page** -- custom HTML/CSS/JS at site root (`/`), the "Nightshift" design
2. **Blog** -- Jekyll with Chirpy theme at `/blog/`

Hosted on GitHub Pages. Deployed via GitHub Actions to the `gh-pages` branch.

## Tech stack

- Jekyll (static site generator for the blog)
- Chirpy theme (dark mode, TOC, syntax highlighting, search, categories, tags)
- GitHub Pages (hosting)
- GitHub Actions (CI/CD, auto-deploys on push to `main`)
- Custom HTML/CSS/JS (landing page, not managed by Jekyll; vanilla, no build step)

## Repo structure

```
.
├── index.html                # Landing page at / ("Nightshift")
├── styles.css                # Landing page styles
├── site.js                   # Landing page JS (theme toggle, scroll reveal, console)
├── assets/                   # Shared assets
├── blog/                     # Jekyll blog at /blog
│   ├── _config.yml           # Jekyll and Chirpy configuration
│   ├── _posts/               # Blog posts (markdown)
│   ├── _layouts/             # Layout overrides (custom home.html for pagination fix)
│   ├── Gemfile               # Ruby dependencies (uses gemspec)
│   └── ...
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions deployment workflow
└── CLAUDE.md                 # This file
```

## Landing page ("Nightshift")

- `index.html`, `styles.css`, and `site.js` at the repo root
- Standalone HTML/CSS/JS, not processed by Jekyll; vanilla, no build step
- Any changes here are purely frontend work

### Design

- A dark, warm, long-form "standing document" / anti-resume -- not a one-screen
  splash. Reads as an operator's workshop at night.
- **Dark by default**, single warm-orange accent. A `data-theme` attribute on
  `<html>` (`dark` | `light`) drives the palette; both themes are full token sets
  in `styles.css`.
- **Type:** Inter Tight (display/body) + JetBrains Mono (labels/console), loaded
  from Google Fonts.
- **Background:** a single slowly-drifting warm radial glow plus faint film
  grain (`.atmosphere`). No floating logos.

### Structure

- **Topbar:** "Shipping" status dot, `Rev. 2026.05`, and a theme toggle button.
- **Hero:** eyebrow ("A standing document · Palm City, FL"), the name, a tagline,
  and a "Read on" scroll cue.
- **Chapters:** numbered sections that scroll-reveal into view -- `01 Now`,
  `02 Field`, `03 Kit` (Kit is a card grid of the current tool rotation).
- **Footer:** "Find me" reach links (email, GitHub, LinkedIn, X, Instagram,
  `/blog/`) plus a doc-history line.

### Behavior (`site.js`)

- **Theme toggle:** dark default, persisted in `localStorage` (`gs-theme`);
  honors an explicit OS `prefers-color-scheme: light` on first visit.
- **Scroll reveal:** chapters fade in via `IntersectionObserver` (falls back to
  visible if unsupported).
- **Hidden `/whoami` console:** press <kbd>?</kbd> to open a typed terminal
  easter egg, <kbd>Esc</kbd> (or click-outside) to close. It's a `role="dialog"`
  modal; copy lives in the `SESSION` array in `site.js`.

### Editing notes

- The landing page voice is first-person, dry, anti-resume ("Resumes are CSVs of
  obligations"). Match it when touching copy.
- The hero name carries a `data-tooltip="Shall we play a game?"`; the console and
  several lines lean on the same WarGames/operator register -- keep that in mind
  before "fixing" them.
- Bump the `Rev. YYYY.MM` in the topbar and the `Doc history` line in the footer
  when the page changes meaningfully.

## Blog

### Post format

Filename: `blog/_posts/YYYY-MM-DD-title-slug.md`

Front matter (all fields required):

```yaml
---
title: "Your Title Here"
date: YYYY-MM-DD HH:MM:SS -0500
categories: [Primary, Secondary]
tags: [lowercase, tags, here]
authors: [stengel, claude]
description: Short description for previews and SEO.
---
```

### Common categories

- `[Blogging, Meta]` -- about the blog itself
- `[Homelab, AI]` -- self-hosting, OpenClaw, Joshua
- `[Homelab, Security]` -- hardening, firewalls, SSH
- `[Cloud, AWS]` -- AWS projects and guides
- `[Cloud, GCP]` -- GCP projects and guides

### Authorship

- Posts co-written with Claude: `authors: [stengel, claude]`
- Posts Greg writes alone: `authors: [stengel]`

### Known quirks

- Blog lives in `/blog/` subdirectory with `baseurl: "/blog"`
- Jekyll pagination (`jekyll-paginate`) does not work correctly in subdirectory setups
- The home layout (`_layouts/home.html`) was patched to loop through `site.posts` directly instead of relying on `paginator.posts`
- Posts with `pin: true` display at the top of the home page

## Conventions

- Do NOT edit the `gh-pages` branch directly (managed by GitHub Actions)
- Tags are always lowercase
- Use descriptive commit messages (e.g., "New post: title here")
- PRs for new posts or big changes; direct push to `main` for typo fixes

## Publishing workflow

1. Write post in `blog/_posts/`
2. Commit and push to `main`
3. GitHub Actions builds and deploys automatically (takes about 1 minute)

For PRs:

```bash
git checkout -b post/title-slug
# write the post
git add .
git commit -m "New post: title here"
git push -u origin post/title-slug
gh pr create --title "New post: title here" --body "Draft for review"
```

## Shared knowledge base (Obsidian vault)

Durable docs for this site live in the shared vault at `~/nas/Obsidian/`:

- `50-Blog/site/profile.md` -- project profile (voice, tone, structure)
- `50-Blog/site/architecture/overview.md` -- architecture & deployment
- `50-Blog/blogs-site-publishing-guide.md` -- publishing playbook

Blog drafts and post ideas can also be staged under `50-Blog/` in the vault
before they land in `blog/_posts/` here.

See `~/nas/Obsidian/CLAUDE.md` for vault rules; use the `doc-writer-obsidian`
skill to publish new docs. The vault is Greg's and Claude's shared long-term
memory across machines.
