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

## RSVP Google Integration (Server-side)

RSVP submissions now go through `POST /api/rsvp` in `/Users/kwangyijie/Desktop/Coding/wedding-rsvp/server.js`.

### Required `.env` values

Copy `.env.example` to `.env` and set:

- `GOOGLE_SPREADSHEET_ID`
- `GOOGLE_DRIVE_UPLOADS_FOLDER_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

Or set:
- `GOOGLE_SERVICE_ACCOUNT_JSON` (stringified service account JSON)

If you are using a personal Google account (no Shared drives), use OAuth user creds instead:
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`

Do not commit `.env`.

### Google setup

1. Create/share a Google service account with:
   - Sheets scope (`https://www.googleapis.com/auth/spreadsheets`)
   - Drive scope (`https://www.googleapis.com/auth/drive`)
2. Share the target spreadsheet with the service account email (Editor).
3. Share the target Drive upload folder with the service account email (Editor).

For personal Google Drive uploads (no Shared drives), use OAuth user credentials:
1. Create OAuth Client ID in Google Cloud (`APIs & Services` -> `Credentials` -> `Create Credentials` -> `OAuth client ID` -> `Web application`).
2. Add redirect URI: `https://developers.google.com/oauthplayground`.
3. Open OAuth Playground, click gear icon, enable `Use your own OAuth credentials`.
4. Paste your OAuth Client ID + Secret.
5. Authorize scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.file`
6. Exchange authorization code for tokens.
7. Copy refresh token into `.env` as `GOOGLE_OAUTH_REFRESH_TOKEN`.

### Required sheet tabs and headers (row 1)

Tab `rsvps`:
- `submission_id, submitted_at, rsvp_status, full_name, email, phone, party_size, when_will_you_know, dietary_restrictions, message_to_couple, primary_fun_facts, media_count, source, approved`

Tab `guests`:
- `submission_id, guest_index, guest_name, fun_facts, is_primary, created_at`

Tab `media`:
- `submission_id, file_index, file_id, file_name, mime_type, file_type, drive_view_url, created_at`

### Submission behavior

- Server generates `submission_id` (UUID) and timestamp.
- Writes one row to `rsvps`.
- Always writes a primary row to `guests`; additional `+1` rows are appended when present.
- Uploads up to 3 files directly into `GOOGLE_DRIVE_UPLOADS_FOLDER_ID`.
- Uploaded file names are normalized as `<submission_id>_<index>.<ext>`.
- Writes one row per file to `media`.
- API response: `{ "ok": true, "submission_id": "<uuid>" }`.

### Manual test checklist

1. Submit `yes` with 0 files.
2. Submit `yes` with 2 files.
3. Submit `maybe` with `party_size` + `when_will_you_know`.
4. Submit `no` with message only.
5. Verify all 3 tabs (`rsvps`, `guests`, `media`) and uploaded files in the Drive target folder.

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
