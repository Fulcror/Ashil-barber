export default function AppointmentLookup({
  lookupCode,
  onChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="confirmationCode"
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          Confirmation Code
        </label>
        <input
          type="text"
          id="confirmationCode"
          value={lookupCode}
          onChange={onChange}
          placeholder="Enter your 8-character code"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm uppercase"
          maxLength="10"
          required
        />
      </div>
      <p className="text-xs text-gray-500">
        Use the code from your confirmation screen to manage your appointment.
      </p>
    </form>
  );
}
