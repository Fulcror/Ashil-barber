import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

export default function BookingDateSelector({
  date,
  onDateSelect,
  availableDates,
}) {
  const isDateAvailable = (testDate) => {
    try {
      // Validate date is a valid Date object
      if (!(testDate instanceof Date) || isNaN(testDate.getTime())) {
        return false;
      }
      const isoDate = format(testDate, "yyyy-MM-dd");
      return availableDates.includes(isoDate);
    } catch (error) {
      console.error("Error checking date availability:", error, testDate);
      return false;
    }
  };

  return (
    <div className="flex justify-center">
      <Calendar
        mode="single"
        onSelect={onDateSelect}
        selected={date}
        disabled={(testDate) => !isDateAvailable(testDate)}
      />
    </div>
  );
}
