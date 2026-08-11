// Injected into the page. No imports/exports (classic script).

function __ctkCleanWhitespace(text) {
  if (!text) return null;
  return text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim() || null;
}

function __ctkStripHtml(html) {
  if (!html) return null;
  const div = document.createElement("div");
  div.innerHTML = html;
  return __ctkCleanWhitespace(div.textContent);
}

// Best-effort fallback for pages with no structured salary field —
// scans free text for a "$X,XXX - $X,XXX" style range.
function __ctkScanForSalary(text) {
  if (!text) return null;
  const match = text.match(/\$\s?[\d,]+(?:\.\d+)?\s?[kK]?\s?(?:-|to)\s?\$?\s?[\d,]+(?:\.\d+)?\s?[kK]?/);
  return match ? match[0].trim() : null;
}

// Tries an ordered list of selectors, returns the first non-empty text match.
// Parsers pass fallback chains here so a later selector fix is additive, not a rewrite.
function __ctkQueryText(selectors) {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    const text = __ctkCleanWhitespace(el?.textContent);
    if (text) return text;
  }
  return null;
}

function __ctkQueryAttr(selectors, attr) {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    const value = el?.getAttribute(attr);
    if (value) return value.trim();
  }
  return null;
}
