# Zero-Pixel Refactor Plan

## Scope guardrails
- No visual, copy, spacing, color, font, animation, or layout changes.
- No dependency changes.
- No wrapper-node insertions that alter DOM shape.
- Every refactor commit must pass screenshot parity at 3 breakpoints.

## Current folder/component map

### Root structure
- `index.html`: full page structure and section markup.
- `styles.css`: global styles, section styles, component styles, responsive rules.
- `app.js`: all client-side logic and renderers.
- `server.js`: Node server + RSVP API handling.
- `data/`: static data bundles (`hotels.js`, `beijing-food.js`).
- `photos/`, `public/`, `motifs/`: visual/static assets.
- `tools/visual/`: visual parity tooling (`visual-check.sh`).
- `docs/`: refactor and process docs.

### Major UI sections/components (runtime)
- Hero/top navigation.
- Our story timeline/mosaic/lightbox stack.
- Venue section (cutout parallax media).
- Schedule section (scroll scrub reveal).
- RSVP form (choice cards, guest cards, uploads, validation, submission).
- FAQ section (accordion groups + nested items).
- Where to stay (matrix chart + details panel + mobile sheet).
- Things to do (accordion themes + cards).
- Beijing Food Menu (accordion + generated restaurant cards + copy actions).
- Travel & Visa (passport pills + dynamic result card).
- Recent moments gallery (grid + lightbox + focal overrides).

## Top 10 duplication sources
1. Repeated external-link element construction (`href/target/rel/textContent`) across renderers.
2. Repeated `field/form-field` DOM construction patterns for RSVP inputs and labels.
3. Guest fun-fact block assembly duplicated between primary and +1 guest builders.
4. Repeated meta-row creation patterns in generated card UIs (food and guest variants).
5. Repeated show/hide/toggle helpers across popovers/modals/tooltips (Makan tip/legal, hotel method, jump menu).
6. Repeated “active state” class toggling patterns across navigation, pills, chart points.
7. Repeated breakpoint/media query constants embedded in several JS calculations.
8. Repeated visual reveal setup patterns (`data-delay`, observer wiring, `in-view` semantics).
9. Repeated image fallback/load handlers (gallery/story/FAQ image paths).
10. Repeated section-level heading wiring patterns (title classing and reveal behavior).

## Commit-by-commit zero-pixel sequence

### Commit 1 (DONE)
`refactor(zero-pixel): add visual baseline capture and diff tooling`
- Add `tools/visual/visual-check.sh`.
- Add README instructions.
- Add `visual-baseline/` to `.gitignore`.
- Baseline+current+compare pipeline verified.

### Commit 2
`refactor(zero-pixel): document refactor inventory and execution plan`
- Add `docs/zero-pixel-refactor-plan.md`.
- No app runtime changes.

### Commit 3
`refactor(zero-pixel): extract shared dom helpers for external links and text nodes`
- Safe category: D (pure function extraction).
- Add internal helper functions in `app.js` only (no new wrappers).
- Replace repeated element creation snippets with helper calls.

### Commit 4
`refactor(zero-pixel): unify guest fun-fact field builder`
- Safe category: D.
- Extract common `buildGuestFunFactField()` used by primary/+1 builders.
- Keep identical element tags, classNames, attributes, and insertion order.

### Commit 5
`refactor(zero-pixel): centralize toggle helpers for popovers and sheets`
- Safe category: D.
- Extract generic show/hide helpers (`setHidden`, `setExpanded`, `bindEscapeClose`) and apply only where behavior is already identical.

### Commit 6
`refactor(zero-pixel): centralize section and viewport constants`
- Safe category: C.
- Move repeated numeric literals (breakpoint checks and shared thresholds) into top-level constants in `app.js`.
- No CSS edits.

### Commit 7
`refactor(zero-pixel): reduce duplicate class toggling patterns`
- Safe category: D.
- Extract repeated `setActiveById`/`toggleClassByMatch` style utilities.
- Apply to nav links, pills, and chart active state loops where DOM targets are unchanged.

### Commit 8
`refactor(zero-pixel): isolate rsvp validation helpers`
- Safe category: D.
- Pull repeated validation/reset/error message snippets into pure helpers.
- No payload schema changes.

### Commit 9
`refactor(zero-pixel): isolate image fallback helpers`
- Safe category: D.
- Consolidate repeated image fallback wiring functions used in FAQ/story/gallery.

### Commit 10
`refactor(zero-pixel): move static literal arrays to constants module script`
- Safe category: C (only if loaded as plain script, not package change).
- Candidate: fun-fact idea arrays and misc non-UI literals.
- Hard stop if this introduces load-order risk.

## Visual parity protocol per commit
1. `npm run story:check`.
2. `./tools/visual/visual-check.sh current`.
3. `./tools/visual/visual-check.sh compare`.
4. If any diff: revert commit candidate and replace with smaller safer extraction.

## Stop conditions
- Any commit that requires CSS edits to complete extraction.
- Any extraction requiring extra wrapper nodes.
- Any uncertain runtime ordering risk for non-module scripts.
