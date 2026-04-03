# 🔧 模块加载失败 - 快速排查指南

**症状**: `模块加载失败: PathConfig, MarkdownRenderer, MediaHandler, APP_CONFIG`

---

## ⚡ 快速诊断（1分钟）

### 步骤 1: 打开诊断工具
访问这个页面来自动检查所有模块：
```
http://localhost:8000/script-diagnostics.html
```

这会显示：
- ✓ 每个模块是否已加载
- ✓ 关键函数是否存在
- ✓ 具体的问题位置

### 步骤 2: 清除浏览器缓存
有时浏览器缓存的是旧版本的文件：

**Chrome/Firefox:**
- 按 `Ctrl+Shift+Delete`
- 选择 "所有时间"
- 点击清除

**或者在 DevTools 中:**
- 按 `F12` 打开 DevTools
- 右键点击刷新按钮
- 选择 "清空缓存并硬刷新"

### 步骤 3: 验证脚本文件
在 Console（F12）中运行：

```javascript
// 检查这两个命令的输出
fetch('js/config.js').then(r => r.text()).then(t => console.log('✓ config.js 可访问'));
fetch('js/media-handler.js').then(r => r.text()).then(t => console.log('✓ media-handler.js 可访问'));
fetch('js/markdown-renderer.js').then(r => r.text()).then(t => console.log('✓ markdown-renderer.js 可访问'));
```

---

## 🔍 常见问题

### 问题 1: 脚本返回 404

**症状**: Console 中看到多个 404 错误

**解决方案**:
```bash
# 确保你在正确的目录中
cd c:\Users\14265\Desktop\Polarskyk.github.io

# 启动 HTTP 服务器
python -m http.server 8000

# 访问
http://localhost:8000/article.html?file=1.md
```

### 问题 2: 脚本加载但模块未显示

**症状**: 脚本加载成功（无 404），但 `window.PathConfig` 仍然是 `undefined`

**原因**: 脚本可能有 JavaScript 错误

**诊断**:
1. 打开 `script-diagnostics.html`
2. 查看 Console（F12 → Console 标签）
3. 查找红色错误消息

**常见错误**:
```
❌ Uncaught ReferenceError: xxx is not defined
❌ Uncaught SyntaxError: Unexpected token
❌ app.js:123 Uncaught TypeError: Cannot read property 'x' of undefined
```

### 问题 3: 脚本中有语法错误

**检查方法**:

在 PowerShell 中运行：
```powershell
node -c "c:\Users\14265\Desktop\Polarskyk.github.io\js\config.js"
node -c "c:\Users\14265\Desktop\Polarskyk.github.io\js\media-handler.js"
node -c "c:\Users\14265\Desktop\Polarskyk.github.io\js\markdown-renderer.js"
```

如果没有输出，表示语法正确。如果有错误，会显示具体的问题。

### 问题 4: HTTP 服务器未运行

**症状**: 访问 `article.html` 时出现"无法连接" 或 "ERR_CONNECTION_REFUSED"

**解决方案**:
```bash
# 确保 HTTP 服务器正在运行
python -m http.server 8000

# 输出应该是:
# Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

---

## 📋 完整故障排除流程

### 第一阶段: 环境检查
```javascript
// 在 Console 中运行
1. typeof window.PathConfig          // 应该是 'object'
2. typeof window.MarkdownRenderer    // 应该是 'object'
3. typeof window.MediaHandler        // 应该是 'object'
4. typeof window.APP_CONFIG          // 应该是 'object'

// 如果都是 'object'，模块已加载，问题已解决 ✓
// 如果有是 'undefined'，继续第二阶段
```

### 第二阶段: 脚本加载检查
```javascript
// 在 Console 中运行
fetch('js/config.js')
  .then(r => {
    console.log('状态:', r.status, r.statusText);
    return r.text();
  })
  .then(t => {
    console.log('文件大小:', t.length, '字节');
    console.log('包含 PathConfig:', t.includes('const PathConfig'));
    console.log('包含 window.PathConfig:', t.includes('window.PathConfig'));
  })
  .catch(e => console.error('错误:', e));

// 对 js/media-handler.js 和 js/markdown-renderer.js 重复此操作
```

### 第三阶段: 脚本执行检查
```javascript
// 检查脚本加载后是否立即有日志输出
// 打开 F12 → Console，刷新页面
// 应该看到:
// ✓ 配置模块已加载到全局作用域
// ✓ 媒体处理模块已加载到全局作用域
// ✓ Markdown 渲染模块已加载到全局作用域

// 如果没有这些日志，说明脚本未正确执行
```

---

## 🛠️ 修复步骤

### 如果脚本有语法错误

1. **找到错误位置**
   - 打开诊断工具: `script-diagnostics.html`
   - 查看 Console 中的错误消息
   - 找到具体的文件和行号

2. **检查文件末尾**
   - 打开错误的脚本文件 (js/config.js、js/media-handler.js 等)
   - 跳转到末尾
   - 确保最后有 window 暴露代码：
   ```javascript
   // 暴露到全局作用域（浏览器环境）
   if (typeof window !== 'undefined') {
       window.XXX = XXX;
       console.log('✓ XXX 模块已加载到全局作用域');
   }
   ```

3. **验证修复**
   - 保存文件
   - 刷新浏览器（Ctrl+F5 硬刷新）
   - 重新打开诊断工具

---

## 📞 获取更多信息

### 诊断文件
- 📊 [module-load-test.html](./module-load-test.html) - 基础模块加载测试
- 🔬 [script-diagnostics.html](./script-diagnostics.html) - 完整诊断工具
- 🏥 [health-check.html](./health-check.html) - 系统健康检查

### 技术文档
- 📖 [MODULE_LOAD_FIX.md](./MODULE_LOAD_FIX.md) - 模块加载修复详情
- 🐛 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 完整故障排除指南
- 🔧 [ARCHITECTURE.md](./ARCHITECTURE.md) - 项目架构说明

---

## ✅ 验证修复成功的方式

| 指标 | 应该看到 |
|------|--------|
| 诊断工具页面 | ✓ 所有模块已成功加载 |
| Console 输出 | ✓ 3 条 "模块已加载到全局作用域" 日志 |
| 文章页面 | 文章正常显示（无红色错误） |
| window 对象 | 4 个模块都能通过 window 访问 |

---

**如果以上步骤都不能解决问题，请:**
1. 打开 `script-diagnostics.html`
2. 截图整个页面的诊断结果
3. 查看 Console（F12）中的所有错误信息
4. 检查项目文件夹中是否有所有必需的文件

