import { buildSessionHeaders, json, loginUser, readJson } from "../_shared.js";

export async function onRequestPost(context) {
  try {
    const body = await readJson(context.request);
    const session = await loginUser(context.env, body.email, body.password);
    return json({ ok: true, user: session.user }, 200, buildSessionHeaders(session.token));
  } catch (error) {
    return json({ error: error.message || "Unable to sign in." }, 400);
  }
}
