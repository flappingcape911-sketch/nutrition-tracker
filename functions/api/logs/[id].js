import { deleteMeal, json, requireUser } from "../_shared.js";

export async function onRequestDelete(context) {
  try {
    const user = await requireUser(context.request, context.env);
    await deleteMeal(context.env, user.id, context.params.id);
    return json({ ok: true });
  } catch (error) {
    const status = error.message === "Please sign in to access your nutrition data." ? 401 : 500;
    return json({ error: error.message || "Unable to delete meal." }, status);
  }
}
