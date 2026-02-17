# Overnight Thread Plan (Self-Approved)

## Scope
- Objective: zero-UI-change speed optimization.
- Constraint: no visual/layout/copy changes in production UI.
- Verification: screenshot baseline comparisons + Lighthouse A/B on isolated ports.

## Thread 1: Visual/Perf Guardrails
- Why independent:
  - Touches only tooling (`tools/visual/visual-check.sh`) and report outputs.
  - No runtime UI code paths.
- Success metrics:
  - Deterministic screenshot captures across target sections/breakpoints.
  - Saved perf baselines under `/perf_baseline`.
- Deliverables:
  - `tools/visual/visual-check.sh` port override support (`VISUAL_SERVER_PORT`, `VISUAL_SERVER_URL`).
  - `tools/visual/visual-check.sh` capture wait override (`VISUAL_CAPTURE_WAIT_MS`).
  - Baseline/current/diff image sets under `visual-baseline/`.
  - Lighthouse JSON snapshots under `perf_baseline/`.
- Risk:
  - Harness instability on animated sections if wait window is too short.
- Zero-pixel verification:
  - Compare `visual-baseline/baseline` vs `visual-baseline/current`.

## Thread 2: Static Delivery Path Optimization
- Why independent:
  - Server-only static asset serving (`server.js`), no frontend markup/style changes.
- Success metrics:
  - Conditional requests supported for static assets.
  - Reduced repeat work in static file reads and compression.
- Deliverables:
  - Added static cache constants and in-memory static body cache.
  - Added weak ETag + Last-Modified generation.
  - Added 304 Not Modified handling.
  - Cached compressed static variants by encoding.
- Risk:
  - Header regressions if route tests use an already-running stale process.
- Zero-pixel verification:
  - Screenshot compare across all sections after server changes.

## Thread 3: API Response Caching/Headers
- Why independent:
  - API response contract unchanged; only transport/cache behavior in `server.js`.
- Success metrics:
  - Explicit cache policy by endpoint class:
    - `rsvp`: `no-store`
    - `guestbook`/`timeline`: short TTL + SWR
- Deliverables:
  - `send(...)` extended with optional `headers` and `cacheControl`.
  - Applied endpoint-specific cache headers for API routes.
- Risk:
  - If production has a stale intermediary cache, freshness may lag by TTL.
- Zero-pixel verification:
  - UI screenshots unchanged; API header inspection only.

## Thread 4: Guestbook Backend Compute Reduction
- Why independent:
  - Server-side guestbook data assembly only; frontend rendering unchanged.
- Success metrics:
  - Fewer Drive API calls during guestbook refresh.
  - Lower response path latency under media-heavy submissions.
- Deliverables:
  - Removed per-file Drive metadata fan-out in `loadGuestbookItems` hot path.
  - Continued use of normalized media fields already stored in sheet rows.
- Risk:
  - If media rows are incomplete, thumbnail quality may vary.
- Zero-pixel verification:
  - Same guest wall UI structure and card rendering behavior.

## Execution Order
1. Thread 1 guardrails
2. Thread 2 static path
3. Thread 3 API cache headers
4. Thread 4 guestbook compute reduction

Rationale: verification first, then transport/cache improvements, then data-path optimization.
