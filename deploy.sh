#!/bin/bash
# AI Pictionary 部署脚本（低内存优化版）

echo "开始部署 AI Pictionary..."

# 设置 Node.js 内存限制（针对 2GB 内存服务器）
export NODE_OPTIONS="--max-old-space-size=1024"

# 1. 检查是否在 Git 仓库中
if [ -d ".git" ]; then
    echo "正在拉取最新代码..."
    git pull origin main
else
    echo "当前目录不是 Git 仓库，跳过代码拉取"
fi

# 2. 安装依赖
echo "正在安装依赖..."
pnpm install

# 3. 清理之前的构建
echo "清理之前的构建..."
rm -rf .next

# 4. 构建项目（使用 webpack，降低内存使用）
echo "正在构建项目（webpack 模式）..."
pnpm build

if [ $? -ne 0 ]; then
    echo "构建失败，尝试更保守的配置..."
    export NODE_OPTIONS="--max-old-space-size=512"
    pnpm build --no-turbo
fi

# 5. 启动服务（使用 PM2）
echo "正在启动服务..."
pm2 delete ai-pictionary 2>/dev/null || true
pm2 start "pnpm start" --name ai-pictionary
pm2 save

echo "部署完成！"
echo "访问地址: http://soolr.com 或 http://www.soolr.com"
echo "PM2 状态: pm2 status"
echo "Nginx 配置已准备: /www/wwwroot/ai-pictionary/nginx.conf"
echo "如需更新 Nginx 配置:"
echo "  cp /www/wwwroot/ai-pictionary/nginx.conf /etc/nginx/conf.d/ai-pictionary.conf"
echo "  nginx -t && systemctl reload nginx"
