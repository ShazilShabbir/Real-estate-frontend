"use client"



import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useAdmin, type UsersResponse, type UserData } from "@/hooks/use-admin"
import { Search, Trash2, Shield, Download, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"


const ROLE_STYLES: Record<string, string> = {
  admin: "bg-red-500/10 text-red-400 border-red-500/20",
  agent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  user: "bg-green-500/10 text-green-400 border-green-500/20",
}

const PROVIDER_LABELS: Record<string, string> = {
  local: "Local",
  google: "Google",
  facebook: "Facebook",
}

export default function AdminUsersPage() {
  const { getUsers, updateUserRole, deleteUser, exportCSV, loading } = useAdmin()
  const [data, setData] = useState<UsersResponse | null>(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const result = await getUsers({ page, limit: 20, search, role: roleFilter })
    if (result) setData(result)
  }, [getUsers, page, search, roleFilter])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => { setPage(1) }, [search, roleFilter])

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await updateUserRole(id, newRole)
      toast.success(`User role updated to ${newRole}`)
      fetchData()
    } catch { toast.error("Failed to update role") }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteUser(deleteId)
      toast.success("User deleted")
      setDeleteId(null)
      fetchData()
    } catch { toast.error("Failed to delete user") }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Users</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage all registered users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV("/admin/users/export", "users.csv")} className="border-neutral-800 text-neutral-400">
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
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500"
          />
        </div>
        <div className="flex gap-2">
          {["", "user", "agent", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                roleFilter === r
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white"
              }`}
            >
              {r ? r.charAt(0).toUpperCase() + r.slice(1) : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">User</th>
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Role</th>
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Provider</th>
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Properties</th>
                <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Joined</th>
                <th className="text-right text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading && !data ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="h-6 w-6 text-amber-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : data?.users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-neutral-500 text-sm">No users found</td>
                </tr>
              ) : (
                data?.users.map((user: UserData) => (
                  <tr key={user._id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${user._id}`} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback className="bg-neutral-800 text-neutral-400 text-xs">
                            {user.username?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">{user.username}</p>
                          <p className="text-xs text-neutral-500">{user.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-lg border font-medium appearance-none cursor-pointer ${
                          ROLE_STYLES[user.role] || "bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-neutral-400">
                        {PROVIDER_LABELS[user.provider] || user.provider}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-white">{user.propertyCount}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-neutral-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(user._id)}
                            className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-neutral-900 border-neutral-800">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
                            <AlertDialogDescription className="text-neutral-400">
                              This will permanently delete this user and all their properties. This action cannot be undone.
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

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">
            Page {data.page} of {data.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border-neutral-800 text-neutral-400"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= (data.totalPages || 1)}
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
