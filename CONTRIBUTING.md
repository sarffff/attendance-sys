# 贡献指南

感谢您对考勤系统项目的关注！本文档提供了关于如何为项目做出贡献的指南。

## 贡献的方式

### 报告问题
如果您发现了bug或有改进建议，请创建一个 GitHub Issue：

1. 使用清晰的描述性标题
2. 详细描述问题或建议
3. 提供尽可能多的相关信息（如复现步骤、错误截图等）
4. 说明您使用的环境信息

### 提交代码

#### 步骤

1. **Fork 项目**
   ```bash
   # 访问项目页面，点击 Fork 按钮
   ```

2. **克隆您的Fork**
   ```bash
   git clone https://github.com/yourusername/attendance-sys.git
   cd attendance-sys
   ```

3. **创建特性分支**
   ```bash
   git checkout -b feature/你的功能名
   # 或
   git checkout -b fix/你的修复名
   ```

4. **安装依赖并启动开发服务器**
   ```bash
   pnpm install
   pnpm dev
   ```

5. **进行代码修改**
   - 遵循项目的代码风格
   - 运行 `pnpm lint` 检查代码
   - 为新功能编写必要的注释

6. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   # 或
   git commit -m "fix: 修复问题描述"
   ```

7. **推送到您的Fork**
   ```bash
   git push origin feature/你的功能名
   ```

8. **创建 Pull Request**
   - 访问原项目，点击 "New Pull Request"
   - 选择您的分支
   - 填写详细的PR描述

## 代码规范

### 提交信息规范（Conventional Commits）

请使用以下格式编写提交信息：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型（type）：**
- `feat:` 新功能
- `fix:` bug修复
- `docs:` 文档变更
- `style:` 代码风格改变（不影响代码运行）
- `refactor:` 代码重构（既不是新增功能，也不是修复bug）
- `perf:` 性能优化
- `test:` 增加或修改测试
- `chore:` 构建工具、依赖库更新等

**示例：**
```bash
git commit -m "feat(auth): 添加二次验证功能"
git commit -m "fix(leave-approval): 修复审批列表排序问题"
git commit -m "docs: 更新API文档"
```

### 代码风格

- 遵循ESLint配置
- 使用双引号（"）而不是单引号（'）
- 使用2个空格进行缩进
- 在文件末尾添加空行

**运行代码检查：**
```bash
pnpm lint
```

### 文件命名规范

- **组件文件**: PascalCase（如 `LeaveDetailModal.jsx`）
- **页面文件**: camelCase（如 `initiateLeave/index.jsx`）
- **工具函数**: camelCase（如 `formatTime.js`）
- **常量文件**: camelCase（如 `roleCode.js`）

### 注释规范

```javascript
// 简单注释
const value = 10;

/**
 * 函数或复杂逻辑的JSDoc注释
 * @param {string} name - 参数说明
 * @returns {boolean} 返回值说明
 */
function myFunction(name) {
  // TODO: 待完成的任务
  // FIXME: 需要修复的问题
  return true;
}
```

## 功能开发指南

### 添加新页面

1. 在 `src/pages/` 下创建新文件夹
2. 创建 `index.jsx` 文件实现页面
3. 在 `src/config/menuConfig.js` 中配置路由
4. 设置相应的权限角色

### 添加新API接口

1. 在 `src/api/` 下创建对应的接口文件（如 `newModule.js`）
2. 使用 `request` 工具函数
3. 导出相应的接口方法

**示例：**
```javascript
// src/api/newModule.js
import request from '@/utils/request';

export const getList = () => request.get('/api/new-module/list');

export const create = (data) => request.post('/api/new-module', data);
```

### 添加新权限角色

1. 更新 `src/constants/roleCode.js` 中的角色定义
2. 在 `src/config/menuConfig.js` 中配置新角色的菜单权限
3. 在 `src/pages/dashboard/components/` 中添加特定角色的视图（如需）

## 测试

- 在本地充分测试您的更改
- 验证所有功能在不同权限角色下工作正常
- 检查响应式设计在不同屏幕尺寸下的表现

## 文档更新

- 如果您的更改影响了使用或功能，请更新相应的文档
- 在README中添加新功能的说明（如适用）
- 更新CHANGELOG.md记录您的更改

## Pull Request 检查清单

- [ ] 我已更新代码注释和文档
- [ ] 我已运行 `pnpm lint` 并解决所有代码风格问题
- [ ] 我已在本地测试了我的更改
- [ ] 我的PR针对正确的分支（通常是main/master）
- [ ] 我已添加/更新了必要的测试
- [ ] 我已更新了CHANGELOG.md
- [ ] 我的提交信息遵循规范

## 开发工具推荐

- **编辑器**: Visual Studio Code
- **扩展**:
  - ESLint
  - Prettier
  - React DevTools
  - Redux DevTools

## 问题反馈

如有任何问题，欢迎：
- 创建 GitHub Issue
- 在讨论中提问
- 发送邮件至维护者

---

感谢您的贡献！
