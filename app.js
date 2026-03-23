const STORAGE_KEYS = {
  foods: "nutrition-tracker-foods-v1",
  logs: "nutrition-tracker-logs-v1",
  profile: "nutrition-tracker-profile-v1",
};

const DEFAULT_PROFILE = {
  age: "",
  weightKg: "",
  heightCm: "",
  calorieGoal: "",
  proteinGoal: "",
  carbGoal: "",
  fatGoal: "",
  fiberGoal: "",
  aiInstructions: "",
};

const DAILY_TARGETS = {
  calories: { label: "Calories", unit: "kcal", value: 2000 },
  fiber: { label: "Fiber", unit: "g", value: 28 },
  calcium: { label: "Calcium", unit: "mg", value: 1300 },
  iron: { label: "Iron", unit: "mg", value: 18 },
  potassium: { label: "Potassium", unit: "mg", value: 4700 },
  sodium: { label: "Sodium", unit: "mg", value: 2300, isUpperLimit: true },
  vitaminC: { label: "Vitamin C", unit: "mg", value: 90 },
  vitaminA: { label: "Vitamin A", unit: "mcg", value: 900 },
};

const TRACKED_NUTRIENTS = [
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
];

const BUILT_IN_FOODS = [
  makeFood("rolled-oats", "Rolled oats", "1/2 cup dry", { calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4, calcium: 21, iron: 1.5, potassium: 150, sodium: 2, vitaminC: 0, vitaminA: 0 }, true),
  makeFood("banana", "Banana", "1 medium", { calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, calcium: 6, iron: 0.3, potassium: 422, sodium: 1, vitaminC: 10.3, vitaminA: 4 }, true),
  makeFood("egg", "Egg", "1 large", { calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fiber: 0, calcium: 28, iron: 0.9, potassium: 69, sodium: 71, vitaminC: 0, vitaminA: 80 }, true),
  makeFood("chicken-breast", "Chicken breast", "100 g cooked", { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, calcium: 15, iron: 0.9, potassium: 256, sodium: 74, vitaminC: 0, vitaminA: 13 }, true),
  makeFood("brown-rice", "Brown rice", "1 cup cooked", { calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, calcium: 20, iron: 0.8, potassium: 84, sodium: 10, vitaminC: 0, vitaminA: 0 }, true),
  makeFood("broccoli", "Broccoli", "1 cup cooked", { calories: 55, protein: 3.7, carbs: 11.2, fat: 0.6, fiber: 5.1, calcium: 62, iron: 1, potassium: 458, sodium: 64, vitaminC: 101, vitaminA: 120 }, true),
  makeFood("greek-yogurt", "Greek yogurt", "170 g cup", { calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0, calcium: 187, iron: 0.1, potassium: 240, sodium: 61, vitaminC: 0, vitaminA: 7 }, true),
  makeFood("almonds", "Almonds", "28 g", { calories: 164, protein: 6, carbs: 6.1, fat: 14.2, fiber: 3.5, calcium: 76, iron: 1, potassium: 208, sodium: 0, vitaminC: 0, vitaminA: 0 }, true),
  makeFood("apple", "Apple", "1 medium", { calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, calcium: 11, iron: 0.2, potassium: 195, sodium: 2, vitaminC: 8.4, vitaminA: 5 }, true),
  makeFood("salmon", "Salmon", "100 g cooked", { calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0, calcium: 9, iron: 0.3, potassium: 363, sodium: 59, vitaminC: 0, vitaminA: 50 }, true),
  makeFood("spinach", "Spinach", "1 cup cooked", { calories: 41, protein: 5.3, carbs: 6.8, fat: 0.5, fiber: 4.3, calcium: 245, iron: 6.4, potassium: 839, sodium: 126, vitaminC: 17.6, vitaminA: 943 }, true),
  makeFood("milk", "Milk", "1 cup", { calories: 122, protein: 8, carbs: 12, fat: 4.8, fiber: 0, calcium: 305, iron: 0.1, potassium: 366, sodium: 107, vitaminC: 0, vitaminA: 112 }, true),
  makeFood("lentils", "Lentils", "1 cup cooked", { calories: 230, protein: 17.9, carbs: 39.9, fat: 0.8, fiber: 15.6, calcium: 37, iron: 6.6, potassium: 731, sodium: 4, vitaminC: 3, vitaminA: 8 }, true),
  makeFood("avocado", "Avocado", "1/2 fruit", { calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, calcium: 12, iron: 0.6, potassium: 487, sodium: 7, vitaminC: 10, vitaminA: 7 }, true),
  makeFood("peanut-butter", "Peanut butter", "2 tbsp", { calories: 188, protein: 8, carbs: 7, fat: 16, fiber: 2, calcium: 17, iron: 0.6, potassium: 208, sodium: 152, vitaminC: 0, vitaminA: 0 }, true),
  makeFood("sweet-potato", "Sweet potato", "1 medium baked", { calories: 112, protein: 2, carbs: 26, fat: 0.1, fiber: 3.9, calcium: 39, iron: 0.8, potassium: 438, sodium: 72, vitaminC: 22.3, vitaminA: 1096 }, true),
  makeFood("tofu", "Tofu", "100 g", { calories: 144, protein: 17.3, carbs: 3.3, fat: 8.7, fiber: 2.3, calcium: 350, iron: 2.7, potassium: 237, sodium: 14, vitaminC: 0.2, vitaminA: 25 }, true),
  makeFood("chickpeas", "Chickpeas", "1 cup cooked", { calories: 269, protein: 14.5, carbs: 45, fat: 4.3, fiber: 12.5, calcium: 80, iron: 4.7, potassium: 477, sodium: 11, vitaminC: 2, vitaminA: 3 }, true),
];

const state = {
  foods: [],
  logs: {},
  profile: { ...DEFAULT_PROFILE },
  currentDate: todayIso(),
  currentMealItems: [],
  aiDraft: null,
  isAnalyzingMeal: false,
  isInlineCustomizerOpen: false,
};

