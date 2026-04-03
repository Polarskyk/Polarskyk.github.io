# ✅ 测试和验证指南

本文档提供完整的测试清单，用于验证模块化系统和视频支持功能的正确运行。

## 📋 快速测试清单

### 一、环境准备

- [ ] 使用 HTTP 服务器运行本地测试
  ```bash
  # 选择一个命令运行
  python -m http.server 8000        # Python 3
  python -m SimpleHTTPServer 8000   # Python 2
  npx http-server                    # Node.js
  ```

- [ ] 访问 `http://localhost:8000` 打开首页
- [ ] 打开浏览器开发者工具 (F12)
- [ ] 检查 Console 标签页，查看日志

### 二、首页功能测试

#### 2.1 页面加载

- [ ] 页面正常加载，没有 404 错误
- [ ] 加载状态显示正常
- [ ] 页面标题为 "Polarsky's Blog - 个人技术博客"
- [ ] 导航栏显示正常
- [ ] 英雄区域显示正常
- [ ] 文章卡片显示正常
- [ ] 页脚显示正常

#### 2.2 模块加载

在浏览器控制台验证模块加载状态：

```javascript
// 应该显示已定义
console.log(typeof GITHUB_CONFIG)      // 'object'
console.log(typeof APP_CONFIG)         // 'object'
console.log(typeof PathConfig)         // 'object'
console.log(typeof MediaHandler)       // 'object'
console.log(typeof MarkdownRenderer)   // 'object'
console.log(typeof ArticleLoader)      // 'object'
```

预期输出：全部为 `'object'`

#### 2.3 文章加载

检查控制台日志：

```
✓ 初始化首页应用...
✓ 开始加载文章...
✓ 成功加载 X 篇文章
✓ 首页应用初始化完成
```

验证文章数据：

```javascript
// 在浏览器控制台运行
console.log(ArticleLoader.getAll())
// 应该显示包含所有文章对象的数组
```

#### 2.4 UI 功能

- [ ] 文章计数正确
- [ ] 分类标签显示正常
- [ ] 日期显示格式正确

### 三、搜索功能测试

#### 3.1 基本搜索

- [ ] 在搜索框输入 "JavaScript"
  - [ ] 页面响应迅速（应有 300ms 防抖）
  - [ ] 结果正确筛选出 JavaScript 相关文章
  - [ ] 搜索结果计数更新

- [ ] 在搜索框输入 "xxx"（不存在的关键词）
  - [ ] 显示 "没有找到文章" 提示
  - [ ] 页面不崩溃

#### 3.2 搜索范围

验证搜索涵盖的字段：

```javascript
// 在控制台运行
ArticleLoader.search('React')
// 应该搜索以下字段：
// - 标题 (title)
// - 描述 (description)
// - 分类 (category)
// - 标签 (tags)
```

### 四、分类筛选测试

#### 4.1 分类按钮

- [ ] 点击 "JavaScript" 标签
  - [ ] 显示 JavaScript 相关文章
  - [ ] 按钮显示 active 状态
  - [ ] 搜索框被清空

- [ ] 点击 "CSS" 标签
  - [ ] 显示 CSS 相关文章

- [ ] 点击 "全部" 标签
  - [ ] 显示所有文章

- [ ] 点击不存在的分类
  - [ ] 返回空结果（无崩溃）

### 五、文章详情页测试

#### 5.1 打开文章

- [ ] 点击文章卡片
  - [ ] 在新标签页打开 article.html
  - [ ] URL 包含正确的文件名参数
  - [ ] 文章内容加载正常

#### 5.2 Markdown 渲染

- [ ] 标题（#, ##, ###）显示正常
- [ ] 加粗、斜体、代码块显示正常
- [ ] 列表（有序、无序）显示正常
- [ ] 链接可点击并打开新标签页
- [ ] 表格格式正确

#### 5.3 代码高亮

- [ ] 代码块有语法高亮
- [ ] 不同语言的代码显示正确的颜色
- [ ] 复制按钮（如有）可使用

### 六、视频支持测试 🎬

#### 6.1 视频语法支持

创建测试文章 `posts/test-video.md`：

