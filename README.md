# Polarsky's Dynamic Blog

一个能够自动发现和动态加载markdown文章的精美个人博客系统。

## ✨ 特性

- 🚀 **动态文章加载**: 自动发现posts文件夹中的所有markdown文件
- 🔄 **实时更新**: 自动检测新文章并更新列表
- 🔍 **强大搜索**: 支持标题、内容、标签、分类搜索
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 🎨 **现代化UI**: 精美的界面设计和流畅动画
- 📝 **Markdown支持**: 完整的Markdown语法和代码高亮
- 🏷️ **分类过滤**: 按分类和标签筛选文章
- 📋 **自动目录**: 自动生成文章目录导航

## 🚀 快速开始

### 方法一：使用Python API服务器（推荐）

1. **启动API服务器**
```bash
python api-server.py
```

2. **启动Web服务器**
```bash
# 在另一个终端窗口中运行
python -m http.server 8000
```

3. **访问博客**
打开浏览器访问: http://localhost:8000

### 方法二：使用Node.js API服务器

1. **安装依赖**
```bash
npm install
```

2. **启动API服务器**
```bash
npm start
```

3. **启动Web服务器**
```bash
# 在另一个终端窗口中运行
npm run serve
```

### 方法三：仅静态文件（功能有限）

如果不需要动态发现功能，可以直接启动Web服务器：

```bash
python -m http.server 8000
```

## 📝 添加文章

1. **创建Markdown文件**
   在 `posts/` 目录中创建新的 `.md` 文件

2. **添加Front Matter**
   在文件开头添加元数据：
```markdown
---
title: "文章标题"
date: "2024-08-26"
category: "分类名称"
tags: ["标签1", "标签2"]
description: "文章描述"
---

# 文章内容开始...
```

3. **自动发现**
   - 如果使用API服务器，文章会自动被发现
   - 页面会在30秒内自动刷新显示新文章
   - 也可以点击右下角的刷新按钮手动更新

## 📁 目录结构

```
Polarskyk.github.io/
├── index.html              # 主页面
├── article.html            # 文章详情页
├── style.css               # 样式文件
├── script.js               # 前端逻辑
├── api-server.py           # Python API服务器
├── server.js               # Node.js API服务器
├── package.json            # Node.js配置
├── posts/                  # 文章目录
│   ├── welcome.md
│   ├── javascript-es2024-features.md
│   ├── css-grid-flexbox-comparison.md
│   ├── react-18-concurrent-features.md
│   └── ...
└── api/                    # PHP API（可选）
    └── get-posts.php
```

## 🔧 配置说明

### API服务器配置

在 `script.js` 中可以修改以下配置：

```javascript
// API配置
const API_BASE_URL = 'http://localhost:3001/api';  // API服务器地址
const FALLBACK_MODE = true;  // 是否启用回退模式
```

### 自动刷新间隔

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
