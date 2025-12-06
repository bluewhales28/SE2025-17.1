"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { LoginSchema, LoginSchemaType } from "@/lib/validate"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

export default function LoginPage() {
    const router = useRouter()
    const { login, isLoading } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [globalError, setGlobalError] = useState("")

    const form = useForm<LoginSchemaType>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (values: LoginSchemaType) => {
        setGlobalError("")
        try {
            await login({
                email: values.email,
                password: values.password
            })

            toast.success("Đăng nhập thành công!")
            router.push("/")

        } catch (err: any) {
            toast.error(err.message || "Đăng nhập thất bại")
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

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {globalError && (
                                <div className="p-3 text-base text-red-500 bg-red-50 rounded-md text-center">
                                    {globalError}
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base text-[#6B59CE]">Tài khoản</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Nhập tài khoản hoặc email đăng ký"
                                                className="h-14 text-lg bg-[#E0E7FF]/30 focus-visible:ring-[#6B59CE]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base text-[#6B59CE]">Mật khẩu</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Nhập mật khẩu"
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

                            <div className="flex justify-end">
                                <Link
                                    href="/auth/forgot-password"
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

                            <div className="text-center text-base">
                                Chưa có tài khoản?{" "}
                                <Link href="/auth/register" className="text-[#6B59CE] hover:underline font-medium">
                                    Đăng ký ngay
                                </Link>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}
