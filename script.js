// 文章数据缓存
let articlesData = [];
let filteredArticles = [];
let lastUpdateTime = 0;

// GitHub配置 - 用于GitHub Pages部署
const GITHUB_CONFIG = {
    owner: 'Polarskyk',
    repo: 'Polarskyk.github.io',
    branch: 'main',
    postsPath: 'posts'
};

// DOM元素
const articlesGrid = document.getElementById('articles-grid');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('search-input');
const filterTabs = document.querySelectorAll('.filter-tab');
const articleCountElement = document.getElementById('article-count');

// 获取正确的posts路径
function getPostsPath(filename = '') {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    // 检查是否是GitHub Pages环境
    if (hostname.includes('github.io')) {
        // 对于用户/组织仓库 (username.github.io)，直接在根目录
        if (hostname.match(/^[\w-]+\.github\.io$/)) {
            return filename ? `./posts/${filename}` : './posts/';
        }
        // 对于项目仓库 (username.github.io/project-name)
        else {
            const pathParts = pathname.split('/').filter(p => p);
            if (pathParts.length > 0) {
                const repoName = pathParts[0];
                return filename ? `./${repoName}/posts/${filename}` : `./${repoName}/posts/`;
            }
        }
    }
    
    // 本地开发环境或其他环境
    return filename ? `./posts/${filename}` : './posts/';
}

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadArticles();
        updateArticleCount();
        setupEventListeners();
        setupAutoRefresh();
        hideLoading();
    } catch (error) {
        console.error('初始化失败:', error);
        showError('加载失败，请刷新页面重试');
    }
});

// 动态加载文章数据
async function loadArticles() {
    console.log('开始加载文章...');
    console.log('当前路径:', window.location.pathname);
    console.log('当前主机:', window.location.hostname);
    console.log('当前协议:', window.location.protocol);
    
    // 检测file://协议
    if (window.location.protocol === 'file:') {
        console.log('检测到file://协议，无法加载外部文件');
        showError('请使用HTTP服务器访问此页面。\n\n请在命令行中运行：\npython -m http.server 8000\n\n然后访问 http://localhost:8000');
        return;
    }
    
    // 如果是本地开发环境，直接使用备选方案
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('检测到本地环境，使用备选方案');
        await loadArticlesFallback();
        return;
    }
    
    try {
        // 尝试多种方法获取文章列表
        console.log('尝试从GitHub API获取文件列表...');
        let filesList = await getFilesFromGitHub();
        
        if (!filesList || filesList.length === 0) {
            console.log('GitHub API失败，尝试从本地索引文件获取...');
            // 尝试从本地索引文件获取
            filesList = await getFilesFromIndex();
        }
        
        if (!filesList || filesList.length === 0) {
            console.log('索引文件失败，尝试直接发现文件...');
            // 尝试直接发现文件
            filesList = await discoverMarkdownFiles();
        }
        
        if (filesList && filesList.length > 0) {
            console.log('找到文件列表，开始加载内容:', filesList);
            await loadArticlesFromList(filesList);
        } else {
            console.log('所有方法都失败了，使用备选方案');
            throw new Error('无法获取文章列表');
        }
    } catch (error) {
        console.warn('动态加载失败，使用静态备选方案:', error);
        await loadArticlesFallback();
    }
}

// 从GitHub API获取文件列表
async function getFilesFromGitHub() {
    try {
        const apiUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.postsPath}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`GitHub API响应失败: ${response.status}`);
        }
        
        const files = await response.json();
        const markdownFiles = files
            .filter(file => file.type === 'file' && file.name.endsWith('.md'))
            .map(file => ({
                filename: file.name,
                lastModified: new Date().getTime(), // GitHub API不提供修改时间
                size: file.size,
                downloadUrl: file.download_url
            }));
            
        console.log('从GitHub API获取到文章:', markdownFiles.length, '篇');
        return markdownFiles;
    } catch (error) {
        console.warn('GitHub API获取失败:', error);
        return null;
    }
}

// 从本地索引文件获取文章列表
async function getFilesFromIndex() {
    try {
        const indexPath = getPostsPath('index.json');
        const response = await fetch(indexPath);
        if (!response.ok) throw new Error('索引文件不存在');
        
        const data = await response.json();
        console.log('从索引文件获取到文章:', data.files.length, '篇');
        return data.files;
    } catch (error) {
        console.warn('索引文件获取失败:', error);
        return null;
    }
}

