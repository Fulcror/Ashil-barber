import { prisma } from "@/lib/prisma";
import { handleRouteError } from "@/lib/errorHandler";
import { validateConfirmationCode } from "@/lib/validation";

export async function POST(request) {
  try {
    const body = await request.json();
    const { confirmationCode } = body;

    // Validate confirmation code
    const validatedCode = validateConfirmationCode(confirmationCode);

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
          success: true,
          message: "Appointment already canceled",
          appointment,
        },
        { status: 200 },
      );
    }

    const updatedAppointment = await prisma.bookedAppointment.update({
      where: { id: appointment.id },
      data: { status: "canceled" },
    });

    return Response.json(
      {
        success: true,
        message: "Appointment canceled successfully",
        appointment: updatedAppointment,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error, "CANCEL");
  }
}
