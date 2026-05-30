'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  BarChart3, ExternalLink, Link2, LogOut, Plus, Save,
  Settings, Trash2, Eye, EyeOff, GripVertical, Copy, Zap, User, Crown
} from 'lucide-react'
import { SocialIcon, ICON_OPTIONS } from '@/components/ui/Icons'
import { formatNumber, getInitials } from '@/lib/utils'

interface DashboardLink {
  id: number
  title: string
  url: string
  icon_type: string
  is_active: boolean
  click_count: number
  sort_order: number
}

interface Profile {
  username: string
  display_name: string
  bio: string
  profile_image: string | null
  theme_color: string
  total_views: number
}

interface User {
  id: number
  email: string
  plan_slug: string
  plan_name: string
  max_links: number
  has_analytics: boolean
}

interface Props {
  user: User
  profile: Profile | null
  links: DashboardLink[]
  analytics: Record<string, number>
}

const THEME_COLORS = [
  '#F97316', '#3B82F6', '#10B981', '#8B5CF6',
  '#EF4444', '#F59E0B', '#EC4899', '#0F172A',
]

export default function DashboardClient({ user, profile: initialProfile, links: initialLinks, analytics }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'links' | 'profile' | 'analytics'>('links')
  const [links, setLinks] = useState<DashboardLink[]>(initialLinks as DashboardLink[])
  const [profile, setProfile] = useState(initialProfile)
  const [saving, setSaving] = useState(false)

  // Profile form state
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [username, setUsername] = useState(profile?.username || '')
  const [profileImage, setProfileImage] = useState(profile?.profile_image || '')
  const [themeColor, setThemeColor] = useState(profile?.theme_color || '#F97316')

  // New link form
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newIcon, setNewIcon] = useState('link')
  const [addingLink, setAddingLink] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  const handleUpgrade = async (planId: number) => {
    setUpgrading(true)
    try {
      const res = await fetch('/api/payment/telebirr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      const { rawRequest } = json.data

      // Must be inside the Telebirr SuperApp browser
      const w = window as unknown as { consumerapp?: { evaluate: (s: string) => void } }
      if (!w.consumerapp) {
        toast.error('Please open this page inside the Telebirr app to pay')
        setUpgrading(false)
        return
      }

      w.consumerapp.evaluate(JSON.stringify({
        functionName: 'js_fun_start_pay',
        params: {
          rawRequest: rawRequest.trim(),
          functionCallBackName: 'handleTelebirrCallback',
        },
      }))

      // Callback from Telebirr after payment
      ;(window as Record<string, unknown>).handleTelebirrCallback = () => {
        router.push('/payment/success')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to start payment')
      setUpgrading(false)
    }
  }

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile?.username || user.email}`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  const shareUrl = `${appUrl}/u/${profile?.username}`

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out')
    router.push('/')
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName, bio, username, profile_image: profileImage, theme_color: themeColor }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Profile saved!')
      setProfile((p) => p ? { ...p, display_name: displayName, bio, username, profile_image: profileImage, theme_color: themeColor } : p)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleAddLink = async () => {
    if (!newTitle.trim() || !newUrl.trim()) {
      toast.error('Title and URL are required')
      return
    }
    setAddingLink(true)
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, url: newUrl, icon_type: newIcon }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setLinks((prev) => [...prev, json.data])
      setNewTitle('')
      setNewUrl('')
      setNewIcon('link')
      setShowAddForm(false)
      toast.success('Link added!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add link')
    } finally {
      setAddingLink(false)
    }
  }

  const handleToggleLink = async (link: DashboardLink) => {
    const res = await fetch(`/api/links/${link.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !link.is_active }),
    })
    if (res.ok) {
      setLinks((prev) => prev.map((l) => l.id === link.id ? { ...l, is_active: !l.is_active } : l))
    }
  }

  const handleDeleteLink = async (linkId: number) => {
    if (!confirm('Delete this link?')) return
    const res = await fetch(`/api/links/${linkId}`, { method: 'DELETE' })
    if (res.ok) {
      setLinks((prev) => prev.filter((l) => l.id !== linkId))
      toast.success('Link deleted')
    }
  }

  const copyPublicUrl = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Copied to clipboard!')
  }

  const initials = getInitials(displayName || user.email)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm hidden sm:block">
              Codevora <span className="text-orange-500">Link</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Plan badge */}
            <span className={user.plan_slug === 'pro' ? 'badge-pro' : user.plan_slug === 'business' ? 'badge-business' : 'badge-free'}>
              {user.plan_slug === 'pro' || user.plan_slug === 'business' ? (
                <Crown size={11} className="mr-1" />
              ) : null}
              {user.plan_name}
            </span>

            {/* Public link */}
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50"
            >
              <ExternalLink size={13} />
              View Profile
            </a>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50"
            >
              <LogOut size={14} />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Welcome + public URL */}
        <div className="card p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0"
            style={{ backgroundColor: themeColor }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-gray-900">
              {displayName || profile?.username || 'Your Profile'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded font-mono truncate max-w-[200px] sm:max-w-xs">
                /u/{profile?.username || '…'}
              </code>
              <button onClick={copyPublicUrl} className="text-gray-400 hover:text-orange-500 transition-colors shrink-0">
                <Copy size={13} />
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs !py-2 !px-3 flex items-center gap-1"
            >
              <ExternalLink size={13} />
              View
            </a>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Clicks', value: formatNumber(analytics.total_clicks ?? 0), icon: Link2, color: 'text-orange-500' },
            { label: 'Profile Views', value: formatNumber(analytics.total_views ?? profile?.total_views ?? 0), icon: Eye, color: 'text-blue-500' },
            { label: 'Today\'s Clicks', value: formatNumber(analytics.clicks_today ?? 0), icon: BarChart3, color: 'text-green-500' },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 text-center">
              <stat.icon size={18} className={`${stat.color} mx-auto mb-1`} />
              <p className="text-xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-6 gap-1">
          {[
            { key: 'links', label: 'My Links', icon: Link2 },
            { key: 'profile', label: 'Profile', icon: User },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* LINKS TAB */}
        {activeTab === 'links' && (
          <div className="space-y-4">
            {/* Upgrade banner for free users */}
            {user.plan_slug === 'free' && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Upgrade to Pro</p>
                  <p className="text-xs text-gray-500">Unlimited links, analytics & more — 199 ETB/month</p>
                </div>
                <button
                  onClick={() => handleUpgrade(2)}
                  disabled={upgrading}
                  className="btn-primary text-xs !py-2 !px-4 shrink-0 flex items-center gap-1.5"
                >
                  <Crown size={13} />
                  {upgrading ? 'Loading...' : 'Upgrade'}
                </button>
              </div>
            )}

            {/* Add link button */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {links.length} / {user.max_links >= 999 ? '∞' : user.max_links} links
              </p>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn-primary text-sm !py-2 !px-4 flex items-center gap-1.5"
              >
                <Plus size={15} />
                Add Link
              </button>
            </div>

            {/* Add form */}
            {showAddForm && (
              <div className="card p-5 border-2 border-orange-100 animate-slide-up">
                <h3 className="font-bold text-gray-900 text-sm mb-4">New Link</h3>
                <div className="space-y-3">
                  <input
                    className="input-field text-sm"
                    placeholder="Link title (e.g. My Telegram Channel)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <input
                    className="input-field text-sm"
                    placeholder="URL (e.g. https://t.me/yourname)"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    onBlur={() => {
                      // Auto-detect icon
                      const url = newUrl.toLowerCase()
                      if (url.includes('t.me') || url.includes('telegram')) setNewIcon('telegram')
                      else if (url.includes('tiktok')) setNewIcon('tiktok')
                      else if (url.includes('youtube') || url.includes('youtu.be')) setNewIcon('youtube')
                      else if (url.includes('wa.me') || url.includes('whatsapp')) setNewIcon('whatsapp')
                      else if (url.includes('instagram')) setNewIcon('instagram')
                      else if (url.includes('twitter') || url.includes('x.com')) setNewIcon('twitter')
                      else if (url.includes('facebook') || url.includes('fb.com')) setNewIcon('facebook')
                      else if (url.includes('linkedin')) setNewIcon('linkedin')
                      else if (url.includes('github')) setNewIcon('github')
                    }}
                  />
                  <select
                    className="input-field text-sm"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={handleAddLink} disabled={addingLink} className="btn-primary text-sm !py-2 flex-1">
                      {addingLink ? 'Adding...' : 'Add Link'}
                    </button>
                    <button onClick={() => setShowAddForm(false)} className="btn-secondary text-sm !py-2 !px-4">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Links list */}
            {links.length === 0 ? (
              <div className="card p-10 text-center text-gray-400">
                <Link2 size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium text-gray-600">No links yet</p>
                <p className="text-sm mt-1">Add your first link to get started!</p>
              </div>
            ) : (
              links.map((link) => (
                <div
                  key={link.id}
                  className={`card p-4 flex items-center gap-3 ${!link.is_active ? 'opacity-50' : ''}`}
                >
                  <GripVertical size={16} className="text-gray-300 shrink-0 cursor-grab" />
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: themeColor + '20', color: themeColor }}
                  >
                    <SocialIcon type={link.icon_type} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{link.title}</p>
                    <p className="text-xs text-gray-400 truncate">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                    <BarChart3 size={11} />
                    {formatNumber(link.click_count)}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleLink(link)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      title={link.is_active ? 'Hide link' : 'Show link'}
                    >
                      {link.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete link"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-5">
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Settings size={16} className="text-orange-500" />
                Edit Profile
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/u/</span>
                    <input
                      className="input-field pl-10 text-sm"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="yourname"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Name</label>
                  <input
                    className="input-field text-sm"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                  <textarea
                    className="input-field text-sm h-24 resize-none"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell people about yourself..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/500</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Profile Image URL</label>
                  <input
                    className="input-field text-sm"
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    placeholder="https://example.com/your-photo.jpg"
                  />
                  {profileImage && (
                    <img
                      src={profileImage}
                      alt="preview"
                      className="w-16 h-16 rounded-full object-cover mt-2 border-2 border-gray-100"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  )}
                </div>

                {/* Theme color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme Color
                    {user.plan_slug === 'free' && (
                      <span className="ml-2 badge-free text-xs">Pro feature — preview only</span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {THEME_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setThemeColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          themeColor === color ? 'border-gray-900 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-200 p-0.5"
                      title="Custom color"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            {!user.has_analytics ? (
              <div className="card p-10 text-center">
                <Crown size={32} className="text-orange-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Analytics available on Pro</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Upgrade to Pro to see detailed click analytics, daily trends, and top-performing links.
                </p>
                <button
                  onClick={() => handleUpgrade(2)}
                  disabled={upgrading}
                  className="btn-primary text-sm inline-flex items-center gap-2"
                >
                  <Crown size={14} />
                  {upgrading ? 'Loading...' : 'Upgrade to Pro — 199 ETB/month'}
                </button>
              </div>
            ) : (
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 size={16} className="text-orange-500" />
                  Link Performance
                </h2>
                <div className="space-y-3">
                  {links.sort((a, b) => b.click_count - a.click_count).map((link) => (
                    <div key={link.id} className="flex items-center gap-3">
                      <SocialIcon type={link.icon_type} size={15} className="text-gray-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 truncate">{link.title}</span>
                          <span className="text-sm font-bold text-gray-900 shrink-0 ml-2">{formatNumber(link.click_count)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: themeColor,
                              width: links[0]?.click_count
                                ? `${(link.click_count / links[0].click_count) * 100}%`
                                : '0%',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
