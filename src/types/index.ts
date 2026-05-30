export interface User {
  id: number
  email: string
  plan_id: number
  is_active: boolean
  is_admin: boolean
  plan_slug: string
  plan_name: string
  max_links: number
  has_analytics: boolean
  has_custom_themes: boolean
  created_at?: string
}

export interface Profile {
  id: number
  user_id: number
  username: string
  display_name: string
  bio: string
  profile_image: string | null
  theme_color: string
  background_style: 'solid' | 'gradient' | 'image'
  background_value: string
  is_public: boolean
  total_views: number
  created_at?: string
}

export interface Link {
  id: number
  user_id: number
  title: string
  url: string
  icon_type: string
  sort_order: number
  is_active: boolean
  click_count: number
  created_at?: string
}

export interface Plan {
  id: number
  name: string
  slug: string
  max_links: number
  has_analytics: boolean
  has_custom_themes: boolean
  has_custom_domain: boolean
  price_birr: number
  price_usd: number
  is_active: boolean
}

export interface Analytics {
  total_clicks: number
  total_views: number
  clicks_today: number
  views_today: number
  top_links: Array<{ title: string; click_count: number }>
  clicks_by_day: Array<{ date: string; count: number }>
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
