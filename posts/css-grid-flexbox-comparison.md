---
title: CSS Grid vs Flexbox 布局对比
date: 2024-08-03
category: frontend
tags: CSS, Grid, Flexbox, 布局
author: PolarSky
---

# CSS Grid vs Flexbox 布局对比

在现代 CSS 布局中，Grid 和 Flexbox 是两个最重要的工具。本文将详细对比这两种布局方式，帮助你在不同场景下做出正确的选择。

## 核心概念对比

### Flexbox - 一维布局

Flexbox 是为一维布局设计的，主要处理行或列的排列。

```css
.flex-container {
  display: flex;
  flex-direction: row; /* 或 column */
  justify-content: center; /* 主轴对齐 */
  align-items: center; /* 交叉轴对齐 */
  gap: 1rem;
}

.flex-item {
  flex: 1; /* 自动伸缩 */
}
```

### Grid - 二维布局

Grid 是为二维布局设计的，同时控制行和列。

```css
.grid-container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr; /* 三列布局 */
  grid-template-rows: auto 1fr auto; /* 三行布局 */
  grid-gap: 1rem;
}

.grid-item {
  grid-column: 1 / 3; /* 跨越列 */
  grid-row: 2 / 4; /* 跨越行 */
}
```

## 布局场景对比

### 1. 导航栏布局

**使用 Flexbox（推荐）**

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #333;
}

.nav-brand {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.nav-link {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #007bff;
}
```

```html
<nav class="navbar">
  <div class="nav-brand">品牌名</div>
  <ul class="nav-links">
    <li><a href="#" class="nav-link">首页</a></li>
    <li><a href="#" class="nav-link">产品</a></li>
    <li><a href="#" class="nav-link">关于</a></li>
    <li><a href="#" class="nav-link">联系</a></li>
  </ul>
</nav>
```

**使用 Grid（过度设计）**

```css
.navbar-grid {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding: 1rem 2rem;
  background: #333;
}

.nav-brand-grid {
  grid-column: 1;
}

.nav-links-grid {
  grid-column: 3;
  display: flex;
  gap: 2rem;
}
```

### 2. 卡片网格布局

**使用 Grid（推荐）**

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-5px);
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.card-description {
  color: #666;
  line-height: 1.6;
}
```

**使用 Flexbox（较复杂）**

```css
.card-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 2rem;
}

.card-flex .card {
  flex: 1 1 300px; /* 最小宽度 300px */
  max-width: calc(33.333% - 2rem); /* 三列布局 */
}

/* 响应式调整 */
@media (max-width: 900px) {
  .card-flex .card {
    max-width: calc(50% - 1rem);
  }
}

@media (max-width: 600px) {
  .card-flex .card {
    max-width: 100%;
  }
}
```

### 3. 圣杯布局

**使用 Grid（推荐）**

```css
.holy-grail-grid {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 200px 1fr 200px;
  min-height: 100vh;
  gap: 1rem;
}

.header { 
  grid-area: header; 
  background: #333;
  color: white;
  padding: 1rem;
}

.sidebar { 
  grid-area: sidebar; 
  background: #f4f4f4;
  padding: 1rem;
}

.main { 
  grid-area: main; 
  background: white;
  padding: 2rem;
}

.aside { 
  grid-area: aside; 
  background: #f4f4f4;
  padding: 1rem;
}

.footer { 
  grid-area: footer; 
  background: #333;
  color: white;
  padding: 1rem;
  text-align: center;
}

/* 响应式处理 */
@media (max-width: 768px) {
  .holy-grail-grid {
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "aside"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

**使用 Flexbox（复杂）**

```css
.holy-grail-flex {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header-flex,
.footer-flex {
  background: #333;
  color: white;
  padding: 1rem;
}

.content-flex {
  display: flex;
  flex: 1;
  gap: 1rem;
}

.sidebar-flex,
.aside-flex {
  flex: 0 0 200px;
  background: #f4f4f4;
  padding: 1rem;
}

.main-flex {
  flex: 1;
  background: white;
  padding: 2rem;
}

@media (max-width: 768px) {
  .content-flex {
    flex-direction: column;
  }
  
  .sidebar-flex,
  .aside-flex {
    flex: none;
  }
}
```

## 对齐方式对比

### Flexbox 对齐

```css
.flex-alignment {
  display: flex;
  height: 200px;
  
  /* 主轴对齐 */
  justify-content: flex-start; /* start, center, end, space-between, space-around, space-evenly */
  
  /* 交叉轴对齐 */
  align-items: stretch; /* start, center, end, stretch, baseline */
  
  /* 多行对齐 */
  align-content: center; /* 仅在 flex-wrap: wrap 时有效 */
}

.flex-item-alignment {
  /* 单个项目的交叉轴对齐 */
  align-self: center; /* auto, start, center, end, stretch, baseline */
}
```

### Grid 对齐

```css
.grid-alignment {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  height: 300px;
  
  /* 整个网格在容器中的对齐 */
  justify-content: center; /* start, center, end, stretch, space-around, space-between, space-evenly */
  align-content: center;
  
  /* 项目在单元格中的对齐 */
  justify-items: center; /* start, center, end, stretch */
  align-items: center;
}

.grid-item-alignment {
  /* 单个项目的对齐 */
  justify-self: end; /* start, center, end, stretch */
  align-self: start;
}
```

## 响应式设计对比

### Grid 响应式

```css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* 复杂响应式布局 */
.complex-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}

.grid-item-large {
  grid-column: span 4; /* 占据 4 列 */
}

.grid-item-medium {
  grid-column: span 3; /* 占据 3 列 */
}

@media (max-width: 768px) {
  .grid-item-large,
  .grid-item-medium {
    grid-column: span 6; /* 移动端占据 6 列 */
  }
}

@media (max-width: 480px) {
  .grid-item-large,
  .grid-item-medium {
    grid-column: span 12; /* 小屏幕占据全宽 */
  }
}
```

### Flexbox 响应式

```css
.responsive-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.flex-item-responsive {
  flex: 1 1 250px; /* 最小宽度 250px */
}

/* 需要更多媒体查询 */
@media (max-width: 768px) {
  .flex-item-responsive {
    flex: 1 1 calc(50% - 0.5rem);
  }
}

@media (max-width: 480px) {
  .flex-item-responsive {
    flex: 1 1 100%;
  }
}
```

## 性能对比

### 浏览器支持

```css
/* Flexbox - 更好的兼容性 */
.flexbox-fallback {
  display: -webkit-box;      /* Safari 6.1+, iOS 7.1+, Android 4.4+ */
  display: -webkit-flex;     /* Safari 9+, iOS 9+ */
  display: -ms-flexbox;      /* IE 10+ */
  display: flex;             /* 现代浏览器 */
}

/* Grid - 现代浏览器 */
.grid-fallback {
  display: -ms-grid;         /* IE 10+ (有限支持) */
  display: grid;             /* 现代浏览器 */
}

/* 兼容性回退 */
@supports not (display: grid) {
  .grid-container {
    display: flex;
    flex-wrap: wrap;
  }
  
  .grid-item {
    flex: 1 1 300px;
  }
}
```

### 渲染性能

```css
/* Grid 在复杂布局中通常性能更好 */
.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  /* 浏览器优化的布局算法 */
}

