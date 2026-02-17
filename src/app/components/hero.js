"use client";

import Image from "next/image";
import { useRef } from "react";

export default function Hero({ onBookingClick }) {
  const servicesRef = useRef(null);

  const handleViewServices = (e) => {
    e.preventDefault();
    servicesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
        <button
          onClick={onBookingClick}
          className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition cursor-pointer"
        >
          Book
        </button>
      </header>
      <h1 className="text-4xl container-heading-5xl font-bold mb-6 text-black">
        Precision <br /> Craftsmanship <br />{" "}
        <span className="text-gray-400">Every Cut</span>
      </h1>
      <p className="text-sm container-text-lg mb-6 text-black">
        Experience the art of traditional barbering with a modern twist. Book
        your spot at Ashil's Barbershop.
      </p>
      <form className="flex space-x-4">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onBookingClick();
          }}
          className="py-2 mb-4 w-full bg-black text-white rounded-md hover:bg-gray-800 transition cursor-pointer"
        >
          Book Appointment
        </button>
      </form>
      <form className="flex space-x-4">
        <a
          href="#services"
          onClick={handleViewServices}
          className="py-2 mb-4 w-full bg-white text-black border border-gray-300 rounded-md hover:bg-gray-100 transition text-center block cursor-pointer"
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
      <div ref={servicesRef} id="services-anchor" />
    </div>
  );
}