const refs = {};
let deferredInstallPrompt = null;

document.addEventListener("DOMContentLoaded", async () => {
  cacheDom();
  await hydrateState();
  bindEvents();
  initializeFormDefaults();
  renderAll();
  initializeInstallFlow();
  registerServiceWorker();
  checkAiAvailability();
  checkStorageAvailability();
});

function cacheDom() {
  refs.dateInput = document.querySelector("#log-date");
  refs.storageStatus = document.querySelector("#storage-status");
  refs.installAppBtn = document.querySelector("#install-app-btn");
  refs.installStatus = document.querySelector("#install-status");
  refs.statsGrid = document.querySelector("#stats-grid");
  refs.macroLegend = document.querySelector("#macro-legend");
  refs.dailyAnalysisCopy = document.querySelector("#daily-analysis-copy");
  refs.microsGrid = document.querySelector("#micros-grid");
  refs.foodSelect = document.querySelector("#food-select");
  refs.servingsInput = document.querySelector("#servings-input");
  refs.addFoodBtn = document.querySelector("#add-food-btn");
  refs.analyzeAiBtn = document.querySelector("#analyze-ai-btn");
  refs.mealDescription = document.querySelector("#meal-description");
  refs.aiStatus = document.querySelector("#ai-status");
  refs.toggleCustomizeBtn = document.querySelector("#toggle-customize-btn");
  refs.closeCustomizeBtn = document.querySelector("#close-customize-btn");
  refs.inlineCustomBuilder = document.querySelector("#inline-custom-builder");
  refs.inlineCustomFoodForm = document.querySelector("#inline-custom-food-form");
  refs.saveInlineCustomFoodBtn = document.querySelector("#save-inline-custom-food-btn");
  refs.mealForm = document.querySelector("#meal-form");
  refs.mealName = document.querySelector("#meal-name");
  refs.mealTime = document.querySelector("#meal-time");
  refs.mealNotes = document.querySelector("#meal-notes");
  refs.currentMealCaption = document.querySelector("#current-meal-caption");
  refs.currentMealItems = document.querySelector("#current-meal-items");
  refs.mealPreview = document.querySelector("#meal-preview");
  refs.customFoodForm = document.querySelector("#custom-food-form");
  refs.customFoodList = document.querySelector("#custom-food-list");
  refs.profileForm = document.querySelector("#profile-form");
  refs.profileAge = document.querySelector("#profile-age");
  refs.profileWeight = document.querySelector("#profile-weight");
  refs.profileHeight = document.querySelector("#profile-height");
  refs.profileCalorieGoal = document.querySelector("#profile-calorie-goal");
  refs.profileProteinGoal = document.querySelector("#profile-protein-goal");
  refs.profileCarbGoal = document.querySelector("#profile-carb-goal");
  refs.profileFatGoal = document.querySelector("#profile-fat-goal");
  refs.profileFiberGoal = document.querySelector("#profile-fiber-goal");
  refs.profileAiInstructions = document.querySelector("#profile-ai-instructions");
  refs.profileStatus = document.querySelector("#profile-status");
  refs.mealsLog = document.querySelector("#meals-log");
  refs.mealTemplate = document.querySelector("#meal-card-template");
  refs.macroProteinBar = document.querySelector("#macro-protein-bar");
  refs.macroCarbsBar = document.querySelector("#macro-carbs-bar");
  refs.macroFatBar = document.querySelector("#macro-fat-bar");
}

async function hydrateState() {
  state.profile = loadProfile();
  state.foods = loadFoods();
  state.logs = await loadLogs();
}

function bindEvents() {
  refs.dateInput.addEventListener("change", handleDateChange);
  refs.installAppBtn.addEventListener("click", installApp);
  refs.analyzeAiBtn.addEventListener("click", analyzeMealWithAI);
  refs.addFoodBtn.addEventListener("click", addFoodToCurrentMeal);
  refs.toggleCustomizeBtn.addEventListener("click", openInlineCustomizer);
  refs.closeCustomizeBtn.addEventListener("click", closeInlineCustomizer);
  refs.mealForm.addEventListener("submit", saveMeal);
  refs.customFoodForm.addEventListener("submit", saveCustomFood);
  refs.profileForm.addEventListener("submit", saveProfileSettings);
  refs.saveInlineCustomFoodBtn.addEventListener("click", saveInlineCustomFood);
  refs.currentMealItems.addEventListener("click", handleCurrentMealClick);
  refs.customFoodList.addEventListener("click", handleCustomFoodListClick);
  refs.mealsLog.addEventListener("click", handleMealLogClick);
}

function initializeFormDefaults() {
  refs.dateInput.value = state.currentDate;
  refs.mealTime.value = currentTime();
  populateProfileForm();
  setProfileStatus("Your goals and AI preferences are stored on this device.", "");
}

function renderAll() {
  renderFoodSelect();
  renderInlineCustomizer();
  renderAiControls();
  renderCurrentMeal();
  renderCustomFoodList();

  const meals = getMealsForDate(state.currentDate);
  const totals = calculateTotalsFromMeals(meals);

  renderDailyStats(totals, meals.length);
  renderMacroBreakdown(totals);
  renderDailyAnalysis(buildDayAnalysis(totals, meals));
  renderMicroGrid(totals);
  renderMealsLog(meals);
}

function renderInlineCustomizer() {
  refs.inlineCustomBuilder.classList.toggle("hidden", !state.isInlineCustomizerOpen);
  refs.inlineCustomBuilder.setAttribute("aria-hidden", String(!state.isInlineCustomizerOpen));
  refs.toggleCustomizeBtn.textContent = state.isInlineCustomizerOpen ? "Hide customize" : "Customize";
}

