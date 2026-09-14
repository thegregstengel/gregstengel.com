#!/usr/bin/env python3
"""Music assets for the landing page's sound control (music.js).

    python3 scripts/gen-music.py --analyze <slug>   # the normal use
    python3 scripts/gen-music.py                    # placeholder loop + art

Needs numpy + ffmpeg (libmp3lame).

`--analyze <slug>` reads assets/music/<slug>.mp3 and writes <slug>.json: a
precomputed spectrum (8 log bands, 20 fps, uint8, base64) so music.js can
animate the EQ bars while the sound is muted, before any audio is fetched.

With no arguments it synthesizes "Phosphor Idle", a ~43 s seamless loop, plus
176x176 cover art (the `>_` mark on a scanlined tile) and its JSON -- a
stand-in for testing when no licensed track is available. The cover art
routine is also what produced the current track's art.
"""
import base64, json, struct, subprocess, sys, wave, zlib
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "music"
SLUG = "phosphor-idle"
SR = 44100
FPS, BANDS, WIN = 20, 8, 2048          # spectrum frame rate / bands / FFT window
F_LO, F_HI = 50.0, 10000.0             # log-spaced band edges


# ----------------------------------------------------------------- synth ----
def note(n):
    """MIDI note number -> Hz."""
    return 440.0 * 2 ** ((n - 69) / 12)


def synth():
    bpm, bars = 90, 16
    beat = 60 / bpm
    dur = bars * 4 * beat
    n = int(round(dur * SR))
    t = np.arange(n) / SR
    rng = np.random.default_rng(7)

    # i - VI - III - VII in A minor, four bars each: Am F C G
    A, C, E, F, G, B, D = 57, 60, 64, 53, 55, 59, 62
    chords = [[A, C, E], [F, A, C], [C, E, G], [G, B, D]]
    roots = [45, 41, 48, 43]  # A2 F2 C3 G2

    def chord_at(time):
        return int(time // (4 * beat)) % 4

    mixL = np.zeros(n)
    mixR = np.zeros(n)

    # --- pad: detuned additive tones with slow tremolo, crossfaded per chord
    pad = np.zeros(n)
    seg = int(4 * beat * SR)
    xf = int(0.6 * SR)
    for ci, ch in enumerate(chords):
        s0 = ci * seg
        seg_t = t[:seg + xf] if s0 + seg + xf <= n else t[: n - s0]
        env = np.ones(len(seg_t))
        env[:xf] = np.linspace(0, 1, xf)
        if len(seg_t) > seg:
            env[seg:] = np.linspace(1, 0, len(seg_t) - seg)
        voice = np.zeros(len(seg_t))
        for m in ch + [ch[0] + 12]:
            f = note(m)
            for det in (-0.004, 0.004):
                for h in range(1, 6):
                    voice += np.sin(2 * np.pi * f * (1 + det) * h * seg_t + rng.uniform(0, 6.28)) / h ** 1.7
        chunk = voice * env
        end = min(n, s0 + len(chunk))
        pad[s0:end] += chunk[: end - s0]
        if s0 + len(chunk) > n:  # wrap the tail for a seamless loop
            pad[: s0 + len(chunk) - n] += chunk[end - s0 :]
    pad *= 0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t)
    pad /= np.abs(pad).max()
    mixL += 0.22 * pad
    mixR += 0.22 * pad

    # --- bass: eighth-note pulses on the chord root
    bass = np.zeros(n)
    step = beat / 2
    for k in range(int(dur / step)):
        s0 = int(k * step * SR)
        f = note(roots[chord_at(k * step)])
        L = int(0.34 * SR)
        tt = np.arange(L) / SR
        env = np.exp(-tt * 9) * (1.0 if k % 2 == 0 else 0.7) * np.minimum(1, tt / 0.004)
        v = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)) * env
        end = min(n, s0 + L)
        bass[s0:end] += v[: end - s0]
    bass /= np.abs(bass).max()
    mixL += 0.3 * bass
    mixR += 0.3 * bass

    # --- arpeggio: sixteenth-note triangle-ish tones with a ping-pong echo
    arp = np.zeros(n)
    step = beat / 4
    pattern = [0, 1, 2, 3, 2, 1, 0, 3]
    for k in range(int(dur / step)):
        s0 = int(k * step * SR)
        ch = chords[chord_at(k * step)]
        tones = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[0] + 24]
        f = note(tones[pattern[k % len(pattern)]])
        L = int(0.22 * SR)
        tt = np.arange(L) / SR
        env = np.exp(-tt * 14) * np.minimum(1, tt / 0.003)
        v = sum(np.sin(2 * np.pi * f * h * tt) / h ** 2 for h in (1, 3, 5)) * env
        end = min(n, s0 + L)
        arp[s0:end] += v[: end - s0]
    arp /= np.abs(arp).max()
    d1, d2 = int(0.75 * beat * SR), int(1.5 * beat * SR)
    arpL = arp + 0.4 * np.roll(arp, d1) + 0.12 * np.roll(arp, d2)
    arpR = arp + 0.12 * np.roll(arp, d1) + 0.4 * np.roll(arp, d2)
    mixL += 0.16 * arpL
    mixR += 0.16 * arpR

    # --- kick on 1 and 3, soft hat on the off-beats
    kick = np.zeros(n)
    hat = np.zeros(n)
    for k in range(int(dur / beat)):
        s0 = int(k * beat * SR)
        if k % 2 == 0:
            L = int(0.3 * SR)
            tt = np.arange(L) / SR
            f = 45 + 80 * np.exp(-tt * 30)
            ph = np.cumsum(2 * np.pi * f / SR)
            v = np.sin(ph) * np.exp(-tt * 12) * np.minimum(1, tt / 0.002)
            end = min(n, s0 + L)
            kick[s0:end] += v[: end - s0]
        h0 = s0 + int(beat / 2 * SR)
        L = int(0.03 * SR)
        ht = np.arange(L) / SR
        v = np.diff(rng.standard_normal(L + 1)) * np.exp(-ht * 120) * np.minimum(1, ht / 0.002)
        end = min(n, h0 + L)
        hat[h0:end] += v[: end - h0]
    kick /= np.abs(kick).max()
    hat /= np.abs(hat).max()
    mixL += 0.42 * kick + 0.05 * hat
    mixR += 0.42 * kick + 0.05 * hat

    # --- glue: soft clip, normalize
    st = np.stack([mixL, mixR], axis=1)
    st = np.tanh(1.3 * st) / np.tanh(1.3)
    st *= 0.89 / np.abs(st).max()
    return st, dur


