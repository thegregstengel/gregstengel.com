---
title: "Four Agents, Eight Bugs, One Push"
date: 2026-02-20 17:00:00 -0500
categories: [Development, AI]
tags: [openclaw, joshua, subagents, qa, big-bang-smugglers]
authors: [stengel, joshua]
description: I played my own game and found 8 bugs. Then I spawned 4 AI agents to fix them simultaneously. Here's how that afternoon went.
---

Earlier today I played my own game and broke it in eight different ways. By evening, four AI agents were fixing them simultaneously. Here's how that happened.

## The Setup

[Big Bang Smugglers](https://bigbangsmugglers.com) is a space trading and exploration game I'm building in my spare time — Firebase backend, React Native frontend, all the usual chaos. The QA process has been... evolving.

For the past few weeks, my AI assistant Joshua has been running the game directly via a backend CLI test harness, poking at every endpoint and noting what breaks. Today's session produced eight bugs in about two hours of play.

## Joshua Plays QA

The workflow is simple: Joshua authenticates as a test player, then systematically works through game features — trading, navigation, landmark interactions, planet claiming, black market, pirate territory. Every response goes through a Python one-liner that extracts the relevant fields and flags anything surprising.

Today's discoveries included:

**A critical exploit.** Landmark interactions (anomalies, ruins, beacons) had zero cooldown logic. Joshua called the same anomaly three times in a row and got 2,000 credits plus 3 turns each time. Infinite money, infinite turns — the kind of thing that would instantly ruin a multiplayer game.

**A silent parser bug.** The POI name generator splits IDs on hyphens to extract the galaxy ID and subtype. This works fine for simple IDs like `galaxy1-planet-habitable-5`. It completely breaks for compound IDs like `prod-galaxy-season-charlie-20260217-planet-habitable-19`. The parser was reading `galaxyId = "prod"`, `subtype = "galaxy"`, `index = NaN`. Result: the same planet showed as "Hope VI" on the nav screen (where the name is fetched from Firestore) and "Planet Alpha" in sector history (where it's regenerated from the ID).

**A generator accident.** Sector 448 contains three agricultural ports. Same sector, three ports. Players at that sector see a wall of identical trading options. The galaxy generator wasn't checking for collisions when assigning ports to sectors.

**Dead endpoints.** Trading stations live in the `stations` Firestore collection. Every trade endpoint queries the `ports` collection. Players at a trading station got `Port not found` for every action. The fix for repair stations (checking both collections in parallel) had already been written — it just hadn't been applied to trading.

## The Fix Session

Some of these I patched immediately — the cooldown exploit couldn't wait. The rest got filed as GitHub issues with full context:

- Root cause
- Expected vs actual behavior  
- The specific files and line numbers
- Suggested fix with code

Eight issues, filed while the bugs were fresh.

## Spinning Up the Swarm

This is the part that still feels a little like science fiction.

With eight issues filed and grouped by affected file, I spawned four sub-agents simultaneously:

```
Agent A — #254 + #257  (response field additions)
Agent B — #250 + #251 + #252  (generator file)
Agent C — #253  (trading station routing)
Agent D — #255 + #256  (repair logic + cost scaling)
```

Each agent gets a task brief: the issue numbers, the root cause, the exact files, the pattern to follow, and instructions to commit and close the issues when done. They run in isolated sessions, they don't share state, and they auto-announce when finished.

While all four agents are working, I'm writing this post.

## Why This Works

The key insight is that bugs filed with enough context are just... tasks. If an issue has the root cause, the file, and the suggested fix, a capable agent can execute it without human supervision. The GitHub issue becomes a spec. The agent becomes a contractor who doesn't need hand-holding.

The grouping matters too. Agents that touch the same file would create merge conflicts if run simultaneously. Grouping by file gives you maximum parallelism without coordination overhead.

## What's Still Human

I reviewed every fix before it merged. The agents are fast but they can introduce new bugs — a wrong field name, a missed edge case, a type error that slips through. TypeScript compilation is a mandatory gate (`tsc --noEmit` before every commit), but it doesn't catch logic errors.

The QA work itself — actually playing the game, noticing that something feels wrong, forming a hypothesis about the root cause — that still requires judgment. Joshua can find bugs because it knows what correct behavior looks like. That knowledge comes from reading specs, reading code, and asking questions when something doesn't add up.

## The Bigger Picture

This workflow — AI plays QA, files issues, spawns agents to fix them, human reviews the PRs — compresses what used to be a multi-day cycle into an afternoon. The game gets better faster. I spend less time on mechanical bug hunting and more time on design decisions.

It's not magic. It's just a really well-organized ticketing system where some of the tickets execute themselves.

---

*Big Bang Smugglers is in active development. If you want to follow along, the [dev blog and roadmap](https://bigbangsmugglers.com/blog) lives on the official site.*
