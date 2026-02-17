import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export default function RescheduleSuccess({
  previousAppointment,
  newAppointment,
  timeZone,
}) {
  if (!newAppointment || !previousAppointment) return null;

  const previousStart = toZonedTime(
    new Date(previousAppointment.startDatetimeUtc),
    timeZone,
  );
  const newStart = toZonedTime(new Date(newAppointment.startDatetimeUtc), timeZone);

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <p className="text-sm text-green-900 mb-2">
          Your appointment has been rescheduled and confirmed.
        </p>
        <p className="text-xs text-green-700">
          New confirmation code:
        </p>
        <p className="text-xs text-green-700 font-mono bg-white px-3 py-2 rounded border border-green-200 mt-2">
          {newAppointment.confirmationCode}
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">New Date</span>
          <span className="text-sm font-medium text-gray-900">
            {format(newStart, "EEE, MMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">New Time</span>
          <span className="text-sm font-medium text-gray-900">
            {format(newStart, "hh:mm a")}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Previous Date</span>
          <span className="text-sm font-medium text-gray-900">
            {format(previousStart, "EEE, MMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Previous Time</span>
          <span className="text-sm font-medium text-gray-900">
            {format(previousStart, "hh:mm a")}
          </span>
        </div>
      </div>
    </div>
  );
}
