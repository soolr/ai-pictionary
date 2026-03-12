# AI 你画我猜 - 项目规范

## 1. 项目概述

- **项目名称**: AI Pictionary (你画我猜)
- **项目类型**: Web 游戏
- **核心功能**: 玩家在画布上作画，AI (pollinations.ai) 实时猜测画作内容
- **目标用户**: 休闲游戏玩家

## 2. UI/UX 规范

### 布局结构
- **页面组成**:
  - 顶部标题栏 (高度: 64px)
  - 主游戏区域 (居中)
    - 画布区域 (600x450px)
    - 工具栏 (画笔颜色/粗细/橡皮擦/清除)
    - AI 猜测结果显示区
  - 底部控制区 (开始识别/重新开始按钮)

### 视觉设计
- **配色方案**:
  - 背景: #1a1a2e (深紫蓝)
  - 卡片背景: #16213e (深蓝)
  - 主色调: #e94560 (珊瑚红)
  - 辅助色: #0f3460 (深蓝)
  - 文字: #eaeaea (浅灰白)
  - 画布背景: #ffffff (白色)
- **字体**:
  - 标题: "ZCOOL KuaiLe", cursive (有趣的中文字体)
  - 正文: "Noto Sans SC", sans-serif
- **间距**:
  - 组件间距: 16px
  - 内边距: 24px
- **效果**:
  - 按钮悬停: scale(1.05) + 阴影
  - 卡片: 圆角 16px + 微妙阴影

### 组件
1. **画布组件**
   - 支持鼠标/触摸绘画
   - 可调节画笔颜色 (预设8色)
   - 可调节画笔粗细 (3档: 细/中/粗)
   - 橡皮擦功能
   - 清除画布按钮

2. **工具栏**
   - 颜色选择器 (圆形按钮)
   - 粗细滑块
   - 橡皮擦切换
   - 清除按钮

3. **AI 猜测面板**
   - 显示当前猜测结果
   - 猜测历史记录
   - 置信度显示

4. **控制按钮**
   - "开始识别" 按钮 (主按钮)
   - "重新开始" 按钮 (次按钮)

## 3. 功能规范

### 核心功能
1. **绘画功能**
   - Canvas 2D 绘图
   - 平滑线条 (quadraticCurveTo)
   - 支持撤销 (Ctrl+Z)

2. **AI 识别功能**
   - 捕获 Canvas 内容为 base64 图片
   - 调用 Gemini API (直接 HTTP 请求)
   - 显示识别结果和置信度

3. **游戏流程**
   - 玩家开始作画 → 点击"开始识别" → AI 猜测 → 显示结果
   - 支持多次识别迭代

