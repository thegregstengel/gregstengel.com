---
title: "Clickarr: Turn Your Media Library Into TV"
date: 2026-10-11 18:00:00 -0400
categories: [Projects, Clickarr]
tags: [clickarr, plex, android-tv, fire-tv, kotlin, open-source]
authors: [stengel, claude]
description: The first release of Clickarr, an open-source Android TV and Fire TV app that gives a Plex library channels, a program guide, and channel surfing.
---

<!-- DRAFT. Written in retrospect from the README, the v2026.10.11 release notes
     and the commit history. GREG: every "GREG:" comment below is a spot where
     only you know the answer. Fill them in or delete them before publishing. -->

> This post was written after the fact, from the release notes and the commit history.
{: .prompt-info }

Every media server works the same way. Open the app, browse, pick a show, pick an episode, press play. That is a video store. It is not television.

I wanted the other thing: turn the TV on and something is already playing. So I built it.

<!-- GREG: one or two sentences on the actual itch. Was it the kids, decision
     fatigue, missing the feel of cable? This is the part readers remember. -->

## What Clickarr is

[Clickarr](https://clickarr.net) is an open-source app for Android TV, Google TV, and Fire TV. You build virtual channels out of your own Plex library. Channel 10 is sitcoms. Channel 20 is Star Trek. Each channel runs a schedule.

Tune to channel 10 at 7:17 PM and you land seventeen minutes into whatever is airing, exactly like turning on a TV. Leave and come back later, and the channel has kept going without you.

It is a single APK that you sideload. There is no Clickarr server, no container, and no cloud account.

## What shipped in the first release

The first release, `v2026.10.11`, went out two days after the first commit. It was built and verified on a Fire TV Stick 4K Max and the Android TV emulator.

<!-- GREG: two days from first commit to first release is the interesting part.
     How did that happen? If coding agents did most of the typing, say so and
     say how you ran them. -->

- **Channels** from shows, whole libraries with genre and decade filters, Plex collections, and playlists. In order or shuffled, back to back or on 15, 30, or 60 minute slots.
- **A program guide** two hours across, with a preview card, favorites, and numeric channel entry.
- **A player that tunes in mid-program**, with an overlay, Up Next, and automatic advancement at each boundary.
- **Suggested channels**: it reads your library once and proposes a starting lineup, such as a rerun channel for the shows you have the most of, genre themes, decades, and one shuffled movie channel.
- **Households**: several TVs in one home pair over the LAN with a PIN and follow the same lineup.
- **In-app updates** on a nightly or release channel, with checksums.

## The decision everything else hangs on

A channel is a function from time to program.

Schedules are never stored and never synced. Each TV recomputes them from a frozen lineup, a start time, and a seed. Ask any device "what is on channel 10 at 7:17 PM" and it gets the same answer without talking to the others. Nothing drifts, and nothing streams between TVs.

Two more rules came out of that:

- **Video goes straight from your server to the TV.** Clickarr never proxies media. It asks Plex for the right item at the right offset.
- **Credentials never leave the device.** Each TV signs in itself, and the Plex token stays in that TV's Android Keystore. A household shares channels, never credentials.

Fire TV is a first-class target, so nothing depends on Google Play Services.

## Get it

In the Fire TV Downloader app, enter `clickarr.net/apk`. Or grab the APK from [GitHub Releases](https://github.com/thegregstengel/clickarr/releases/latest). The code is MIT licensed and lives at [github.com/thegregstengel/clickarr](https://github.com/thegregstengel/clickarr).

<!-- GREG: add a screenshot or two here. The README has guide, player and
     channel-editor screens under site/assets/screens/. No post on the blog has
     an image yet, and this one is the easiest to fix. -->

If your TV or box works, or doesn't, open an issue with the device name. That helps everyone.
