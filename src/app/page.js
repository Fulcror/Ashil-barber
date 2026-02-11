import Image from "next/image";
import Hero from "@/app/components/hero";
import Services from "@/app/components/services";
import About from "@/app/components/about";
import Cta from "@/app/components/cta";
import Footer from "@/app/components/footer";
import StatusBar from "@/app/components/status-bar";

export default function Home() {
  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden min-h-screen bg-white">
        <main className="w-full">
          <Hero />
          <Services />
          <About />
          <Cta />
          <Footer />
        </main>
      </div>

      {/* Desktop View - Phone Mockup with QR */}
      <div className="hidden lg:flex min-h-screen items-center justify-center gap-16 bg-gray-900 px-8">
        {/* Phone Mockup */}
        <div
          className="w-96 rounded-3xl bg-black p-3 shadow-2xl"
          style={{ aspectRatio: "9/20" }}
        >
          {/* Phone Screen Container */}
          <div
            className="w-full h-full bg-black rounded-3xl overflow-hidden relative"
            style={{ containerType: "inline-size" }}
          >
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-20 border-2 border-gray-700 shadow-lg"></div>

            {/* Status Bar */}
            <StatusBar />

            {/* Content */}
            <main
              className="w-full h-full overflow-y-auto bg-white phone-scrollbar"
              style={{ paddingTop: "1.5rem", paddingBottom: "2rem" }}
            >
              <Hero />
              <Services />
              <About />
              <Cta />
              <Footer />
            </main>

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1.5 bg-black rounded-full"></div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/qr-test.png"
            alt="QR Code"
            width={200}
            height={200}
            className="rounded-lg shadow-lg"
          />
          <p className="text-white text-xl font-semibold text-center">
            Book the appointment on your phone
          </p>
        </div>
      </div>
    </>
  );
}
