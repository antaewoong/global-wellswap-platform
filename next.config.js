/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental에서 appDir 제거
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
