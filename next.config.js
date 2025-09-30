/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize output
  output: 'standalone',
  
  // Disable build trace collection
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig