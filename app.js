// 主应用程序 - 页面独立化管理
class BlogApp {
    constructor() {
        this.blogManager = null;
        this.currentPage = 'home';
        this.currentArticle = null;
        this.currentCategory = 'all';
        this.currentSort = 'date-desc';
        this.currentView = 'grid';
        this.currentPage_pagination = 1;
        this.postsPerPage = 6;
        
        // 页面元素
        this.elements = {};
        
        // 初始化
        this.init();
    }

    // 初始化应用
    async init() {
        try {
            // 显示加载指示器
            this.showPageLoader(true);
            
            // 初始化博客管理器
            this.blogManager = new BlogManager();
            await this.blogManager.initialize();
            
            // 初始化 DOM 元素
            this.initElements();
            
            // 绑定事件
            this.bindEvents();
            
            // 设置初始页面
            this.showPage('home');
            
            // 更新统计信息
            this.updateStats();
            
            // 隐藏加载指示器
            this.showPageLoader(false);
            
            console.log('博客应用初始化完成');
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showNotification('应用初始化失败，请刷新页面重试', 'error');
            this.showPageLoader(false);
        }
    }

    // 初始化 DOM 元素
    initElements() {
        this.elements = {
            // 导航相关
            navLinks: document.querySelectorAll('.nav-link'),
            mobileToggle: document.getElementById('mobileToggle'),
            navMenu: document.getElementById('navMenu'),
            
            // 主题切换
            themeToggle: document.getElementById('themeToggle'),
            
            // 页面相关
            pageLoader: document.getElementById('pageLoader'),
            mainContent: document.getElementById('mainContent'),
            pageSections: document.querySelectorAll('.page-section'),
            
            // 首页相关
            typingText: document.getElementById('typingText'),
            articleCount: document.getElementById('articleCount'),
            categoryCount: document.getElementById('categoryCount'),
            totalWords: document.getElementById('totalWords'),
            recentPostsGrid: document.getElementById('recentPostsGrid'),
            
            // 博客列表页相关
            blogSearchInput: document.getElementById('blogSearchInput'),
            blogSearchSubmit: document.getElementById('blogSearchSubmit'),
            categoryFilters: document.getElementById('categoryFilters'),
            sortBtn: document.getElementById('sortBtn'),
            sortMenu: document.getElementById('sortMenu'),
            sortLabel: document.getElementById('sortLabel'),
            viewBtns: document.querySelectorAll('.view-btn'),
            blogStatusInfo: document.getElementById('blogStatusInfo'),
            blogGrid: document.getElementById('blogGrid'),
            pagination: document.getElementById('pagination'),
            
            // 分类页相关
            categoriesGrid: document.getElementById('categoriesGrid'),
            
            // 文章详情页相关
            articleBreadcrumb: document.getElementById('articleBreadcrumb'),
            articleMeta: document.getElementById('articleMeta'),
            articleContent: document.getElementById('articleContent'),
            prevArticle: document.getElementById('prevArticle'),
            nextArticle: document.getElementById('nextArticle'),
            shareArticle: document.getElementById('shareArticle'),
            
            // 搜索相关
            searchBtn: document.getElementById('searchBtn'),
            searchModal: document.getElementById('searchModal'),
            searchOverlay: document.getElementById('searchOverlay'),
            closeSearch: document.getElementById('closeSearch'),
            searchInput: document.getElementById('searchInput'),
            searchSubmit: document.getElementById('searchSubmit'),
            searchResults: document.getElementById('searchResults'),
            
            // 其他
            backToTop: document.getElementById('backToTop'),
            notificationContainer: document.getElementById('notificationContainer')
        };
    }

