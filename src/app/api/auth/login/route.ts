import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find user
    const users = await query<Array<{
      id: number
      email: string
      password_hash: string
      is_active: boolean
      is_admin: boolean
    }>>(
      'SELECT id, email, password_hash, is_active, is_admin FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    )

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const user = users[0]

    if (!user.is_active) {
      return NextResponse.json({ error: 'Your account has been deactivated. Contact support.' }, { status: 403 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Sign JWT
    const token = await signToken({ userId: user.id, email: user.email, isAdmin: user.is_admin })
    const cookieStore = cookies()
    cookieStore.set('codevora_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      data: { isAdmin: user.is_admin },
      message: 'Login successful',
    })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
