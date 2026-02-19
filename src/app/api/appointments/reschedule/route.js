import { convertToUTC } from "@/lib/timeConversion";
import { prisma } from "@/lib/prisma";
import { generateSecureConfirmationCode } from "@/lib/security";
import { handleRouteError } from "@/lib/errorHandler";
import {
  validateConfirmationCode,
  validateDate,
  validateTime,
} from "@/lib/validation";

export async function POST(request) {
  try {
    const body = await request.json();
    const { confirmationCode, newDate, newTime } = body;

    // Validate all inputs
    const validatedCode = validateConfirmationCode(confirmationCode);
    const validatedDate = validateDate(newDate);
    const validatedTime = validateTime(newTime);

    const appointment = await prisma.bookedAppointment.findUnique({
      where: { confirmationCode: validatedCode.toUpperCase() },
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

    const utcDateTime = convertToUTC(validatedDate, validatedTime);
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

    const newConfirmationCode = generateSecureConfirmationCode();

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
    return handleRouteError(error, "RESCHEDULE");
  }
}
