"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
    const router = useRouter()
    const { login, isLoading, error } = useAuth()
    const [showPassword, setShowPassword] = useState(false)

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await login({
                email: formData.email,
                passwordHash: formData.password
            })

            alert("Đăng nhập thành công!")
            // router.push("/dashboard")

        } catch (err) {
            // Error is handled by the hook and displayed via the error state
        }
    }

    return (
        <div className="h-screen w-full grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
            {/* Left Side - Illustration */}
            <div className="hidden lg:block relative w-full h-full overflow-hidden">
                <Image
                    src="/images/Login_page.png"
                    alt="Login Illustration"
                    fill
                    className="object-cover"
                    priority
                    sizes="50vw"
                />
            </div>

            {/* Right Side - Login Form */}
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold text-[#6B59CE]">Đăng nhập</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 text-base text-red-500 bg-red-50 rounded-md text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-base text-[#6B59CE]">Tài khoản</Label>
                            <Input
                                id="email"
                                placeholder="Nhập tài khoản hoặc email đăng ký"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="h-14 text-lg bg-[#E0E7FF]/30 focus-visible:ring-[#6B59CE]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-base text-[#6B59CE]">Mật khẩu</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    placeholder="Nhập mật khẩu"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="h-14 text-lg bg-[#E0E7FF]/30 focus-visible:ring-[#6B59CE] pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#6B59CE]"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-6 w-6" />
                                    ) : (
                                        <Eye className="h-6 w-6" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link
                                href="/forgot-password"
                                className="text-base font-medium text-[#6B59CE] hover:underline"
                            >
                                Quên mật khẩu
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 text-lg bg-[#6B59CE] hover:bg-[#5a4cb4] text-white"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Đăng nhập"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
