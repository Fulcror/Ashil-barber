import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export default function CancelConfirmation({ appointment, timeZone }) {
  if (!appointment) return null;

  const zonedStart = toZonedTime(
    new Date(appointment.startDatetimeUtc),
    timeZone,
  );

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-sm text-red-900">
          Your appointment has been canceled.
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Date</span>
          <span className="text-sm font-medium text-gray-900">
            {format(zonedStart, "EEE, MMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Time</span>
          <span className="text-sm font-medium text-gray-900">
            {format(zonedStart, "hh:mm a")}
          </span>
        </div>
      </div>
    </div>
  );
}
