import { buildSessionHeaders, json, readJson, registerUser } from "../_shared.js";

export async function onRequestPost(context) {
  try {
    const body = await readJson(context.request);
    const session = await registerUser(context.env, body.email, body.password, body.setupCode);
    return json({ ok: true, user: session.user }, 200, buildSessionHeaders(session.token));
  } catch (error) {
    return json({ error: error.message || "Unable to create account." }, 400);
  }
}
