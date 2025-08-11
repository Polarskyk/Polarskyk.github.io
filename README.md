# Polarskyk.github.io

现代化的个人博客网站，采用模块化设计和独立页面架构。

## 🚀 项目特性

- **独立页面架构**: 每个页面完全独立，提供更好的模块化体验
- **Markdown 支持**: 支持标准 Markdown 语法和代码高亮
- **响应式设计**: 完美适配桌面和移动设备
- **动态主题**: 支持亮色/暗色主题切换
- **文章管理**: 自动解析 Markdown 文件的 frontmatter
- **搜索功能**: 支持标题、内容和标签搜索
- **分类系统**: 自动生成文章分类页面

## 📁 项目结构

```
Polarskyk.github.io/
├── index.html          # 主页面，包含所有独立页面模块
├── styles.css          # 完整样式系统
├── app.js              # 主应用逻辑和页面路由
├── app-extensions.js   # UI 渲染和功能扩展
├── blog-manager.js     # Markdown 文件解析和博客管理
├── posts/              # Markdown 文章目录
└── README.md           # 项目说明文档
```

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, Vanilla JavaScript
- **Markdown 解析**: marked.js
- **代码高亮**: highlight.js
- **图标**: Font Awesome
- **架构**: 模块化设计，完全分离的页面组件

## 📝 使用说明

### 添加新文章

1. 在 `posts/` 目录下创建 `.md` 文件
2. 文章需要包含 frontmatter 头部信息：

```markdown
---
title: "文章标题"
date: "2024-01-01"
category: "技术"
tags: ["JavaScript", "前端"]
description: "文章简介"
---

# 文章内容

这里是文章正文...
```

### 本地运行

由于需要加载本地 Markdown 文件，建议使用本地服务器：

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js (http-server)
npx http-server

# 使用 PHP
php -S localhost:8000
```

然后访问 `http://localhost:8000`

## 🎨 页面组件

### 独立页面模块
- **首页** (`data-page="home"`): 个人介绍和最新文章
- **博客列表** (`data-page="blog-list"`): 文章列表和搜索
- **分类页面** (`data-page="categories"`): 文章分类浏览
- **文章详情** (`data-page="article"`): 文章内容显示
- **关于页面** (`data-page="about"`): 个人信息展示

### 功能特性
- 打字机效果的个人介绍
- 实时文章统计
- 响应式导航菜单
- 模态框系统
- 主题切换功能

## 🔧 自定义配置

### 主题配置
可以在 `styles.css` 中修改 CSS 变量来自定义主题：

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --background-color: #ffffff;
  --text-color: #333333;
}
```

### 个人信息
在 `app.js` 中的 `BlogApp` 类中修改个人信息配置。

## 📦 部署

### GitHub Pages
1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 `main` 分支作为源

### 其他平台
项目为静态网站，可部署到任何支持静态文件的平台：
- Netlify
- Vercel
- GitHub Pages
- 腾讯云静态网站托管

## 🔄 更新日志

### v2.0.0 (最新)
- ✅ 重构页面架构，实现完全独立的页面模块
- ✅ 移除所有内联样式，提升代码质量
- ✅ 实现模块化 JavaScript 架构
- ✅ 清理所有示例文章，专注真实内容
- ✅ 优化响应式设计和用户体验

### v1.0.0
- 基础博客功能实现
- Markdown 文件解析
- 响应式设计

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**即刻开始**: 将您的 Markdown 文章放入 `posts/` 目录，然后启动本地服务器体验吧！