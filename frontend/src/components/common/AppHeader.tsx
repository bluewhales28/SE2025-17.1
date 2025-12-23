/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, Command, Plus, Bell, Settings, Sun, Moon, LogOut, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import { toast } from "sonner";
import { JoinClassDialog } from "@/components/JoinClassDialog";

interface AppHeaderProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    darkMode: boolean;
    toggleDarkMode: () => void;
    searchQuery?: string;
    setSearchQuery?: (q: string) => void;
}

export function AppHeader({ sidebarOpen, setSidebarOpen, darkMode, toggleDarkMode, searchQuery, setSearchQuery }: AppHeaderProps) {
    const router = useRouter();
    const { logout, user } = useAuthStore();
    const [joinDialogOpen, setJoinDialogOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Đăng xuất thành công!");
        } catch (err: any) {
            toast.error(err.message || "Đăng xuất thất bại");
        }
    };

    return (
        <header className="bg-white border-b sticky top-0 z-50">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left Section - Menu & Logo */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="hover:bg-gray-100"
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                        <Link href="/" className="flex items-center">
                            <div className="bg-[#4255FF] text-white p-1.5 rounded-lg">
                                <Command size={20} />
                            </div>
                        </Link>
                    </div>

                    {/* Center Section - Search (optional) */}
                    {typeof searchQuery === 'string' && typeof setSearchQuery === 'function' ? (
                        <div className="flex-1 max-w-3xl mx-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm quiz..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-gray-50 border border-gray-200 rounded-md focus-visible:ring-[#6B59CE] text-base py-2 w-full"
                                />
                            </div>
                        </div>
                    ) : <div className="flex-1" />}

                    {/* Right Section - Actions & Profile */}
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setJoinDialogOpen(true)}>
                            <Plus className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Bell className="h-6 w-6" />
                        </Button>

                        {/* User Avatar Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="h-10 w-10 cursor-pointer">
                                    <AvatarImage src="/images/avatar.jpg" alt="User" />
                                    <AvatarFallback className="bg-[#6B59CE] text-white">U</AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
                                    <Settings className="mr-2 h-5 w-5" />
                                    <span>Cài đặt</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={toggleDarkMode} className="cursor-pointer">
                                    {darkMode ? (
                                        <Sun className="mr-2 h-5 w-5" />
                                    ) : (
                                        <Moon className="mr-2 h-5 w-5" />
                                    )}
                                    <span>{darkMode ? "Chế độ sáng" : "Chế độ tối"}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                                    <LogOut className="mr-2 h-5 w-5" />
                                    <span>Đăng xuất</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            <JoinClassDialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen} />
        </header>
    );
}
