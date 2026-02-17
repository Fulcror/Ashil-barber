import { convertToUTC } from "@/lib/timeConversion";
import { prisma } from "@/lib/prisma";

// Helper to generate a simple confirmation code
function generateConfirmationCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { date, time, name, phone } = body;

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

    // Convert date and time to UTC using shared helper
    const utcDateTime = convertToUTC(date, time);

    // Create end time (1 hour after start)
    const utcEndDateTime = new Date(utcDateTime.getTime() + 1 * 60 * 60 * 1000);

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
