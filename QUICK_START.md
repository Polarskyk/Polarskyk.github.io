# 🎯 快速入门 - 3 步启动你的 GitHub 博客

## 第 1 步：本地测试（5 分钟）

### 1.1 启动本地服务器

在项目文件夹中打开终端，运行：

```bash
# Windows
python -m http.server 8000

# 或 macOS/Linux
python3 -m http.server 8000
```

### 1.2 打开浏览器

访问：`http://localhost:8000`

✅ 如果看到博客首页，说明本地运行成功！

---

## 第 2 步：部署到 GitHub Pages（10 分钟）

### 2.1 修改配置

编辑 `script.js` 文件，找到这一部分：

```javascript
const GITHUB_CONFIG = {
    owner: 'Polarskyk',          // ← 改成你的 GitHub 用户名
    repo: 'Polarskyk.github.io',  // ← 改成你的仓库名
    branch: 'main',
    postsPath: 'posts'
};
```

### 2.2 推送到 GitHub

```bash
# 1. 添加所有文件
git add -A

# 2. 提交
git commit -m "Deploy blog to GitHub Pages"

# 3. 推送
git push -u origin main
```

### 2.3 启用 GitHub Pages

1. 打开你的仓库
2. 进入 **Settings → Pages**
3. 选择 **Deploy from a branch**
4. Branch 选择 `main`，目录选择 `/ (root)`
5. 点击 Save

✅ 等待 1-2 分钟！

---

## 第 3 步：访问你的博客！

打开浏览器访问：

- **账户级**：`https://yourusername.github.io`
- **项目级**：`https://yourusername.github.io/your-repo`

---

## 发布你的第一篇文章（5 分钟）

### 创建新文章

在 `posts/` 文件夹中创建 `my-article.md`：

```markdown
---
title: "我的第一篇文章"
date: "2024-04-03"
category: "技术"
tags: ["开始"]
description: "这是我的第一篇文章"
---

# 我的第一篇文章

你好，世界！

这是我的第一篇博客文章。

## 代码示例

\`\`\`javascript
console.log('Hello, GitHub Pages!');
\`\`\`
```

### 添加图片（可选）

1. 在 `posts` 文件夹中创建 `images` 文件夹
2. 放入你的图片
3. 在文章中引用：

```markdown
![我的图片](images/my-image.png)
```

### 推送文章

```bash
git add -A
git commit -m "Add my first article"
git push
```

✅ 1-2 分钟后刷新博客页面，新文章就会出现！

---

## 完整文档

需要更详细的信息？查看这些文档：

| 文档 | 用途 |
|------|------|
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | 完整的部署指南，包括常见问题解决 |
| [UPDATE_GUIDE.md](./UPDATE_GUIDE.md) | 快速参考，Markdown 语法和模板 |
| [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md) | 了解所有的优化内容 |
| [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md) | 部署前的检查清单 |

---

## 新增功能

### 📸 图片处理

- ✅ 自动处理相对路径
- ✅ 支持本地图片
- ✅ 支持外部 URL
- ✅ 点击放大查看
- ✅ 自动懒加载
- ✅ 错误处理

### 🌐 路径优化

- ✅ 自动检测部署方式
- ✅ 支持账户级部署（username.github.io）
- ✅ 支持项目级部署（username.github.io/repo）
- ✅ 支持本地开发
- ✅ 支持自定义域名

### 📚 完整文档

- ✅ 部署指南
- ✅ 更新指南
- ✅ 优化总结
- ✅ 验证清单

---

## 常见问题 (FAQ)

**Q: 发布后为什么看不到新文章？**

A: 等待 1-2 分钟，然后按 Ctrl+Shift+R 硬刷新浏览器。

**Q: 图片无法显示？**

A: 确保图片在 `posts/images/` 文件夹中，并在 Markdown 中正确引用。

**Q: 本地运行时出现错误？**

A: 确保使用 `python -m http.server` 启动服务器，不要直接打开 HTML 文件。

**Q: 如何修改博客标题和描述？**

A: 编辑 `index.html` 中的这两行：
```html
<h1 class="logo">Polarsky's Blog</h1>
<p class="tagline">探索技术，分享思考</p>
```

**Q: 可以自定义样式吗？**

A: 可以！编辑 `style.css` 文件修改样式。

---

## 你现在已经拥有

✅ 一个完全静态的 GitHub Pages 博客
✅ 支持 Markdown 文章
✅ 搜索和分类功能
✅ 图片处理和显示
✅ 代码高亮
✅ 响应式设计
✅ 自动化路径处理
✅ 详细的文档

---

## 下一步

1. 📝 编写你的第一篇文章
2. 🚀 推送到 GitHub
3. 🎉 分享你的博客链接

---

**祝你写作愉快！✍️**

有任何问题，查看完整文档或 GitHub Issues。
