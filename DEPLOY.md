# Deploy Guide

## Option A: Static hosting (Netlify / Vercel / Cloudflare Pages)

Use this only if you remove Node-specific server routes and host as pure static files.

1. Push repo to GitHub.
2. Create a new static site on your provider.
3. Point it to this repo.
4. Build command: none (or leave blank).
5. Publish directory: repo root.

## Option B: Node hosting (recommended for current repo)

Current repo includes `server.js`, so use a Node host like Render / Railway / Fly.

### Render steps
1. Push repo to GitHub.
2. In Render, click **New +** -> **Web Service**.
3. Connect your GitHub repo.
4. Configure:
   - Runtime: `Node`
   - Build command: `npm install`
   - Start command: `npm start`
5. Deploy.

### Railway / Fly (equivalent setup)
- Build command: `npm install`
- Start command: `npm start`
- Ensure `PORT` is provided by host (already supported by `server.js`).

## Post-deploy checks
1. Open the deployed site URL.
2. Submit one RSVP for each path:
   - Yes
   - Maybe
   - No
3. Confirm rows appear in the correct Google Sheet tabs.

## Guest Wall auth (Render production)
If `/guest-wall` is failing with `oauth_invalid`, production auth mode is misconfigured.

Set these Render env vars:

- `GOOGLE_AUTH_MODE=service_account`
- `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64=<base64 full service account JSON>`
- `GOOGLE_SPREADSHEET_ID=<existing sheet id>`

Recommended: remove legacy OAuth vars from this service:

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`

After redeploy, verify:

```bash
curl -sS https://mikiandyijie-rsvp-api.onrender.com/api/guestbook/health | jq
curl -sS 'https://mikiandyijie-rsvp-api.onrender.com/api/guestbook?mode=pinboard&limit=12' | jq
npm run check:guestwall
```
