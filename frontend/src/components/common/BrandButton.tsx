import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BrandButtonProps extends React.ComponentPropsWithRef<typeof Button> {
    fullRounded?: boolean;
}

export const BrandButton = React.forwardRef<HTMLButtonElement, BrandButtonProps>(
    ({ className, variant = "default", size = "lg", fullRounded = true, children, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                variant={variant}
                size={size}
                className={cn(
                    "font-semibold transition-all duration-300",
                    variant === "default" && "bg-[#4255FF] hover:bg-[#4255FF]/90 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5",
                    fullRounded ? "rounded-full" : "rounded-md",
                    className
                )}
                {...props}
            >
                {children}
            </Button>
        );
    }
);

BrandButton.displayName = "BrandButton";
