import { notFound } from 'next/navigation'
import { query } from '@/lib/db'
import PublicProfileClient from './PublicProfileClient'
import type { Metadata } from 'next'
import type { RowDataPacket } from 'mysql2'

interface Props { params: { username: string } }

async function getProfileData(username: string) {
  const profiles = await query<RowDataPacket[]>(
    `SELECT p.*, u.id as user_id,
            pl.name as plan_name, pl.slug as plan_slug
     FROM profiles p
     JOIN users u ON p.user_id = u.id
     JOIN plans pl ON u.plan_id = pl.id
     WHERE p.username = ? AND p.is_public = TRUE AND u.is_active = TRUE`,
    [username.toLowerCase()]
  )
  if (profiles.length === 0) return null

  const profile = profiles[0] as Record<string, unknown>

  const links = await query<RowDataPacket[]>(
    `SELECT id, title, url, icon_type, click_count
     FROM links
     WHERE user_id = ? AND is_active = TRUE
     ORDER BY sort_order ASC, created_at ASC`,
    [profile.user_id as number]
  )

  // Record view (fire-and-forget)
  query('UPDATE profiles SET total_views = total_views + 1 WHERE id = ?', [profile.id as number]).catch(() => {})
  query('INSERT INTO profile_views (profile_id) VALUES (?)', [profile.id as number]).catch(() => {})

  return { profile, links }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getProfileData(params.username)
  if (!data) return { title: 'Profile not found — Codevora Link' }

  const { profile } = data
  return {
    title: `${profile.display_name || profile.username} — Codevora Link`,
    description: (profile.bio as string) || `Check out ${profile.username}'s links on Codevora Link.`,
    openGraph: {
      title: `${profile.display_name || profile.username}`,
      description: (profile.bio as string) || 'View all my links on Codevora Link.',
      images: profile.profile_image ? [{ url: profile.profile_image as string }] : [],
    },
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const data = await getProfileData(params.username)
  if (!data) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <PublicProfileClient profile={data.profile as any} links={data.links as any} />
}