/* Flexbox 在简单布局中性能良好 */
.performance-flex {
  display: flex;
  gap: 1rem;
  /* 简单的一维计算 */
}
```

## 实际项目应用

### 完整的响应式布局系统

```css
/* 网格系统基础 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}

/* 网格项目类 */
.col-1 { grid-column: span 1; }
.col-2 { grid-column: span 2; }
.col-3 { grid-column: span 3; }
.col-4 { grid-column: span 4; }
.col-6 { grid-column: span 6; }
.col-8 { grid-column: span 8; }
.col-12 { grid-column: span 12; }

/* 响应式断点 */
@media (max-width: 768px) {
  .col-md-6 { grid-column: span 6; }
  .col-md-12 { grid-column: span 12; }
}

@media (max-width: 480px) {
  .col-sm-12 { grid-column: span 12; }
}

/* Flexbox 工具类 */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.flex-1 { flex: 1; }
```

## 选择指南

### 使用 Flexbox 的场景

1. **一维布局**：导航栏、按钮组、工具栏
2. **内容对齐**：垂直居中、分布式对齐
3. **组件内部布局**：卡片内容、表单元素
4. **简单的响应式布局**

```css
/* 典型的 Flexbox 使用场景 */
.button-group {
  display: flex;
  gap: 0.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-row {
  display: flex;
  gap: 1rem;
  align-items: end;
}
```

### 使用 Grid 的场景

1. **二维布局**：页面整体结构、复杂网格
2. **重叠布局**：层叠效果、图片覆盖文字
3. **不规则布局**：杂志式设计、瀑布流
4. **复杂响应式**：不同断点的完全不同布局

```css
/* 典型的 Grid 使用场景 */
.page-layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}

.photo-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-auto-rows: 200px;
}

.magazine-layout {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(4, 1fr);
}

.feature-article {
  grid-column: 1 / 4;
  grid-row: 1 / 3;
}
```

## 总结

| 特性 | Flexbox | Grid |
|------|---------|------|
| 维度 | 一维（行或列） | 二维（行和列） |
| 浏览器支持 | 更好 | 现代浏览器 |
| 学习曲线 | 较平缓 | 较陡峭 |
| 适用场景 | 组件布局、简单排列 | 页面布局、复杂网格 |
| 性能 | 简单布局更优 | 复杂布局更优 |

**最佳实践：**
- 使用 Grid 进行页面级布局
- 使用 Flexbox 进行组件级布局  
- 两者结合使用，发挥各自优势
- 根据具体需求选择合适的工具

---

*你在项目中是如何选择使用 Grid 还是 Flexbox 的？欢迎分享你的经验！*
