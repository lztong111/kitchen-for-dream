#!/bin/bash
set -e

echo "========== Kitchen for Dream 部署脚本 =========="

# 1. 构建前端
echo "[1/4] 构建前端..."
cd client
npm install
npm run build
cd ..
echo "前端构建完成 ✓"

# 2. 安装后端依赖
echo "[2/4] 安装后端依赖..."
cd server
npm install --production
cd ..
echo "后端依赖安装完成 ✓"

# 3. 初始化数据库
echo "[3/4] 初始化数据库..."
cd server
npm run db:migrate
npm run db:seed
cd ..
echo "数据库初始化完成 ✓"

# 4. 配置 Nginx
echo "[4/4] 配置 Nginx..."
sudo cp nginx-kitchen.conf /etc/nginx/sites-available/kitchen
sudo ln -sf /etc/nginx/sites-available/kitchen /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
echo "Nginx 配置完成 ✓"

echo ""
echo "========== 部署完成 =========="
echo "启动后端: cd server && npx tsx src/app.ts"
echo "访问地址: https://kitchen.wgetbt.asia"
echo "================================"
