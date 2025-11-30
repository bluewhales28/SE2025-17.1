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
                "bg-white rounded-3xl shadow-sm p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300",
                className
            )}
        >
            <div className={cn("w-full h-48 mb-6 rounded-2xl flex items-center justify-center relative overflow-hidden", colorClass)}>
                {/* Placeholder for illustration */}
                {imageSrc ? (
                    <div className="relative w-full h-full">
                        {/* Use a placeholder div if no real image is available yet */}
                        <div className="absolute inset-0 flex items-center justify-center text-white/50 font-bold text-2xl">
                            Illustration
                        </div>
                    </div>
                ) : (
                    <div className="w-32 h-32 bg-white/20 rounded-full blur-2xl absolute" />
                )}
            </div>
            <h3 className="text-2xl font-bold text-[#1A1D28] mb-3">{title}</h3>
            <p className="text-[#586380] mb-8 text-sm leading-relaxed max-w-[200px]">
                {description}
            </p>
            <Button className="bg-[#0A092D] text-white hover:bg-[#0A092D]/90 rounded-full px-8 py-6 font-bold text-base">
                {buttonText}
            </Button>
        </div>
    );
}
