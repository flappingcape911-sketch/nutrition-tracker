import { countUsers, ensureSchema, getSessionContext, json } from "./_shared.js";

export async function onRequestGet(context) {
  let d1Ready = false;
  let d1Error = "";
  const geminiKey = context.env.GEMINI_API_KEY || "";
  let registrationOpen = false;
  let authenticated = false;
  let email = "";

  try {
    await ensureSchema(context.env);
    d1Ready = true;
    registrationOpen = (await countUsers(context.env)) === 0;
    const session = await getSessionContext(context.request, context.env);
    authenticated = session.authenticated;
    email = session.user?.email || "";
  } catch (error) {
    d1Ready = false;
    d1Error = error instanceof Error ? error.message : String(error);
  }

  return json({
    ok: true,
    geminiConfigured: Boolean(geminiKey),
    geminiModel: context.env.GEMINI_MODEL || "gemini-2.5-flash",
    geminiKeyLength: geminiKey.length,
    geminiKeyPreview: geminiKey ? `${geminiKey.slice(0, 4)}...${geminiKey.slice(-4)}` : "",
    d1Bound: Boolean(context.env.DB),
    d1Ready,
    d1Error,
    registrationOpen,
    authenticated,
    email,
    accountSetupCodeConfigured: Boolean(context.env.ACCOUNT_SETUP_CODE)
  });
}
