import crypto from "crypto";

export function generateSecureConfirmationCode() {
  // Generate 4 random bytes = 8 hex characters
  return crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 8);
}
