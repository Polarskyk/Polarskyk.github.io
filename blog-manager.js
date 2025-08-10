// ==========================================================================
// Markdown 文章管理器
// ==========================================================================

class BlogManager {
    constructor() {
        this.posts = [];
        this.postsCache = new Map();
        this.init();
    }

    async init() {
        await this.loadPostsIndex();
    }

    // 加载文章索引
    async loadPostsIndex() {
        // 这里模拟从文件系统或API加载文章列表
        // 在实际项目中，你可能需要一个posts.json文件来列出所有文章
        const postsIndex = [
            {
                id: 'javascript-es2024-features',
                title: 'JavaScript ES2024 新特性详解',
                category: 'frontend',
                date: '2025-01-15',
                author: 'Polarsky',
                readTime: '8分钟',
                excerpt: '深入了解 JavaScript ES2024 版本中引入的新特性，包括新的数组方法、装饰器语法和模块改进等...',
                tags: ['JavaScript', 'ES2024', '前端开发'],
                filename: 'javascript-es2024-features.md'
            },
            {
                id: 'react-18-concurrent-features',
                title: 'React 18 并发特性实践指南',
                category: 'frontend',
                date: '2025-01-12',
                author: 'Polarsky',
                readTime: '10分钟',
                excerpt: 'React 18 引入的并发特性为用户体验带来了革命性的改进。本文将通过实际案例展示如何使用这些新特性...',
                tags: ['React', 'React 18', '并发', '前端'],
                filename: 'react-18-concurrent-features.md'
            },
            {
                id: 'nodejs-performance-optimization',
                title: 'Node.js 性能优化最佳实践',
                category: 'backend',
                date: '2025-01-10',
                author: 'Polarsky',
                readTime: '12分钟',
                excerpt: '深入探讨 Node.js 应用的性能优化策略，从内存管理到异步编程，全面提升应用性能...',
                tags: ['Node.js', '性能优化', '后端开发'],
                filename: 'nodejs-performance-optimization.md'
            },
            {
                id: 'git-workflow-best-practices',
                title: 'Git 工作流最佳实践',
                category: 'tools',
                date: '2025-01-08',
                author: 'Polarsky',
                readTime: '6分钟',
                excerpt: '分享在团队协作中使用 Git 的最佳实践，包括分支策略、提交规范和代码审查流程...',
                tags: ['Git', '版本控制', '团队协作'],
                filename: 'git-workflow-best-practices.md'
            },
            {
                id: 'developer-growth-journey',
                title: '我的开发者成长之路',
                category: 'life',
                date: '2025-01-05',
                author: 'Polarsky',
                readTime: '5分钟',
                excerpt: '回顾我从编程小白到全栈开发者的成长历程，分享一些学习心得和人生感悟...',
                tags: ['成长', '学习', '感悟'],
                filename: 'developer-growth-journey.md'
            },
            {
                id: 'typescript-advanced-types',
                title: 'TypeScript 高级类型系统深度解析',
                category: 'frontend',
                date: '2025-01-03',
                author: 'Polarsky',
                readTime: '15分钟',
                excerpt: '深入探讨 TypeScript 的高级类型系统，包括泛型、条件类型、映射类型等复杂概念...',
                tags: ['TypeScript', '类型系统', '高级特性'],
                filename: 'typescript-advanced-types.md'
            }
        ];

        this.posts = postsIndex;
    }

    // 获取所有文章
    getAllPosts() {
        return this.posts;
    }

    // 根据分类过滤文章
    getPostsByCategory(category) {
        if (category === 'all') {
            return this.posts;
        }
        return this.posts.filter(post => post.category === category);
    }

    // 搜索文章
    searchPosts(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.posts.filter(post => 
            post.title.toLowerCase().includes(lowercaseQuery) ||
            post.excerpt.toLowerCase().includes(lowercaseQuery) ||
            post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        );
    }

