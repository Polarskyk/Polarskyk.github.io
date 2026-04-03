/**
 * 文章加载模块
 * 处理文章的加载、解析、缓存和刷新逻辑
 */

const ArticleLoader = {
    // 文章数据缓存
    cache: {
        articles: [],
        filtered: [],
        lastUpdateTime: 0
    },
    
    /**
     * 加载所有文章
     * @returns {Promise<Array>} 文章数据数组
     */
    async loadAll() {
        console.log('开始加载文章...');
        console.log('环境信息:', {
            hostname: window.location.hostname,
            pathname: window.location.pathname,
            protocol: window.location.protocol
        });
        
        // 检测 file:// 协议
        if (window.location.protocol === 'file:') {
            throw new Error('请使用 HTTP 服务器访问此页面，不要直接打开 HTML 文件');
        }
        
        try {
            // 首先尝试从 GitHub API 获取
            let filesList = await this.getFilesFromGitHub();
            
            if (!filesList || filesList.length === 0) {
                // 尝试从本地索引文件获取
                filesList = await this.getFilesFromIndex();
            }
            
            if (!filesList || filesList.length === 0) {
                // 动态发现文件
                filesList = await this.discoverMarkdownFiles();
            }
            
            if (filesList && filesList.length > 0) {
                await this.loadArticlesFromList(filesList);
            } else {
                // 使用回退方案
                await this.loadArticlesFallback();
            }
            
            console.log(`成功加载 ${this.cache.articles.length} 篇文章`);
            return this.cache.articles;
        } catch (error) {
            console.error('加载文章失败:', error);
            throw error;
        }
    },
    
    /**
     * 从 GitHub API 获取文件列表
     * @returns {Promise<Array|null>}
     */
    async getFilesFromGitHub() {
        try {
            const apiUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.postsPath}`;
            
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`GitHub API 响应失败: ${response.status}`);
            }
            
            const files = await response.json();
            const markdownFiles = files
                .filter(file => file.type === 'file' && file.name.endsWith('.md') && file.name !== 'index.json')
                .map(file => ({
                    filename: file.name,
                    lastModified: new Date().getTime(),
                    size: file.size,
                    downloadUrl: file.download_url
                }));
            
            console.log(`从 GitHub API 获取到 ${markdownFiles.length} 篇文章`);
            return markdownFiles;
        } catch (error) {
            console.warn('GitHub API 获取失败:', error);
            return null;
        }
    },
    
    /**
     * 从本地索引文件获取文章列表
     * @returns {Promise<Array|null>}
     */
    async getFilesFromIndex() {
        try {
            const indexPath = PathConfig.getPostsPath('index.json');
            const response = await fetch(indexPath);
            if (!response.ok) throw new Error('索引文件不存在');
            
            const data = await response.json();
            console.log(`从索引文件获取到 ${data.files.length} 篇文章`);
            return data.files;
        } catch (error) {
            console.warn('索引文件获取失败:', error);
            return null;
        }
    },
    
    /**
     * 动态发现 Markdown 文件
     * @returns {Promise<Array>}
     */
    async discoverMarkdownFiles() {
        console.log('尝试动态发现 Markdown 文件...');
        
        const commonPatterns = [
            'welcome.md', 'index.md', 'README.md', 'about.md'
        ];
        
        const discoveredFiles = [];
        
        for (const filename of commonPatterns) {
            try {
                const postsPath = PathConfig.getPostsPath(filename);
                const response = await fetch(postsPath);
                if (response.ok) {
                    const content = await response.text();
                    if (content && content.trim()) {
                        discoveredFiles.push({
                            filename: filename,
                            lastModified: new Date().getTime(),
                            size: content.length
                        });
                    }
                }
            } catch (error) {
                // 静默处理
            }
        }
        
        console.log(`动态发现了 ${discoveredFiles.length} 篇文章`);
        return discoveredFiles;
    },
    
    /**
     * 从文件列表加载文章
     * @param {Array} filesList - 文件列表
     */
    async loadArticlesFromList(filesList) {
        const promises = filesList.map(async (fileInfo) => {
            try {
                let content;
                
                if (fileInfo.downloadUrl) {
                    const response = await fetch(fileInfo.downloadUrl);
                    if (!response.ok) throw new Error(`Failed to load ${fileInfo.filename}`);
                    content = await response.text();
                } else {
                    const postsPath = PathConfig.getPostsPath(fileInfo.filename);
                    const response = await fetch(postsPath);
                    if (!response.ok) throw new Error(`Failed to load ${fileInfo.filename}`);
                    content = await response.text();
                }
                
                if (content && content.trim()) {
                    const article = this.parseMarkdownFile(content, fileInfo.filename);
                    article.lastModified = fileInfo.lastModified;
                    article.fileSize = fileInfo.size;
                    return article;
                }
                return null;
            } catch (error) {
                console.warn(`无法加载文章 ${fileInfo.filename}:`, error);
                return null;
            }
        });
        
        const articles = await Promise.all(promises);
        this.cache.articles = articles.filter(article => article !== null);
        
        // 按日期排序
        this.cache.articles.sort((a, b) => {
            const timeA = a.lastModified || new Date(a.date).getTime() || 0;
            const timeB = b.lastModified || new Date(b.date).getTime() || 0;
            return timeB - timeA;
        });
        
        this.cache.filtered = [...this.cache.articles];
    },
    
    /**
     * 回退方案：使用预设的文件列表
     */
    async loadArticlesFallback() {
        console.log('使用静态回退方案...');
        
        const knownFiles = [
            'welcome.md',
            'javascript-es2024-features.md',
            'css-grid-flexbox-comparison.md',
            'react-18-concurrent-features.md',
            'blog-development-summary.md',
            'css-modern-styling.md',
            'css-modern-techniques.md',
            'javascript-modern-practices.md',
            'nodejs-performance-optimization.md',
            'test-dynamic-loading.md',
            '1.md'
        ];
        
        const promises = knownFiles.map(async (filename) => {
            try {
                const postsPath = PathConfig.getPostsPath(filename);
                const response = await fetch(postsPath);
                if (!response.ok) return null;
                
                const content = await response.text();
                if (content && content.trim()) {
                    return this.parseMarkdownFile(content, filename);
                }
                return null;
            } catch (error) {
                return null;
            }
        });
        
        const articles = await Promise.all(promises);
        this.cache.articles = articles.filter(article => article !== null);
        this.cache.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.cache.filtered = [...this.cache.articles];
        
        console.log(`回退方案加载了 ${this.cache.articles.length} 篇文章`);
    },
    
    /**
     * 解析 Markdown 文件
     * @param {string} content - 文件内容
     * @param {string} filename - 文件名
     * @returns {object} 文章对象
     */
    parseMarkdownFile(content, filename) {
        const lines = content.split('\n');
        let frontMatterEnd = -1;
        let frontMatter = {};
        
        // 解析 Front Matter
        if (lines[0] === '---') {
            for (let i = 1; i < lines.length; i++) {
                if (lines[i] === '---') {
                    frontMatterEnd = i;
                    break;
                }
                const match = lines[i].match(/^(\w+):\s*(.+)$/);
                if (match) {
                    const [, key, value] = match;
                    if (key === 'tags' && value.startsWith('[')) {
                        frontMatter[key] = JSON.parse(value.replace(/"/g, '"'));
                    } else {
                        frontMatter[key] = value.replace(/['"]/g, '');
                    }
                }
            }
        }
        
        // 获取文章内容
        const articleContent = lines.slice(frontMatterEnd + 1).join('\n');
        
        // 提取摘要
        let description = frontMatter.description || '';
        if (!description) {
            const paragraphs = articleContent.split('\n\n');
            for (let para of paragraphs) {
                para = para.trim();
                if (para && !para.startsWith('#') && !para.startsWith('```')) {
                    description = para.substring(0, 150) + (para.length > 150 ? '...' : '');
                    break;
                }
            }
        }
        
        // 计算阅读时间
        const wordCount = articleContent.replace(/[^\u4e00-\u9fa5\w]/g, '').length;
        const readTime = Math.max(1, Math.ceil(wordCount / 300));
        
        return {
            title: frontMatter.title || '无标题',
            date: frontMatter.date || '未知日期',
            tags: frontMatter.tags || [],
            description: description,
            filename: filename,
            content: articleContent,
            readTime: readTime
        };
    },
    
    /**
     * 获取所有文章
     * @returns {Array}
     */
    getAll() {
        return this.cache.articles;
    },
    
    /**
     * 获取已筛选的文章
     * @returns {Array}
     */
    getFiltered() {
        return this.cache.filtered;
    },
    
    /**
     * 设置已筛选的文章
     * @param {Array} articles - 文章数组
     */
    setFiltered(articles) {
        this.cache.filtered = articles;
    },
    
    /**
     * 搜索文章
     * @param {string} query - 搜索关键词
     * @returns {Array} 搜索结果
     */
    search(query) {
        if (!query || query.trim() === '') {
            this.cache.filtered = [...this.cache.articles];
        } else {
            const lowerQuery = query.toLowerCase();
            this.cache.filtered = this.cache.articles.filter(article => 
                article.title.toLowerCase().includes(lowerQuery) ||
                article.description.toLowerCase().includes(lowerQuery) ||
                article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
            );
        }
        return this.cache.filtered;
    }
};

// 导出 ArticleLoader
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ArticleLoader };
}
