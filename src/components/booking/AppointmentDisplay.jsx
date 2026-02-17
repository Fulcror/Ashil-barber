import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export default function AppointmentDisplay({ appointment, timeZone }) {
  if (!appointment) return null;

  const zonedStart = toZonedTime(
    new Date(appointment.startDatetimeUtc),
    timeZone,
  );
  const dateLabel = format(zonedStart, "EEE, MMM d, yyyy");
  const timeLabel = format(zonedStart, "hh:mm a");
  const statusLabel = appointment.status || "unknown";

  return (
    <div className="space-y-4">
      {statusLabel === "canceled" && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-sm text-red-700">
            This appointment has been canceled.
          </p>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Date</span>
          <span className="text-sm font-medium text-gray-900">{dateLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Time</span>
          <span className="text-sm font-medium text-gray-900">{timeLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Status</span>
          <span className="text-sm font-medium text-gray-900 capitalize">
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
