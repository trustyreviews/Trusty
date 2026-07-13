# Trusty

Expo SDK 54 React Native app.

## Run

```powershell
cd C:\Users\drewm\Trusty
npm install
npx expo start
```

Then open in Expo Go, or press `a` / `i` for Android / iOS.

## Company website & Privacy Policy

Static pages live in [`website/`](./website/):

- `website/index.html` — company homepage
- `website/privacy.html` — Privacy Policy

Host that folder on any static host (GitHub Pages, Netlify, Cloudflare Pages, etc.), then update the live URLs in [`src/config/company.js`](./src/config/company.js).

The app also shows **Website** and **Privacy Policy** links on onboarding and the Business tab. Privacy is readable in-app; Website opens the hosted URL (and an in-app About screen as a fallback).
