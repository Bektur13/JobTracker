// Injected into the page. No imports/exports (classic script) — exposes
// window.__ctkExtractJsonLdJobPosting for the site parsers to call first,
// since JSON-LD structured data is far more durable than CSS-class scraping.
function __ctkExtractJsonLdJobPosting() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');

  for (const script of scripts) {
    let data;
    try {
      data = JSON.parse(script.textContent);
    } catch {
      continue;
    }

    const candidates = Array.isArray(data) ? data : [data];

    for (const candidate of candidates) {
      const type = candidate["@type"];
      const isJobPosting = type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"));
      if (!isJobPosting) continue;

      const locationParts = [];
      const jobLocation = candidate.jobLocation?.address ?? candidate.jobLocation?.[0]?.address;
      if (jobLocation) {
        if (jobLocation.addressLocality) locationParts.push(jobLocation.addressLocality);
        if (jobLocation.addressRegion) locationParts.push(jobLocation.addressRegion);
      }

      let salaryRange;
      const salary = candidate.baseSalary?.value;
      if (salary) {
        if (salary.minValue && salary.maxValue) {
          salaryRange = `${salary.minValue} - ${salary.maxValue} ${candidate.baseSalary.currency ?? ""}`.trim();
        } else if (salary.value) {
          salaryRange = `${salary.value} ${candidate.baseSalary.currency ?? ""}`.trim();
        }
      }

      const cleanDescription = typeof __ctkStripHtml === "function"
        ? __ctkStripHtml(candidate.description)
        : candidate.description ?? null;

      return {
        title: candidate.title ?? null,
        company: candidate.hiringOrganization?.name ?? null,
        location: locationParts.join(", ") || null,
        salaryRange: salaryRange ?? null,
        description: cleanDescription,
      };
    }
  }

  return null;
}