// 从文件列表加载文章
async function loadArticlesFromList(filesList) {
    const promises = filesList.map(async (fileInfo) => {
        try {
            let content;
            
            // 如果有GitHub下载链接，优先使用
            if (fileInfo.downloadUrl) {
                const response = await fetch(fileInfo.downloadUrl);
                if (!response.ok) throw new Error(`Failed to load ${fileInfo.filename}`);
                content = await response.text();
            } else {
                // 否则直接从posts文件夹获取
                const postsPath = getPostsPath(fileInfo.filename);
                const response = await fetch(postsPath);
                if (!response.ok) throw new Error(`Failed to load ${fileInfo.filename}`);
                content = await response.text();
            }
            
            if (content && content.trim()) {
                const article = parseMarkdownFile(content, fileInfo.filename);
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
    articlesData = articles.filter(article => article !== null);
    filteredArticles = [...articlesData];
    
    // 按日期排序（最新的在前），如果没有修改时间则按文章内的日期
    articlesData.sort((a, b) => {
        const timeA = a.lastModified || new Date(a.date).getTime() || 0;
        const timeB = b.lastModified || new Date(b.date).getTime() || 0;
        return timeB - timeA;
    });
    filteredArticles = [...articlesData];
    
    renderArticles(filteredArticles);
}

// 尝试动态发现markdown文件
async function discoverMarkdownFiles() {
    console.log('尝试动态发现markdown文件...');
    
    // 常见的文章文件名模式
    const commonPatterns = [
        'welcome.md',
        'index.md',
        'README.md',
        'about.md'
    ];
    
    // 尝试一些常见的日期格式文件名
    const datePatterns = [];
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 2; year--) {
        for (let month = 1; month <= 12; month++) {
            const monthStr = month.toString().padStart(2, '0');
            datePatterns.push(`${year}-${monthStr}.md`);
        }
    }
    
    const filesToTry = [...commonPatterns, ...datePatterns];
    const discoveredFiles = [];
    
    // 并行尝试多个可能的文件
    const promises = filesToTry.map(async (filename) => {
        try {
            const postsPath = getPostsPath(filename);
            const response = await fetch(postsPath);
            if (response.ok) {
                const content = await response.text();
                if (content && content.trim()) {
                    return {
                        filename: filename,
                        lastModified: new Date().getTime(),
                        size: content.length
                    };
                }
            }
        } catch (error) {
            // 静默处理，继续尝试其他文件
        }
        return null;
    });
    
    const results = await Promise.all(promises);
    const found = results.filter(result => result !== null);
    
    console.log('动态发现到文章:', found.length, '篇');
    return found;
}

// 回退模式：使用预设的文件列表
async function loadArticlesFallback() {
    console.log('使用静态备选方案...');
    
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
            const postsPath = getPostsPath(filename);
            const response = await fetch(postsPath);
            if (!response.ok) return null;
            
            const content = await response.text();
            if (content && content.trim()) {
                return parseMarkdownFile(content, filename);
            }
            return null;
        } catch (error) {
            return null;
        }
    });

    const articles = await Promise.all(promises);
    articlesData = articles.filter(article => article !== null);
    filteredArticles = [...articlesData];
    
    // 按日期排序（最新的在前）
    articlesData.sort((a, b) => new Date(b.date) - new Date(a.date));
    filteredArticles = [...articlesData];
    
    renderArticles(filteredArticles);
    console.log('备选方案加载了', articlesData.length, '篇文章');
}


// 设置自动刷新检查新文章（仅在支持的环境下）
function setupAutoRefresh() {
    // 在GitHub Pages等静态环境下，减少自动刷新频率
    const refreshInterval = window.location.hostname === 'localhost' ? 30000 : 300000; // 本地30秒，线上5分钟
    
    setInterval(async () => {
        try {
            const oldCount = articlesData.length;
            
            // 尝试获取新的文章列表
            let filesList = await getFilesFromGitHub();
            if (!filesList) filesList = await getFilesFromIndex();
            
            if (filesList && filesList.length !== oldCount) {
                console.log('检测到文章数量变化，正在刷新...');
                await loadArticles();
                updateArticleCount();
                renderArticles(filteredArticles);
                
                // 显示通知
                const diff = articlesData.length - oldCount;
                if (diff > 0) {
                    showNotification(`发现${diff}篇新文章！页面已自动更新。`);
                } else if (diff < 0) {
                    showNotification(`有${Math.abs(diff)}篇文章被移除。`);
                }
            }
        } catch (error) {
            // 静默处理自动刷新错误
            console.warn('自动刷新检查失败:', error);
        }
    }, refreshInterval);
}

