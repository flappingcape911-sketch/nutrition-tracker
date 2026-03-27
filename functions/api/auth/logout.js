import { buildLogoutHeaders, json, logoutUser } from "../_shared.js";

export async function onRequestPost(context) {
  try {
    await logoutUser(context.env, context.request);
    return json({ ok: true }, 200, buildLogoutHeaders());
  } catch (error) {
    return json({ error: error.message || "Unable to sign out." }, 500, buildLogoutHeaders());
  }
}
