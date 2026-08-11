// Injected into the page. Depends on lib/jsonld.js + lib/textUtils.js.
//
// Handshake is a React SPA with markup that couldn't be verified against a
// live posting from here — this is a first-pass calibration target, not a
// finished parser. Prefer [data-testid]/[aria-label] attribute selectors
// over CSS classes where possible, since SPAs tend to keep test-id/aria
// attributes stable across styling refactors even when class names churn.
// When testing against a real posting, console.log() the raw result and
// patch the selector arrays below before trusting this in production use.
function __ctkParseHandshake() {
  const jsonLd = __ctkExtractJsonLdJobPosting();

  const title = jsonLd?.title
    ?? __ctkQueryText(['[data-testid*="job-title"]', '[data-testid*="job"] h1', "h1"]);

  const company = jsonLd?.company
    ?? __ctkQueryText(['[data-testid*="employer"]', '[data-testid*="company"]', 'a[href*="/employers/"]']);

  const location = jsonLd?.location
    ?? __ctkQueryText(['[data-testid*="location"]']);

  const mainEl = document.querySelector('main, [role="main"]');
  const description = jsonLd?.description ?? __ctkStripHtml(mainEl?.innerHTML);

  return {
    title,
    company,
    location,
    salaryRange: jsonLd?.salaryRange ?? __ctkScanForSalary(mainEl?.textContent),
    description,
    source: "HANDSHAKE",
  };
}
