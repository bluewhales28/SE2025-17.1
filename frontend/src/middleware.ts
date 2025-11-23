import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Các route không cần authentication (public routes)
const publicRoutes = ["/auth/login", "/auth/register", "/forgot-password"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Lấy token từ cookie
    const token = request.cookies.get("accessToken")?.value;

    // 1. Nếu đã đăng nhập (có token) mà cố truy cập trang login/register -> Redirect về dashboard (hoặc trang chủ)
    if (token && publicRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // 2. Nếu chưa đăng nhập (không có token) mà truy cập route bảo vệ (không phải public) -> Redirect về login
    if (!token && !publicRoutes.includes(pathname)) {
        // Bỏ qua các file tĩnh, api, _next
        if (
            pathname.startsWith("/_next") ||
            pathname.startsWith("/api") ||
            pathname.startsWith("/static") ||
            pathname.includes(".") // file có đuôi mở rộng (ảnh, css...)
        ) {
            return NextResponse.next();
        }

        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return NextResponse.next();
}

// Cấu hình matcher để middleware chỉ chạy trên các path cụ thể
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
    ],
};