def write_wav(path, stereo):
    pcm = (np.clip(stereo, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


# --------------------------------------------------------------- spectrum ---
def analyze(mono, duration):
    frames = int(duration * FPS)
    edges = F_LO * (F_HI / F_LO) ** (np.arange(BANDS + 1) / BANDS)
    freqs = np.fft.rfftfreq(WIN, 1 / SR)
    win = np.hanning(WIN)
    db = np.full((frames, BANDS), -90.0)
    for i in range(frames):
        c = int(i / FPS * SR)
        seg = mono[max(0, c - WIN // 2): c + WIN // 2]
        if len(seg) < WIN:
            seg = np.pad(seg, (0, WIN - len(seg)))
        p = np.abs(np.fft.rfft(seg * win)) ** 2
        for b in range(BANDS):
            sel = (freqs >= edges[b]) & (freqs < edges[b + 1])
            if sel.any():
                db[i, b] = 10 * np.log10(p[sel].mean() + 1e-12)
    lo = np.percentile(db, 12, axis=0)
    hi = np.percentile(db, 99.5, axis=0)
    norm = np.clip((db - lo) / np.maximum(hi - lo, 1), 0, 1)
    data = (norm * 255).round().astype(np.uint8).tobytes()
    return {"duration": round(duration, 3), "fps": FPS, "bands": BANDS,
            "spectrum": base64.b64encode(data).decode("ascii")}


# ------------------------------------------------------------------- art ----
def write_png(path, rgb):
    h, w, _ = rgb.shape
    raw = b"".join(b"\x00" + rgb[y].astype(np.uint8).tobytes() for y in range(h))
    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    path.write_bytes(png)


def cover_art(size=176):
    yy, xx = np.mgrid[0:size, 0:size].astype(float)
    s = size / 64.0  # favicon.svg geometry is on a 64-unit grid
    img = np.zeros((size, size, 3))
    img[:] = (15, 19, 15)                                         # #0f130f
    img[(yy // 2) % 2 == 0] *= 0.82                               # scanlines
    r = np.hypot(xx - size / 2, yy - size / 2) / (size / 2)
    img *= (1 - 0.35 * np.clip(r - 0.4, 0, 1))[..., None]        # vignette

    def seg_dist(ax, ay, bx, by):
        ax, ay, bx, by = ax * s, ay * s, bx * s, by * s
        vx, vy = bx - ax, by - ay
        tt = np.clip(((xx - ax) * vx + (yy - ay) * vy) / (vx * vx + vy * vy), 0, 1)
        return np.hypot(xx - (ax + tt * vx), yy - (ay + tt * vy))

    d = np.minimum.reduce([seg_dist(17, 20, 29, 32), seg_dist(29, 32, 17, 44), seg_dist(34, 46, 48, 46)])
    stroke = 3.5 * s
    glyph = np.clip(stroke - d + 0.5, 0, 1)                       # anti-aliased edge
    glow = np.exp(-np.maximum(d - stroke, 0) / (6 * s)) * 0.35
    green = np.array((108, 255, 90))
    img = img * (1 - glow[..., None]) + green * glow[..., None]
    img = img * (1 - glyph[..., None]) + green * glyph[..., None]
    return np.clip(img, 0, 255)


# ------------------------------------------------------------------ main ----
def main():
    OUT.mkdir(parents=True, exist_ok=True)
    if len(sys.argv) > 2 and sys.argv[1] == "--analyze":
        slug = sys.argv[2]
        wav = OUT / f"{slug}.analyze.wav"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(OUT / f"{slug}.mp3"),
                        "-ac", "1", "-ar", str(SR), str(wav)], check=True)
        with wave.open(str(wav)) as w:
            mono = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2") / 32768.0
        wav.unlink()
        meta = analyze(mono, len(mono) / SR)
        (OUT / f"{slug}.json").write_text(json.dumps(meta, separators=(",", ":")))
        print(f"{slug}.json  duration={meta['duration']}s")
        return

    stereo, dur = synth()
    wav = OUT / f"{SLUG}.wav"
    write_wav(wav, stereo)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-codec:a", "libmp3lame",
                    "-q:a", "4", "-ar", str(SR), str(OUT / f"{SLUG}.mp3")], check=True)
    wav.unlink()
    meta = analyze(stereo.mean(axis=1), dur)
    (OUT / f"{SLUG}.json").write_text(json.dumps(meta, separators=(",", ":")))
    write_png(OUT / f"{SLUG}.png", cover_art())
    for f in sorted(OUT.glob(f"{SLUG}.*")):
        print(f"{f.relative_to(ROOT)}  {f.stat().st_size} bytes")
    print(f"duration {dur:.2f}s")


if __name__ == "__main__":
    main()
