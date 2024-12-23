/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
      ignoreDuringBuilds: true,
    },
    images: {
      domains: [
        'images.unsplash.com',
        'img.clerk.com',
        'uploadthing.com',
        'utfs.io',
        'x.com',
        'pbs.twimg.com',
        'abs.twimg.com'
      ],
    },
  }
  
  module.exports = nextConfig
  
  