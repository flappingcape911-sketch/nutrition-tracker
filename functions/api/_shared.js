const DEFAULT_PROFILE = {
  age: "",
  weightKg: "",
  heightCm: "",
  calorieGoal: "",
  proteinGoal: "",
  carbGoal: "",
  fatGoal: "",
  fiberGoal: "",
  aiInstructions: ""
};

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS meals (
    id TEXT PRIMARY KEY,
    meal_date TEXT NOT NULL,
    meal_time TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    payload TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_meals_meal_date ON meals (meal_date)`,
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id)`,
  `CREATE TABLE IF NOT EXISTS user_state (
    user_id TEXT PRIMARY KEY,
    profile_payload TEXT NOT NULL,
    custom_foods_payload TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS user_meals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    meal_date TEXT NOT NULL,
    meal_time TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    payload TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_user_meals_user_date ON user_meals (user_id, meal_date)`
];

const SESSION_COOKIE_NAME = "nutrition_tracker_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const MEAL_ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    assumptions: { type: "array", items: { type: "string" } },
    analysis_summary: { type: "string" },
    ingredients: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          estimated_serving: { type: "string" },
          calories: { type: "number" },
          protein: { type: "number" },
          carbs: { type: "number" },
          fat: { type: "number" },
          fiber: { type: "number" },
          calcium: { type: "number" },
          iron: { type: "number" },
          potassium: { type: "number" },
          sodium: { type: "number" },
          vitaminC: { type: "number" },
          vitaminA: { type: "number" }
        },
        required: [
          "name",
          "estimated_serving",
          "calories",
          "protein",
          "carbs",
          "fat",
          "fiber",
          "calcium",
          "iron",
          "potassium",
          "sodium",
          "vitaminC",
          "vitaminA"
        ]
      }
    },
    totals: {
      type: "object",
      additionalProperties: false,
      properties: {
        calories: { type: "number" },
        protein: { type: "number" },
        carbs: { type: "number" },
        fat: { type: "number" },
        fiber: { type: "number" },
        calcium: { type: "number" },
        iron: { type: "number" },
        potassium: { type: "number" },
        sodium: { type: "number" },
        vitaminC: { type: "number" },
        vitaminA: { type: "number" }
      },
      required: [
        "calories",
        "protein",
        "carbs",
        "fat",
        "fiber",
        "calcium",
        "iron",
        "potassium",
        "sodium",
        "vitaminC",
        "vitaminA"
      ]
    }
  },
  required: ["confidence", "assumptions", "analysis_summary", "ingredients", "totals"]
};

export async function ensureSchema(env) {
  if (!env.DB) {
    throw new Error("D1 database binding 'DB' is missing.");
  }

  await env.DB.batch(SCHEMA_STATEMENTS.map((statement) => env.DB.prepare(statement)));
}

export function json(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders
    }
  });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new Error("Invalid JSON body.");
  }
}

export function validateLogPayload(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid log payload.");
  }
  if (!body.mealDate || !/^\d{4}-\d{2}-\d{2}$/.test(body.mealDate)) {
    throw new Error("mealDate must be in YYYY-MM-DD format.");
  }
  if (!body.meal || typeof body.meal !== "object") {
    throw new Error("meal is required.");
  }
  if (!body.meal.id) {
    throw new Error("meal.id is required.");
  }
}

export function validateAccountPayload(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Account state is required.");
  }

  const profile = normalizeProfile(body.profile || {});
  const customFoods = normalizeCustomFoods(body.customFoods || []);
  return { profile, customFoods };
}

export async function countUsers(env) {
  await ensureSchema(env);
  const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM users").first();
  return Number(row?.count || 0);
}