function renderAiControls() {
  refs.analyzeAiBtn.disabled = state.isAnalyzingMeal;
  refs.analyzeAiBtn.textContent = state.isAnalyzingMeal ? "Analyzing..." : "Analyze with AI";
}

function initializeInstallFlow() {
  if (!refs.installAppBtn || !refs.installStatus) {
    return;
  }

  setInstallStatus("If the browser does not show a prompt, use the browser menu and choose Install app or Add to home screen.", "");

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    setInstallStatus("This tracker can be installed now. Tap Install app for a home-screen app experience.", "success");
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    refs.installAppBtn.classList.add("hidden");
    setInstallStatus("Nutrition Tracker is installed. You can open it like a regular app now.", "success");
  });
}

async function installApp() {
  if (!deferredInstallPrompt) {
    setInstallStatus(getInstallHelpText(), "");
    return;
  }

  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  refs.installAppBtn.classList.add("hidden");
  if (choice.outcome === "accepted") {
    setInstallStatus("Install accepted. The app should appear on your device shortly.", "success");
    return;
  }
  setInstallStatus("Install dismissed. You can try again from the browser menu any time.", "");
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register("/service-worker.js");
  } catch (error) {
    console.error("Service worker registration failed", error);
  }
}

function renderFoodSelect() {
  const currentValue = refs.foodSelect.value;
  refs.foodSelect.innerHTML = "";

  state.foods
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((food) => {
      const option = document.createElement("option");
      option.value = food.id;
      option.textContent = `${food.name} (${food.serving})`;
      refs.foodSelect.appendChild(option);
    });

  if (currentValue && state.foods.some((food) => food.id === currentValue)) {
    refs.foodSelect.value = currentValue;
  }
}

function renderDailyStats(totals, mealCount) {
  const macroDistribution = getMacroDistribution(totals);
  const calorieGoal = toNumberOrNull(state.profile.calorieGoal) || DAILY_TARGETS.calories.value;
  const proteinGoal = toNumberOrNull(state.profile.proteinGoal);
  const carbGoal = toNumberOrNull(state.profile.carbGoal);
  const fatGoal = toNumberOrNull(state.profile.fatGoal);
  const stats = [
    {
      label: "Calories",
      value: `${formatNumber(totals.calories, 0)} kcal`,
      subvalue: `${formatPercent(totals.calories / calorieGoal)} of ${formatNumber(calorieGoal, 0)} kcal goal`,
    },
    {
      label: "Protein",
      value: `${formatNumber(totals.protein)} g`,
      subvalue: proteinGoal
        ? `${formatPercent(totals.protein / proteinGoal)} of ${formatNumber(proteinGoal, 0)} g goal`
        : `${formatNumber(macroDistribution.protein, 0)}% of macro calories`,
    },
    {
      label: "Carbs",
      value: `${formatNumber(totals.carbs)} g`,
      subvalue: carbGoal
        ? `${formatPercent(totals.carbs / carbGoal)} of ${formatNumber(carbGoal, 0)} g goal`
        : `${formatNumber(macroDistribution.carbs, 0)}% of macro calories`,
    },
    {
      label: "Fat",
      value: `${formatNumber(totals.fat)} g`,
      subvalue: fatGoal
        ? `${formatPercent(totals.fat / fatGoal)} of ${formatNumber(fatGoal, 0)} g goal`
        : `${formatNumber(macroDistribution.fat, 0)}% of macro calories`,
    },
    {
      label: "Meals logged",
      value: String(mealCount),
      subvalue: mealCount === 1 ? "1 meal saved" : `${mealCount} meals saved`,
    },
  ];

  refs.statsGrid.innerHTML = "";
  stats.forEach((stat) => {
    const tile = document.createElement("div");
    tile.className = "stat-tile";
    tile.innerHTML = `
      <span class="label">${stat.label}</span>
      <div class="value">${stat.value}</div>
      <div class="subvalue">${stat.subvalue}</div>
    `;
    refs.statsGrid.appendChild(tile);
  });
}

function renderMacroBreakdown(totals) {
  const distribution = getMacroDistribution(totals);
  refs.macroProteinBar.style.width = `${distribution.protein}%`;
  refs.macroCarbsBar.style.width = `${distribution.carbs}%`;
  refs.macroFatBar.style.width = `${distribution.fat}%`;

  refs.macroLegend.innerHTML = "";
  [
    { label: "Protein", grams: totals.protein, share: distribution.protein },
    { label: "Carbs", grams: totals.carbs, share: distribution.carbs },
    { label: "Fat", grams: totals.fat, share: distribution.fat },
  ].forEach((macro) => {
    const row = document.createElement("div");
    row.className = "macro-legend-item";
    row.innerHTML = `<span>${macro.label}</span><strong>${formatNumber(macro.grams)} g - ${formatNumber(macro.share, 0)}%</strong>`;
    refs.macroLegend.appendChild(row);
  });
}

function renderDailyAnalysis(analysis) {
  refs.dailyAnalysisCopy.textContent = analysis.summary;
}

function renderMicroGrid(totals) {
  const nutrientKeys = ["fiber", "calcium", "iron", "potassium", "sodium", "vitaminC", "vitaminA"];
  refs.microsGrid.innerHTML = "";

  nutrientKeys.forEach((key) => {
    const target = DAILY_TARGETS[key];
    const current = totals[key];
    const ratio = current / target.value;
    const fillPercent = Math.min(ratio * 100, 160);
    const helperText = target.isUpperLimit
      ? ratio > 1
        ? "Over the suggested upper limit"
        : "Within the suggested upper limit"
      : ratio >= 1
        ? "Daily target reached"
        : `${formatPercent(ratio)} of target`;
    const fillClass = target.isUpperLimit
      ? ratio > 1 ? "limit" : "warn"
      : ratio >= 1 ? "" : "warn";

    const card = document.createElement("div");
    card.className = "micro-card";
    card.innerHTML = `
      <div class="micro-card-header">
        <strong>${target.label}</strong>
        <span>${formatNumber(current)} ${target.unit}</span>
      </div>
      <div class="micro-bar">
        <span class="micro-fill ${fillClass}" style="width:${fillPercent}%"></span>
      </div>
      <div class="micro-card-footer">
        <span>${helperText}</span>
        <span>Goal: ${target.value} ${target.unit}</span>
      </div>
    `;
    refs.microsGrid.appendChild(card);
  });
}

