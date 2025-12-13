"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Plus, Bell, Menu, Settings, LogOut, Moon, Sun, Home, BarChart3, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function DashboardPage() {
    const router = useRouter()
    const { user, isLoading, logout } = useAuth()
    const [authorized, setAuthorized] = useState(false)
    const [checking, setChecking] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [darkMode, setDarkMode] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)

    useEffect(() => {
        console.log('🔐 Dashboard check - isLoading:', isLoading, 'user:', user)

        const timer = setTimeout(() => {
            if (!user || user.role !== 'ADMIN') {
                console.log('❌ Access denied - redirecting to /latest')
                toast.error("Bạn không có quyền truy cập trang này!")
                router.push('/latest')
            } else {
                console.log('✅ Access granted - role is ADMIN')
                setAuthorized(true)
            }
            setChecking(false)
        }, 100)

        return () => clearTimeout(timer)
    }, [user, router])

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

    if (checking || !authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B59CE] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
                </div>
            </div>
        )
    }

    const weeklyActivity = [
        { day: 'Sat', deposit: 250, withdraw: 220 },
        { day: 'Sun', deposit: 450, withdraw: 320 },
        { day: 'Mon', deposit: 370, withdraw: 240 },
        { day: 'Tue', deposit: 430, withdraw: 350 },
        { day: 'Wed', deposit: 150, withdraw: 200 },
        { day: 'Thu', deposit: 360, withdraw: 250 },
        { day: 'Fri', deposit: 330, withdraw: 310 },
    ]

    const categories = [
        { name: 'Entertainment', value: 30, color: '#475569' },
        { name: 'Bill Expense', value: 15, color: '#f97316' },
        { name: 'Investment', value: 20, color: '#ec4899' },
        { name: 'Others', value: 35, color: '#6366f1' },
    ]

    const leaders = [
        { name: 'Livia Bator', avatar: '/images/avatar1.jpg', score: 1500 },
        { name: 'Randy Press', avatar: '/images/avatar2.jpg', score: 1450 },
        { name: 'Workman', avatar: '/images/avatar3.jpg', score: 1420 },
    ]

    const yearlyData = [
        { year: '2016', value: 20 },
        { year: '2017', value: 30 },
        { year: '2018', value: 25 },
        { year: '2019', value: 40 },
        { year: '2020', value: 32 },
        { year: '2021', value: 38 },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="hover:bg-gray-100"
                            >
                                <Menu className="h-6 w-6" />
                            </Button>
                            <Link href="/" className="flex items-center">
                                <div className="text-2xl font-bold text-[#6B59CE]">
                                    <span className="bg-[#6B59CE] text-white px-2 py-1 rounded">Q</span>
                                </div>
                            </Link>
                        </div>

                        <div className="flex-1 max-w-3xl mx-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Học phần, sách giáo khoa, câu hỏi, ..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-gray-50 border-gray-200 focus-visible:ring-[#6B59CE] text-base"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                                <Plus className="h-6 w-6" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Bell className="h-6 w-6" />
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="h-10 w-10 cursor-pointer">
                                        <AvatarImage src="/images/avatar.jpg" alt="User" />
                                        <AvatarFallback className="bg-[#6B59CE] text-white">
                                            {user?.email?.charAt(0).toUpperCase() || 'A'}
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>{user?.email || 'Admin'}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
                                        <Settings className="mr-2 h-5 w-5" />
                                        <span>Cài đặt</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={toggleDarkMode} className="cursor-pointer">
                                        {darkMode ? <Sun className="mr-2 h-5 w-5" /> : <Moon className="mr-2 h-5 w-5" />}
                                        <span>{darkMode ? "Chế độ sáng" : "Chế độ tối"}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                                        <LogOut className="mr-2 h-5 w-5" />
                                        <span>Đăng xuất</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r overflow-y-auto transition-transform duration-300 ease-in-out z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <nav className="px-4 py-4 space-y-2">
                    <Link href="/latest" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg text-base">
                        <Home className="w-6 h-6" />
                        Trang chủ
                    </Link>
                    <Link href="/library" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg text-base">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Thư viện của bạn
                    </Link>
                    <Link href="/notifications" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg text-base">
                        <Bell className="w-6 h-6" />
                        Thông báo
                    </Link>

                    <div className="border-t border-gray-200 mt-2 pt-2">
                        <p className="px-4 text-xs font-semibold text-gray-500 uppercase mb-2">Quản trị</p>
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-[#6B59CE] bg-purple-50 rounded-lg font-medium text-base">
                            <BarChart3 className="w-6 h-6" />
                            Dashboard
                        </Link>
                        <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg text-base">
                            <User className="w-6 h-6" />
                            Account
                        </Link>
                    </div>
                </nav>
            </aside>

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden top-16" onClick={() => setSidebarOpen(false)} />
            )}

            <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                <div className="p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
                            <p className="text-gray-600 mt-2">Dashboard quản trị hệ thống</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Hoạt động hàng tuần</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-end justify-around h-64">
                                        {weeklyActivity.map((item, index) => (
                                            <div key={index} className="flex flex-col items-center gap-2">
                                                <div className="flex gap-1 items-end">
                                                    <div className="w-6 bg-[#6366f1] rounded-t" style={{ height: `${item.deposit / 5}px` }}></div>
                                                    <div className="w-6 bg-[#22d3ee] rounded-t" style={{ height: `${item.withdraw / 5}px` }}></div>
                                                </div>
                                                <span className="text-sm text-gray-600">{item.day}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-center gap-6 mt-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-[#6366f1]"></div>
                                            <span className="text-sm">Deposit</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-[#22d3ee]"></div>
                                            <span className="text-sm">Withdraw</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Tỉ lệ chủ đề</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-center h-64">
                                        <svg width="240" height="240" viewBox="0 0 240 240">
                                            <circle cx="120" cy="120" r="100" fill="#475569" />
                                            <circle cx="120" cy="120" r="100" fill="#f97316" strokeDasharray="94 314" strokeDashoffset="-188" stroke="#f97316" strokeWidth="100" fill="none" />
                                            <circle cx="120" cy="120" r="100" fill="#ec4899" strokeDasharray="63 314" strokeDashoffset="-282" stroke="#ec4899" strokeWidth="100" fill="none" />
                                            <circle cx="120" cy="120" r="100" fill="#6366f1" strokeDasharray="110 314" strokeDashoffset="-345" stroke="#6366f1" strokeWidth="100" fill="none" />
                                        </svg>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        {categories.map((cat, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }}></div>
                                                <span className="text-sm">{cat.value}% {cat.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Leader board</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-around items-end py-8">
                                        {leaders.map((leader, idx) => (
                                            <div key={idx} className="flex flex-col items-center gap-3">
                                                <Avatar className="h-16 w-16">
                                                    <AvatarImage src={leader.avatar} alt={leader.name} />
                                                    <AvatarFallback>{leader.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-center">
                                                    <p className="font-semibold text-sm">{leader.name}</p>
                                                    <p className="text-xs text-gray-500">{leader.score}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Yearly Total Investment</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 flex items-end justify-around relative">
                                        <svg width="100%" height="200" className="absolute bottom-0">
                                            <polyline points={yearlyData.map((d, i) => `${i * 60 + 30},${200 - d.value * 3}`).join(' ')} fill="none" stroke="#f59e0b" strokeWidth="3" />
                                            {yearlyData.map((d, i) => (
                                                <circle key={i} cx={i * 60 + 30} cy={200 - d.value * 3} r="5" fill="#f59e0b" />
                                            ))}
                                        </svg>
                                    </div>
                                    <div className="flex justify-around mt-4">
                                        {yearlyData.map((d, i) => (
                                            <span key={i} className="text-xs text-gray-600">{d.year}</span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
