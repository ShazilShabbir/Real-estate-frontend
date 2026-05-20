"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/axios"
import { useAuthContext } from "@/lib/auth-context"
import { Building2, Eye, MessageSquare, Star, Plus, Loader2, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslation } from "@/lib/use-translation"
import { formatPrice } from "@/lib/format-price"

interface AgentStats {
  totalProperties: number
  totalViews: number
  totalInquiries: number
  featured: number
  approved: number
  pendingApproval: number
  statusBreakdown: Record<string, number>
  recentProperties: Array<{
    _id: string
    title: string
    price: number
    status: string
    propertyType: string
    isFeatured: boolean
    approved: boolean
    views: number
    createdAt: string
  }>
}

const STATUS_STYLES: Record<string, string> = {
  available: "bg-green-500/10 text-green-400",
  sold: "bg-red-500/10 text-red-400",
  pending: "bg-yellow-500/10 text-yellow-400",
  rented: "bg-blue-500/10 text-blue-400",
}

export default function AgentDashboardClient() {
  const { t } = useTranslation()
  const { user } = useAuthContext()
  const [stats, setStats] = useState<AgentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/agent/stats").then(({ data }) => {
      if (data?.data) setStats(data.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  const cards = [
    { label: t("agentDashboard.totalProperties"), value: stats?.totalProperties || 0, icon: Building2, color: "text-blue-500 bg-blue-500/10" },
    { label: t("agentDashboard.totalViews"), value: stats?.totalViews || 0, icon: Eye, color: "text-emerald-500 bg-emerald-500/10" },
    { label: t("agentDashboard.totalInquiries"), value: stats?.totalInquiries || 0, icon: MessageSquare, color: "text-purple-500 bg-purple-500/10" },
    { label: t("agentDashboard.featured"), value: stats?.featured || 0, icon: Star, color: "text-amber-500 bg-amber-500/10" },
    { label: t("agentDashboard.approved"), value: stats?.approved || 0, icon: CheckCircle2, color: "text-green-500 bg-green-500/10" },
    { label: t("agentDashboard.pendingApproval"), value: stats?.pendingApproval || 0, icon: Clock, color: "text-orange-500 bg-orange-500/10" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("agentDashboard.heading")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("agentDashboard.welcome", { username: user?.username || "" })}</p>
        </div>
        <Link href="/create-property">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> {t("agentDashboard.addProperty")}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-card border border-border/40 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">{t("agentDashboard.statusBreakdown")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(stats?.statusBreakdown || {}).map(([key, count]) => (
            <div key={key} className="bg-card border border-border/40 rounded-lg px-4 py-3">
              <p className="text-xs text-muted-foreground capitalize">{t(`agentDashboard.status_${key}`, {}) || key}</p>
              <p className={`text-lg font-bold mt-0.5 ${STATUS_STYLES[key]?.split(" ")[1] || "text-foreground"}`}>{count}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">{t("agentDashboard.recentProperties")}</h2>
        {stats?.recentProperties?.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">{t("agentDashboard.noProperties")}</p>
        ) : (
          <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">{t("agentDashboard.tableTitle")}</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">{t("agentDashboard.tablePrice")}</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">{t("agentDashboard.tableStatus")}</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase px-4 py-3">{t("agentDashboard.tableFeatured")}</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase px-4 py-3">{t("agentDashboard.tableViews")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {stats?.recentProperties.map((prop) => (
                    <tr key={prop._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{prop.title}</p>
                      </td>
                      <td className="px-4 py-3"><span className="text-sm text-foreground">{formatPrice(prop.price)}</span></td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${STATUS_STYLES[prop.status] || "bg-neutral-800 text-neutral-400"}`}>
                          {t(`agentDashboard.status_${prop.status}`, {}) || prop.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {prop.isFeatured ? <Star className="h-4 w-4 text-amber-500 fill-current mx-auto" /> : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center"><span className="text-sm text-foreground">{prop.views || 0}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