```markdown
---
title: 视频测试
date: 2024-01-01
category: Test
description: 测试所有视频类型
---

## YouTube 视频
@[youtube](dQw4w9WgXcQ)

## Vimeo 视频
@[vimeo](76979871)

## Bilibili 视频（如果可用）
@[bilibili](BV1xx411c7mD)

## 本地视频
![video](videos/sample.mp4)
```

#### 6.2 YouTube 视频

- [ ] 视频显示为响应式容器
- [ ] 宽高比为 16:9
- [ ] 可播放和暂停
- [ ] 全屏按钮可用
- [ ] 没有 CORS 错误

在控制台验证：
```javascript
// 检查嵌入 HTML
document.querySelector('iframe[src*="youtube"]')
// 应该返回 iframe 元素
```

#### 6.3 Vimeo 视频

- [ ] 同 YouTube 测试步骤
- [ ] iframe src 应包含 "vimeo.com"

#### 6.4 Bilibili 视频

- [ ] 同 YouTube 测试步骤
- [ ] iframe src 应包含 "bilibili.com"
- [ ] **注意**: 某些地区可能无法访问

#### 6.5 本地视频

1. 创建 `videos/` 目录（如不存在）
2. 放入一个 MP4 文件：`videos/sample.mp4`
3. 更新 `posts/index.json`
4. 验证：
   - [ ] 视频显示为 HTML5 `<video>` 元素
   - [ ] 可播放、暂停、调整音量
   - [ ] 显示进度条
   - [ ] 可全屏播放

在控制台验证：
```javascript
// 检查视频元素
document.querySelector('video')
// 应该返回 video 元素
```

### 七、图片处理测试

在包含图片的文章中测试：

#### 7.1 懒加载

- [ ] 滚动到图片位置时才加载
- [ ] Network 标签显示延迟加载

#### 7.2 错误处理

- [ ] 破损图片显示占位符
- [ ] 不显示 broken image 图标
- [ ] 控制台有友好的错误提示

#### 7.3 点击缩放

- [ ] 点击图片打开全屏查看器
- [ ] 显示全尺寸图片
- [ ] 点击关闭或按 ESC 关闭

### 八、响应式设计测试

#### 8.1 不同屏幕尺寸

使用浏览器开发者工具的设备模拟：

- [ ] **桌面** (1920x1080)
  - [ ] 多列布局
  - [ ] 导航栏正常

- [ ] **平板** (768x1024)
  - [ ] 两列或单列布局
  - [ ] 可触摸目标足够大

- [ ] **手机** (375x667)
  - [ ] 单列布局
  - [ ] 文本可读
  - [ ] 按钮可点击

- [ ] **超小屏** (320x568)
  - [ ] 页面不溢出
  - [ ] 文本不过小

#### 8.2 设备横屏

- [ ] 横屏显示正常
- [ ] 内容重排合理

### 九、自动更新测试

#### 9.1 定时检查

- [ ] 页面在后台持续运行时，定期检查更新
- [ ] （本地环境）每 30 秒检查一次
- [ ] （GitHub Pages）每 5 分钟检查一次

验证：在控制台观察日志

#### 9.2 新文章通知

1. 在后台标签页添加新文章到 `posts/index.json`
2. 等待检查周期
3. [ ] 应显示通知："发现 1 篇新文章！"
4. [ ] 文章列表自动更新

### 十、路径解析测试

#### 10.1 本地开发

```javascript
// 本地环境下
console.log(PathConfig.getBasePath())   // './'
console.log(PathConfig.getPostsPath())  // './posts/'
console.log(PathConfig.getHtmlPath('article.html'))  // './article.html'
```

#### 10.2 GitHub Pages (账户级)

在 `https://username.github.io` 部署后：

```javascript
console.log(PathConfig.isGitHubPages())  // true
console.log(PathConfig.isUserRepo())     // true
console.log(PathConfig.getBasePath())    // './'
```

#### 10.3 GitHub Pages (项目级)

在 `https://username.github.io/project` 部署后，更新 config.js 后：

```javascript
console.log(PathConfig.getBasePath())    // './project/' 或 './'（取决于配置）
```

