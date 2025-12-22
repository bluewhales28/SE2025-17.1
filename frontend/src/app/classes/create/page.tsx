"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Menu, Home, BookOpen, Users, Bell } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuthStore } from "@/store/useAuthStore"
import { useClassStore } from "@/store/useClassStore"
import { toast } from "sonner"

export default function CreateClassPage() {
    const router = useRouter()
    const { user, initializeUser } = useAuthStore()
    const { createClass, isLoading, error } = useClassStore()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        subject: "",
    })

    useEffect(() => {
        initializeUser()
    }, [initializeUser])

    useEffect(() => {
        if (error) {
            toast.error(error)
        }
    }, [error])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.name.trim()) {
            toast.error("Vui lòng nhập tên lớp học")
            return
        }

        try {
            const newClass = await createClass(formData)
            toast.success("Tạo lớp học thành công!")
            router.push(`/classes/${newClass.id}`)
        } catch (err: any) {
            toast.error(err.message || "Tạo lớp học thất bại")
        }
    }

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
                <div className="p-6 max-w-3xl mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-6"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Tạo lớp học mới</CardTitle>
                            <CardDescription>
                                Tạo lớp học mới để quản lý học sinh và bài tập
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Tên lớp học *</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ví dụ: Lớp Toán 10A1"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject">Môn học</Label>
                                    <Input
                                        id="subject"
                                        placeholder="Ví dụ: Toán học, Vật lý, ..."
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Mô tả</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Mô tả về lớp học..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className="flex-1"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-[#6B59CE] hover:bg-[#5a4ab8]"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Đang tạo..." : "Tạo lớp học"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}

