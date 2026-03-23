const http = require("http");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

loadEnvFile(path.join(__dirname, ".env"));

const PORT = Number(process.env.PORT || 3000);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const MYSQL_HOST = process.env.MYSQL_HOST || "127.0.0.1";
const MYSQL_PORT = Number(process.env.MYSQL_PORT || 3306);
const MYSQL_USER = process.env.MYSQL_USER || "";
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "";
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || "nutrition_tracker";
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const MEAL_ANALYSIS_SCHEMA = {
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
          vitaminA: { type: "number" },
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
          "vitaminA",
        ],
      },
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
        vitaminA: { type: "number" },
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
        "vitaminA",
      ],
    },
  },
  required: ["confidence", "assumptions", "analysis_summary", "ingredients", "totals"],
};

let dbPool = null;
let dbInitPromise = null;

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = requestUrl.pathname;

    if (req.method === "GET" && pathname === "/api/health") {
      return sendJson(res, 200, {
        ok: true,
        geminiConfigured: Boolean(GEMINI_API_KEY),
        geminiModel: GEMINI_MODEL,
        mysqlConfigured: hasMysqlConfig(),
        mysqlDatabase: MYSQL_DATABASE,
        mysqlReady: await canReachMysql(),
      });
    }

    if (req.method === "GET" && pathname === "/api/logs") {
      await ensureDatabaseReady();
      const logs = await listLogsGroupedByDate();
      return sendJson(res, 200, { logs });
    }

    if (req.method === "POST" && pathname === "/api/logs") {
      await ensureDatabaseReady();
      const body = await readJsonBody(req);
      validateLogPayload(body);
      await upsertMeal(body.mealDate, body.meal);
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "DELETE" && pathname.startsWith("/api/logs/")) {
      await ensureDatabaseReady();
      const mealId = pathname.split("/").pop();
      if (!mealId) {
        return sendJson(res, 400, { error: "Meal id is required." });
      }
      await deleteMeal(mealId);
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "POST" && pathname === "/api/analyze-meal") {
      const body = await readJsonBody(req);
      if (!GEMINI_API_KEY) {
        return sendJson(res, 500, {
          error: "GEMINI_API_KEY is not set. Start the server with your Gemini API key to enable AI meal analysis.",
        });
      }
      if (!body.mealDescription || typeof body.mealDescription !== "string") {
        return sendJson(res, 400, { error: "Meal description is required." });
      }

      const analysis = await analyzeMeal(body.mealName || "Meal", body.mealDescription, {
        profile: body.profile || {},
        aiInstructions: body.aiInstructions || "",
      });
      return sendJson(res, 200, analysis);
    }

    if (req.method === "GET") {
      return serveStaticFile(requestUrl.pathname, res);
    }

    return sendJson(res, 404, { error: "Not found." });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || "Unexpected server error." });
  }
});

server.listen(PORT, () => {
  console.log(`Nutrition tracker running at http://localhost:${PORT}`);
});

function hasMysqlConfig() {
  return Boolean(MYSQL_USER);
}

async function canReachMysql() {
  if (!hasMysqlConfig()) {
    return false;
  }
  try {
    await ensureDatabaseReady();
    return true;
  } catch {
    return false;
  }
}

async function ensureDatabaseReady() {
  if (dbPool) {
    return dbPool;
  }

  if (!hasMysqlConfig()) {
    throw new Error("MySQL is not configured. Set MYSQL_USER and optionally MYSQL_PASSWORD, MYSQL_HOST, MYSQL_PORT, and MYSQL_DATABASE.");
  }

  if (!dbInitPromise) {
    dbInitPromise = initializeDatabase();
  }

  dbPool = await dbInitPromise;
  return dbPool;
}

async function initializeDatabase() {
  const adminConnection = await mysql.createConnection({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    multipleStatements: false,
  });

  await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\``);
  await adminConnection.end();

  const pool = mysql.createPool({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 8,
    namedPlaceholders: true,
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS meals (
      id VARCHAR(80) PRIMARY KEY,
      meal_date DATE NOT NULL,
      meal_time VARCHAR(8) NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      payload LONGTEXT NOT NULL,
      INDEX idx_meal_date (meal_date)
    )
  `);

  return pool;
}

async function listLogsGroupedByDate() {
  const pool = await ensureDatabaseReady();
  const [rows] = await pool.query(`
    SELECT meal_date, payload
    FROM meals
    ORDER BY meal_date DESC, meal_time ASC, created_at ASC
  `);

  const logs = {};
  rows.forEach((row) => {
    const dateKey = formatDateOnly(row.meal_date);
    if (!logs[dateKey]) {
      logs[dateKey] = [];
    }
    logs[dateKey].push(JSON.parse(row.payload));
  });
  return logs;
}

async function upsertMeal(mealDate, meal) {
  const pool = await ensureDatabaseReady();
  const payload = JSON.stringify(meal);
  await pool.execute(
    `
      INSERT INTO meals (id, meal_date, meal_time, created_at, updated_at, payload)
      VALUES (?, ?, ?, ?, NOW(), ?)
      ON DUPLICATE KEY UPDATE
        meal_date = VALUES(meal_date),
        meal_time = VALUES(meal_time),
        updated_at = NOW(),
        payload = VALUES(payload)
    `,
    [meal.id, mealDate, meal.time || null, toMysqlDateTime(meal.createdAt), payload]
  );
}

async function deleteMeal(mealId) {
  const pool = await ensureDatabaseReady();
  await pool.execute("DELETE FROM meals WHERE id = ?", [mealId]);
}

function validateLogPayload(body) {
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

async function analyzeMeal(mealName, mealDescription, options = {}) {
  const prompt = [
    "You estimate nutrition for meals described in natural language.",
    "Infer reasonable serving sizes when the user does not provide exact amounts.",
    "Return best-effort estimates for calories, macro nutrients, and key micronutrients.",
    "Use common food composition references and conservative assumptions when uncertain.",
    "All nutrient amounts must be numeric and represent one total meal analysis.",
    "Vitamin A must be in mcg. Calcium, potassium, sodium in mg. Fiber, protein, carbs, fat in grams.",
  ].join(" ");

  const profileNotes = [];
  const profile = options.profile || {};
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

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: prompt }] },
      contents: [{
        parts: [{
          text: `Meal name: ${mealName}\nMeal description: ${mealDescription}\n${contextualNotes.join("\n")}`,
        }],
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: MEAL_ANALYSIS_SCHEMA,
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || "Gemini request failed.");
  }

  const outputText = extractGeminiText(payload);
  if (!outputText) {
    throw new Error("Gemini returned no structured content.");
  }

  return JSON.parse(outputText);
}

function extractGeminiText(payload) {
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

function serveStaticFile(pathname, res) {
  const requestedPath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    return sendJson(res, 403, { error: "Forbidden." });
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (error.code === "ENOENT") {
        return sendJson(res, 404, { error: "File not found." });
      }
      return sendJson(res, 500, { error: "Unable to read file." });
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(data);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

function toMysqlDateTime(value) {
  const date = value ? new Date(value) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatDateOnly(value) {
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  });
}
