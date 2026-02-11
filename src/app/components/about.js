"use client";
import Image from "next/image";

export default function About() {
  return (
    <>
      <div className="w-full p-6 mt-8">
        <Image
          className="rounded-lg"
          src="/about-us.jpg"
          alt="Barbershop"
          width={600}
          height={400}
        />
        <h2 className="text-3xl font-bold mb-4 mt-8 text-black">About Us</h2>
        <p className="text-md mb-10 text-black">
          At Ashil's Barbershop, we blend classic barbering with modern style.
          Our expert barbers provide personalized grooming services in a
          welcoming atmosphere. We are committed to delivering exceptional
          haircuts, beard trims, and styling that enhance your confidence and
          style. Experience the art of grooming with us.
        </p>
      </div>
    </>
  );
}
