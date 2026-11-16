---
title: "Big Bang Smugglers 2.0: A New Universe"
date: 2026-08-01 12:00:00 -0400
categories: [Game Dev, Big Bang Smugglers]
tags: [big-bang-smugglers, game-dev, cloud-run, postgres, trpc, expo, gcp]
authors: [stengel, claude]
description: Big Bang Smugglers 2.0 rebuilt the game on a new platform, wiped the universe, and put it in the browser as well as on Android.
---

<!-- DRAFT. Written in retrospect from the v2.0.0 release notes and the repo
     history. GREG: fill in or delete every "GREG:" comment before publishing. -->

> This post was written after the fact, from the release notes and the commit history.
{: .prompt-info }

On August 1, 2026, Big Bang Smugglers 2.0 went live. The release notes called it "not an update" but "a re-founding", and that is accurate. The game was rebuilt from the engine up, and everyone started over.

## Why rebuild

<!-- GREG: this is the heart of the post and only you can write it. What was
     wrong with the Firebase version? Cost, speed, galaxy generation taking half
     an hour, cheating, something else? What made you decide to start over
     rather than keep patching? -->

Version 1 ran on Firebase. Version 2 is a new platform: a server on Cloud Run, Postgres for the data, tRPC between client and server, and Expo for the apps.

The new repo was created on July 8. The launch was 24 days later.

<!-- GREG: 24 days from empty repo to launch, for a full rebuild. Say how. -->

## What players got

- **Speed.** Turns resolve instantly. Galaxies generate in seconds, where they used to take half an hour.
- **Live tuning.** Game balance can change per season without shipping an app update.
- **The browser.** The game runs at [play.bigbangsmugglers.com](https://play.bigbangsmugglers.com) with no install. The Android app updated in place.
- **A clean slate.** New accounts, new galaxies, no carried history. The version 1 seasons were archived.

## The game, redesigned

Seventeen game systems were reviewed and rebuilt. The ones that changed how it plays:

- **A living market.** Prices follow real supply and demand at every port, so trade routes have to be found.
- **A smuggling career.** Contraband, fences, customs scans, bribes, and cloaks. High risk, high margin.
- **Ports you can take.** Sieges, garrisons, and corp-owned ports that skim taxes.
- **Factions with teeth.** The Federation, the pirates, and the Merchant Guild all track your standing. Prices, docking rights, and arrest warrants follow it.
- **Hull damage.** Shields spill over to hull, and destruction is real.

## The cutover

The day after launch, the last change to the version 1 repo removed its deploy workflows. Its final tag is `v1-final`.

Then came the patches. Seven small releases went out over the next three days, starting with a launch-week client patch.

<!-- GREG: what broke at launch? One honest paragraph here would fit the
     "what actually broke" tone of the Google Play post. -->

Wiping a live game is a risk. Players had seasons of history in the old universe.

<!-- GREG: how did the veterans take the wipe? -->
