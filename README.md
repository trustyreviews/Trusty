# Trusty

Review inbox for local businesses (Expo SDK 54 app).

## Landing page & widget (GitHub Pages)

Public static assets are served from the `docs/` folder on `main`, with custom domain **trustydirect.com** (`docs/CNAME`).

- https://trustydirect.com/ — landing page (`docs/index.html`)
- https://trustydirect.com/privacy.html — Privacy Policy
- https://trustydirect.com/widget.js — embeddable reviews widget
- https://trustydirect.com/widget-data.json — mock review feed for the widget

### Custom domain DNS (IONOS)

GitHub must verify you own the domain before Pages will serve it.

**Step 1 — TXT verification** (GitHub → Settings → Pages → Add domain)

| Type | Host / Name | Value |
|------|-------------|-------|
| `TXT` | `_github-pages-challenge-trustyreviews` | *(copy from GitHub — changes per attempt)* |

In IONOS: **Domains → trustydirect.com → DNS** → Add record. Use only the subdomain part as Host (IONOS appends `.trustydirect.com`). Click **Verify** in GitHub after saving.

**Step 2 — Point the domain at GitHub Pages**

| Type | Host | Value |
|------|------|-------|
| `A` | `@` | `185.199.108.153` |
| `A` | `@` | `185.199.109.153` |
| `A` | `@` | `185.199.110.153` |
| `A` | `@` | `185.199.111.153` |
| `CNAME` | `www` | `trustyreviews.github.io` |

Remove the old IONOS parking **A** record (`74.208.236.207`) if it is still there.

Then in GitHub: **Settings → Pages → Custom domain** → `trustydirect.com` → enable **Enforce HTTPS** once DNS propagates (often 15–60 minutes; TXT can take up to 24h).

Copy the embed snippet from **Settings → Get your widget code** in the app.

### Web app on the site

The Expo web build lives at **https://www.trustydirect.com/app/** (demo mode in the browser).

Rebuild after app UI changes:

```powershell
npm run build:web
```

Then commit `docs/app/` and push to `main`:

```powershell
git add docs/index.html app.json package.json scripts/export-web.js .gitignore
git add -f docs/app/
git commit -m "Rebuild web app for GitHub Pages."
git push
```

## Run the app

**Easiest (Windows):** double-click `start-trusty.bat` in the project folder.

Or in a terminal:

```powershell
cd C:\Users\drewm\Trusty
npm start
```

Then press `w` for browser, or scan the QR with Expo Go.

First-time only: `npm install`, copy `.env.example` to `.env`, and add your `GEMINI_API_KEY`.  
Draft with AI calls Gemini directly — no separate `npm run api` server needed.

## Facebook reviews API

Server-side Graph API integration for Page ratings (fetch + reply). The Page Access Token never ships to the client.

### Permanent Page token (one-time setup)

Graph API Explorer tokens expire in ~1 hour. For a **non-expiring Page token**:

| Step | What | How |
|------|------|-----|
| 1 | Short **User** token | [Graph API Explorer](https://developers.facebook.com/tools/explorer/) → App **Trusty** → token type **User** → permissions: `pages_show_list`, `pages_read_engagement`, `pages_read_user_content`, `pages_manage_posts`, `pages_manage_engagement` → Generate |
| 2–3 | Permanent **Page** token | Put App ID, App Secret, and User token in `.env`, then run `npm run fb:page-token -- --write` |

Add to `.env` (see [`.env.example`](.env.example)):

```env
FB_APP_ID=2462222147604346
FB_APP_SECRET=your_app_secret
FB_SHORT_USER_TOKEN=short_user_token_from_explorer
FB_PAGE_ACCESS_TOKEN=
FB_PAGE_ID=1231064900087363
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3000
```

```powershell
npm run fb:page-token -- --write
npm run api
```

Confirm in [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/): **Type: Page**, **Expires: Never**.

You can remove `FB_SHORT_USER_TOKEN` and `FB_APP_SECRET` from `.env` after the Page token is saved (keep them if you want to refresh later).

### Run locally

```powershell
npm run api
```

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/reviews` | Fetch Page ratings (optional `?limit=&after=`) |
| `POST` | `/api/reviews/reply` | Reply with `{ "open_graph_story_id", "message" }` |

Each review includes `openGraphStoryId` (from `open_graph_story.id`) — required to reply.

On Vercel, set the same `FB_*` env vars; routes live under `api/reviews.js` and `api/reviews/reply.js`.
