# 🏗️ 项目架构文档

_最后更新: 2024年 | 版本: 2.0_

## 📋 目录

1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [目录结构](#目录结构)
4. [模块架构](#模块架构)
5. [核心模块说明](#核心模块说明)
6. [数据流](#数据流)
7. [配置系统](#配置系统)
8. [部署指南](#部署指南)

---

## 项目概述

这是一个现代化的个人技术博客系统，支持在 GitHub Pages 上部署。特点包括：

- ✅ **完全静态化**: 无需服务器，直接部署到 GitHub Pages
- ✅ **模块化架构**: 清晰的职责分离，易于维护和扩展
- ✅ **Markdown 支持**: 文章使用 Markdown 编写，自动解析和渲染
- ✅ **视频支持**: 支持 YouTube、Vimeo、Bilibili 和本地视频
- ✅ **响应式设计**: 适配所有屏幕尺寸
- ✅ **搜索和筛选**: 快速搜索文章和按分类筛选
- ✅ **自动更新**: 文章列表自动滑动检查更新

---

## 技术栈

### 前端技术
| 层级 | 技术 | 说明 |
|------|------|------|
| **HTML** | HTML5 | 语义化标记 |
| **CSS** | CSS3 | Grid/Flexbox 布局，CSS 变量 |
| **JavaScript** | Vanilla JS (ES6+) | 无框架依赖，轻量级 |

### 第三方库
| 库 | 用途 | 版本 |
|---|------|------|
| [marked.js](https://marked.js.org/) | Markdown 解析 | v5.1.2 |
| [Prism.js](https://prismjs.com/) | 代码高亮 | v1.29.0 |

### 部署平台
- **GitHub Pages**: 静态网站托管
- **GitHub API**: 文章列表获取
- **CDN**: 脚本和样式加载

---

## 目录结构

```
Polarskyk.github.io/
├── index.html                 # 首页
├── article.html              # 文章详情页
├── style.css                 # 全局样式
├── script.js                 # 原始脚本（保留向后兼容）
│
├── js/                       # 🆕 模块化 JavaScript
│   ├── config.js            # 配置管理
│   ├── media-handler.js     # 媒体处理（图片/视频）
│   ├── markdown-renderer.js # Markdown 渲染
│   ├── article-loader.js    # 文章加载
│   └── index-main.js        # 首页主脚本
│
├── utils/                    # 🆕 实用工具（预留）
│
├── posts/                    # 文章目录
│   ├── index.json           # 文章索引
│   ├── welcom.md            # 介绍文章
│   ├── javascript-*.md      # JavaScript 系列
│   ├── react-*.md           # React 系列
│   ├── css-*.md             # CSS 系列
│   ├── nodejs-*.md          # Node.js 系列
│   └── ...                  # 其他文章
│
├── README.md                # 项目说明
├── VIDEO_GUIDE.md           # 视频支持指南
├── ARCHITECTURE.md          # 架构文档（本文件）
├── .nojekyll                # GitHub Pages 配置
│
├── 启动博客.bat             # Windows 启动脚本
├── start.bat                # 启动脚本
└── 使用指南.txt             # 用户指南
```

---

## 模块架构

### 架构设计模式

系统采用**分层模块化架构**，从下到上分为：

```
┌─────────────────────────────────────────┐
│          用户界面层                       │
│    (index-main.js + article.html)       │
├─────────────────────────────────────────┤
│       业务逻辑层                         │
│  (article-loader.js,                    │
│   markdown-renderer.js)                 │
├─────────────────────────────────────────┤
│       工具层                             │
│  (media-handler.js)                     │
├─────────────────────────────────────────┤
│      配置层 (单一数据源)                 │
│      config.js (GITHUB_CONFIG,          │
│                 APP_CONFIG,             │
│                 PathConfig)             │
└─────────────────────────────────────────┘
```

### 依赖关系图

```
config.js (零依赖)
    ↓
    ├── media-handler.js
    ├── markdown-renderer.js  
    └── article-loader.js
        ↓
        ├── index-main.js (首页)
        └── article.html (文章详情页)
```

### 关键特性

✅ **单一职责**: 每个模块只处理一种类型的任务  
✅ **松耦合**: 模块通过配置对象通信  
✅ **易测试**: 可独立测试每个模块  
✅ **易扩展**: 添加新功能不需修改现有模块  

---

## 核心模块说明

### 1️⃣ config.js - 配置管理

**职责**: 统一管理应用配置、路径解析、环境检测

**导出对象**:
```javascript
GITHUB_CONFIG       // GitHub 仓库配置
APP_CONFIG         // 应用级配置
PathConfig         // 路径解析工具
```

**关键功能**:
- 检测部署环境（GitHub Pages / 本地）
- 自动路径解析（支持账户级和项目级仓库）
- 管理刷新间隔、视频配置等

**体积**: ~130 行  
**依赖**: 无  

### 2️⃣ media-handler.js - 媒体处理

**职责**: 处理图片和视频的加载、渲染、错误处理

**主要方法**:
```javascript
MediaHandler.processImages(container)        // 处理图片
MediaHandler.processVideos(container)       // 处理视频
MediaHandler.processEmbeddedVideos(...)     // 处理嵌入式视频
MediaHandler.openImageViewer(src, alt)      // 打开图片查看器
MediaHandler.detectVideoType(url)           // 检测视频类型
```

**特性**:
- 图片懒加载
- 点击缩放
- 视频错误处理
- 响应式容器
- 16:9 宽高比保持

**体积**: ~220 行  
**依赖**: config.js  

### 3️⃣ markdown-renderer.js - Markdown 渲染

**职责**: 将 Markdown 文本转换为 HTML，支持自定义规则

**主要方法**:
```javascript
MarkdownRenderer.configure()           // 配置 marked.js
MarkdownRenderer.parse(content)        // 解析 Markdown
MarkdownRenderer.preprocessVideos(...) // 预处理视频语法
```

**支持的视频语法**:
```markdown
@[youtube](videoId)      // YouTube
@[vimeo](videoId)        // Vimeo  
@[bilibili](videoId)     // Bilibili
![video](path/video.mp4) // 本地视频
```

**体积**: ~280 行  
**依赖**: config.js  
**集成**: marked.js v5.1.2  

### 4️⃣ article-loader.js - 文章加载

**职责**: 管理文章的加载、解析、缓存、搜索和筛选

**主要方法**:
```javascript
ArticleLoader.loadAll()              // 加载所有文章
ArticleLoader.getAll()               // 获取所有文章
ArticleLoader.search(query)          // 搜索文章
ArticleLoader.filterByCategory(cat)  // 按分类筛选
ArticleLoader.getFiltered()          // 获取上次筛选结果
```

**加载策略** (多层回退):
1. GitHub API → 获取 posts 文件夹内容
2. posts/index.json → 本地索引
3. 动态发现 → 尝试预定义文件
4. 回退方案 → 使用缓存文件列表

**缓存系统**:
```javascript
ArticleLoader.cache = {
    articles: [],           // 所有文章
    filtered: [],           // 筛选结果
    lastUpdateTime: 0       // 最后更新时间
}
```

**Front Matter 支持**:
```markdown
---
title: 文章标题
date: 2024-01-01
category: JavaScript
tags: [js, es6]
description: 简短描述
---

## 文章内容
```

**体积**: ~320 行  
**依赖**: config.js  

### 5️⃣ index-main.js - 首页主脚本

**职责**: 协调首页的文章加载、渲染、搜索和筛选

**主要方法**:
```javascript
renderArticles(articles)           // 渲染文章卡片
handleSearch(e)                    // 搜索处理
handleCategoryFilter(e)            // 分类筛选处理
setupAutoRefresh()                 // 自动刷新
refreshArticles()                  // 手动刷新
```

**功能**:
- 文章列表渲染（卡片式）
- 实时搜索（防抖）
- 分类筛选
- 自动刷新检查
- 动态计数
- 通知提示

**体积**: ~480 行  
**依赖**: config.js, article-loader.js  

---

## 数据流

### 首页加载流程

```
用户访问 index.html
          ↓
DOMContentLoaded 事件触发
          ↓
index-main.js 初始化
          ↓
ArticleLoader.loadAll()
          ├─→ 尝试 GitHub API
          ├─→ 尝试 index.json
          ├─→ 动态发现
          └─→ 回退方案
          ↓
解析 Front Matter 和内容
          ↓
存储到 cache
          ↓
renderArticles() 渲染首页
          ↓
setupEventListeners() 监听事件
          ↓
setupAutoRefresh() 启动自动检查
          ↓
页面显示完成 ✓
```

### 文章详情加载流程

```
用户点击文章或访问 article.html?file=xxx.md
          ↓
DOMContentLoaded 事件触发
          ↓
获取 URL 参数中的文件名
          ↓
ArticleLoader.loadAll()
          ↓
定位到特定文章
          ↓
MarkdownRenderer.configure()
          ↓
MarkdownRenderer.parse(content)
    ├─→ preprocessVideos() 处理视频语法
    ├─→ marked.parse() Markdown 转 HTML
    └─→ 返回 HTML
          ↓
MediaHandler.processImages()
          ├─→ 懒加载
          ├─→ 错误处理
          └─→ 点击缩放
          ↓
MediaHandler.processVideos()
          ├─→ 配置视频属性
          ├─→ 处理嵌入式视频
          └─→ 响应式容器
          ↓
Prism.js 高亮代码块
          ↓
页面显示完成 ✓
```

### 搜索流程

```
用户在搜索框输入
          ↓
防抖延迟 (300ms)
          ↓
handleSearch()
          ↓
ArticleLoader.search(query)
          ├─→ 全文搜索（标题、描述、标签、分类）
          └─→ 返回匹配结果
          ↓
renderArticles(results)
          ↓
更新首页显示 ✓
```

---

## 配置系统

### 部署环境检测

PathConfig 自动检测部署环境并设置正确的路径：

```javascript
// 检测账户级仓库 (username.github.io)
if (PathConfig.isUserRepo()) {
    基础路径 = './'
}

// 检测项目级仓库 (username.github.io/project-name)
else if (PathConfig.isGitHubPages()) {
    基础路径 = './project-name/'
}

// 本地开发
else {
    基础路径 = './'
}
```

### 路径工具方法

```javascript
PathConfig.getBasePath()        // 获取基础路径前缀
PathConfig.getPostsPath(name)   // 获取文章路径
PathConfig.getAssetPath(path)   // 获取资源路径
PathConfig.getHtmlPath(name)    // 获取 HTML 路径
PathConfig.getJsPath(name)      // 获取 JS 路径
PathConfig.getCssPath(name)     // 获取 CSS 路径
```

### 应用配置项

```javascript
APP_CONFIG = {
    refreshInterval: 30000,              // 本地检查间隔 (ms)
    refreshIntervalOnline: 300000,       // 在线检查间隔 (ms)
    searchDebounceDelay: 300,            // 搜索防抖延迟 (ms)
    
    imageConfig: {
        enableLazyLoad: true,
        enableClickZoom: true,
        enableErrorHandling: true
    },
    
    videoConfig: {
        enableLazyLoad: true,
        autoplay: false,
        controls: true,
        muted: false,
        loop: false
    }
}
```

---

## 部署指南

### GitHub Pages 部署

#### 账户级仓库 (`username.github.io`)

1. 创建仓库 `Polarskyk.github.io`
2. 启用 GitHub Pages (默认 main 分支)
3. 访问 `https://Polarskyk.github.io`

配置自动正确，无需修改 PathConfig

#### 项目级仓库 (`username.github.io/blog`)

1. 创建普通仓库 `blog`
2. 启用 GitHub Pages
3. 访问 `https://Polarskyk.github.io/blog`

更新 config.js:
```javascript
GITHUB_CONFIG.repo = 'blog';
```

### 本地开发

使用 HTTP 服务器（**不支持** file:// 协议）:

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx http-server

# 使用 PHP
php -S localhost:8000
```

访问 `http://localhost:8000`

### 添加新文章

1. 創建 `posts/my-article.md`

```markdown
---
title: 我的文章标题
date: 2024-01-01
category: JavaScript
tags: [js, es6, advanced]
description: 文章简述
---

## 文章内容

你的 Markdown 内容...

@[youtube](dQw4w9WgXcQ)

![图片](images/demo.png)
```

2. 更新 `posts/index.json`:

```json
{
    "files": [
        {
            "filename": "my-article.md",
            "title": "我的文章标题",
            "date": "2024-01-01",
            "category": "JavaScript",
            "tags": ["js", "es6"],
            "description": "文章简述"
        }
    ]
}
```

3. 提交并推送到 GitHub
4. 页面自动更新（检查间隔 5 分钟）

---

## 扩展指南

### 添加新媒体类型

在 `markdown-renderer.js` 中添加新的视频平台：

```javascript
// 在 preprocessVideos 中添加
else if (/^youknow:\/\//.test(url)) {
    return createYouKnowEmbed(videoId);
}

// 添加创建函数
function createYouKnowEmbed(videoId) {
    return `<div class="video-container">
        <iframe src="https://youknow.com/embed/${videoId}"></iframe>
    </div>`;
}
```

### 自定义样式

编辑 `style.css` 中的 CSS 变量：

```css
:root {
    --primary-color: #2563eb;
    --surface-color: #f3f4f6;
    --text-primary: #1f2937;
    --shadow-lg: 0 20px 25px rgba(0,0,0,0.1);
}
```

### 添加新功能

在 `ArticleLoader` 中添加新方法：

```javascript
ArticleLoader.getRecommended() {
    // 返回推荐文章
}

ArticleLoader.sortByDate() {
    // 按日期排序
}
```

---

## 性能优化

### 已实现的优化

✅ **模块化加载**: 按需加载脚本  
✅ **懒加载**: 延迟加载图片和视频  
✅ **防抖**: 搜索输入防抖  
✅ **缓存**: 文章数据本地缓存  
✅ **CDN**: 第三方库使用 CDN  
✅ **最小化**: CSS 和 JS 简化  

### 进一步优化建议

🔮 **Service Worker**: 离线支持  
🔮 **预加载**: 预加载常见资源  
🔮 **分页**: 大量文章分页加载  
🔮 **压缩**: Gzip 压缩  

---

## 故障排除

### 问题：文章无法加载

**原因**: 
- GitHub API 速率限制
- 网络连接问题
- 文件格式错误

**解决**:
```javascript
// 检查 index.json 格式
// 验证 front matter 语法
// 查看浏览器控制台错误
```

### 问题：视频无法显示

**原因**:
- 视频 ID 错误
- 平台不可访问
- 文件路径错误

**解决**:
```javascript
// 检查视频 ID 是否正确
// 确认视频是否公开
// 验证文件路径
// 查看控制台 CORS 错误
```

---

## 版本历史

| 版本 | 日期 | 主要更新 |
|------|------|---------|
| **2.0** | 2024-01 | ✨ 模块化重构，视频支持 |
| 1.5 | 2023-12 | 自动更新检查 |
| 1.0 | 2023-11 | 初始版本 |

---

## 贡献指南

欢迎提交 Pull Request！

改进方向：
- [ ] 单元测试
- [ ] E2E 测试
- [ ] 黑暗模式
- [ ] 国际化
- [ ] 更多视频平台

---

## 许可证

MIT License - 自由使用和修改

---

**保持好奇，不断学习！** 🚀
