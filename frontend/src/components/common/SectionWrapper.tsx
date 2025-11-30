import React from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
    children: React.ReactNode;
    className?: string;
    background?: "white" | "gray" | "blue";
    id?: string;
}

export const SectionWrapper = ({ children, className, background = "white", id }: SectionWrapperProps) => {
    const bgColors = {
        white: "bg-white",
        gray: "bg-gray-50",
        blue: "bg-[#E6F0FF]",
    };

    return (
        <section id={id} className={cn("w-full py-16 md:py-24", bgColors[background], className)}>
            <div className="container mx-auto px-4 md:px-6">
                {children}
            </div>
        </section>
    );
};
