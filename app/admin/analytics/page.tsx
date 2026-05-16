"use client"

import { useEffect, useState } from "react"
import { useAdmin } from "@/hooks/use-admin"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Legend,
} from "recharts"

const PIE_COLORS = ["#f59e0b", "#22c55e", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]

export default function AdminAnalyticsPage() {
  const { getAnalytics, loading } = useAdmin()
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    getAnalytics(12).then(setAnalytics)
  }, [getAnalytics])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-neutral-400 mt-1">Platform trends and insights</p>
      </div>

      {loading && !analytics ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Monthly Trend */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold text-white mb-4">Monthly Trends</h2>
            {analytics?.trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={analytics.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="label" tick={{ fill: "#a3a3a3", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#a3a3a3", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8, color: "#fff" }}
                  />
                  <Legend wrapperStyle={{ color: "#a3a3a3", fontSize: 12 }} />
                  <Line type="monotone" dataKey="properties" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} name="Properties" />
                  <Line type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e" }} name="Users" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-neutral-500 text-sm">No trend data</div>
            )}
          </div>

          {/* Property Type Distribution */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Property Type Distribution</h2>
            {analytics?.typeDistribution?.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.typeDistribution}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={100}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="_id"
                      label={({ _id, count }) => `${_id} (${count})`}
                    >
                      {analytics.typeDistribution.map((_: any, i: number) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8, color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {analytics.typeDistribution.map((t: any, i: number) => (
                    <span key={t._id} className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {t._id}: {t.count}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-neutral-500 text-sm">No data</div>
            )}
          </div>

          {/* City Distribution */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Top Cities</h2>
            {analytics?.cityDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.cityDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis type="number" tick={{ fill: "#a3a3a3", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="_id"
                    tick={{ fill: "#a3a3a3", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8, color: "#fff" }}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-neutral-500 text-sm">No data</div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold text-white mb-4">Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {analytics?.typeDistribution?.reduce((a: number, b: any) => a + b.count, 0) || 0}
                </p>
                <p className="text-xs text-neutral-400 mt-1">Total Properties</p>
              </div>
              <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {analytics?.typeDistribution?.length || 0}
                </p>
                <p className="text-xs text-neutral-400 mt-1">Property Types</p>
              </div>
              <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {analytics?.cityDistribution?.length || 0}
                </p>
                <p className="text-xs text-neutral-400 mt-1">Cities</p>
              </div>
              <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {analytics?.trend?.length || 0}
                </p>
                <p className="text-xs text-neutral-400 mt-1">Months of Data</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
