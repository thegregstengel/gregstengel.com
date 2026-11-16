---
title: "From Space Junkies to Big Bang Smugglers"
date: 2025-08-30 18:00:00 -0400
categories: [Game Dev, Big Bang Smugglers]
tags: [big-bang-smugglers, tradewars, react-native, expo, firebase, game-dev]
authors: [stengel, claude]
description: How a two-week prototype called Space Junkies became Big Bang Smugglers, a modern take on the BBS door game TradeWars 2002.
---

> This post was written after the fact, from the commit history and the original README.
{: .prompt-info }

On August 30, 2025, a repo called Space Junkies got a new name. The first commits that day say it plainly: "Initial migration from Space Junkies to Big Bang Smugglers", then "Fix all remaining Space Junkies references".

That is the day the game got its name.

## The idea

Big Bang Smugglers is a modern reimagining of TradeWars 2002, the space trading game people played over dial-up on bulletin board systems. You fly a ship between sectors, buy low, sell high, and try not to get shot.

The original README laid out what I wanted:

- **A big galaxy.** Procedurally generated, up to 20,000 sectors.
- **Turns.** 250 a day. Every action costs some, so you have to choose.
- **An economy.** Three commodities, prices that move, and smuggling.
- **Factions.** The Federation if you play it straight, the Pirates if you don't.
- **Twenty ship classes**, planets to colonize, and corporations to join.
- **Seasons.** Twelve weeks, then the leaderboard resets.
- **Mobile first.** A BBS door game, on a phone.

## Two weeks of Space Junkies

The prototype repo was created on August 17, 2025. Thirteen days and 86 commits later, it had outgrown its name.

The first version was built on Expo and React Native, with Firebase underneath. One of the day-one commits after the rename moved every database connection to a new Firestore database. That stack carried the game for almost a year.

## What came next

It took until February 2026 to get the game onto Google Play, which is [its own story]({% post_url 2026-02-23-shipping-to-google-play-what-actually-broke %}). By the time version 1 was retired in August 2026, that repo had more than 1,300 commits.

All of it started as a two-week prototype with a different name.
