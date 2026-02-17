/**
 * Convert a date string and time string to UTC
 * Date format: "YYYY-MM-DD"
 * Time format: "HH:MM AM/PM" (e.g., "09:00 AM", "01:00 PM")
 * Timezone: Asia/Dubai (UTC+4)
 */
export function convertToUTC(dateStr, timeStr) {
  // Parse time string
  const [time, period] = timeStr.split(" ");
  const [hours, minutes] = time.split(":");
  let hour24 = parseInt(hours);

  // Convert to 24-hour format
  if (period === "PM" && hour24 !== 12) {
    hour24 += 12;
  } else if (period === "AM" && hour24 === 12) {
    hour24 = 0;
  }

  // Create a date object treating it as UTC+4 time
  // This is the exact same logic as the booking API
  const localDateTime = new Date(
    `${dateStr}T${hour24.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`,
  );

  // Convert to UTC by subtracting 4 hours (UTC+4 -> UTC)
  const utcDateTime = new Date(localDateTime.getTime() - 4 * 60 * 60 * 1000);

  return utcDateTime;
}
