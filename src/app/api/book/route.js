import { convertToUTC } from "@/lib/timeConversion";
import { prisma } from "@/lib/prisma";
import { generateSecureConfirmationCode } from "@/lib/security";
import { handleRouteError } from "@/lib/errorHandler";
import {
  validatePhone,
  validateName,
  validateDate,
  validateTime,
} from "@/lib/validation";

export async function POST(request) {
  try {
    const body = await request.json();
    const { date, time, name, phone } = body;

    // Validate all inputs
    const validatedName = validateName(name);
    const validatedPhone = validatePhone(phone);
    const validatedDate = validateDate(date);
    const validatedTime = validateTime(time);

    // Convert date and time to UTC using shared helper
    const utcDateTime = convertToUTC(validatedDate, validatedTime);

    // Create end time (1 hour after start)
    const utcEndDateTime = new Date(utcDateTime.getTime() + 1 * 60 * 60 * 1000);

    // Generate secure confirmation code
    const confirmationCode = generateSecureConfirmationCode();

    // Try to create the appointment
    // If the time slot is already booked, the database will reject with P2002 error
    try {
      const appointment = await prisma.bookedAppointment.create({
        data: {
          startDatetimeUtc: utcDateTime,
          endDatetimeUtc: utcEndDateTime,
          phoneNumber: validatedPhone,
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
            date: validatedDate,
            time: validatedTime,
            name: validatedName,
            phone: validatedPhone,
            confirmationCode: confirmationCode,
            status: appointment.status,
          },
        },
        { status: 201 },
      );
    } catch (dbError) {
      // P2002 = Unique constraint violation (time slot already booked)
      if (dbError.code === "P2002") {
        return Response.json(
          {
            success: false,
            error:
              "This time slot is no longer available. Please select another time.",
          },
          { status: 409 },
        );
      }
      // Re-throw other database errors to be handled by outer catch
      throw dbError;
    }
  } catch (error) {
    return handleRouteError(error, "BOOKING");
  }
}
