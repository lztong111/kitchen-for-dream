# Kitchen for Dream - 菜谱管理系统

一个全栈菜谱管理应用，支持菜品录入、制作步骤管理、食材清单、图片上传等功能。未登录用户可自由浏览所有菜品，登录后可发布和管理自己的菜谱。

## 功能特性

- **菜品浏览** - 卡片式展示，支持分页浏览
- **搜索筛选** - 按名称搜索，按分类、难度、标签筛选
- **菜品管理** - 创建、编辑、删除菜品（需登录）
- **制作步骤** - 支持多步骤，每步可附带图片说明
- **食材清单** - 从预设食材库选择，自定义用量和单位
- **分类系统** - 16 种预设菜系分类（家常菜、川菜、粤菜等）
- **标签功能** - 自定义标签，按标签筛选菜品
- **难度评级** - 1-5 星难度等级
- **图片上传** - 支持菜品封面图和步骤图片上传（最大 5MB）
- **用户系统** - 注册/登录，JWT 认证，只能管理自己发布的菜品

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + TypeScript + Vite + Tailwind CSS 4 |
| UI 组件 | Lucide React 图标库 |
| 状态管理 | Zustand |
| 路由 | React Router v7 |
| 后端 | Express.js + TypeScript |
| 数据库 | SQLite（better-sqlite3） |
| ORM | Drizzle ORM |
| 认证 | JWT + bcryptjs |
| 文件上传 | Multer |

## 项目结构

```
kitchen-for-dream/
├── client/                      # 前端 React 应用
│   ├── src/
│   │   ├── api/index.ts         # Axios 请求封装（自动附加 Token）
│   │   ├── components/
│   │   │   ├── layout/Layout.tsx    # 导航栏布局
│   │   │   ├── dish/DishCard.tsx    # 菜品卡片组件
│   │   │   └── ui/                  # 通用组件（StarRating、Loading）
│   │   ├── pages/
│   │   │   ├── Home.tsx             # 首页（搜索 + 筛选 + 分页）
│   │   │   ├── DishDetail.tsx       # 菜品详情页
│   │   │   ├── DishEditor.tsx       # 发布/编辑菜品
│   │   │   ├── Login.tsx            # 登录页
│   │   │   └── Register.tsx         # 注册页
│   │   └── stores/auth.ts           # 用户状态管理
│   ├── vite.config.ts               # Vite 配置（API 代理）
│   └── package.json
│
├── server/                      # 后端 Express 服务
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts            # Drizzle ORM 表结构定义
│   │   │   ├── index.ts             # 数据库连接
│   │   │   ├── migrate.ts           # 数据库迁移脚本
│   │   │   └── seed.ts              # 初始数据（分类 + 食材）
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT 认证中间件
│   │   │   └── upload.ts            # Multer 文件上传中间件
│   │   ├── routes/
│   │   │   ├── auth.ts              # 注册/登录/获取用户信息
│   │   │   ├── dishes.ts            # 菜品 CRUD（含步骤/食材/标签）
│   │   │   ├── options.ts           # 分类/食材/标签查询
│   │   │   └── upload.ts            # 图片上传接口
│   │   └── app.ts                   # Express 入口
│   ├── .env                         # 环境变量
│   └── package.json
│
├── shared/types.ts              # 共享 TypeScript 类型定义
├── nginx-kitchen.conf           # Nginx 配置文件
└── deploy.sh                    # 部署脚本
```

---

## 本地开发

### 环境要求

- Node.js >= 18
- npm >= 9

### 1. 克隆项目

```bash
git clone https://github.com/lztong111/kitchen-for-dream.git
cd kitchen-for-dream
```

### 2. 安装依赖

```bash
# 安装根依赖
npm install

# 安装后端依赖
cd server && npm install && cd ..

# 安装前端依赖
cd client && npm install && cd ..
```

### 3. 初始化数据库

```bash
cd server

# 创建数据库表结构
npm run db:migrate

# 导入预设数据（16 种分类 + 28 种食材）
npm run db:seed

cd ..
```

