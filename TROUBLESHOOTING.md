# 🔧 文章详细页加载失败 - 诊断指南

## 问题症状

文章详细页（article.html）无法正常加载文章，可能出现以下情况：
- 显示加载状态后一直无反应
- 显示"文章加载失败"错误
- 页面部分显示但缺少文章内容

## 📋 快速诊断步骤

### 第一步：打开浏览器开发者工具

1. 在 article.html 页面按 **F12** 打开开发者工具
2. 选择 **Console** 标签页
3. 查看是否有红色错误信息

### 第二步：检查常见错误

#### ❌ 错误: `TypeError: PathConfig is not defined`

**原因**: config.js 模块加载失败

**解决方案**:
1. 检查 Network 标签页
2. 查找 `js/config.js` 
3. 如果状态显示 404（红色），说明文件路径错误或文件不存在
4. 验证文件确实存在：`c:\Users\14265\Desktop\Polarskyk.github.io\js\config.js`

#### ❌ 错误: `TypeError: MarkdownRenderer is not defined`

**原因**: markdown-renderer.js 或 config.js 加载失败

**解决方案**:
1. 检查 Network 标签页中所有脚本的加载状态
2. 检查脚本加载的顺序（应该是：config.js → media-handler.js → markdown-renderer.js → article-loader.js）
3. 查看 Console 中的错误信息

#### ❌ 错误: `TypeError: MediaHandler is not defined`

**原因**: media-handler.js 加载失败

**解决方案**:
1. 在 Network 标签页查检 `js/media-handler.js` 的状态
2. 如果是 404，检查文件是否存在
3. 如果是其他错误，查看文件是否有 JavaScript 语法错误

#### ❌ 错误: `Failed to fetch ... posts/xxx.md`

**原因**: 文章文件不存在或路径错误

**解决方案**:
1. 检查 URL 参数中的文件名是否正确
2. 例如：`article.html?file=welcome.md`
3. 验证文件是否存在：`posts/welcome.md`
4. 检查是否使用了正确的分隔符（应该是 `/` 而不是 `\`）

### 第三步：执行控制台诊断

在 Console 中逐一运行以下命令，查看输出：

```javascript
// 1. 检查 PathConfig 是否已加载
typeof PathConfig !== 'undefined' ? '✓ PathConfig 已加载' : '✗ PathConfig 未加载'

// 2. 检查基础路径
PathConfig.getBasePath()

// 3. 检查 posts 路径
PathConfig.getPostsPath('welcome.md')

// 4. 检查其他模块
typeof MarkdownRenderer !== 'undefined' ? '✓ MarkdownRenderer 已加载' : '✗ MarkdownRenderer 未加载'
typeof MediaHandler !== 'undefined' ? '✓ MediaHandler 已加载' : '✗ MediaHandler 未加载'
typeof ArticleLoader !== 'undefined' ? '✓ ArticleLoader 已加载' : '✗ ArticleLoader 未加载'

// 5. 检查 marked 和 Prism
typeof marked !== 'undefined' ? '✓ marked 已加载' : '✗ marked 未加载'
typeof Prism !== 'undefined' ? '✓ Prism 已加载' : '✗ Prism 未加载'
```

**预期输出**:
```
'✓ PathConfig 已加载'
'./'
'./posts/welcome.md'
'✓ MarkdownRenderer 已加载'
'✓ MediaHandler 已加载'
'✓ ArticleLoader 已加载'
'✓ marked 已加载'
'✓ Prism 已加载'
```

### 第四步：检查网络请求

在 Network 标签页：

1. 刷新页面（F5）
2. 检查所有脚本的加载状态：
   ```
   ✓ config.js       - 状态: 200
   ✓ media-handler.js - 状态: 200
   ✓ markdown-renderer.js - 状态: 200
   ✓ article-loader.js - 状态: 200
   ```

3. 检查文章文件的加载：
   ```
   ✓ posts/xxx.md - 状态: 200
   ```

如果任何文件显示 404 或其他错误，那就是问题所在。

## 🆘 常见问题及解决方案

### 问题 1: 本地测试时文件加载失败

**症状**: 从地址栏直接打开 HTML 文件（file:// 协议）

**原因**: 浏览器安全政策不允许 file:// 协议加载其他文件

**解决**:
```bash
# 使用 Python 启动 HTTP 服务器
cd c:\Users\14265\Desktop\Polarskyk.github.io
python -m http.server 8000

# 或使用 Node.js
npx http-server

