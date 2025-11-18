/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Disable static optimization to prevent SSR issues with SessionProvider
  output: 'standalone',
}

module.exports = nextConfig
