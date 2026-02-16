"use client";

import { useState, useEffect } from "react";

export default function AvailabilityModal({ isOpen, onClose }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [hours, setHours] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/fetchAval")
        .then((res) => res.json())
        .then((data) => {
          setAvailableDates(data.availableDates);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate) {
      fetch("/api/fetchAval")
        .then((res) => res.json())
        .then((data) => {
          setHours(data.availability[selectedDate] || []);
        });
    } else {
      setHours([]);
    }
  }, [selectedDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Book Appointment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <label className="mb-2">Select a date:</label>
          <select
            className="mb-4 p-2 border rounded"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            <option value="">-- Select --</option>
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
          {selectedDate && (
            <div>
              <p className="text-sm text-gray-700 mb-2">Available hours:</p>
              {hours.length === 0 ? (
                <p className="text-gray-400">No slots available</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {hours.map((h) => (
                    <button
                      key={h}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
