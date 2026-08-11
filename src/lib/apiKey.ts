import { randomBytes } from "crypto";

export function generateApiKey() {
  return `ctk_${randomBytes(24).toString("hex")}`;
}
