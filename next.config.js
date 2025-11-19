/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  output: 'standalone',
  // Disable static page generation to avoid SessionProvider build errors
  outputFileTracingRoot: process.cwd(),
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Skip static optimization
  distDir: '.next',
}

module.exports = nextConfig
