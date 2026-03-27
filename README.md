# Nutrition Tracker

A all in one personal nutrition tracker that logs meals, analyzes macros and micronutrients with Gemini, and stores your meals, profile, and custom foods in Cloudflare D1 so you can use the same personal account on Android and desktop.

## Stack

- Static frontend: HTML, CSS, vanilla JavaScript
- Cloud backend: Cloudflare Pages Functions
- Cloud database: Cloudflare D1
- AI analysis: Gemini API
- Installable app: PWA with manifest + service worker

## Features

- One private owner account with email + password login
- One-time setup code for secure first account creation
- Cloud-synced meals, profile goals, and custom foods
- Analyze meals with Gemini using your profile and custom AI instructions
- Track calories, calorie deficit, macros, and micronutrients
- Install on Android or desktop as a web app

## Project Layout

- `public/` -> static site files deployed to Cloudflare Pages
- `functions/api/` -> Cloudflare Pages Functions
- `schema.sql` -> D1 table schema
- `wrangler.toml` -> Cloudflare config
- `.dev.vars.example` -> local development secrets template

## One-Time Setup

1. Install dependencies:

```powershell
cmd /c npm install
```

2. Log in to Cloudflare:

```powershell
npx wrangler login
```

3. Create a D1 database:

```powershell
npx wrangler d1 create nutrition-tracker
```

4. Copy the returned `database_id` into `wrangler.toml`.

5. Apply the schema to the remote D1 database:

```powershell
npx wrangler d1 execute nutrition-tracker --remote --file=schema.sql
```

6. Create local dev secrets:

```powershell
Copy-Item .\.dev.vars.example .\.dev.vars
```

Then edit `.dev.vars` and add your real values.

7. Add production secrets to Cloudflare Pages:

```powershell
npx wrangler pages secret put GEMINI_API_KEY --project-name nutrition-tracker
npx wrangler pages secret put ACCOUNT_SETUP_CODE --project-name nutrition-tracker
```

Optional model override:

```powershell
npx wrangler pages secret put GEMINI_MODEL --project-name nutrition-tracker
```

## Local Cloudflare Development

Run the app locally with Cloudflare Pages + Functions + D1 emulation:

```powershell
npm run dev
```

Then open the local URL Wrangler prints.

## Deploy To Free Cloudflare Pages Domain

Deploy the app:

```powershell
npm run deploy
```

Cloudflare will deploy the site and give you a free `*.pages.dev` URL.

After deployment:

- open the `pages.dev` URL on Android in Chrome
- create your owner account once using the setup code secret
- sign in on any device to load the same meals, goals, and custom foods
- tap `Install app` or use the browser menu to add it to your home screen

## Notes

- `public/` is the deployable site root.
- Existing legacy meals from the old single-user table are imported into the first account automatically.
- Gemini secrets and the setup code should stay in Cloudflare secrets or `.dev.vars`, never in committed files.
