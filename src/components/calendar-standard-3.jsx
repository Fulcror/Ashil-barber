"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { ScrollArea } from "@/components/ui/scroll-area";
import BookingDateSelector from "@/components/booking/BookingDateSelector";
import BookingTimeSelector from "@/components/booking/BookingTimeSelector";
import BookingForm from "@/components/booking/BookingForm";
import BookingVerification from "@/components/booking/BookingVerification";
import BookingSuccess from "@/components/booking/BookingSuccess";
import BookingModalHeader from "@/components/booking/BookingModalHeader";
import BookingModalFooter from "@/components/booking/BookingModalFooter";
import AppointmentLookup from "@/components/booking/AppointmentLookup";
import AppointmentDisplay from "@/components/booking/AppointmentDisplay";
import RescheduleSuccess from "@/components/booking/RescheduleSuccess";
import CancelConfirmation from "@/components/booking/CancelConfirmation";

export const title = "Calendar as Appointment Picker";

const CalendarPicker = ({ onClose, mode = "book" }) => {
  const timeZone = "Asia/Dubai";
  const [date, setDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [step, setStep] = useState(mode === "manage" ? "lookup" : "date");
  const [availableDates, setAvailableDates] = useState([]);
  const [availability, setAvailability] = useState({});
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(mode !== "manage");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [appointmentId, setAppointmentId] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [verificationInput, setVerificationInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [lookupCode, setLookupCode] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [manageAppointment, setManageAppointment] = useState(null);
  const [rescheduledAppointment, setRescheduledAppointment] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const refreshCalendarData = async () => {
    try {
      const response = await fetch("/api/calendar");
      const data = await response.json();
      setAvailableDates(data.availableDates || []);
      setAvailability(data.availability || {});
      setAvailableTimes([]);
    } catch (error) {
      console.error("Failed to fetch availability:", error);
      setBookingError("Failed to load availability. Please try again.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    refreshCalendarData();
  }, []); // Empty dependency array - fetch only once on mount

  // Update available times when date changes or availability is loaded
  useEffect(() => {
    if (date && availability && date instanceof Date && !isNaN(date.getTime())) {
      const isoDate = format(date, "yyyy-MM-dd");
      setAvailableTimes(availability[isoDate] || []);
    } else {
      setAvailableTimes([]);
    }
  }, [date, availability]);

  const handleDateSelect = (newDate) => {
    // Handle undefined (user clicked same date to deselect)
    if (!newDate) {
      return;
    }

    // Validate that newDate is a valid Date object
    if (!(newDate instanceof Date) || isNaN(newDate.getTime())) {
      console.error("Invalid date object:", newDate);
      setBookingError("Invalid date selected. Please try again.");
      return;
    }

    // Convert to timezone-aware date
    const zonedDate = toZonedTime(newDate, timeZone);
    setDate(zonedDate);
    setSelectedTime(null);
    setBookingError(null);

    const isoDate = format(zonedDate, "yyyy-MM-dd");
    const times = availability[isoDate] || [];
    setAvailableTimes(times);
    setStep("time");
  };

  const handleRescheduleDateSelect = (newDate) => {
    if (!newDate) {
      return;
    }

    if (!(newDate instanceof Date) || isNaN(newDate.getTime())) {
      console.error("Invalid date object:", newDate);
      setBookingError("Invalid date selected. Please try again.");
      return;
    }

    const zonedDate = toZonedTime(newDate, timeZone);
    setDate(zonedDate);
    setSelectedTime(null);
    setBookingError(null);

    const isoDate = format(zonedDate, "yyyy-MM-dd");
    const times = availability[isoDate] || [];
    setAvailableTimes(times);
    setStep("reschedule-time");
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setBookingError(null);
    setStep("form");
  };

  const handleRescheduleTimeSelect = (time) => {
    setSelectedTime(time);
    setBookingError(null);
  };

  const handleBackToTime = () => {
    setStep("time");
  };

  const handleBackToDate = async () => {
    setDate(null);
    setSelectedTime(null);
    setBookingError(null);
    setLoading(true);
    await refreshCalendarData();
    setStep("date");
  };

  const handleBackToRescheduleDate = () => {
    setSelectedTime(null);
    setBookingError(null);
    setStep("reschedule-date");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setBookingError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setBookingError("Please enter your name");
      return;
    }
    if (!formData.phone.trim()) {
      setBookingError("Please enter your phone number");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: format(date, "yyyy-MM-dd"),
          time: selectedTime,
          name: formData.name,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setBookingError(data.error || "Failed to book appointment");
        return;
      }

      // Move to verification step instead of closing
      setAppointmentId(data.appointment.id);
      setConfirmationCode(data.appointment.confirmationCode);
      setBookingData(data.appointment);
      setStep("verification");
    } catch (error) {
      console.error("Booking error:", error);
      setBookingError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = async (e) => {
    if (e) {
      e.preventDefault();
    }

    const normalizedCode = lookupCode.trim().toUpperCase();
    if (!normalizedCode) {
      setBookingError("Please enter your confirmation code");
      return;
    }

    setIsLookingUp(true);
    setBookingError(null);

    try {
      const response = await fetch(`/api/appointments/${normalizedCode}`);
      const data = await response.json();

      if (!response.ok) {
        setBookingError(data.error || "Appointment not found");
        return;
      }

      setManageAppointment(data.appointment);
      setStep("details");
    } catch (error) {
      console.error("Lookup error:", error);
      setBookingError("An error occurred. Please try again.");
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleRescheduleStart = () => {
    setDate(null);
    setSelectedTime(null);
    setBookingError(null);
    setStep("reschedule-date");
  };

  const handleRescheduleSubmit = async () => {
    if (!date || !selectedTime || !manageAppointment) {
      setBookingError("Please select a new date and time");
      return;
    }

    setIsRescheduling(true);
    setBookingError(null);

    try {
      const response = await fetch("/api/appointments/reschedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmationCode: manageAppointment.confirmationCode,
          newDate: format(date, "yyyy-MM-dd"),
          newTime: selectedTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setBookingError(data.error || "Failed to reschedule appointment");
        return;
      }

      setManageAppointment(data.oldAppointment);
      setRescheduledAppointment(data.newAppointment);
      setStep("reschedule-success");
    } catch (error) {
      console.error("Reschedule error:", error);
      setBookingError("An error occurred. Please try again.");
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!manageAppointment) {
      return;
    }

    setIsCanceling(true);
    setBookingError(null);

    try {
      const response = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmationCode: manageAppointment.confirmationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setBookingError(data.error || "Failed to cancel appointment");
        return;
      }

      setManageAppointment(data.appointment);
      setStep("cancel-success");
    } catch (error) {
      console.error("Cancel error:", error);
      setBookingError("An error occurred. Please try again.");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();

    if (!verificationInput.trim()) {
      setBookingError("Please enter the confirmation code");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch("/api/book/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId: appointmentId,
          confirmationCode: verificationInput,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setBookingError(data.error || "Verification failed");
        return;
      }

      // Move to success step
      setStep("success");
    } catch (error) {
      console.error("Verification error:", error);
      setBookingError("An error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCloseAndReset = () => {
    onClose();
    setStep(mode === "manage" ? "lookup" : "date");
    setFormData({
      name: "",
      phone: "",
    });
    setDate(null);
    setSelectedTime(null);
    setVerificationInput("");
    setAppointmentId(null);
    setConfirmationCode("");
    setBookingData(null);
    setLookupCode("");
    setManageAppointment(null);
    setRescheduledAppointment(null);
    setBookingError(null);
  };

  const isDateAvailable = (testDate) => {
    const isoDate = format(testDate, "yyyy-MM-dd");
    return availableDates.includes(isoDate);
  };

  return (
    <div className="flex flex-col h-full">
      <BookingModalHeader
        step={step}
        date={date}
        selectedTime={selectedTime}
        appointment={
          step === "details" || step === "cancel-success"
            ? manageAppointment
            : step === "reschedule-success"
              ? rescheduledAppointment
              : null
        }
        timeZone={timeZone}
        onClose={onClose}
        onCloseFromSuccess={handleCloseAndReset}
      />

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-4 lg:p-6">
          {initialLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-black rounded-full animate-spin"></div>
              </div>
              <p className="text-sm text-gray-500">Loading availability...</p>
            </div>
          ) : (
            <>
              {bookingError && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <p className="text-sm text-red-700">{bookingError}</p>
                </div>
              )}

              {step === "date" && (
                <BookingDateSelector
                  date={date}
                  onDateSelect={handleDateSelect}
                  availableDates={availableDates}
                />
              )}

              {step === "lookup" && (
                <AppointmentLookup
                  lookupCode={lookupCode}
                  onChange={(e) => {
                    setLookupCode(e.target.value.toUpperCase());
                    setBookingError(null);
                  }}
                  onSubmit={handleLookup}
                />
              )}

              {step === "details" && (
                <AppointmentDisplay
                  appointment={manageAppointment}
                  timeZone={timeZone}
                />
              )}

              {step === "reschedule-date" && (
                <BookingDateSelector
                  date={date}
                  onDateSelect={handleRescheduleDateSelect}
                  availableDates={availableDates}
                />
              )}

              {step === "time" && (
                <BookingTimeSelector
                  availableTimes={availableTimes}
                  selectedTime={selectedTime}
                  loading={loading}
                  onTimeSelect={handleTimeSelect}
                />
              )}

              {step === "reschedule-time" && (
                <BookingTimeSelector
                  availableTimes={availableTimes}
                  selectedTime={selectedTime}
                  loading={loading}
                  onTimeSelect={handleRescheduleTimeSelect}
                />
              )}

              {step === "form" && (
                <BookingForm
                  formData={formData}
                  onFormChange={handleFormChange}
                />
              )}

              {step === "verification" && (
                <BookingVerification
                  confirmationCode={confirmationCode}
                  verificationInput={verificationInput}
                  onVerificationChange={(e) => {
                    setVerificationInput(e.target.value);
                    setBookingError(null);
                  }}
                  onSubmit={handleVerification}
                />
              )}

              {step === "success" && (
                <BookingSuccess
                  date={date}
                  selectedTime={selectedTime}
                  confirmationCode={confirmationCode}
                  formData={formData}
                />
              )}

              {step === "reschedule-success" && (
                <RescheduleSuccess
                  previousAppointment={manageAppointment}
                  newAppointment={rescheduledAppointment}
                  timeZone={timeZone}
                />
              )}

              {step === "cancel-success" && (
                <CancelConfirmation
                  appointment={manageAppointment}
                  timeZone={timeZone}
                />
              )}
            </>
          )}
        </div>
      </ScrollArea>

      <BookingModalFooter
        step={step}
        selectedTime={selectedTime}
        formData={formData}
        verificationInput={verificationInput}
        isSubmitting={isSubmitting}
        isVerifying={isVerifying}
        lookupCode={lookupCode}
        isLookingUp={isLookingUp}
        isRescheduling={isRescheduling}
        isCanceling={isCanceling}
        isAppointmentCanceled={manageAppointment?.status === "canceled"}
        onBackToTime={handleBackToTime}
        onBackToDate={
          step === "reschedule-time" ? handleBackToRescheduleDate : handleBackToDate
        }
        onBackToDetails={() => setStep("details")}
        onClose={onClose}
        onContinue={() => selectedTime && setStep("form")}
        onSubmit={handleSubmit}
        onVerify={handleVerification}
        onLookup={handleLookup}
        onRescheduleStart={handleRescheduleStart}
        onRescheduleSubmit={handleRescheduleSubmit}
        onCancelAppointment={handleCancelAppointment}
        onCloseAndReset={handleCloseAndReset}
      />
    </div>
  );
};

export default CalendarPicker;