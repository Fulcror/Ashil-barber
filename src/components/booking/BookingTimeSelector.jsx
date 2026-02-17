import { Button } from "@/components/ui/button";

export default function BookingTimeSelector({
  availableTimes,
  selectedTime,
  loading,
  onTimeSelect,
}) {
  return (
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
                slot.status === "available" && onTimeSelect(slot.time)
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
  );
}
