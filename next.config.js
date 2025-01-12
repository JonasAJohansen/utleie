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
        'images.clerk.dev',
        'uploadthing.com',
        'utfs.io',
        'x.com',
        'pbs.twimg.com',
        'abs.twimg.com',
        '1wwlyedsoyiqsvkw.public.blob.vercel-storage.com'
      ],
    },
  }
  
  module.exports = nextConfig
  
  