'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Users, BarChart3, Link2, LogOut, Shield, Zap,
  Eye, CheckCircle, XCircle, Crown, Search
} from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface AdminUser {
  id: number
  email: string
  is_active: boolean
  is_admin: boolean
  created_at: string
  username: string
  display_name: string
  total_views: number
  plan_name: string
  plan_slug: string
  plan_id: number
  link_count: number
  total_clicks: number
}

interface Plan {
  id: number
  name: string
  slug: string
}

interface Props {
  currentUser: { id: number; email: string }
  users: AdminUser[]
  stats: Record<string, number>
  plans: Plan[]
}

export default function AdminClient({ currentUser, users: initialUsers, stats, plans }: Props) {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>(initialUsers as AdminUser[])
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<number | null>(null)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out')
    router.push('/')
  }

  const updateUser = async (userId: number, data: Record<string, unknown>) => {
    setUpdating(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...data } : u))
      )
      toast.success('User updated')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setUpdating(null)
    }
  }

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.email.toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.display_name || '').toLowerCase().includes(q)
    )
  })

  const statCards = [
    { label: 'Total Users', value: stats.total_users ?? 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active Users', value: stats.active_users ?? 0, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Total Links', value: stats.total_links ?? 0, icon: Link2, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Total Clicks', value: stats.total_clicks ?? 0, icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-50' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Codevora Link</span>
            <span className="badge-pro flex items-center gap-1">
              <Shield size={11} />
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-xs text-gray-500 hover:text-orange-500 transition-colors">
              Dashboard
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Manage users, plans, and platform analytics</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => (
            <div key={s.label} className="card p-5">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon size={20} className={s.color} />
              </div>
              <p className="text-2xl font-black text-gray-900">{formatNumber(s.value)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Users size={16} className="text-orange-500" />
              All Users ({filteredUsers.length})
            </h2>
            <div className="sm:ml-auto relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input-field text-sm pl-9 !py-2 w-64"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Links</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Clicks</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-xs font-bold shrink-0">
                          {(u.display_name || u.username || u.email)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{u.display_name || u.username || '—'}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                        {u.is_admin && <Crown size={13} className="text-orange-500 shrink-0" />}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <select
                        value={u.plan_id}
                        onChange={(e) => updateUser(u.id, { plan_id: parseInt(e.target.value) })}
                        disabled={updating === u.id || u.id === currentUser.id}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        {(plans as Plan[]).map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Link2 size={12} />
                        {u.link_count}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-gray-600">
                        <BarChart3 size={12} />
                        {formatNumber(u.total_clicks)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle size={11} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                          <XCircle size={11} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        {u.username && (
                          <a
                            href={`/u/${u.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                            title="View profile"
                          >
                            <Eye size={14} />
                          </a>
                        )}
                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => updateUser(u.id, { is_active: !u.is_active })}
                            disabled={updating === u.id}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.is_active
                                ? 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                                : 'hover:bg-green-50 text-gray-400 hover:text-green-500'
                            }`}
                            title={u.is_active ? 'Deactivate user' : 'Activate user'}
                          >
                            {u.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                <Users size={28} className="mx-auto mb-2 opacity-30" />
                <p>No users found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
