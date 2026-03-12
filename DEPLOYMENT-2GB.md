# AI Pictionary 2GB 内存服务器部署指南

## 问题说明

Next.js 16.1.6 默认使用 Turbopack，在 2GB 内存的服务器上构建时会出现 "已杀死" 错误。

## 解决方案

### 1. 本地代码更新

在本地 Windows 环境执行以下操作：

#### 1.1 更新 package.json
确保构建命令使用 webpack：
```json
"scripts": {
  "build": "next build --webpack"
}
```

#### 1.2 创建 next.config.js
确保配置使用 webpack：
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    unoptimized: true,
  },
  productionBrowserSourceMaps: false,
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
```

#### 1.3 推送代码到 GitHub
```cmd
git add .
git commit -m "使用 webpack 构建，支持 2GB 内存服务器"
git push origin main
```

### 2. 服务器部署步骤

#### 2.1 拉取最新代码
```bash
cd /www/wwwroot/ai-pictionary
git pull origin main
```

#### 2.2 设置内存限制
```bash
export NODE_OPTIONS="--max-old-space-size=1024"
```

#### 2.3 清理旧构建
```bash
rm -rf .next
```

#### 2.4 安装依赖
```bash
pnpm install
```

#### 2.5 构建项目（关键步骤）
```bash
# 方法一：使用 webpack 模式（推荐）
pnpm build

# 方法二：如果内存仍然不足，使用更保守的内存限制
export NODE_OPTIONS="--max-old-space-size=512"
pnpm build --profile
```

#### 2.6 启动服务
```bash
pm2 delete ai-pictionary 2>/dev/null || true
pm2 start "pnpm start" --name ai-pictionary
pm2 save
```

### 3. 使用部署脚本

服务器上的 `deploy.sh` 已经更新为使用 webpack 构建：

```bash
cd /www/wwwroot/ai-pictionary
./deploy.sh
```

## 故障排除

### 问题 1: 构建仍然被杀死

**解决方案**：
```bash
# 使用更保守的内存限制
export NODE_OPTIONS="--max-old-space-size=512"

# 清理缓存
rm -rf node_modules/.cache

# 重新构建
pnpm build --profile
```

### 问题 2: 磁盘空间不足

**检查磁盘空间**：
```bash
df -h
```

**清理旧文件**：
```bash
# 清理旧的构建文件
rm -rf .next

# 清理 npm 缓存
pnpm store prune
```

### 问题 3: PM2 进程不断重启

**检查日志**：
```bash
pm2 logs ai-pictionary --lines 50
```

**重启服务**：
```bash
pm2 delete ai-pictionary
pm2 start "pnpm start" --name ai-pictionary
pm2 save
```

## 验证部署

### 1. 检查服务状态
```bash
pm2 status
```

### 2. 查看应用日志
```bash
pm2 logs ai-pictionary
```

### 3. 测试访问
```bash
curl -I http://localhost:3000
```

### 4. 检查 Nginx 配置
```bash
nginx -t
systemctl status nginx
```

## 总结

对于 2GB 内存的服务器，关键优化点：

1. ✅ 使用 webpack 构建：`pnpm build`（而不是 Turbopack）
2. ✅ 设置内存限制：`export NODE_OPTIONS="--max-old-space-size=1024"`
3. ✅ 清理旧构建：`rm -rf .next`
4. ✅ 使用 Next.js 配置优化

按照以上步骤，您的 2GB 内存服务器应该能够成功构建并运行 AI Pictionary 应用。