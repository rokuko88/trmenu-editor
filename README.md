# TrMenu Editor

![Minecraft](https://img.shields.io/badge/Minecraft-Bukkit-green?style=flat-square&logo=minecraft)
![TrMenu](https://img.shields.io/badge/TrMenu-Config_Editor-red?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.x-brown?style=flat-square)
![dnd-kit](https://img.shields.io/badge/dnd--kit-6.x-blue?style=flat-square)
![License](https://img.shields.io/badge/License-GPLv3-red?style=flat-square)

---

<div align="center">
  <img src="public/image.png" alt="TrMenu Editor" width="120" />
  <p>TrMenu 配置文件可视化编辑器 <a href="https://rokuko88.github.io/trmenu-editor/">在线体验</a></p>
</div>

---

## 项目简介

TrMenu Editor 是一个专为 Minecraft [TrMenu](https://github.com/TrMenu/TrMenu) 插件设计的可视化配置编辑器，提供直观的拖拽式界面来创建和编辑菜单配置。所有数据存储在浏览器本地，无需服务器。

## 核心特性

- **可视化编辑** - 拖拽式界面，实时预览菜单布局
- **本地存储** - 数据保存在浏览器，完全离线可用
- **配置导入导出** - 支持导入现有 TrMenu YAML 配置，导出为标准格式
- **菜单组织** - 通过分组管理多个菜单配置
- **暗色模式** - 支持亮色/暗色/跟随系统

## 快速开始

### 环境要求

- Node.js >= 20.x
- npm / pnpm / yarn

### 安装和运行

```bash
# 安装依赖
npm install

# 初始化 Git Hooks（首次安装后执行）
npm run prepare

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run start
```

### 开发命令

```bash
# 代码检查
npm run lint          # ESLint 检查
npm run lint:fix      # 自动修复 ESLint 问题

# 代码格式化
npm run format        # Prettier 格式化
npm run format:check  # 检查代码格式

# 类型检查
npm run type-check    # TypeScript 类型检查

# 全面检查
npm run check-all     # 运行所有检查
```

## 工程化配置

本项目采用标准的前端工程化实践：

### 代码质量

- **ESLint** - JavaScript/TypeScript 代码检查
- **Prettier** - 代码格式化
- **TypeScript** - 类型安全
- **EditorConfig** - 编辑器配置统一

### Git 工作流

- **Husky** - Git Hooks 管理
- **lint-staged** - 提交前自动检查和格式化
- **commitlint** - 提交消息规范检查

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
perf: 性能优化
test: 添加测试
chore: 构建或辅助工具的变动
```

详细的开发指南请查看 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

本项目采用自定义许可证，**禁止商业使用和修改**。详见 [LICENSE](LICENSE) 文件。

## 相关项目

- [TrMenu](https://github.com/TrMenu/TrMenu) - Minecraft 服务器菜单插件
