/** @type {import('next').NextConfig} */
const nextConfig = {
  // 优化构建性能
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 图片优化配置
  images: {
    unoptimized: true, // 禁用图片优化以减少内存使用
  },
  
  // 生产环境优化
  productionBrowserSourceMaps: false,
  
  // 明确使用 webpack（而不是 Turbopack）
  webpack: (config, { isServer }) => {
    // 减少内存占用
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