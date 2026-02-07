---
title: "Hello World: Building This Blog"
date: 2026-02-01 10:00:00 -0500
categories: [Blogging, Meta]
tags: [jekyll, github-pages, chirpy]
authors: [stengel, claude]
description: How this blog is built and deployed - Jekyll, Chirpy, GitHub Pages, and a simple workflow.
pin: true
---

Every blog needs an obligatory first post about itself. This is that post.

## The Stack

The site runs on a pretty straightforward setup:

| Layer | Tool |
|-------|------|
| Static site generator | [Jekyll](https://jekyllrb.com/) |
| Theme | [Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |
| Writing | Markdown + VS Code |

The Chirpy theme does a lot of heavy lifting: dark mode, table of contents, syntax highlighting, categories, tags, and search all work out of the box.

## Site Structure

The repo has a slightly unconventional layout. The root serves a custom landing page, and the blog lives in a `/blog` subdirectory:
```
.
├── index.html         # Landing page at /
├── styles.css         # Landing page styles
├── assets/            # Shared assets
├── blog/              # Jekyll blog at /blog
│   ├── _config.yml
│   ├── _posts/
│   └── ...
└── .github/workflows/deploy.yml
```
{: .nolineno }

This means [gregstengel.com](https://gregstengel.com) shows a simple homepage, and [gregstengel.com/blog](https://gregstengel.com/blog) is where the writing lives.

## The Pagination Problem

This subdirectory setup broke Chirpy's default home page. Posts appeared in archives, categories, and tags, but the main blog index was empty except for a ghost card that went nowhere.

The culprit: Jekyll's `jekyll-paginate` plugin doesn't play well with subdirectories. The home layout relies on `paginator.posts` which returned malformed data in this setup.

The fix was simple - replace the pagination logic in `_layouts/home.html`{: .filepath} with a direct loop through `site.posts`:
```liquid
{% raw %}{% assign pinned = site.posts | where: 'pin', 'true' %}
{% assign normal = site.posts | where_exp: 'item', 'item.pin != true and item.hidden != true' %}

{% for post in pinned %}
  <!-- render post card -->
{% endfor %}

{% for post in normal %}
  <!-- render post card -->
{% endfor %}{% endraw %}
```
{: .nolineno }

No pagination means all posts render on one page. That's fine for now - I can revisit when I have enough posts to need multiple pages.

## The Workflow

The publishing process is about as simple as it gets:

1. Write a post in `blog/_posts/`{: .filepath}
2. Commit and push to `main`
3. GitHub Actions builds the site and deploys to `gh-pages`

No local Jekyll environment needed for quick posts. For previewing, I can spin up Jekyll locally, but most of the time I just push and let the automation handle it.
```bash
git add .
git commit -m "New post: whatever"
git push origin main
```
{: .nolineno }

A minute later, it's live.

## What to Expect

This blog will mostly cover homelab projects, cloud architecture (AWS primarily, some GCP and Azure), automation, and whatever else I'm tinkering with. Some posts will be polished, some will be quick notes for future-me.

A number of posts here are co-written with Claude. When that's the case, I'll note it in the authorship. It's a useful forcing function for documenting what I'm actually doing as I'm doing it.

Let's see where this goes.

---

*This post was co-written with Claude, who also happens to be helping me set up the AI assistant that will be the subject of the next several posts.*
