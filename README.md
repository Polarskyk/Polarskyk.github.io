# Polarsky's Personal Blog

一个精美的个人博客网站，支持动态加载Markdown文章，完全兼容GitHub Pages。

## ✨ 特性

- � **动态文章加载**: 自动发现和加载posts文件夹中的Markdown文件
- 🎨 **现代化设计**: 响应式布局，支持暗色/亮色主题切换
- 🔍 **智能搜索**: 实时搜索文章标题和内容
- 🏷️ **文章分类**: 支持标签过滤和分类浏览
- 📱 **移动优化**: 完美适配各种设备屏幕
- � **GitHub Pages**: 完全兼容GitHub Pages部署
- � **动画效果**: 流畅的页面动画和交互效果

## 🚀 本地开发

### 方法一：使用启动脚本（推荐）
双击运行 `启动博客.bat` 文件，脚本会自动：
- 检查Python环境
- 启动HTTP服务器
- 打开浏览器

### 方法二：手动启动
```bash
# 在项目目录下运行
python -m http.server 8000

# 然后访问
http://localhost:8000
```

⚠️ **重要**: 不要直接双击HTML文件，必须通过HTTP服务器访问才能正常工作。

##  项目结构

```
Polarskyk.github.io/
├── index.html          # 主页
├── article.html        # 文章详情页
├── style.css           # 样式文件
├── script.js           # 核心JavaScript
├── 启动博客.bat         # 启动脚本
├── posts/              # 文章目录
│   ├── index.json      # 文章索引
│   └── *.md            # Markdown文章
└── README.md           # 说明文档
```

## ✍️ 添加文章

1. 在 `posts/` 文件夹中创建新的 `.md` 文件
2. 添加文章元信息（可选）：

```markdown
---
title: "文章标题"
date: "2024-01-01"
tags: ["JavaScript", "前端"]
description: "文章描述"
---

# 文章内容

这里是正文...
```

3. 博客会自动发现并加载新文章

## 🌐 GitHub Pages部署

1. 将项目上传到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择主分支作为发布源
4. 访问 `https://yourusername.github.io/repository-name`

## 🎨 自定义主题

编辑 `style.css` 中的CSS变量来自定义主题：

```css
:root {
  --primary-color: #007acc;
  --background-color: #ffffff;
  --text-color: #333333;
  /* 更多变量... */
}
```

## � 响应式设计

博客完全响应式，支持：
- 桌面端 (1200px+)
- 平板端 (768px-1199px)
- 手机端 (<768px)

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, Vanilla JavaScript
- **Markdown解析**: marked.js
- **代码高亮**: Prism.js
- **图标**: 自定义SVG图标
- **部署**: GitHub Pages

## 📝 许可证

MIT License

---

💖 **Polarsky's Blog** - 用心打造的个人博客系统

```javascript
// 在setupAutoRefresh函数中修改间隔时间
setInterval(async () => {
    // 检查新文章逻辑
}, 30000); // 30秒检查一次，可以修改这个值
```

## 🎨 自定义样式

### 修改主题色彩

在 `style.css` 中的CSS变量部分：

```css
:root {
    --primary-color: #2563eb;      /* 主色调 */
    --accent-color: #f59e0b;       /* 强调色 */
    --background-color: #ffffff;    /* 背景色 */
    /* 更多变量... */
}
```

### 添加自定义功能

可以在 `script.js` 中添加自己的功能函数，例如：
- 深色模式切换
- 文章收藏功能
- 评论系统
- 分享功能

## 📱 部署到GitHub Pages

1. **推送代码到GitHub仓库**
2. **在仓库设置中启用GitHub Pages**
3. **注意**: GitHub Pages只支持静态文件，API服务器功能需要其他托管服务

### 静态部署注意事项

如果部署到静态托管服务，动态发现功能将不可用，需要：
1. 手动维护文章列表
2. 或者使用GitHub Actions等CI/CD工具自动生成文章索引

## 🔍 故障排除

### 文章不显示
1. 检查Markdown文件的Front Matter格式
2. 确保API服务器正在运行
3. 检查浏览器控制台的错误信息

### CORS错误
1. 确保API服务器设置了正确的CORS头
2. 使用Chrome时可以添加 `--disable-web-security` 标志用于本地测试

### 文章内容为空
1. 检查文件编码是否为UTF-8
2. 确保文件路径正确
3. 检查文件权限

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License - 详见LICENSE文件

## 🙏 致谢

- [Marked.js](https://marked.js.org/) - Markdown解析
- [Prism.js](https://prismjs.com/) - 代码高亮
- [Inter字体](https://rsms.me/inter/) - 优秀的字体选择
