#!/bin/bash
# AI Pictionary 部署脚本

echo "开始部署 AI Pictionary..."

# 1. 拉取最新代码
echo "正在拉取最新代码..."
git pull origin main

# 2. 安装依赖
echo "正在安装依赖..."
pnpm install

# 3. 构建项目
echo "正在构建项目..."
pnpm build

# 4. 启动服务（使用 PM2）
echo "正在启动服务..."
pm2 delete ai-pictionary 2>/dev/null || true
pm2 start "pnpm start" --name ai-pictionary

echo "部署完成！"
echo "访问地址: http://soolr.com 或 http://www.soolr.com"
echo "PM2 状态: pm2 status"
echo "请手动配置 Nginx: cp nginx.conf /etc/nginx/conf.d/ai-pictionary.conf && nginx -t && systemctl reload nginx"
