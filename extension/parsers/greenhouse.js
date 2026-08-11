// Injected into the page. Depends on lib/jsonld.js + lib/textUtils.js being
// injected first. Greenhouse-hosted boards are template-generated — the most
// reliable of the three sites, but still expect these class names to need a
// spot-check against a live posting, they're not guaranteed current.
function __ctkParseGreenhouse() {
  const jsonLd = __ctkExtractJsonLdJobPosting();

  const title = jsonLd?.title
    ?? __ctkQueryText([".app-title", "h1"])
    ?? document.title;

  const company = jsonLd?.company
    ?? __ctkQueryText([".company-name"])
    ?? __ctkQueryAttr(['meta[property="og:site_name"]'], "content")
    ?? location.hostname.split(".")[0];

  const description = jsonLd?.description
    ?? __ctkStripHtml(document.querySelector("#content, .job__description")?.innerHTML);

  return {
    title,
    company,
    location: jsonLd?.location ?? __ctkQueryText([".location"]),
    salaryRange: jsonLd?.salaryRange ?? __ctkScanForSalary(description),
    description,
    source: "GREENHOUSE",
  };
}
