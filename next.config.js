/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 13 configuration
  experimental: {
    // Disable build trace collection
    buildTrace: false,
  },
  
  // Optimize output
  output: 'standalone',
  
  // Disable build trace collection
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  
  // Optimize images
  images: {
    domains: ['picsum.photos'],
    formats: ['image/webp', 'image/avif'],
  },
}

module.exports = nextConfig