export async function registerUser(env, email, password, setupCode) {
  await ensureSchema(env);

  if (!env.ACCOUNT_SETUP_CODE) {
    throw new Error("ACCOUNT_SETUP_CODE is not configured in Cloudflare.");
  }
  if (setupCode !== env.ACCOUNT_SETUP_CODE) {
    throw new Error("Setup code is incorrect.");
  }
  if ((await countUsers(env)) > 0) {
    throw new Error("This tracker already has an owner account. Please sign in.");
  }

  const normalizedEmail = normalizeEmail(email);
  validatePassword(password);
  const salt = randomToken();
  const passwordHash = await hashPassword(password, salt);
  const userId = randomId();
  const now = new Date().toISOString();

  await env.DB.prepare(`
    INSERT INTO users (id, email, password_salt, password_hash, created_at)
    VALUES (?1, ?2, ?3, ?4, ?5)
  `).bind(userId, normalizedEmail, salt, passwordHash, now).run();

  await ensureUserState(env, userId);
  await maybeImportLegacyMeals(env, userId);
  return createSession(env, userId, normalizedEmail);
}

export async function loginUser(env, email, password) {
  await ensureSchema(env);

  const normalizedEmail = normalizeEmail(email);
  validatePassword(password);
  const user = await env.DB.prepare(`
    SELECT id, email, password_salt, password_hash
    FROM users
    WHERE email = ?1
    LIMIT 1
  `).bind(normalizedEmail).first();

  if (!user) {
    throw new Error("Incorrect email or password.");
  }

  const suppliedHash = await hashPassword(password, user.password_salt);
  if (suppliedHash !== user.password_hash) {
    throw new Error("Incorrect email or password.");
  }

  await ensureUserState(env, user.id);
  await maybeImportLegacyMeals(env, user.id);
  return createSession(env, user.id, user.email);
}

export async function logoutUser(env, request) {
  await ensureSchema(env);
  const token = readSessionToken(request);
  if (!token) {
    return;
  }
  const tokenHash = await sha256Base64(token);
  await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?1").bind(tokenHash).run();
}

export async function getSessionContext(request, env) {
  await ensureSchema(env);

  const registrationOpen = (await countUsers(env)) === 0;
  const token = readSessionToken(request);
  if (!token) {
    return { authenticated: false, registrationOpen, user: null };
  }

  const tokenHash = await sha256Base64(token);
  const row = await env.DB.prepare(`
    SELECT sessions.id, sessions.user_id, sessions.expires_at, users.email
    FROM sessions
    INNER JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ?1
    LIMIT 1
  `).bind(tokenHash).first();

  if (!row) {
    return { authenticated: false, registrationOpen, user: null };
  }

  const now = new Date().toISOString();
  if (row.expires_at <= now) {
    await env.DB.prepare("DELETE FROM sessions WHERE id = ?1").bind(row.id).run();
    return { authenticated: false, registrationOpen, user: null };
  }

  return {
    authenticated: true,
    registrationOpen,
    user: {
      id: row.user_id,
      email: row.email
    }
  };
}

export async function requireUser(request, env) {
  const session = await getSessionContext(request, env);
  if (!session.authenticated || !session.user) {
    throw new Error("Please sign in to access your nutrition data.");
  }
  return session.user;
}

export async function getUserAccountState(env, userId) {
  await ensureSchema(env);
  await ensureUserState(env, userId);

  const row = await env.DB.prepare(`
    SELECT profile_payload, custom_foods_payload, updated_at
    FROM user_state
    WHERE user_id = ?1
    LIMIT 1
  `).bind(userId).first();

  return {
    profile: normalizeProfile(parseJsonOrFallback(row?.profile_payload, DEFAULT_PROFILE)),
    customFoods: normalizeCustomFoods(parseJsonOrFallback(row?.custom_foods_payload, [])),
    updatedAt: row?.updated_at || null
  };
}

export async function saveUserAccountState(env, userId, profile, customFoods) {
  await ensureSchema(env);
  const normalizedProfile = normalizeProfile(profile || {});
  const normalizedFoods = normalizeCustomFoods(customFoods || []);
  const now = new Date().toISOString();

  await env.DB.prepare(`
    INSERT INTO user_state (user_id, profile_payload, custom_foods_payload, updated_at)
    VALUES (?1, ?2, ?3, ?4)
    ON CONFLICT(user_id) DO UPDATE SET
      profile_payload = excluded.profile_payload,
      custom_foods_payload = excluded.custom_foods_payload,
      updated_at = excluded.updated_at
  `)
    .bind(userId, JSON.stringify(normalizedProfile), JSON.stringify(normalizedFoods), now)
    .run();

  return {
    profile: normalizedProfile,
    customFoods: normalizedFoods,
    updatedAt: now
  };
}

