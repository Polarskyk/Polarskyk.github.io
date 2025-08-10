// 博客管理器 - 负责加载和解析 Markdown 文件
class BlogManager {
    constructor() {
        this.posts = [];
        this.categories = new Set();
        this.isLoading = false;
        this.postsDirectory = 'posts/';
        
        // 配置 marked.js
        this.configureMarked();
    }

    // 配置 Markdown 解析器
    configureMarked() {
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                highlight: function(code, lang) {
                    if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (err) {
                            console.warn('Highlight.js error:', err);
                        }
                    }
                    return code;
                },
                gfm: true,
                breaks: true,
                sanitize: false
            });
        }
    }

    // 初始化博客管理器
    async initialize() {
        try {
            this.isLoading = true;
            await this.loadPosts();
            this.isLoading = false;
            return true;
        } catch (error) {
            console.error('Failed to initialize blog manager:', error);
            this.isLoading = false;
            await this.createSamplePosts();
            return true;
        }
    }

    // 加载所有博客文章
    async loadPosts() {
        // 预定义的文章列表
        const postFiles = [
            'javascript-es2024-features.md',
            'react-18-concurrent-features.md',
            'vue3-composition-api.md',
            'nodejs-performance-optimization.md',
            'css-grid-flexbox-comparison.md',
            'typescript-advanced-types.md'
        ];

        const loadPromises = postFiles.map(filename => this.loadPost(filename));
        const results = await Promise.allSettled(loadPromises);
        
        // 过滤成功加载的文章
        this.posts = results
            .filter(result => result.status === 'fulfilled' && result.value)
            .map(result => result.value);

        // 如果没有加载到文章，创建示例文章
        if (this.posts.length === 0) {
            await this.createSamplePosts();
        }

        // 按日期排序
        this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.extractCategories();
        
        console.log(`Loaded ${this.posts.length} posts`);
        return this.posts;
    }

    // 加载单个文章
    async loadPost(filename) {
        try {
            const response = await fetch(`${this.postsDirectory}${filename}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const content = await response.text();
            return this.parseMarkdownPost(content, filename);
        } catch (error) {
            console.warn(`Failed to load post ${filename}:`, error);
            return null;
        }
    }

    // 创建示例文章
    async createSamplePosts() {
        const samplePosts = [
            {
                id: 'javascript-modern-features',
                title: 'JavaScript 现代特性详解',
                content: `# JavaScript 现代特性详解

## 概述

JavaScript 作为 Web 开发的核心语言，持续不断地推出新特性来改善开发体验。

## ES2024 新特性

### 1. Array Grouping

\`\`\`javascript
const inventory = [
  { name: 'asparagus', type: 'vegetables', quantity: 5 },
  { name: 'bananas', type: 'fruit', quantity: 0 },
  { name: 'cherries', type: 'fruit', quantity: 5 }
];

const result = Object.groupBy(inventory, ({ type }) => type);
console.log(result);
// {
//   vegetables: [{ name: 'asparagus', type: 'vegetables', quantity: 5 }],
//   fruit: [
//     { name: 'bananas', type: 'fruit', quantity: 0 },
//     { name: 'cherries', type: 'fruit', quantity: 5 }
//   ]
// }
\`\`\`

### 2. Promise.withResolvers()

\`\`\`javascript
const { promise, resolve, reject } = Promise.withResolvers();

// 使用 resolve 和 reject
setTimeout(() => {
  resolve('操作成功！');
}, 1000);

promise.then(console.log); // 操作成功！
\`\`\`

## 总结

这些新特性大大提升了 JavaScript 的开发效率和代码可读性。`,
                excerpt: 'JavaScript 持续推出新特性来改善开发体验，本文介绍 ES2024 的主要更新。',
                date: '2024-08-08',
                category: 'frontend',
                tags: ['JavaScript', 'ES2024', '前端开发'],
                author: 'PolarSky',
                readTime: '5 分钟'
            },
            {
                id: 'react-hooks-best-practices',
                title: 'React Hooks 最佳实践指南',
                content: `# React Hooks 最佳实践指南

## 简介

React Hooks 改变了我们编写 React 组件的方式，本文总结了一些最佳实践。

## 核心原则

### 1. 只在最顶层调用 Hook

\`\`\`javascript
// ✅ 正确
function MyComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  
  // 组件逻辑...
}

// ❌ 错误
function MyComponent() {
  if (someCondition) {
    const [count, setCount] = useState(0); // 不要这样做
  }
}
\`\`\`

### 2. 自定义 Hook 复用逻辑

\`\`\`javascript
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  const decrement = useCallback(() => {
    setCount(c => c - 1);
  }, []);
  
  return { count, increment, decrement };
}
\`\`\`

## 性能优化

使用 \`useMemo\` 和 \`useCallback\` 来优化性能：

\`\`\`javascript
const ExpensiveComponent = ({ items, filter }) => {
  const filteredItems = useMemo(() => {
    return items.filter(item => item.includes(filter));
  }, [items, filter]);
  
  const handleClick = useCallback((id) => {
    // 处理点击事件
  }, []);
  
  return (
    <div>
      {filteredItems.map(item => (
        <Item key={item.id} onClick={handleClick} />
      ))}
    </div>
  );
};
\`\`\`

## 总结

正确使用 React Hooks 可以让我们的代码更加简洁和高效。`,
                excerpt: 'React Hooks 改变了我们编写组件的方式，掌握最佳实践是每个 React 开发者的必修课。',
                date: '2024-08-05',
                category: 'frontend',
                tags: ['React', 'Hooks', '最佳实践'],
                author: 'PolarSky',
                readTime: '8 分钟'
            },
            {
                id: 'css-grid-layout-guide',
                title: 'CSS Grid 布局完全指南',
                content: `# CSS Grid 布局完全指南

## 什么是 CSS Grid？

CSS Grid 是一个二维的布局系统，可以同时控制行和列的布局。

## 基础概念

### Grid Container

\`\`\`css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 100px 200px;
  gap: 20px;
}
\`\`\`

### Grid Items

\`\`\`css
.item1 {
  grid-column: 1 / 3;
  grid-row: 1 / 2;
}

.item2 {
  grid-column: 3 / 4;
  grid-row: 1 / 3;
}
\`\`\`

## 实用布局示例

### 经典的圣杯布局

\`\`\`css
.holy-grail {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 200px 1fr 200px;
  min-height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
\`\`\`

### 响应式卡片布局

\`\`\`css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
\`\`\`

## Grid vs Flexbox

- **Grid**: 适合二维布局，整体页面结构
- **Flexbox**: 适合一维布局，组件内部排列

## 总结

CSS Grid 是现代布局的利器，结合 Flexbox 使用效果更佳。`,
                excerpt: 'CSS Grid 是强大的二维布局系统，本文详细介绍其使用方法和实际应用。',
                date: '2024-08-03',
                category: 'frontend',
                tags: ['CSS', 'Grid', '布局'],
                author: 'PolarSky',
                readTime: '6 分钟'
            },
            {
                id: 'nodejs-performance-tips',
                title: 'Node.js 性能优化技巧',
                content: `# Node.js 性能优化技巧

## 简介

Node.js 应用的性能优化是一个重要话题，本文介绍几个实用的优化技巧。

## 1. 使用集群模式

\`\`\`javascript
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(\`Master \${process.pid} is running\`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(\`Worker \${worker.process.pid} died\`);
  });
} else {
  // Workers can share any TCP port
  require('./app.js');
  console.log(\`Worker \${process.pid} started\`);
}
\`\`\`

## 2. 缓存策略

### Redis 缓存

\`\`\`javascript
const redis = require('redis');
const client = redis.createClient();

async function getUserData(userId) {
  const cacheKey = \`user:\${userId}\`;
  
  // 先查缓存
  const cached = await client.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 查数据库
  const user = await User.findById(userId);
  
  // 存入缓存
  await client.setex(cacheKey, 3600, JSON.stringify(user));
  
  return user;
}
\`\`\`

### 内存缓存

\`\`\`javascript
const NodeCache = require('node-cache');
const myCache = new NodeCache({ stdTTL: 600 });

function getCachedData(key, fetchFunction) {
  const value = myCache.get(key);
  
  if (value) {
    return Promise.resolve(value);
  }
  
  return fetchFunction().then(result => {
    myCache.set(key, result);
    return result;
  });
}
\`\`\`

## 3. 数据库优化

### 连接池

\`\`\`javascript
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mydb',
  connectionLimit: 10,
  queueLimit: 0
});
\`\`\`

### 索引优化

\`\`\`sql
-- 创建复合索引
CREATE INDEX idx_user_email_status ON users(email, status);

-- 查询优化
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com' AND status = 'active';
\`\`\`

## 4. 监控和分析

使用 \`clinic.js\` 进行性能分析：

\`\`\`bash
npm install -g clinic
clinic doctor -- node app.js
clinic flame -- node app.js
\`\`\`

## 总结

性能优化是一个持续的过程，需要根据实际情况选择合适的策略。`,
                excerpt: 'Node.js 性能优化涉及多个方面，从集群模式到缓存策略，本文提供实用的优化技巧。',
                date: '2024-08-01',
                category: 'backend',
                tags: ['Node.js', '性能优化', '后端开发'],
                author: 'PolarSky',
                readTime: '10 分钟'
            },
            {
                id: 'git-workflow-guide',
                title: 'Git 工作流最佳实践',
                content: `# Git 工作流最佳实践

## 选择合适的工作流

不同的团队规模和项目需要不同的 Git 工作流。

## Git Flow

适合大型项目和发布周期较长的团队：

\`\`\`bash
# 初始化 git flow
git flow init

# 开始新功能
git flow feature start new-feature

# 完成功能
git flow feature finish new-feature

# 开始发布
git flow release start 1.0.0

# 完成发布
git flow release finish 1.0.0
\`\`\`

## GitHub Flow

适合持续部署的项目：

\`\`\`bash
# 1. 创建分支
git checkout -b feature/new-feature

# 2. 提交代码
git add .
git commit -m "Add new feature"

# 3. 推送分支
git push origin feature/new-feature

# 4. 创建 Pull Request
# 5. 代码审查
# 6. 合并到主分支
\`\`\`

## 提交信息规范

### Conventional Commits

\`\`\`bash
# 格式：<type>[optional scope]: <description>

git commit -m "feat(auth): add user login functionality"
git commit -m "fix(api): resolve data validation issue"
git commit -m "docs(readme): update installation guide"
git commit -m "refactor(utils): simplify date formatting"
\`\`\`

### 类型说明

- **feat**: 新功能
- **fix**: 修复 bug
- **docs**: 文档更新
- **style**: 代码格式修改
- **refactor**: 代码重构
- **test**: 添加测试
- **chore**: 构建工具或辅助工具的变动

## 分支管理策略

### 分支命名规范

\`\`\`bash
# 功能分支
feature/user-authentication
feature/payment-integration

# 修复分支
fix/login-validation
hotfix/critical-security-patch

# 发布分支
release/v1.2.0
release/2024-q1
\`\`\`

### 保持分支整洁

\`\`\`bash
# 合并前先 rebase
git checkout feature/new-feature
git rebase main

# 压缩提交
git rebase -i HEAD~3

# 强制推送（谨慎使用）
git push --force-with-lease origin feature/new-feature
\`\`\`

## 代码审查最佳实践

1. **小而频繁的 PR**
2. **明确的描述和测试说明**
3. **及时响应审查意见**
4. **自动化测试通过后再审查**

## 总结

选择适合团队的 Git 工作流，并制定明确的规范是项目成功的关键。`,
                excerpt: 'Git 工作流的选择对团队协作至关重要，本文介绍几种主流工作流和最佳实践。',
                date: '2024-07-30',
                category: 'tools',
                tags: ['Git', '工作流', '团队协作'],
                author: 'PolarSky',
                readTime: '7 分钟'
            },
            {
                id: 'web-performance-optimization',
                title: 'Web 性能优化全面指南',
                content: `# Web 性能优化全面指南

## 为什么性能很重要？

网站性能直接影响用户体验和商业指标。页面加载时间每增加 1 秒，转化率可能下降 7%。

## 测量性能

### Core Web Vitals

Google 定义的三个核心指标：

1. **LCP (Largest Contentful Paint)**: 最大内容绘制
2. **FID (First Input Delay)**: 首次输入延迟  
3. **CLS (Cumulative Layout Shift)**: 累积布局偏移

### 测量工具

\`\`\`javascript
// Performance Observer API
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.startTime);
  }
});

observer.observe({ entryTypes: ['measure'] });

// 测量自定义指标
performance.mark('task-start');
// 执行任务...
performance.mark('task-end');
performance.measure('task-duration', 'task-start', 'task-end');
\`\`\`

## 优化策略

### 1. 资源优化

#### 图片优化

\`\`\`html
<!-- 响应式图片 -->
<picture>
  <source media="(min-width: 800px)" srcset="large.webp" type="image/webp">
  <source media="(min-width: 800px)" srcset="large.jpg">
  <source srcset="small.webp" type="image/webp">
  <img src="small.jpg" alt="描述" loading="lazy">
</picture>

<!-- 现代格式 -->
<img src="image.avif" alt="描述" 
     onerror="this.onerror=null; this.src='image.webp'">
\`\`\`

#### 字体优化

\`\`\`css
/* 字体预加载 */
@font-face {
  font-family: 'MyFont';
  src: url('font.woff2') format('woff2'),
       url('font.woff') format('woff');
  font-display: swap;
}

/* 预加载关键字体 */
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
\`\`\`

### 2. JavaScript 优化

#### 代码分割

\`\`\`javascript
// 动态导入
const loadModule = async () => {
  const { heavyFunction } = await import('./heavy-module.js');
  return heavyFunction();
};

// React lazy loading
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
\`\`\`

#### Service Worker 缓存

\`\`\`javascript
// sw.js
const CACHE_NAME = 'v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/script/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
\`\`\`

### 3. CSS 优化

\`\`\`css
/* 关键路径 CSS 内联 */
<style>
  /* 首屏关键样式 */
  .hero { ... }
  .navigation { ... }
</style>

/* 非关键 CSS 延迟加载 */
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
\`\`\`

### 4. 网络优化

#### HTTP/2 和 HTTP/3

\`\`\`javascript
// 资源提示
<link rel="dns-prefetch" href="//example.com">
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="prefetch" href="/next-page.html">
<link rel="preload" href="hero-image.jpg" as="image">
\`\`\`

#### CDN 使用

\`\`\`javascript
// 多 CDN 策略
const cdnUrls = [
  'https://cdn1.example.com',
  'https://cdn2.example.com'
];

function loadFromCDN(resource) {
  return Promise.race(
    cdnUrls.map(url => fetch(\`\${url}/\${resource}\`))
  );
}
\`\`\`

## 性能预算

建立性能预算并监控：

\`\`\`json
{
  "budget": {
    "resourceSizes": [
      { "resourceType": "script", "budget": 170 },
      { "resourceType": "total", "budget": 300 }
    ],
    "resourceCounts": [
      { "resourceType": "third-party", "budget": 10 }
    ]
  }
}
\`\`\`

## 总结

Web 性能优化是一个系统工程，需要从多个维度进行优化，并建立监控体系。`,
                excerpt: 'Web 性能优化涉及资源、网络、渲染等多个方面，本文提供全面的优化策略和实践技巧。',
                date: '2024-07-25',
                category: 'frontend',
                tags: ['性能优化', 'Web开发', '用户体验'],
                author: 'PolarSky',
                readTime: '12 分钟'
            }
        ];

        this.posts = samplePosts;
        this.extractCategories();
    }

    // 解析 Markdown 文章
    parseMarkdownPost(content, filename) {
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);
        
        let frontmatter = {};
        let markdownContent = content;

        if (match) {
            const frontmatterText = match[1];
            markdownContent = match[2];
            
            frontmatterText.split('\n').forEach(line => {
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    const key = line.substring(0, colonIndex).trim();
                    const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
                    
                    if (key === 'tags') {
                        frontmatter[key] = value.split(',').map(tag => tag.trim());
                    } else {
                        frontmatter[key] = value;
                    }
                }
            });
        }

        const id = filename.replace('.md', '');
        const excerpt = this.generateExcerpt(markdownContent);
        const readTime = this.calculateReadTime(markdownContent);

        return {
            id,
            title: frontmatter.title || this.generateTitleFromFilename(filename),
            content: markdownContent,
            excerpt,
            date: frontmatter.date || new Date().toISOString().split('T')[0],
            category: frontmatter.category || 'thoughts',
            tags: frontmatter.tags || [],
            author: frontmatter.author || 'PolarSky',
            readTime,
            filename
        };
    }

    // 从文件名生成标题
    generateTitleFromFilename(filename) {
        return filename
            .replace('.md', '')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // 生成文章摘要
    generateExcerpt(content, maxLength = 150) {
        const plainText = content
            .replace(/#{1,6}\s+/g, '')
            .replace(/\*{1,2}(.*?)\*{1,2}/g, '$1')
            .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
            .replace(/\n+/g, ' ')
            .trim();

        return plainText.length > maxLength 
            ? plainText.substring(0, maxLength) + '...'
            : plainText;
    }

    // 计算阅读时间
    calculateReadTime(content) {
        const wordsPerMinute = 200;
        const wordCount = content.length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return `${minutes} 分钟`;
    }

    // 提取分类
    extractCategories() {
        this.categories.clear();
        this.posts.forEach(post => {
            if (post.category) {
                this.categories.add(post.category);
            }
        });
    }

    // 获取所有文章
    getPosts() {
        return this.posts;
    }

    // 根据分类筛选文章
    getPostsByCategory(category) {
        if (category === 'all') {
            return this.posts;
        }
        return this.posts.filter(post => post.category === category);
    }

    // 根据ID获取文章
    getPostById(id) {
        return this.posts.find(post => post.id === id);
    }

    // 搜索文章
    searchPosts(query) {
        if (!query || query.trim() === '') {
            return [];
        }

        const searchTerm = query.toLowerCase().trim();
        
        return this.posts.filter(post => {
            return post.title.toLowerCase().includes(searchTerm) ||
                   post.excerpt.toLowerCase().includes(searchTerm) ||
                   post.content.toLowerCase().includes(searchTerm) ||
                   post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                   post.category.toLowerCase().includes(searchTerm);
        });
    }

    // 获取统计信息
    getStats() {
        const totalWords = this.posts.reduce((sum, post) => sum + post.content.length, 0);
        
        return {
            articleCount: this.posts.length,
            categoryCount: this.categories.size,
            totalWords: Math.floor(totalWords / 100)
        };
    }

    // 获取所有分类
    getCategories() {
        return Array.from(this.categories);
    }

    // 按不同方式排序文章
    sortPosts(posts, sortBy) {
        const sortedPosts = [...posts];
        
        switch (sortBy) {
            case 'date-desc':
                return sortedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
            case 'date-asc':
                return sortedPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'title-asc':
                return sortedPosts.sort((a, b) => a.title.localeCompare(b.title));
            case 'title-desc':
                return sortedPosts.sort((a, b) => b.title.localeCompare(a.title));
            default:
                return sortedPosts;
        }
    }

    // 渲染 Markdown 为 HTML
    renderMarkdown(content) {
        if (typeof marked === 'undefined') {
            return this.simpleMarkdownToHtml(content);
        }

        try {
            return marked.parse(content);
        } catch (error) {
            console.error('Markdown parsing error:', error);
            return this.simpleMarkdownToHtml(content);
        }
    }

    // 简单的 Markdown 转 HTML
    simpleMarkdownToHtml(content) {
        return content
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.*)$/gm, '<p>$1</p>')
            .replace(/<p><\/p>/g, '');
    }

    // 分页功能
    paginatePosts(posts, page = 1, postsPerPage = 6) {
        const startIndex = (page - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        
        return {
            posts: posts.slice(startIndex, endIndex),
            currentPage: page,
            totalPages: Math.ceil(posts.length / postsPerPage),
            totalPosts: posts.length,
            hasNext: endIndex < posts.length,
            hasPrev: page > 1
        };
    }

    // 检查是否正在加载
    isLoadingPosts() {
        return this.isLoading;
    }

    // 重新加载文章
    async reload() {
        return await this.initialize();
    }
}

// 导出博客管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogManager;
}
