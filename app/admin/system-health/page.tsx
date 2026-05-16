"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/axios"
import { Loader2, Activity, Database, Cpu, Clock, Server, Wifi } from "lucide-react"

interface HealthData {
  uptime: number
  nodeVersion: string
  platform: string
  memoryUsage: { rss: number; heapTotal: number; heapUsed: number; external: number }
  mongoState: string
  mongoConnected: boolean
  timestamp: string
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const parts: string[] = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  parts.push(`${s}s`)
  return parts.join(" ")
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchHealth = async () => {
    try {
      const { data } = await api.get("/admin/system-health")
      if (data?.data) setHealth(data.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
      </div>
    )
  }

  const cards = [
    {
      title: "Server Uptime",
      value: health ? formatUptime(health.uptime) : "—",
      icon: Clock,
      color: "text-blue-400 bg-blue-500/10",
    },
    {
      title: "MongoDB",
      value: health?.mongoConnected ? "Connected" : "Disconnected",
      sub: health?.mongoState || "",
      icon: Database,
      color: health?.mongoConnected ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10",
    },
    {
      title: "Node.js",
      value: health?.nodeVersion || "—",
      icon: Server,
      color: "text-emerald-400 bg-emerald-500/10",
    },
    {
      title: "Platform",
      value: health?.platform || "—",
      icon: Cpu,
      color: "text-purple-400 bg-purple-500/10",
    },
    {
      title: "Memory (RSS)",
      value: health ? formatBytes(health.memoryUsage.rss) : "—",
      sub: `Heap: ${health ? formatBytes(health.memoryUsage.heapUsed) : "—"} / ${health ? formatBytes(health.memoryUsage.heapTotal) : "—"}`,
      icon: Activity,
      color: "text-amber-400 bg-amber-500/10",
    },
    {
      title: "Last Check",
      value: health ? new Date(health.timestamp).toLocaleTimeString() : "—",
      icon: Wifi,
      color: "text-sky-400 bg-sky-500/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">System Health</h1>
        <p className="text-sm text-neutral-400 mt-1">Server status and diagnostics — auto-refreshes every 30s</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.title} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-400 mb-1">{card.title}</p>
                <p className="text-xl font-bold text-white">{card.value}</p>
                {card.sub && <p className="text-xs text-neutral-500 mt-1">{card.sub}</p>}
              </div>
              <div className={`p-2.5 rounded-lg ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
