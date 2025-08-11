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
            console.log('🔄 开始初始化博客管理器...');
            
            await this.loadPosts();
            
            this.isLoading = false;
            console.log('✅ 博客管理器初始化完成');
            return true;
        } catch (error) {
            console.error('❌ 博客管理器初始化失败:', error);
            this.isLoading = false;
            // 不再创建示例文章，只是初始化空的文章列表
            this.posts = [];
            this.extractCategories();
            console.log('⚠️ 使用空文章列表继续运行');
            return true;
        }
    }

    // 刷新文章列表 - 重新发现和加载所有文章
    async refresh() {
        console.log('🔄 刷新文章列表...');
        return await this.initialize();
    }

    // 加载所有博客文章
    async loadPosts() {
        try {
            console.log('🔍 开始检测 Markdown 文件...');
            
            // 获取 posts 目录下的所有 Markdown 文件
            const postFiles = await this.getMarkdownFiles();
            
            if (postFiles.length === 0) {
                console.log('📝 没有找到 Markdown 文章，请在 posts/ 目录下添加 .md 文件');
                this.posts = [];
                this.extractCategories();
                return;
            }

            console.log(`📂 找到 ${postFiles.length} 个文章文件，开始加载...`);

            // 并行加载所有文章
            const loadPromises = postFiles.map(filename => this.loadPost(filename));
            const results = await Promise.allSettled(loadPromises);
            
            // 过滤成功加载的文章
            this.posts = results
                .filter(result => result.status === 'fulfilled' && result.value)
                .map(result => result.value);

            // 统计加载结果
            const successCount = this.posts.length;
            const failedCount = postFiles.length - successCount;
            
            if (failedCount > 0) {
                console.warn(`⚠️ ${failedCount} 个文件加载失败`);
            }

            // 按日期排序（最新的在前面）
            this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            this.extractCategories();
            
            console.log(`✅ 成功加载 ${successCount} 篇文章，来自 ${postFiles.length} 个文件`);
            console.log(`📊 文章分类: ${Array.from(this.categories).join(', ')}`);
        } catch (error) {
            console.error('💥 加载文章时出错:', error);
            this.posts = [];
            this.extractCategories();
            throw error;
        }
    }

    // 获取 posts 目录下的所有 Markdown 文件
    async getMarkdownFiles() {
        console.log('🔍 开始动态发现 Markdown 文件...');
        
        // 尝试多种方式发现文件
        const discoveredFiles = await this.discoverMarkdownFiles();
        
        if (discoveredFiles.length > 0) {
            console.log(`📁 动态发现 ${discoveredFiles.length} 个 Markdown 文件`);
            return discoveredFiles;
        }

        // 如果动态发现失败，尝试常见的文件名模式
        console.log('🔄 动态发现失败，尝试常见文件名模式...');
        const commonFiles = await this.tryCommonFileNames();
        
        if (commonFiles.length > 0) {
            console.log(`📂 通过模式匹配找到 ${commonFiles.length} 个文件`);
            return commonFiles;
        }

        console.log('❌ 没有找到任何 Markdown 文件');
        return [];
    }

    // 动态发现 Markdown 文件
    async discoverMarkdownFiles() {
        const discoveredFiles = [];
        
        // 尝试访问 posts 目录的索引（如果服务器支持目录列表）
        try {
            const response = await fetch(this.postsDirectory);
            if (response.ok) {
                const html = await response.text();
                
                // 解析 HTML 寻找 .md 文件链接
                const mdFiles = this.extractMarkdownLinksFromHTML(html);
                discoveredFiles.push(...mdFiles);
                
                if (mdFiles.length > 0) {
                    console.log(`🎯 从目录索引发现 ${mdFiles.length} 个文件`);
                }
            }
        } catch (error) {
            console.log('📂 目录索引不可用，继续尝试其他方法...');
        }

        return discoveredFiles;
    }

    // 从 HTML 中提取 Markdown 文件链接
    extractMarkdownLinksFromHTML(html) {
        const mdFiles = [];
        
        // 匹配指向 .md 文件的链接
        const linkRegex = /<a[^>]+href=['"](([^'"]*\.md))['"]/gi;
        let match;
        
        while ((match = linkRegex.exec(html)) !== null) {
            const filename = match[2];
            // 确保是简单的文件名，不是路径
            if (filename && !filename.includes('/') && !filename.includes('\\')) {
                mdFiles.push(filename);
            }
        }
        
        // 去重
        return [...new Set(mdFiles)];
    }

    // 尝试常见的文件名模式
    async tryCommonFileNames() {
        const commonPatterns = [
            // 数字命名模式
            ...Array.from({length: 20}, (_, i) => `${i + 1}.md`),
            
            // 常见文件名
            'index.md',
            'welcome.md',
            'hello.md',
            'first-post.md',
            'introduction.md',
            'about.md',
            'test.md',
            'demo.md',
            'sample.md',
            'test-dynamic-loading.md',
            
            // 技术相关常见名称
            'javascript.md',
            'css.md',
            'html.md',
            'react.md',
            'vue.md',
            'node.md',
            'python.md',
            'tutorial.md',
            'guide.md',
            'blog.md',
            
            // 日期模式 (YYYY-MM-DD)
            ...this.generateDatePatterns()
        ];

        const existingFiles = [];
        
        // 批量检查文件存在性
        const checkPromises = commonPatterns.map(async (filename) => {
            try {
                const response = await fetch(`${this.postsDirectory}${filename}`, {
                    method: 'HEAD'
                });
                
                if (response.ok) {
                    console.log(`✓ 发现文章: ${filename}`);
                    return filename;
                }
                return null;
            } catch (error) {
                return null;
            }
        });

        const results = await Promise.allSettled(checkPromises);
        
        results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value) {
                existingFiles.push(result.value);
            }
        });

        return existingFiles;
    }

    // 生成日期模式的文件名
    generateDatePatterns() {
        const patterns = [];
        const currentYear = new Date().getFullYear();
        
        // 生成最近两年的月份模式
        for (let year = currentYear - 1; year <= currentYear; year++) {
            for (let month = 1; month <= 12; month++) {
                const monthStr = month.toString().padStart(2, '0');
                patterns.push(`${year}-${monthStr}.md`);
                
                // 添加一些常见的日期模式
                for (let day of [1, 15]) {
                    const dayStr = day.toString().padStart(2, '0');
                    patterns.push(`${year}-${monthStr}-${dayStr}.md`);
                }
            }
        }
        
        return patterns;
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
    // 示例文章方法已完全移除
    // 不再需要创建示例文章，系统专注于处理真实的 Markdown 文件

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
