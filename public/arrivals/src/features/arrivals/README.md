# Arrivals Feature Module

This feature is implemented as a merge-ready page module and does not create a standalone app shell.

## Deliverables

- Route-ready page component: `src/features/arrivals/pages/ArrivalsPage.tsx`
- Flag-gated route wrapper: `src/features/arrivals/route.tsx`
- Feature exports: `src/features/arrivals/index.ts`

## Feature flag

- Env var: `NEXT_PUBLIC_ARRIVALS_TRACKER_ENABLED`
- Default: `false` (see `.env.example`)

## Mock data

- Canonical mock data: `data/mockArrivals.ts`
- Shape includes:
  - `beijing` with `lat/lon`
  - `origins[]` with `id, country, countryCode, city, count, lat, lon`
  - `byCountry[]` with `country, countryCode, count`

## Interaction behavior

- Click country/city rows to highlight matching arcs and dots.
- Click map origin dots to highlight corresponding board rows.
- Dot click scrolls the matching city row into view.
- Top 6 routes animate plane markers via JS path-length animation.
- `prefers-reduced-motion` disables plane animation and non-essential transitions.
