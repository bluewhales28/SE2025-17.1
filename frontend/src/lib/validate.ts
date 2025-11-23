import { z } from "zod";

export const LoginSchema = z.object({
    email: z
        .string()
        .min(1, "Email không được để trống")
        .email("Email không hợp lệ"),
    password: z
        .string()
        .min(1, "Mật khẩu không được để trống")
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;
