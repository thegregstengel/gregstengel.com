---
title: "Building a Sesame Robot With My Son (and a 3D Model to Solder From)"
date: 2026-11-16 18:00:00 -0500
categories: [Projects, Robotics]
tags: [sesame-robot, esp32, soldering, robotics, claude, 3d-model]
authors: [stengel, claude]
description: My son and I built a Sesame Robot from parts that didn't match the instructions, so I had Claude build an interactive 3D model of the board to plan every part, joint, and wire before we picked up the iron.
---

<!-- DRAFT. Written from the Claude conversation and the finished 3D model.
     GREG: every "GREG:" comment is a spot only you can fill in. The post works
     without them, but it is a build log until you add them. With them it is a
     story about you and your son. Fill in or delete each one before publishing. -->

My son and I built a robot.

<!-- GREG: start here. How old is he? Whose idea was it? What did he say when
     he saw the Sesame Robot for the first time? Two or three sentences. -->

It is a [Sesame Robot](https://github.com/dorianborian/sesame-robot), an open-source design for a small walking robot. It has four legs, two servos per leg, and a tiny screen for a face.

The design comes with a build guide. We couldn't follow it.

## The parts didn't match

I bought parts that were close to the guide's, but not the same. Our controller was a Seeed XIAO ESP32-S3, where the firmware expects a different board. Our battery was a two-cell 7.4 V pack. Our circuit board was a blank 70 x 30 mm perfboard: 240 empty holes and no instructions.

So the guide's wiring tables were no use to us. Every pin was somewhere else.

<!-- GREG: why these parts? Already in the drawer, cheaper, what was in stock? -->

I had a pile of components, a soldering iron, and a kid who wanted to see a robot walk. What I didn't have was a plan for where anything went.

## So I asked for a model

I asked Claude for an interactive 3D model of the board. I wanted three things from it:

- **A fit check.** Do the parts physically fit on this board, and where?
- **A soldering diagram.** Which holes get a joint?
- **A wiring diagram.** Which wire goes from where to where?

I also wanted to be able to rotate it, and to tick parts and wires on and off in a list.

We started with just the bare board. Then I photographed one part at a time, sent the picture and its specs, and Claude added it to the model and found it a home. The order was the controller, the power converter, the battery, the servo headers, and the screen.

Here is where it ended up. Drag to rotate it. **Flip to solder side** shows the wiring underneath.

<iframe src="{{ '/assets/sesame/board-3d.html' | relative_url }}" title="Interactive 3D model of the Sesame Robot board" loading="lazy" style="width: 100%; height: 85vh; min-height: 560px; border: 1px solid var(--main-border-color, #333); border-radius: 8px;"></iframe>

[Open the model in its own tab]({{ '/assets/sesame/board-3d.html' | relative_url }}){: target="_blank" } if you want more room.

## What the model gave us

**Every hole has a name.** The board's grid is lettered A to X one way and numbered 01 to 10 the other. Every joint in the model has an address, so the instructions read like "solder the battery wire at X10". That is something a kid can follow.

<!-- GREG: did he do the soldering, call out the coordinates, or both? This is
     the best spot for a photo of the two of you at the bench. -->

**You can turn layers off.** With 24 servo pins, 14 controller pins, and more than twenty wires, the full picture is a mess. Unticking everything except the wire you are about to solder turns it into one step.

**It flips over.** Parts go on the top and wires go on the bottom, so everything is mirrored when you turn the board over. The model flips with you, and the labels on the solder side are drawn so they still read correctly.

## Where it went wrong

The model took sixteen revisions. Most of them were me pointing at something that was wrong.

**The power converter didn't fit the grid.** Its corner holes did not line up with the board's grid, so it could not sit on straight pins. My first idea was a dab of silicone. We ended up sticking it down with foam tape and running four short wire leads from its corners into the board.

**Then the model was still wrong.** After we agreed on that, the model still showed the converter's pins going straight through the board. I said so, and it got fixed. The model is only as good as someone checking it against the real part in their hand.

**The screen cable had one end.** The model had a connector at the board and nothing at the screen. It also needed to be longer, because the screen lives in the top cover.

**One battery wire must not be connected.** The pack has three wires. Red and black are power. Blue is the midpoint between the two cells, and it has no business touching anything. The model labels it "do not connect", and we capped it with heat shrink.

<!-- GREG: any real mishaps at the bench? A cold joint, a burnt finger, a part
     in backwards? The honest ones are the ones people read. -->

## The part I didn't know I needed

Late in the build, Claude mentioned a "bulk capacitor for the 5 V rail" and asked if I had one.

I asked what that meant.

Eight servos starting to move at once pull a spike of current. That can dip the voltage far enough to reset the controller. A large capacitor across the power rail soaks up the spike. We added a 470 µF one, then moved it to the other side of the board, then re-routed its wires because they were mashing into the first servo header.

I would not have known to add it.

## What we ended up with

- **Controller:** Seeed XIAO ESP32-S3, with USB-C facing the board edge
- **Power:** a 7.4 V two-cell battery, through a rocker switch, into a 5 V 3 A converter
- **Servos:** eight, on three colour-matched header strips for signal, 5 V, and ground
- **Screen:** a 0.96 inch OLED on a four-wire cable
- **Capacitor:** 470 µF across the 5 V rail

Because our controller was different, the firmware needed its pin list changed to match our wiring. The model has a pin map table for exactly that.

One rule we wrote down: never plug in USB and the battery at the same time.

## Did it work?

<!-- GREG: the ending. Did it power up first time? Did it walk? What did your
     son do when it moved? If it isn't walking yet, say that; it is a better
     ending than pretending. A short video or GIF here would make the post. -->

When we finished, I asked Claude for a written summary of the hardware and wiring, so the next session could pick up the firmware without me explaining it all again.

## Would I do it this way again

Yes. I didn't need the model to be pretty. I needed to make my mistakes on a screen, where they cost nothing, before making them with solder.

It also gave my son and me the same picture to look at. We could both point at it.

<!-- GREG: your last line. What did he get out of it? What did you? -->
