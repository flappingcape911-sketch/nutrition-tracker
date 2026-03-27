import { analyzeMeal, json, readJson, requireUser } from "./_shared.js";

export async function onRequestPost(context) {
  try {
    await requireUser(context.request, context.env);
    const body = await readJson(context.request);
    if (!body.mealDescription || typeof body.mealDescription !== "string") {
      return json({ error: "Meal description is required." }, 400);
    }

    const analysis = await analyzeMeal(
      context.env,
      body.mealName || "Meal",
      body.mealDescription,
      {
        profile: body.profile || {},
        aiInstructions: body.aiInstructions || ""
      }
    );
    return json(analysis);
  } catch (error) {
    const status = error.message === "Please sign in to access your nutrition data." ? 401 : 500;
    return json({ error: error.message || "Unable to analyze meal." }, status);
  }
}
