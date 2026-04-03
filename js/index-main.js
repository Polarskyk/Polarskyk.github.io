/**
 * 首页主脚本
 * 使用模块化架构处理文章加载、搜索和筛选
 */

// DOM 元素
const articlesGrid = document.getElementById('articles-grid');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('search-input');
const articleCountElement = document.getElementById('article-count');

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('初始化首页应用...');
        await ArticleLoader.loadAll();
        updateArticleCount();
        renderArticles(ArticleLoader.getAll());
        setupEventListeners();
        setupAutoRefresh();
        hideLoading();
        console.log('首页应用初始化完成');
    } catch (error) {
        console.error('初始化失败:', error);
        showError('加载失败，请刷新页面重试');
    }
});

/**
 * 更新文章计数
 */
function updateArticleCount() {
    const count = ArticleLoader.getAll().length;
    if (articleCountElement) {
        articleCountElement.textContent = count;
    }
}

/**
 * 隐藏加载状态
 */
function hideLoading() {
    if (loading) {
        loading.classList.add('hidden');
    }
}

/**
 * 显示错误信息
 * @param {string} message - 错误信息
 */
function showError(message) {
    const errorHTML = `
        <div class="error-message">
            <h3>😕 出现了一些问题</h3>
            <pre style="white-space: pre-wrap; font-family: inherit; background: var(--surface-color); padding: 1rem; border-radius: var(--radius); margin: 1rem 0;">${message}</pre>
            <button onclick="location.reload()" class="retry-button">重试</button>
        </div>
    `;
    if (articlesGrid) {
        articlesGrid.innerHTML = errorHTML;
    }
    hideLoading();
}

/**
 * 渲染文章列表
 * @param {Array} articles - 文章数组
 */
function renderArticles(articles) {
    if (!articlesGrid) return;
    
    if (articles.length === 0) {
        articlesGrid.innerHTML = `
            <div class="no-articles">
                <h3>没有找到文章</h3>
                <p>请尝试调整搜索条件</p>
            </div>
        `;
        return;
    }

    articlesGrid.innerHTML = articles.map(article => {
        return `
        <article class="article-card" data-filename="${escapeHtml(article.filename)}" onclick="openArticle('${escapeHtml(article.filename)}')">
            <div class="article-header">
                <h3 class="article-title">${escapeHtml(article.title)}</h3>
                <p class="article-description">${escapeHtml(article.description)}</p>
                <div class="article-meta">
                    <span class="article-date">
                        📅 ${formatDate(article.date)}
                    </span>
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

/**
 * 打开文章详情
 * @param {string} filename - 文件名
 */
function openArticle(filename) {
    const articlePath = PathConfig.getHtmlPath('article.html');
    const articleUrl = `${articlePath}?file=${encodeURIComponent(filename)}`;
    console.log('打开文章:', filename, '链接:', articleUrl);
    window.open(articleUrl, '_blank');
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    // 搜索功能
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, APP_CONFIG.searchDebounceDelay));
    }
}

/**
 * 搜索处理
 * @param {Event} e - 事件对象
 */
function handleSearch(e) {
    const query = e.target.value;
    const results = ArticleLoader.search(query);
    renderArticles(results);
}

/**
 * 设置自动刷新
 */
function setupAutoRefresh() {
    const refreshInterval = PathConfig.isGitHubPages() ? APP_CONFIG.refreshIntervalOnline : APP_CONFIG.refreshInterval;
    
    setInterval(async () => {
        try {
            const oldCount = ArticleLoader.getAll().length;
            await ArticleLoader.loadAll();
            const newCount = ArticleLoader.getAll().length;
            
            if (newCount !== oldCount) {
                console.log(`检测到文章数量变化: ${oldCount} → ${newCount}`);
                updateArticleCount();
                renderArticles(ArticleLoader.getFiltered());
                
                const diff = newCount - oldCount;
                if (diff > 0) {
                    showNotification(`发现 ${diff} 篇新文章！页面已自动更新。`, 'success');
                } else {
                    showNotification(`有 ${Math.abs(diff)} 篇文章被移除。`, 'warning');
                }
            }
        } catch (error) {
            console.warn('自动刷新检查失败:', error);
        }
    }, refreshInterval);
}

/**
 * 显示通知
 * @param {string} message - 通知信息
 * @param {string} type - 通知类型 (info, success, warning, error)
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
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
    `;
    
    // 根据类型设置背景色
    const colors = {
        info: '#2563eb',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
    };
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * 手动刷新文章列表
 */
async function refreshArticles() {
    try {
        showNotification('正在刷新文章列表...', 'info');
        
        const oldCount = ArticleLoader.getAll().length;
        await ArticleLoader.loadAll();
        updateArticleCount();
        renderArticles(ArticleLoader.getFiltered());
        
        const newCount = ArticleLoader.getAll().length;
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

// 工具函数

/**
 * HTML 转义
 * @param {string} text - 待转义的文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 格式化日期
 * @param {string} dateString - 日期字符串
 * @returns {string} 格式化后的日期
 */
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

/**
 * 防抖函数
 * @param {Function} func - 待防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
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

// 在 DOM 加载完成后添加刷新按钮
document.addEventListener('DOMContentLoaded', () => {
    const refreshButton = document.createElement('button');
    refreshButton.className = 'refresh-button';
    refreshButton.title = '刷新文章列表';
    refreshButton.textContent = '🔄';
    refreshButton.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: var(--accent-color);
        border: none;
        cursor: pointer;
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        transition: var(--transition);
    `;
    
    refreshButton.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    
    refreshButton.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
    
    refreshButton.addEventListener('click', refreshArticles);
    document.body.appendChild(refreshButton);
    
    // 添加最后更新时间显示
    const lastUpdated = document.createElement('div');
    lastUpdated.style.cssText = `
        font-size: 0.75rem;
        color: var(--text-muted);
        text-align: center;
        margin-top: 2rem;
        padding: 1rem;
        border-top: 1px solid var(--border-color);
    `;
    lastUpdated.textContent = `最后更新时间: ${new Date().toLocaleString('zh-CN')}`;
    
    const mainElement = document.querySelector('.main');
    if (mainElement) {
        mainElement.appendChild(lastUpdated);
    }
});
