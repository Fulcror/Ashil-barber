"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <div className="w-full p-6 pt-3 mb-10">
      <header className="w-full flex justify-between items-center mb-8 border-b border-gray-300">
        <Image
          src="/ashil-logo.png"
          alt="Ashil's Barbershop Logo"
          width={90}
          height={90}
          className="rounded-full"
        />
        <button className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition">
          Book
        </button>
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
        <a
          href="#services"
          className="py-2 mb-4 w-full bg-white text-black border border-gray-300 rounded-md hover:bg-gray-100 transition text-center block"
        >
          View Services
        </a>
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
