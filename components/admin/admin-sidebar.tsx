"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  History,
  MessageSquare,
  Settings,
  Activity,
  Mail,
  X,
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/axios"

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, badge: null },
  { href: "/admin/users", label: "Users", icon: Users, badge: "pendingAgentApplications" as const },
  { href: "/admin/properties", label: "Properties", icon: Building2, badge: "pendingApprovals" as const },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, badge: null },
  { href: "/admin/activity-log", label: "Activity Log", icon: History, badge: null },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare, badge: null },
  { href: "/admin/system-health", label: "System Health", icon: Activity, badge: null },
  { href: "/admin/email-log", label: "Email Log", icon: Mail, badge: null },
  { href: "/admin/settings", label: "Settings", icon: Settings, badge: null },
]

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
  onMobileClose?: () => void
}

export function AdminSidebar({ collapsed, onToggle, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const [badges, setBadges] = useState<Record<string, number>>({})

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => {
      if (data?.data) {
        setBadges({
          pendingApprovals: data.data.pendingApprovals || 0,
          pendingAgentApplications: data.data.pendingAgentApplications || 0,
        })
      }
    }).catch(() => {})
  }, [])

  return (
    <aside
      className={cn(
        "h-screen bg-neutral-950 border-r border-neutral-800 flex flex-col transition-all duration-300 fixed md:sticky top-0 z-50",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-800">
        <Link href="/" className={cn("flex items-center gap-2.5", collapsed && "justify-center w-full")}>
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          {!collapsed && <span className="font-bold text-base text-white">EstateHub</span>}
        </Link>
        <button
          onClick={onToggle}
          className={cn("p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors", collapsed && "hidden")}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          const badge = item.badge ? badges[item.badge] : null
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-amber-500/10 text-amber-400"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50",
                collapsed && "justify-center px-0",
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-amber-400" : "text-neutral-500 group-hover:text-white")} />
              {!collapsed && <span>{item.label}</span>}
              {badge != null && badge > 0 && (
                <span className={cn(
                  "bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight",
                  collapsed ? "absolute -top-1 -right-1" : "ml-auto"
                )}>
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={onMobileClose}
        className="md:hidden p-4 border-t border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center gap-2 text-sm"
      >
        <X className="h-4 w-4" />
        Close
      </button>
    </aside>
  )
}
