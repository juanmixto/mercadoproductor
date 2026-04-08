/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mercadoproductor/shared'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL ?? 'http://localhost:4000',
  },
}

module.exports = nextConfig
