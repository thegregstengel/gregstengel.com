---
title: "Turning an ESP-VoCat Into a Physical GrokBot"
date: 2026-11-25 08:25:00 -0500
categories: [Projects, Robotics]
tags: [grokbot, esp32, esp-vocat, rust, xai, hardware, voice-ai]
authors: [stengel]
image:
  path: /assets/img/grokbot/grokbot-banner.png
  alt: Three rendered 3D spherical GrokBot faces showing Idle, Listening, and Happy expressions
description: How I rebuilt a physical GrokBot on an Espressif ESP-VoCat by splitting the firmware into a thin ESP32-S3 Body, a Rust Brain daemon, and a 3D spherical SDF face renderer.
---

I bought an [Espressif ESP-VoCat](https://www.espressif.com/en/dev-board/esp-vocat-en) with one goal: turn it into a physical GrokBot for my desk.

The hardware ([ESP-VoCat v1.2 User Guide](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp-vocat/user_guide_v1.2.html)) is a neat little package: an ESP32-S3-WROOM-1 with 16 MB of flash, 16 MB of Octal PSRAM, a 360x360 circular touch display, dual microphones, a speaker, and capacitive side pads. I wanted it to work like a desk companion. Say a wake word or tap the screen, watch the pill-shaped eyes snap to attention, talk to Grok through xAI's realtime voice API, and watch the face react while it talks back.

My first attempt did not go great.

## Why the first attempt hit a wall

On the first pass, the firmware tried to do everything on the microcontroller:

- Open a TLS WebSocket straight to xAI from the ESP32-S3.
- Heap-allocate, base64-encode, and wrap every 20 ms microphone frame in `cJSON`.
- Decode incoming audio straight into I2S inside the WebSocket callback, with no ring buffer or dedicated playback task.
- Draw flat rotated LVGL rectangles for the eyes.
- Store the API key right on the device.

It stuttered, rebooted, and fought me every time I touched anything. The chip was not too weak for the project. I was just asking a microcontroller to be both the body and the brain.

## Splitting it into Body and Brain

So I tore it down and rebuilt it around a clean split:

- **The Body (`firmware/` in ESP-IDF 5.5 C):** Handles real-time sensory I/O and nothing else. Dual-mic capture, local ESP-SR audio front-end processing (beamforming, AEC, VAD, and WakeNet9 for `"Hi, ESP"`), a PSRAM speaker ring buffer, touch controls, and the face renderer. No API keys, no TLS certificates, no prompts.
- **The Brain (`brain/` in Rust / Tokio):** Runs on a machine on my LAN, holds `XAI_API_KEY`, advertises itself over mDNS (`_grokbot._tcp.local.`), maintains the binary WebSocket to `wss://api.x.ai/v1/realtime` (`grok-voice-latest`), paces audio frames back to the ESP-VoCat, and computes live speech energy for the eyes.

The two talk over LAN TCP using a compact 6-byte length-prefixed binary protocol (`GB` v1) carrying 16 kHz mono PCM16 frames and face state cues:

```text
+--------------------------------------------+    LAN TCP (binary GB v1)     +-------------------------------------------+
| ESP-VoCat Body (ESP-IDF 5.5 C, 240 MHz)    | <---------------------------> | grokbot-brain (Rust / Tokio)              |
|                                            |                               |                                           |
|  ES7210 dual-mic (MIC1 + MIC2) + ref       |  0x02 AUDIO_UP (20 ms PCM) -> |  Binary WS <-> wss://api.x.ai/v1/realtime |
|   -> ESP-SR AFE (AEC + SE + VAD + WakeNet) |  0x03 WAKE / 0x04 BARGE_IN -> |   (audio/pcm 16 kHz, transport: binary,   |
|  256 KB PSRAM ring buffer -> ES8311 DAC    | <- 0x82 AUDIO_DOWN (paced)    |    server_vad, session resumption, tools) |
|  360x360 3D spherical SDF face (25 fps)    | <- 0x83 FACE_STATE (20 Hz)    |  20 ms real-time pacer + speech energy    |
|  CST816S touch + capacitive side pads      | <- 0x84 STOP_AUDIO            |  mDNS advertiser (_grokbot._tcp.local.)   |
+--------------------------------------------+                               +-------------------------------------------+
```

Moving the xAI connection to Rust also killed the JSON and base64 overhead completely. xAI's realtime voice endpoint supports raw binary PCM transport on both input and output, so audio stays binary from the microphones all the way to the cloud and back. And if I want to swap voices, tweak the system prompt, or enable web and X search tools, I restart a Rust binary instead of reflashing firmware.

## Building a 3D spherical face (and not tripping the watchdog)

The old face looked flat because GrokBot's eyes are not flat stickers. GrokBot is a sphere. When the eyes drift up and to the right in its resting pose, the farther eye curves and foreshortens around the surface of the ball. Rotated LVGL rectangles cannot do that, and they cannot morph smoothly into smiling arches or furrowed brows.

So the face renderer (`face_render.c`) became an analytic 3D unit-sphere signed distance field (SDF) renderer writing into a 360x360 PSRAM `lv_canvas`. Each eye is evaluated as a capsule in spherical coordinates (`theta`, `phi`), with 4x4 Bayer ordered dithering to eliminate RGB565 banding in the dark orb sheen and white eye halo, plus damped spring physics, natural blinks, and micro-saccades.

We also built a small desktop preview harness (`scripts/preview_face.c`) that compiles the exact same C renderer on Linux and dumps all nine expressions to a single image, so we could tune the poses without flashing the board every two minutes:

![All nine 3D spherical GrokBot face poses rendered from the firmware C code](/assets/img/grokbot/face-poses.png){: w="620" }
_Top to bottom, left to right: Idle, Listening, Focusing, Thinking, Speaking, Happy, Curious, Concerned, and Sleepy._

Then I flashed it to the ESP-VoCat and immediately tripped the 5-second task watchdog on CPU 0.

The backtrace pointed straight at `face_render_eyes`. Running per-pixel `atan2f`, `asinf`, and `sqrtf` across the combined eye bounding box under ESP-IDF's default `-Og` optimization took longer than the 33 ms LVGL timer period, so `taskLVGL` never yielded to `IDLE0`.

Fixing it took a few targeted changes:

- **Zero `libm` calls in the pixel loop:** Pre-rendered the static obsidian sphere once at boot into a PSRAM background cache (`memcpy` restores), replaced `sqrtf` with a 4 KB linear-interpolated lookup table in internal SRAM, and replaced `atan2f`/`asinf` with a fast polynomial on the FPU.
- **Two tight bounding boxes:** Rendered one dirty box per eye with an early distance reject instead of scanning the empty gap between them.
- **Compiler flags and core pinning:** Turned on `-O2` (`CONFIG_COMPILER_OPTIMIZATION_PERF=y`), bumped the chip to 240 MHz, and pinned `taskLVGL` to CPU 1 while Wi-Fi and networking stayed on CPU 0.

Right after that, a second display bug surfaced in the live boot logs: setting both `buff_dma = true` and `buff_spiram = true` made the SPI driver allocate a 28.8 KB internal DMA bounce buffer on every flush. As soon as `esp_wifi_init` grabbed internal SRAM, the allocation failed and LVGL deadlocked waiting for a flush that never completed. Switching to a single fixed 20-line internal DMA strip and moving the network queues into PSRAM solved it cleanly.

## From "it boots" to "it talks cleanly"

Getting the display smooth and the TCP handshake working was half the job. The real debugging happened in the gap between connecting and having a normal conversation.

**Dual mics without fighting I2S clocks.** The ESP-VoCat BSP initializes the ES7210 ADC in standard 2-channel stereo I2S (`MIC1` and `MIC2`) sharing clocks with the ES8311 speaker DAC. Trying to force 4-slot TDM mode risked breaking speaker clocking, so `audio_pipeline.c` keeps standard stereo mic capture and interleaves live speaker samples in software as the third `"MMR"` reference channel for ESP-SR's AEC, beamforming, VAD, and WakeNet9.

**The one-line Rust panic.** On the very first real test, `"Hi, ESP"` fired on the first try, the Body sent `WAKE`, and the Rust Brain immediately panicked opening TLS to xAI. `rustls` 0.23 does not pick a default crypto provider automatically. Installing the `ring` provider at startup in `main.rs` fixed it.

**Awake, connected, and total silence.** Next run: the eyes snapped upright to attention, xAI accepted the WebSocket (`101 Switching Protocols`), I talked to it, and nothing came back for 25 seconds until GrokBot went back to sleep. Testing raw PCM frames directly against xAI's endpoint isolated it to the input side. xAI's default `server_vad` threshold is `0.85`, which was too strict for a desktop MEMS mic. Lowering the threshold to `0.45`, turning on WebRTC AGC in ESP-SR, and adding a two-note wake chime made both the mic trigger and speaker health obvious right away.

**Swipes turning into taps.** Swiping up and down for volume or left and right for brightness did nothing except trigger screen taps. LVGL's built-in `LV_EVENT_GESTURE` rarely fires on the CST816S panel, so I replaced it with direct press-to-release coordinate tracking: 40 pixels or more is a swipe (volume in 10% steps with a confirmation tick tone, or brightness in 10% steps), and anything shorter is a tap or a long-press to sleep.

**The "wiggling aux cord" stutter.** Once Grok finally started speaking back, it sounded choppy and jumbled mid-sentence, like someone was twisting a loose headphone cable. Two bugs were colliding at the exact same time:

1. **Unpaced xAI audio bursts:** xAI sends realtime audio much faster than real time (15 to 20 KB chunks), which overflowed the original 48 KB (1.5-second) ring buffer and dropped slices out of the middle of every sentence. Adding a 20 ms real-time frame pacer in `grokbot-brain` (with a 120 ms initial pre-fill burst and synchronized 20 Hz speech-energy updates for lip-synced eyes) and expanding the ESP-VoCat PSRAM playback ring buffer to 256 KB (8 seconds) with `spk_play` at FreeRTOS priority 7 smoothed playback out immediately.
2. **Echo triggering self-interruption:** Residual speaker audio was still leaking back into `AUDIO_UP`, convincing xAI's `server_vad` that I was interrupting and firing `STOP_AUDIO` mid-sentence. Gating `AUDIO_UP` while the speaker is actively playing (plus a 250 ms echo tail) stopped the false interruptions. Local WakeNet9 (`"Hi, ESP"`) and screen taps stay active the whole time for instant barge-in, and the mic reopens automatically when Grok finishes so follow-up questions work hands-free.

## Where it stands

Now it sits on my desk and actually works.

Say `"Hi, ESP"` or tap the screen, hear the soft chime, watch the eyes lock straight ahead, and ask a question. Grok answers smoothly while the pill eyes bounce in time with the voice. Tap the screen or say the wake word mid-sentence to cut it off, or just keep talking when it finishes. Long-press puts it back to sleep.

Splitting the Body from the Brain turned a frustrating microcontroller fight into a setup I actually enjoy tweaking. The ESP-VoCat only does what embedded hardware is good at, and the Rust daemon handles everything I want to iterate on quickly.

The firmware, Rust Brain daemon, wire protocol docs, and desktop face previewer are all on GitHub at [thegregstengel/thegrokbot](https://github.com/thegregstengel/thegrokbot).
