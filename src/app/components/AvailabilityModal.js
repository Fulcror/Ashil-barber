"use client";

import CalendarPicker from "@/components/calendar-standard-3";

export default function AvailabilityModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end lg:items-center justify-center overflow-hidden">
      {/* Mobile: full height modal from bottom, Desktop: centered modal */}
      <div className="w-full h-[90vh] lg:h-auto lg:max-h-[85vh] lg:max-w-md bg-white rounded-t-2xl lg:rounded-2xl shadow-2xl flex flex-col">
        <CalendarPicker onClose={onClose} />
      </div>
    </div>
  );
}
