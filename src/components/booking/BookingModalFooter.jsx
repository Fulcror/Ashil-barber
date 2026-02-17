import { Button } from "@/components/ui/button";

export default function BookingModalFooter({
  step,
  selectedTime,
  formData,
  verificationInput,
  isSubmitting,
  isVerifying,
  onBackToTime,
  onBackToDate,
  onClose,
  onContinue,
  onSubmit,
  onVerify,
  onCloseAndReset,
}) {
  return (
    <div className="border-t border-gray-200 p-4 lg:p-6 flex gap-3 flex-shrink-0">
      {step === "time" && (
        <Button
          onClick={onBackToDate}
          variant="outline"
          className="flex-1"
        >
          Back
        </Button>
      )}

      {step === "date" && (
        <Button onClick={onClose} variant="outline" className="flex-1">
          Cancel
        </Button>
      )}
      {step === "time" && (
        <Button
          onClick={onContinue}
          disabled={!selectedTime}
          className="flex-1 bg-black hover:bg-gray-800 text-white"
        >
          Continue
        </Button>
      )}
      {step === "form" && (
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || !formData.name.trim()}
          className="flex-1 bg-black hover:bg-gray-800 text-white"
        >
          {isSubmitting ? "Booking..." : "Book Appointment"}
        </Button>
      )}
      {step === "verification" && (
        <Button
          onClick={onVerify}
          disabled={isVerifying || !verificationInput.trim()}
          className="flex-1 bg-black hover:bg-gray-800 text-white"
        >
          {isVerifying ? "Verifying..." : "Confirm"}
        </Button>
      )}
      {step === "success" && (
        <Button
          onClick={onCloseAndReset}
          className="flex-1 bg-black hover:bg-gray-800 text-white"
        >
          Done
        </Button>
      )}
    </div>
  );
}
