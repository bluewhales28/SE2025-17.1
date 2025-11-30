import Link from "next/link";
import { BrandButton } from "@/components/common/BrandButton";
import { Button } from "@/components/ui/button";
import { Command } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-[#4255FF] text-white p-1.5 rounded-lg">
                        <Command size={20} />
                    </div>
                    <span className="font-bold text-xl text-[#1A1D28]">QuizApp</span>
                </Link>

                {/* Navigation - Desktop */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="#" className="text-sm font-medium text-gray-600 hover:text-[#4255FF] transition-colors">
                        Chủ đề
                    </Link>
                    <Link href="#" className="text-sm font-medium text-gray-600 hover:text-[#4255FF] transition-colors">
                        Tính năng
                    </Link>
                    <Link href="#" className="text-sm font-medium text-gray-600 hover:text-[#4255FF] transition-colors">
                        Giải pháp
                    </Link>
                </nav>

                {/* Auth Buttons */}
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" className="text-gray-600 hover:text-[#4255FF] font-semibold">
                        <Link href="/auth/login">Đăng nhập</Link>
                    </Button>
                    <BrandButton asChild size="default" className="px-6">
                        <Link href="/auth/register">Đăng ký</Link>
                    </BrandButton>
                </div>
            </div>
        </header>
    );
}
