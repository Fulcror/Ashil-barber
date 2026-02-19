import { addDays, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { convertToUTC } from "@/lib/timeConversion";
import { prisma } from "@/lib/prisma";
import { handleRouteError } from "@/lib/errorHandler";

export async function GET() {
  try {
    // Timezone for Dubai/UAE (UTC+4)
    const timeZone = "Asia/Dubai";

    // Get today's date in the specified timezone
    const today = toZonedTime(new Date(), timeZone);
    const availableDates = [];

    // Generate dates for the next 30 days, but only include Mon-Fri
    for (let i = 0; i < 30; i++) {
      const date = addDays(today, i);
      const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

      // Only allow specific weekdays
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const isoDate = format(date, "yyyy-MM-dd");
        availableDates.push(isoDate);
      }
    }

    // All possible hours for each date
    const allHours = [
      "09:00 AM",
      "11:00 AM",
      "01:00 PM",
      "03:00 PM",
      "05:00 PM",
    ];

    // Fetch all booked appointments from database
    const bookedAppointments = await prisma.bookedAppointment.findMany({
      where: {
        status: {
          in: ["confirmed", "pending"], // Both confirmed and pending block slots
        },
      },
    });

    // Build availability map with status for each slot
    const availability = {};
    const datesWithAvailableSlots = [];

    availableDates.forEach((dateStr) => {
      // Map all hours to objects with status
      const timeSlots = allHours.map((timeStr) => {
        // Convert to UTC using the shared helper function
        const utcDateTime = convertToUTC(dateStr, timeStr);

        // Check if this time slot is booked
        const isBooked = bookedAppointments.some((appointment) => {
          const appointmentStart = new Date(appointment.startDatetimeUtc);
          return appointmentStart.getTime() === utcDateTime.getTime();
        });

        return {
          time: timeStr,
          status: isBooked ? "booked" : "available",
        };
      });

      availability[dateStr] = timeSlots;

      // Only include dates that have at least one available slot
      const hasAvailableSlot = timeSlots.some(
        (slot) => slot.status === "available",
      );
      if (hasAvailableSlot) {
        datesWithAvailableSlots.push(dateStr);
      }
    });

    const responseData = {
      success: true,
      availableDates: datesWithAvailableSlots,
      availability,
      timestamp: new Date().toISOString(),
    };

    return Response.json(responseData);
  } catch (error) {
    return handleRouteError(error, "CALENDAR");
  }
}