function renderCurrentMeal() {
  if (!state.currentMealItems.length && !state.aiDraft) {
    refs.currentMealCaption.textContent = "No foods added yet.";
    refs.currentMealItems.className = "pill-list empty-state";
    refs.currentMealItems.textContent = "Describe a meal for AI analysis or add foods manually to start building this meal.";
    refs.mealPreview.innerHTML = "";
    return;
  }

  if (state.aiDraft) {
    refs.currentMealCaption.textContent = "AI estimated this meal from your description.";
  } else {
    refs.currentMealCaption.textContent = `${state.currentMealItems.length} item${state.currentMealItems.length === 1 ? "" : "s"} ready to save`;
  }

  refs.currentMealItems.className = "pill-list";
  refs.currentMealItems.innerHTML = "";

  const previewEntries = state.aiDraft ? state.aiDraft.entries : state.currentMealItems;
  previewEntries.forEach((entry) => {
    const pill = document.createElement("div");
    pill.className = "food-pill";
    const removeButton = state.aiDraft
      ? ""
      : `<button type="button" data-entry-id="${entry.id}" aria-label="Remove ${escapeHtml(entry.food.name)}">Remove</button>`;
    pill.innerHTML = `
      <span>${escapeHtml(entry.food.name)} - ${formatNumber(entry.servings)} x ${escapeHtml(entry.food.serving)}</span>
      ${removeButton}
    `;
    refs.currentMealItems.appendChild(pill);
  });

  const totals = state.aiDraft ? state.aiDraft.totals : calculateTotalsFromEntries(state.currentMealItems);
  const analysis = state.aiDraft
    ? {
        summary: state.aiDraft.analysisSummary,
        highlights: [
          { text: `AI estimate (${state.aiDraft.confidence} confidence)` },
          ...buildMealAnalysis(totals).highlights,
        ],
      }
    : buildMealAnalysis(totals);
  const assumptionMarkup = state.aiDraft && state.aiDraft.assumptions.length
    ? `<p class="helper-text">Assumptions: ${state.aiDraft.assumptions.map(escapeHtml).join("; ")}</p>`
    : "";

  refs.mealPreview.innerHTML = `
    <div class="meal-preview-card">
      <h3>Current meal analysis</h3>
      <div class="meal-preview-metrics">
        ${renderMetricTile("Calories", `${formatNumber(totals.calories, 0)} kcal`)}
        ${renderMetricTile("Protein", `${formatNumber(totals.protein)} g`)}
        ${renderMetricTile("Carbs", `${formatNumber(totals.carbs)} g`)}
        ${renderMetricTile("Fat", `${formatNumber(totals.fat)} g`)}
      </div>
      <p>${analysis.summary}</p>
      ${assumptionMarkup}
      <div class="meal-highlights">
        ${analysis.highlights.map((item) => `<span class="chip ${item.variant || ""}">${item.text}</span>`).join("")}
      </div>
    </div>
  `;
}

function renderCustomFoodList() {
  const customFoods = state.foods.filter((food) => !food.builtIn);
  if (!customFoods.length) {
    refs.customFoodList.className = "custom-food-list empty-state";
    refs.customFoodList.textContent = "No custom foods yet.";
    return;
  }

  refs.customFoodList.className = "custom-food-list";
  refs.customFoodList.innerHTML = "";

  customFoods
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .forEach((food) => {
      const item = document.createElement("div");
      item.className = "custom-food-item";
      item.innerHTML = `
        <div class="custom-food-copy">
          <strong>${escapeHtml(food.name)}</strong>
          <span class="custom-food-meta">${escapeHtml(food.serving)} - ${formatNumber(food.nutrients.calories, 0)} kcal - P ${formatNumber(food.nutrients.protein)} g - C ${formatNumber(food.nutrients.carbs)} g - F ${formatNumber(food.nutrients.fat)} g</span>
        </div>
        <button type="button" class="button ghost" data-food-id="${food.id}">Delete</button>
      `;
      refs.customFoodList.appendChild(item);
    });
}

function renderMealsLog(meals) {
  if (!meals.length) {
    refs.mealsLog.className = "meals-log empty-state";
    refs.mealsLog.textContent = "No meals logged for this day yet.";
    return;
  }

  refs.mealsLog.className = "meals-log";
  refs.mealsLog.innerHTML = "";

  meals
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time))
    .forEach((meal) => {
      const fragment = refs.mealTemplate.content.cloneNode(true);
      fragment.querySelector(".meal-title").textContent = meal.name;
      fragment.querySelector(".meal-time").textContent = `${formatMealTime(meal.time)} - ${meal.entries.length} item${meal.entries.length === 1 ? "" : "s"}`;
      fragment.querySelector(".delete-meal-btn").dataset.mealId = meal.id;

      const chipRow = fragment.querySelector(".meal-chip-row");
      meal.entries.forEach((entry) => {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = `${entry.food.name} x ${formatNumber(entry.servings)}`;
        chipRow.appendChild(chip);
      });

      const notes = fragment.querySelector(".meal-notes");
      const noteParts = [];
      if (meal.description) {
        noteParts.push(meal.description);
      }
      if (meal.notes) {
        noteParts.push(meal.notes);
      }

      if (noteParts.length) {
        notes.textContent = noteParts.join(" ");
      } else {
        notes.remove();
      }

      const metricGrid = fragment.querySelector(".meal-analysis-grid");
      metricGrid.innerHTML = [
        renderMetricTile("Calories", `${formatNumber(meal.totals.calories, 0)} kcal`),
        renderMetricTile("Protein", `${formatNumber(meal.totals.protein)} g`),
        renderMetricTile("Carbs", `${formatNumber(meal.totals.carbs)} g`),
        renderMetricTile("Fat", `${formatNumber(meal.totals.fat)} g`),
      ].join("");

      const summary = document.createElement("p");
      summary.className = "meal-notes";
      summary.textContent = meal.analysis.summary;
      metricGrid.after(summary);

      const highlightRow = fragment.querySelector(".meal-highlights");
      meal.analysis.highlights.forEach((item) => {
        const chip = document.createElement("span");
        chip.className = `chip ${item.variant || ""}`.trim();
        chip.textContent = item.text;
        highlightRow.appendChild(chip);
      });

      if (meal.aiAssumptions && meal.aiAssumptions.length) {
        meal.aiAssumptions.forEach((assumption) => {
          const chip = document.createElement("span");
          chip.className = "chip";
          chip.textContent = assumption;
          highlightRow.appendChild(chip);
        });
      }

      refs.mealsLog.appendChild(fragment);
    });
}

