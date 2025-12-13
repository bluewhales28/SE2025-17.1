"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Plus, Bell, Menu, Settings, LogOut, Moon, Sun, Home, User, Edit2, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function AccountPage() {
    const router = useRouter()
    const { user, logout } = useAuth()
    const [authorized, setAuthorized] = useState(false)
    const [checking, setChecking] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [darkMode, setDarkMode] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [profileData, setProfileData] = useState({
        name: "Admin User",
        username: user?.email?.split('@')[0] || "admin",
        email: user?.email || "admin@quiz.com",
        dateOfBirth: "01 January 1990",
        presentAddress: "Ho Chi Minh City, Vietnam",
        permanentAddress: "Ho Chi Minh City, Vietnam",
        city: "Ho Chi Minh",
        postalCode: "700000",
        country: "Vietnam",
    })

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!user || user.role !== 'ADMIN') {
                toast.error("Bạn không có quyền truy cập trang này!")
                router.push('/latest')
            } else {
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

    const handleSaveProfile = () => {
        toast.success("Thông tin đã được lưu!")
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
                                    <DropdownMenuItem onClick={() => router.push("/account")} className="cursor-pointer">
                                        <Settings className="mr-2 h-5 w-5" />
                                        <span>Tài khoản</span>
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

                    <div className="border-t border-gray-200 my-2 pt-2">
                        <p className="px-4 text-xs font-semibold text-gray-500 uppercase mb-2">Quản trị</p>
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg text-base">
                            <BarChart3 className="w-6 h-6" />
                            Dashboard
                        </Link>
                        <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-[#6B59CE] bg-purple-50 rounded-lg font-medium text-base">
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
                            <h1 className="text-3xl font-bold text-gray-900">Tài khoản</h1>
                            <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân</p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                                            <span className="text-2xl">🏆</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">My Rank</p>
                                            <p className="text-2xl font-bold">1</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                                            <span className="text-2xl">📊</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Score</p>
                                            <p className="text-2xl font-bold">999</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center">
                                            <span className="text-2xl">✅</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Quiz complete</p>
                                            <p className="text-2xl font-bold">50</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-cyan-200 rounded-full flex items-center justify-center">
                                            <span className="text-2xl">👏</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Clap</p>
                                            <p className="text-2xl font-bold">1000</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Profile Form */}
                        <Card>
                            <CardContent className="p-6">
                                <Tabs defaultValue="profile" className="w-full">
                                    <TabsList className="mb-6">
                                        <TabsTrigger value="profile">Edit Profile</TabsTrigger>
                                        <TabsTrigger value="preferences">Preferences</TabsTrigger>
                                        <TabsTrigger value="security">Security</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="profile" className="space-y-6">
                                        {/* Avatar Section */}
                                        <div className="flex items-start gap-6 pb-6 border-b">
                                            <div className="relative">
                                                <Avatar className="h-24 w-24">
                                                    <AvatarImage src="/images/avatar.jpg" alt="Profile" />
                                                    <AvatarFallback className="bg-[#6B59CE] text-white text-2xl">
                                                        {user?.email?.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <Button
                                                    size="icon"
                                                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-[#6B59CE] hover:bg-[#5a4cb4]"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg mb-1">{profileData.name}</h3>
                                                <p className="text-sm text-gray-600">{user?.email}</p>
                                            </div>
                                        </div>

                                        {/* Form Fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Your Name</Label>
                                                <Input
                                                    id="name"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                    className="bg-gray-50"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="username">User Name</Label>
                                                <Input
                                                    id="username"
                                                    value={profileData.username}
                                                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                                    className="bg-gray-50"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                    className="bg-gray-50"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password">Password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value="••••••••••"
                                                    readOnly
                                                    className="bg-gray-50"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="dob">Date of Birth</Label>
                                                <Input
                                                    id="dob"
                                                    value={profileData.dateOfBirth}
                                                    onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                                                    className="bg-gray-50"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="presentAddress">Present Address</Label>
                                                <Input
                                                    id="presentAddress"
                                                    value={profileData.presentAddress}
                                                    onChange={(e) => setProfileData({ ...profileData, presentAddress: e.target.value })}
                                                    className="bg-gray-50"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="permanentAddress">Permanent Address</Label>
                                                <Input
                                                    id="permanentAddress"
                                                    value={profileData.permanentAddress}
                                                    onChange={(e) => setProfileData({ ...profileData, permanentAddress: e.target.value })}
                                                    className="bg-gray-50"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="city">City</Label>
                                                <Input
                                                    id="city"
                                                    value={profileData.city}
                                                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                                    className="bg-gray-50"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="postalCode">Postal Code</Label>
                                                <Input
                                                    id="postalCode"
                                                    value={profileData.postalCode}
                                                    onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                                                    className="bg-gray-50"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="country">Country</Label>
                                                <Input
                                                    id="country"
                                                    value={profileData.country}
                                                    onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                                                    className="bg-gray-50"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-6">
                                            <Button
                                                onClick={handleSaveProfile}
                                                className="bg-[#6B59CE] hover:bg-[#5a4cb4] px-8"
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="preferences">
                                        <div className="py-8 text-center text-gray-500">
                                            Preferences settings coming soon...
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="security">
                                        <div className="py-8 text-center text-gray-500">
                                            Security settings coming soon...
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
