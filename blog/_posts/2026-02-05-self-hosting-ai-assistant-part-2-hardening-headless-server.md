---
title: "Self-Hosting an AI Assistant: Part 2 - Hardening a Headless Linux Server"
date: 2026-02-05 18:00:00 -0500
categories: [Homelab, Security]
tags: [ubuntu, linux, ssh, security, self-hosting]
authors: [stengel, claude]
description: Basic security hardening for WOPR - SSH keys, firewall, and automatic updates.
---

With Ubuntu Server installed on WOPR, it's time to lock it down before Joshua wakes up. This isn't a comprehensive security guide, but it covers the basics that every internet-adjacent server should have. We don't want any unauthorized players joining this game.

## SSH Key Authentication

Password authentication is fine for initial setup, but keys are more secure and more convenient once configured.

Generate a key pair on your workstation (I'm using WSL):
```bash
ssh-keygen -t ed25519 -C "falken-wsl"
```
{: .nolineno }

Ed25519 is the modern choice - smaller keys, faster operations, no known weaknesses. Accept the default location and set a passphrase if you want an extra layer.

Copy the public key to WOPR:
```bash
ssh-copy-id lightman@192.168.2.89
```
{: .nolineno }

Test that key auth works before disabling passwords:
```bash
ssh lightman@192.168.2.89
```
{: .nolineno }

If you get in without a password prompt, you're good.

## Lock Down SSH

Edit the SSH daemon config:
```bash
sudo vim /etc/ssh/sshd_config
```
{: .nolineno }

Find and set these values:
```
PasswordAuthentication no
PermitRootLogin no
```
{: file="/etc/ssh/sshd_config" }

Restart the service:
```bash
sudo systemctl restart ssh
```
{: .nolineno }

> Test from a new terminal before closing your current session. If you lock yourself out, you'll need physical access to fix it. Unlike the movies, there's no back door.
{: .prompt-warning }

## Firewall

Ubuntu includes `ufw` (Uncomplicated Firewall). Enable it with SSH allowed:
```bash
sudo ufw allow OpenSSH
sudo ufw enable
```
{: .nolineno }

Check status:
```bash
sudo ufw status
```
{: .nolineno }

You should see:
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
OpenSSH (v6)               ALLOW       Anywhere (v6)
```
{: .nolineno }

As you add services later, open ports as needed with `sudo ufw allow <port>` or `sudo ufw allow <service>`.

## Automatic Security Updates

For a box that should be boring and reliable, unattended security updates are essential:
```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```
{: .nolineno }

Select "Yes" when prompted. This enables automatic installation of security updates. WOPR will check daily and apply patches without intervention.

You can verify it's enabled:
```bash
cat /etc/apt/apt.conf.d/20auto-upgrades
```
{: .nolineno }

Should show:
```
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```
{: .nolineno }

## Quick Reference

| Task | Command |
|------|---------|
| Generate SSH key | `ssh-keygen -t ed25519 -C "comment"` |
| Copy key to server | `ssh-copy-id user@host` |
| Restart SSH | `sudo systemctl restart ssh` |
| Enable firewall | `sudo ufw enable` |
| Allow a port | `sudo ufw allow <port>` |
| Check firewall status | `sudo ufw status` |
| Enable auto-updates | `sudo dpkg-reconfigure -plow unattended-upgrades` |

## Next Up

WOPR is now reasonably hardened for home use. Next post covers installing OpenClaw and getting Node.js set up. Time to start building Joshua.

---

*This post was co-written with Claude, who patiently reminded me to test SSH before disabling password auth.*