// 解析Markdown文件
function parseMarkdownFile(content, filename) {
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
                // 处理数组格式的标签
                if (key === 'tags' && value.startsWith('[')) {
                    frontMatter[key] = JSON.parse(value.replace(/"/g, '"'));
                } else {
                    frontMatter[key] = value.replace(/['"]/g, '');
                }
            }
        }
    }

    // 获取文章内容（去掉 Front Matter）
    const articleContent = lines.slice(frontMatterEnd + 1).join('\n');
    
    // 提取摘要（第一段或description）
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

    // 估算阅读时间（基于字数）
    const wordCount = articleContent.replace(/[^\u4e00-\u9fa5\w]/g, '').length;
    const readTime = Math.max(1, Math.ceil(wordCount / 300));

    return {
        title: frontMatter.title || '无标题',
        date: frontMatter.date || '未知日期',
        category: frontMatter.category || '未分类',
        tags: frontMatter.tags || [],
        description: description,
        filename: filename,
        content: articleContent,
        readTime: readTime
    };
}

// 渲染文章列表
function renderArticles(articles) {
    if (articles.length === 0) {
        articlesGrid.innerHTML = `
            <div class="no-articles">
                <h3>没有找到文章</h3>
                <p>请尝试调整搜索条件或分类筛选</p>
            </div>
        `;
        return;
    }

    articlesGrid.innerHTML = articles.map(article => {
        return `
        <article class="article-card" data-filename="${escapeHtml(article.filename)}" data-download-url="${escapeHtml(article.downloadUrl || '')}" onclick="openArticleFromCard(this)">
            <div class="article-header">
                <h3 class="article-title">${escapeHtml(article.title)}</h3>
                <p class="article-description">${escapeHtml(article.description)}</p>
                <div class="article-meta">
                    <span class="article-date">
                        📅 ${formatDate(article.date)}
                    </span>
                    <span class="article-category">${escapeHtml(article.category)}</span>
                </div>
                <div class="article-meta">
                    <span>⏱️ ${article.readTime} 分钟阅读</span>
                </div>
                ${article.tags && article.tags.length > 0 ? `
                    <div class="article-tags">
                        ${article.tags.map(tag => `<span class="article-tag"># ${escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        </article>
    `}).join('');
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索功能
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // 分类筛选
    filterTabs.forEach(tab => {
        tab.addEventListener('click', handleCategoryFilter);
    });
}

// 搜索处理
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (!query) {
        filteredArticles = [...articlesData];
    } else {
        filteredArticles = articlesData.filter(article => 
            article.title.toLowerCase().includes(query) ||
            article.description.toLowerCase().includes(query) ||
            article.tags.some(tag => tag.toLowerCase().includes(query)) ||
            article.category.toLowerCase().includes(query)
        );
    }
    
    renderArticles(filteredArticles);
}

// 分类筛选处理
function handleCategoryFilter(e) {
    const category = e.target.dataset.category;
    
    // 更新激活状态
    filterTabs.forEach(tab => tab.classList.remove('active'));
    e.target.classList.add('active');
    
    // 筛选文章
    if (category === 'all') {
        filteredArticles = [...articlesData];
    } else {
        filteredArticles = articlesData.filter(article => 
            article.category.toLowerCase().includes(category.toLowerCase()) ||
            article.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
        );
    }
    
    // 清空搜索框
    searchInput.value = '';
    
    renderArticles(filteredArticles);
}

// 从卡片元素打开文章详情
function openArticleFromCard(cardElement) {
    const filename = cardElement.getAttribute('data-filename');
    const downloadUrl = cardElement.getAttribute('data-download-url');
    openArticle(filename, downloadUrl);
}

// 打开文章详情
function openArticle(filename, downloadUrl) {
    // 获取正确的article.html路径
    let articleBasePath = './article.html';
    
    // 如果是GitHub Pages环境，需要处理路径
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    if (hostname.includes('github.io') && !hostname.match(/^[\w-]+\.github\.io$/)) {
        // 项目仓库需要包含仓库名路径
        const pathParts = pathname.split('/').filter(p => p);
        if (pathParts.length > 0) {
            const repoName = pathParts[0];
            articleBasePath = `./${repoName}/article.html`;
        }
    }
    
    // 创建文章详情页面URL，带上download_url参数（如有）
    let articleUrl = `${articleBasePath}?file=${encodeURIComponent(filename)}`;
    if (downloadUrl && downloadUrl.trim()) {
        articleUrl += `&download_url=${encodeURIComponent(downloadUrl)}`;
    }
    console.log('打开文章:', filename, '链接:', articleUrl);
    window.open(articleUrl, '_blank');
}

// 更新文章数量统计
function updateArticleCount() {
    articleCountElement.textContent = articlesData.length;
}

// 隐藏加载状态
function hideLoading() {
    loading.classList.add('hidden');
}

// 显示错误信息
function showError(message) {
    const errorHTML = `
        <div class="error-message">
            <h3>😕 出现了一些问题</h3>
            <pre style="white-space: pre-wrap; font-family: inherit; background: var(--surface-color); padding: 1rem; border-radius: var(--radius); margin: 1rem 0;">${message}</pre>
            <button onclick="location.reload()" class="retry-button">重试</button>
        </div>
    `;
    articlesGrid.innerHTML = errorHTML;
    hideLoading();
}

// 工具函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => notification.classList.add('show'), 100);
    
    // 自动隐藏
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 手动刷新文章列表
async function refreshArticles() {
    try {
        showNotification('正在刷新文章列表...', 'info');
        
        const oldCount = articlesData.length;
        await loadArticles();
        updateArticleCount();
        renderArticles(filteredArticles);
        
        const newCount = articlesData.length;
        if (newCount > oldCount) {
            showNotification(`发现 ${newCount - oldCount} 篇新文章！`, 'success');
        } else if (newCount < oldCount) {
            showNotification(`有 ${oldCount - newCount} 篇文章被移除`, 'warning');
        } else {
            showNotification('文章列表已是最新', 'success');
        }
    } catch (error) {
        showNotification('刷新失败，请稍后重试', 'error');
        console.error('刷新失败:', error);
    }
}

// 添加一些额外的样式用于错误和无文章状态以及通知
const additionalStyles = `
    .no-articles,
    .error-message {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);
    }

    .no-articles h3,
    .error-message h3 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        color: var(--text-primary);
    }

    .retry-button,
    .refresh-button {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: var(--radius);
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: var(--transition);
        margin-top: 1rem;
        margin-right: 0.5rem;
    }

    .retry-button:hover,
    .refresh-button:hover {
        background: var(--primary-dark);
    }

    .refresh-button {
        background: var(--accent-color);
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
    }

    .refresh-button::before {
        content: '🔄';
        font-size: 1.5rem;
    }

    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: var(--radius);
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification-info {
        background: var(--primary-color);
    }

    .notification-success {
        background: #10b981;
    }

    .notification-warning {
        background: var(--accent-color);
    }

    .notification-error {
        background: #ef4444;
    }

    .last-updated {
        font-size: 0.75rem;
        color: var(--text-muted);
        text-align: center;
        margin-top: 2rem;
        padding: 1rem;
        border-top: 1px solid var(--border-color);
    }

    @media (max-width: 768px) {
        .refresh-button {
            bottom: 1rem;
            right: 1rem;
            width: 50px;
            height: 50px;
        }

        .notification {
            right: 10px;
            left: 10px;
            max-width: none;
        }
    }
`;

// 将额外样式注入到页面
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// 添加刷新按钮到页面
document.addEventListener('DOMContentLoaded', () => {
    const refreshButton = document.createElement('button');
    refreshButton.className = 'refresh-button';
    refreshButton.title = '刷新文章列表';
    refreshButton.addEventListener('click', refreshArticles);
    document.body.appendChild(refreshButton);

    // 添加最后更新时间显示
    const lastUpdated = document.createElement('div');
    lastUpdated.className = 'last-updated';
    lastUpdated.textContent = `最后更新时间: ${new Date().toLocaleString('zh-CN')}`;
    document.querySelector('.main').appendChild(lastUpdated);
});
