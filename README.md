# 考勤系统（Attendance System）

> 一个基于React + Vite + Redux的现代化企业考勤管理系统，支持多角色权限控制和请假审批流程。

![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8.0.4-646CFF?style=flat-square&logo=vite)
![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC?style=flat-square&logo=redux)
![Ant Design](https://img.shields.io/badge/Ant%20Design-6.3.5-1890FF?style=flat-square&logo=antdesign)

## 项目概述

这是一套完整的企业级考勤管理系统，具有强大的权限管理和工作流程控制能力。系统支持员工请假申请、审批管理、考勤设置等多个模块，满足企业的复杂考勤管理需求。

## 主要特性

- **多角色权限系统** - 支持超级管理员、普通管理员、科长、负责人、党委书记、站长等多层级角色
- **请假审批流程** - 灵活的多级审批机制，支持不同角色的审批权限
- **仪表板** - 实时数据展示，支持不同角色的自定义视图
- **系统设置** - 完整的配置管理，包括请假设置、组织设置、用户管理等
- **身份验证** - 集成MD5加密的安全登录系统
- **响应式设计** - 使用Ant Design构建，完美适配各种设备
- **高性能** - 基于Vite构建，快速的开发和生产编译

## 核心功能模块

| 模块 | 说明 | 相关角色 |
|-----|-----|--------|
| 仪表板 | 系统首页，展示关键数据和统计 | 所有用户 |
| 请假管理 | 员工发起请假申请 | 所有员工 |
| 请假审批 | 审批员工的请假申请 | HR科长、车间负责人等 |
| 考勤设置 | 配置请假类型和规则 | 系统管理员 |
| 组织设置 | 管理企业组织结构 | 超级管理员 |
| 用户管理 | 用户账户和权限管理 | 普通管理员及以上 |
| 审批设置 | 配置审批流程 | 系统管理员 |

## 技术栈

- **前端框架**: React 19.2.4
- **构建工具**: Vite 8.0.4
- **状态管理**: Redux Toolkit 2.11.2 + React-Redux 9.2.0
- **路由管理**: React Router DOM 7.14.1
- **UI 组件库**: Ant Design 6.3.5 + Ant Design Icons 6.1.1
- **HTTP 客户端**: Axios 1.15.0
- **数据加密**: Crypto-JS 4.2.0
- **日期处理**: Day.js 1.11.20
- **工具库**: Lodash 4.18.1
- **代码质量**: ESLint 9.39.4
- **编译优化**: React Compiler 1.0.0

## 项目结构

```
attendance-sys/
├── src/
│   ├── api/                    # API接口模块
│   │   ├── leaves.js          # 请假相关接口
│   │   ├── login.js           # 登录接口
│   │   └── super_admin.js     # 超级管理员接口
│   ├── components/             # 通用组件
│   │   ├── BaseForm/          # 基础表单组件
│   │   ├── BaseTable/         # 基础表格组件
│   │   ├── LeaveDetailModal/  # 请假详情模态框
│   │   ├── LoadingPage/       # 加载页面
│   │   ├── NoOperation/       # 无操作提示
│   │   └── ProtectedRoute/    # 受保护的路由组件
│   ├── config/                # 配置文件
│   │   └── menuConfig.js      # 菜单配置
│   ├── constants/             # 常量定义
│   │   ├── constantsMap.js    # 常量映射
│   │   └── roleCode.js        # 角色代码定义
│   ├── hooks/                 # 自定义hooks
│   │   ├── useAppDispatch.js  # Redux dispatch hook
│   │   ├── useAppSelector.js  # Redux selector hook
│   │   └── useFetch.js        # 数据获取hook
│   ├── layouts/               # 布局组件
│   ├── pages/                 # 页面组件
│   │   ├── approvaLeave/      # 请假审批页面
│   │   ├── approve_settings/  # 审批设置页面
│   │   ├── dashboard/         # 仪表板页面
│   │   ├── initiateLeave/     # 发起请假页面
│   │   ├── leaves_settings/   # 请假设置页面
│   │   ├── login/             # 登录页面
│   │   ├── org_settings/      # 组织设置页面
│   │   └── user_settings/     # 用户管理页面
│   ├── router/                # 路由配置
│   ├── store/                 # Redux状态管理
│   │   ├── index.js           # store配置
│   │   ├── hooks.js           # Redux hooks
│   │   └── modules/           # Redux modules
│   │       └── user.js        # 用户状态管理
│   ├── utils/                 # 工具函数
│   │   ├── encryptMD5.js      # MD5加密工具
│   │   ├── formatTime.js      # 时间格式化工具
│   │   └── request.js         # HTTP请求工具
│   ├── App.jsx               # 根组件
│   ├── main.jsx              # 入口文件
│   └── index.css             # 全局样式
├── public/                    # 公共资源
├── vite.config.js            # Vite配置文件
├── eslint.config.js          # ESLint配置
├── package.json              # 项目依赖配置
└── README.md                 # 项目文档
```

## 快速开始

### 前提条件

- Node.js >= 16.0.0
- pnpm >= 8.0.0（推荐）或 npm >= 9.0.0

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/yourusername/attendance-sys.git
cd attendance-sys
```

2. **安装依赖**
```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

3. **配置环境变量**

在项目根目录创建 `.env.local` 文件：
```bash
# API 基础 URL
VITE_API_BASE_URL=http://your-api-server:8080
```

4. **启动开发服务器**
```bash
pnpm dev
# 或
npm run dev
```

应用将在 `http://localhost:5173` 打开

## 使用指南

### 开发命令

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 代码检查和修复
pnpm lint
```

### 默认登录角色

系统支持以下角色登录：

- **SYSTEM_ADMIN** - 超级管理员（完全访问权限）
- **ATTENDANCE_ADMIN** - 普通管理员
- **HR_SECTION_CHIEF** - 劳动人事科科长（可审批请假）
- **ORG_PRINCIPAL** - 车间负责人（可审批请假）
- **PARTY_SECRETARY** - 党委书记（可审批请假）
- **STATIONMASTER** - 站长（可审批请假）
- **DEPUTY_STATIONMASTER** - 副站长（可审批请假）

### 核心特性使用

#### 1. 权限控制
系统基于角色的访问控制（RBAC），在路由和菜单配置中定义权限：

```javascript
// config/menuConfig.js 中配置
const menuConfig = [
  {
    key: '/dashboard',
    label: '仪表板',
    element: <Dashboard />,
    roles: null  // null表示所有角色都可访问
  },
  {
    key: '/user_settings',
    label: '用户管理',
    element: <UserSettings />,
    roles: ['SYSTEM_ADMIN', 'ATTENDANCE_ADMIN']  // 只有指定角色可访问
  }
];
```

#### 2. 状态管理
使用Redux Toolkit管理用户状态：

```javascript
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setToken, setUserInfo } from '@/store/modules/user';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const { token, userInfo } = useAppSelector(state => state.user);

  // 使用状态...
};
```

#### 3. API请求
使用统一的request工具发送HTTP请求：

```javascript
import request from '@/utils/request';

