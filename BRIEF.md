# Creative Brief — gregstengel.com landing page

## Project

Personal site landing page for **Greg Stengel** — homelab + cloud + AI tinkerer
who runs a Jekyll blog at `/blog/`. The landing page is the front door at `/`.
Today it's a quiet, minimal splash (centered frosted card, profile pic, "All the
things." heading, drifting tech-icon background, social row). This brief
redirects it toward an opinionated, dense, alive control-panel of a person.

- **Audience:** other engineers / homelabbers / cloud + AI people who land here
  from GitHub, LinkedIn, or a blog post. Peers, not recruiters-to-impress.
- **Business goal:** turn a dead-end splash into a front door that *routes* — to
  the blog, the homelab, the work — and that reads as a person with a point of
  view, not a résumé.

## v2 — content weighting & the anti-resume rule

The control-panel *aesthetic* holds; v2 loads it with real career substance and
re-weights the mix:

- **~75% professional · 20% homelab · 5% fun/easter eggs.** Professional leads;
  the homelab (after-hours tiles) and the hidden `?` console are the smaller human
  layers.
- **Anti-resume rule (non-negotiable):** **no employer names, no dates, no
  tenure.** Experience is chunked into generalized **chronological eras**
  (`01 Foundations` → `05 Cloud meets agents`); **signature projects** are
  described by what was built; **recommendations** are anonymized pull-quotes with
  relationship-only tags. Source material was the LinkedIn export — anonymized on
  the way in.
- Skills are **grouped into clusters** (the "toolkit" tile).
- The page is no longer single-viewport; it's a **taller, scrolling** bento to
  hold the added tiles.

## The four axis selections

1. **Tone Register — Provocative.** First-person, opinionated, willing to take a
   stance other personal sites won't. Edge, not edgelord.
2. **Aesthetic Philosophy — Expressive Maximalist.** Loud, dense, high-contrast,
   willing to clash. The opposite of the current restrained splash.
3. **Audience Relationship — Peer.** Talks to visitors as equals figuring it out
   in public. No teaching-from-a-podium. Shared technical vocabulary assumed.
4. **Sensory Ambition — Functional.** Every loud element does a job: a live
   status, a real link, the actual stack, the latest posts.

## Synthesis

This brief produces a landing page that looks like the control panel of the
person who runs it. It is loud on purpose, but the loudness is load-bearing:
the density is real artifacts — a homelab status readout, the working stack
wall, the latest blog posts, the outbound links — not decoration. The voice is
first-person and pointed, addressing peers as co-thinkers. It resolves the
Maximalist+Functional tension as *functional maximalism*: the page earns its
visual abundance by making every loud thing also be a useful thing.

## Concrete art direction

**Layout** — Kill the single centered frosted card. Replace with a dense
bento/control-panel grid that fills the viewport: an oversized opinionated
headline tile, a "now running" homelab status tile, a latest-posts tile pulling
from `/blog/`, the stack wall (today's drifting icons, but labeled and
purposeful), and a social/outbound row. Dark-first.

**Type** — Maximalist + technical: a heavy display grotesque for the headline
(e.g. Space Grotesk / Archivo heavy) paired with a monospace for labels, status,
and metadata (e.g. JetBrains Mono / IBM Plex Mono). Oversized headline, tight
mono labels — terminal-meets-zine.

**Color** — High-contrast dark base, off-white text, one or two loud accents
(acid/phosphor green or cyan + a hot secondary). Replaces today's quiet
grayscale. Going dark-first also kills the current broken `prefers-color-scheme`
dark-mode bug at the root.

**Motion** — Keep the floating icons but make them *system-alive* rather than
purely decorative: status blips, a blinking cursor, hover-to-label on the stack
wall. Respect `prefers-reduced-motion` (already wired) and pause when the tab is
hidden.

**Copy voice** — First-person, peer, pointed. The headline takes a stance (not
"All the things."). Sub-copy reads like notes from someone building in public.
Blog CTA framed with edge ("read the receipts", "the blog →"), not "Latest
Articles".

## Rejection list (what this brief says no to)

- No frosted-glass centered card floating in empty space.
- No "All the things." placeholder headline.
- No safe grayscale-only palette.
- No authority / teacher / "let me explain to you" tone.
- No corporate-calm SaaS restraint, no stock imagery, no exclamation-point hype.
- No decoration that doesn't also do a job (the functional discipline on the
  maximalism).

## Open questions

- **Homelab status tile:** static hand-authored ("WOPR · TrueNAS · Joshua ·
  Paperclip — all green") or genuinely live? Static first; live is a follow-up.
- **Blog feed:** the landing page is *not* processed by Jekyll, so a live latest-
  posts list needs either a build step, a small fetch of the blog's feed, or
  hand-maintained links. Decide before building that tile.
- **Headline:** needs the actual provocative line written (a `landing-page-copy`
  pass with this brief as input).
- **Exact accent color(s):** phosphor-green vs cyan vs something hotter — lock in
  the palette step.
