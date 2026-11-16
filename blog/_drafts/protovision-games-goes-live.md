---
title: "Protovision Games Goes Live"
date: 2026-02-22 09:00:00 -0500
categories: [Game Dev, Protovision Games]
tags: [protovision-games, wargames, big-bang-smugglers, github-pages]
authors: [stengel, claude]
description: The studio behind Big Bang Smugglers gets a website, and it is a single HTML file that looks like the WOPR terminal from WarGames.
---

<!-- DRAFT. Written in retrospect from the site repo's history, README and spec.
     GREG: fill in or delete every "GREG:" comment before publishing. -->

> This post was written after the fact, from the commit history.
{: .prompt-info }

Late on February 21, 2026, [protovisiongames.com](https://protovisiongames.com) went live. It is the home of Protovision Games, the studio name I ship games under.

It is one HTML file.

## The name

In the 1983 film *WarGames*, a kid goes looking for a game company's computer so he can play its unreleased games. The company is called Protovision. He finds something else.

<!-- GREG: why this name? WarGames runs through everything you build (WOPR,
     Joshua, the tooltip on your own site). One or two sentences on what the
     film means to you. -->

Protovision Games is me. There is no team and no office.

## The site

The page is a near-black screen with a list of games in glowing type, like the terminal in the film. The list is the film's own menu, from Falken's Maze to Global Thermonuclear War. Those entries are decoration.

One entry is real. Big Bang Smugglers links out to [the game](https://bigbangsmugglers.com). New titles get added to the list as they ship.

It took about fifteen minutes to settle. The first version went up at 10:26 that night. By 10:39 it had been stripped down to the essentials: the game list, a prompt, and a cursor. Two minutes after that, the prompt became a bare `>`.

The rule for the site is to keep it simple. It has no build step, no framework, and one web font.

## Since then

The page has picked up two things since launch:

- **A logon prompt.** In September it gained an interactive WOPR logon, with the film's responses and sound.
- **A hidden game.** In October it gained tic-tac-toe, with zero, one, and two player modes. The game list does not offer it. You have to know to ask.

<!-- GREG: anything else you want to say about what Protovision is for, or
     what ships under it next. -->
