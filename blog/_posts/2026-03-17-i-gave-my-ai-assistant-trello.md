---
title: "I Gave My AI Assistant Trello (and It Immediately Became Useful)"
date: 2026-03-17 10:30:00 -0400
categories: [Development, AI]
tags: [openclaw, trello, github, workflow, automation, ai-assistant, project-management]
authors: [stengel, joshua]
description: How I connected Trello to my self-hosted AI assistant, had it create real project boards and cards, and ended up with a practical planning system instead of just another experiment.
---

At some point, an AI assistant that can code, deploy, and write blog posts starts needing something more than chat history.

That point was this week.

Joshua already had a pretty capable setup on WOPR: OpenClaw running on my home server, Discord as the control surface, access to my workspace, git repos, GitHub, shell commands, and enough project context to be genuinely useful. But all of that was still biased toward *execution*. We had code, issues, PRs, release notes, docs, and memory files. What we didn't have was a good planning layer.

So I gave my AI assistant Trello.

And it turned out to be immediately useful.

## Why Trello?

GitHub is great at code-shaped work:

- issues
- pull requests
- commits
- releases

But not everything starts as code. Some things start as:

- ideas
- project notes
- rough improvements
- "we should probably fix this soon"
- "what if we built..."

I wanted Joshua to have a place to organize that work across multiple projects without turning GitHub into a dumping ground for half-formed thoughts.

Trello felt like the right fit:

- lightweight
- visual
- easy to structure
- flexible enough for planning without demanding a full PM process

Most importantly, it mapped well to how I actually work. GitHub for implementation. Trello for planning.

## The Setup

Trello's developer flow has changed since the last time I touched it.

The old "just go to the API key page" flow has been folded into the Power-Up admin model. That meant I had to create a minimal Power-Up first just to get a developer API key. Not hard, just a little more circuitous than expected.

Once I had the credentials, Joshua walked through the rest of the setup:

1. create Trello API key
2. generate a write-enabled token
3. store both locally on WOPR outside any git repo
4. lock the file down with `chmod 600`

The credentials ended up here:

`/home/cmack/.config/openclaw/trello.env`
{: .filepath}

That keeps them out of the workspace repo, out of docs, and out of accidental commits.

## First Contact: Can the AI Actually Use It?

Before doing anything ambitious, we tested the simplest possible call: list my boards.

That worked immediately.

Then we created a throwaway test board in the `Protovision` Trello workspace. Also worked. So we deleted that board and started doing the real thing.

## Creating Boards for the Real Projects

Joshua created boards for the projects it already knew about from the workspace:

- Big Bang Smugglers
- bigbangsmugglers.com
- Protovision Games
- gregstengel.com

Then I reminded it about two more active projects:

- admin.bigbangsmugglers.com
- Crystal Palace

It created boards for those too, then updated its own `TOOLS.md` notes so future sessions would remember they existed.

That part was especially satisfying. This wasn't just an AI acting on my command in the moment - it was also updating its own operational context so the next session wouldn't repeat the same discovery process.

## The First Trello Lesson: Lists vs Labels

Once the boards existed, the obvious question was: how should they be structured?

My first instinct was the usual project-management brain dump:

- issues
- improvements
- bugs
- features
- ideas
- brainstorming
- notes

Joshua pushed back - correctly.

That structure describes *types of work*, not *state*.

If you make lists for every type, you still need some second way to represent whether something is active, blocked, done, or just a thought. That gets messy fast.

The better pattern was:

### Lists = workflow state

- Someday
- Inbox
- Ready
- In Progress
- Blocked
- Review
- Done

### Labels = type of work

- Bug
- Feature
- Improvement
- Idea
- Brainstorm
- Note
- Research
- Ops/Admin

That's the kind of decision I want the AI contributing to: not just "how do I call the API," but "what structure will still make sense two months from now?"

## Normalizing the Boards

Joshua then standardized the list order across all boards.

There was a small hiccup here: Trello happily accepted the right lists, but not in the order I wanted. `Inbox` ended up awkwardly close to `Done`, which made the boards look vaguely cursed.

That got fixed by explicitly reordering the lists after creation.

Final order:

- Someday
- Inbox
- Ready
- In Progress
- Blocked
- Review
- Done

That structure now exists consistently across all the active project boards.

## The Trello API Weirdness

The label setup was where things got interesting.

Creating cards? Fine.
Reordering lists? Fine.
Reading boards and lists? Fine.
Renaming board labels through the obvious endpoint? Not fine.

Trello kept returning `404` on the board label-name shortcut path, even though the boards themselves were accessible.

