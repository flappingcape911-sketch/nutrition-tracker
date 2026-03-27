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

project steps
- open the `https://nutrition-tracker-cd6.pages.dev/` URL on Android in Chrome
- create your owner account
- sign in on any device to load the same meals, goals, and custom foods
- tap `Install app` or use the browser menu to add it to your home screen

## Notes

- `public/` is the deployable site root.
- Existing legacy meals from the old single-user table are imported into the first account automatically.
- Gemini secrets and the setup code should stay in Cloudflare secrets or `.dev.vars`, never in committed files.
