# 📝 快速添加文章指南

一个简洁的指南，用于快速添加新的 Markdown 文章到你的 GitHub 博客。

## 5 分钟快速开始

### 步骤 1：创建新文章文件

在 `posts/` 文件夹中创建新文件，命名为 `article-name.md`（使用英文）

### 步骤 2：添加文章头部（Front Matter）

复制以下模板到新文件的开头：

```markdown
---
title: "你的文章标题"
date: "2024-04-03"
category: "技术"
tags: ["标签1", "标签2"]
description: "这是对文章的一句话描述"
---
```

### 步骤 3：编写文章内容

```markdown
# 主标题

这是第一段内容...

## 小标题

更多内容...

### 代码示例

\`\`\`javascript
console.log('Hello World');
\`\`\`
```

### 步骤 4：添加图片（可选）

1. **创建图片文件夹**
   ```bash
   mkdir posts/images
   ```

2. **放置图片文件**
   ```bash
   posts/images/my-image.png
   ```

3. **在文章中引用**
   ```markdown
   ![图片描述](images/my-image.png)
   ```

### 步骤 5：本地预览

```bash
# 启动本地服务器
python -m http.server 8000

# 打开浏览器访问
# http://localhost:8000
```

### 步骤 6：推送到 GitHub

```bash
# 添加所有更改
git add -A

# 提交
git commit -m "Add new article: article-name"

# 推送
git push
```

### 步骤 7：验证发布

等待 1-2 分钟后，访问你的 GitHub Pages 网址检查新文章。

---

## 文章模板

### 最简单的文章

```markdown
---
title: "文章标题"
date: "2024-04-03"
category: "技术"
tags: ["标签"]
description: "简单描述"
---

# 文章标题

第一段内容...
```

### 完整的文章

```markdown
---
title: "深入理解 JavaScript 原型链"
date: "2024-04-03"
category: "JavaScript"
tags: ["JavaScript", "原型", "OOP"]
description: "探讨 JavaScript 原型链的核心概念和实际应用"
---

# 深入理解 JavaScript 原型链

## 介绍

这是一篇关于...

## 核心概念

### 什么是原型

原型是...

## 实例 1

\`\`\`javascript
const obj = { name: 'demo' };
\`\`\`

## 总结

最后...

## 参考资源

- [MDN 原型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Prototype)
- [阮一峰教程](https://www.ruanyifeng.com/)
```

---

## Markdown 语法速查

### 标题

```markdown
# 一级标题
## 二级标题
### 三级标题
```

### 文本格式

```markdown
**粗体** 或 __粗体__
*斜体* 或 _斜体_
~~删除线~~
`代码`
```

### 列表

```markdown
- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2

1. 第一项
2. 第二项
3. 第三项
```

### 引用

```markdown
> 这是一段引用
> 
> 可以多行
```

### 代码块

````markdown
```javascript
function hello() {
    console.log('Hello');
}
```

```python
def hello():
    print('Hello')
```

```bash
echo "Hello"
```
````

### link 和图片

```markdown
[链接文字](https://example.com)
![图片描述](images/pic.png)
![外部图片](https://example.com/pic.png)
```

### 表格

```markdown
| 列 1 | 列 2 | 列 3 |
|-----|------|------|
| 单元格 1 | 单元格 2 | 单元格 3 |
| 单元格 4 | 单元格 5 | 单元格 6 |
```

### 分隔线

```markdown
---
或
***
或
___
```

---

## 分类选项

推荐使用这些分类：

- **技术** - 技术文章、编程教程
- **前端** - 前端开发相关
- **后端** - 后端开发相关
- **运维** - DevOps、服务器相关
- **工具** - 工具使用指南
- **生活** - 生活感悟、思考
- **随笔** - 短篇随笔

---

## 标签建议

常用标签：

- `JavaScript`, `Python`, `Java`, `Go`, `Rust`
- `React`, `Vue`, `Angular`, `Node.js`
- `CSS`, `HTML`, `Web`
- `数据库`, `SQL`, `MongoDB`
- `Docker`, `Kubernetes`, `CI/CD`
- `性能优化`, `安全`, `架构`
- `总结`, `思考`, `经验`

---

## 日期格式

使用 `YYYY-MM-DD` 格式：

```
2024-04-03
2024-01-15
2024-12-31
```

---

## 检查清单

发布前的检查清单：

- [ ] 文章标题清晰明确
- [ ] Front Matter 格式正确
- [ ] 日期格式为 `YYYY-MM-DD`
- [ ] 至少有一个标签
- [ ] 所有图片路径正确
- [ ] 代码块语言标记正确
- [ ] 本地预览效果正常
- [ ] 没有中文文件名（使用英文）
- [ ] 内容通顺，无大的格式问题
- [ ] 准备好提交信息

---

## 批量操作

### 添加多篇文章

```bash
# 创建多个文件
touch posts/article1.md posts/article2.md posts/article3.md

# 编辑完成后统一提交
git add posts/
git commit -m "Add 3 new articles"
git push
```

### 更新现有文章

```bash
# 编辑文章
vim posts/existing-article.md

# 提交更改
git add posts/existing-article.md
git commit -m "Update article: existing-article"
git push
```

### 删除文章

```bash
# 删除文件
rm posts/old-article.md

# 提交删除
git add -A
git commit -m "Remove outdated article"
git push
```

---

## 图片最佳实践

### 图片组织

```
posts/
├── images/
│   ├── 2024-04/
│   │   ├── screenshot-1.png
│   │   ├── demo.jpg
│   │   └── ...
│   ├── 2024-03/
│   │   └── ...
│   └── ...
├── article-1.md
├── article-2.md
└── ...
```

### 图片优化

| 格式 | 用途 | 优缺点 |
|-----|------|--------|
| PNG | 截图 | 无损，适合截图 |
| JPG | 照片 | 有损压缩，文件小 |
| WebP | 现代格式 | 最新格式，兼容性差 |
| SVG | 图标 | 矢量，可缩放 |

### 在线压缩工具

- [TinyPNG](https://tinypng.com/)
- [ImageOptim](https://imageoptim.com/)
- [Squoosh](https://squoosh.app/)

---

## 常见错误

❌ **错误做法**

```markdown
---
title: 文章标题    // 缺少引号
date: 04-03-2024   // 日期格式错误
category: 技术     // 应该在引号中
tags: 标签1, 标签2  // 应该是数组 ["标签1", "标签2"]
---
```

✅ **正确做法**

```markdown
---
title: "文章标题"
date: "2024-04-03"
category: "技术"
tags: ["标签1", "标签2"]
```

---

## 获取帮助

### 文件名问题

❌ `2024-04-03 我的文章.md`（含中文和空格）
✅ `my-article.md`（英文，用连字符）

### 图片路径问题

❌ `![图](D:\项目\图片.png)`（本地路径）
❌ `![img](../../../pictures/pic.png)`（过复杂的相对路径）
✅ `![description](images/pic.png)`（简单相对路径）

### 提交问题

❌ `git push`（直接推送，可能出错）
✅ `git status` → 检查 → `git add -A` → `git commit -m "msg"` → `git push`

---

**提示：**如遇问题，查看 [完整部署指南](./DEPLOYMENT_GUIDE.md)

祝你写作愉快！✍️
