# Trusty

Review inbox for local businesses (Expo SDK 54 app).

## Landing page & widget (GitHub Pages)

Public static assets are served from the `docs/` folder on `main`, with custom domain **trustydirect.com** (`docs/CNAME`).

- https://trustydirect.com/ — landing page (`docs/index.html`)
- https://trustydirect.com/privacy.html — Privacy Policy
- https://trustydirect.com/widget.js — embeddable reviews widget
- https://trustydirect.com/widget-data.json — mock review feed for the widget

### Custom domain DNS

At your domain registrar (for `trustydirect.com`), add:

| Type | Name | Value |
|------|------|-------|
| `A` | `@` | `185.199.108.153` |
| `A` | `@` | `185.199.109.153` |
| `A` | `@` | `185.199.110.153` |
| `A` | `@` | `185.199.111.153` |
| `CNAME` | `www` | `trustyreviews.github.io` |

Then in the GitHub repo: **Settings → Pages → Custom domain** → enter `trustydirect.com` and enable **Enforce HTTPS**.

Copy the embed snippet from **Settings → Get your widget code** in the app.

## Run the app

```powershell
cd C:\Users\drewm\Trusty
npm install
npx expo start
```

Then open in Expo Go, or press `a` / `i` for Android / iOS.
