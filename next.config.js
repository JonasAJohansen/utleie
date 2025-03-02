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
  
  