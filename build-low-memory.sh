#!/bin/bash
# 低内存服务器构建脚本

echo "开始低内存优化构建..."

# 设置 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=1024"

# 清理之前的构建
echo "清理之前的构建..."
rm -rf .next

# 使用 webpack 进行构建
echo "正在构建项目（webpack 模式）..."
pnpm build

if [ $? -eq 0 ]; then
    echo "构建成功！"
    echo "可以启动服务: pm2 start 'pnpm start' --name ai-pictionary"
else
    echo "构建失败！"
    echo "尝试更保守的构建方式..."
    
    # 如果仍然失败，尝试使用 --profile 标志
    export NODE_OPTIONS="--max-old-space-size=512"
    pnpm build --profile
fi