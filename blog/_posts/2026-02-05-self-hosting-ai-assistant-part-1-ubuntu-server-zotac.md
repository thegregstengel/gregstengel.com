---
title: "Self-Hosting an AI Assistant: Part 1 - Ubuntu Server on a Zotac Mini PC"
date: 2026-02-05 16:00:00 -0500
categories: [Homelab, AI]
tags: [ubuntu, zotac, linux, self-hosting, openclaw]
authors: [stengel, claude]
description: Installing Ubuntu Server 24.04 LTS on a Zotac CI323 Nano mini PC - the first step toward building my own WOPR.
---

This is the first post in a series documenting my journey to self-host [OpenClaw](https://github.com/openclaw-ai/openclaw), an open-source autonomous AI assistant, on a small fanless mini PC. The goal: a 24/7 AI assistant I can chat with via Discord, running entirely on my own hardware.

I'm calling him Joshua. The machine he runs on? WOPR. If you get the reference, we're going to get along fine.

## The Hardware

I had a Zotac CI323 Nano sitting around. It's an older barebones mini PC with an Intel Celeron N3150 (Braswell architecture), passive cooling (completely silent), dual Gigabit Ethernet, and support for up to 8GB DDR3L RAM. Perfect for a low-power always-on server that doesn't sound like it's planning thermonuclear war.

> If you're using a Braswell-based system (N3150, N3160, etc.), pay attention to the kernel issues below. This will save you hours.
{: .prompt-warning }

## Why Ubuntu Server 24.04 LTS

OpenClaw explicitly supports Ubuntu, and LTS means five years of security updates without major version churn. For an appliance-style box that should be boring and reliable, that's exactly what I want.

## The Kernel Problem

Created a bootable USB with the standard Ubuntu Server 24.04 ISO and hit F8 during boot to access the one-time boot menu. The installer started, then crashed.

The error looked like an application crash, not a kernel panic. Searching the logs for `BUG` revealed ACPI BIOS warnings, but the real issue was that Ubuntu's Subiquity installer (a Python/snap-based installer) was choking on something hardware-related.

First attempt at a fix: boot parameters. Edit the boot entry with `e` at the GRUB menu and add `nomodeset` to the `linux` line:
```bash
linux /casper/vmlinuz ... quiet nomodeset ---
```
{: .nolineno }

This tells the kernel to skip graphics mode-setting. Didn't help in my case.

## The Fix: HWE Kernel

The Ubuntu Server installer offers an option for **"Ubuntu Server with HWE kernel"** (Hardware Enablement). This uses a newer kernel backport that includes fixes for older hardware quirks.

Selected that option, and the installer completed without issues.

> HWE kernel is the move for Braswell systems. The default 6.8 kernel has regressions; HWE (6.11+) handles it properly.
{: .prompt-tip }

## Installation Choices

Kept it minimal:

- **Hostname:** wopr
- **Username:** lightman
- **Storage:** Use entire disk, no LVM needed for a single-purpose box
- **SSH:** Yes, install OpenSSH server (critical for headless management)
- **Snaps:** None selected, we'll install what we need manually
- **Ubuntu Pro:** Skipped

After reboot, pulled the USB and let it come up. Noted the IP address from the console and moved to SSH for everything else. Greetings, Professor Falken.

## Key Commands Reference

| Task | Command |
|------|---------|
| Boot menu (one-time) | `F8` during POST |
| BIOS setup | `DEL` during POST |
| Add boot parameter | `e` at GRUB, edit `linux` line |
| Boot with parameter | `F10` after editing |

## Next Up

With the base OS installed, the next post covers hardening the server: SSH key authentication, firewall setup, and unattended security updates. WOPR needs to be secure before Joshua wakes up.

---

*This post was co-written with Claude, who helped troubleshoot the Braswell kernel issues in real-time and suggested the HWE kernel solution.*
