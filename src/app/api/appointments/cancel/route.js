import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { confirmationCode } = body;

    if (!confirmationCode) {
      return Response.json(
        {
          success: false,
          error: "Missing required field: confirmationCode",
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
    console.error("Cancel error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to cancel appointment. Please try again.",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
