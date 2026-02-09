import Hero from "@/app/components/hero";
import Services from "@/app/components/services";
import About from "@/app/components/about";
import Cta from "@/app/components/cta";
import Footer from "@/app/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen p-4 bg-white">
      <main className="w-full">
        <Hero />
        <Services />
        <About />
        <Cta />
        <Footer />
      </main>
    </div>
  );
}