function handleDateChange(event) {
  state.currentDate = event.target.value || todayIso();
  renderAll();
}

function addFoodToCurrentMeal() {
  const food = state.foods.find((item) => item.id === refs.foodSelect.value);
  const servings = Number(refs.servingsInput.value);

  if (!food || !Number.isFinite(servings) || servings <= 0) {
    return;
  }

  state.aiDraft = null;
  setAiStatus("Manual mode active. Add foods or analyze another description.", "");
  state.currentMealItems.push({
    id: uid("entry"),
    food: clone(food),
    servings,
  });

  refs.servingsInput.value = "1";
  renderCurrentMeal();
}

async function saveMeal(event) {
  event.preventDefault();

  const mealName = refs.mealName.value.trim() || defaultMealName();
  if ((!state.currentMealItems.length && !state.aiDraft)) {
    return;
  }

  const entries = state.aiDraft
    ? clone(state.aiDraft.entries)
    : state.currentMealItems.map((entry) => ({
        id: entry.id,
        food: clone(entry.food),
        servings: entry.servings,
      }));
  const totals = state.aiDraft ? clone(state.aiDraft.totals) : calculateTotalsFromEntries(entries);
  const heuristicAnalysis = buildMealAnalysis(totals);
  const meal = {
    id: uid("meal"),
    name: mealName,
    time: refs.mealTime.value || currentTime(),
    notes: refs.mealNotes.value.trim(),
    description: refs.mealDescription.value.trim(),
    entries,
    totals,
    analysis: state.aiDraft
      ? {
          summary: state.aiDraft.analysisSummary,
          highlights: [{ text: `AI estimate (${state.aiDraft.confidence} confidence)` }, ...heuristicAnalysis.highlights],
        }
      : heuristicAnalysis,
    aiAssumptions: state.aiDraft ? clone(state.aiDraft.assumptions) : [],
    source: state.aiDraft ? "ai" : "manual",
    createdAt: new Date().toISOString(),
  };

  if (!state.logs[state.currentDate]) {
    state.logs[state.currentDate] = [];
  }

  try {
    await saveMealToServer(state.currentDate, meal);
  } catch (error) {
    setStorageStatus(error.message || "Unable to save this meal to MySQL on your laptop.", "error");
    return;
  }

  state.logs[state.currentDate].push(meal);
  persistLogs();
  setStorageStatus("Meal saved to your laptop database.", "success");
  resetMealComposer();
  renderAll();
}

function saveCustomFood(event) {
  event.preventDefault();
  createCustomFoodFromForm({
    nameSelector: "#custom-name",
    servingSelector: "#custom-serving",
    prefix: "custom",
    form: refs.customFoodForm,
  });
  renderAll();
}

function saveProfileSettings(event) {
  event.preventDefault();
  state.profile = {
    age: refs.profileAge.value.trim(),
    weightKg: refs.profileWeight.value.trim(),
    heightCm: refs.profileHeight.value.trim(),
    calorieGoal: refs.profileCalorieGoal.value.trim(),
    proteinGoal: refs.profileProteinGoal.value.trim(),
    carbGoal: refs.profileCarbGoal.value.trim(),
    fatGoal: refs.profileFatGoal.value.trim(),
    fiberGoal: refs.profileFiberGoal.value.trim(),
    aiInstructions: refs.profileAiInstructions.value.trim(),
  };
  persistProfile();
  setProfileStatus("Profile settings saved. New AI analyses will use your preferences.", "success");
  renderAll();
}

function saveInlineCustomFood(event) {
  const food = createCustomFoodFromForm({
    nameSelector: "#inline-custom-name",
    servingSelector: "#inline-custom-serving",
    prefix: "inline-custom",
    form: refs.inlineCustomFoodForm,
  });

  if (!food) {
    return;
  }

  refs.foodSelect.value = food.id;
  closeInlineCustomizer();
  refs.servingsInput.focus();
  renderAll();
}

async function analyzeMealWithAI() {
  const mealName = refs.mealName.value.trim();
  const mealDescription = refs.mealDescription.value.trim();

  if (!mealDescription) {
    setAiStatus("Add a meal description first so the AI has something to analyze.", "error");
    refs.mealDescription.focus();
    return;
  }

  state.isAnalyzingMeal = true;
  renderAiControls();
  setAiStatus("Analyzing your meal with Gemini...", "");

  try {
    const response = await fetch("/api/analyze-meal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mealName,
        mealDescription,
        profile: getAiProfilePayload(),
        aiInstructions: state.profile.aiInstructions,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Meal analysis failed.");
    }

    state.currentMealItems = [];
    state.aiDraft = buildAiDraftFromResponse(payload);
    setAiStatus("AI analysis is ready. Review it and save the meal when it looks right.", "success");
    renderCurrentMeal();
  } catch (error) {
    setAiStatus(error.message || "Unable to analyze the meal right now.", "error");
  } finally {
    state.isAnalyzingMeal = false;
    renderAiControls();
  }
}

