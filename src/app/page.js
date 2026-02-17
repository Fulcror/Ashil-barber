"use client";

import { useState } from "react";
import Image from "next/image";
import Hero from "@/app/components/hero";
import Services from "@/app/components/services";
import About from "@/app/components/about";
import Cta from "@/app/components/cta";
import Footer from "@/app/components/footer";
import StatusBar from "@/app/components/status-bar";
import AvailabilityModal from "@/app/components/AvailabilityModal";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);

  return (
    <>
      <AvailabilityModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
      <AvailabilityModal
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        mode="manage"
      />

      {/* Mobile View */}
      <div className="lg:hidden min-h-screen bg-white">
        <main className="w-full">
          <Hero
            onBookingClick={() => setIsBookingOpen(true)}
            onManageClick={() => setIsManageOpen(true)}
          />
          <Services />
          <About />
          <Cta onBookingClick={() => setIsBookingOpen(true)} />
          <Footer />
        </main>
      </div>

      {/* Desktop View - header + Phone Mockup (QR below header) */}
      <div className="hidden lg:flex min-h-screen items-center justify-center bg-gray-900 px-8">
        <div className="w-full max-w-6xl flex items-center justify-around gap-8">
          {/* Left: Header + Subheader + QR */}
          <div className="flex-1 max-w-lg text-left text-white">
            <h1 className="text-4xl leading-tight font-extrabold mb-4">
              Ashil Mobile Hairdresser
            </h1>
            <p className="text-lg text-gray-200">
              Salon-quality haircuts and styling that come to your home. Scan
              the QR to view services and book instantly.
            </p>

            <div className="mt-6 flex flex-col items-center">
              <Image
                src="/qr-test.png"
                alt="QR Code"
                width={180}
                height={180}
                className="rounded-lg shadow-lg"
              />
              <p className="text-gray-300 text-sm mt-3 text-center">
                Scan to open the booking page
              </p>
            </div>
          </div>

          {/* Center: Phone Mockup */}
          <div
            className="flex-none w-96 rounded-3xl p-3 phone-deep"
            style={{ aspectRatio: "9/20" }}
          >
            <div
              className="w-full h-full bg-black rounded-3xl overflow-hidden relative phone-screen"
              style={{ containerType: "inline-size" }}
            >
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-20 border-2 border-gray-700 shadow-lg"></div>

              <StatusBar />

              <main
                className="w-full h-full overflow-y-auto bg-white phone-scrollbar"
                style={{ paddingTop: "1.5rem", paddingBottom: "2rem" }}
              >
                <Hero
                  onBookingClick={() => setIsBookingOpen(true)}
                  onManageClick={() => setIsManageOpen(true)}
                />
                <Services />
                <About />
                <Cta onBookingClick={() => setIsBookingOpen(true)} />
                <Footer />
              </main>

              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1.5 bg-black rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
