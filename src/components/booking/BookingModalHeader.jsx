import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export default function BookingModalHeader({
  step,
  date,
  selectedTime,
  appointment,
  timeZone = "Asia/Dubai",
  onClose,
  onCloseFromSuccess,
}) {
  const appointmentStart = appointment
    ? toZonedTime(new Date(appointment.startDatetimeUtc), timeZone)
    : null;
  const appointmentDateLabel = appointmentStart
    ? format(appointmentStart, "EEE, MMM d, yyyy")
    : null;
  const appointmentTimeLabel = appointmentStart
    ? format(appointmentStart, "hh:mm a")
    : null;

  const hasValidDate = date instanceof Date && !isNaN(date.getTime());
  const showCalendarContext =
    hasValidDate &&
    (step === "time" ||
      step === "form" ||
      step === "verification" ||
      step === "reschedule-date" ||
      step === "reschedule-time");

  const showAppointmentContext =
    step === "details" ||
    step === "cancel-success" ||
    step === "reschedule-success";

  return (
    <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 flex-shrink-0">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
          {step === "date" && "Select Date"}
          {step === "time" && "Select Time"}
          {step === "form" && "Your Details"}
          {step === "verification" && "Verify Confirmation Code"}
          {step === "success" && "Booking Confirmed!"}
          {step === "lookup" && "Manage Appointment"}
          {step === "details" && "Appointment Details"}
          {step === "reschedule-date" && "Select New Date"}
          {step === "reschedule-time" && "Select New Time"}
          {step === "reschedule-success" && "Reschedule Confirmed!"}
          {step === "cancel-success" && "Appointment Canceled"}
        </h2>
        {showCalendarContext && (
          <p className="text-sm text-gray-500 mt-1">
            {format(date, "EEE, MMM d, yyyy")}
            {(step === "form" || step === "verification" || step === "reschedule-time") &&
              ` at ${selectedTime}`}
          </p>
        )}
        {showAppointmentContext && appointmentDateLabel && appointmentTimeLabel && (
          <p className="text-sm text-gray-500 mt-1">
            {appointmentDateLabel} at {appointmentTimeLabel}
          </p>
        )}
      </div>
      <button
        onClick={step === "success" ? onCloseFromSuccess : onClose}
        className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
      >
        ×
      </button>
    </div>
  );
}
