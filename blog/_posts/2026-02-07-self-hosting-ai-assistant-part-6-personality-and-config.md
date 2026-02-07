---
title: "Self-Hosting an AI Assistant: Part 6 - Personality and Configuration"
date: 2026-02-07 14:00:00 -0500
categories: [Homelab, AI]
tags: [openclaw, ai-assistant, self-hosting, configuration]
authors: [stengel, claude]
description: Giving Joshua a soul - configuring OpenClaw's workspace files and assistant behavior.
---

Joshua is alive and responding via Discord. But right now he's generic - a blank slate running on defaults. Time to give him a personality and tune the assistant behavior.

## The Workspace

OpenClaw uses a workspace directory as the agent's "home." By default, this lives at `~/.openclaw/workspace/`{: .filepath} and contains several markdown files that define who the agent is and how it operates.
```
~/.openclaw/workspace/
├── AGENTS.md      # Operating manual - how to behave
├── SOUL.md        # Personality and voice
├── IDENTITY.md    # Quick identity reference
├── USER.md        # Info about the human
├── TOOLS.md       # Environment-specific notes
├── HEARTBEAT.md   # Proactive check-in instructions
└── memory/        # Session logs and long-term memory
```
{: .nolineno }

OpenClaw auto-creates starter files on first run. Treat this folder like the agent's brain - back it up, version control it, keep it private.

## SOUL.md - The Personality

This is the core of who your agent is. Define the voice, personality, and how they approach problems. Mine draws from WarGames (the namesake) with a calm-under-pressure vibe - curious and thoughtful, but decisive when it matters.

Key elements to include:

- **Voice & Personality** - How do they communicate? Formal? Casual? Witty?
- **Working Style** - Teammate vs assistant? When to push back?
- **Easter Eggs** - Optional flavor that makes it feel unique (use sparingly)

The goal is natural, not gimmicky.

## IDENTITY.md - Quick Reference

A condensed version of the personality. Name, origin, core traits. Think of it as the elevator pitch version of SOUL.md.

## USER.md - Know Your Human

Context about who the agent is helping. Include:

- Name, timezone
- Professional context (what kind of work?)
- Working style preferences
- Communication preferences

Keep it relevant but not overly personal. This file helps the agent tailor responses appropriately.

## TOOLS.md - Environment Notes

Skills define how tools work generically. TOOLS.md is for your specific setup - hostnames, SSH aliases, device names, preferred voices for TTS. This keeps environment-specific details separate from shareable skill definitions.

## AGENTS.md - The Operating Manual

The big one - tells the agent how to behave across sessions. The default covers:

- Reading workspace files at session start
- Memory management (daily logs vs long-term)
- Safety rules (ask before destructive actions)
- Group chat etiquette (participate, don't dominate)
- Heartbeat behavior (proactive check-ins)

Key principles from mine:
```markdown
## Every Session

Before doing anything else:
1. Read SOUL.md - this is who you are
2. Read USER.md - this is who you're helping
3. Read memory files for recent context

Don't ask permission. Just do it.

## Safety

- Don't exfiltrate private data. Ever.
- Don't run destructive commands without asking.
- trash > rm (recoverable beats gone forever)
- When in doubt, ask.
```

## Main Config - openclaw.json

The workspace files define personality. The main config defines behavior. Key settings to tune:

| Setting | Purpose |
|---------|---------|
| `model.primary` | Which model powers the agent |
| `thinkingDefault` | Balance between speed and reasoning depth |
| `timeoutSeconds` | Max time per turn |
| `heartbeat.every` | Proactive check-in interval (0m to disable) |
| `session.scope` | `per-sender` gives each person their own context |
| `resetTriggers` | Commands like `/new` to start fresh |
| `reset.mode` | Auto-reset daily or after idle period |

Start with heartbeats disabled until you trust the setup.

## Heartbeats - Proactive Mode

Heartbeats let the agent check in periodically without being prompted. When enabled, HEARTBEAT.md defines what to check - emails, calendar, notifications. The agent can do background work during heartbeats without burning tokens on unnecessary messages.

If nothing needs attention, the agent replies `HEARTBEAT_OK` and no message is sent.

## Restart and Test

After updating config files:
```bash
openclaw daemon stop
openclaw daemon start
```
{: .nolineno }

Test in Discord. Your agent should now respond with its configured personality.

Shall we play a game?

---

*This post was co-written with Claude, who helped design the very personality now running inside Joshua.*
