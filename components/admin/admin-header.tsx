"use client"

import { Menu, LogOut, Home } from "lucide-react"
import Link from "next/link"
import { useAuthContext } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface AdminHeaderProps {
  onMenuToggle: () => void
}

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const { user, logout } = useAuthContext()

  return (
    <header className="h-16 bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link
          href="/"
          className="hidden sm:flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm"
        >
          <Home className="h-4 w-4" />
          Back to Site
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3 py-1.5">
          <Avatar className="h-7 w-7 ring-2 ring-amber-500/20">
            <AvatarImage src={user?.avatar} alt={user?.username || "Admin"} />
            <AvatarFallback className="bg-amber-500/10 text-amber-400 text-xs font-bold">
              {user?.username?.[0]?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-white leading-tight">{user?.username || "Admin"}</p>
            <p className="text-[11px] text-neutral-400 leading-tight">Administrator</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4 mr-1.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}
