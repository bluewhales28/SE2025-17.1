import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
    return (
        <div
            className={cn(
                "bg-white rounded-[2rem] shadow-lg hover:shadow-xl p-8 flex flex-col items-center text-center transition-all hover:-translate-y-2 duration-500 h-full min-h-[520px] justify-between border border-gray-100",
                className
            )}
        >
            <div className="w-full flex flex-col items-center">
                <div className={cn("w-full h-64 mb-8 rounded-3xl flex items-center justify-center relative overflow-hidden group", colorClass)}>
                    {/* Placeholder for illustration */}
                    {imageSrc ? (
                        <div className="relative w-full h-full">
                            <div className="absolute inset-0 flex items-center justify-center text-white/50 font-bold text-2xl">
                                Illustration
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="w-40 h-40 bg-white/20 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
                            <div className="w-24 h-24 bg-white/10 rounded-full blur-xl absolute top-1/4 left-1/4 animate-pulse" />
                        </>
                    )}
                </div>
                <h3 className="text-3xl font-bold text-[#1A1D28] mb-4 tracking-tight">{title}</h3>
                <p className="text-[#586380] mb-8 text-base leading-relaxed max-w-[280px]">
                    {description}
                </p>
            </div>
            <Button className="bg-[#0A092D] text-white hover:bg-[#0A092D]/90 rounded-full px-10 py-7 font-bold text-lg w-full max-w-[200px] transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-indigo-500/25">
                {buttonText}
            </Button>
        </div>
    );
}