### API 集成
- **端点**: `https://gen.pollinations.ai/v1/chat/completions`
- **请求方式**: POST
- **认证**: API Key (从 https://enter.pollinations.ai 获取)
- **模型**: claude-airforce (支持图像识别)
- **请求体**:
```json
{
  "model": "claude-airforce",
  "messages": [{
    "role": "user",
    "content": [
      { "type": "text", "text": "用一句话简短中文描述这张图片画的是什么" },
      { "type": "image_url", "image_url": { "url": "data:image/png;base64,<base64图片数据>", "detail": "low" } }
    ]
  }],
  "max_tokens": 500,
  "seed": <随机数>
}
```

### 边缘情况
- API Key 未配置时显示提示
- 网络错误显示重试选项
- 空画布识别时提示"请先作画"
- API 响应为空时显示错误信息
- 支持撤销操作 (Ctrl+Z)

## 4. 验收标准

- [x] 画布可以正常绘画 (支持多种颜色和粗细)
- [x] 工具栏功能正常 (颜色/粗细/橡皮擦/清除)
- [x] AI 识别按钮可以触发 API 调用
- [x] 识别结果正确显示
- [x] 响应式布局 (移动端适配)
- [x] 优雅的错误处理
- [x] 支持撤销操作 (Ctrl+Z)
- [x] 画布历史记录管理

## 5. Nginx 配置规范 (基于宝塔面板标准)

### 5.1 配置文件标准
基于 `baota.nginx.conf` 编写主配置文件，确保以下结构和内容一致：

#### 全局配置
- `user www www;`
- `worker_processes auto;`
- `error_log /www/wwwlogs/nginx_error.log crit;`
- `pid /www/server/nginx/logs/nginx.pid;`
- `worker_rlimit_nofile 51200;`

#### Stream 模块配置
- 日志格式 `tcp_format`
- TCP 访问日志和错误日志
- 包含 `/www/server/panel/vhost/nginx/tcp/*.conf`

#### Events 模块配置
- `use epoll;`
- `worker_connections 51200;`
- `multi_accept on;`

#### HTTP 模块配置
**全局设置**
- `include mime.types;`
- `#include luawaf.conf;`
- `include proxy.conf;`
- `lua_package_path "/www/server/nginx/lib/lua/?.lua;;";`
- `default_type application/octet-stream;`

**性能优化**
- `server_names_hash_bucket_size 512;`
- `client_header_buffer_size 32k;`
- `large_client_header_buffers 4 32k;`
- `client_max_body_size 50m;`
- `sendfile on;`
- `tcp_nopush on;`
- `keepalive_timeout 60;`
- `tcp_nodelay on;`

**FastCGI 设置**
- `fastcgi_connect_timeout 300;`
- `fastcgi_send_timeout 300;`
- `fastcgi_read_timeout 300;`
- `fastcgi_buffer_size 64k;`
- `fastcgi_buffers 4 64k;`
- `fastcgi_busy_buffers_size 128k;`
- `fastcgi_temp_file_write_size 256k;`
- `fastcgi_intercept_errors on;`

**Gzip 压缩**
- `gzip on;`
- `gzip_min_length 1k;`
- `gzip_buffers 4 16k;`
- `gzip_http_version 1.1;`
- `gzip_comp_level 5;`
- `gzip_types` 包含常见 MIME 类型
- `gzip_vary on;`
- `gzip_proxied expired no-cache no-store private auth;`
- `gzip_disable "MSIE [1-6]\.";`

**限制设置**
- `limit_conn_zone $binary_remote_addr zone=perip:10m;`
- `limit_conn_zone $server_name zone=perserver:10m;`

**其他设置**
- `server_tokens off;`
- `access_log off;`

#### Server 块配置
- 监听 888 端口 (phpmyadmin)
- 包含 `enable-php.conf`
- 静态资源缓存设置
- 隐藏文件访问限制

#### 包含配置
- `include /www/server/panel/vhost/nginx/*.conf;`

### 5.2 现有 nginx.conf 需要改进的地方
1. 缺少全局配置 (user, worker_processes 等)
2. 缺少 Stream 模块
3. Events 模块配置不完整
4. HTTP 模块缺少大量性能优化参数
5. 缺少 FastCGI、Gzip、限制等配置
6. 缺少 phpmyadmin server 块
7. 缺少 include 语句

### 5.3 目标
编写一个完整的 nginx.conf，包含 baota.nginx.conf 的所有配置，同时保留现有 Next.js 应用的配置。

### 5.4 配置完成状态
- [x] 全局配置 (user, worker_processes, error_log, pid, worker_rlimit_nofile)
- [x] Stream 模块配置 (tcp_format 日志格式, 访问/错误日志, 包含 tcp/*.conf)
- [x] Events 模块配置 (use epoll, worker_connections, multi_accept)
- [x] HTTP 模块全局设置 (mime.types, proxy.conf, lua_package_path, default_type)
- [x] 性能优化参数 (server_names_hash_bucket_size, client_header_buffer_size, etc.)
- [x] FastCGI 设置 (timeout, buffer sizes, intercept_errors)
- [x] Gzip 压缩配置 (on, level, types, vary, proxied, disable)
- [x] 限制设置 (limit_conn_zone)
- [x] 其他设置 (server_tokens off, access_log off)
- [x] PHPMyAdmin Server 块 (888 端口)
- [x] Next.js 应用配置 (80/443 端口, SSL, 代理配置)
- [x] 包含宝塔面板虚拟主机配置

## 6. 项目状态更新 (2026-03-12)

### 已完成功能
1. **绘画功能**
   - Canvas 2D 绘图支持
   - 平滑线条绘制
   - 8种预设颜色选择
   - 3档画笔粗细调节
   - 橡皮擦功能
   - 清除画布功能
   - 撤销操作 (Ctrl+Z)
   - 历史记录管理

2. **AI 识别功能**
   - 调用 pollinations.ai API
   - 实时图像识别
   - 结果显示和历史记录
   - 错误处理和重试机制

3. **UI/UX**
   - 响应式设计
   - 深色主题配色
   - 交互式按钮效果
   - 移动端适配

### 技术实现
- **前端框架**: Next.js 16.1.6 + React 19.2.3
- **样式**: Tailwind CSS 4
- **类型检查**: TypeScript 5
- **API 端点**: `/api/ai/guess`
- **AI 模型**: claude-airforce (通过 pollinations.ai)

### 已完成功能更新
1. **置信度显示**
   - API 返回识别结果的置信度分数
   - 前端 UI 显示置信度百分比和进度条

2. **UI 界面优化**
   - 更新配色方案：深蓝背景 + 靛蓝主色调
   - 优化布局结构：卡片式设计 + 阴影效果
   - 增加交互效果：按钮悬停动画、过渡效果
   - 画布增加阴影和网格背景
   - 工具栏重新设计，图标化按钮

### 待优化项
1. 支持更多画笔颜色自定义
2. 画布导出功能
3. 性能优化 (减少 API 调用频率)

### 部署步骤
1. 构建项目: `npm run build`
2. 启动服务: `npm start` (端口 3000)
3. 配置 Nginx 反向代理
4. 测试配置: `nginx -t`
5. 重载 Nginx: `nginx -s reload`
6. 配置防火墙开放 80/443 端口

### 端口重定向说明
- **80端口**: HTTP 请求自动重定向到 443 端口 (HTTPS)
- **443端口**: HTTPS 服务端口，处理所有安全连接
- **重定向规则**: 使用 301 永久重定向，提升 SEO 和用户体验

### 服务器目录结构
- **代码目录**: `/www/wwwroot/ai-pictionary`
- **项目路径**: `/www/wwwroot/ai-pictionary/`
- **构建输出**: `/www/wwwroot/ai-pictionary/.next/`
- **日志目录**: `/www/wwwroot/ai-pictionary/logs/`
- **环境变量**: `/www/wwwroot/ai-pictionary/.env`
- **证书目录**: `/www/wwwroot/cert/`
  - `soolr.com.key` - SSL 私钥文件
  - `soolr.com.pem` - SSL 证书文件

### 注意事项
- 确保 Next.js 服务在 Nginx 启动前已运行
- API Key 需要在环境变量中配置
- 建议使用 PM2 或 systemd 管理 Node.js 进程
- 定期检查 SSL 证书有效期

## 7. 更新记录 (2026-03-13)

### 服务器目录状态
- **本地开发目录**: `D:\Develop\ai-pictionary` (Windows)
- **服务器代码目录**: `/www/wwwroot/ai-pictionary` (Linux)
- **状态**: 使用 GitHub 同步代码，服务器已配置 Git 仓库

### GitHub 同步代码流程

#### 1. 本地推送代码到 GitHub
```bash
# 在本地 Windows 环境
cd D:\Develop\ai-pictionary

# 添加所有更改
git add .

# 提交更改
git commit -m "更新部署配置"

# 推送到 GitHub
git push origin main
```

#### 2. 服务器拉取代码
```bash
# 在服务器上
cd /www/wwwroot/ai-pictionary

# 确保 Git 仓库已配置远程 origin
git remote -v
# 如果没有配置，添加远程仓库：
# git remote add origin https://github.com/your-username/ai-pictionary.git

# 拉取最新代码
git pull origin main
```

### 待办事项
- [x] 本地构建项目 (`pnpm build`) - 成功
- [x] 本地 ESLint 检查 - 通过
- [x] 配置 GitHub 同步代码
- [x] 手动配置 Nginx 反向代理 - 已完成
- [x] 重启 Nginx - 已完成 (用户操作)
- [ ] 在服务器上拉取最新代码
- [ ] 重新构建项目 (`pnpm build`)
- [ ] 启动 Next.js 服务
- [ ] 测试 HTTPS 访问

### 服务器操作指令

#### 方法一：使用 deploy.sh（推荐）
```bash
cd /www/wwwroot/ai-pictionary
./deploy.sh
```

#### 方法二：手动执行
```bash
cd /www/wwwroot/ai-pictionary

# 1. 拉取最新代码
git pull origin main

# 2. 安装依赖（如果 package.json 有变化）
pnpm install

# 3. 重新构建项目（关键步骤，解决 404 问题）
pnpm build

# 4. 启动服务
pm2 delete ai-pictionary 2>/dev/null || true
pm2 start "pnpm start" --name ai-pictionary
pm2 save
```

### 部署步骤（GitHub 同步）
1. **本地推送代码**：将更改推送到 GitHub
2. **服务器拉取代码**：`git pull origin main`
3. **安装依赖**：`pnpm install`（如果 package.json 有变化）
4. **构建项目**：`pnpm build`（解决 `.next` 目录问题）
5. **配置 Nginx**：已配置完成
6. **启动服务**：`pm2 start "pnpm start" --name ai-pictionary`

### 注意
- Nginx 配置文件已准备：`nginx.conf`
- SSL 证书目录：`/www/wwwroot/cert/`
- 服务器代码目录：`/www/wwwroot/ai-pictionary`
- 服务器使用 deploy.sh 启动服务
- **重要**：每次代码更新后，必须在服务器上重新运行 `pnpm build`

## 8. Deploy.sh 部署脚本

### 脚本功能
deploy.sh 是服务器部署脚本，包含以下功能：
1. 拉取最新代码 (`git pull origin main`)
2. 安装依赖 (`pnpm install`)
3. 构建项目 (`pnpm build`)
4. 使用 PM2 启动服务
5. 显示部署完成信息

### 使用方法
在服务器上执行：
```bash
cd /www/wwwroot/ai-pictionary
./deploy.sh
```

### 脚本内容
```bash
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
```

### 注意事项
- 确保服务器已安装 pnpm 和 PM2
- 确保有正确的 Git 权限拉取代码
- Nginx 配置需要手动执行（脚本中已提示）