async function checkAiAvailability() {
  try {
    const response = await fetch("/api/health");
    const payload = await response.json();
    if (response.ok && payload.geminiConfigured) {
      setAiStatus(`AI analysis ready on the local server using Gemini ${payload.geminiModel}.`, "success");
    } else {
      setAiStatus("AI server is running, but GEMINI_API_KEY is not configured yet.", "error");
    }
  } catch (error) {
    setAiStatus("AI analysis needs the local server. Start it with node server.js to enable automatic nutrition estimates.", "error");
  }
}

async function checkStorageAvailability() {
  try {
    const response = await fetch("/api/health");
    const payload = await response.json();
    if (response.ok && payload.mysqlReady) {
      setStorageStatus(`Meal logs are saving into MySQL database "${payload.mysqlDatabase}" on this laptop.`, "success");
      return;
    }

    if (response.ok && payload.mysqlConfigured) {
      setStorageStatus("MySQL is configured, but the app could not connect yet. Check your MySQL credentials and server.", "error");
      return;
    }

    setStorageStatus("MySQL is not configured yet. The app is using browser backup storage until the server can connect to your laptop database.", "error");
  } catch (error) {
    setStorageStatus("The local server is not reachable, so meal logs are only in browser backup storage right now.", "error");
  }
}

function handleCurrentMealClick(event) {
  const button = event.target.closest("[data-entry-id]");
  if (!button) {
    return;
  }

  state.currentMealItems = state.currentMealItems.filter((entry) => entry.id !== button.dataset.entryId);
  renderCurrentMeal();
}

function handleCustomFoodListClick(event) {
  const button = event.target.closest("[data-food-id]");
  if (!button) {
    return;
  }

  const foodId = button.dataset.foodId;
  state.foods = state.foods.filter((food) => food.id !== foodId);
  state.currentMealItems = state.currentMealItems.filter((entry) => entry.food.id !== foodId);
  persistFoods();
  renderAll();
}

async function handleMealLogClick(event) {
  const button = event.target.closest("[data-meal-id]");
  if (!button) {
    return;
  }

  try {
    await deleteMealFromServer(button.dataset.mealId);
  } catch (error) {
    setStorageStatus(error.message || "Unable to delete this meal from MySQL on your laptop.", "error");
    return;
  }

  state.logs[state.currentDate] = getMealsForDate(state.currentDate).filter((meal) => meal.id !== button.dataset.mealId);
  if (!state.logs[state.currentDate].length) {
    delete state.logs[state.currentDate];
  }
  persistLogs();
  setStorageStatus("Meal deleted from your laptop database.", "success");
  renderAll();
}

function calculateTotalsFromMeals(meals) {
  return meals.reduce((acc, meal) => addNutrients(acc, meal.totals), emptyTotals());
}

function calculateTotalsFromEntries(entries) {
  return entries.reduce((acc, entry) => addNutrients(acc, scaleNutrients(entry.food.nutrients, entry.servings)), emptyTotals());
}

function buildMealAnalysis(totals) {
  const highlights = [];
  const macroDistribution = getMacroDistribution(totals);

  if (totals.protein >= 25) {
    highlights.push({ text: "Strong protein support" });
  } else if (totals.protein < 12) {
    highlights.push({ text: "Low protein", variant: "warn" });
  }

  if (totals.fiber >= 8) {
    highlights.push({ text: "Good fiber boost" });
  }

  if (macroDistribution.carbs >= 50) {
    highlights.push({ text: "Carb-forward meal" });
  }

  if (macroDistribution.fat >= 40) {
    highlights.push({ text: "Fat-heavy meal", variant: "warn" });
  }

  ["calcium", "iron", "potassium", "vitaminC", "vitaminA"].forEach((key) => {
    const ratio = totals[key] / DAILY_TARGETS[key].value;
    if (ratio >= 0.2) {
      highlights.push({ text: `${DAILY_TARGETS[key].label} +${formatPercent(ratio)}` });
    }
  });

  if (totals.sodium / DAILY_TARGETS.sodium.value >= 0.35) {
    highlights.push({ text: "Watch sodium", variant: "warn" });
  }

  if (!highlights.length) {
    highlights.push({ text: "Moderate nutrient profile" });
  }

  const summary = [];
  if (totals.calories >= 700) {
    summary.push("This is a calorie-dense meal");
  } else if (totals.calories <= 250) {
    summary.push("This is a lighter meal");
  } else {
    summary.push("This meal lands in a moderate calorie range");
  }

  if (totals.protein >= 25) {
    summary.push("with enough protein to support satiety and recovery");
  } else if (totals.protein < 12) {
    summary.push("but protein is fairly low");
  } else {
    summary.push("with a moderate amount of protein");
  }

  const topMicros = ["fiber", "iron", "potassium", "vitaminC", "vitaminA", "calcium"]
    .map((key) => ({ key, ratio: totals[key] / DAILY_TARGETS[key].value }))
    .filter((item) => item.ratio >= 0.15)
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 2);

  if (topMicros.length) {
    summary.push(`and it contributes meaningful ${topMicros.map((item) => DAILY_TARGETS[item.key].label.toLowerCase()).join(" and ")}`);
  }

  return {
    summary: `${summary.join(" ")}.`,
    highlights,
  };
}

