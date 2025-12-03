"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2, ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

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

const ForgotPasswordSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
})

type ForgotPasswordSchemaType = z.infer<typeof ForgotPasswordSchema>

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [globalError, setGlobalError] = useState("")
    const [success, setSuccess] = useState(false)

    const form = useForm<ForgotPasswordSchemaType>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    })

    const onSubmit = async (values: ForgotPasswordSchemaType) => {
        setGlobalError("")
        setIsLoading(true)
        try {
            await authService.forgotPassword(values.email)
            setSuccess(true)
        } catch (err: any) {
            setGlobalError(err.message || "Gửi yêu cầu thất bại")
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#E0E7FF] to-white">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-[#6B59CE]">Email đã được gửi!</h2>
                        <p className="text-gray-600">
                            Vui lòng kiểm tra email của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
                        </p>
                        <Link href="/auth/login">
                            <Button className="w-full bg-[#6B59CE] hover:bg-[#5a4cb4]">
                                Quay lại đăng nhập
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen w-full grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
            {/* Left Side - Illustration */}
            <div className="hidden lg:block relative w-full h-full overflow-hidden">
                <Image
                    src="/images/Login_page.png"
                    alt="Forgot Password Illustration"
                    fill
                    className="object-cover"
                    priority
                    sizes="50vw"
                />
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center text-[#6B59CE] hover:underline mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại đăng nhập
                    </Link>

                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold text-[#6B59CE]">Quên mật khẩu?</h1>
                        <p className="text-gray-600">
                            Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
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
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base text-[#6B59CE]">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Nhập email đăng ký của bạn"
                                                className="h-14 text-lg bg-[#E0E7FF]/30 focus-visible:ring-[#6B59CE]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                    "Gửi yêu cầu"
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}
