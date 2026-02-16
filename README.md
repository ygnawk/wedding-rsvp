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

Expected tab names for RSVP writes:
- `Yes`
- `Maybe`
- `No`

## Configure Google Drive + Sheets (RSVP submit)

RSVP submissions are handled by `/api/rsvp` in `server.js`.
Photos upload to Google Drive, and metadata writes to Google Sheets.

### 1) Share the Drive folder with your service account

Destination folder ID:
`1My_SJoxtThb-ZhRbKgBkf1Y4viDqATsS`

In Google Drive, share that folder with your service-account email as **Editor**.
If not shared, uploads will fail with Drive permission errors.

### 2) Set server env vars

```bash
export GOOGLE_DRIVE_FOLDER_ID="1My_SJoxtThb-ZhRbKgBkf1Y4viDqATsS"
export GOOGLE_SHEETS_SPREADSHEET_ID="1yJqJC2q4iRVUFkQ3anFgr_lVHayAGFavo581U_zh3Ec"
export GOOGLE_SERVICE_ACCOUNT_JSON_BASE64="$(base64 < /path/to/service-account.json | tr -d '\n')"
```

Notes:
- The service account key is server-side only. Do not expose it in client code.
- Uploads are stored under Drive subfolders created automatically:
  - `Coming`
  - `Maybe`
  - `No`

## RSVP submit behavior

- Front-end sends `POST` multipart form data to `/api/rsvp`.
- Photos are optional and use three slots:
  - `photo1`
  - `photo2`
  - `photo3`
- Allowed formats: JPG/PNG/HEIC, max 10MB each.
- Server writes one row to Sheets with:
  - `rsvp_id`, `status`, `primary_name`, `primary_email`, `guests_json`, `message`
  - `photo_file_ids`, `photo_urls`, `photo_filenames`
  - per-slot columns (`photo_1_*`, `photo_2_*`, `photo_3_*`)
- If Drive upload fails but Sheets write succeeds, RSVP still saves and returns a friendly warning.

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
