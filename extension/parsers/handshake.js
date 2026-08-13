// Injected into the page. Depends on lib/jsonld.js + lib/textUtils.js.
//
// Handshake uses styled-components with hashed classes (e.g. "sc-dnHZCe") —
// confirmed via a live DOM dump on a job-search/<id> detail-pane page, not
// selector-safe. Durable signals found instead:
//   - the title <h1> is wrapped in a link to /jobs/<jobId>, and that job id
//     is also present in the page URL (job-search/<id> or jobs/<id>)
//   - the company link carries aria-label="<Company Name>" and links to
//     /e/<id> — read the name off the attribute, not text content
//   - salary AND location both live together in a section labeled
//     "At a glance" (found by heading text, not class)
//   - the description sits in a section labeled "Job description"
function __ctkParseHandshake() {
  const jsonLd = __ctkExtractJsonLdJobPosting();

  const jobId = location.pathname.match(/\/(?:job-search|jobs)\/(\d+)/)?.[1];
  const titleLinkEl = jobId ? document.querySelector(`a[href*="/jobs/${jobId}"] h1`) : null;

  const title = jsonLd?.title
    ?? __ctkCleanWhitespace(titleLinkEl?.textContent)
    ?? __ctkQueryText(['[data-testid*="job-title"]', '[data-testid*="job"] h1'])
    ?? __ctkLongestHeading("h1");

  const companyEl = document.querySelector('a[aria-label][href^="/e/"]');
  const company = jsonLd?.company
    ?? companyEl?.getAttribute("aria-label")
    ?? __ctkQueryText(['[data-testid*="employer"]', '[data-testid*="company"]']);

  const atAGlanceText = __ctkFindSectionByHeading(/at a glance/i)?.textContent;

  const location_ = jsonLd?.location
    ?? __ctkScanForLocation(atAGlanceText)
    ?? __ctkQueryText(['[data-testid*="location"]']);

  const descriptionSection = __ctkFindSectionByHeading(/job description/i);
  const description = jsonLd?.description
    ?? __ctkCleanWhitespace(descriptionSection?.textContent)
    ?? __ctkStripHtml(document.querySelector('main, [role="main"]')?.innerHTML);

  return {
    title,
    company,
    location: location_,
    salaryRange: jsonLd?.salaryRange
      ?? __ctkScanForSalary(atAGlanceText)
      ?? __ctkScanForSalary(descriptionSection?.textContent),
    description,
    source: "HANDSHAKE",
  };
}
