import { json, listLogsGroupedByDate, readJson, requireUser, upsertMeal, validateLogPayload } from "../_shared.js";

export async function onRequestGet(context) {
  try {
    const user = await requireUser(context.request, context.env);
    const logs = await listLogsGroupedByDate(context.env, user.id);
    return json({ logs });
  } catch (error) {
    const status = error.message === "Please sign in to access your nutrition data." ? 401 : 500;
    return json({ error: error.message || "Unable to load logs." }, status);
  }
}

export async function onRequestPost(context) {
  try {
    const user = await requireUser(context.request, context.env);
    const body = await readJson(context.request);
    validateLogPayload(body);
    await upsertMeal(context.env, user.id, body.mealDate, body.meal);
    return json({ ok: true });
  } catch (error) {
    const status = error.message === "Please sign in to access your nutrition data." ? 401 : 500;
    return json({ error: error.message || "Unable to save meal." }, status);
  }
}
