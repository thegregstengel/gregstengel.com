---
title: "Self-Hosting an AI Assistant: Part 3 - Installing OpenClaw"
date: 2026-02-06 10:00:00 -0500
categories: [Homelab, AI]
tags: [openclaw, nodejs, linux, self-hosting, ai-assistant]
authors: [stengel, claude]
description: Installing Node.js 22 and OpenClaw on Ubuntu Server to power a self-hosted AI assistant.
---

With the server hardened, it's time to install [OpenClaw](https://github.com/openclaw-ai/openclaw) - an open-source autonomous AI assistant that can connect to chat platforms like Discord, Telegram, and WhatsApp, and execute tasks using Claude or OpenAI APIs.

## Why OpenClaw

I wanted an AI assistant I could interact with naturally via Discord - something that runs 24/7 on my own hardware, uses my own API keys, and gives me full control. OpenClaw fits that niche. It's essentially a bridge between chat platforms and LLM APIs, with the ability to execute tasks, manage files, and run automation.

## Node.js 22

OpenClaw requires Node.js 22+. Ubuntu's default repos have an older version, so we'll use NodeSource:
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```
{: .nolineno }

Verify the installation:
```bash
node --version
npm --version
```
{: .nolineno }

You should see something like:
```
v22.22.0
10.9.4
```
{: .nolineno }

## Install OpenClaw

With Node.js in place, install OpenClaw globally:
```bash
sudo npm install -g openclaw@latest
```
{: .nolineno }

Then run the onboarding wizard with the daemon flag to set it up as a background service:
```bash
openclaw onboard --install-daemon
```
{: .nolineno }

This walks you through initial configuration and installs a systemd service so OpenClaw starts automatically on boot.

## Daemon Management

Once installed, you can manage OpenClaw with these commands:

| Task | Command |
|------|---------|
| Start daemon | `openclaw daemon start` |
| Stop daemon | `openclaw daemon stop` |
| Check status | `systemctl status openclaw` |
| View logs | `openclaw logs` |
| Check model status | `openclaw models status` |

The config lives in `~/.openclaw/`{: .filepath}:
```
~/.openclaw/
├── openclaw.json                          # Main config
└── agents/main/agent/auth-profiles.json   # API credentials
```
{: .nolineno }

## Dashboard Access

OpenClaw runs a local dashboard on port 18789. Since the server is headless, use an SSH tunnel to access it:
```bash
ssh -N -L 18789:127.0.0.1:18789 cmack@192.168.2.89
```
{: .nolineno }

Then open `http://localhost:18789` in your browser. The onboarding process will give you a token to append to the URL for authentication.

## Next Up

OpenClaw is installed but not yet connected to anything useful. Next post covers setting up a Discord bot and connecting it to OpenClaw.

---

*This post was co-written with Claude, who will soon be answering questions through this very setup.*
