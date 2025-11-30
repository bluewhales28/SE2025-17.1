import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Command } from "lucide-react";

export function Header() {
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between bg-white">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-black text-white p-1 rounded-sm">
             <Command size={24} />
          </div>
          <span className="font-bold text-xl hidden">Quizlet</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="#" className="hover:text-black">
            Công cụ
          </Link>
          <Link href="#" className="hover:text-black">
            Chủ đề
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <Button asChild className="bg-[#4255FF] hover:bg-[#4255FF]/90 text-white font-semibold rounded-md px-6">
          <Link href="/auth/login">Đăng nhập</Link>
        </Button>
      </div>
    </header>
  );
}
