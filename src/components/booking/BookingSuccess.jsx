import { format } from "date-fns";

export default function BookingSuccess({
  date,
  selectedTime,
  confirmationCode,
  formData,
}) {
  const barberWhatsApp = "+23055351954";

  const handleSendToWhatsApp = () => {
    const message = `Hi! I have an appointment booked.\n\nName: ${formData.name}\nDate: ${format(date, "MMMM d, yyyy")}\nTime: ${selectedTime}\nConfirmation Code: ${confirmationCode}\n\nPlease save this code.`;

    // URL encode the message
    const encodedMessage = encodeURIComponent(message);

    // Open WhatsApp with barber's number
    window.open(`https://wa.me/${barberWhatsApp.replace("+", "")}?text=${encodedMessage}`);
  };

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Appointment Confirmed!
        </h3>
        <p className="text-sm text-gray-600">
          Your appointment has been successfully booked.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 text-left space-y-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Date & Time
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {format(date, "EEEE, MMMM d, yyyy")} at {selectedTime}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Confirmation Code
          </p>
          <p className="text-sm font-mono font-semibold text-gray-900">
            {confirmationCode}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
          <p className="text-sm font-semibold text-gray-900">
            {formData.name}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-600 px-2">
        Save your confirmation code. You'll need it to reschedule or cancel your
        appointment.
      </p>

      <button
        onClick={handleSendToWhatsApp}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.98 1.207c-1.533.934-2.774 2.319-3.594 3.903-.897 1.706-1.265 3.592-1.032 5.45.273 2.057 1.292 3.9 2.872 5.15 1.58 1.25 3.605 1.741 5.563 1.385 2.057-.386 3.863-1.465 5.05-3.055.862-1.197 1.457-2.631 1.593-4.158.107-1.204-.046-2.384-.35-3.475.002-.062.016-.126.033-.189m-.314-11.82C8.82 0 4.467.248 1.653 2.37.536 3.304 0 5.293 0 7.357c0 2.278 1.104 4.48 3.084 6.234 1.52 1.345 3.496 2.23 5.657 2.479.428.04.858.058 1.289.058 2.065 0 4.088-.636 5.797-1.79 1.635-1.098 2.811-2.68 3.418-4.512 1.23-3.866.576-8.045-1.764-11.036C16.85 1.286 12.79 0 8.626 0z" />
        </svg>
        Send to WhatsApp
      </button>
    </div>
  );
}
