export default function BookingVerification({
  confirmationCode,
  verificationInput,
  onVerificationChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-sm text-blue-900 mb-4">
          Save your confirmation code below. You'll need it if you want to reschedule or cancel your appointment.
        </p>
        <p className="text-xs text-blue-700 font-mono bg-white px-3 py-2 rounded border border-blue-200">
          Code: {confirmationCode}
        </p>
      </div>

      <div>
        <label
          htmlFor="verificationCode"
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          Enter Confirmation Code *
        </label>
        <input
          type="text"
          id="verificationCode"
          value={verificationInput}
          onChange={onVerificationChange}
          placeholder="Enter the 8-character code"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm uppercase"
          maxLength="10"
          required
        />
      </div>
    </form>
  );
}
