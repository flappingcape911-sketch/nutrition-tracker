# Nutrition Tracker

A lightweight browser-based nutrition tracker for logging meals each day and reviewing macro + micronutrient intake.

## Features

- Log meals by date and time
- Save your age, weight, height, and daily calorie/macro goals
- Build meals from a built-in food library
- Save custom foods with macro and micronutrient values
- Get per-meal analysis for calories, macros, and key micronutrients
- Describe a meal in plain language and let Gemini estimate calories plus macro and micronutrient totals using your saved profile and custom AI instructions
- Review daily totals for calories, protein, carbs, fat, fiber, calcium, iron, potassium, sodium, vitamin C, and vitamin A
- Meal logs can be saved into MySQL on your laptop through the local server
- Browser `localStorage` is kept as a backup cache when MySQL is unavailable
- Installable PWA experience for Android and desktop browsers

## Run

1. Copy `.env.example` to `.env`
2. Fill in your MySQL and Gemini values once
3. Make sure MySQL is running on your laptop
4. Run `npm start`
5. Open `http://localhost:3000`
6. Install it from your browser using the in-app `Install app` button or the browser menu

Example PowerShell:

```powershell
Copy-Item .\.env.example .\.env
# edit .env with your values
npm start
```

Example `.env`:

```dotenv
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password_here
MYSQL_DATABASE=nutrition_tracker

GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

PORT=3000
```

Optional:

- Set `GEMINI_MODEL` to choose a different model
- Set `PORT` to change the local server port
- You can use `GOOGLE_API_KEY` instead of `GEMINI_API_KEY`

## Notes

- Daily reference values are general-purpose defaults, not personalized medical targets.
- Nutrient values in the starter food library are approximate.
- AI meal estimates are best-effort approximations and depend on how clearly you describe portions and ingredients.
- The server creates the `nutrition_tracker` database automatically if your MySQL user has permission.
- Meals are stored in a MySQL table named `meals`.
- `.env` is ignored by git so your keys and passwords stay local to your laptop.
