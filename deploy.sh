#!/bin/bash
# AI Pictionary 部署脚本（低内存优化版）

# 启动服务（使用 PM2）
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
