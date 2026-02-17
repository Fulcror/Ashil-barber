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

export const title = "Calendar as Appointment Picker";

const CalendarPicker = ({ onClose }) => {
  const timeZone = "Asia/Dubai";
  const [date, setDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [step, setStep] = useState("date"); // 'date', 'time', 'form', 'verification', 'success'
  const [availableDates, setAvailableDates] = useState([]);
  const [availability, setAvailability] = useState({});
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [appointmentId, setAppointmentId] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [verificationInput, setVerificationInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [bookingData, setBookingData] = useState(null);
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

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setBookingError(null);
    setStep("form");
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
    setStep("date");
    setFormData({
      name: "",
      phone: "",
    });
    setVerificationInput("");
    setAppointmentId(null);
    setConfirmationCode("");
    setBookingData(null);
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

              {step === "time" && (
                <BookingTimeSelector
                  availableTimes={availableTimes}
                  selectedTime={selectedTime}
                  loading={loading}
                  onTimeSelect={handleTimeSelect}
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
        onBackToTime={handleBackToTime}
        onBackToDate={handleBackToDate}
        onClose={onClose}
        onContinue={() => selectedTime && setStep("form")}
        onSubmit={handleSubmit}
        onVerify={handleVerification}
        onCloseAndReset={handleCloseAndReset}
      />
    </div>
  );
};

export default CalendarPicker;