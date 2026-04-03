# ⚡ 快速修复指南

## 🆘 文章详细页加载失败？按以下步骤快速修复

### 第 1 步：检查浏览器控制台 (30 秒)

1. 打开 article.html 页面
2. 按 **F12** 打开开发者工具
3. 选择 **Console** 标签页
4. **查看是否有红色错误信息**

---

### 第 2 步：根据错误信息快速修复 (1-2 分钟)

#### 🔴 错误: `TypeError: PathConfig is not defined`

```javascript
// 在 Console 中运行这个命令来临时加载配置
fetch('js/config.js')
    .then(r => r.text())
    .then(text => {
        eval(text);
        console.log('✓ Config 已加载');
        console.log('Base path:', PathConfig.getBasePath());
    })
    .catch(e => console.error('Config 加载失败:', e));
```

**永久修复**:
- 确保 `js/config.js` 文件存在
- 如果在 GitHub Pages 上，可能需要修改 `GITHUB_CONFIG.repo` 值

#### 🔴 错误: `Failed to fetch 'js/config.js'`

```
问题：脚本文件无法访问（通常是路径错误）

解决：
1. 检查是否基于文件协议访问 (file://)
   → 改为使用 HTTP 服务器
   → 在终端运行: python -m http.server 8000
   → 然后访问: http://localhost:8000

2. 检查 js/ 目录是否存在
   → 确保有这个文件夹: c:\Users\14265\Desktop\Polarskyk.github.io\js\

3. 检查所有必要文件是否存在
   → js/config.js
   → js/media-handler.js
   → js/markdown-renderer.js
   → js/article-loader.js
```

#### 🔴 错误: `Failed to fetch 'posts/xxx.md'` (404)

```
问题：文章文件不存在

解决：
1. 检查 URL 中的文件名: article.html?file=xxx.md
2. 确保 posts/ 文件夹中有该文件
3. 检查文件名是否大小写正确

示例正确用法：
- article.html?file=welcome.md ✓
- article.html?file=javascript-es2024-features.md ✓
```

---

### 第 3 步：自动诊断 (2 分钟完全检查)

在 article.html 或任何页面的 Console 中运行：

```javascript
// 加载并运行诊断脚本
fetch('js/diagnostic.js')
    .then(r => r.text())
    .then(code => {
        eval(code);
    })
    .catch(e => console.error('诊断脚本加载失败:', e));
```

或者直接在 Console 中复制粘贴 `js/diagnostic.js` 的内容

---

## 🔧 最常见的 3 个问题 + 3 个解决方案

### 问题 1: 使用 file:// 协议 ❌

```
symptom: 所有文件都加载失败 (404)

✗ 错误做法:
直接打开 HTML 文件: file:///Users/Desktop/Polarskyk.github.io/article.html

✓ 正确做法:
1. 打开终端，进入项目目录
2. 运行 HTTP 服务器:
   python -m http.server 8000
3. 访问:
   http://localhost:8000/article.html
```

### 问题 2: 模块加载顺序混乱

```
symptom: MarkdownRenderer 或 MediaHandler 未定义

✓ 修复方案:
检查 article.html 中的脚本顺序：

<script src="js/config.js"></script>           ← 第一个
<script src="js/media-handler.js"></script>    ← 第二个
<script src="js/markdown-renderer.js"></script> ← 第三个
<script src="js/article-loader.js"></script>   ← 第四个

顺序很重要！config.js 必须最先加载
```

### 问题 3: GitHub Pages 部署路径问题

```
symptom: 本地能用，GitHub Pages 上不能用

✓ 修复方案:

如果使用项目级仓库 (例如 polarskyk.github.io/my-blog):

1. 打开 js/config.js
2. 找到 GITHUB_CONFIG
3. 修改 repo 名称：

   const GITHUB_CONFIG = {
       owner: 'Polarskyk',
       repo: 'my-blog',    ← 改成你的仓库名
       branch: 'main',
       postsPath: 'posts'
   };
```

---

## 📋 快速检查清单 (1 分钟)

运行下面代码快速检查所有问题：

```javascript
// 在 Console 中粘贴这个
Object.assign(window, {
    checkAll: function() {
        const checks = {
            '✓ PathConfig': typeof PathConfig !== 'undefined',
            '✓ MarkdownRenderer': typeof MarkdownRenderer !== 'undefined', 
            '✓ MediaHandler': typeof MediaHandler !== 'undefined',
            '✓ marked': typeof marked !== 'undefined',
            '✓ Prism': typeof Prism !== 'undefined'
        };
        
        Object.entries(checks).forEach(([k, v]) => {
            console.log(v ? k : k.replace('✓', '✗'));
        });
        
        console.log('\n检查基础路径:');
        if (PathConfig) {
            console.log('Base path:', PathConfig.getBasePath());
            console.log('Posts path:', PathConfig.getPostsPath('test.md'));
        }
    }
});

// 运行检查
checkAll();
```

**预期输出**: 所有项都显示 ✓

---

## 🚀 一键修复脚本

如果上述方案都不行，在 Console 中运行这个超级修复脚本：

```javascript
(async function superFix() {
    console.log('🔧 开始超级修复...\n');
    
    // 1. 加载所有必要模块
    const scripts = [
        'js/config.js',
        'js/media-handler.js',
        'js/markdown-renderer.js',
        'js/article-loader.js'
    ];
    
    for (const script of scripts) {
        try {
            const response = await fetch(script);
            const code = await response.text();
            eval(code);
            console.log(`✓ ${script} 已加载`);
        } catch (e) {
            console.error(`✗ ${script} 加载失败:`, e.message);
        }
    }
    
    // 2. 验证环境
    console.log('\n📍 环境检查:');
    console.log('- PathConfig:', typeof PathConfig !== 'undefined' ? '✓' : '✗');
    console.log('- Base path:', PathConfig ? PathConfig.getBasePath() : 'N/A');
    
    // 3. 重新加载文章
    console.log('\n🔄 重新加载页面...');
    setTimeout(() => {
        location.reload();
    }, 1000);
})();
```

---

## 🎯 最终检查 (30 秒)

1. **是否使用 HTTP 服务器?** ✓
   ```bash
   python -m http.server 8000  # 然后访问 http://localhost:8000
   ```

2. **是否有 F12 开发者工具中的红色错误?** ✓
   ```
   按 F12 → Console → 查看是否有红色错误
   ```

3. **js/ 目录中有 4 个文件?** ✓
   ```
   - js/config.js
   - js/media-handler.js
   - js/markdown-renderer.js
   - js/article-loader.js
   ```

4. **posts/ 目录中有 Markdown 文件?** ✓

如果都满足，刷新页面应该能正常工作！ 🎉

---

## 📞 仍然无法修复？

1. 收集完整的错误信息（Console 中的所有红色文本）
2. 查看 **Network** 标签页中哪些文件是 404
3. 参考完整的 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) 文档
4. 查看 [ARCHITECTURE.md](./ARCHITECTURE.md#部署指南) 获取部署帮助

---

**最常见的快速修复 (90% 有效):**
```bash
1. 打开终端
2. cd c:\Users\14265\Desktop\Polarskyk.github.io
3. python -m http.server 8000
4. 打开浏览器访问 http://localhost:8000
5. 完成！✓
```

---

💡 **记住**: 大多数问题是因为直接打开 HTML 文件而不是通过 HTTP 服务器访问！