### 4. 启动开发服务器

**方式一：分别启动（推荐调试时使用）**

```bash
# 终端 1：启动后端（端口 8888）
cd server && npm run dev

# 终端 2：启动前端（端口 5173）
cd client && npm run dev
```

**方式二：同时启动**

```bash
npm run dev
```

### 5. 访问应用

| 服务 | 地址 |
|------|------|
| 前端页面 | http://localhost:5173 |
| 后端 API | http://localhost:8888/api |

---

## 服务器部署

### 环境要求

- Node.js >= 18
- Nginx（已安装）
- PM2（进程管理）

### 部署步骤

#### 1. 安装 Node.js 和 PM2

```bash
# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PM2
npm install -g pm2
```

#### 2. 克隆项目

```bash
cd /var/www
git clone https://github.com/lztong111/kitchen-for-dream.git
cd kitchen-for-dream
```

#### 3. 构建前端

```bash
cd client
npm install
npm run build
cd ..
```

构建产物会生成在 `client/dist/` 目录。

#### 4. 安装后端依赖并初始化数据库

```bash
cd server
npm install --production
npm run db:migrate
npm run db:seed
cd ..
```

#### 5. 配置环境变量

```bash
vim server/.env
```

```env
JWT_SECRET=修改为一个随机的长字符串
PORT=8888
```

#### 6. 使用 PM2 启动后端

```bash
pm2 start npx --name "kitchen-server" -- tsx server/src/app.ts
pm2 save
pm2 startup
```

#### 7. 配置 Nginx

将项目中的 `nginx-kitchen.conf` 复制到 Nginx 配置目录：

