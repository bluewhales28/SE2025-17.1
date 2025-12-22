"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { CourseSection } from "@/components/landing/CourseSection";
import { Footer } from "@/components/landing/Footer";
import { useAuthStore } from "@/store/useAuthStore";

export default function Home() {
  const router = useRouter();
  const { user, initializeUser } = useAuthStore();

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  useEffect(() => {
    // Kiểm tra xem user đã đăng nhập chưa
    const token = Cookies.get("accessToken") || localStorage.getItem("accessToken");

    if (token && user) {
      // Đã đăng nhập -> kiểm tra role để redirect đúng trang
      if (user.role === 'ADMIN') {
        router.push("/dashboard");
      } else {
        router.push("/latest");
      }
    }
  }, [router, user]);

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
