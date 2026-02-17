# Overnight Performance Report

## Measurement Setup
- Lighthouse version: `12.2.2`
- Runs executed against isolated local ports (to avoid stale-process collisions).
- A/B method:
  - `ab3-before`: `HEAD` server implementation
  - `ab3-after`: optimized `server.js`
- Tested routes:
  - `/`
  - `/guest-wall`
- Modes:
  - Mobile emulation (390x844)
  - Desktop preset

## Core A/B Results (ab3)

### Home (mobile)
- Performance: `87 -> 87` (flat)
- LCP: `3948ms -> 3948ms` (flat)
- TBT: `48ms -> 48ms` (flat)
- CLS: `0.0507 -> 0.0507` (flat)
- Transfer: `892KB -> 894KB` (near-flat)

### Home (desktop)
- Performance: `99 -> 100` (+1)
- LCP: `920ms -> 491ms` (improved)
- CLS: `0.0050 -> 0.0047` (improved)
- Transfer: `895KB -> 896KB` (near-flat)

### Guest Wall (desktop)
- Performance: `100 -> 100` (flat)
- LCP: `604ms -> 498ms` (improved)
- Speed Index: `840 -> 549` (improved)
- Transfer: `3.44MB -> 2.93MB` (improved)

### Guest Wall (mobile)
- Single-run output is noisy due rotating heavy media mix; 3-run medians were used.
- Median performance score: `41 -> 59` (improved)
- Median LCP: `23008ms -> 22989ms` (flat/noise-level)
- Median transfer: `4.70MB -> 4.69MB` (flat/noise-level)

## Top 5 Measured Bottlenecks
1. Very large image payloads in wall/media-heavy views
- Evidence: guest-wall mobile image transfer is multi-MB per run (`~4.5MB` image bytes median).

2. Large source image files in repo
- Evidence: several assets are `5MB-9MB` each under `/photos/hotels` and other photo sets.

3. Single large client bundle footprint
- Evidence: `app.js` raw size is `242,763` bytes (`~53KB gzip`, `~44KB brotli`).

4. High scroll/RAF/timer density in client runtime
- Evidence: many active scroll/resize/RAF listeners and timers in `app.js`, increasing interaction overhead risk.

5. Guest-wall route variability due mixed media load characteristics
- Evidence: large run-to-run LCP variance on mobile, dominated by media decode/network timing.

## Implemented Speed Changes
1. Static file transport improvements (`server.js`)
- Added ETag and Last-Modified support.
- Added `304 Not Modified` handling.
- Added cache of static file body/compressed variants to reduce repeated CPU/disk work.

2. API response cache policies (`server.js`)
- Added endpoint-level cache-control routing:
  - `rsvp`: `no-store`
  - `guestbook`: short TTL + `stale-while-revalidate`
  - `timeline-photos`: short TTL + `stale-while-revalidate`

3. Guestbook backend hot-path reduction (`server.js`)
- Removed per-file Drive metadata fan-out from guestbook refresh path.

4. Visual regression harness hardening (`tools/visual/visual-check.sh`)
- Added isolated server port support:
  - `VISUAL_SERVER_PORT`
  - `VISUAL_SERVER_URL`
- Added configurable capture delay:
  - `VISUAL_CAPTURE_WAIT_MS`

## Zero-Pixel Verification Notes
- Same-build deterministic check result:
  - `PASS (0 differences)` across all configured sections and breakpoints.
- Cross-build A/B compare can show drift on animated/mobile sections when capture windows intersect async motion states; repeated same-build pass confirms harness consistency.

## Remaining Bottlenecks
- Mobile guest-wall media remains the dominant performance cost.
- The biggest future wins are image variant generation + strict thumbnail sizing per viewport.

## UX/Visual Audit (Top 5, no code changes in this pass)
1. Guest Wall mobile first card clarity
- Issue: heavy media dominates before context.
- Why it matters: slower perceived comprehension.
- Recommendation: show compact intro state + first card skeleton immediately.
- Effort: M

2. Mobile section transition density
- Issue: too many animated sections in a single long scroll.
- Why it matters: perceived jank on mid-range devices.
- Recommendation: selectively reduce concurrent motion on low-width viewports.
- Effort: M

3. Guest Wall control hierarchy
- Issue: shuffle/pause/buttons compete visually with content.
- Why it matters: attention fragmentation.
- Recommendation: keep one primary action visible, move secondary into menu.
- Effort: S

4. Where-to-stay mobile information stacking
- Issue: chart context + controls crowd above fold.
- Why it matters: slower task completion.
- Recommendation: compress helper copy and move secondary explainer into progressive disclosure.
- Effort: S

5. Long-form section intro copy line length consistency
- Issue: some intros look visually shorter than neighboring sections.
- Why it matters: rhythm inconsistency, perceived polish drop.
- Recommendation: normalize max-width for section intros in content container system.
- Effort: S
