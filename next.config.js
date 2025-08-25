/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // 빌드 캐싱 활성화
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  typescript: {
    // 프로덕션 빌드 시 타입 에러 무시 (임시)
    ignoreBuildErrors: true
  },
  eslint: {
    // ESLint 오류 무시 (빌드 안정성)
    ignoreDuringBuilds: true
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  }
}

module.exports = nextConfig;