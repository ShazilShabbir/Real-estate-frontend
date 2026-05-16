"use client"

import { useEffect, useState, useCallback } from "react"
import { useAdmin, type PropertiesResponse, type PropertyData } from "@/hooks/use-admin"
import { Search, Star, StarOff, Trash2, Download, Upload, Check, X, BarChart3, ChevronLeft, ChevronRight, Loader2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { api } from "@/lib/axios"
import { toast } from "sonner"

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  house: "House", apartment: "Apartment", villa: "Villa", condo: "Condo",
  land: "Land", townhouse: "Townhouse", commercial: "Commercial", other: "Other",
}

const STATUS_STYLES: Record<string, string> = {
  available: "bg-green-500/10 text-green-400 border-green-500/20",
  sold: "bg-red-500/10 text-red-400 border-red-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  rented: "bg-blue-500/10 text-blue-400 border-blue-500/20",
}

export default function AdminPropertiesPage() {
  const { getAllProperties, approveProperty, rejectProperty, toggleFeatureProperty, togglePropertyStatus, adminDeleteProperty, bulkPropertyAction, exportCSV, loading } = useAdmin()
  const [data, setData] = useState<PropertiesResponse | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [approvedFilter, setApprovedFilter] = useState("")
  const [featuredFilter, setFeaturedFilter] = useState("")
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchData = useCallback(async () => {
    const result = await getAllProperties({
      page, limit: 20, q: search, status: statusFilter,
      propertyType: typeFilter, approved: approvedFilter, featured: featuredFilter,
    })
    if (result) setData(result)
  }, [getAllProperties, page, search, statusFilter, typeFilter, approvedFilter, featuredFilter])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1); setSelectedIds(new Set()) }, [search, statusFilter, typeFilter, approvedFilter, featuredFilter])

  const handleApprove = async (id: string) => {
    try { await approveProperty(id); toast.success("Property approved"); fetchData() }
    catch { toast.error("Failed to approve") }
  }

  const handleReject = async (id: string) => {
    try { await rejectProperty(id); toast.success("Property rejected"); fetchData() }
    catch { toast.error("Failed to reject") }
  }

  const handleToggleFeature = async (id: string) => {
    try { await toggleFeatureProperty(id); fetchData() }
    catch { toast.error("Failed to toggle feature") }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try { await togglePropertyStatus(id, status); toast.success(`Status changed to ${status}`); fetchData() }
    catch { toast.error("Failed to update status") }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try { await adminDeleteProperty(deleteId); toast.success("Property deleted"); setDeleteId(null); fetchData() }
    catch { toast.error("Failed to delete property") }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (!data) return
    if (selectedIds.size === data.properties.length) { setSelectedIds(new Set()); return }
    setSelectedIds(new Set(data.properties.map((p) => p._id)))
  }

  const handleBulk = async (action: string, extra?: Record<string, string>) => {
    if (selectedIds.size === 0) { toast.error("Select properties first"); return }
    try {
      await bulkPropertyAction(action, Array.from(selectedIds), extra)
      toast.success(`Bulk ${action} completed`)
      setSelectedIds(new Set())
      fetchData()
    } catch { toast.error("Bulk action failed") }
  }

  const [analyticsProp, setAnalyticsProp] = useState<PropertyData | null>(null)
  const [analyticsData, setAnalyticsData] = useState<{ property: any; inquiryCount: number } | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<{ created: Array<{ row: number; id: string; title: string }>; errors: Array<{ row: number; error: string }>; total: number } | null>(null)

  const openAnalytics = async (prop: PropertyData) => {
    setAnalyticsProp(prop)
    setAnalyticsLoading(true)
    setAnalyticsData(null)
    try {
      const { data } = await api.get(`/admin/properties/${prop._id}/analytics`)
      if (data?.data) setAnalyticsData(data.data)
    } catch {
      toast.error("Failed to load analytics")
    }
    setAnalyticsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Properties</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage all property listings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setImportOpen(true); setImportFile(null); setImportResult(null) }} className="border-neutral-800 text-neutral-400">
            <Upload className="h-4 w-4 mr-1.5" /> Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCSV("/admin/properties/export", "properties.csv")} className="border-neutral-800 text-neutral-400">
            <Download className="h-4 w-4 mr-1.5" /> Export CSV
          </Button>
          <span className="text-sm text-neutral-500 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800 self-center">
            {data?.total || 0} total
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-neutral-900 border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm">
          <option value="">All Status</option>
          <option value="available">Available</option><option value="sold">Sold</option><option value="pending">Pending</option><option value="rented">Rented</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-neutral-900 border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm">
          <option value="">All Types</option>
          {Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={approvedFilter} onChange={(e) => setApprovedFilter(e.target.value)} className="bg-neutral-900 border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm">
          <option value="">All Approval</option>
          <option value="true">Approved</option><option value="false">Pending Approval</option>
        </select>
        <select value={featuredFilter} onChange={(e) => setFeaturedFilter(e.target.value)} className="bg-neutral-900 border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm">
          <option value="">All</option><option value="true">Featured</option><option value="false">Not Featured</option>
        </select>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-white font-medium">{selectedIds.size} selected</span>
          <div className="h-4 w-px bg-neutral-700" />
          <Button size="sm" onClick={() => handleBulk("approve")} className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-0 text-xs">Approve All</Button>
          <Button size="sm" onClick={() => handleBulk("reject")} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-0 text-xs">Reject All</Button>
          <Button size="sm" onClick={() => handleBulk("feature")} className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-0 text-xs">Feature All</Button>
          <Button size="sm" onClick={() => handleBulk("unfeature")} className="bg-neutral-500/10 text-neutral-400 hover:bg-neutral-500/20 border-0 text-xs">Unfeature</Button>
          <select
            onChange={(e) => { if (e.target.value) { handleBulk("status", { status: e.target.value }); e.target.value = "" }}}
            className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-2 py-1 text-xs"
          >
            <option value="">Set Status...</option>
            <option value="available">Available</option><option value="sold">Sold</option><option value="pending">Pending</option><option value="rented">Rented</option>
          </select>
          <Button size="sm" onClick={() => handleBulk("delete")} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-0 text-xs">Delete All</Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={data ? selectedIds.size === data.properties.length && data.properties.length > 0 : false} onChange={toggleSelectAll} className="accent-amber-500" />
                </th>
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Property</th>
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Price</th>
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Approved</th>
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Type</th>
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Owner</th>
                <th className="text-center text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Featured</th>
                <th className="text-center text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Views</th>
                <th className="text-right text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading && !data ? (
                <tr><td colSpan={10} className="text-center py-12"><Loader2 className="h-6 w-6 text-amber-500 animate-spin mx-auto" /></td></tr>
              ) : data?.properties.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-neutral-500 text-sm">No properties found</td></tr>
              ) : (
                data?.properties.map((prop: PropertyData) => (
                  <tr key={prop._id} className={`hover:bg-neutral-800/30 transition-colors ${!prop.approved ? "bg-amber-500/[0.02]" : ""}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.has(prop._id)} onChange={() => toggleSelect(prop._id)} className="accent-amber-500" />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-white truncate max-w-[180px]">{prop.title}</p>
                        <p className="text-xs text-neutral-500">{[prop.address?.city, prop.address?.state].filter(Boolean).join(", ") || "N/A"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-sm text-white">${prop.price?.toLocaleString()}</span></td>
                    <td className="px-4 py-3">
                      <select value={prop.status} onChange={(e) => handleStatusChange(prop._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-lg border font-medium appearance-none cursor-pointer ${STATUS_STYLES[prop.status] || "bg-neutral-800 text-neutral-400"}`}>
                        <option value="available">Available</option><option value="sold">Sold</option><option value="pending">Pending</option><option value="rented">Rented</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {prop.approved ? (
                        <span className="text-xs text-green-400 flex items-center gap-1"><Check className="h-3 w-3" /> Yes</span>
                      ) : (
                        <div className="flex gap-1">
                          <button onClick={() => handleApprove(prop._id)} className="p-1 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20" title="Approve"><Check className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleReject(prop._id)} className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20" title="Reject"><X className="h-3.5 w-3.5" /></button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3"><span className="text-xs text-neutral-400">{PROPERTY_TYPE_LABELS[prop.propertyType] || prop.propertyType}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-neutral-400">{prop.postedBy?.username || "Unknown"}</span></td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggleFeature(prop._id)}
                        className={`p-1.5 rounded-lg transition-colors ${prop.isFeatured ? "text-amber-400 hover:bg-amber-500/10" : "text-neutral-600 hover:text-neutral-400 hover:bg-neutral-800"}`}>
                        {prop.isFeatured ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center"><span className="text-sm text-white">{prop.views || 0}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openAnalytics(prop)} className="text-neutral-500 hover:text-amber-400 hover:bg-amber-500/10" title="Analytics">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteId(prop._id)} className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-neutral-900 border-neutral-800">
                            <AlertDialogHeader><AlertDialogTitle className="text-white">Delete Property</AlertDialogTitle><AlertDialogDescription className="text-neutral-400">This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="border-neutral-800 text-neutral-400"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" disabled={page >= (data.totalPages || 1)} onClick={() => setPage(p => p + 1)} className="border-neutral-800 text-neutral-400"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setImportOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white">Import Properties from CSV</h3>
              <button onClick={() => setImportOpen(false)} className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {!importResult ? (
                <>
                  <div className="bg-neutral-800/50 rounded-xl p-5 text-center border-2 border-dashed border-neutral-700 hover:border-amber-500/40 transition-colors">
                    <FileText className="h-10 w-10 text-neutral-500 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400 mb-3">Upload a CSV file with property data</p>
                    <label className="cursor-pointer inline-block">
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      />
                      <span className="bg-amber-500 hover:bg-amber-600 text-black text-sm font-medium px-4 py-2 rounded-lg">
                        {importFile ? importFile.name : "Choose File"}
                      </span>
                    </label>
                  </div>

                  <div className="bg-neutral-800/30 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-2">Required columns: <code className="text-amber-400">title</code>, <code className="text-amber-400">price</code></p>
                    <p className="text-xs text-neutral-400">Optional columns: propertyType, status, bedrooms, bathrooms, area, city, state, country, street, zipcode, latitude, longitude, amenities (pipe-separated), currency, isFeatured, approved, description</p>
                  </div>

                  <Button
                    onClick={async () => {
                      if (!importFile) { toast.error("Select a CSV file"); return }
                      setImportLoading(true)
                      try {
                        const formData = new FormData()
                        formData.append("file", importFile)
                        const { data } = await api.post("/admin/properties/import", formData, {
                          headers: { "Content-Type": "multipart/form-data" },
                        })
                        if (data?.data) setImportResult(data.data)
                        toast.success(data?.data?.created?.length > 0 ? `${data.data.created.length} properties imported` : "Import completed")
                        fetchData()
                      } catch {
                        toast.error("Import failed")
                      } finally {
                        setImportLoading(false)
                      }
                    }}
                    disabled={!importFile || importLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium disabled:opacity-50"
                  >
                    {importLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    {importLoading ? "Importing..." : "Import Properties"}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white font-medium">{importResult.created.length} imported</span>
                    {importResult.errors.length > 0 && <span className="text-sm text-red-400">{importResult.errors.length} errors</span>}
                    <span className="text-xs text-neutral-500 ml-auto">{importResult.total} total rows</span>
                  </div>

                  {importResult.created.length > 0 && (
                    <div>
                      <p className="text-xs text-neutral-400 mb-2">Created Properties</p>
                      <div className="bg-neutral-800/30 rounded-lg max-h-32 overflow-y-auto">
                        {importResult.created.map((c) => (
                          <div key={c.row} className="px-3 py-1.5 text-sm text-green-400 flex gap-2 border-b border-neutral-800/50">
                            <span className="text-neutral-500">#{c.row}</span> {c.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {importResult.errors.length > 0 && (
                    <div>
                      <p className="text-xs text-neutral-400 mb-2">Errors</p>
                      <div className="bg-red-500/5 rounded-lg max-h-32 overflow-y-auto">
                        {importResult.errors.map((e, i) => (
                          <div key={i} className="px-3 py-1.5 text-sm text-red-400 flex gap-2 border-b border-red-900/20">
                            <span className="text-neutral-500 shrink-0">#{e.row}</span> {e.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button onClick={() => { setImportOpen(false); setImportResult(null) }} className="w-full bg-neutral-800 hover:bg-neutral-700 text-white">
                    Done
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {analyticsProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setAnalyticsProp(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white truncate pr-4">{analyticsProp.title}</h3>
              <button onClick={() => setAnalyticsProp(null)} className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            {analyticsLoading ? (
              <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 text-amber-500 animate-spin" /></div>
            ) : analyticsData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-800/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">{analyticsProp.views || 0}</p>
                    <p className="text-xs text-neutral-400 mt-1">Total Views</p>
                  </div>
                  <div className="bg-neutral-800/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">{analyticsData.inquiryCount}</p>
                    <p className="text-xs text-neutral-400 mt-1">Inquiries</p>
                  </div>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <p className="text-xs text-neutral-400 mb-2">Property Info</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-neutral-400">Status</span><span className="text-white capitalize">{analyticsData.property?.status}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-400">Type</span><span className="text-white capitalize">{analyticsData.property?.propertyType}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-400">Views</span><span className="text-white">{analyticsData.property?.views}</span></div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-neutral-500 py-4 text-sm">No analytics data available</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
