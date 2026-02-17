/**
 * Format Mauritius phone number to international format
 * Handles: 5551234, 05551234, +2305551234
 * Returns: +2305551234
 */
export function formatPhoneForWhatsApp(phone) {
  if (!phone) return "";

  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // Remove leading + if present (we'll add it back)
  cleaned = cleaned.replace(/^\+/, "");

  // Remove leading 0 if present
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  // Add country code if not present
  if (!cleaned.startsWith("230")) {
    cleaned = "230" + cleaned;
  }

  return "+" + cleaned;
}
