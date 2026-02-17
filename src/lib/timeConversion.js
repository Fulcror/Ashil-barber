import { fromZonedTime } from "date-fns-tz";

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
  let hour24 = parseInt(hours, 10);

  // Convert to 24-hour format
  if (period === "PM" && hour24 !== 12) {
    hour24 += 12;
  } else if (period === "AM" && hour24 === 12) {
    hour24 = 0;
  }

  const timeZone = "Asia/Dubai";
  const localDateTimeString = `${dateStr}T${hour24
    .toString()
    .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;

  // Convert from the specified timezone to UTC explicitly
  return fromZonedTime(localDateTimeString, timeZone);
}
