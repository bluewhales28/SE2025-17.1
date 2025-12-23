"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Menu, Home, BookOpen, Users, Bell, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useAuthStore } from "@/store/useAuthStore"
import { useClassStore } from "@/store/useClassStore"
import { memberService, ClassMemberResponse } from "@/services/member.service"
import { toast } from "sonner"

export default function ClassMembersPage() {
    const router = useRouter()
    const params = useParams()
    const classId = Number(params.id)
    const { user, initializeUser } = useAuthStore()
    const { currentClass, fetchClassById } = useClassStore()
    const [members, setMembers] = useState<ClassMemberResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const isTeacher = currentClass?.userRole === "TEACHER"

    useEffect(() => {
        initializeUser()
    }, [initializeUser])

    useEffect(() => {
        if (classId) {
            fetchClassById(classId)
            if (currentClass?.userRole === "TEACHER") {
                loadMembers()
            }
        }
    }, [classId, fetchClassById, currentClass])

    useEffect(() => {
        if (currentClass && currentClass.userRole !== "TEACHER") {
            toast.error("Chỉ giáo viên mới có quyền xem trang này")
            router.push(`/classes/${classId}`)
        }
    }, [currentClass, classId, router])

    const loadMembers = async () => {
        setIsLoading(true)
        try {
            const response = await memberService.getClassMembers(classId)
            setMembers(response.data || [])
        } catch (err: any) {
            toast.error(err.message || "Không thể tải danh sách thành viên")
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemoveMember = async (memberId: number) => {
        if (confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi lớp?")) {
            try {
                await memberService.removeMember(classId, memberId)
                toast.success("Xóa thành viên thành công!")
                loadMembers()
            } catch (err: any) {
                toast.error(err.message || "Xóa thành viên thất bại")
            }
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
                <div className="p-6 max-w-6xl mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => router.push(`/classes/${classId}`)}
                        className="mb-6"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Quản lý thành viên</CardTitle>
                            {currentClass && (
                                <p className="text-gray-600 mt-1">Lớp: {currentClass.name}</p>
                            )}
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B59CE]"></div>
                                </div>
                            ) : members.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">Chưa có thành viên nào</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Vai trò</TableHead>
                                            <TableHead>Ngày tham gia</TableHead>
                                            <TableHead className="text-right">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {members.map((member) => (
                                            <TableRow key={member.id}>
                                                <TableCell className="font-medium">
                                                    {member.email || `User ${member.userId}`}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={member.role === "TEACHER" ? "default" : "secondary"}>
                                                        {member.role === "TEACHER" ? "Giáo viên" : "Học sinh"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(member.joinedAt).toLocaleDateString('vi-VN')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {isTeacher && member.role !== "TEACHER" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveMember(member.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}

