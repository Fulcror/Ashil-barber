import Hero from "@/app/components/hero";
import Services from "@/app/components/services";
import About from "@/app/components/about";
import Cta from "@/app/components/cta";
import Footer from "@/app/components/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Hero />
        <Services />
        <About />
        <Cta />
        <Footer />
      </main>
    </div>
  );
}
