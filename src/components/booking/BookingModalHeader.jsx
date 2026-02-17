import { format } from "date-fns";

export default function BookingModalHeader({
  step,
  date,
  selectedTime,
  onClose,
  onCloseFromSuccess,
}) {
  return (
    <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 flex-shrink-0">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
          {step === "date" && "Select Date"}
          {step === "time" && "Select Time"}
          {step === "form" && "Your Details"}
          {step === "verification" && "Verify Confirmation Code"}
          {step === "success" && "Booking Confirmed!"}
        </h2>
        {(step === "time" || step === "form" || step === "verification") && (
          <p className="text-sm text-gray-500 mt-1">
            {format(date, "EEE, MMM d, yyyy")}
            {(step === "form" || step === "verification") && ` at ${selectedTime}`}
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
