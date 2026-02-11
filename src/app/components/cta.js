"use client";

export default function Cta() {
  return (
    <div className="w-full py-12 px-6 space-y-6 bg-gray-50">
      {/* Primary CTA - Booking */}
      <div className="bg-black w-full p-8 mt-8 text-center rounded-lg shadow-lg">
        <h2 className="text-2xl container-heading-4xl font-bold mb-3 text-white">
          Need a Haircut?
        </h2>
        <p className="text-sm container-text-lg mb-8 text-gray-300">
          Schedule your appointment today and experience premium grooming.
        </p>
        <a
          href="#book"
          className="py-3 px-8 bg-white text-black rounded-md hover:bg-gray-100 transition inline-block font-semibold text-base container-text-lg shadow-md hover:shadow-lg"
        >
          Book Now
        </a>
      </div>

      {/* Secondary CTA - WhatsApp */}
      <div className="bg-gray-100 w-full p-6 text-center rounded-lg border-2 border-gray-200">
        <h3 className="text-lg container-text-2xl font-semibold mb-2 text-black">
          Quick Chat
        </h3>
        <p className="text-sm container-text-lg mb-6 text-gray-600">
          Prefer WhatsApp? Reach out to us directly
        </p>
        <a
          href="https://wa.me/23055351954"
          target="_blank"
          rel="noopener noreferrer"
          className="py-2 px-6 bg-green-500 text-white rounded-md hover:bg-green-600 transition inline-block font-semibold"
        >
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
