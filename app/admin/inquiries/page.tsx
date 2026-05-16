"use client"

import { useEffect, useState, useCallback } from "react"
import { useAdmin, type InquiriesResponse, type InquiryData } from "@/hooks/use-admin"
import { Search, Mail, Trash2, Download, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  read: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  replied: "bg-green-500/10 text-green-400 border-green-500/20",
  archived: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
}

export default function AdminInquiriesPage() {
  const { getInquiries, updateInquiryStatus, deleteInquiry, exportCSV, loading } = useAdmin()
  const [data, setData] = useState<InquiriesResponse | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryData | null>(null)

  const fetchData = useCallback(async () => {
    const result = await getInquiries({ page, limit: 20, search, status: statusFilter })
    if (result) setData(result)
  }, [getInquiries, page, search, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [search, statusFilter])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateInquiryStatus(id, status)
      toast.success(`Marked as ${status}`)
      fetchData()
      if (selectedInquiry?._id === id) {
        setSelectedInquiry((prev) => prev ? { ...prev, status: status as any } : null)
      }
    } catch { toast.error("Failed to update status") }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteInquiry(deleteId)
      toast.success("Inquiry deleted")
      setDeleteId(null)
      setSelectedInquiry(null)
      fetchData()
    } catch { toast.error("Failed to delete inquiry") }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Inquiries</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage contact form submissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV("/admin/inquiries/export", "inquiries.csv")} className="border-neutral-800 text-neutral-400">
            <Download className="h-4 w-4 mr-1.5" /> Export CSV
          </Button>
          <span className="text-sm text-neutral-500 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800 self-center">
            {data?.total || 0} total
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search by name, email, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500"
          />
        </div>
        <div className="flex gap-2">
          {["", "new", "read", "replied", "archived"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${
                statusFilter === s
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden lg:col-span-1">
          <div className="overflow-y-auto max-h-[600px]">
            <table className="w-full">
              <thead className="sticky top-0 bg-neutral-900">
                <tr className="border-b border-neutral-800">
                  <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">From</th>
                  <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-right text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {loading && !data ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12">
                      <Loader2 className="h-6 w-6 text-amber-500 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : data?.inquiries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-neutral-500 text-sm">No inquiries</td>
                  </tr>
                ) : (
                  data?.inquiries.map((inq: InquiryData) => (
                    <tr
                      key={inq._id}
                      onClick={() => setSelectedInquiry(inq)}
                      className={`hover:bg-neutral-800/30 transition-colors cursor-pointer ${
                        selectedInquiry?._id === inq._id ? "bg-neutral-800/50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-white">{inq.name}</p>
                        <p className="text-xs text-neutral-500">{inq.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize border ${
                          STATUS_STYLES[inq.status] || "bg-neutral-800 text-neutral-400"
                        }`}>
                          {inq.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-neutral-500">
                          {new Date(inq.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => setDeleteId(inq._id)}
                              className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-neutral-900 border-neutral-800">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete Inquiry</AlertDialogTitle>
                              <AlertDialogDescription className="text-neutral-400">
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Message Detail */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 lg:col-span-1">
          {selectedInquiry ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">{selectedInquiry.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-neutral-400 mt-1">
                    <Mail className="h-3.5 w-3.5" />
                    {selectedInquiry.email}
                  </div>
                  {selectedInquiry.phone && (
                    <p className="text-sm text-neutral-400 mt-0.5">{selectedInquiry.phone}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize border ${
                  STATUS_STYLES[selectedInquiry.status] || "bg-neutral-800 text-neutral-400"
                }`}>
                  {selectedInquiry.status}
                </span>
              </div>

              {selectedInquiry.propertyId && (
                <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
                  <p className="text-xs text-neutral-500">Regarding property:</p>
                  <p className="text-sm text-white">{selectedInquiry.propertyId.title}</p>
                </div>
              )}

              <div className="bg-neutral-800/30 rounded-lg p-4">
                <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">{selectedInquiry.message}</p>
              </div>

              <p className="text-xs text-neutral-500">
                Received {new Date(selectedInquiry.createdAt).toLocaleString()}
              </p>

              <div className="border-t border-neutral-800 pt-4">
                <p className="text-xs font-medium text-neutral-400 mb-2">Update Status</p>
                <div className="flex gap-2">
                  {["new", "read", "replied", "archived"].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedInquiry._id, s)}
                      disabled={selectedInquiry.status === s}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                        selectedInquiry.status === s
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-not-allowed"
                          : "bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-neutral-500">
              <Mail className="h-12 w-12 mb-3 text-neutral-700" />
              <p className="text-sm">Select an inquiry to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Page {data.page} of {data.totalPages}</span>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm" disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border-neutral-800 text-neutral-400"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline" size="sm" disabled={page >= (data.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="border-neutral-800 text-neutral-400"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
