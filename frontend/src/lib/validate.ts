import { z } from "zod";

export const LoginSchema = z.object({
    email: z
        .string()
        .min(1, "Email không được để trống"),
    password: z
        .string()
        .min(1, "Mật khẩu không được để trống")
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
    fullName: z.string().min(1, "Họ và tên không được để trống"),
    email: z
        .string()
        .min(1, "Email không được để trống")
        .email("Email không hợp lệ"),
    password: z
        .string()
        .min(1, "Mật khẩu không được để trống")
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
    phoneNumber: z.string().min(10, "Số điện thoại không hợp lệ").max(11, "Số điện thoại không hợp lệ"),
    dateOfBirth: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', {
        message: "Ngày sinh không hợp lệ",
    }),
    gender: z.enum(["MALE", "FEMALE", "OTHER"], {
        message: "Vui lòng chọn giới tính",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});

export type RegisterSchemaType = z.infer<typeof RegisterSchema>;
