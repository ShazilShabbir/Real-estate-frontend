"use client"



import { useEffect, useState } from "react"
import { useAdmin, type AdminStats } from "@/hooks/use-admin"
import {
  Building2, Users, Eye, MessageSquare, TrendingUp, TrendingDown, Clock, UserCheck,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts"


const STATUS_COLORS = {
  available: "#22c55e",
  sold: "#ef4444",
  pending: "#f59e0b",
  rented: "#3b82f6",
}

const PIE_COLORS = ["#f59e0b", "#22c55e", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]

function StatCard({ title, value, icon: Icon, trend, subtitle }: {
  title: string; value: string | number; icon: React.ElementType; trend?: "up" | "down"; subtitle?: string
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-neutral-400">{title}</span>
        <div className="p-2 bg-neutral-800 rounded-lg">
          <Icon className="h-4 w-4 text-amber-400" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value?.toLocaleString() || "0"}</div>
      {subtitle && (
        <div className="flex items-center gap-1.5 mt-1.5">
          {trend === "up" ? <TrendingUp className="h-3.5 w-3.5 text-green-400" /> : trend === "down" ? <TrendingDown className="h-3.5 w-3.5 text-red-400" /> : null}
          <span className={`text-xs ${trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-neutral-500"}`}>{subtitle}</span>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const { getAdminStats, loading } = useAdmin()
  const [stats, setStats] = useState<AdminStats | null>(null)

  useEffect(() => {
    getAdminStats().then(setStats)
  }, [getAdminStats])

  const statusData = stats?.statusBreakdown
    ? Object.entries(stats.statusBreakdown).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        fill: STATUS_COLORS[name as keyof typeof STATUS_COLORS] || "#666",
      }))
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-neutral-400 mt-1">Overview of your real estate platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Properties" value={stats?.totalProperties || 0} icon={Building2} trend="up" subtitle={`${stats?.newPropertiesThisWeek || 0} new this week`} />
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} trend="up" subtitle={`${stats?.newUsersThisWeek || 0} new this week`} />
        <StatCard title="Total Views" value={stats?.totalViews || 0} icon={Eye} />
        <StatCard title="Inquiries" value={stats?.totalInquiries || 0} icon={MessageSquare} />
      </div>

      {/* Pending Items Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <Clock className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{stats?.pendingApprovals || 0}</p>
            <p className="text-sm text-neutral-400">Properties pending approval</p>
          </div>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <UserCheck className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{stats?.pendingAgentApplications || 0}</p>
            <p className="text-sm text-neutral-400">Agent applications pending</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Properties by Status</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" tick={{ fill: "#a3a3a3", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#a3a3a3", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8, color: "#fff" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-neutral-500 text-sm">No data</div>
          )}
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Property Type Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: "House", value: 35 }, { name: "Apartment", value: 25 },
                  { name: "Villa", value: 15 }, { name: "Condo", value: 10 },
                  { name: "Land", value: 8 }, { name: "Other", value: 7 },
                ]}
                cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value"
              >
                {PIE_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8, color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {["House", "Apartment", "Villa", "Condo", "Land", "Other"].map((label, i) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Recent Activity</h2>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div key={activity._id} className="flex items-center gap-3 py-2 border-b border-neutral-800 last:border-0">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-neutral-300">
                    {activity.performedBy?.username?.[0]?.toUpperCase() || "A"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{activity.action}</p>
                  <p className="text-xs text-neutral-500">
                    by {activity.performedBy?.username || "Admin"} &middot; {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                  activity.targetType === "property" ? "bg-blue-500/10 text-blue-400" :
                  activity.targetType === "user" ? "bg-green-500/10 text-green-400" :
                  activity.targetType === "inquiry" ? "bg-purple-500/10 text-purple-400" :
                  activity.targetType === "agent_application" ? "bg-amber-500/10 text-amber-400" :
                  "bg-neutral-500/10 text-neutral-400"
                }`}>
                  {activity.targetType?.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-500 text-sm">No recent activity</div>
        )}
      </div>
    </div>
  )
}
