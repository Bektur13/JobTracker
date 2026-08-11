const SUPPORTED_HOSTS = ["greenhouse.io", "linkedin.com", "joinhandshake.com"];

const keySetupSection = document.getElementById("keySetup");
const mainSection = document.getElementById("main");
const previewSection = document.getElementById("preview");
const statusEl = document.getElementById("status");

let currentTabUrl = null;
let apiKey = null;
let apiBase = null;

function setStatus(text) {
  statusEl.textContent = text ?? "";
}

function showSection(section) {
  for (const el of [keySetupSection, mainSection, previewSection]) {
    el.classList.toggle("hidden", el !== section);
  }
}

async function init() {
  const settings = await ctkGetSettings();
  apiKey = settings.apiKey;
  apiBase = settings.apiBase;

  if (!apiKey) {
    showSection(keySetupSection);
    return;
  }

  showSection(mainSection);
}

document.getElementById("saveKeyBtn").addEventListener("click", async () => {
  const value = document.getElementById("apiKeyInput").value.trim();
  if (!value) return;
  await ctkSetApiKey(value);
  apiKey = value;
  showSection(mainSection);
  setStatus("Key saved.");
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

document.getElementById("confirmBtn").addEventListener("click", async () => {
  setStatus("Saving...");

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

  try {
    await ctkSaveApplication(parsed, apiKey, apiBase);
    setStatus("Saved to CareerTrack.");
    showSection(mainSection);
  } catch (err) {
    setStatus(err.message.includes("401") || err.message.includes("Unauthorized")
      ? "Invalid API key — update it in the extension."
      : `Save failed: ${err.message}`);
  }
});

init();