// GET请求
const response = await request.get('/api/leaves');

// POST请求
const response = await request.post('/api/leaves', { data });

// PUT请求
const response = await request.put(`/api/leaves/${id}`, { data });

// DELETE请求
const response = await request.delete(`/api/leaves/${id}`);
```

## 安全特性

- **MD5加密** - 敏感数据使用MD5加密处理
- **令牌认证** - 基于JWT的身份验证
- **本地存储** - 用户信息和令牌安全存储在LocalStorage
- **受保护路由** - 未授权用户无法访问受保护的页面

## API文档

API 端点示例（需根据实际后端配置调整）：

| 端点 | 方法 | 说明 |
|-----|-----|-----|
| `/api/login` | POST | 用户登录 |
| `/api/leaves` | GET | 获取请假列表 |
| `/api/leaves` | POST | 创建请假申请 |
| `/api/leaves/:id` | GET | 获取请假详情 |
| `/api/leaves/:id/approve` | PUT | 审批请假 |
| `/api/users` | GET | 获取用户列表 |
| `/api/org` | GET | 获取组织信息 |

## 主题和样式

项目使用Ant Design作为UI框架，可以通过以下方式自定义主题：

- 在组件中使用 `ConfigProvider` 自定义主题配置
- 按需引入Ant Design组件

## 贡献指南

欢迎贡献代码、报告问题或提出改进建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 开发建议

- 遵循项目的代码风格（ESLint配置）
- 为新功能编写必要的文档
- 确保测试覆盖新增功能
- 更新README如有重大变更

## 联系方式

如有任何问题，欢迎通过以下方式联系：

- 提交 GitHub Issues
- 发送 Pull Requests

---

**最后更新**: 2026年5月
**项目维护者**: [sarffff]
