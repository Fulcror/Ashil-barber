"use client";

export default function Footer() {
  return (
    <footer className="w-full py-6 px-4 text-center bg-gray-100 text-gray-600 text-sm container-text-base">
      &copy; {new Date().getFullYear()} Ashil's Barbershop. All rights reserved.
    </footer>
  );
}
