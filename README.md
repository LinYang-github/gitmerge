# GitMerge 🚀

**GitMerge** 是一款专为开发者设计的工具，旨在将整个 GitHub 仓库“扁平化”合并为一个单一的文本文档。它的核心用途是为大型语言模型（LLM，如 ChatGPT、Claude、Gemini）提供完整的代码上下文，帮助 AI 更好地理解项目结构并进行代码分析、重构或调试。

![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![Vite](https://img.shields.io/badge/Vite-6.2-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan)

## ✨ 核心特性

- 📂 **智能仓库解析**：支持直接输入 GitHub URL 或指定分支，自动抓取项目文件树。
- ✅ **精细化选择**：通过交互式文件树，手动勾选需要合并的文件，过滤无关资源。
- 🤖 **AI 上下文优化**：
  - **Token 估算**：实时计算合并后文本的 Token 数量（基于字符比例）。
  - **注释清除**：可选自动移除代码注释（支持 JS/TS, Python, C++, Java 等），大幅节省上下文窗口空间。
  - **ASCII 目录树**：在合并文件顶部生成可视化项目结构图。
- ⚙️ **高级过滤**：
  - 支持自定义忽略文件扩展名（如 `.png`, `.pdf`, `.lock`）。
  - 自动跳过超大文件（默认 500KB）。
- 🔑 **API 限速解除**：支持配置 GitHub Personal Access Token (PAT)，突破匿名请求的频率限制。
- 📥 **一键导出**：支持直接复制到剪贴板或下载为 `.txt` 文件。

## 🛠️ 技术栈

- **前端框架**: React 19 (Hooks)
- **开发语言**: TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS (通过 ESM 加载)
- **图标库**: Lucide React
- **部署/运行**: 纯静态前端应用，无需后端。

## 🚀 快速启动

### 生产环境运行 (推荐)
如果你已经有了构建好的 `dist` 目录，可以使用 Python 快速启动一个本地服务器：

```bash
# 进入构建产物目录
cd dist

# 启动服务器（指定端口 8085）
python3 -m http.server 8085
```
启动后访问：`http://localhost:8085`

### 源码开发环境
1. **安装依赖**:
   ```bash
   npm install
   ```
2. **本地调试**:
   ```bash
   npm run dev
   ```
3. **构建产物**:
   ```bash
   npm run build
   ```

## 📂 项目结构

```text
├── components/          # 核心 UI 组件 (FileTree, RepoForm 等)
├── services/            # GitHub API 交互逻辑
├── utils/               # 文本处理、Token 估算、树状图生成工具
├── types.ts             # TypeScript 类型定义
├── constants.ts         # 默认忽略配置与常量
└── App.tsx              # 应用主入口与状态管理
```

## 💡 使用技巧

1. **配置 Token**: 在应用右上角的设置图标中填入 GitHub PAT，可以抓取私有仓库并获得更高的 API 配额。
2. **节省 Token**: 如果你的代码库非常大，建议开启 "Remove Code Comments" 选项，这通常能减少 20%-40% 的 Token 消耗。
3. **分支抓取**: 支持类似 `https://github.com/user/repo/tree/dev` 的分支格式解析。

---

*GitMerge - Flatten your code, feed your AI.*