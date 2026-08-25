// Runs in the popup/background context (not injected into pages) — safe to
// use chrome.* APIs. Two separate bases: the Express API (job applications)
// and the Next.js web app (sign-in, settings, the connect-account handoff).
const CTK_DEFAULT_API_BASE = "http://localhost:3001";
const CTK_WEB_BASE = "http://localhost:3000";

async function ctkGetSettings() {
  const { apiKey, apiBase } = await chrome.storage.local.get(["apiKey", "apiBase"]);
  return { apiKey: apiKey ?? null, apiBase: apiBase ?? CTK_DEFAULT_API_BASE };
}

async function ctkSetApiKey(apiKey) {
  await chrome.storage.local.set({ apiKey });
}
