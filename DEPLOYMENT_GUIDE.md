# Polarsky's Blog - GitHub Pages 部署指南

## 📋 目录
1. [快速开始](#快速开始)
2. [部署方式](#部署方式)
3. [本地开发](#本地开发)
4. [发布文章](#发布文章)
5. [图片处理](#图片处理)
6. [常见问题](#常见问题)

---

## 快速开始

### 前置要求
- GitHub 账户
- Git 已安装
- 文本编辑器（VS Code, Sublime 等）

### 第一步：部署到 GitHub Pages

#### 选项 A：个人博客部署 (username.github.io)

1. **创建仓库**
   - 登录 GitHub
   - 创建新仓库，名称必须为 `yourusername.github.io`
   - 选择 `Public`（公开）

2. **克隆本博客**
   ```bash
   git clone https://github.com/Polarskyk/Polarskyk.github.io.git
   cd Polarskyk.github.io
   ```

3. **替换配置**
   - 编辑 `script.js` 中的 `GITHUB_CONFIG`：
     ```javascript
     const GITHUB_CONFIG = {
         owner: 'yourusername',          // 改为你的GitHub用户名
         repo: 'yourusername.github.io', // 改为你的仓库名
         branch: 'main',
         postsPath: 'posts'
     };
     ```

4. **推送到 GitHub**
   ```bash
   git remote set-url origin https://github.com/yourusername/yourusername.github.io.git
   git push -u origin main
   ```

5. **启用 GitHub Pages**
   - 进入仓库设置 → Pages
   - 选择 `Deploy from a branch`
   - Branch 选择 `main`，目录选择 `/ (root)`
   - 保存

6. **访问博客**
   - 等待 1-2 分钟
   - 打开 `https://yourusername.github.io`

#### 选项 B：项目博客部署 (username.github.io/project-name)

1. **创建仓库**
   - 登录 GitHub
   - 创建新仓库，名称为任意名字（例如 `my-blog`）

2. **添加现有仓库**
   ```bash
   git clone https://github.com/Polarskyk/Polarskyk.github.io.git
   cd Polarskyk.github.io
   git remote set-url origin https://github.com/yourusername/my-blog.git
   git push -u origin main
   ```

3. **启用 GitHub Pages**
   - 进入仓库设置 → Pages
   - 选择 `Deploy from a branch`
   - Branch 选择 `main`，目录选择 `/ (root)`
   - 保存

4. **访问博客**
   - `https://yourusername.github.io/my-blog`

---

## 部署方式

### 架构说明

本博客使用**纯前端**架构，完全静态，适合 GitHub Pages：

```
┌─────────────────────────────┐
│    posts/ (Markdown 文件)    │
│                             │
│  - welcome.md               │
│  - article1.md              │
│  - article2.md              │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   index.html + script.js    │
│   (动态加载和解析)          │
│                             │
│  - 加载 Markdown            │
│  - 解析为 HTML              │
│  - 处理图片路径             │
│  - 渲染到页面               │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  article.html + article.js  │
│  (文章详情页面)             │
│                             │
│  - 单个文章渲染             │
│  - 目录生成                 │
│  - 代码高亮                 │
│  - 图片放大查看             │
└─────────────────────────────┘
```

### 路径处理

博客自动检测部署方式并调整路径：

```javascript
// 示例：访问 https://yourusername.github.io
PathConfig.getPostsPath('welcome.md')  // → ./posts/welcome.md

// 示例：访问 https://yourusername.github.io/my-blog/
PathConfig.getPostsPath('welcome.md')  // → ./my-blog/posts/welcome.md
```

---

## 本地开发

### 启动本地服务器

#### 方法 1：Python
```bash
# Python 3
python -m http.server 8000

# 或 Python 2
python -m SimpleHTTPServer 8000
```

#### 方法 2：Node.js
```bash
# 安装 http-server
npm install -g http-server

# 启动服务器
http-server -p 8000
```

#### 方法 3：Live Server (VS Code)
- 安装 Live Server 扩展
- 右键点击 `index.html`
- 选择 "Open with Live Server"

### 访问本地博客

打开浏览器，访问：`http://localhost:8000`

### 开发工作流

```bash
# 1. 编辑 posts/ 文件夹中的 markdown 文件
# 2. 刷新浏览器查看效果
# 3. 修改 style.css 或 script.js 后也需要刷新
# 4. 满意后提交并推送到 GitHub
git add -A
git commit -m "Add new article: xxx"
git push
```

---

## 发布文章

### 文章格式

每篇文章必须是 Markdown 文件，放在 `posts/` 文件夹中：

```markdown
---
title: "文章标题"
date: "2024-04-03"
category: "技术"
tags: ["JavaScript", "React"]
description: "一句话描述文章内容"
---

# 文章标题

正文内容...

## 小标题

更多内容...

```

### Front Matter 字段说明

| 字段 | 必需 | 说明 | 示例 |
|-----|------|------|------|
| title | ✓ | 文章标题 | "React 18 新特性" |
| date | ✓ | 发布日期 | "2024-04-03" |
| category | ✓ | 分类标签 | "技术"、"生活" |
| tags | ✓ | 文章标签 | ["React", "JavaScript"] |
| description | 否 | 文章摘要 | "在这篇文章中..." |

### 发布步骤

1. **创建文章**
   ```bash
   # 在 posts/ 文件夹中创建新文件
   touch posts/my-article.md
   ```

2. **编辑文章**
   - 使用你喜欢的编辑器编辑文件
   - 遵循 Front Matter 格式

3. **测试**
   - 启动本地服务器
   - 访问 `http://localhost:8000`
   - 检查文章是否正确显示

4. **提交和推送**
   ```bash
   git add posts/my-article.md
   git commit -m "Add article: my-article"
   git push
   ```

5. **验证 GitHub Pages**
   - 等待 1-2 分钟
   - 访问 `https://yourusername.github.io`
   - 检查新文章是否显示

---

## 图片处理

### 添加图片

#### 方法 1：本地图片（推荐）

1. **创建 images 文件夹**
   ```bash
   mkdir posts/images
   ```

2. **放置图片**
   ```bash
   # 将图片放在 posts/images/ 文件夹
   posts/
   ├── images/
   │   ├── screenshot.png
   │   ├── demo.jpg
   │   └── ...
   ├── article1.md
   └── article2.md
   ```

3. **在 Markdown 中引用**
   ```markdown
   ![图片描述](images/screenshot.png)
   
   ![演示](images/demo.jpg)
   ```

#### 方法 2：外部 URL（CDN）

```markdown
![图片描述](https://example.com/image.png)

![GitHub头像](https://avatars.githubusercontent.com/u/xxxxx?v=4)
```

#### 方法 3：Base64 编码

适合小图片：

```markdown
![icon](data:image/png;base64,iVBORw0KGgo...)
```

### 图片优化建议

- **尺寸**：不超过 2MB
- **格式**：PNG（截图）、JPG（照片）、WebP（现代格式）
- **压缩**：使用 TinyPNG、ImageOptim 等工具
- **分辨率**：1200px 宽度较为合适

### 图片功能

- ✅ 自动懒加载（`loading="lazy"`）
- ✅ 响应式设计
- ✅ 点击放大查看
- ✅ 错误处理和占位符
- ✅ 自动格式化和阴影

---

## 常见问题

### Q1: 部署后文章未显示？

**解决方案：**
1. 检查 GitHub Pages 是否已启用
   - 仓库 Settings → Pages → 检查状态
2. 确认文件名无中文（已改用英文）
3. 检查网络连接
4. 尝试 Ctrl+Shift+R 硬刷新浏览器
5. 检查浏览器控制台是否有错误

### Q2: 图片无法显示？

**解决方案：**
1. 检查图片路径是否正确
2. 确认图片文件存在于 `posts/images/` 中
3. 使用浏览器开发者工具（F12）检查实际请求的 URL
4. 如果使用外部 URL，确保 CDN 可访问
5. 尝试使用 GitHub 原始文件 URL：
   ```markdown
   ![图片](https://raw.githubusercontent.com/yourusername/repo/main/posts/images/image.png)
   ```

### Q3: 本地运行时报 CORS 错误？

**解决方案：**
- 不要使用 `file://` 协议打开 HTML
- 使用 Python、Node.js 或 VS Code Live Server
- 不要在浏览器中直接打开 HTML 文件

### Q4: 文章搜索功能不工作？

**解决方案：**
1. 确保文章有正确的 Front Matter
2. 检查文章内容不为空
3. 刷新页面重新加载文章列表
4. 检查控制台是否有错误信息

### Q5: 如何删除或编辑旧文章？

**步骤：**
```bash
# 删除文章
rm posts/old-article.md
git add -A
git commit -m "Remove old article"
git push

# 或编辑文章
# 编辑 posts/article.md
git add posts/article.md
git commit -m "Update article"
git push
```

### Q6: 如何更改博客标题和描述？

**文件：** `index.html`
```html
<title>Polarsky's Blog - 个人技术博客</title>
<h1 class="logo">Polarsky's Blog</h1>
<p class="tagline">探索技术，分享思考</p>
```

### Q7: 如何自定义样式？

编辑 `style.css` 文件，修改 CSS 变量：

```css
:root {
    --primary-color: #2563eb;      /* 主色调 */
    --accent-color: #f59e0b;       /* 强调色 */
    --text-primary: #1e293b;       /* 主文本色 */
    --background-color: #ffffff;  /* 背景色 */
}
```

---

## 进阶配置

### 启用代码高亮

博客已集成 Prism.js 代码高亮，支持的语言：

```markdown
\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`

\`\`\`bash
echo "Hello, World!"
\`\`\`
```

### 自定义代码主题

编辑 `article.html` 中的 Prism 样式链接：

```html
<!-- 改为其他主题 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css">
```

可用主题：
- `prism.min.css` - 默认亮色
- `prism-tomorrow.min.css` - Tonight 暗色
- `prism-atom-dark.min.css` - Atom 暗色

---

## 备份和恢复

### 定期备份

```bash
# 克隆完整仓库用于备份
git clone --mirror https://github.com/yourusername/yourusername.github.io.git backup.git

# 或使用 GitHub Desktop
```

### 恢复文章

如果不小心删除了文章，使用 Git：

```bash
# 查看提交历史
git log --oneline

# 恢复已删除的文件
git checkout <commit-hash> -- posts/article.md
```

---

## 获取帮助

- 📚 [GitHub Pages 官方文档](https://docs.github.com/pages)
- 📖 [Markdown 语法](https://commonmark.org/help/)
- 🎨 [CSS 参考](https://developer.mozilla.org/en-US/docs/Web/CSS)
- 💬 [常见问题论坛](https://github.com/orgs/community/discussions)

---

**最后更新：** 2024年4月3日

祝你部署顺利！✨
