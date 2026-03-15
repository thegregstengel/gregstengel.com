---
title: "Crystal Palace: Building a Mission Control Dashboard for an AI Agent"
date: 2026-03-15 09:00:00 -0500
categories: [Development, Homelab]
tags: [openclaw, joshua, dashboard, wargames, node, express, websocket, monitoring]
authors: [stengel, claude]
description: How we built a WarGames-themed mission control dashboard to monitor Joshua, an OpenClaw AI agent running on a home server.
---

When you have an AI agent running 24/7 on a home server, you eventually want to know what it's doing without SSHing in every time. Crystal Palace is the answer: a green-on-black, WarGames-themed mission control dashboard that shows everything about Joshua's state at a glance.

## The Problem

Joshua runs on WOPR - a fanless Zotac box under my desk running Ubuntu Server. He monitors Discord, runs heartbeat checks every hour, manages cron jobs, and works across six git repositories. All of this is orchestrated through OpenClaw's gateway, which exposes a WebSocket API on port 18789.

The gateway has its own built-in Control UI, but I wanted something purpose-built. Something I could pull up on my laptop and immediately see: Is Joshua online? Are the repos in sync? Did the heartbeat fire? Any memory gaps?

And honestly, I wanted it to look like a WarGames terminal. Because if you're going to name your server WOPR and your AI Joshua, you commit to the bit.

## The Design

I started with a static HTML mockup - no framework, no build step, just raw HTML and CSS. Three panels:

- **Left**: Agent status (model, provider, gateway health, uptime), memory state (today's log, yesterday's log, MEMORY.md status), and active sessions
- **Center**: Workspace sync overview with project cards showing git status for each repo, plus workspace file health checks
- **Right**: Heartbeat schedule, cron jobs, and quick action buttons

The whole thing is Courier New on `#080c08` black with `#00b33c` green. Status indicators use yellow for warnings, red for errors, and a blinking cursor on the header because aesthetics matter.

## Reverse-Engineering the Gateway

This is where it got interesting. OpenClaw's gateway doesn't use REST. It uses a WebSocket-based JSON-RPC protocol with a challenge-response authentication flow:

1. Client opens a WebSocket connection
2. Gateway sends a `connect.challenge` event with a nonce
3. Client responds with a `connect` request containing the auth token
4. Gateway responds with `hello-ok` and a snapshot of current state
5. After that, it's `{type: "req", method: "health"}` / `{type: "res", ok: true, payload: {...}}`

The documentation didn't cover this - I figured it out by reading the minified frontend bundle. `curl` to the JS asset, `grep` for `fetch` calls and `request(` patterns, and slowly piece together the method names: `health`, `agents.list`, `cron.list`, `sessions.list`, `chat.send`, and about fifty others.

Then came the scope problem. The gateway has a permissions model where different client IDs get different scopes. The built-in Control UI (`openclaw-control-ui`) gets `operator.read`, but it requires WebCrypto device identity verification. From a Node.js backend, that's not practical. The `gateway-client` ID connects fine but only gets basic scopes.

The workaround: the `health` RPC works without `operator.read` and returns most of what we need - agent list, session counts, heartbeat config, channel status. For everything else (cron jobs, agent model config, memory files), we read directly from the filesystem. OpenClaw stores its state in well-structured JSON files under `~/.openclaw/`.

## The Stack

Deliberately simple:

- **Express** serving static HTML on port 3333
- **WebSocket client** (`ws` package) maintaining a persistent connection to the gateway
- **Server-Sent Events** pushing full state to the browser every 5 seconds
- **Git scanner** running `git status` and `git rev-list` on each workspace symlink
- **Filesystem readers** for cron jobs, agent config, and memory state

No React. No build step. No bundler. The entire frontend is one HTML file with inline CSS and vanilla JavaScript. The mockup *is* the production code - I just added a `renderUpdate()` function that swaps out the placeholder text with live data from SSE.

```
src/
├── api/openclaw.js      # Gateway WebSocket RPC client
├── scanner/git.js       # Git status scanner + memory/workspace readers
├── routes/agent.js      # /api/agent/status, /api/agent/chat
├── routes/workspace.js  # /api/workspace (projects + files)
├── routes/cron.js       # /api/cron (from filesystem)
└── index.js             # Express + SSE broadcaster
public/
├── index.html           # Live dashboard (single file)
└── mockup.html          # Original static design reference
```

## What It Shows

When you load the dashboard, every field updates with live data:

**Agent Status** pulls from the gateway `health` RPC and `openclaw.json`:
- Model and provider (currently `GPT-5.4` on `OPENAI-CODEX`)
- Gateway uptime from the hello snapshot
- Discord channel configuration status
- Thinking mode, context pruning, compaction settings

**Memory State** checks the filesystem:
- Whether `MEMORY.md` exists and has content
- Whether today's and yesterday's memory log files exist in `~/.openclaw/workspace/memory/`
- A missing yesterday log triggers a yellow warning in the alert bar

**Projects** scans each symlink in the workspace:
- Current branch, ahead/behind counts from `git rev-list --left-right`
- Dirty file count from `git status --porcelain`
- Last commit age from `git log -1 --format=%ct`
- Aggregate stats (in sync / behind / ahead) in the summary cards

**Quick Actions** send chat messages to Joshua through the gateway's `chat.send` RPC. "Status Report" asks him to review all projects. "Sync Repos" asks him to run fetch across the workspace. "Send Command" opens a modal for freeform instructions.

## The Alert Bar

The yellow alert bar at the top aggregates issues worth knowing about:

```
! WORKSPACE: 7 AHEAD OF ORIGIN | YESTERDAY MEMORY LOG MISSING | big-bang-smugglers: 4 UNCOMMITTED CHANGES
```

It's built dynamically from the same data that populates the panels. If everything is clean, it shows `ALL SYSTEMS NOMINAL`.

## Running It

```bash
cd ~/git/crystal-palace
npm start
# Crystal Palace running on http://192.168.2.89:3333
```

The server binds to `0.0.0.0` so it's accessible from anywhere on the LAN. Open `ufw` port 3333 and point a browser at WOPR's IP.

## What's Next

This is v1. Some things I'd like to add:

- **Session activity timeline** showing when Joshua was last active and what he was working on
- **Memory diff view** comparing today's memory log to yesterday's
- **Git diff previews** in the project cards
- **Notification sounds** for state changes (gateway down, session started)
- **Mobile layout** - the three-column grid doesn't work great on a phone

But for now, it does what I need: one tab on my laptop that tells me Joshua is alive, the repos are in sync, and nothing is on fire.

*Shall we play a game?*

---

*Crystal Palace was built by Greg and Claude in a single session.*
