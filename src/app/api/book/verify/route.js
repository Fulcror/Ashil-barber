import { prisma } from "@/lib/prisma";
import { handleRouteError } from "@/lib/errorHandler";
import { validateConfirmationCode } from "@/lib/validation";

export async function POST(request) {
  try {
    const body = await request.json();
    const { appointmentId, confirmationCode } = body;

    // Validate inputs
    const validatedCode = validateConfirmationCode(confirmationCode);

    // Validate appointmentId (basic existence check)
    if (!appointmentId) {
      return Response.json(
        {
          success: false,
          error: "Missing required field: appointmentId",
        },
        { status: 400 },
      );
    }

    // Find the appointment
    const appointment = await prisma.bookedAppointment.findUnique({
      where: { id: appointmentId },
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

    // Check if code matches
    if (appointment.confirmationCode !== validatedCode) {
      return Response.json(
        {
          success: false,
          error: "Invalid confirmation code. Please try again.",
        },
        { status: 400 },
      );
    }

    // Check if already confirmed
    if (appointment.status === "confirmed") {
      return Response.json(
        {
          success: false,
          error: "This appointment has already been confirmed.",
        },
        { status: 400 },
      );
    }

    // Update appointment status to confirmed
    const updatedAppointment = await prisma.bookedAppointment.update({
      where: { id: appointmentId },
      data: { status: "confirmed" },
    });

    return Response.json(
      {
        success: true,
        message: "Appointment confirmed successfully!",
        appointment: {
          id: updatedAppointment.id,
          confirmationCode: updatedAppointment.confirmationCode,
          status: updatedAppointment.status,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error, "VERIFY");
  }
}
