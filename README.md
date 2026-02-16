# Wedding RSVP Site

## Run locally
```bash
cd /Users/kwangyijie/Desktop/Coding/wedding-rsvp
npm install
npm run dev
```

Live preview (auto-reload): `http://localhost:3001`

Server only (no auto-reload):
```bash
npm start
```
Open: `http://localhost:3000`

## Connect Google Sheets

Spreadsheet ID:
`1yJqJC2q4iRVUFkQ3anFgr_lVHayAGFavo581U_zh3Ec`

Expected tab names:
- `Yes`
- `Maybe`
- `No`

1. Open your Google Sheet.
2. Go to `Extensions -> Apps Script`.
3. Paste the full contents of:
   - `/Users/kwangyijie/Desktop/Coding/wedding-rsvp/google-apps-script-example.gs`
4. Click `Deploy -> New deployment -> Web app`.
5. Set:
   - Execute as: `Me`
   - Who has access: `Anyone with the link`
6. Copy the deployed Web App URL.
7. Open `/Users/kwangyijie/Desktop/Coding/wedding-rsvp/app.js` and set:
   - `const SHEETS_WEBAPP_URL = "YOUR_WEB_APP_URL_HERE";`

## RSVP submit behavior

- Front-end sends `POST` JSON as `text/plain;charset=utf-8` to the Apps Script URL.
- Payload includes:
  - `status` (`yes` | `maybe` | `no`)
  - `fullName`, `email`, `phone`
  - Yes path: `partySize`, `attendeeNames` (up to 6), `dietary`
  - Maybe path: `potentialPartySize`, `whenWillYouKnow`
  - No path: `note`
- If Google Sheets submission fails, the form is not cleared and a clean error is shown.

## Git init and push

```bash
cd /Users/kwangyijie/Desktop/Coding/wedding-rsvp
git init
git add .
git commit -m "Initial wedding site"
git branch -M main
git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
git push -u origin main
```

## Deploy

See:
- `/Users/kwangyijie/Desktop/Coding/wedding-rsvp/DEPLOY.md`
# weddingsite

## Zero-Pixel Visual Parity Check

Generate and compare screenshots at required breakpoints/sections:

```bash
# 1) Create baseline (once)
./tools/visual/visual-check.sh baseline

# 2) Capture current state
./tools/visual/visual-check.sh current

# 3) Compare against baseline
./tools/visual/visual-check.sh compare
```

Or run capture+compare in one shot:

```bash
./tools/visual/visual-check.sh all
```

Breakpoints:
- Mobile: 390x844
- Tablet: 834x1112
- Desktop: 1440x900

Sections captured:
- Home (top)
- Our story
- Where to stay
- Things to do
- Beijing food menu
- Travel & Visa
- RSVP
- Recent moments

Local output folders (not committed):
- `visual-baseline/baseline`
- `visual-baseline/current`
- `visual-baseline/diff`
