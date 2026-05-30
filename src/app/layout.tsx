import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import TelegramInit from '@/components/TelegramInit'

export const metadata: Metadata = {
  title: 'Codevora Link — One link. Infinite possibilities.',
  description:
    'Smart bio-link platform for Ethiopian creators, freelancers, students, and small businesses. Create your profile page today.',
  keywords: 'bio link, linktree alternative, Ethiopia, creator, freelancer, Codevora',
  openGraph: {
    title: 'Codevora Link',
    description: 'One link. Infinite possibilities.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <TelegramInit />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif' },
            success: { iconTheme: { primary: '#F97316', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
