'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Zap } from 'lucide-react'
import { SocialIcon } from '@/components/ui/Icons'
import { getInitials } from '@/lib/utils'

interface ProfileLink {
  id: number
  title: string
  url: string
  icon_type: string
  click_count: number
}

interface Profile {
  username: string
  display_name: string
  bio: string
  profile_image: string | null
  theme_color: string
  background_style: string
  background_value: string
}

interface Props {
  profile: Profile
  links: ProfileLink[]
}

export default function PublicProfileClient({ profile, links }: Props) {
  const [clickedLinks, setClickedLinks] = useState<Set<number>>(new Set())

  const handleLinkClick = async (link: ProfileLink) => {
    if (clickedLinks.has(link.id)) {
      window.open(link.url, '_blank', 'noopener,noreferrer')
      return
    }

    try {
      const res = await fetch(`/api/track/${link.id}`, { method: 'POST' })
      const data = await res.json()
      setClickedLinks((prev) => { const next = new Set(prev); next.add(link.id); return next })
      if (data.url) window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch {
      window.open(link.url, '_blank', 'noopener,noreferrer')
    }
  }

  const themeColor = profile.theme_color || '#F97316'
  const displayName = profile.display_name || profile.username
  const initials = getInitials(displayName)

  // Determine button style
  const buttonStyle = {
    backgroundColor: themeColor,
    color: '#ffffff',
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Header band */}
      <div
        className="w-full h-32 sm:h-40"
        style={{ backgroundColor: themeColor }}
      />

      {/* Profile card */}
      <div className="w-full max-w-sm sm:max-w-md px-4 -mt-16 sm:-mt-20 pb-12">
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          {profile.profile_image ? (
            <img
              src={profile.profile_image}
              alt={displayName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-lg object-cover"
            />
          ) : (
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-3xl font-black"
              style={{ backgroundColor: themeColor }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Name & bio */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">{displayName}</h1>
          <p className="text-sm text-orange-500 font-medium">@{profile.username}</p>
          {profile.bio && (
            <p className="text-gray-500 text-sm mt-2 leading-relaxed px-2">{profile.bio}</p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-3">
          {links.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <ExternalLink size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No links added yet</p>
            </div>
          ) : (
            links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link)}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
                style={buttonStyle}
              >
                <SocialIcon type={link.icon_type} size={19} className="shrink-0 opacity-90" />
                <span className="flex-1 text-center">{link.title}</span>
                <ExternalLink size={15} className="shrink-0 opacity-70" />
              </button>
            ))
          )}
        </div>

        {/* Powered by */}
        <div className="mt-10 flex items-center justify-center gap-1.5 text-gray-400">
          <Zap size={13} className="text-orange-400" />
          <Link href="/" className="text-xs hover:text-orange-500 transition-colors">
            Powered by <span className="font-semibold text-gray-500">Codevora Link</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
