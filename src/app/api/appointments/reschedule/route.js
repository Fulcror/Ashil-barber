import { convertToUTC } from "@/lib/timeConversion";
import { prisma } from "@/lib/prisma";

function generateConfirmationCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { confirmationCode, newDate, newTime } = body;

    if (!confirmationCode || !newDate || !newTime) {
      return Response.json(
        {
          success: false,
          error: "Missing required fields: confirmationCode, newDate, newTime",
        },
        { status: 400 },
      );
    }

    const appointment = await prisma.bookedAppointment.findUnique({
      where: { confirmationCode: confirmationCode.toUpperCase() },
    });

    if (!appointment) {
      return Response.json(
        {
          success: false,
          error: "Appointment not found",
        },
        { status: 404 },
      );
    }

    if (appointment.status === "canceled") {
      return Response.json(
        {
          success: false,
          error: "This appointment has already been canceled",
        },
        { status: 400 },
      );
    }

    const utcDateTime = convertToUTC(newDate, newTime);
    const utcEndDateTime = new Date(utcDateTime.getTime() + 1 * 60 * 60 * 1000);

    const existingAppointment = await prisma.bookedAppointment.findFirst({
      where: {
        startDatetimeUtc: utcDateTime,
        status: {
          in: ["confirmed", "pending"],
        },
        id: {
          not: appointment.id,
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

    const updatedAppointment = await prisma.bookedAppointment.update({
      where: { id: appointment.id },
      data: { status: "canceled" },
    });

    const newConfirmationCode = generateConfirmationCode();

    const newAppointment = await prisma.bookedAppointment.create({
      data: {
        startDatetimeUtc: utcDateTime,
        endDatetimeUtc: utcEndDateTime,
        phoneNumber: appointment.phoneNumber,
        confirmationCode: newConfirmationCode,
        status: "confirmed",
      },
    });

    return Response.json(
      {
        success: true,
        message: "Appointment rescheduled successfully",
        oldAppointment: updatedAppointment,
        newAppointment: newAppointment,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reschedule error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to reschedule appointment. Please try again.",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