export async function listLogsGroupedByDate(env, userId) {
  await ensureSchema(env);
  await maybeImportLegacyMeals(env, userId);

  const { results } = await env.DB.prepare(`
    SELECT meal_date, payload
    FROM user_meals
    WHERE user_id = ?1
    ORDER BY meal_date DESC, meal_time ASC, created_at ASC
  `).bind(userId).all();

  const logs = {};
  for (const row of results || []) {
    if (!logs[row.meal_date]) {
      logs[row.meal_date] = [];
    }
    logs[row.meal_date].push(JSON.parse(row.payload));
  }
  return logs;
}

export async function upsertMeal(env, userId, mealDate, meal) {
  await ensureSchema(env);
  const payload = JSON.stringify(meal);
  const createdAt = meal.createdAt || new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO user_meals (id, user_id, meal_date, meal_time, created_at, updated_at, payload)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
    ON CONFLICT(id) DO UPDATE SET
      user_id = excluded.user_id,
      meal_date = excluded.meal_date,
      meal_time = excluded.meal_time,
      updated_at = excluded.updated_at,
      payload = excluded.payload
  `)
    .bind(meal.id, userId, mealDate, meal.time || null, createdAt, new Date().toISOString(), payload)
    .run();
}

export async function deleteMeal(env, userId, mealId) {
  await ensureSchema(env);
  await env.DB.prepare("DELETE FROM user_meals WHERE id = ?1 AND user_id = ?2").bind(mealId, userId).run();
}

export async function analyzeMeal(env, mealName, mealDescription, options = {}) {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in Cloudflare.");
  }

  const model = env.GEMINI_MODEL || "gemini-2.5-flash";
  const prompt = [
    "You estimate nutrition for meals described in natural language.",
    "Infer reasonable serving sizes when the user does not provide exact amounts.",
    "Return best-effort estimates for calories, macro nutrients, and key micronutrients.",
    "Use common food composition references and conservative assumptions when uncertain.",
    "All nutrient amounts must be numeric and represent one total meal analysis.",
    "Vitamin A must be in mcg. Calcium, potassium, sodium in mg. Fiber, protein, carbs, fat in grams."
  ].join(" ");

  const profile = options.profile || {};
  const profileNotes = [];
  if (profile.age) profileNotes.push(`Age: ${profile.age}`);
  if (profile.weightKg) profileNotes.push(`Weight: ${profile.weightKg} kg`);
  if (profile.heightCm) profileNotes.push(`Height: ${profile.heightCm} cm`);
  if (profile.calorieGoal) profileNotes.push(`Calorie goal: ${profile.calorieGoal} kcal/day`);
  if (profile.proteinGoal) profileNotes.push(`Protein goal: ${profile.proteinGoal} g/day`);
  if (profile.carbGoal) profileNotes.push(`Carb goal: ${profile.carbGoal} g/day`);
  if (profile.fatGoal) profileNotes.push(`Fat goal: ${profile.fatGoal} g/day`);
  if (profile.fiberGoal) profileNotes.push(`Fiber goal: ${profile.fiberGoal} g/day`);

  const contextualNotes = [];
  if (profileNotes.length) {
    contextualNotes.push(`User profile: ${profileNotes.join(", ")}.`);
  }
  if (options.aiInstructions) {
    contextualNotes.push(`User instructions: ${options.aiInstructions}`);
  }
  contextualNotes.push("Use this context to improve assumptions and analysis commentary, but do not distort nutrient totals just to match the user's goals.");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: prompt }] },
      contents: [{
        parts: [{
          text: `Meal name: ${mealName}\nMeal description: ${mealDescription}\n${contextualNotes.join("\n")}`
        }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: MEAL_ANALYSIS_SCHEMA
      }
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Gemini request failed.");
  }

  const text = extractGeminiText(payload);
  if (!text) {
    throw new Error("Gemini returned no structured content.");
  }

  return JSON.parse(text);
}

export function extractGeminiText(payload) {
  const candidate = Array.isArray(payload.candidates) ? payload.candidates[0] : null;
  const parts = candidate?.content?.parts;
  if (!Array.isArray(parts)) {
    return "";
  }

  for (const part of parts) {
    if (typeof part.text === "string" && part.text.trim()) {
      return part.text;
    }
  }

  return "";
}

export function buildSessionHeaders(token) {
  return {
    "set-cookie": `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}`
  };
}

export function buildLogoutHeaders() {
  return {
    "set-cookie": `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` 
  };
}

async function createSession(env, userId, email) {
  const token = randomToken();
  const tokenHash = await sha256Base64(token);
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();

  await env.DB.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at)
    VALUES (?1, ?2, ?3, ?4, ?5)
  `).bind(randomId(), userId, tokenHash, now, expiresAt).run();

  return {
    token,
    user: { id: userId, email }
  };
}