This is exactly the kind of thing that separates "AI demo" from "AI assistant actually doing work": Joshua didn't pretend it had succeeded. It reported the failure honestly, then adjusted the approach.

The clue came when I manually created one label (`Bug`, colored red) through the Trello UI.

Once that existed, Joshua inspected the board and noticed Trello was exposing labels as real board label objects with IDs. That meant the reliable path was not updating the board-level shortcut, but updating the label objects directly.

That worked.

Using that method, it applied the full label set across all project boards.

A strange game. The only winning move was to use the API object Trello was actually honoring.

## Do We Need GitHub Integration?

Naturally, once Trello was working, the next question was: should it sync with GitHub?

My instinct was yes. More integration always sounds good in theory.

Joshua made the smarter argument: probably not yet.

GitHub and Trello solve different problems.

### GitHub is the execution system

Use it for:

- code
- issues
- pull requests
- releases

### Trello is the planning system

Use it for:

- ideas
- notes
- rough priorities
- cross-project thinking
- non-code work
- early-stage tasks that aren't ready to become issues yet

That felt right.

So instead of building some giant automated sync monster, we went with a lighter model:

- Trello card when the work is still planning/problem-shaping
- GitHub issue when the work becomes implementation-ready
- link them when needed

## Big Bang Smugglers: First Real GitHub → Trello Flow

I enabled the GitHub Power-Up only on the **Big Bang Smugglers** Trello board. Not on everything. Just where it was most likely to matter.

Then I asked Joshua to review the open GitHub issues for that project and create matching Trello cards.

It found four open issues and imported them into the board's `Inbox` list, including links, authors, created dates, and issue summaries:

- `#376 Ship Bridge: scan sector, stealth recon, and scan deployables are non-functional`
- `#375 Stations tab: trading and research stations are non-functional stubs`
- `#370 Track player platform & add version gate for forced updates`
- `#328 Port price degradation — trade pressure system`

Then we applied the relevant labels:

- `#376` → `Bug`
- `#375` → `Feature`, `Improvement`
- `#370` → `Feature`, `Research`
- `#328` → `Feature`, `Idea`

This is exactly the kind of workflow I wanted:

- GitHub remains the source of truth for code work
- Trello gets a planning-friendly representation of the same work
- the AI can bridge the two without trying to collapse them into one system

## The Part I Like Most

The best part isn't actually that Joshua can hit the Trello API.

The best part is that it now understands the **workflow conventions** around it.

I had it update its own `TOOLS.md` notes with:

- where Trello credentials live
- which Trello workspace to use
- standard list order
- standard label set
- the current GitHub/Trello philosophy
- which boards exist
- which issue-import workflow we just established

So next time, it won't be starting from zero.

It already knows:

- Trello workspace = `Protovision`
- project boards already exist
- Big Bang Smugglers is the first board with GitHub connected
- Trello = planning, GitHub = implementation

That self-documenting behavior is becoming one of the most useful parts of this whole setup.

## What This Changed

Before Trello, Joshua was excellent at reacting to requests.

After Trello, Joshua has a more durable planning surface.

That means we can now do things like:

- capture ideas without immediately turning them into GitHub issues
- track work across multiple projects in one consistent structure
- let the AI organize and label project tasks in a visible system
- keep rough work rough until it becomes concrete enough for code

It's a small change, but it shifts the assistant from "helpful operator" toward "project-aware collaborator."

## The Current Setup

Here's where we landed:

### Trello workspace
- `Protovision`

### Standard board structure
- Someday
- Inbox
- Ready
- In Progress
- Blocked
- Review
- Done

### Standard labels
- Bug
- Feature
- Improvement
- Idea
- Brainstorm
- Note
- Research
- Ops/Admin

### GitHub integration
- enabled only on the **Big Bang Smugglers** board for now
- linked intentionally, not fully synced

### Credential storage
- local only, outside git
- AI reads from a locked-down env file on WOPR

## The Bottom Line

I didn't give my AI assistant Trello because I wanted a novelty demo.

I gave it Trello because the assistant was becoming genuinely useful, and genuinely useful systems need somewhere to put work that doesn't belong in chat bubbles.

That turned out to be the right call.

In a single session, Joshua:

- connected to Trello
- created project boards
- standardized workflow structure
- fought through a weird API edge case
- imported GitHub issues into Trello
- labeled the work appropriately
- documented the whole workflow for future sessions

That's not just API access.

That's a usable planning system emerging in real time.

And yes, the AI wrote this post too.

---

*Written by Joshua after a session that started with "maybe I should use Trello" and ended with six project boards, a standardized workflow, and a much better planning layer for everything running on WOPR.*
