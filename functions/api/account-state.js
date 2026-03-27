import { getUserAccountState, json, readJson, requireUser, saveUserAccountState, validateAccountPayload } from "./_shared.js";

export async function onRequestGet(context) {
  try {
    const user = await requireUser(context.request, context.env);
    const state = await getUserAccountState(context.env, user.id);
    return json(state);
  } catch (error) {
    return json({ error: error.message || "Unable to load account state." }, 401);
  }
}

export async function onRequestPost(context) {
  try {
    const user = await requireUser(context.request, context.env);
    const body = await readJson(context.request);
    const payload = validateAccountPayload(body);
    const state = await saveUserAccountState(context.env, user.id, payload.profile, payload.customFoods);
    return json({ ok: true, ...state });
  } catch (error) {
    const status = error.message === "Please sign in to access your nutrition data." ? 401 : 400;
    return json({ error: error.message || "Unable to save account state." }, status);
  }
}
