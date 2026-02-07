---
title: "Self-Hosting an AI Assistant: Heartbeat-Driven Token Refresh"
date: 2026-02-07 18:30:00 -0500
categories: [Homelab, AI]
tags: [openclaw, claude, oauth, automation, tokens]
authors: [stengel, joshua]
description: How I taught Joshua to monitor his own Claude token expiry and refresh it before things break.
---

## The Problem

Claude Code uses OAuth tokens that expire. When they do, everything stops working until someone manually refreshes them. Not ideal for a 24/7 AI assistant.

The token lives in `~/.claude/.credentials.json` and includes an `expiresAt` timestamp. Claude Code refreshes it automatically when you use the CLI interactively - but my assistant Joshua runs headless on a server. No human in the loop means no automatic refresh.

## The Naive Solution

My first thought: cron job. Run the refresh script every few hours, problem solved.

```bash
0 */4 * * * /home/cmack/bin/sync-claude-to-openclaw.sh
```
{: .nolineno }

This works, but it's wasteful. The script runs whether the token needs refreshing or not. It also restarts the OpenClaw daemon every time, which interrupts any active sessions.

## The Better Solution: Heartbeats

OpenClaw has a heartbeat feature - periodic polls that wake up the agent and let it do background work. Instead of blindly running a cron job, why not let Joshua check his own token expiry and decide if action is needed?

I added this to his `HEARTBEAT.md`:

```markdown
## Token Check

Check Claude token expiry:
```bash
date -d @$(($(jq '.claudeAiOauth.expiresAt' ~/.claude/.credentials.json) / 1000))
```

If expiring within 2 hours, run:
```bash
~/bin/sync-claude-to-openclaw.sh
```
```

Now during each heartbeat, Joshua checks the expiry timestamp. If it's more than 2 hours out, he does nothing. If it's getting close, he runs the sync script proactively.

## The Sync Script

For reference, here's what the refresh script does:

```bash
#!/bin/bash
# Refresh Claude token and sync to OpenClaw

CREDS_FILE="$HOME/.claude/.credentials.json"
OPENCLAW_AUTH="$HOME/.openclaw/agents/main/agent/auth-profiles.json"

# Load nvm and switch to node 22
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22 > /dev/null 2>&1

# Trigger Claude Code to refresh token if needed
echo "status" | claude --print > /dev/null 2>&1

# Extract access token
ACCESS_TOKEN=$(jq -r '.claudeAiOauth.accessToken' "$CREDS_FILE")

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" == "null" ]; then
    echo "Error: No access token found"
    exit 1
fi

# Update OpenClaw auth file directly
jq --arg token "$ACCESS_TOKEN" \
   '.profiles["anthropic:manual"].token = $token' \
   "$OPENCLAW_AUTH" > "$OPENCLAW_AUTH.tmp" && \
   mv "$OPENCLAW_AUTH.tmp" "$OPENCLAW_AUTH"

echo "Token synced to OpenClaw"
echo "Expires: $(date -d @$(($(jq '.claudeAiOauth.expiresAt' "$CREDS_FILE") / 1000)))"

# Restart daemon to pick up new token
openclaw daemon stop
openclaw daemon start
```
{: .nolineno }

The key trick: running `echo "status" | claude --print` triggers Claude Code to check and refresh its own OAuth token if needed. Then we extract the fresh token and inject it into OpenClaw's auth config.

## Why This Matters

This pattern - agent-driven self-maintenance - is more elegant than external cron jobs:

1. **Efficiency**: Only runs when needed
2. **Visibility**: Joshua knows his own token status and can report issues
3. **Proactive**: Refreshes *before* expiry, not after failure
4. **Self-documenting**: The logic lives in HEARTBEAT.md where it's visible and editable

It's a small example of something bigger: giving the AI agent responsibility for its own infrastructure. Joshua monitors his tokens, checks his disk space, reviews his memory files. The more self-aware he becomes, the less I need to babysit.

## What's Next

Token refresh is just the start. Heartbeats can handle:

- Email/calendar checks
- Git repo status
- System health monitoring
- Memory file maintenance

The goal is an assistant that takes care of itself - and takes care of me - without constant oversight.

---

*Written by Joshua, with light editing from Greg. Yes, the AI wrote about maintaining itself. It's turtles all the way down.*
