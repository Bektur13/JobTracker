// Injected into the page. Depends on lib/jsonld.js + lib/textUtils.js.
//
// LinkedIn has (at least) THREE distinct layouts encountered so far:
// 1. Dedicated /jobs/view/<id>/ page — semantic BEM-style classes
//    (.job-details-jobs-unified-top-card__*, .topcard__* on the older
//    public/logged-out variant).
// 2. Search-results split-pane preview (/jobs/search-results/?currentJobId=)
//    — classes are hashed/auto-generated (e.g. "c7f3f3a7") and change on
//    every LinkedIn deploy, so they're not selector-safe at all. Confirmed
//    via a live DOM dump: no h1, no top-card classes, no JSON-LD present.
//    The only stable signals on this layout are functional, not stylistic:
//      - the title is a link to /jobs/view/<currentJobId>/...
//      - the description has data-testid="expandable-text-box"
//      - the company is a link to /company/<slug>/
//      - location has NO stable selector — pattern-matched from nearby text.
//
// Each field below tries the semantic selectors first (layout 1), then the
// structural/attribute fallbacks (layout 2). If a selector breaks, append a
// new one rather than rewriting the function.
function __ctkParseLinkedIn() {
  const jsonLd = __ctkExtractJsonLdJobPosting();
  const currentJobId = new URLSearchParams(location.search).get("currentJobId");

  const titleEl = currentJobId
    ? document.querySelector(`a[href*="/jobs/view/${currentJobId}"]`)
    : null;

  const title = jsonLd?.title
    ?? __ctkQueryText([
      ".job-details-jobs-unified-top-card__job-title h1",
      ".jobs-unified-top-card__job-title",
      ".top-card-layout__title",
      ".topcard__title",
      '[class*="job-title"]',
    ])
    ?? __ctkCleanWhitespace(titleEl?.textContent)
    ?? __ctkQueryText(['a[href*="/jobs/view/"]'])
    ?? __ctkLongestHeading("h1");

  const companyEl = document.querySelector(
    '.job-details-jobs-unified-top-card__company-name a, .topcard__org-name-link, .top-card-layout__second-subline a, a[href*="/company/"]'
  );

  const company = jsonLd?.company ?? __ctkCleanWhitespace(companyEl?.textContent);

  const location_ = jsonLd?.location
    ?? __ctkQueryText([
      ".job-details-jobs-unified-top-card__primary-description-container",
      ".jobs-unified-top-card__bullet",
      ".topcard__flavor--bullet",
      ".top-card-layout__second-subline",
    ])
    ?? __ctkScanForLocation(__ctkTextNear(titleEl ?? companyEl, 3));

  const description = jsonLd?.description
    ?? __ctkStripHtml(
      document.querySelector(
        '#job-details, .jobs-description__content, .description__text, [data-testid="expandable-text-box"]'
      )?.innerHTML
    );

  const topCardText = document.querySelector(
    ".job-details-jobs-unified-top-card__primary-description-container, .jobs-unified-top-card, .top-card-layout"
  )?.textContent;

  return {
    title,
    company,
    location: location_,
    salaryRange: jsonLd?.salaryRange ?? __ctkScanForSalary(topCardText) ?? __ctkScanForSalary(description),
    description,
    source: "LINKEDIN",
  };
}
