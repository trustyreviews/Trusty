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

Then commit `docs/app/` and push to `main`. A GitHub Action also rebuilds when `src/` or `App.js` change.

## Run the app

```powershell
cd C:\Users\drewm\Trusty
npm install
npx expo start
```

Then open in Expo Go, or press `a` / `i` for Android / iOS.
