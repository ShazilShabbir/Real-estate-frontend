"use client"



import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/axios"
import { Search, ChevronLeft, ChevronRight, Loader2, Mail, CheckCircle2, XCircle, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


interface EmailLogEntry {
  _id: string
  to: string
  subject: string
  status: "sent" | "failed" | "skipped"
  error?: string
  createdAt: string
}

const STATUS_STYLES: Record<string, string> = {
  sent: "bg-green-500/10 text-green-400",
  failed: "bg-red-500/10 text-red-400",
  skipped: "bg-yellow-500/10 text-yellow-400",
}

const STATUS_ICONS: Record<string, typeof CheckCircle2> = {
  sent: CheckCircle2,
  failed: XCircle,
  skipped: SkipForward,
}

export default function EmailLogPage() {
  const [logs, setLogs] = useState<EmailLogEntry[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get("/admin/email-log", { params: { page, limit: 20, search, status: statusFilter } })
      if (data?.data) {
        setLogs(data.data.logs)
        setTotal(data.data.total)
        setTotalPages(data.data.totalPages)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { fetchLogs() }, [fetchLogs])
  useEffect(() => { setPage(1) }, [search, statusFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Email Log</h1>
        <p className="text-sm text-neutral-400 mt-1">Sent email notifications — {total} total</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input placeholder="Search by email or subject..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm">
          <option value="">All Status</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="skipped">Skipped</option>
        </select>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">To</th>
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Subject</th>
                <th className="text-right text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading && logs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12"><Loader2 className="h-6 w-6 text-amber-500 animate-spin mx-auto" /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-neutral-500 text-sm">No emails sent yet</td></tr>
              ) : (
                logs.map((log) => {
                  const StatusIcon = STATUS_ICONS[log.status] || Mail
                  return (
                    <tr key={log._id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg font-medium ${STATUS_STYLES[log.status] || ""}`}>
                          <StatusIcon className="h-3 w-3" />
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3"><span className="text-sm text-white">{log.to}</span></td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-white truncate max-w-[300px]">{log.subject}</p>
                          {log.error && <p className="text-xs text-red-400 mt-0.5">{log.error}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="text-xs text-neutral-400">{new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="border-neutral-800 text-neutral-400"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="border-neutral-800 text-neutral-400"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  )
}
