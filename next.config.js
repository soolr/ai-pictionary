/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 Turbopack（Next.js 16 默认）
  turbopack: {},
  
  // 字体配置 - 使用本地默认字体代替 Google Fonts 避免 SSL 问题
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // webpack 配置保留（用于生产构建）
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;