    // 获取单篇文章详情
    async getPostById(id) {
        const post = this.posts.find(p => p.id === id);
        if (!post) {
            throw new Error(`Post with id "${id}" not found`);
        }

        // 检查缓存
        if (this.postsCache.has(id)) {
            return this.postsCache.get(id);
        }

        // 加载 Markdown 内容
        try {
            const content = await this.loadMarkdownFile(post.filename);
            const fullPost = {
                ...post,
                content: content
            };
            
            // 缓存结果
            this.postsCache.set(id, fullPost);
            return fullPost;
        } catch (error) {
            console.error(`Failed to load post ${id}:`, error);
            throw error;
        }
    }

    // 加载 Markdown 文件
    async loadMarkdownFile(filename) {
        try {
            const response = await fetch(`./posts/${filename}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error(`Failed to load markdown file ${filename}:`, error);
            // 返回默认内容
            return this.getDefaultContent(filename);
        }
    }

    // 获取默认内容（当文件加载失败时）
    getDefaultContent(filename) {
        const defaultContents = {
            'javascript-es2024-features.md': `# JavaScript ES2024 新特性详解

JavaScript 持续演进，ES2024 版本带来了许多令人兴奋的新特性。

## 新的数组方法

ES2024 引入了几个新的数组方法：

\`\`\`javascript
// Array.prototype.toReversed()
const original = [1, 2, 3, 4, 5];
const reversed = original.toReversed(); // [5, 4, 3, 2, 1]
console.log(original); // [1, 2, 3, 4, 5] - 原数组不变
\`\`\`

这些方法的优势在于它们不会修改原数组，而是返回新的数组实例。`,

            'react-18-concurrent-features.md': `# React 18 并发特性实践指南

React 18 的并发特性是框架发展的重要里程碑。

## Suspense 和错误边界

\`\`\`jsx
function App() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<Loading />}>
                <UserProfile userId={1} />
            </Suspense>
        </ErrorBoundary>
    );
}
\`\`\`

这些特性让应用更加流畅和响应迅速。`,

            'nodejs-performance-optimization.md': `# Node.js 性能优化最佳实践

Node.js 应用的性能优化是一个系统性工程。

## 内存管理

避免内存泄漏是性能优化的关键：

\`\`\`javascript
// 避免全局变量导致的内存泄漏
const dataCache = new Map();

function processData(data) {
    const result = expensiveOperation(data);
    dataCache.set(data.id, result);
    
    // 设置过期时间
    setTimeout(() => {
        dataCache.delete(data.id);
    }, 300000); // 5分钟后清理
    
    return result;
}
\`\`\``,

            'git-workflow-best-practices.md': `# Git 工作流最佳实践

良好的 Git 工作流是团队协作成功的关键。

## 分支策略

\`\`\`bash
# 创建功能分支
git checkout -b feature/user-authentication

# 开发完成后合并到 develop
git checkout develop
git merge feature/user-authentication
\`\`\`

## 提交规范

使用约定式提交格式：

\`\`\`bash
git commit -m "feat: 添加用户认证功能"
\`\`\``,

            'developer-growth-journey.md': `# 我的开发者成长之路

回首编程生涯，从懵懂新手到现在的全栈开发者，这一路充满了挑战和收获。

## 初学阶段

刚开始学编程时，每一个语法错误都让我抓狂。记得第一次写出 "Hello, World!" 时的激动心情。

## 技能积累

随着项目经验的积累，逐渐掌握了：
- 前端技术栈（HTML/CSS/JavaScript）
- 后端开发（Node.js/Python）
- 数据库设计（MySQL/MongoDB）

## 感悟

编程不仅是技术，更是一种思维方式。保持好奇心，持续学习，享受创造的乐趣。`,

            'typescript-advanced-types.md': `# TypeScript 高级类型系统深度解析

TypeScript 的类型系统是其最强大的特性之一。

## 条件类型

条件类型允许我们根据条件选择类型：

\`\`\`typescript
type ApiResponse<T> = T extends string 
    ? { message: T } 
    : { data: T };

type StringResponse = ApiResponse<string>; // { message: string }
type ObjectResponse = ApiResponse<User>; // { data: User }
\`\`\`

## 映射类型

映射类型可以基于现有类型创建新类型：

\`\`\`typescript
type Partial<T> = {
    [P in keyof T]?: T[P];
};
\`\`\`

这些高级特性让 TypeScript 的类型系统更加强大和灵活。`
        };

        return defaultContents[filename] || `# 文章内容

抱歉，文章内容暂时无法加载。请稍后再试。

**文件名**: ${filename}

如果问题持续存在，请联系管理员。`;
    }

    // 解析 Markdown 元数据
    parseMarkdownMetadata(content) {
        const lines = content.split('\n');
        const metadata = {};
        let inMetadata = false;
        let contentStart = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line === '---' && i === 0) {
                inMetadata = true;
                continue;
            }
            
            if (line === '---' && inMetadata) {
                contentStart = i + 1;
                break;
            }
            
            if (inMetadata && line.includes(':')) {
                const [key, ...valueParts] = line.split(':');
                metadata[key.trim()] = valueParts.join(':').trim();
            }
        }

