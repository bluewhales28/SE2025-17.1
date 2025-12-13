import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { CourseSection } from "@/components/landing/CourseSection";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <FeatureSection />
        <CourseSection />
      </main>
      <Footer />
    </div>
  );
}
