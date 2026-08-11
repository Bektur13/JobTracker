// Injected into the page. Depends on lib/jsonld.js + lib/textUtils.js.
//
// KNOWN LIMITATION (v1): targets /jobs/view/<id> pages. LinkedIn's
// search-results split-pane preview uses different markup and likely won't
// parse correctly — open the full posting first.
//
// LinkedIn obfuscates class names and redesigns often, so this is a
// best-effort parser. Each field below is an ordered fallback chain — if a
// selector breaks, append a new one rather than rewriting the function.
function __ctkParseLinkedIn() {
  const jsonLd = __ctkExtractJsonLdJobPosting();

  const title = jsonLd?.title
    ?? __ctkQueryText([
      ".job-details-jobs-unified-top-card__job-title h1",
      ".jobs-unified-top-card__job-title",
      "h1",
    ]);

  const company = jsonLd?.company
    ?? __ctkQueryText([
      ".job-details-jobs-unified-top-card__company-name a",
      ".jobs-unified-top-card__company-name",
      'a[href*="/company/"]',
    ]);

  const location = jsonLd?.location
    ?? __ctkQueryText([
      ".job-details-jobs-unified-top-card__primary-description-container",
      ".jobs-unified-top-card__bullet",
    ]);

  const description = jsonLd?.description
    ?? __ctkStripHtml(document.querySelector("#job-details, .jobs-description__content")?.innerHTML);

  const topCardText = document.querySelector(
    ".job-details-jobs-unified-top-card__primary-description-container, .jobs-unified-top-card"
  )?.textContent;

  return {
    title,
    company,
    location,
    salaryRange: jsonLd?.salaryRange ?? __ctkScanForSalary(topCardText) ?? __ctkScanForSalary(description),
    description,
    source: "LINKEDIN",
  };
}
