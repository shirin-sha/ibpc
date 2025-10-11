/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compression
  compress: true,
  
  // Powered by header
  poweredByHeader: false,
  
  // React strict mode (development only)
  reactStrictMode: process.env.NODE_ENV === 'development',
  
  // Redirects for old dashboard routes to new structure
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/member',
        permanent: true,
      },
      {
        source: '/dashboard/admin',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/dashboard/profile/:path*',
        destination: '/member/profile/:path*',
        permanent: true,
      },
      {
        source: '/dashboard/members',
        destination: '/member/directory',
        permanent: true,
      },
      {
        source: '/dashboard/change-password',
        destination: '/member/change-password',
        permanent: true,
      },
      {
        source: '/dashboard/admin/registrations',
        destination: '/admin/registrations',
        permanent: true,
      },
      {
        source: '/dashboard/admin/members',
        destination: '/admin/members',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
