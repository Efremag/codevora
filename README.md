# Codevora Link

**One link. Infinite possibilities.**

Smart bio-link platform for Ethiopian creators, freelancers, students, and small businesses — built by **Codevora Forge**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | MySQL (mysql2) |
| Auth | JWT (jose) + bcryptjs |
| Forms | react-hook-form |
| Icons | lucide-react + custom SVG |
| Toasts | react-hot-toast |

---

## Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

---

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=codevora_link
JWT_SECRET=your_long_random_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up the database

Open MySQL and run:

```sql
source database/schema.sql
```

Or using the CLI:

```bash
mysql -u root -p < database/schema.sql
```

This creates the database, all tables, seeds pricing plans, and creates the default admin user.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Default Admin Account

After running the SQL schema:

| Field | Value |
|-------|-------|
| Email | `admin@codevora.com` |
| Password | `Admin@123456` |

> ⚠️ Change the admin password after first login in production.

---

## Project Structure

```
codevora-link/
├── database/
│   └── schema.sql              # Full database schema + seed data
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/          # Login page
│   │   │   └── register/       # Registration page
│   │   ├── dashboard/          # Protected dashboard
│   │   ├── admin/              # Admin panel (admin-only)
│   │   ├── u/[username]/       # Public profile pages
│   │   ├── api/
│   │   │   ├── auth/           # register, login, logout, me
│   │   │   ├── profile/        # GET/PATCH user profile
│   │   │   ├── links/          # CRUD links
│   │   │   ├── analytics/      # Click/view analytics
│   │   │   ├── track/[linkId]  # Click tracking endpoint
│   │   │   └── admin/          # Admin user management
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Landing page
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/Icons.tsx        # All social icons
│   │   └── landing/            # Landing page sections
│   ├── lib/
│   │   ├── db.ts               # MySQL connection pool
│   │   ├── auth.ts             # JWT helpers
│   │   └── utils.ts            # Validators & utilities
│   ├── middleware.ts            # Route protection
│   └── types/index.ts          # TypeScript types
├── .env.example
├── .env.local                  # Your local config (gitignored)
└── package.json
```

---

## Features

### Landing Page
- Hero section with mobile mockup
- Features section
- Pricing plans (Free / Pro / Business)
- FAQ accordion
- Call to action
- Codevora Forge footer

### Authentication
- Register with email, password, username
- Login with JWT cookie session (7 days)
- Password hashing with bcrypt (12 rounds)
- Protected routes via Next.js middleware

### Dashboard
- Edit display name, bio, username, profile image
- Add / delete links with icon selection
- Toggle links active/inactive
- Choose theme color (8 presets + color picker)
- See public profile URL + copy button
- Stats: total clicks, profile views, today's clicks
- Analytics tab (Pro)

### Public Profile (/u/[username])
- Profile image / avatar initials
- Custom theme color header
- Clickable link buttons with icons
- Click tracking with IP + user agent logging
- View counting
- "Powered by Codevora Link" footer

### Admin Panel (/admin)
- Platform-wide stats dashboard
- View all users in a table
- Change user plan (Free/Pro/Business)
- Activate / deactivate users
- View user profiles

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `plans` | Pricing tiers (Free, Pro, Business) |
| `users` | User accounts + plan assignment |
| `profiles` | Public profile data |
| `links` | User links |
| `link_clicks` | Per-click analytics |
| `profile_views` | Profile view tracking |

---

## Pricing Plans

| Plan | Price | Links | Analytics | Custom Themes |
|------|-------|-------|-----------|---------------|
| Free | 0 ETB | 5 | ❌ | ❌ |
| Pro | 199 ETB/mo | ∞ | ✅ | ✅ |
| Business | 499 ETB/mo | ∞ | ✅ | ✅ |

> 💳 Chapa & Telebirr payment integration is ready to plug in — add keys in `.env.local`.

---

## Deployment

### Build for production

```bash
npm run build
npm start
```

### Environment Variables for Production

```env
DB_HOST=your_production_db_host
DB_PASSWORD=strong_password
JWT_SECRET=very_long_random_string_minimum_32_chars
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

---

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens stored in httpOnly cookies
- SQL injection prevented via parameterized queries
- CSRF protection via SameSite cookie policy
- Input validation on all API routes
- Admin routes protected server-side + middleware
- Username/URL sanitization

---

## Adding Chapa Payment

1. Get your Chapa API keys at [chapa.co](https://chapa.co)
2. Add to `.env.local`:
   ```env
   CHAPA_SECRET_KEY=your_key
   CHAPA_PUBLIC_KEY=your_public_key
   ```
3. Create `/api/payment/chapa/route.ts` to initiate payment
4. Create `/api/payment/chapa/verify/route.ts` for webhook
5. On success: call `UPDATE users SET plan_id = 2 WHERE id = ?`

---

**Codevora Link** — by Codevora Forge
