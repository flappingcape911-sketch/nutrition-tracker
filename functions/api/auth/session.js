import { getSessionContext, json } from "../_shared.js";

export async function onRequestGet(context) {
  try {
    const session = await getSessionContext(context.request, context.env);
    return json(session);
  } catch (error) {
    return json({ error: error.message || "Unable to load session." }, 500);
  }
}