function buildDayAnalysis(totals, meals) {
  if (!meals.length) {
    return {
      summary: "Start logging meals to see your daily calorie total, macro split, and micronutrient coverage here.",
    };
  }

  const macroDistribution = getMacroDistribution(totals);
  const lowMicros = ["fiber", "calcium", "iron", "potassium", "vitaminC", "vitaminA"]
    .map((key) => ({ key, ratio: totals[key] / DAILY_TARGETS[key].value }))
    .filter((item) => item.ratio < 0.7)
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, 2)
    .map((item) => DAILY_TARGETS[item.key].label.toLowerCase());

  const summary = [`You have logged ${meals.length} meal${meals.length === 1 ? "" : "s"} for ${state.currentDate}.`];
  const calorieGoal = toNumberOrNull(state.profile.calorieGoal);
  const proteinGoal = toNumberOrNull(state.profile.proteinGoal);
  const fiberGoal = toNumberOrNull(state.profile.fiberGoal);

  if (macroDistribution.protein >= 25 && macroDistribution.fat <= 35) {
    summary.push("Your macro split is fairly balanced with a strong protein contribution.");
  } else if (macroDistribution.carbs >= 55) {
    summary.push("Your intake is currently tilted toward carbohydrates.");
  } else if (macroDistribution.fat >= 38) {
    summary.push("A large share of your calories is coming from fat.");
  } else {
    summary.push("Your macro split is mixed without one nutrient fully dominating.");
  }

  if (calorieGoal) {
    summary.push(`You are at ${formatPercent(totals.calories / calorieGoal)} of your calorie goal.`);
  }

  if (proteinGoal) {
    summary.push(`You are at ${formatPercent(totals.protein / proteinGoal)} of your protein goal.`);
  }

  if (fiberGoal) {
    summary.push(`Fiber is at ${formatPercent(totals.fiber / fiberGoal)} of your personal target.`);
  }

  if (totals.sodium > DAILY_TARGETS.sodium.value) {
    summary.push("Sodium has moved above the suggested daily upper limit.");
  }

  if (lowMicros.length) {
    summary.push(`The biggest micronutrient gaps so far are ${lowMicros.join(" and ")}.`);
  } else {
    summary.push("You have good micronutrient coverage across the tracked nutrients.");
  }

  return { summary: summary.join(" ") };
}

function getMacroDistribution(totals) {
  const proteinCalories = totals.protein * 4;
  const carbCalories = totals.carbs * 4;
  const fatCalories = totals.fat * 9;
  const total = proteinCalories + carbCalories + fatCalories;

  if (!total) {
    return { protein: 0, carbs: 0, fat: 0 };
  }

  return {
    protein: (proteinCalories / total) * 100,
    carbs: (carbCalories / total) * 100,
    fat: (fatCalories / total) * 100,
  };
}

function getMealsForDate(date) {
  return state.logs[date] || [];
}

function loadFoods() {
  const storedFoods = loadJson(STORAGE_KEYS.foods, []);
  if (!Array.isArray(storedFoods) || !storedFoods.length) {
    persistJson(STORAGE_KEYS.foods, BUILT_IN_FOODS);
    return clone(BUILT_IN_FOODS);
  }

  const mergedFoods = clone(storedFoods);
  BUILT_IN_FOODS.forEach((food) => {
    if (!mergedFoods.some((item) => item.id === food.id)) {
      mergedFoods.push(food);
    }
  });

  persistJson(STORAGE_KEYS.foods, mergedFoods);
  return mergedFoods;
}

function loadProfile() {
  const profile = loadJson(STORAGE_KEYS.profile, DEFAULT_PROFILE);
  if (!profile || typeof profile !== "object") {
    return { ...DEFAULT_PROFILE };
  }
  return { ...DEFAULT_PROFILE, ...profile };
}

async function loadLogs() {
  const fallbackLogs = readBackupLogs();
  try {
    const response = await fetch("/api/logs");
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Unable to load meal logs from the server.");
    }
    persistJson(STORAGE_KEYS.logs, payload.logs || {});
    return payload.logs && typeof payload.logs === "object" ? payload.logs : {};
  } catch (error) {
    setStorageStatus("Using browser backup logs because MySQL is not reachable yet.", "error");
    return fallbackLogs;
  }
}

function persistFoods() {
  persistJson(STORAGE_KEYS.foods, state.foods);
}

function persistLogs() {
  persistJson(STORAGE_KEYS.logs, state.logs);
}

function persistProfile() {
  persistJson(STORAGE_KEYS.profile, state.profile);
}

function readBackupLogs() {
  const logs = loadJson(STORAGE_KEYS.logs, {});
  return logs && typeof logs === "object" ? logs : {};
}

function loadJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Failed to load ${key}`, error);
    return fallback;
  }
}

function persistJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to persist ${key}`, error);
  }
}

async function saveMealToServer(mealDate, meal) {
  const response = await fetch("/api/logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mealDate, meal }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Unable to save the meal.");
  }
}

async function deleteMealFromServer(mealId) {
  const response = await fetch(`/api/logs/${encodeURIComponent(mealId)}`, {
    method: "DELETE",
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Unable to delete the meal.");
  }
}

function setStorageStatus(message, variant) {
  if (!refs.storageStatus) {
    return;
  }
  refs.storageStatus.textContent = message;
  refs.storageStatus.className = variant ? `helper-text ${variant}` : "helper-text";
}

function setInstallStatus(message, variant) {
  if (!refs.installStatus) {
    return;
  }
  refs.installStatus.textContent = message;
  refs.installStatus.className = variant ? `helper-text ${variant}` : "helper-text";
}

function setProfileStatus(message, variant) {
  if (!refs.profileStatus) {
    return;
  }
  refs.profileStatus.textContent = message;
  refs.profileStatus.className = variant ? `helper-text ${variant}` : "helper-text";
}

function getInstallHelpText() {
  const userAgent = navigator.userAgent || "";
  if (/Android/i.test(userAgent)) {
    return "On Android, open the browser menu and choose Add to home screen or Install app.";
  }
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return "On iPhone or iPad, open Share in Safari and choose Add to Home Screen.";
  }
  return "Open the browser menu and choose Install app, Apps, or Create shortcut if the prompt is not showing.";
}

