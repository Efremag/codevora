/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Exclude server-only Node.js packages from client bundle
    serverComponentsExternalPackages: ['mysql2', 'bcryptjs'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
}

module.exports = nextConfig
