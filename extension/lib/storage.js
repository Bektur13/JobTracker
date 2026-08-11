// Runs in the popup context (not injected into pages) — safe to use chrome.* APIs.
const CTK_DEFAULT_API_BASE = "http://localhost:3001";

async function ctkGetSettings() {
  const { apiKey, apiBase } = await chrome.storage.local.get(["apiKey", "apiBase"]);
  return { apiKey: apiKey ?? null, apiBase: apiBase ?? CTK_DEFAULT_API_BASE };
}

async function ctkSetApiKey(apiKey) {
  await chrome.storage.local.set({ apiKey });
}
