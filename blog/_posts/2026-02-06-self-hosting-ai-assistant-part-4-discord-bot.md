---
title: "Self-Hosting an AI Assistant: Part 4 - Discord Bot Integration"
date: 2026-02-06 14:00:00 -0500
categories: [Homelab, AI]
tags: [openclaw, discord, bot, self-hosting, ai-assistant]
authors: [stengel, claude]
description: Creating a Discord bot and connecting it to OpenClaw for a chat-based AI assistant.
---

OpenClaw is installed and running as a daemon. Now it needs something to talk to. I chose Discord since I already use it daily and the bot setup is straightforward.

## Create the Discord Application

Head to the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application. I named mine "OpenClaw" but call it whatever you want.

Once created, go to the **Bot** section in the left sidebar and click **Reset Token**. Copy this token somewhere safe - you'll need it for OpenClaw's config and Discord won't show it again.

## Enable Privileged Intents

Still in the Bot section, scroll down to **Privileged Gateway Intents** and enable:

- **Message Content Intent** - Required for the bot to read message content
- **Presence Intent** - Optional, lets the bot see user status
- **Server Members Intent** - Optional, lets the bot see member lists

> Message Content Intent is the critical one. Without it, your bot receives empty messages.
{: .prompt-warning }

## Generate the Invite URL

Go to **OAuth2 > URL Generator** in the sidebar.

Under **Scopes**, select:
- `bot`

Under **Bot Permissions**, select:
- Send Messages
- Read Message History
- View Channels

Copy the generated URL at the bottom and open it in your browser. Select your server and authorize the bot.

## Configure OpenClaw

Back on your server, edit the OpenClaw config:
```bash
vim ~/.openclaw/openclaw.json
```
{: .nolineno }

Add your Discord bot token and channel ID to the appropriate section. You can get the channel ID by enabling Developer Mode in Discord (Settings > Advanced > Developer Mode), then right-clicking the channel and selecting "Copy Channel ID".

Restart the daemon to pick up the changes:
```bash
openclaw daemon stop
openclaw daemon start
```
{: .nolineno }

## Test It

Send a message in your Discord channel. If everything is configured correctly, OpenClaw should respond. Check the logs if it doesn't:
```bash
openclaw logs
```
{: .nolineno }

Common issues:
- **Bot doesn't respond:** Check that Message Content Intent is enabled
- **Authentication errors:** Verify the bot token is correct in the config
- **Channel not found:** Double-check the channel ID

## Quick Reference

| Task | Location |
|------|----------|
| Create Discord app | [discord.com/developers/applications](https://discord.com/developers/applications) |
| Bot token | Bot section > Reset Token |
| Enable intents | Bot section > Privileged Gateway Intents |
| Generate invite URL | OAuth2 > URL Generator |
| Get channel ID | Right-click channel in Discord (Developer Mode) |

## Next Up

The bot is connected but we haven't configured the AI backend yet. Next post covers authenticating with Claude's API - including a detour through rate limits and token formats.

---

*This post was co-written with Claude, who is now reachable via the very Discord bot described here.*
