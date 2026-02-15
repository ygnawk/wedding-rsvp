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
