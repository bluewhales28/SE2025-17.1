"use client"

import { useState, useEffect, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { authService } from "@/services/auth.service"

const ResetPasswordSchema = z.object({
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
})

type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [isLoading, setIsLoading] = useState(false)
    const [globalError, setGlobalError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const form = useForm<ResetPasswordSchemaType>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    useEffect(() => {
        if (!token) {
            setGlobalError("Token không hợp lệ")
        }
    }, [token])

    const onSubmit = async (values: ResetPasswordSchemaType) => {
        if (!token) {
            setGlobalError("Token không hợp lệ")
            return
        }

        setGlobalError("")
        setIsLoading(true)
        try {
            await authService.resetPassword(token, values.password)
            toast.success("Đặt lại mật khẩu thành công!")
            router.push("/auth/login")
        } catch (err: any) {
            toast.error(err.message || "Đặt lại mật khẩu thất bại")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-screen w-full grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
            {/* Left Side - Illustration */}
            <div className="hidden lg:block relative w-full h-full overflow-hidden">
                <Image
                    src="/images/Login_page.png"
                    alt="Reset Password Illustration"
                    fill
                    className="object-cover"
                    priority
                    sizes="50vw"
                />
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold text-[#6B59CE]">Đặt lại mật khẩu</h1>
                        <p className="text-gray-600">
                            Nhập mật khẩu mới cho tài khoản của bạn
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {globalError && (
                                <div className="p-3 text-base text-red-500 bg-red-50 rounded-md text-center">
                                    {globalError}
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base text-[#6B59CE]">Mật khẩu mới</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Nhập mật khẩu mới"
                                                    className="h-14 text-lg bg-[#E0E7FF]/30 focus-visible:ring-[#6B59CE] pr-12"
                                                    {...field}
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
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base text-[#6B59CE]">Xác nhận mật khẩu</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Nhập lại mật khẩu mới"
                                                    className="h-14 text-lg bg-[#E0E7FF]/30 focus-visible:ring-[#6B59CE] pr-12"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#6B59CE]"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-6 w-6" />
                                                    ) : (
                                                        <Eye className="h-6 w-6" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isLoading || !token}
                                className="w-full h-14 text-lg bg-[#6B59CE] hover:bg-[#5a4cb4] text-white"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    "Đặt lại mật khẩu"
                                )}
                            </Button>

                            <div className="text-center text-base">
                                <Link href="/auth/login" className="text-[#6B59CE] hover:underline font-medium">
                                    Quay lại đăng nhập
                                </Link>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#6B59CE]" />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
