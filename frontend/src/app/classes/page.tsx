"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Plus, Bell, Menu, Home, Users, BookOpen, Copy, MoreVertical, Edit, Trash2, RefreshCw, LogOut, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store/useAuthStore"
import { useClassStore } from "@/store/useClassStore"
import { toast } from "sonner"
import { ClassResponse } from "@/types/class"
import { JoinClassDialog } from "@/components/JoinClassDialog"

export default function ClassesPage() {
    const router = useRouter()
    const { user, logout, initializeUser } = useAuthStore()
    const { classes, isLoading, error, fetchClasses, deleteClass, regenerateInvitationCode } = useClassStore()
    const [searchQuery, setSearchQuery] = useState("")
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [roleFilter, setRoleFilter] = useState<"TEACHER" | "STUDENT" | undefined>(undefined)
    const [joinDialogOpen, setJoinDialogOpen] = useState(false)

    useEffect(() => {
        initializeUser()
    }, [initializeUser])

    useEffect(() => {
        fetchClasses(roleFilter)
    }, [fetchClasses, roleFilter])

    useEffect(() => {
        if (error) {
            toast.error(error)
        }
    }, [error])

    const handleLogout = async () => {
        try {
            await logout()
            toast.success("Đăng xuất thành công!")
            router.push("/auth/login")
        } catch (err: any) {
            toast.error(err.message || "Đăng xuất thất bại")
        }
    }

    const handleDelete = async (id: number) => {
        if (confirm("Bạn có chắc chắn muốn xóa lớp học này? Tất cả dữ liệu liên quan sẽ bị xóa.")) {
            try {
                await deleteClass(id)
                toast.success("Xóa lớp học thành công!")
            } catch (err: any) {
                toast.error(err.message || "Xóa lớp học thất bại")
            }
        }
    }

    const handleRegenerateCode = async (id: number) => {
        try {
            await regenerateInvitationCode(id)
            toast.success("Tạo lại mã mời thành công!")
        } catch (err: any) {
            toast.error(err.message || "Tạo lại mã mời thất bại")
        }
    }

    const copyInvitationCode = (code: string) => {
        navigator.clipboard.writeText(code)
        toast.success("Đã sao chép mã mời!")
    }

    const filteredClasses = classes.filter(cls =>
        cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#6B59CE] rounded flex items-center justify-center">
                            <span className="text-white font-bold text-lg">Q</span>
                        </div>
                    </div>
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Học phần, sách giáo khoa, câu hỏi, ..."
                            className="pl-10 w-96"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setJoinDialogOpen(true)}>
                        <Plus className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-[#6B59CE] text-white">
                                        {user?.email?.charAt(0).toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{user?.email || "Account"}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push("/account")}>
                                <User className="mr-2 h-4 w-4" />
                                Tài khoản
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Đăng xuất
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                        <BookOpen className="w-6 h-6" />
                        Thư viện của bạn
                    </Link>
                    <Link href="/classes" className="flex items-center gap-3 px-4 py-3 text-[#6B59CE] bg-purple-50 rounded-lg font-medium text-base">
                        <Users className="w-6 h-6" />
                        Lớp học của bạn
                    </Link>
                    <Link href="/notifications" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg text-base">
                        <Bell className="w-6 h-6" />
                        Thông báo
                    </Link>
                </nav>
            </aside>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden top-16"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Lớp học của bạn</h1>
                            <p className="text-gray-600 mt-1">Quản lý và theo dõi các lớp học của bạn</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={roleFilter === undefined ? "default" : "outline"}
                                onClick={() => setRoleFilter(undefined)}
                            >
                                Tất cả
                            </Button>
                            <Button
                                variant={roleFilter === "TEACHER" ? "default" : "outline"}
                                onClick={() => setRoleFilter("TEACHER")}
                            >
                                Lớp dạy
                            </Button>
                            <Button
                                variant={roleFilter === "STUDENT" ? "default" : "outline"}
                                onClick={() => setRoleFilter("STUDENT")}
                            >
                                Lớp học
                            </Button>
                            <Button onClick={() => router.push("/classes/create")} className="bg-[#6B59CE] hover:bg-[#5a4ab8]">
                                <Plus className="mr-2 h-4 w-4" />
                                Tạo lớp học mới
                            </Button>
                        </div>
                    </div>

                    {/* Search bar for mobile */}
                    <div className="md:hidden mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm lớp học..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Classes Grid */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B59CE]"></div>
                        </div>
                    ) : filteredClasses.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Users className="h-16 w-16 text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có lớp học nào</h3>
                                <p className="text-gray-600 mb-4">Tạo lớp học đầu tiên của bạn để bắt đầu</p>
                                <Button onClick={() => router.push("/classes/create")} className="bg-[#6B59CE] hover:bg-[#5a4ab8]">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tạo lớp học mới
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredClasses.map((cls) => (
                                <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl mb-2">{cls.name}</CardTitle>
                                                {cls.subject && (
                                                    <Badge variant="secondary" className="mb-2">
                                                        {cls.subject}
                                                    </Badge>
                                                )}
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.push(`/classes/${cls.id}`)}>
                                                        <BookOpen className="mr-2 h-4 w-4" />
                                                        Xem chi tiết
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.push(`/classes/${cls.id}/edit`)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRegenerateCode(cls.id)}>
                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                        Tạo lại mã mời
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(cls.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Xóa lớp học
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        {cls.description && (
                                            <CardDescription className="mt-2 line-clamp-2">
                                                {cls.description}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Thành viên:</span>
                                                <span className="font-medium">{cls.memberCount}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Bài tập:</span>
                                                <span className="font-medium">{cls.assignmentCount}</span>
                                            </div>
                                            <div className="pt-3 border-t">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm text-gray-600">Mã mời:</span>
                                                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                                        {cls.invitationCode}
                                                    </code>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => copyInvitationCode(cls.invitationCode)}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <Button
                                                className="w-full bg-[#6B59CE] hover:bg-[#5a4ab8]"
                                                onClick={() => router.push(`/classes/${cls.id}`)}
                                            >
                                                Xem chi tiết
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <JoinClassDialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen} />
        </div>
    )
}

