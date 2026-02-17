import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { confirmationCode } = (params ? await params : {}) || {};

    if (!confirmationCode) {
      return Response.json(
        {
          success: false,
          error: "Missing confirmation code",
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
    console.error("Lookup error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch appointment. Please try again.",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
