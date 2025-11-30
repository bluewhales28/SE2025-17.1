import { cn } from "@/lib/utils";

interface CourseItemProps {
    title: string;
    chapter: string;
    description: string;
    colorClass: string; // For the book cover placeholder
}

export function CourseItem({ title, chapter, description, colorClass }: CourseItemProps) {
    return (
        <div className="flex flex-col md:flex-row items-start gap-6 bg-white p-4 rounded-xl">
            <div className={cn("w-24 h-32 md:w-32 md:h-40 rounded-lg shadow-md flex-shrink-0", colorClass)} />
            <div className="flex flex-col">
                <h3 className="font-bold text-lg text-[#1A1D28] uppercase tracking-wide mb-1">{title}</h3>
                <span className="text-xs font-semibold text-gray-500 mb-2">{chapter}</span>
                <p className="text-sm text-[#586380] leading-relaxed line-clamp-3">
                    {description}
                </p>
            </div>
        </div>
    );
}
