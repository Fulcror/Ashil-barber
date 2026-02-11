"use client";

export default function Services() {
  return (
    <>
      <div id="services" className="bg-gray-50 w-full p-6 pb-12 text-center">
        <h2 className="text-2xl container-text-3xl font-bold mb-4 mt-8 text-black">
          Our Services
        </h2>
        <p className="text-sm container-text-lg mb-10 text-black">
          Premium grooming services tailored to you.
        </p>
        <div className="services-grid text-left">
          <div className="bg-white p-4 rounded-lg border border-gray-300">
            <div className="flex items-center mb-4">
              <h3 className="text-xl font-semibold text-black">Haircuts</h3>
              <h3 className="text-2xl text-gray-500 ml-auto">$30</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">30 min</p>
            <p className="text-gray-600 text-sm">
              Professional haircuts for all hair types.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-300">
            <div className="flex items-center mb-4">
              <h3 className="text-xl font-semibold text-black">Beard Trims</h3>
              <h3 className="text-2xl text-gray-500 ml-auto">$20</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">30 min</p>
            <p className="text-gray-600 text-sm">
              Precision beard shaping and trimming.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-300">
            <div className="flex items-center mb-4">
              <h3 className="text-xl font-semibold text-black">Coloring</h3>
              <h3 className="text-2xl text-gray-500 ml-auto">$50</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">30 min</p>
            <p className="text-gray-600 text-sm">
              Expert hair coloring services.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
