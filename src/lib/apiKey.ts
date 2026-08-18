import { randomBytes } from "crypto";

export function generateApiKey() {
  return `ctk_${randomBytes(24).toString("hex")}`;
}

// Short-lived, single-use code for the extension's "Connect account" handoff —
// deliberately separate from the long-lived API key, since this one gets
// exposed in a tab URL and should never be the persistent secret itself.
export function generateConnectCode() {
  return randomBytes(16).toString("hex");
}
