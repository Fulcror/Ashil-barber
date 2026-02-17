"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";

export const title = "Calendar as Appointment Picker";

const Example = ({ onClose }) => {
  const timeZone = "Asia/Dubai";
  const [date, setDate] = useState(() => {
    return toZonedTime(new Date(), timeZone);
  });
  const [selectedTime, setSelectedTime] = useState(null);
  const [step, setStep] = useState("date"); // 'date', 'time', 'form'
  const [availableDates, setAvailableDates] = useState([]);
  const [availability, setAvailability] = useState({});
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    contactMethod: "whatsapp",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/calendar");
        const data = await response.json();
        setAvailableDates(data.availableDates || []);
        setAvailability(data.availability || {});

        const isoDate = format(date, "yyyy-MM-dd");
        setAvailableTimes(data.availability[isoDate] || []);
      } catch (error) {
        console.error("Failed to fetch availability:", error);
        setBookingError("Failed to load availability. Please try again.");
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [date]);

  const handleDateSelect = (newDate) => {
    setDate(newDate);
    setSelectedTime(null);
    setBookingError(null);

    const isoDate = format(newDate, "yyyy-MM-dd");
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

  const handleBackToDate = () => {
    setStep("date");
    setSelectedTime(null);
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
    if (!formData.email.trim()) {
      setBookingError("Please enter your email");
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
          email: formData.email,
          contactMethod: formData.contactMethod,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setBookingError(data.error || "Failed to book appointment");
        return;
      }

      onClose();
      setStep("date");
      setFormData({
        name: "",
        phone: "",
        email: "",
        contactMethod: "whatsapp",
        notes: "",
      });
    } catch (error) {
      console.error("Booking error:", error);
      setBookingError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDateAvailable = (testDate) => {
    const isoDate = format(testDate, "yyyy-MM-dd");
    return availableDates.includes(isoDate);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 flex-shrink-0">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
            {step === "date" && "Select Date"}
            {step === "time" && "Select Time"}
            {step === "form" && "Your Details"}
          </h2>
          {(step === "time" || step === "form") && (
            <p className="text-sm text-gray-500 mt-1">
              {format(date, "EEE, MMM d, yyyy")}
              {step === "form" && ` at ${selectedTime}`}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Scrollable Content Area */}
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

          {/* Date Selection Step */}
          {step === "date" && (
            <div className="flex justify-center">
              <Calendar
                mode="single"
                onSelect={handleDateSelect}
                selected={date}
                disabled={(testDate) => !isDateAvailable(testDate)}
              />
            </div>
          )}

          {/* Time Selection Step */}
          {step === "time" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Choose an available time slot
              </p>
              {loading ? (
                <p className="text-center text-gray-500">Loading times...</p>
              ) : availableTimes.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((slot) => (
                    <Button
                      key={slot.time}
                      onClick={() =>
                        slot.status === "available" &&
                        handleTimeSelect(slot.time)
                      }
                      variant={
                        slot.status === "booked"
                          ? "secondary"
                          : selectedTime === slot.time
                          ? "default"
                          : "outline"
                      }
                      disabled={slot.status === "booked"}
                      className={`w-full ${
                        slot.status === "booked"
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                      size="sm"
                    >
                      <span className="text-xs lg:text-sm">{slot.time}</span>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  No times available for this date
                </p>
              )}
            </div>
          )}

          {/* Booking Form Step */}
          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Ahmed Hassan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="e.g., +971 50 123 4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="e.g., ahmed@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  required
                />
              </div>

              {/* Contact Method */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  How to receive confirmation code? *
                </label>
                <div className="space-y-2">
                  {[
                    {
                      value: "whatsapp",
                      label: "WhatsApp",
                      icon: "💬",
                    },
                    {
                      value: "sms",
                      label: "SMS",
                      icon: "📱",
                    },
                    {
                      value: "email",
                      label: "Email",
                      icon: "✉️",
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                    >
                      <input
                        type="radio"
                        name="contactMethod"
                        value={option.value}
                        checked={formData.contactMethod === option.value}
                        onChange={handleFormChange}
                        className="w-4 h-4"
                      />
                      <span className="ml-3 text-sm">
                        <span className="mr-2">{option.icon}</span>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="e.g., specific style, allergies, preferences"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm resize-none"
                  rows="3"
                />
              </div>
            </form>
          )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer with Action Buttons */}
      <div className="border-t border-gray-200 p-4 lg:p-6 flex gap-3 flex-shrink-0">
        {step === "time" && (
          <Button onClick={handleBackToDate} variant="outline" className="flex-1">
            Back
          </Button>
        )}
        {step === "form" && (
          <Button onClick={handleBackToTime} variant="outline" className="flex-1">
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
            onClick={() => selectedTime && setStep("form")}
            disabled={!selectedTime}
            className="flex-1 bg-black hover:bg-gray-800 text-white"
          >
            Continue
          </Button>
        )}
        {step === "form" && (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name.trim()}
            className="flex-1 bg-black hover:bg-gray-800 text-white"
          >
            {isSubmitting ? "Booking..." : "Book Appointment"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Example;
