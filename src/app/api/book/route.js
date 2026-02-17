import { format, parse } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to generate a simple confirmation code
function generateConfirmationCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Helper to convert time string to 24-hour format
function parseTimeString(timeStr) {
  const [time, period] = timeStr.split(" ");
  const [hours, minutes] = time.split(":");
  let hour24 = parseInt(hours);

  if (period === "PM" && hour24 !== 12) {
    hour24 += 12;
  } else if (period === "AM" && hour24 === 12) {
    hour24 = 0;
  }

  return { hour24, minutes: parseInt(minutes) };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { date, time, name, phone, contactMethod, notes } = body;

    // Validate required fields
    if (!date || !time || !name || !phone) {
      return Response.json(
        {
          success: false,
          error: "Missing required fields: date, time, name, phone",
        },
        { status: 400 },
      );
    }

    // Parse the time string
    const { hour24, minutes } = parseTimeString(time);

    // Create a date in UTC+4 timezone (Asia/Dubai)
    const timeZone = "Asia/Dubai";
    const localDateTime = new Date(
      `${date}T${hour24.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`,
    );

    // Convert to UTC (subtract 4 hours for timezone offset)
    const utcDateTime = new Date(localDateTime.getTime() - 4 * 60 * 60 * 1000);

    // Create end time (2 hours after start)
    const utcEndDateTime = new Date(utcDateTime.getTime() + 2 * 60 * 60 * 1000);

    // Check if appointment slot is already booked
    const existingAppointment = await prisma.bookedAppointment.findFirst({
      where: {
        startDatetimeUtc: utcDateTime,
        status: {
          in: ["confirmed", "pending"], // Block both confirmed and pending appointments
        },
      },
    });

    if (existingAppointment) {
      return Response.json(
        {
          success: false,
          error:
            "This time slot is no longer available. Please select another time.",
        },
        { status: 409 },
      );
    }

    // Generate confirmation code
    const confirmationCode = generateConfirmationCode();

    // Create the appointment in the database
    const appointment = await prisma.bookedAppointment.create({
      data: {
        startDatetimeUtc: utcDateTime,
        endDatetimeUtc: utcEndDateTime,
        phoneNumber: phone,
        confirmationCode: confirmationCode,
        status: "pending",
      },
    });

    // Return success response
    return Response.json(
      {
        success: true,
        message: "Appointment booked successfully!",
        appointment: {
          id: appointment.id,
          date: date,
          time: time,
          name: name,
          phone: phone,
          contactMethod: contactMethod,
          notes: notes,
          confirmationCode: confirmationCode,
          status: appointment.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Booking error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to book appointment. Please try again.",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
