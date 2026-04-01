# 项目上下文

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   │   ├── api/            # API 路由
│   │   │   ├── auth/       # 认证相关 API
│   │   │   ├── customers/  # 客户 CRUD API
│   │   │   ├── admins/     # 管理员管理 API
│   │   │   └── stats/      # 统计 API
│   │   ├── login/          # 登录页面
│   │   ├── admins/         # 管理员管理页面
│   │   └── customers/      # 客户详情页面
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── components/customer-dialog.tsx  # 客户编辑弹窗
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   ├── admin-store.ts  # 管理员状态管理
│   │   ├── customer-store.ts  # 客户数据操作
│   │   └── utils.ts        # 通用工具函数
│   ├── storage/database/   # 数据库相关
│   │   ├── shared/schema.ts  # 数据库 schema 定义
│   │   └── supabase-client.ts  # Supabase 客户端
│   ├── types/              # TypeScript 类型定义
│   └── data/               # 数据格式化工具
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

## 数据库表结构

### admins 表
- id: VARCHAR(36) 主键
- username: VARCHAR(50) 唯一
- password: VARCHAR(255)
- name: VARCHAR(100)
- role: VARCHAR(20) ('admin' | 'super_admin')
- created_at: TIMESTAMP
- last_login: TIMESTAMP

### customers 表
- id: VARCHAR(36) 主键
- name: VARCHAR(100)
- phone: VARCHAR(50)
- company: VARCHAR(200)
- status: VARCHAR(20) ('need' | 'not_need' | 'following' | 'completed')
- tags: TEXT
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- visit_time: TIMESTAMP
- loan_amount: NUMERIC(15,2)
- service_fee: NUMERIC(15,2)
- created_by: VARCHAR(36) 外键 -> admins.id
- owner_id: VARCHAR(36) 外键 -> admins.id
- owner_name: VARCHAR(100)

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

- **项目理解加速**：初始可以依赖项目下`package.json`文件理解项目类型，如果没有或无法理解退化成阅读其他文件。
- **Hydration 错误预防**：严禁在 JSX 渲染逻辑中直接使用 typeof window、Date.now()、Math.random() 等动态数据。必须使用 'use client' 并配合 useEffect + useState 确保动态内容仅在客户端挂载后渲染；同时严禁非法 HTML 嵌套（如 <p> 嵌套 <div>）。

## UI 设计与组件规范 (UI & Styling Standards)

- 模板默认预装核心组件库 `shadcn/ui`，位于`src/components/ui/`目录下
- Next.js 项目**必须默认**采用 shadcn/ui 组件、风格和规范，**除非用户指定用其他的组件和规范。**

## 权限控制

- 超级管理员 (super_admin): 可以查看和操作所有客户数据，管理所有管理员
- 普通管理员 (admin): 只能查看和操作自己负责的客户数据
- 权限通过 API 层 x-admin-id 和 x-admin-role 请求头实现

## 默认账号

- 超级管理员: admin / admin123
- 普通管理员: manager / manager123


