"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useClassStore } from "@/store/useClassStore"
import { toast } from "sonner"

interface JoinClassDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function JoinClassDialog({ open, onOpenChange }: JoinClassDialogProps) {
    const router = useRouter()
    const { joinClass, fetchClasses } = useClassStore()
    const [invitationCode, setInvitationCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleJoin = async () => {
        if (!invitationCode.trim()) {
            toast.error("Vui lòng nhập mã lớp học")
            return
        }

        setIsLoading(true)
        try {
            const joinedClass = await joinClass(invitationCode.trim().toUpperCase())
            toast.success("Tham gia lớp học thành công!")
            setInvitationCode("")
            onOpenChange(false)
            // Refresh classes list
            await fetchClasses()
            // Navigate to the class page
            router.push(`/classes/${joinedClass.id}`)
        } catch (err: any) {
            toast.error(err.message || "Tham gia lớp học thất bại")
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !isLoading) {
            handleJoin()
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tham gia lớp học</DialogTitle>
                    <DialogDescription>
                        Nhập mã mời để tham gia lớp học. Mã mời thường là một chuỗi ký tự ngắn.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="invitationCode">Mã lớp học</Label>
                        <Input
                            id="invitationCode"
                            placeholder="Nhập mã lớp học..."
                            value={invitationCode}
                            onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                            className="uppercase"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false)
                            setInvitationCode("")
                        }}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleJoin}
                        disabled={isLoading || !invitationCode.trim()}
                        className="bg-[#6B59CE] hover:bg-[#5a4ab8]"
                    >
                        {isLoading ? "Đang tham gia..." : "Tham gia"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

