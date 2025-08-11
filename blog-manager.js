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

    // 创建示例文章（空实现 - 所有示例已删除）
    // 创建示例文章（空实现 - 所有示例已删除）
    async createSamplePosts() {
        console.log('示例文章已清空，请在 posts/ 目录下添加真实的 Markdown 文章');
        this.posts = [];
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