# 然后访问
http://localhost:8000
```

### 问题 2: 模块脚本路径错误

**症状**: Network 标签显示 `js/config.js` 返回 404

**原因**: 
- 文件实际位置与脚本中的路径不匹配
- 在 GitHub Pages 上可能需要修改路径前缀

**解决**:

检查你的部署环境：

```javascript
// 在 Console 中运行
console.log('部署环境信息:');
console.log('- Hostname:', window.location.hostname);
console.log('- Pathname:', window.location.pathname);
console.log('- Protocol:', window.location.protocol);
console.log('- Base Path:', PathConfig ? PathConfig.getBasePath() : 'N/A');
```

**预期输出示例**:

- **本地开发**:
  ```
  - Hostname: localhost
  - Pathname: /article.html
  - Protocol: http:
  - Base Path: ./
  ```

- **GitHub Pages (账户级)**:
  ```
  - Hostname: polarskyk.github.io
  - Pathname: /article.html
  - Protocol: https:
  - Base Path: ./
  ```

- **GitHub Pages (项目级)**:
  ```
  - Hostname: polarskyk.github.io
  - Pathname: /my-blog/article.html
  - Protocol: https:
  - Base Path: ./my-blog/ (可能需要在 config.js 中配置)
  ```

### 问题 3: 某个模块加载失败但其他模块成功

**症状**: Console 显示某个模块未定义（如 `MarkdownRenderer`）

**原因**: 模块文件存在但包含 JavaScript 错误

**解决**:
1. 打开 Console 标签页，查看红色错误信息
2. 错误信息会指向具体的文件和行号
3. 打开该文件检查问题

### 问题 4: 文章文件加载成功但无法渲染

**症状**: 
- Network 显示 `posts/xxx.md` 状态 200
- 但文章不显示，显示错误信息

**原因**: 
- Front Matter 格式错误
- Markdown 内容包含特殊字符导致解析失败
- 渲染器出错

**解决**:
1. 检查文章 Front Matter 格式（必须以 `---` 开头和结尾）
2. 在 Console 查看详细错误信息
3. 尝试简化文章内容，逐步添加复杂元素

### 问题 5: 视频或图片无法加载

**症状**: 文章显示但视频或图片显示为空

**原因**:
- 图片/视频路径错误
- 跨域共享 (CORS) 问题
- 文件不存在

**解决**:
1. 检查图片/视频的 src 或 href 路径
2. 确保路径相对于项目根目录是正确的
3. 在 Console 查看是否有 CORS 错误
4. 对于远程视频（YouTube 等），检查网络连接

## 📊 完整诊断流程

按以下顺序执行诊断：

```
1. 打开浏览器开发者工具 (F12)
   ↓
2. 刷新页面 (F5)
   ↓
3. 查看 Console 标签页中的错误
   ↓
4. 如果有红色错误，记注错误信息
   ↓
5. 切换到 Network 标签页
   ↓
6. 再次刷新页面
   ↓
7. 检查每个脚本的加载状态（应该都是 200）
   ↓
8. 查找状态不是 200 的文件
   ↓
9. 该文件就是问题所在！
```

## 🔍 详细问题排查流程

### 如果在 Console 中看到 `TypeError: PathConfig is not defined`

```javascript
// 1. 检查脚本是否都已加载
document.querySelectorAll('script').forEach(s => {
    console.log(s.src)
});

// 2. 检查 config.js 是否存在且可访问
fetch('js/config.js')
    .then(r => r.text())
    .then(text => console.log('Config.js 可访问，大小：', text.length))
    .catch(e => console.error('无法加载 config.js:', e));

// 3. 手动加载 config.js
const script = document.createElement('script');
script.src = 'js/config.js';
script.onload = () => console.log('✓ Config.js 已加载');
script.onerror = () => console.error('✗ Config.js 加载失败');
document.head.appendChild(script);
```

### 如果在 Network 中看到 404 错误

1. 复制显示 404 的文件完整 URL
2. 在浏览器地址栏直接访问该 URL
3. 如果显示 404，说明文件确实不存在或路径错误
4. 检查实际文件是否在正确的位置

## 🛠️ 解决方案速查表

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `PathConfig is not defined` | config.js 未加载 | 检查 `js/config.js` 是否存在，Network 是否 404 |
| `MarkdownRenderer is not defined` | markdown-renderer.js 未加载 | 检查脚本加载顺序，是否在 config.js 之后 |
| `MediaHandler is not defined` | media-handler.js 未加载 | 检查 `js/media-handler.js` 是否存在 |
| `Failed to fetch posts/xxx.md` | 文章文件不存在 | 检查 `posts/` 目录中的文件名是否正确 |
| `TypeError: Cannot read property of undefined` | 某个模块未定义 | 添加模块加载检查，参考 displayArticle 函数 |
| `SyntaxError: Unexpected token` | JavaScript 语法错误 | 查看 Console 中的详细错误位置，检查相应文件 |

## 📞 获取帮助

1. 收集上述诊断信息
2. 查看本项目的 [TESTING.md](TESTING.md) 获取更多测试步骤
3. 查看 [ARCHITECTURE.md](ARCHITECTURE.md) 了解模块架构
4. 查看控制台中完整的错误堆栈跟踪

## ✅ 诊断完成检查表

- [ ] 已打开开发者工具
- [ ] 已查看 Console 标签页中的错误
- [ ] 已检查 Network 标签页中的脚本加载状态
- [ ] 已在 Console 中运行诊断命令
- [ ] 已确认所有模块是否已加载 (PathConfig, MarkdownRenderer 等)
- [ ] 已检查文章文件是否存在
- [ ] 已检查 URL 参数中的文件名是否正确

---

**问题仍未解决？** 请按上述步骤详细诊断，收集所有错误信息和 Console 输出，这样可以更快地定位问题！
