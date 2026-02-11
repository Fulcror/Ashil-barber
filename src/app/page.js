import Hero from "@/app/components/hero";
import Services from "@/app/components/services";
import About from "@/app/components/about";
import Cta from "@/app/components/cta";
import Footer from "@/app/components/footer";

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

      {/* Desktop View - Phone Mockup */}
      <div className="hidden lg:flex min-h-screen items-center justify-center bg-gray-900">
        <div
          id="phone-mockup"
          className="w-96 rounded-3xl overflow-hidden shadow-2xl bg-black border-8 border-black"
          style={{ aspectRatio: "9/20", containerType: "inline-size" }}
        >
          <main className="w-full h-full overflow-y-auto bg-white">
            <Hero />
            <Services />
            <About />
            <Cta />
            <Footer />
          </main>
        </div>
      </div>
    </>
  );
}
