"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import Cookies from "js-cookie"

interface SubjectCardProps {
    title: string
    emoji?: string
    image?: string
    color?: string
    description?: string
}

export function SubjectCard({ title, emoji, image, color = "bg-gray-100", description }: SubjectCardProps) {
    const router = useRouter()

    const handleClick = () => {
        // Kiểm tra xem user đã đăng nhập chưa
        const token = Cookies.get("accessToken") || localStorage.getItem("accessToken")

        if (token) {
            // Đã đăng nhập -> chuyển về dashboard
            router.push("/dashboard")
        } else {
            // Chưa đăng nhập -> chuyển về trang đăng ký
            router.push("/auth/register")
        }
    }

    return (
        <Card
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            onClick={handleClick}
        >
            <CardContent className="p-0">
                <div className={`${color} h-32 flex items-center justify-center`}>
                    {emoji && <span className="text-5xl">{emoji}</span>}
                    {image && <img src={image} alt={title} className="w-full h-full object-cover" />}
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
                    {description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{description}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
