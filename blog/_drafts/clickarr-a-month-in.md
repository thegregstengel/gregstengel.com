---
title: "Clickarr, a Month In"
date: 2026-11-05 18:00:00 -0500
categories: [Projects, Clickarr]
tags: [clickarr, plex, jellyfin, android-tv, fire-tv, open-source]
authors: [stengel, claude]
description: Four weeks after the first release, Clickarr supports Jellyfin, runs on TVs I have never touched, and has its first bug reports from real living rooms.
---

<!-- DRAFT. Written in retrospect from the November release notes and the
     README. GREG: fill in or delete every "GREG:" comment before publishing. -->

> This post was written after the fact, from the release notes and the README.
{: .prompt-info }

[Clickarr]({% post_url 2026-10-11-clickarr-turn-your-media-library-into-tv %}) shipped on October 11. By November 5 it had six tagged releases and people I have never met were running it.

<!-- GREG: how did people find it? Reddit, a Plex forum, word of mouth? -->

## Jellyfin

Clickarr launched for Plex only. It now works with Jellyfin too. Each TV picks one server at first run. Jellyfin signs in with Quick Connect or a password, and only the token is kept.

<!-- GREG: was Jellyfin requested, or always the plan? -->

## Other people's TVs

I tested on Fire TV Sticks and the Android TV emulator. Then reports came in from hardware I don't own:

- A TCL TV with Google TV built in
- A Xiaomi TV box
- A Roku TV with a Google TV dongle
- An LG TV with an Nvidia Shield Pro

Those reports found real bugs. On one TCL set, opening the guide closed the app. On Google TV and Shield devices, the guide would not scroll past the channels already on screen. Both are fixed in 2026.11.5.

## What changed in the player

- **Audio and video options.** A gear in the player lets you pick a server version and an audio track.
- **Reconnects.** If a stream drops mid-program, Clickarr rejoins at the live position.
- **A sleep timer** that ends in a bouncing logo on a black screen. Any button tunes back in.
- **A polite exit.** Pressing Back twice asks before leaving. Pressing Home stops the audio, so a channel can't keep playing under another app.

## What changed in channels

- **Reorder and delete** from the channel list.
- **Edit a channel's sources** after creating it.
- **Holiday channels** that only come on air in the run-up to the holiday, then return the next year.

## What I've learned

<!-- GREG: your reflection on running a small open-source project for a month.
     What surprised you? What would you do differently? -->

The household sync bug was the one that stung. Member TVs stopped picking up new channels after joining, because an idle connection was being closed after 30 seconds. It is fixed, and it is the kind of bug you only find with two real TVs in two real rooms.

The releases and notes are at [clickarr.net/releases](https://clickarr.net/releases/).
