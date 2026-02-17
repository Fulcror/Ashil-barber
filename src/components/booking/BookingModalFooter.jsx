import { Button } from "@/components/ui/button";

export default function BookingModalFooter({
  step,
  selectedTime,
  formData,
  verificationInput,
  isSubmitting,
  isVerifying,
  lookupCode,
  isLookingUp,
  isRescheduling,
  isCanceling,
  isAppointmentCanceled,
  onBackToTime,
  onBackToDate,
  onBackToDetails,
  onClose,
  onContinue,
  onSubmit,
  onVerify,
  onLookup,
  onRescheduleStart,
  onRescheduleSubmit,
  onCancelAppointment,
  onCloseAndReset,
}) {
  return (
    <div className="border-t border-gray-200 p-4 lg:p-6 flex gap-3 flex-shrink-0">
      {step === "lookup" && (
        <Button onClick={onClose} variant="outline" className="flex-1">
          Cancel
        </Button>
      )}

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
      {step === "reschedule-date" && (
        <Button onClick={onBackToDetails} variant="outline" className="flex-1">
          Back
        </Button>
      )}
      {step === "reschedule-time" && (
        <Button onClick={onBackToDate} variant="outline" className="flex-1">
          Back
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
      {step === "lookup" && (
        <Button
          onClick={onLookup}
          disabled={isLookingUp || !lookupCode.trim()}
          className="flex-1 bg-black hover:bg-gray-800 text-white"
        >
          {isLookingUp ? "Searching..." : "Find Appointment"}
        </Button>
      )}
      {step === "details" && isAppointmentCanceled && (
        <Button
          onClick={onCloseAndReset}
          className="flex-1 bg-black hover:bg-gray-800 text-white"
        >
          Done
        </Button>
      )}
      {step === "details" && !isAppointmentCanceled && (
        <>
          <Button
            onClick={onCancelAppointment}
            disabled={isCanceling}
            variant="outline"
            className="flex-1"
          >
            {isCanceling ? "Canceling..." : "Cancel Appointment"}
          </Button>
          <Button
            onClick={onRescheduleStart}
            className="flex-1 bg-black hover:bg-gray-800 text-white"
          >
            Reschedule
          </Button>
        </>
      )}
      {step === "reschedule-time" && (
        <Button
          onClick={onRescheduleSubmit}
          disabled={isRescheduling || !selectedTime}
          className="flex-1 bg-black hover:bg-gray-800 text-white"
        >
          {isRescheduling ? "Rescheduling..." : "Reschedule"}
        </Button>
      )}
      {(step === "reschedule-success" || step === "cancel-success") && (
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
