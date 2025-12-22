"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, Users, Bell, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
    className?: string
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()

    const isActive = (path: string) => {
        if (path === "/latest" || path === "/") {
            return pathname === "/latest" || pathname === "/"
        }
        return pathname.startsWith(path)
    }

    const navItems = [
        {
            href: "/latest",
            icon: Home,
            label: "Trang chủ"
        },
        {
            href: "/library",
            icon: BookOpen,
            label: "Thư viện của bạn"
        },
        {
            href: "/classes",
            icon: Users,
            label: "Lớp học của bạn"
        },
        {
            href: "/analytics",
            icon: BarChart3,
            label: "Analytics & Reports"
        },
        {
            href: "/notifications",
            icon: Bell,
            label: "Thông báo"
        }
    ]

    return (
        <nav className={cn("px-4 py-4 space-y-2", className)}>
            {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-colors",
                            active
                                ? "text-[#6B59CE] bg-purple-50 font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        <Icon className="w-6 h-6" />
                        {item.label}
                    </Link>
                )
            })}
        </nav>
    )
}

