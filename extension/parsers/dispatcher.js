// Injected last, after jsonld.js, textUtils.js, and all three parsers —
// its return value becomes chrome.scripting.executeScript's injection result.
(function __ctkDispatch() {
  const host = location.hostname;

  if (host.includes("greenhouse.io")) return __ctkParseGreenhouse();
  if (host.includes("linkedin.com")) return __ctkParseLinkedIn();
  if (host.includes("joinhandshake.com")) return __ctkParseHandshake();

  return { error: "UNSUPPORTED_SITE" };
})();
