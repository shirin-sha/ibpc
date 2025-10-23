/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
    // Enable modern bundling
    esmExternals: true,
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
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }
    
    return config;
  },
  
  // Redirects for old dashboard routes to new structure
  async redirects() {
    return [
      // Backward-compat for old image paths that had an extra /uploads segment
      {
        source: '/profileimages/uploads/:file*',
        destination: '/profileimages/:file*',
        permanent: true,
      },
      {
        source: '/companylogos/uploads/:file*',
        destination: '/companylogos/:file*',
        permanent: true,
      },
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