### 十一、错误处理测试

#### 11.1 网络错误

- [ ] 禁用网络后浏览页面
  - [ ] 显示友好的错误提示
  - [ ] 页面不完全崩溃
  - [ ] 有重试选项

#### 11.2 无效 URL 参数

- [ ] 访问 `article.html?file=not-exist.md`
  - [ ] 显示 "文章不存在" 提示
  - [ ] 不显示 JavaScript 错误

#### 11.3 缺失文件

- [ ] 删除或移动文章文件后刷新
  - [ ] 文章从列表消失
  - [ ] 不显示加载错误

### 十二、性能测试

#### 12.1 首屏加载时间

使用开发者工具的 Performance 标签：

- [ ] 首页加载时间 < 3 秒
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] First Input Delay (FID) < 100ms

#### 12.2 内存使用

- [ ] 长时间使用不出现明显内存泄漏
- [ ] 页面切换不显著增加内存

### 十三、浏览器兼容性测试

#### 13.1 现代浏览器

- [ ] Chrome / Edge (最新)
- [ ] Firefox (最新)
- [ ] Safari (如有 Mac)

#### 13.2 兼容性处理

- [ ] 检查是否使用了 IE 不支持的 API
- [ ] CSS 变量兼容性

### 十四、部署前检查

- [ ] 所有模块文件存在且路径正确
- [ ] index.html 和 article.html 都引入了所有脚本
- [ ] posts/index.json 格式正确
- [ ] 没有控制台错误
- [ ] 没有 404 请求
- [ ] 视频文件（如有）已上传

### 十五、GitHub Pages 部署测试

部署后的检查：

- [ ] 访问 `https://Polarskyk.github.io` 可打开
- [ ] 所有资源都能加载（检查 Network 标签）
- [ ] 没有 CORS 错误
- [ ] 文章列表正确加载
- [ ] 视频正常播放
- [ ] 搜索功能正常

---

## 🐛 常见问题排查

### 问题：模块未定义

**症状**: 控制台错误 `TypeError: XXX is not defined`

**排查步骤**:
1. 检查 index.html 是否引入了所有脚本
2. 检查脚本顺序是否正确
3. 检查文件路径是否正确
4. 刷新页面（Ctrl+F5 强制刷新）

### 问题：文章加载失败

**症状**: 显示 "加载失败，请刷新页面重试"

**排查步骤**:
1. 检查 posts/index.json 是否存在并格式正确
2. 检查 CORS 设置（GitHub API 是否可访问）
3. 检查网络连接
4. 查看控制台详细错误信息

### 问题：视频无法显示

**症状**: 视频容器为空或显示错误

**排查步骤**:
1. 检查视频 ID 或路径是否正确
2. 检查网络连接
3. 检查浏览器控制台的 CORS 或其他错误
4. 尝试其他浏览器

### 问题：搜索无结果

**症状**: 搜索任何关键词都无结果

**排查步骤**:
1. 检查是否有文章被加载
2. 检查关键词是否真的存在于文章中
3. 清空开发者缓存
4. 刷新页面

---

## 📊 测试报告模板

使用以下模板记录测试结果：

```markdown
# 测试报告

**日期**: 2024-01-XX  
**测试环境**: Chrome 120 | MacOSX | 1920x1080  
**测试者**: [名字]  

## 测试结果总结

- ✅ 通过: XX/XX

### 通过的测试
- ✅ 首页加载
- ✅ 文章搜索
- ...

### 失败的测试
- ❌ 视频播放 (YouTube 视频加载超时)
- ...

### 问题详情

1. **问题**: YouTube 视频加载超时
   - **重现步骤**: 打开包含 YouTube 视频的文章
   - **预期**: 视频在 2 秒内加载
   - **实际**: 视频加载超时
   - **环境**: Chrome 120, 2G 网络模拟
   - **解决方案**: (待处理)

### 建议

- [ ] 添加视频加载超时提示
- [ ] 优化网络请求

---
```

## ✨ 完成标记

当所有测试都通过后，在项目根目录创建 `.test-passed` 文件标记：

```bash
date > .test-passed
```

---

**祝测试顺利！** 🎉
