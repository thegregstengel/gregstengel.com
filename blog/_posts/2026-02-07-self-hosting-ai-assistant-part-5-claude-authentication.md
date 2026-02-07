---
title: "Self-Hosting an AI Assistant: Part 5 - Claude Authentication"
date: 2026-02-07 10:00:00 -0500
categories: [Homelab, AI]
tags: [openclaw, claude, anthropic, api, oauth, self-hosting]
authors: [stengel, claude]
description: Giving Joshua a brain - connecting OpenClaw to Claude's API through OAuth token discovery.
---

Joshua can hear me through Discord, but he's been running headless on WOPR - no AI backend connected. Time to give him a brain. I wanted to use Claude, specifically through my Claude Max subscription rather than paying per-token on the API. This turned into a minor adventure.

## Attempt 1: API Key

The straightforward approach - grab an API key from the [Anthropic Console](https://console.anthropic.com/) and add it to OpenClaw's auth config:
```bash
vim ~/.openclaw/agents/main/agent/auth-profiles.json
```
{: .nolineno }
```json
{
  "version": 1,
  "profiles": {
    "anthropic:default": {
      "type": "api_key",
      "provider": "anthropic",
      "apiKey": "sk-ant-api03-your-key-here"
    }
  }
}
```
{: file="~/.openclaw/agents/main/agent/auth-profiles.json" }

This worked - Joshua came alive. But I quickly hit rate limits. Claude Opus 4.5 on the API has a 30k input token limit per minute, which an autonomous agent can burn through surprisingly fast. Joshua was getting throttled mid-conversation. "A strange game," indeed.

## Attempt 2: Setup Token

OpenClaw supports authenticating via Claude Code's setup-token feature, which theoretically lets you use your Claude Max subscription instead of API credits.

On my workstation (WSL), I installed Claude Code and generated a token:
```bash
npm install -g @anthropic-ai/claude-code
claude setup-token
```
{: .nolineno }

This opens a browser for OAuth, then outputs a token. I pasted it into OpenClaw:
```bash
openclaw models auth paste-token --provider anthropic
```
{: .nolineno }

Error: `Expected token starting with sk-ant-oat01-`

The token Claude Code generated didn't match the format OpenClaw expected. Joshua remained brainless.

## The Solution: OAuth Access Token

After some digging, I found that Claude Code stores its actual OAuth credentials in `~/.claude/credentials.json`. Inside that file is an `access_token` field that starts with `sk-ant-oat01-` - exactly what OpenClaw wants.

On my workstation:
```bash
cat ~/.claude/credentials.json
```
{: .nolineno }

Copy the `access_token` value (the entire string starting with `sk-ant-oat01-`), then on WOPR:
```bash
openclaw models auth paste-token --provider anthropic
```
{: .nolineno }

Paste the token. Restart the daemon:
```bash
openclaw daemon stop
openclaw daemon start
```
{: .nolineno }

Test in Discord - Joshua responds. No more rate limits since he's using the Max subscription. He's alive.

"Greetings, Professor Falken."

## Token Refresh

One caveat: OAuth access tokens expire. When Joshua stops responding, grab a fresh token from `~/.claude/credentials.json` on your workstation (after using Claude Code to refresh it) and paste it again.

This is a bit manual, but workable for now. A proper solution would involve automating the token refresh, but that's a project for another day.

## Quick Reference

| Auth Method | Token Format | Source |
|-------------|--------------|--------|
| API Key | `sk-ant-api03-...` | Anthropic Console |
| OAuth Token | `sk-ant-oat01-...` | `~/.claude/credentials.json` |
| Setup Token | Various | Claude Code (not compatible) |

## Joshua Lives

At this point, the full setup is running:

- **Hardware:** Zotac CI323 Nano (fanless, always-on) - codename WOPR
- **OS:** Ubuntu Server 24.04 LTS (HWE kernel)
- **Security:** SSH key auth, UFW firewall, unattended upgrades
- **Runtime:** Node.js 22, OpenClaw daemon
- **Interface:** Discord bot
- **AI Backend:** Claude Opus 4.5 via Max subscription
- **Name:** Joshua

I can now chat with Joshua through Discord anytime. He's got Claude's brain, runs 24/7 on a silent mini PC in my office, and has the ability to execute tasks, search the web, and run automation.

Not bad for a $150 mini PC. 

---

*This post was co-written with Claude - who, in a somewhat recursive twist, is now also the intelligence behind Joshua. The only winning move is to keep playing.*
