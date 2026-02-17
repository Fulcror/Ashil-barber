export default function BookingForm({ formData, onFormChange }) {
  return (
    <form className="space-y-4">
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onFormChange}
          placeholder="e.g., Ahmed Hassan"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
          required
        />
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          Phone Number *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={onFormChange}
          placeholder="e.g., +971 50 123 4567"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
          required
        />
      </div>

      {/* Contact Method */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          How to receive confirmation code? *
        </label>
        <div className="space-y-2">
          {[
            {
              value: "whatsapp",
              label: "WhatsApp",
              icon: "💬",
            },
            {
              value: "sms",
              label: "SMS",
              icon: "📱",
            },
            {
              value: "email",
              label: "Email",
              icon: "✉️",
            },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
            >
              <input
                type="radio"
                name="contactMethod"
                value={option.value}
                checked={formData.contactMethod === option.value}
                onChange={onFormChange}
                className="w-4 h-4"
              />
              <span className="ml-3 text-sm">
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          Additional Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={onFormChange}
          placeholder="e.g., specific style, allergies, preferences"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm resize-none"
          rows="3"
        />
      </div>
    </form>
  );
}
