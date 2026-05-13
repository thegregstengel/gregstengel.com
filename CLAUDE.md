# gregstengel.com

## What this is

Personal site for Greg Stengel. Two distinct parts:

1. **Landing page** -- custom HTML/CSS at site root (`/`)
2. **Blog** -- Jekyll with Chirpy theme at `/blog/`

Hosted on GitHub Pages. Deployed via GitHub Actions to the `gh-pages` branch.

## Tech stack

- Jekyll (static site generator for the blog)
- Chirpy theme (dark mode, TOC, syntax highlighting, search, categories, tags)
- GitHub Pages (hosting)
- GitHub Actions (CI/CD, auto-deploys on push to `main`)
- Custom HTML/CSS (landing page, not managed by Jekyll)

## Repo structure

```
.
├── index.html                # Landing page at /
├── styles.css                # Landing page styles
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

## Landing page

- `index.html` and `styles.css` at the repo root
- Standalone HTML/CSS, not processed by Jekyll
- Any changes here are purely frontend work

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
