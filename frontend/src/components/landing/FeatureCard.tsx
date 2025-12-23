"use client"

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface FeatureCardProps {
    title: string;
    description: string;
    buttonText: string;
    imageSrc?: string; // In a real app, this would be an image path
    colorClass?: string; // For the blob background if we use CSS
    className?: string;
}

export function FeatureCard({
    title,
    description,
    buttonText,
    imageSrc,
    colorClass,
    className,
}: FeatureCardProps) {
    const router = useRouter();

    const handleClick = () => {
        // Kiểm tra xem user đã đăng nhập chưa
        const token = Cookies.get("accessToken") || localStorage.getItem("accessToken");

        if (token) {
            // Đã đăng nhập -> chuyển về latest
            router.push("/latest");
        } else {
            // Chưa đăng nhập -> chuyển về trang đăng nhập
            router.push("/auth/login");
        }
    };

    return (
        <div
            className={cn(
                "bg-white rounded-[2rem] shadow-lg hover:shadow-xl p-6 flex flex-col items-center text-center transition-all hover:-translate-y-2 duration-500 h-full min-h-[500px] justify-between border border-gray-100 max-w-[280px] mx-auto",
                className
            )}
        >
            <div className="w-full flex flex-col items-center">
                <div className="w-full h-64 mb-2 flex items-center justify-center relative overflow-visible group">
                    {/* Placeholder for illustration */}
                    {imageSrc ? (
                        <div className="relative w-full h-full flex items-center justify-center -translate-y-[20%]">
                            <Image
                                src={imageSrc}
                                alt={title}
                                width={650}
                                height={650}
                                className="object-contain w-auto h-auto max-w-[300%] max-h-[300%] group-hover:scale-110 transition-transform duration-500"
                                priority
                            />
                        </div>
                    ) : (
                        <div className={cn("w-full h-full rounded-3xl flex items-center justify-center relative overflow-hidden", colorClass)}>
                            <div className="w-40 h-40 bg-white/20 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
                            <div className="w-24 h-24 bg-white/10 rounded-full blur-xl absolute top-1/4 left-1/4 animate-pulse" />
                        </div>
                    )}
                </div>
                <h3 className="text-3xl font-bold text-[#1A1D28] mb-4 tracking-tight">{title}</h3>
                <p className="text-[#586380] mb-6 text-base leading-relaxed">
                    {description}
                </p>
            </div>
            <Button
                onClick={handleClick}
                className="bg-[#0A092D] text-white hover:bg-[#0A092D]/90 rounded-full px-8 py-6 font-bold text-lg w-full transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-indigo-500/25"
            >
                {buttonText}
            </Button>
        </div>
    );
}
