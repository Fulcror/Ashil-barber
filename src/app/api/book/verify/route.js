import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { appointmentId, confirmationCode } = body;

    // Validate required fields
    if (!appointmentId || !confirmationCode) {
      return Response.json(
        {
          success: false,
          error: "Missing required fields: appointmentId, confirmationCode",
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
    if (appointment.confirmationCode !== confirmationCode) {
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
    console.error("Verification error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to verify appointment. Please try again.",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