    // 绑定事件
    bindEvents() {
        // 页面导航事件
        document.addEventListener('click', (e) => {
            const pageLink = e.target.closest('[data-page]');
            if (pageLink) {
                e.preventDefault();
                const page = pageLink.dataset.page;
                this.showPage(page);
            }
        });

        // 移动端菜单切换
        if (this.elements.mobileToggle) {
            this.elements.mobileToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // 主题切换
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // 博客列表页事件
        this.bindBlogListEvents();
        
        // 分类筛选事件
        this.bindCategoryEvents();
        
        // 搜索相关事件
        this.bindSearchEvents();
        
        // 文章相关事件
        this.bindArticleEvents();
        
        // 滚动事件
        this.bindScrollEvents();
        
        // 键盘事件
        this.bindKeyboardEvents();
    }

    // 绑定博客列表页事件
    bindBlogListEvents() {
        // 博客搜索
        if (this.elements.blogSearchSubmit) {
            this.elements.blogSearchSubmit.addEventListener('click', () => {
                this.performBlogSearch();
            });
        }
        
        if (this.elements.blogSearchInput) {
            this.elements.blogSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performBlogSearch();
                }
            });
        }

        // 排序功能
        if (this.elements.sortBtn) {
            this.elements.sortBtn.addEventListener('click', () => {
                this.toggleSortMenu();
            });
        }

        // 排序选项
        if (this.elements.sortMenu) {
            this.elements.sortMenu.addEventListener('click', (e) => {
                const sortOption = e.target.closest('.sort-option');
                if (sortOption) {
                    this.setSortOption(sortOption.dataset.sort);
                }
            });
        }

        // 视图切换
        this.elements.viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setViewMode(btn.dataset.view);
            });
        });
    }

    // 绑定分类事件
    bindCategoryEvents() {
        // 分类筛选将通过事件委托处理
        document.addEventListener('click', (e) => {
            const categoryFilter = e.target.closest('[data-category]');
            if (categoryFilter && this.currentPage === 'blog-list') {
                this.setActiveCategory(categoryFilter.dataset.category);
            }
        });
    }

    // 绑定搜索事件
    bindSearchEvents() {
        // 打开搜索
        if (this.elements.searchBtn) {
            this.elements.searchBtn.addEventListener('click', () => {
                this.openSearchModal();
            });
        }

        // 关闭搜索
        if (this.elements.closeSearch) {
            this.elements.closeSearch.addEventListener('click', () => {
                this.closeSearchModal();
            });
        }

        if (this.elements.searchOverlay) {
            this.elements.searchOverlay.addEventListener('click', () => {
                this.closeSearchModal();
            });
        }

        // 搜索输入
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', (e) => {
                this.performGlobalSearch(e.target.value);
            });
            
            this.elements.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performGlobalSearch(e.target.value);
                }
            });
        }

        if (this.elements.searchSubmit) {
            this.elements.searchSubmit.addEventListener('click', () => {
                this.performGlobalSearch(this.elements.searchInput.value);
            });
        }
    }

    // 绑定文章事件
    bindArticleEvents() {
        // 文章卡片点击事件将通过事件委托处理
        document.addEventListener('click', (e) => {
            const articleCard = e.target.closest('[data-article-id]');
            if (articleCard) {
                e.preventDefault();
                const articleId = articleCard.dataset.articleId;
                this.showArticle(articleId);
            }
        });

        // 文章导航
        if (this.elements.prevArticle) {
            this.elements.prevArticle.addEventListener('click', () => {
                this.navigateArticle('prev');
            });
        }

        if (this.elements.nextArticle) {
            this.elements.nextArticle.addEventListener('click', () => {
                this.navigateArticle('next');
            });
        }

        // 分享文章
        if (this.elements.shareArticle) {
            this.elements.shareArticle.addEventListener('click', () => {
                this.shareCurrentArticle();
            });
        }
    }

    // 绑定滚动事件
    bindScrollEvents() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            // 防抖处理
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 100);
        });

        // 返回顶部
        if (this.elements.backToTop) {
            this.elements.backToTop.addEventListener('click', () => {
                this.scrollToTop();
            });
        }
    }

    // 绑定键盘事件
    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // ESC 键关闭模态框
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            
            // Ctrl/Cmd + K 打开搜索
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearchModal();
            }
        });
    }

    // 页面显示管理
    showPage(pageName) {
        if (this.currentPage === pageName) {
            return;
        }

        // 隐藏所有页面
        this.elements.pageSections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        // 显示目标页面
        const targetPage = document.getElementById(`page-${pageName}`);
        if (targetPage) {
            targetPage.style.display = 'block';
            targetPage.classList.add('active');
        }

        // 更新导航状态
        this.updateNavigation(pageName);
        
        // 更新当前页面
        this.currentPage = pageName;

        // 执行页面特定的初始化
        this.initializePage(pageName);
        
        // 滚动到顶部
        this.scrollToTop(false);
        
        // 关闭移动端菜单
        this.closeMobileMenu();
        
        console.log(`切换到页面: ${pageName}`);
    }

    // 初始化页面特定功能
    async initializePage(pageName) {
        switch (pageName) {
            case 'home':
                this.initHomePage();
                break;
            case 'blog-list':
                this.initBlogListPage();
                break;
            case 'categories':
                this.initCategoriesPage();
                break;
            case 'article':
                // 文章页由 showArticle 方法处理
                break;
            case 'about':
                this.initAboutPage();
                break;
        }
    }

    // 初始化首页
    initHomePage() {
        // 启动打字效果
        this.startTypingEffect();
        
        // 加载最新文章
        this.loadRecentPosts();
    }

    // 初始化博客列表页
    initBlogListPage() {
        // 加载分类过滤器
        this.loadCategoryFilters();
        
        // 加载文章列表
        this.loadBlogPosts();
    }

    // 初始化分类页
    initCategoriesPage() {
        this.loadCategoriesPage();
    }

    // 初始化关于页
    initAboutPage() {
        // 关于页的特定初始化逻辑
        console.log('关于页已加载');
    }

    // 更新导航状态
    updateNavigation(activePage) {
        this.elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === activePage) {
                link.classList.add('active');
            }
        });
    }

    // 移动端菜单控制
    toggleMobileMenu() {
        this.elements.navMenu.classList.toggle('active');
        this.elements.mobileToggle.classList.toggle('active');
        document.body.classList.toggle('nav-open');
    }

    closeMobileMenu() {
        this.elements.navMenu.classList.remove('active');
        this.elements.mobileToggle.classList.remove('active');
        document.body.classList.remove('nav-open');
    }

    // 主题切换
    toggleTheme() {
        const currentTheme = document.body.dataset.theme || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.body.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        
        // 更新图标
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        this.showNotification(`已切换到${newTheme === 'light' ? '浅色' : '深色'}主题`, 'success');
    }

    // 页面加载器控制
    showPageLoader(show) {
        if (this.elements.pageLoader) {
            this.elements.pageLoader.style.display = show ? 'flex' : 'none';
        }
    }

    // 通知系统
    showNotification(message, type = 'info', duration = 3000) {
        if (!this.elements.notificationContainer) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="${iconMap[type]}"></i>
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="关闭">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // 添加到容器
        this.elements.notificationContainer.appendChild(notification);

        // 添加关闭事件
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        // 自动移除
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        // 触发动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    }

    removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    // 打字效果
    startTypingEffect() {
        const textElement = this.elements.typingText;
        if (!textElement) return;

        const texts = [
            '技术博客',
            '编程分享', 
            '开发心得',
            '代码人生'
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typingSpeed = 100;
        const deletingSpeed = 50;
        const pauseTime = 2000;

        const typeText = () => {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                textElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                textElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }

            let nextDelay = isDeleting ? deletingSpeed : typingSpeed;

            if (!isDeleting && charIndex === currentText.length) {
                nextDelay = pauseTime;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                nextDelay = typingSpeed;
            }

            setTimeout(typeText, nextDelay);
        };

        typeText();
    }

    // 更新统计信息
    updateStats() {
        if (!this.blogManager) return;

        const stats = this.blogManager.getStats();
        
        if (this.elements.articleCount) {
            this.animateNumber(this.elements.articleCount, stats.articleCount);
        }
        
        if (this.elements.categoryCount) {
            this.animateNumber(this.elements.categoryCount, stats.categoryCount);
        }
        
        if (this.elements.totalWords) {
            this.animateNumber(this.elements.totalWords, stats.totalWords);
        }
    }

    // 数字动画
    animateNumber(element, targetNumber) {
        const startNumber = parseInt(element.textContent) || 0;
        const increment = Math.ceil((targetNumber - startNumber) / 20);
        let currentNumber = startNumber;

        const animate = () => {
            currentNumber += increment;
            if (currentNumber >= targetNumber) {
                element.textContent = targetNumber;
            } else {
                element.textContent = currentNumber;
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    // 加载最新文章
    loadRecentPosts() {
        if (!this.blogManager || !this.elements.recentPostsGrid) return;

        const posts = this.blogManager.getPosts().slice(0, 3);
        
        if (posts.length === 0) {
            this.elements.recentPostsGrid.innerHTML = `
                <div class="no-posts">
                    <div class="no-posts-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <h3>暂无文章</h3>
                    <p>请在 posts/ 目录下添加 Markdown 文章</p>
                </div>
            `;
            return;
        }

        this.elements.recentPostsGrid.innerHTML = posts.map(post => `
            <article class="recent-post-card" data-article-id="${post.id}">
                <div class="post-category">
                    <i class="fas fa-tag"></i>
                    ${post.category}
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-meta">
                    <span class="post-date">
                        <i class="fas fa-calendar"></i>
                        ${post.date}
                    </span>
                    <span class="post-read-time">
                        <i class="fas fa-clock"></i>
                        ${post.readTime}
                    </span>
                </div>
            </article>
        `).join('');
    }

    // 滚动到顶部
    scrollToTop(smooth = true) {
        window.scrollTo({
            top: 0,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }

    // 关闭所有模态框
    closeAllModals() {
        // 关闭搜索模态框
        this.closeSearchModal();
    }

    // 搜索模态框控制
    openSearchModal() {
        if (this.elements.searchModal) {
            this.elements.searchModal.classList.add('active');
            this.elements.searchInput?.focus();
        }
    }

    closeSearchModal() {
        if (this.elements.searchModal) {
            this.elements.searchModal.classList.remove('active');
        }
    }

    // 加载博客文章列表（简化版）
    loadBlogPosts() {
        if (!this.blogManager || !this.elements.blogGrid) return;

        const posts = this.blogManager.getPosts();
        
        if (posts.length === 0) {
            this.elements.blogGrid.innerHTML = `
                <div class="no-posts">
                    <div class="no-posts-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <h3>暂无文章</h3>
                    <p>请在 posts/ 目录下添加 Markdown 文章</p>
                </div>
            `;
            return;
        }

        this.elements.blogGrid.innerHTML = posts.map(post => `
            <article class="blog-card" data-article-id="${post.id}">
                <div class="blog-card-header">
                    <span class="blog-card-category">${post.category}</span>
                    <span class="blog-card-date">${post.date}</span>
                </div>
                <h3 class="blog-card-title">${post.title}</h3>
                <p class="blog-card-excerpt">${post.excerpt}</p>
                <div class="blog-card-footer">
                    <div class="blog-card-tags">
                        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <span class="blog-card-read-time">${post.readTime}</span>
                </div>
            </article>
        `).join('');
    }

    // 加载分类过滤器（简化版）
    loadCategoryFilters() {
        if (!this.blogManager || !this.elements.categoryFilters) return;

        const categories = this.blogManager.getCategories();
        
        this.elements.categoryFilters.innerHTML = `
            <button class="category-filter active" data-category="all">
                全部 (${this.blogManager.getPosts().length})
            </button>
            ${categories.map(category => `
                <button class="category-filter" data-category="${category}">
                    ${category} (${this.blogManager.getPostsByCategory(category).length})
                </button>
            `).join('')}
        `;
    }

    // 加载分类页面（简化版）
    loadCategoriesPage() {
        if (!this.blogManager || !this.elements.categoriesGrid) return;

        const categories = this.blogManager.getCategories();
        
        if (categories.length === 0) {
            this.elements.categoriesGrid.innerHTML = `
                <div class="no-categories">
                    <div class="no-categories-icon">
                        <i class="fas fa-tags"></i>
                    </div>
                    <h3>暂无分类</h3>
                    <p>添加文章后将自动生成分类</p>
                </div>
            `;
            return;
        }

        this.elements.categoriesGrid.innerHTML = categories.map(category => {
            const posts = this.blogManager.getPostsByCategory(category);
            return `
                <div class="category-card" data-category="${category}">
                    <div class="category-icon">
                        <i class="fas fa-folder"></i>
                    </div>
                    <h3 class="category-name">${category}</h3>
                    <p class="category-count">${posts.length} 篇文章</p>
                    <div class="category-posts">
                        ${posts.slice(0, 3).map(post => `
                            <div class="category-post" data-article-id="${post.id}">
                                <span class="post-title">${post.title}</span>
                                <span class="post-date">${post.date}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    // 显示文章详情（简化版）
    showArticle(articleId) {
        if (!this.blogManager) return;

        const article = this.blogManager.getPostById(articleId);
        if (!article) {
            this.showNotification('文章不存在', 'error');
            return;
        }

        // 渲染文章内容
        if (this.elements.articleContent) {
            this.elements.articleContent.innerHTML = this.blogManager.renderMarkdown(article.content);
        }

        // 更新文章元信息
        if (this.elements.articleMeta) {
            this.elements.articleMeta.innerHTML = `
                <div class="article-meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>${article.date}</span>
                </div>
                <div class="article-meta-item">
                    <i class="fas fa-folder"></i>
                    <span>${article.category}</span>
                </div>
                <div class="article-meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${article.readTime}</span>
                </div>
                <div class="article-meta-item">
                    <i class="fas fa-user"></i>
                    <span>${article.author}</span>
                </div>
            `;
        }

        // 切换到文章页面
        this.showPage('article');
    }

    // 处理滚动事件
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 显示/隐藏返回顶部按钮
        if (this.elements.backToTop) {
            if (scrollTop > 300) {
                this.elements.backToTop.style.display = 'block';
            } else {
                this.elements.backToTop.style.display = 'none';
            }
        }
    }

    // 其他简化的方法存根
    performBlogSearch() { console.log('博客搜索功能'); }
    performGlobalSearch() { console.log('全局搜索功能'); }
    toggleSortMenu() { console.log('排序菜单功能'); }
    setSortOption() { console.log('设置排序选项'); }
    setViewMode() { console.log('设置视图模式'); }
    setActiveCategory() { console.log('设置活动分类'); }
    navigateArticle() { console.log('文章导航功能'); }
    shareCurrentArticle() { console.log('分享文章功能'); }
}

// 应用初始化
document.addEventListener('DOMContentLoaded', () => {
    // 设置初始主题
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.dataset.theme = savedTheme;
    
    // 启动应用
    window.blogApp = new BlogApp();
});
