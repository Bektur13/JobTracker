// MV3 service worker for CareerTrack Job Clipper.
// Classic (non-module) worker — importScripts, not import/export, to stay
// consistent with the rest of the extension's plain-script style.
importScripts("lib/storage.js");

const CONNECT_PATH = "/extension/connect";
const CONNECTED_PATH = "/extension/connected";

let connectTabId = null;

async function startConnect() {
  const tab = await chrome.tabs.create({ url: `${CTK_WEB_BASE}${CONNECT_PATH}` });
  connectTabId = tab.id;
}

function notifyPopup(message) {
  // Fails silently if the popup isn't open — fine, it'll see the stored key
  // next time it opens via the same ctkGetSettings() check it already does.
  chrome.runtime.sendMessage(message).catch(() => {});
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "start-connect") {
    startConnect();
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (tabId !== connectTabId || !changeInfo.url) return;

  const url = new URL(changeInfo.url);
  if (!url.pathname.startsWith(CONNECTED_PATH)) return;

  const code = url.searchParams.get("code");
  connectTabId = null;

  chrome.tabs.remove(tabId).catch(() => {});

  if (!code) {
    notifyPopup({ type: "connect-result", ok: false, error: "No code returned" });
    return;
  }

  try {
    const res = await fetch(`${CTK_WEB_BASE}/api/extension/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Request failed (${res.status})`);
    }

    const { apiKey } = await res.json();
    await ctkSetApiKey(apiKey);

    notifyPopup({ type: "connect-result", ok: true });
  } catch (err) {
    notifyPopup({ type: "connect-result", ok: false, error: err.message });
  }
});
