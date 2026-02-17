import { Button } from "@/components/ui/button";

export default function BookingTimeSelector({
  availableTimes,
  selectedTime,
  loading,
  onTimeSelect,
}) {
  const handleSelectTime = (slot) => {
    // Defensive check: only allow selecting if status is explicitly "available"
    if (slot.status === "available") {
      onTimeSelect(slot.time);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 text-center">
        Choose an available time slot
      </p>
      {loading ? (
        <p className="text-center text-gray-500">Loading times...</p>
      ) : availableTimes.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {availableTimes.map((slot) => {
            const isBooked = slot.status === "booked";
            const isSelected = selectedTime === slot.time;

            return (
              <Button
                key={slot.time}
                onClick={() => handleSelectTime(slot)}
                variant={
                  isBooked ? "secondary" : isSelected ? "default" : "outline"
                }
                disabled={isBooked}
                className={`w-full ${isBooked ? "cursor-not-allowed opacity-50" : ""}`}
                size="sm"
              >
                <span className="text-xs lg:text-sm">{slot.time}</span>
              </Button>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No times available for this date
        </p>
      )}
    </div>
  );
}