async function ensureUserState(env, userId) {
  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO user_state (user_id, profile_payload, custom_foods_payload, updated_at)
    VALUES (?1, ?2, ?3, ?4)
    ON CONFLICT(user_id) DO NOTHING
  `).bind(userId, JSON.stringify(DEFAULT_PROFILE), JSON.stringify([]), now).run();
}

async function maybeImportLegacyMeals(env, userId) {
  const existing = await env.DB.prepare("SELECT COUNT(*) AS count FROM user_meals WHERE user_id = ?1").bind(userId).first();
  if (Number(existing?.count || 0) > 0) {
    return;
  }

  try {
    const legacy = await env.DB.prepare(`
      SELECT id, meal_date, meal_time, created_at, updated_at, payload
      FROM meals
      ORDER BY meal_date DESC, meal_time ASC, created_at ASC
    `).all();

    const rows = legacy.results || [];
    if (!rows.length) {
      return;
    }

    await env.DB.batch(rows.map((row) => env.DB.prepare(`
      INSERT OR IGNORE INTO user_meals (id, user_id, meal_date, meal_time, created_at, updated_at, payload)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
    `).bind(row.id, userId, row.meal_date, row.meal_time, row.created_at, row.updated_at, row.payload)));
  } catch {
    // Ignore legacy import issues when the old meals table does not exist or has no data.
  }
}

function normalizeEmail(email) {
  const value = String(email || "").trim().toLowerCase();
  if (!value || !value.includes("@")) {
    throw new Error("Enter a valid email address.");
  }
  return value;
}

function validatePassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }
}

function normalizeProfile(profile) {
  return {
    age: stringifyValue(profile.age),
    weightKg: stringifyValue(profile.weightKg),
    heightCm: stringifyValue(profile.heightCm),
    calorieGoal: stringifyValue(profile.calorieGoal),
    proteinGoal: stringifyValue(profile.proteinGoal),
    carbGoal: stringifyValue(profile.carbGoal),
    fatGoal: stringifyValue(profile.fatGoal),
    fiberGoal: stringifyValue(profile.fiberGoal),
    aiInstructions: stringifyValue(profile.aiInstructions)
  };
}

function normalizeCustomFoods(customFoods) {
  if (!Array.isArray(customFoods)) {
    return [];
  }

  return customFoods
    .filter((food) => food && typeof food === "object" && !food.builtIn)
    .map((food) => ({
      id: String(food.id || randomId()),
      name: String(food.name || "Custom food"),
      serving: String(food.serving || "1 serving"),
      nutrients: normalizeNutrients(food.nutrients || {}),
      builtIn: false,
      createdAt: food.createdAt || new Date().toISOString()
    }));
}

function normalizeNutrients(nutrients) {
  const keys = ["calories", "protein", "carbs", "fat", "fiber", "calcium", "iron", "potassium", "sodium", "vitaminC", "vitaminA"];
  const normalized = {};
  for (const key of keys) {
    normalized[key] = Number(nutrients[key] || 0);
  }
  return normalized;
}

function stringifyValue(value) {
  return value == null ? "" : String(value).trim();
}

function parseJsonOrFallback(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function readSessionToken(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split("=");
    if (name === SESSION_COOKIE_NAME) {
      return rest.join("=");
    }
  }
  return "";
}

function randomId() {
  return crypto.randomUUID();
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );
  return toBase64(new Uint8Array(bits));
}

async function sha256Base64(value) {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return toBase64(new Uint8Array(digest));
}

function toBase64(bytes) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function toBase64Url(bytes) {
  return toBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

