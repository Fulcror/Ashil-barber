"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <div className="w-full p-6 mb-10">
      <header className="w-full flex justify-end mb-8 border-b border-gray-300 pb-4">
        <nav className="space-x-4">
          <a href="#services" className="text-gray-600 hover:text-gray-900">
            Services
          </a>
          <a href="#about" className="text-gray-600 hover:text-gray-900">
            About
          </a>
          <a href="#contact" className="text-gray-600 hover:text-gray-900">
            Contact
          </a>
        </nav>
      </header>
      <h1 className="text-5xl font-bold mb-6 text-black">
        Precision <br /> Craftsmanship <br />{" "}
        <span className="text-gray-400">Every Cut</span>
      </h1>
      <p className="text-md mb-6 text-black">
        Experience the art of traditional barbering with a modern twist. Book
        your spot at Ashil's Barbershop.
      </p>
      <form className="flex space-x-4">
        <button
          type="submit"
          className="py-2 mb-4 w-full bg-black text-white rounded-md hover:bg-gray transition"
        >
          Book Appointment
        </button>
      </form>
      <form className="flex space-x-4">
        <button
          type="submit"
          className="py-2 mb-4 w-full bg-white text-black border border-gray-300 rounded-md hover:bg-gray-100 transition"
        >
          View Services
        </button>
      </form>
      <Image
        src="/hero-picture.jpg"
        alt="Barbershop"
        className="w-full h-auto rounded-lg shadow-lg mt-8"
        width={800}
        height={600}
      />
    </div>
  );
}