function populateProfileForm() {
  refs.profileAge.value = state.profile.age;
  refs.profileWeight.value = state.profile.weightKg;
  refs.profileHeight.value = state.profile.heightCm;
  refs.profileCalorieGoal.value = state.profile.calorieGoal;
  refs.profileProteinGoal.value = state.profile.proteinGoal;
  refs.profileCarbGoal.value = state.profile.carbGoal;
  refs.profileFatGoal.value = state.profile.fatGoal;
  refs.profileFiberGoal.value = state.profile.fiberGoal;
  refs.profileAiInstructions.value = state.profile.aiInstructions;
}

function getAiProfilePayload() {
  return {
    age: toNumberOrNull(state.profile.age),
    weightKg: toNumberOrNull(state.profile.weightKg),
    heightCm: toNumberOrNull(state.profile.heightCm),
    calorieGoal: toNumberOrNull(state.profile.calorieGoal),
    proteinGoal: toNumberOrNull(state.profile.proteinGoal),
    carbGoal: toNumberOrNull(state.profile.carbGoal),
    fatGoal: toNumberOrNull(state.profile.fatGoal),
    fiberGoal: toNumberOrNull(state.profile.fiberGoal),
  };
}

function readNumber(selector) {
  return Number(document.querySelector(selector).value || 0);
}

function emptyTotals() {
  const totals = {};
  TRACKED_NUTRIENTS.forEach((key) => {
    totals[key] = 0;
  });
  return totals;
}

function scaleNutrients(nutrients, servings) {
  const scaled = {};
  TRACKED_NUTRIENTS.forEach((key) => {
    scaled[key] = Number(nutrients[key] || 0) * servings;
  });
  return scaled;
}

function addNutrients(base, addition) {
  const next = { ...base };
  TRACKED_NUTRIENTS.forEach((key) => {
    next[key] = Number(next[key] || 0) + Number(addition[key] || 0);
  });
  return next;
}

function normalizeNutrients(nutrients) {
  const normalized = {};
  TRACKED_NUTRIENTS.forEach((key) => {
    normalized[key] = Number(nutrients[key] || 0);
  });
  return normalized;
}

function makeFood(id, name, serving, nutrients, builtIn) {
  return {
    id,
    name,
    serving,
    nutrients: normalizeNutrients(nutrients),
    builtIn,
    createdAt: new Date().toISOString(),
  };
}

function resetMealComposer() {
  state.currentMealItems = [];
  state.aiDraft = null;
  refs.mealForm.reset();
  refs.servingsInput.value = "1";
  refs.mealTime.value = currentTime();
  setAiStatus("AI analysis uses a Gemini API key on the local server.", "");
  renderAiControls();
  renderCurrentMeal();
}

function openInlineCustomizer() {
  state.isInlineCustomizerOpen = true;
  renderInlineCustomizer();
  document.querySelector("#inline-custom-name").focus();
}

function closeInlineCustomizer() {
  state.isInlineCustomizerOpen = false;
  renderInlineCustomizer();
}

function createCustomFoodFromForm({ nameSelector, servingSelector, prefix, form }) {
  const name = document.querySelector(nameSelector).value.trim();
  const serving = document.querySelector(servingSelector).value.trim();
  if (!name || !serving) {
    return null;
  }

  const nutrients = {
    calories: readNumber(`#${prefix}-calories`),
    protein: readNumber(`#${prefix}-protein`),
    carbs: readNumber(`#${prefix}-carbs`),
    fat: readNumber(`#${prefix}-fat`),
    fiber: readNumber(`#${prefix}-fiber`),
    calcium: readNumber(`#${prefix}-calcium`),
    iron: readNumber(`#${prefix}-iron`),
    potassium: readNumber(`#${prefix}-potassium`),
    sodium: readNumber(`#${prefix}-sodium`),
    vitaminC: readNumber(`#${prefix}-vitamin-c`),
    vitaminA: readNumber(`#${prefix}-vitamin-a`),
  };

  const food = makeFood(uid("food"), name, serving, nutrients, false);
  state.foods.unshift(food);
  persistFoods();
  resetFieldGroup(form);
  return food;
}

function buildAiDraftFromResponse(payload) {
  return {
    confidence: payload.confidence || "medium",
    assumptions: Array.isArray(payload.assumptions) ? payload.assumptions : [],
    analysisSummary: payload.analysis_summary || "AI estimated this meal from your description.",
    totals: normalizeNutrients(payload.totals || {}),
    entries: Array.isArray(payload.ingredients)
      ? payload.ingredients.map((ingredient) => ({
          id: uid("ai-entry"),
          servings: 1,
          food: {
            id: uid("ai-food"),
            name: ingredient.name || "Estimated ingredient",
            serving: ingredient.estimated_serving || "1 portion",
            nutrients: normalizeNutrients(ingredient),
            builtIn: false,
          },
        }))
      : [],
  };
}

function setAiStatus(message, variant) {
  refs.aiStatus.textContent = message;
  refs.aiStatus.className = variant ? `helper-text ${variant}` : "helper-text";
}

function renderMetricTile(label, value) {
  return `<div class="analysis-pill"><span>${label}</span><strong>${value}</strong></div>`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

function defaultMealName() {
  if (state.aiDraft) {
    return "Analyzed meal";
  }
  return "Logged meal";
}

function resetFieldGroup(container) {
  if (typeof container.reset === "function") {
    container.reset();
    return;
  }

  container.querySelectorAll("input").forEach((input) => {
    if (input.type === "number") {
      input.value = input.defaultValue || "";
      return;
    }
    input.value = "";
  });
}

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function currentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function formatNumber(value, maxFractionDigits = 1) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: maxFractionDigits }).format(value);
}

function formatPercent(ratio) {
  return `${Math.round(ratio * 100)}%`;
}

function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatMealTime(value) {
  if (!value) {
    return "Time not set";
  }

  const [hoursString, minutes] = value.split(":");
  const hours = Number(hoursString);
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${suffix}`;
}