        const actualContent = lines.slice(contentStart).join('\n');
        return { metadata, content: actualContent };
    }

    // 渲染 Markdown 为 HTML
    renderMarkdown(content) {
        if (typeof marked !== 'undefined') {
            // 配置 marked
            marked.setOptions({
                highlight: function(code, lang) {
                    if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (err) {
                            console.error('Highlight error:', err);
                        }
                    }
                    return code;
                },
                breaks: true,
                gfm: true
            });

            return marked.parse(content);
        } else {
            // 简单的 Markdown 解析（fallback）
            return this.simpleMarkdownParser(content);
        }
    }

    // 简单的 Markdown 解析器（fallback）
    simpleMarkdownParser(content) {
        return content
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/!\[([^\]]*)\]\(([^\)]*)\)/gim, '<img alt="$1" src="$2" />')
            .replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2">$1</a>')
            .replace(/```([^`]*)```/gim, '<pre><code>$1</code></pre>')
            .replace(/`([^`]*)`/gim, '<code>$1</code>')
            .replace(/\n/gim, '<br/>');
    }

    // 获取相关文章
    getRelatedPosts(currentPostId, limit = 3) {
        const currentPost = this.posts.find(p => p.id === currentPostId);
        if (!currentPost) return [];

        return this.posts
            .filter(post => post.id !== currentPostId)
            .filter(post => 
                post.category === currentPost.category ||
                post.tags.some(tag => currentPost.tags.includes(tag))
            )
            .slice(0, limit);
    }

    // 获取统计信息
    getStats() {
        const categories = [...new Set(this.posts.map(p => p.category))];
        const totalPosts = this.posts.length;
        const totalViews = this.posts.reduce((sum, post) => sum + (post.views || 0), 0);

        return {
            totalPosts,
            totalViews,
            categories: categories.length,
            latestPost: this.posts.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        };
    }

    // 生成 RSS Feed
    generateRSSFeed() {
        const siteUrl = window.location.origin;
        const feedItems = this.posts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10)
            .map(post => `
                <item>
                    <title>${this.escapeXml(post.title)}</title>
                    <link>${siteUrl}/#blog/${post.id}</link>
                    <description>${this.escapeXml(post.excerpt)}</description>
                    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
                    <guid>${siteUrl}/#blog/${post.id}</guid>
                </item>
            `).join('');

        return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>Polarsky's Blog</title>
        <link>${siteUrl}</link>
        <description>技术分享与生活感悟的个人博客</description>
        <language>zh-CN</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${feedItems}
    </channel>
</rss>`;
    }

    // XML 转义
    escapeXml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// 导出为全局变量
window.BlogManager = BlogManager;
