const SUPPORTED_HOSTS = ["greenhouse.io", "linkedin.com", "joinhandshake.com"];

const connectSection = document.getElementById("connect");
const mainSection = document.getElementById("main");
const previewSection = document.getElementById("preview");
const duplicateWarningSection = document.getElementById("duplicateWarning");
const statusEl = document.getElementById("status");
const connectBtn = document.getElementById("connectBtn");

let currentTabUrl = null;
let apiKey = null;
let apiBase = null;
let pendingApplication = null;

function setStatus(text) {
  statusEl.textContent = text ?? "";
}

function showSection(section) {
  for (const el of [connectSection, mainSection, previewSection, duplicateWarningSection]) {
    el.classList.toggle("hidden", el !== section);
  }
}

async function init() {
  const settings = await ctkGetSettings();
  apiKey = settings.apiKey;
  apiBase = settings.apiBase;

  if (!apiKey) {
    showSection(connectSection);
    return;
  }

  showSection(mainSection);
}

connectBtn.addEventListener("click", () => {
  connectBtn.disabled = true;
  setStatus("Waiting for sign-in...");
  chrome.runtime.sendMessage({ type: "start-connect" });
});

// background.js opens the sign-in tab, exchanges the resulting code for an
// API key, and broadcasts the outcome here — the popup never talks to the
// web app directly during this flow.
chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== "connect-result") return;

  connectBtn.disabled = false;

  if (!message.ok) {
    setStatus(`Connection failed: ${message.error ?? "unknown error"}`);
    return;
  }

  ctkGetSettings().then((settings) => {
    apiKey = settings.apiKey;
    apiBase = settings.apiBase;
    setStatus("Connected.");
    showSection(mainSection);
  });
});

document.getElementById("parseBtn").addEventListener("click", async () => {
  setStatus("Parsing page...");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const hostname = new URL(tab.url).hostname;

  if (!SUPPORTED_HOSTS.some((host) => hostname.includes(host))) {
    setStatus("Unsupported site. Open a Greenhouse, LinkedIn, or Handshake job posting.");
    return;
  }

  currentTabUrl = tab.url;

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: [
      "lib/textUtils.js",
      "lib/jsonld.js",
      "parsers/greenhouse.js",
      "parsers/linkedin.js",
      "parsers/handshake.js",
      "parsers/dispatcher.js",
    ],
  });

  console.log("[CareerTrack] parsed result:", result);

  if (!result || result.error) {
    setStatus("Couldn't parse this page. Try a different posting or report the site.");
    return;
  }

  document.getElementById("fieldTitle").value = result.title ?? "";
  document.getElementById("fieldCompany").value = result.company ?? "";
  document.getElementById("fieldLocation").value = result.location ?? "";
  document.getElementById("fieldSalary").value = result.salaryRange ?? "";
  document.getElementById("fieldDescription").value = result.description ?? "";
  document.getElementById("preview").dataset.source = result.source;

  setStatus(null);
  showSection(previewSection);
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  setStatus(null);
  showSection(mainSection);
});

async function saveApplication(parsed) {
  setStatus("Saving...");

  try {
    await ctkSaveApplication(parsed, apiKey, apiBase);
    setStatus("Saved to CareerTrack.");
    pendingApplication = null;
    showSection(mainSection);
  } catch (err) {
    if (err.message.includes("401") || err.message.includes("Unauthorized")) {
      apiKey = null;
      await ctkSetApiKey(null);
      setStatus("Your connection expired — reconnect your account.");
      showSection(connectSection);
      return;
    }
    setStatus(`Save failed: ${err.message}`);
  }
}

document.getElementById("confirmBtn").addEventListener("click", async () => {
  const parsed = {
    title: document.getElementById("fieldTitle").value.trim(),
    company: document.getElementById("fieldCompany").value.trim(),
    location: document.getElementById("fieldLocation").value.trim() || null,
    salaryRange: document.getElementById("fieldSalary").value.trim() || null,
    description: document.getElementById("fieldDescription").value.trim() || null,
    sourceUrl: currentTabUrl,
    source: document.getElementById("preview").dataset.source,
  };

  if (!parsed.title || !parsed.company) {
    setStatus("Title and company are required.");
    return;
  }

  setStatus("Checking for duplicates...");

  try {
    const existing = await ctkFetchApplications(apiKey, apiBase);
    const isDuplicate = existing.some(
      (app) =>
        app.company?.name?.trim().toLowerCase() === parsed.company.toLowerCase() &&
        app.role?.trim().toLowerCase() === parsed.title.toLowerCase()
    );

    if (isDuplicate) {
      pendingApplication = parsed;
      setStatus(null);
      document.getElementById("duplicateMessage").textContent =
        `You've already applied to "${parsed.title}" at ${parsed.company}. Save it again anyway?`;
      showSection(duplicateWarningSection);
      return;
    }
  } catch (err) {
    // Don't block saving over a failed duplicate check — just skip it.
    console.warn("[CareerTrack] duplicate check failed, saving anyway:", err);
  }

  await saveApplication(parsed);
});

document.getElementById("confirmDuplicateBtn").addEventListener("click", async () => {
  if (!pendingApplication) return;
  await saveApplication(pendingApplication);
});

document.getElementById("goBackBtn").addEventListener("click", () => {
  pendingApplication = null;
  setStatus(null);
  showSection(previewSection);
});

init();
