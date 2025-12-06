"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Plus, Bell, Menu, Settings, LogOut, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { SubjectCard } from "@/components/common/SubjectCard"
import { FeatureSection } from "@/components/landing/FeatureSection"

export default function HomePage() {
    const router = useRouter()
    const { logout, isLoading } = useAuth()
    const [searchQuery, setSearchQuery] = useState("")
    const [darkMode, setDarkMode] = useState(false)

    const handleLogout = async () => {
        try {
            await logout()
            toast.success("Đăng xuất thành công!")
        } catch (err: any) {
            toast.error(err.message || "Đăng xuất thất bại")
        }
    }

    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
        toast.success(darkMode ? "Chế độ sáng" : "Chế độ tối")
    }

    const subjects = [
        {
            title: "Thể thao",
            emoji: "⚽",
            color: "bg-green-100",
            description: "Học về các môn thể thao, kỹ thuật và chiến thuật"
        },
        {
            title: "Vũ trụ",
            emoji: "🚀",
            color: "bg-blue-100",
            description: "Khám phá không gian, hành tinh và vũ trụ bao la"
        },
        {
            title: "Ẩm thực",
            emoji: "🍽️",
            color: "bg-red-100",
            description: "Nghệ thuật nấu ăn và văn hóa ẩm thực thế giới"
        },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left Section - Menu & Logo */}
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="lg:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                            <Link href="/" className="flex items-center">
                                <div className="text-2xl font-bold text-[#6B59CE]">
                                    <span className="bg-[#6B59CE] text-white px-2 py-1 rounded">Q</span>
                                </div>
                            </Link>
                        </div>

                        {/* Center Section - Search */}
                        <div className="flex-1 max-w-2xl mx-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Học phần, sách giáo khoa, câu hỏi, ..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-gray-50 border-gray-200 focus-visible:ring-[#6B59CE]"
                                />
                            </div>
                        </div>

                        {/* Right Section - Actions & Profile */}
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                                <Plus className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Bell className="h-5 w-5" />
                            </Button>

                            {/* User Avatar Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="h-10 w-10 cursor-pointer">
                                        <AvatarImage src="/images/avatar.jpg" alt="User" />
                                        <AvatarFallback className="bg-[#6B59CE] text-white">U</AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Cài đặt</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={toggleDarkMode} className="cursor-pointer">
                                        {darkMode ? (
                                            <Sun className="mr-2 h-4 w-4" />
                                        ) : (
                                            <Moon className="mr-2 h-4 w-4" />
                                        )}
                                        <span>{darkMode ? "Chế độ sáng" : "Chế độ tối"}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Đăng xuất</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r overflow-y-auto">
                <nav className="p-4 space-y-2">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 text-[#6B59CE] bg-purple-50 rounded-lg font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Trang chủ
                    </Link>
                    <Link
                        href="/library"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Thư viện của bạn
                    </Link>
                    <Link
                        href="/notifications"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                        <Bell className="w-5 h-5" />
                        Thông báo
                    </Link>

                    <div className="pt-6">
                        <h3 className="px-4 text-sm font-semibold text-gray-500 mb-2">Thư mục của bạn</h3>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-50"
                        >
                            <Plus className="w-5 h-5" />
                            Thư mục mới
                        </Button>
                    </div>

                    <div className="pt-6">
                        <h3 className="px-4 text-sm font-semibold text-gray-500 mb-2">Bắt đầu tại đây</h3>
                        <Link
                            href="/flashcards"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Thẻ ghi nhớ
                        </Link>
                        <Link
                            href="/expert-solutions"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Lời giải chuyên gia
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Search Section */}
                    <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-none">
                        <CardHeader>
                            <CardTitle className="text-2xl">Tìm kiếm học phần chuẩn hóa</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link href="/search">
                                <Button className="bg-[#6B59CE] hover:bg-[#5a4cb4] text-white">
                                    Thêm học phần chuẩn hóa
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Study Plan Section */}
                    <Card className="mb-8 border-purple-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="text-blue-400">
                                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Tự tạo học phần cho riêng mình</h3>
                                        <p className="text-gray-600 mb-4">Học và khám phá những gì mình thích</p>
                                        <Button className="bg-[#6B59CE] hover:bg-[#5a4cb4] text-white">
                                            Tạo thẻ học
                                        </Button>
                                    </div>
                                </div>
                                <div className="hidden md:block">
                                    <div className="relative w-48 h-48">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg transform rotate-6"></div>
                                        <div className="absolute inset-0 bg-white rounded-lg shadow-lg p-4 flex items-center justify-center">
                                            <div className="text-6xl">📝</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Study Topics Section */}
                    <FeatureSection />
                </div>
            </main>
        </div>
    )
}
