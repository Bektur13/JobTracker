// Injected last, after jsonld.js, textUtils.js, and all three parsers —
// its return value becomes chrome.scripting.executeScript's injection result.
// chrome.scripting supports async injected scripts (it awaits the returned
// promise), so this retries a couple of times before giving up: LinkedIn and
// Handshake are SPAs that often haven't finished rendering the job details
// pane at the exact moment the popup button is clicked.
(async function __ctkDispatch() {
  const host = location.hostname;

  const parse = host.includes("greenhouse.io") ? __ctkParseGreenhouse
    : host.includes("linkedin.com") ? __ctkParseLinkedIn
    : host.includes("joinhandshake.com") ? __ctkParseHandshake
    : null;

  if (!parse) return { error: "UNSUPPORTED_SITE" };

  let result = parse();

  for (let attempt = 0; attempt < 3 && !result.title; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    result = parse();
  }

  return result;
})();
