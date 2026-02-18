# Deploy To GitHub Pages (Custom Domain)

## 1) Enable GitHub Pages
1. Open the repository settings for `ygnawk/wedding-rsvp`.
2. Go to **Pages**.
3. Set **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main`
   - **Folder**: `/ (root)`
4. Save.

Important:
- Keep the repo `PUBLIC` for free GitHub Pages.
- If the repo is switched to `PRIVATE`, Pages may stop serving and `www.mikiandyijie.com` can return a GitHub 404.

Default URL will be:
- `https://ygnawk.github.io/wedding-rsvp/`

## 2) Set Custom Domain
1. In **Settings → Pages**, set **Custom domain** to:
   - `www.mikiandyijie.com`
2. Save.
3. Confirm the repo contains `CNAME` with exactly:
   - `www.mikiandyijie.com`

## 3) DNS Records
Set these records at your DNS provider.

### Apex (@) A records
- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

### `www` CNAME
- `ygnawk.github.io`

## 4) Enforce HTTPS
1. Return to **Settings → Pages**.
2. Turn on **Enforce HTTPS** (once certificate is issued).

## 5) Verify Site
Check both URLs:
- `https://ygnawk.github.io/wedding-rsvp/`
- `https://www.mikiandyijie.com/`

Confirm:
- Styles/images/motifs load correctly.
- Timeline images load from `photos/timeline-photos/manifest.json`.

Quick diagnostics:
- `gh api repos/ygnawk/wedding-rsvp/pages`
- `gh api 'repos/ygnawk/wedding-rsvp/pages/builds/latest'`
- `curl -I https://www.mikiandyijie.com`

Force rebuild (if needed):
- `gh api -X POST repos/ygnawk/wedding-rsvp/pages/builds`

## 6) Verify RSVP To Google Sheets
1. Submit one RSVP of each type (Yes / Maybe / No).
2. Confirm rows appear in the corresponding Google Sheet tabs.
3. If RSVP fails, verify `SHEETS_WEBAPP_URL` in `app.js` points to your deployed Apps Script Web App URL.
