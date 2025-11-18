/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  output: 'standalone',
  // Cache bust: v2
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig
