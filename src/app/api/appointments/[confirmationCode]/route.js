import { prisma } from "@/lib/prisma";
import { handleRouteError } from "@/lib/errorHandler";
import { validateConfirmationCode } from "@/lib/validation";

export async function GET(request, { params }) {
  try {
    const { confirmationCode } = (params ? await params : {}) || {};

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

    return Response.json(
      {
        success: true,
        appointment: {
          id: appointment.id,
          startDatetimeUtc: appointment.startDatetimeUtc,
          endDatetimeUtc: appointment.endDatetimeUtc,
          phoneNumber: appointment.phoneNumber,
          confirmationCode: appointment.confirmationCode,
          status: appointment.status,
          createdAt: appointment.createdAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error, "LOOKUP");
  }
}
