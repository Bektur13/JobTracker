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
// scans free text for a "$X,XXX - $X,XXX" style range. Accepts a hyphen,
// en dash, or em dash as the separator — Handshake uses "$65–80K/yr" with
// a real en dash, which a plain "-" match would silently miss.
function __ctkScanForSalary(text) {
  if (!text) return null;
  const match = text.match(/\$\s?[\d,]+(?:\.\d+)?\s?[kK]?\s?(?:-|–|—|to)\s?\$?\s?[\d,]+(?:\.\d+)?\s?[kK]?/);
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

// A bare "h1" selector grabs the *first* h1 in DOM order, which can be a
// skip-link or nav heading rather than the actual page title. This instead
// scans every h1 on the page and picks the longest text — the job title is
// almost always the most prominent (and longest) heading.
function __ctkLongestHeading(selector = "h1") {
  const candidates = [...document.querySelectorAll(selector)]
    .map((el) => __ctkCleanWhitespace(el.textContent))
    .filter(Boolean);
  if (candidates.length === 0) return null;
  return candidates.reduce((longest, current) => (current.length > longest.length ? current : longest));
}

// Best-effort fallback for pages with no structured location field —
// scans free text for a "City, ST" pattern or a remote/hybrid/on-site tag.
function __ctkScanForLocation(text) {
  if (!text) return null;
  const cityState = text.match(/\b[A-Z][a-zA-Z.'-]+(?:\s[A-Z][a-zA-Z.'-]+)*,\s*[A-Z]{2}\b/);
  if (cityState) return cityState[0];
  const remote = text.match(/\b(Remote|Hybrid|On-site)\b/i);
  return remote ? remote[0] : null;
}

// Walks up from an element a few ancestor levels and returns the combined
// text of that container — used to scan for a nearby field (e.g. location
// text sitting next to a company link with no selector of its own).
function __ctkTextNear(el, levels = 3) {
  let node = el;
  for (let i = 0; i < levels && node?.parentElement; i++) {
    node = node.parentElement;
  }
  return node?.textContent ?? null;
}

// Some sites label a content section with a plain heading ("Job
// description", "Qualifications", etc.) rather than a stable class or
// attribute. This finds that heading by its visible text and returns its
// section container element — durable against styling-hash class churn
// since it keys off the label text a human actually reads, not CSS.
function __ctkFindSectionByHeading(labelRegex, headingSelector = "h1,h2,h3,h4,h5") {
  const heading = [...document.querySelectorAll(headingSelector)].find((el) => labelRegex.test(el.textContent));
  if (!heading) return null;
  return heading.parentElement?.parentElement ?? heading.parentElement ?? null;
}

// Same "longest match wins" idea as __ctkLongestHeading, but returns the
// element itself (not just its text) so callers can use it as a DOM anchor
// for proximity-based lookups of nearby fields.
function __ctkLongestHeadingEl(selector = "h1") {
  const candidates = [...document.querySelectorAll(selector)].filter((el) => __ctkCleanWhitespace(el.textContent));
  if (candidates.length === 0) return null;
  return candidates.reduce((longest, current) =>
    current.textContent.trim().length > longest.textContent.trim().length ? current : longest
  );
}
