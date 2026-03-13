#!/bin/bash
# AI Pictionary 部署脚本

# 设置错误处理
set -e

# 确保脚本有执行权限（如果在上传过程中丢失）
chmod +x "$0" 2>/dev/null || true

# 拉取最新代码
echo "正在拉取最新代码..."
echo "重置 deploy.sh 以避免合并冲突..."
git checkout -- deploy.sh || true
git pull origin main

# 确保脚本有执行权限
chmod 777 deploy.sh

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo "错误: pnpm 未安装，请先安装 pnpm"
    echo "安装命令: npm install -g pnpm"
    exit 1
fi

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "错误: PM2 未安装，请先安装 PM2"
    echo "安装命令: npm install -g pm2"
    exit 1
fi

# 进入项目目录
cd /www/wwwroot/ai-pictionary

# 检查构建产物是否存在
echo "检查构建产物..."
if [ ! -d ".next" ]; then
    echo "错误: 未找到 .next 目录，请确保代码已包含构建产物"
    exit 1
fi

# 检查必需的环境变量
echo "检查环境变量..."
if [ -z "$DATABASE_URL" ]; then
    echo "警告: DATABASE_URL 环境变量未设置"
fi

# 检查并加载 .env.production 文件
echo "检查环境变量配置文件..."
if [ -f ".env.production" ]; then
    echo "✓ 发现 .env.production 文件，正在加载环境变量..."
    # 读取文件并导出环境变量（忽略注释和空行）
    export $(grep -v '^#' .env.production | xargs)
    echo "✓ 环境变量加载完成"
    
    # 验证关键环境变量
    if [ -z "$POLLINATIONS_API_KEY" ]; then
        echo "⚠ 警告: POLLINATIONS_API_KEY 未在 .env.production 中设置"
    else
        echo "✓ POLLINATIONS_API_KEY 已加载"
    fi
else
    echo "⚠ 警告: 未找到 .env.production 文件"
    echo "⚠ 请手动上传 .env.production 文件到 /www/wwwroot/ai-pictionary/"
    echo "⚠ 文件内容示例:"
    echo "   POLLINATIONS_API_KEY=sk_06KzQvxgqD81wEka19HjYBCwnmwa3DLF"
    echo "⚠ 继续运行（可能导致服务启动失败）..."
fi

# 安装依赖（生产环境）
echo "正在安装依赖..."
pnpm install --production

# 停止现有服务
echo "停止现有服务..."
pm2 delete ai-pictionary 2>/dev/null || true

# 启动服务（使用 PM2）
echo "正在启动服务..."
pm2 delete ai-pictionary 2>/dev/null || true
# 使用 shell 启动以继承环境变量
pm2 start "bash -c 'pnpm start'" --name ai-pictionary
pm2 save

# 等待服务启动
echo "等待服务启动..."
sleep 5

# 检查服务状态
echo "检查服务状态..."
if pm2 status | grep -q "ai-pictionary"; then
    echo "服务启动成功"
else
    echo "错误: 服务启动失败"
    exit 1
fi

echo "部署完成！"
echo "访问地址: http://soolr.com 或 http://www.soolr.com"
echo "PM2 状态: pm2 status"
echo "Nginx 配置已准备: /www/wwwroot/ai-pictionary/nginx.conf"
echo "如需更新 Nginx 配置:"
echo "  cp /www/wwwroot/ai-pictionary/nginx.conf /etc/nginx/conf.d/ai-pictionary.conf"
echo "  nginx -t && systemctl reload nginx"
