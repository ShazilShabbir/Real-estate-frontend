"use client"



import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAdmin } from "@/hooks/use-admin"
import { ArrowLeft, Mail, Phone, Calendar, Shield, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"


export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { getUserById, updateUserRole, deleteUser } = useAdmin()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getUserById(id).then((data) => {
      setUser(data)
      setLoading(false)
    })
  }, [id, getUserById])

  const handleRoleChange = async (newRole: string) => {
    try {
      const updated = await updateUserRole(id, newRole)
      if (updated) setUser((prev: any) => ({ ...prev, role: newRole }))
      toast.success(`Role updated to ${newRole}`)
    } catch { toast.error("Failed to update role") }
  }

  const handleDelete = async () => {
    try {
      await deleteUser(id)
      toast.success("User deleted")
      router.push("/admin/users")
    } catch { toast.error("Failed to delete user") }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-400">User not found</p>
        <Button variant="link" onClick={() => router.push("/admin/users")} className="text-amber-400 mt-2">
          Back to users
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" onClick={() => router.push("/admin/users")} className="text-neutral-400 hover:text-white -ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Users
      </Button>

      {/* Profile Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <Avatar className="h-20 w-20 ring-4 ring-neutral-800">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback className="bg-amber-500/10 text-amber-400 text-2xl font-bold">
              {user.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-white">{user.username}</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                user.role === "admin" ? "bg-red-500/10 text-red-400" :
                user.role === "agent" ? "bg-blue-500/10 text-blue-400" :
                "bg-green-500/10 text-green-400"
              }`}>
                {user.role}
              </span>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Phone className="h-3.5 w-3.5" />
                  {user.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Calendar className="h-3.5 w-3.5" />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Building2 className="h-3.5 w-3.5" />
                {user.propertyCount} properties listed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Management */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-400" />
          Role Management
        </h2>
        <div className="flex gap-2">
          {["user", "agent", "admin"].map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              disabled={user.role === role}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                user.role === role
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-not-allowed"
                  : "bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Properties List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Properties ({user.propertyCount})</h2>
        {user.properties?.length > 0 ? (
          <div className="space-y-2">
            {user.properties.map((prop: any) => (
              <div key={prop._id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-neutral-800/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{prop.title}</p>
                  <p className="text-xs text-neutral-500">
                    ${prop.price?.toLocaleString()} &middot; {prop.propertyType} &middot; {prop.views} views
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ml-3 ${
                  prop.status === "available" ? "bg-green-500/10 text-green-400" :
                  prop.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                  prop.status === "sold" ? "bg-red-500/10 text-red-400" :
                  "bg-blue-500/10 text-blue-400"
                }`}>
                  {prop.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500 text-center py-6">No properties listed</p>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-neutral-900 border border-red-500/20 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-xs text-neutral-500 mb-4">Deleting this user will also remove all their properties.</p>
        <Button onClick={handleDelete} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
          Delete User
        </Button>
      </div>
    </div>
  )
}
