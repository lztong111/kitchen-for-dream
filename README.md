# Kitchan - 菜谱管理系统

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
| 容器化 | Docker + Nginx |

## 项目结构

```
kitchan/
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
├── Dockerfile.backend           # 后端 Docker 镜像
├── Dockerfile.frontend          # 前端 Docker 镜像
├── docker-compose.yml           # Docker Compose 编排
├── nginx.conf                   # Nginx 配置
├── entrypoint.sh                # 容器启动脚本
└── .env                         # Docker 环境变量
```

---

## 本地开发

### 环境要求

- Node.js >= 18
- npm >= 9

### 1. 安装依赖

```bash
# 安装根依赖
npm install

# 安装后端依赖
cd server && npm install && cd ..

# 安装前端依赖
cd client && npm install && cd ..
```

### 2. 初始化数据库

```bash
cd server

# 创建数据库表结构
npm run db:migrate

# 导入预设数据（16 种分类 + 28 种食材）
npm run db:seed

cd ..
```

### 3. 启动开发服务器

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

### 4. 访问应用

| 服务 | 地址 |
|------|------|
| 前端页面 | http://localhost:5173 |
| 后端 API | http://localhost:8888/api |

---

## 服务器部署

### 方式一：Docker 部署（推荐）

#### 环境要求

- Docker >= 20
- Docker Compose >= 2

#### 部署步骤

**1. 上传项目到服务器**

```bash
# 本地打包（排除 node_modules 等）
tar -czf kitchan.tar.gz --exclude=node_modules --exclude=.git --exclude=*.db kitchan/

# 上传到服务器
scp kitchan.tar.gz user@your-server:/var/www/

# 登录服务器解压
ssh user@your-server
cd /var/www && tar -xzf kitchan.tar.gz
```

**2. 配置环境变量**

```bash
cd /var/www/kitchan

# 编辑 .env，修改 JWT_SECRET 为随机强密钥
vim .env
```

```env
JWT_SECRET=your-very-long-random-secret-key-here
```

**3. 构建并启动容器**

```bash
docker-compose up -d --build
```

**4. 验证服务状态**

```bash
# 查看容器运行状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

**5. 访问应用**

| 服务 | 地址 |
|------|------|
| 前端页面 | http://your-server-ip |
| 后端 API | http://your-server-ip:8888/api |

#### Docker 常用命令

```bash
docker-compose up -d            # 启动服务
docker-compose down             # 停止服务
docker-compose restart          # 重启所有服务
docker-compose restart backend  # 重启后端
docker-compose logs backend     # 查看后端日志
docker-compose logs frontend    # 查看前端日志
docker-compose exec backend sh  # 进入后端容器
```

#### 数据持久化

Docker 使用 Volume 持久化数据，即使容器重建数据也不会丢失：

| Volume | 容器路径 | 说明 |
|--------|---------|------|
| `kitchan-db` | `/app/data/kitchan.db` | SQLite 数据库 |
| `kitchan-uploads` | `/app/server/uploads` | 上传的图片 |

#### 备份数据

```bash
# 备份数据库
docker cp kitchan-backend:/app/data/kitchan.db ./kitchan-backup.db

# 备份上传的图片
docker cp kitchan-backend:/app/server/uploads ./uploads-backup
```

---

### 方式二：传统部署（Nginx + PM2）

#### 环境要求

- Node.js >= 18
- Nginx
- PM2（进程管理）

#### 部署步骤

**1. 安装 Node.js 和 PM2**

```bash
# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PM2
npm install -g pm2
```

**2. 上传并解压项目**

```bash
cd /var/www
tar -xzf kitchan.tar.gz
cd kitchan
```

**3. 安装依赖并构建**

```bash
# 后端
cd server && npm install --production
npm run db:migrate
npm run db:seed
cd ..

# 前端
cd client && npm install && npm run build
cd ..
```

**4. 配置环境变量**

```bash
# 编辑 server/.env
vim server/.env
```

```env
JWT_SECRET=your-very-long-random-secret-key
PORT=8888
DB_PATH=/var/www/kitchan/server/kitchan.db
```

**5. 使用 PM2 启动后端**

```bash
pm2 start npx --name "kitchan-server" -- tsx server/src/app.ts
pm2 save
pm2 startup
```

**6. 配置 Nginx**

```bash
sudo vim /etc/nginx/sites-available/kitchan
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或 IP

    client_max_body_size 5M;

    # 前端静态文件
    location / {
        root /var/www/kitchan/client/dist;
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
        alias /var/www/kitchan/server/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/kitchan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**7. 访问应用**

| 服务 | 地址 |
|------|------|
| 前端页面 | http://your-domain.com |
| 后端 API | http://your-domain.com/api |

---

## 环境变量说明

| 变量 | 位置 | 说明 | 默认值 |
|------|------|------|--------|
| `JWT_SECRET` | `server/.env` | JWT 签名密钥，生产环境必须修改 | `kitchan-secret-key` |
| `PORT` | `server/.env` | 后端服务端口 | `8888` |
| `DB_PATH` | `server/.env` | SQLite 数据库文件路径 | `./kitchan.db` |
| `JWT_SECRET` | `docker-compose.yml` | Docker 环境下的 JWT 密钥 | 从 `.env` 读取 |

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
