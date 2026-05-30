import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { validateEmail, validatePassword, validateUsername, sanitizeUsername } from '@/lib/utils'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, username } = body

    // Validate inputs
    if (!email || !password || !username) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (!validatePassword(password)) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }
    const cleanUsername = sanitizeUsername(username)
    if (!validateUsername(cleanUsername)) {
      return NextResponse.json(
        { error: 'Username must be 3-30 characters, letters/numbers/- and _ only' },
        { status: 400 }
      )
    }

    // Check duplicates
    const existingEmail = await query<unknown[]>(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    )
    if ((existingEmail as unknown[]).length > 0) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 409 })
    }

    const existingUsername = await query<unknown[]>(
      'SELECT id FROM profiles WHERE username = ?',
      [cleanUsername]
    )
    if ((existingUsername as unknown[]).length > 0) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user (plan_id 1 = Free)
    const result = await query<{ insertId: number }>(
      'INSERT INTO users (email, password_hash, plan_id) VALUES (?, ?, 1)',
      [email.toLowerCase().trim(), passwordHash]
    )
    const userId = (result as { insertId: number }).insertId

    // Create profile
    await query(
      'INSERT INTO profiles (user_id, username, display_name) VALUES (?, ?, ?)',
      [userId, cleanUsername, cleanUsername]
    )

    // Sign JWT and set cookie
    const token = await signToken({ userId, email: email.toLowerCase().trim(), isAdmin: false })
    const cookieStore = cookies()
    cookieStore.set('codevora_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json(
      { success: true, message: 'Account created successfully' },
      { status: 201 }
    )
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
