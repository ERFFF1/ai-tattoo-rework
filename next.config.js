/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize output
  output: 'standalone',
  
  // Reduce bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Optimize images
  images: {
    domains: ['picsum.photos'],
    formats: ['image/webp', 'image/avif'],
  },
}

module.exports = nextConfig