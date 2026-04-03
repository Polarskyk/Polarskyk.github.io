---
title: Markdown 编写完整指南
date: 2024-04-03
description: 学习如何在博客中使用各种 Markdown 格式、嵌入图片、视频等功能的完整指南
tags:
  - Markdown
  - 教程
  - 写作
  - 技巧
---

# Markdown 编写完整指南

欢迎来到博客 Markdown 编写指南！本文将详细介绍如何使用本博客系统支持的各种 Markdown 功能。

## 📋 目录

- [基础格式](#基础格式)
- [代码高亮](#代码高亮)
- [列表](#列表)
- [图片嵌入](#图片嵌入)
- [视频嵌入](#视频嵌入)
- [高级用法](#高级用法)

---

## 基础格式

### 标题示例

# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

### 文本格式

**加粗文本** - 使用 `**文本**`

*斜体文本* - 使用 `*文本*`

***加粗斜体*** - 使用 `***文本***`

~~删除线文本~~ - 使用 `~~文本~~`

`行内代码` - 使用 `` `代码` ``

### 段落和引用

这是一个普通段落。你可以写多行内容，它们会自动换行。

> 这是一个引用块
> 可以包含多行内容
> 每行都会被缩进显示

---

## 代码高亮

### JavaScript 示例

```javascript
// JavaScript 代码示例
function greet(name) {
  return `Hello, ${name}!`;
}

const message = greet('World');
console.log(message);

// 常用的数组方法
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = doubled.filter(n => n % 2 === 0);
```

### Python 示例

```python
# Python 代码示例
def fibonacci(n):
    """生成斐波那契数列"""
    if n <= 0:
        return []
    elif n == 1:
        return [1]
    
    fib = [1, 1]
    for i in range(2, n):
        fib.append(fib[-1] + fib[-2])
    return fib

# 使用示例
result = fibonacci(10)
print(f"前10个斐波那契数: {result}")
```

### CSS 示例

```css
/* CSS 样式示例 */
.card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

@media (max-width: 768px) {
  .card {
    padding: 15px;
    margin-bottom: 10px;
  }
}
```

### HTML 示例

```html
<!DOCTYPE html>
<html lang="zh-cn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>示例页面</title>
</head>
<body>
  <header>
    <h1>欢迎来到示例页面</h1>
  </header>
  
  <main>
    <section class="content">
      <p>这是一个基础的 HTML 示例页面</p>
    </section>
  </main>
</body>
</html>
```

---

## 列表

### 无序列表

- 项目一
- 项目二
  - 子项目 2.1
  - 子项目 2.2
    - 子子项目 2.2.1
- 项目三

### 有序列表

1. 第一步：准备环境
2. 第二步：安装依赖
   1. 安装 Node.js
   2. 安装 npm 包
3. 第三步：启动开发服务器
4. 第四步：开始开发

### 任务列表

- [x] 完成任务一
- [x] 完成任务二
- [ ] 待完成任务三
- [ ] 待完成任务四

---

## 图片嵌入

### 从网络加载图片

使用标准的 Markdown 图片语法：

```markdown
![Alt 文本](图片 URL)
```

示例：

![示例图片](https://via.placeholder.com/800x400?text=Example+Image)

### 本地图片

如果图片在本地 `assets` 或 `images` 文件夹中，使用相对路径：

```markdown
![本地图片](images/my-image.png)
![本地图片](assets/screenshot.jpg)
```

### 图片带链接

点击图片可以打开链接：

```markdown
[![图片说明](图片URL)](链接URL)
```

---

## 视频嵌入

本博客系统支持多种视频嵌入方式，包括 YouTube、Vimeo、Bilibili 和本地视频。

### YouTube 视频

使用以下格式嵌入 YouTube 视频：

```markdown
[youtube: 视频ID]
```

例如：
```markdown
[youtube: dQw4w9WgXcQ]
```

完整示例：

[youtube: dQw4w9WgXcQ]

### Vimeo 视频

使用以下格式嵌入 Vimeo 视频：

```markdown
[vimeo: 视频ID]
```

例如：
```markdown
[vimeo: 76979871]
```

### Bilibili 视频

使用以下格式嵌入 B 站视频：

```markdown
[bilibili: BV号]
```

例如：
```markdown
[bilibili: BV1x7411d7tT]
```

### 本地视频

对于本地视频文件，将视频放在 `videos` 或 `assets/videos` 文件夹中，然后使用：

```markdown
[video: 视频文件名.mp4]
```

例如：
```markdown
[video: tutorial.mp4]
[video: demo.webm]
```

支持的本地视频格式：
- MP4 (.mp4)
- WebM (.webm)
- OGG (.ogg)

---

## 高级用法

### 表格

| 功能 | 支持 | 说明 |
|------|------|------|
| Markdown | ✓ | 完全支持 |
| 代码高亮 | ✓ | Prism.js 支持 20+ 语言 |
| 图片嵌入 | ✓ | 本地和网络图片 |
| 视频嵌入 | ✓ | YouTube、Vimeo、B站 |
| 数学公式 | ✗ | 待实现 |

### 水平线

---

### 混合内容示例

> **💡 提示**
> 
> 你可以在引用块中混合使用各种格式：
> 
> - **加粗文本**
> - `代码`
> - [链接](https://example.com)

### 脚注

这是一个包含脚注的句子[^1]。

[^1]: 脚注内容会显示在文章末尾。

---

## 📝 编写建议

### DO ✓

- ✅ 使用清晰的标题结构
- ✅ 为列表项使用一致的格式
- ✅ 为代码块指定语言
- ✅ 提供有意义的图片说明
- ✅ 使用表情符号增加可读性
- ✅ 保持段落简洁明了

### DON'T ✗

- ❌ 过度使用加粗或斜体
- ❌ 混乱的列表嵌套
- ❌ 超长的段落
- ❌ 使用不清晰的链接文本
- ❌ 在代码块中使用不适当的缩进

---

## 🚀 快速参考

### Markdown 语法速查表

```
# 一级标题
## 二级标题
**加粗** *斜体* ~~删除线~~
[链接文本](URL)
![图片说明](图片URL)
> 引用
- 列表项
1. 有序列表

\`\`\`语言
代码块
\`\`\`
```

### 视频嵌入速查表

```
YouTube:    [youtube: 视频ID]
Vimeo:      [vimeo: 视频ID]
Bilibili:   [bilibili: BV号]
本地视频:    [video: 文件名]
```

---

## 总结

现在你已经学会了：

1. ✅ 使用各种 Markdown 格式化文本
2. ✅ 嵌入代码块并进行语法高亮
3. ✅ 插入图片和视频
4. ✅ 创建表格和列表
5. ✅ 组织内容结构

开始写作之前，记住：

> **质量优于数量** - 确保每篇文章都提供价值、清晰易读、提供良好的用户体验。

现在你可以开始创建属于自己的精彩内容了！祝你写作愉快！📝✨
