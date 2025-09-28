/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
      ignoreDuringBuilds: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
        },
      ],
      dangerouslyAllowSVG: true,
      contentDispositionType: 'attachment',
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
      unoptimized: false,
      loader: 'default',
      minimumCacheTTL: 300,
      formats: ['image/webp', 'image/avif'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    serverExternalPackages: ['bufferutil', 'utf-8-validate'],
    webpack: (config, { isServer }) => {
      // This allows WebSocket connections to the API routes
      if (isServer) {
        config.externals.push({
          bufferutil: 'bufferutil',
          'utf-8-validate': 'utf-8-validate',
        })
      }
      
      return config
    },
  }
  
  module.exports = nextConfig
  
  