```bash
sudo cp nginx-kitchen.conf /etc/nginx/sites-available/kitchen
sudo ln -sf /etc/nginx/sites-available/kitchen /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Nginx 配置内容（`nginx-kitchen.conf`）：

```nginx
server {
    listen 80;
    server_name kitchen.wgetbt.asia;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kitchen.wgetbt.asia;

    ssl_certificate /etc/nginx/ssl/kitchen.wgetbt.asia.pem;
    ssl_certificate_key /etc/nginx/ssl/kitchen.wgetbt.asia.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 5M;

    # 前端静态文件
    location / {
        root /var/www/kitchen-for-dream/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 请求代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:8888;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 上传的图片
    location /uploads/ {
        proxy_pass http://127.0.0.1:8888;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 8. SSL 证书

确保 SSL 证书文件存在：

```
/etc/nginx/ssl/kitchen.wgetbt.asia.pem
/etc/nginx/ssl/kitchen.wgetbt.asia.key
```

如果还没有证书，可以使用 acme.sh 申请：

```bash
curl https://get.acme.sh | sh
~/.acme.sh/acme.sh --issue -d kitchen.wgetbt.asia --nginx
~/.acme.sh/acme.sh --installcert -d kitchen.wgetbt.asia \
  --key-file /etc/nginx/ssl/kitchen.wgetbt.asia.key \
  --fullchain-file /etc/nginx/ssl/kitchen.wgetbt.asia.pem
```

#### 9. 访问应用

| 服务 | 地址 |
|------|------|
| 前端页面 | https://kitchen.wgetbt.asia |
| 后端 API | https://kitchen.wgetbt.asia/api |

---

## 常用运维命令

### PM2 命令

```bash
pm2 list                  # 查看进程状态
pm2 logs kitchen-server   # 查看后端日志
pm2 restart kitchen-server # 重启后端
pm2 stop kitchen-server   # 停止后端
```

### 更新部署

```bash
cd /var/www/kitchen-for-dream

# 拉取最新代码
git pull

# 重新构建前端
cd client && npm install && npm run build && cd ..

# 重启后端
pm2 restart kitchen-server
```

### 数据备份

```bash
# 备份数据库
cp /var/www/kitchen-for-dream/server/kitchen.db ./kitchen-backup.db

# 备份上传的图片
tar -czf uploads-backup.tar.gz /var/www/kitchen-for-dream/server/uploads/
```

---

## 环境变量说明

| 变量 | 文件 | 说明 | 默认值 |
|------|------|------|--------|
| `JWT_SECRET` | `server/.env` | JWT 签名密钥，生产环境必须修改 | `kitchen-secret-key` |
| `PORT` | `server/.env` | 后端服务端口 | `8888` |

---

## API 接口文档

### 认证相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | 否 |
| POST | `/api/auth/login` | 用户登录 | 否 |
| GET | `/api/auth/me` | 获取当前用户信息 | 是 |

**注册请求体：**
```json
{
  "username": "用户名（2-20字符）",
  "password": "密码（至少6位）"
}
```

**登录响应：**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": 1,
      "username": "test",
      "avatar": null,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 菜品相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/dishes` | 获取菜品列表 | 否 |
| GET | `/api/dishes/:id` | 获取菜品详情 | 否 |
| POST | `/api/dishes` | 创建菜品 | 是 |
| PUT | `/api/dishes/:id` | 更新菜品（仅限自己的） | 是 |
| DELETE | `/api/dishes/:id` | 删除菜品（仅限自己的） | 是 |

**菜品列表查询参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `page` | number | 页码，默认 1 |
| `limit` | number | 每页数量，默认 12，最大 50 |
| `search` | string | 搜索关键词（按名称） |
| `category_id` | number | 分类 ID |
| `difficulty` | number | 难度等级（1-5） |
| `tag` | string | 标签名 |

**创建菜品请求体：**
```json
{
  "name": "红烧肉",
  "description": "经典家常菜",
  "image_url": "/uploads/xxx.jpg",
  "category_id": 1,
  "cook_time": 60,
  "difficulty": 3,
  "servings": 4,
  "steps": [
    { "description": "五花肉切块焯水" },
    { "description": "炒糖色，放入肉块翻炒" },
    { "description": "加入调料，小火炖煮 40 分钟" }
  ],
  "ingredient_ids": [
    { "ingredient_id": 1, "amount": "500", "unit": "g" },
    { "ingredient_id": 20, "amount": "2", "unit": "勺" }
  ],
  "tag_names": ["家常", "下饭"]
}
```

### 其他接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/categories` | 获取所有分类 | 否 |
| GET | `/api/ingredients` | 获取所有食材 | 否 |
| GET | `/api/tags` | 获取热门标签（前 20） | 否 |
| POST | `/api/upload` | 上传图片 | 是 |

**图片上传：** 使用 `multipart/form-data` 格式，字段名为 `file`，支持 jpg/png/gif/webp，最大 5MB。

---

## 预设数据

### 菜品分类（16 种）

| 分类 | 图标 | 分类 | 图标 |
|------|------|------|------|
| 家常菜 | 🏠 | 川菜 | 🌶️ |
| 粤菜 | 🥘 | 湘菜 | 🔥 |
| 鲁菜 | 🍳 | 苏菜 | 🥢 |
| 浙菜 | 🐟 | 闽菜 | 🦐 |
| 徽菜 | 🍖 | 西餐 | 🥩 |
| 日料 | 🍣 | 韩餐 | 🍜 |
| 甜点 | 🍰 | 饮品 | 🧋 |
| 早餐 | 🥞 | 汤品 | 🍲 |

### 食材库（28 种）

| 分类 | 食材 |
|------|------|
| 肉类 | 猪肉、牛肉、鸡肉、羊肉 |
| 海鲜 | 鱼、虾、螃蟹 |
| 蛋/豆 | 鸡蛋、豆腐 |
| 蔬菜 | 土豆、白菜、青椒、西红柿、黄瓜、胡萝卜、洋葱 |
| 调味品 | 大蒜、生姜、葱、酱油、醋、盐、糖、料酒、食用油 |
| 主食 | 大米、面粉、面条 |

---

## 许可证

MIT
