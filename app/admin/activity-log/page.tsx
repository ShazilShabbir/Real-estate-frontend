"use client"

import { useEffect, useState, useCallback } from "react"
import { useAdmin, type ActivityLogResponse, type ActivityLogEntry } from "@/hooks/use-admin"
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const TARGET_TYPE_COLORS: Record<string, string> = {
  property: "bg-blue-500/10 text-blue-400",
  user: "bg-green-500/10 text-green-400",
  inquiry: "bg-purple-500/10 text-purple-400",
  agent_application: "bg-amber-500/10 text-amber-400",
  system: "bg-neutral-500/10 text-neutral-400",
}

export default function ActivityLogPage() {
  const { getActivityLog, loading } = useAdmin()
  const [data, setData] = useState<ActivityLogResponse | null>(null)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [page, setPage] = useState(1)

  const fetchData = useCallback(async () => {
    const result = await getActivityLog({ page, limit: 30, action: search, targetType: typeFilter })
    if (result) setData(result)
  }, [getActivityLog, page, search, typeFilter])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [search, typeFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Activity Log</h1>
        <p className="text-sm text-neutral-400 mt-1">Track all admin actions</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search by action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500"
          />
        </div>
        <div className="flex gap-2">
          {["", "property", "user", "inquiry", "agent_application"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${
                typeFilter === t
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white"
              }`}
            >
              {t ? t.replace("_", " ") : "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Admin</th>
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Action</th>
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Target</th>
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Details</th>
                <th className="text-right text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading && !data ? (
                <tr><td colSpan={5} className="text-center py-12"><Loader2 className="h-6 w-6 text-amber-500 animate-spin mx-auto" /></td></tr>
              ) : data?.logs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-neutral-500 text-sm">No activity found</td></tr>
              ) : (
                data?.logs.map((log: ActivityLogEntry) => (
                  <tr key={log._id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm text-white">{log.performedBy?.username || "Unknown"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-white">{log.action}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${TARGET_TYPE_COLORS[log.targetType] || "bg-neutral-500/10 text-neutral-400"}`}>
                        {log.targetType?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {log.details ? (
                        <p className="text-xs text-neutral-400 truncate max-w-[200px]">
                          {JSON.stringify(log.details).slice(0, 80)}
                        </p>
                      ) : (
                        <span className="text-xs text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-neutral-500">{new Date(log.createdAt).toLocaleString()}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Page {data.page} of {data.totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="border-neutral-800 text-neutral-400">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= (data.totalPages || 1)} onClick={() => setPage(p => p + 1)} className="border-neutral-800 text-neutral-400">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
