"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { CourseSection } from "@/components/landing/CourseSection";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra xem user đã đăng nhập chưa
    const token = Cookies.get("accessToken") || localStorage.getItem("accessToken");

    if (token) {
      // Đã đăng nhập -> redirect về latest
      router.push("/latest");
    }
  }, [router]);

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
