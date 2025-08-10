// 主要的博客应用类
class PersonalBlog {
    constructor() {
        this.blogManager = null;
        this.currentSection = 'home';
        this.currentCategory = 'all';
        this.currentSort = 'date-desc';
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.searchTimeout = null;
        
        this.init();
    }

    // 初始化应用
    async init() {
        this.setupEventListeners();
        this.setupTheme();
        this.setupTypingEffect();
        
        // 初始化博客管理器
        this.blogManager = new BlogManager();
        const success = await this.blogManager.initialize();
        
        if (success) {
            this.updateStats();
            this.renderBlogPosts();
        } else {
            this.showEmptyState();
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        // 导航
        this.setupNavigation();
        
        // 主题切换
        const themeToggle = document.getElementById('themeToggle');
        themeToggle?.addEventListener('click', () => this.toggleTheme());
        
        // 搜索
        const searchBtn = document.getElementById('searchBtn');
        const searchModal = document.getElementById('searchModal');
        const closeSearch = document.getElementById('closeSearch');
        const searchInput = document.getElementById('searchInput');
        
        searchBtn?.addEventListener('click', () => this.openSearch());
        closeSearch?.addEventListener('click', () => this.closeSearch());
        searchInput?.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // 移动端菜单
        const mobileToggle = document.getElementById('mobileToggle');
        const navMenu = document.getElementById('navMenu');
        
        mobileToggle?.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // 博客过滤和排序
        this.setupBlogFilters();
        
        // 联系表单
        this.setupContactForm();
        
        // 模态框关闭
        this.setupModalEvents();
        
        // 滚动事件
        window.addEventListener('scroll', () => this.handleScroll());
        
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // 设置导航
    setupNavigation() {
        const navLinks = document.querySelectorAll('[data-section]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateToSection(section);
            });
        });
    }

    // 设置博客过滤器
    setupBlogFilters() {
        // 分类过滤
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.getAttribute('data-category');
                this.filterByCategory(category);
                
                // 更新激活状态
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
        
        // 排序
        const sortBtn = document.getElementById('sortBtn');
        const sortMenu = document.getElementById('sortMenu');
        const sortOptions = document.querySelectorAll('.sort-option');
        
        sortBtn?.addEventListener('click', () => {
            sortMenu.classList.toggle('active');
        });
        
        sortOptions.forEach(option => {
            option.addEventListener('click', () => {
                const sortBy = option.getAttribute('data-sort');
                this.sortPosts(sortBy);
                
                // 更新激活状态
                sortOptions.forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                
                // 更新按钮文本
                const btnText = sortBtn.querySelector('span');
                if (btnText) {
                    btnText.textContent = option.textContent;
                }
                
                sortMenu.classList.remove('active');
            });
        });
        
        // 点击外部关闭排序菜单
        document.addEventListener('click', (e) => {
            if (!sortBtn?.contains(e.target)) {
                sortMenu?.classList.remove('active');
            }
        });
        
        // 分页
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        
        prevPage?.addEventListener('click', () => this.changePage(this.currentPage - 1));
        nextPage?.addEventListener('click', () => this.changePage(this.currentPage + 1));
    }

    // 设置联系表单
    setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        
        contactForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContactForm(e.target);
        });
    }

    // 设置模态框事件
    setupModalEvents() {
        const modals = document.querySelectorAll('.modal');
        const closeButtons = document.querySelectorAll('.modal-close');
        
        // 关闭按钮
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                modal?.classList.remove('active');
            });
        });
        
        // 点击背景关闭
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    // 设置主题
    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    // 切换主题
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
        
        this.showNotification(`已切换到${newTheme === 'light' ? '浅色' : '深色'}主题`, 'success');
    }

    // 更新主题图标
    updateThemeIcon(theme) {
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle?.querySelector('i');
        
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    // 设置打字效果
    setupTypingEffect() {
        const texts = ['技术博客', '代码世界', '开发之旅', '创新思维'];
        const typingElement = document.getElementById('typingText');
        
        if (!typingElement) return;
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        const typeText = () => {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }
            
            let typeSpeed = isDeleting ? 100 : 200;
            
            if (!isDeleting && charIndex === currentText.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typeSpeed = 500;
            }
            
            setTimeout(typeText, typeSpeed);
        };
        
        typeText();
    }

    // 导航到指定区域
    navigateToSection(sectionId) {
        // 隐藏所有区域
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.remove('active'));
        
        // 显示目标区域
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
        }
        
        // 更新导航状态
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });
        
        // 关闭移动端菜单
        const navMenu = document.getElementById('navMenu');
        navMenu?.classList.remove('active');
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 更新统计信息
    updateStats() {
        if (!this.blogManager) return;
        
        const stats = this.blogManager.getStats();
        
        const articleCount = document.getElementById('articleCount');
        const categoryCount = document.getElementById('categoryCount');
        const totalWords = document.getElementById('totalWords');
        
        if (articleCount) this.animateNumber(articleCount, stats.articleCount);
        if (categoryCount) this.animateNumber(categoryCount, stats.categoryCount);
        if (totalWords) this.animateNumber(totalWords, stats.totalWords);
    }

    // 数字动画
    animateNumber(element, target) {
        const start = 0;
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeOut);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // 渲染博客文章
    renderBlogPosts() {
        if (!this.blogManager) return;
        
        const blogGrid = document.getElementById('blogGrid');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        
        if (!blogGrid) return;
        
        // 隐藏加载状态
        if (loadingState) loadingState.style.display = 'none';
        
        // 获取筛选后的文章
        let posts = this.blogManager.getPostsByCategory(this.currentCategory);
        posts = this.blogManager.sortPosts(posts, this.currentSort);
        
        if (posts.length === 0) {
            this.showEmptyState();
            return;
        }
        
        // 分页
        const paginatedData = this.blogManager.paginatePosts(posts, this.currentPage, this.postsPerPage);
        
        // 清除现有内容
        blogGrid.innerHTML = '';
        
        // 渲染文章卡片
        paginatedData.posts.forEach(post => {
            const card = this.createBlogCard(post);
            blogGrid.appendChild(card);
        });
        
        // 更新分页器
        this.updatePagination(paginatedData);
        
        // 隐藏空状态
        if (emptyState) emptyState.style.display = 'none';
    }

    // 创建博客卡片
    createBlogCard(post) {
        const card = document.createElement('article');
        card.className = 'blog-card';
        card.setAttribute('data-post-id', post.id);
        
        // 选择图标
        const iconMap = {
            'frontend': 'fab fa-js',
            'backend': 'fas fa-server',
            'tools': 'fas fa-tools',
            'thoughts': 'fas fa-lightbulb'
        };
        const icon = iconMap[post.category] || 'fas fa-file-alt';
        
        // 分类名称映射
        const categoryNames = {
            'frontend': '前端开发',
            'backend': '后端开发',
            'tools': '开发工具',
            'thoughts': '技术思考',
            'uncategorized': '其他'
        };
        
        card.innerHTML = `
            <div class="blog-card-header">
                <i class="${icon}"></i>
            </div>
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <span class="blog-card-category">${categoryNames[post.category] || post.category}</span>
                    <span class="blog-card-date">${post.date}</span>
                </div>
                <h3 class="blog-card-title">${post.title}</h3>
                <p class="blog-card-excerpt">${post.excerpt}</p>
                <div class="blog-card-footer">
                    <div class="blog-card-tags">
                        ${post.tags.slice(0, 3).map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
                    </div>
                    <a href="#" class="blog-card-read-more" data-post-id="${post.id}">
                        阅读更多
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
        
        // 添加点击事件
        card.addEventListener('click', () => this.openArticle(post.id));
        
        return card;
    }

    // 显示空状态
    showEmptyState() {
        const blogGrid = document.getElementById('blogGrid');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        
        if (loadingState) loadingState.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        if (blogGrid) blogGrid.innerHTML = '';
    }

    // 按分类筛选
    filterByCategory(category) {
        this.currentCategory = category;
        this.currentPage = 1;
        this.renderBlogPosts();
    }

    // 排序文章
    sortPosts(sortBy) {
        this.currentSort = sortBy;
        this.currentPage = 1;
        this.renderBlogPosts();
    }

    // 更改页面
    changePage(page) {
        if (!this.blogManager) return;
        
        const posts = this.blogManager.getPostsByCategory(this.currentCategory);
        const totalPages = Math.ceil(posts.length / this.postsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderBlogPosts();
        
        // 滚动到博客区域顶部
        const blogSection = document.getElementById('blog');
        if (blogSection) {
            blogSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // 更新分页器
    updatePagination(paginatedData) {
        const pagination = document.getElementById('pagination');
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');
        const pageNumbers = document.getElementById('pageNumbers');
        
        if (!pagination) return;
        
        // 显示/隐藏分页器
        if (paginatedData.totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        } else {
            pagination.style.display = 'flex';
        }
        
        // 更新按钮状态
        if (prevButton) {
            prevButton.disabled = !paginatedData.hasPrev;
        }
        
        if (nextButton) {
            nextButton.disabled = !paginatedData.hasNext;
        }
        
        // 更新页码
        if (pageNumbers) {
            pageNumbers.innerHTML = '';
            
            for (let i = 1; i <= paginatedData.totalPages; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = 'page-number';
                pageBtn.textContent = i;
                
                if (i === paginatedData.currentPage) {
                    pageBtn.classList.add('active');
                }
                
                pageBtn.addEventListener('click', () => this.changePage(i));
                pageNumbers.appendChild(pageBtn);
            }
        }
    }

    // 打开搜索
    openSearch() {
        const searchModal = document.getElementById('searchModal');
        const searchInput = document.getElementById('searchInput');
        
        if (searchModal) {
            searchModal.classList.add('active');
            searchInput?.focus();
        }
    }

    // 关闭搜索
    closeSearch() {
        const searchModal = document.getElementById('searchModal');
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        
        if (searchModal) {
            searchModal.classList.remove('active');
        }
        
        if (searchInput) {
            searchInput.value = '';
        }
        
        if (searchResults) {
            searchResults.innerHTML = `
                <div class="search-placeholder">
                    <i class="fas fa-search"></i>
                    <p>输入关键词开始搜索</p>
                </div>
            `;
        }
    }

    // 处理搜索
    handleSearch(query) {
        if (!this.blogManager) return;
        
        clearTimeout(this.searchTimeout);
        
        this.searchTimeout = setTimeout(() => {
            const searchResults = document.getElementById('searchResults');
            if (!searchResults) return;
            
            if (!query.trim()) {
                searchResults.innerHTML = `
                    <div class="search-placeholder">
                        <i class="fas fa-search"></i>
                        <p>输入关键词开始搜索</p>
                    </div>
                `;
                return;
            }
            
            const results = this.blogManager.searchPosts(query);
            
            if (results.length === 0) {
                searchResults.innerHTML = `
                    <div class="search-placeholder">
                        <i class="fas fa-search"></i>
                        <p>没有找到相关文章</p>
                    </div>
                `;
                return;
            }
            
            searchResults.innerHTML = results.map(post => `
                <div class="search-result" data-post-id="${post.id}">
                    <div class="search-result-title">${post.title}</div>
                    <div class="search-result-excerpt">${post.excerpt}</div>
                </div>
            `).join('');
            
            // 添加点击事件
            searchResults.querySelectorAll('.search-result').forEach(result => {
                result.addEventListener('click', () => {
                    const postId = result.getAttribute('data-post-id');
                    this.closeSearch();
                    this.openArticle(postId);
                });
            });
        }, 300);
    }

    // 打开文章
    async openArticle(postId) {
        try {
            let post;
            if (this.blogManager) {
                post = this.blogManager.getPostById(postId);
            }

            if (!post) {
                this.showNotification('文章未找到', 'error');
                return;
            }

            const articleModal = document.getElementById('articleModal');
            const articleContainer = document.getElementById('articleContainer');

            if (!articleModal || !articleContainer) return;

            // 渲染文章内容
            let htmlContent;
            if (this.blogManager && post.content) {
                htmlContent = this.blogManager.renderMarkdown(post.content);
            } else if (typeof marked !== 'undefined' && post.content) {
                htmlContent = marked.parse(post.content);
            } else {
                htmlContent = `
                    <h1>${post.title}</h1>
                    <div class="article-meta">
                        <span><i class="fas fa-calendar"></i> ${post.date}</span>
                        <span><i class="fas fa-folder"></i> ${this.getCategoryName(post.category)}</span>
                        <span><i class="fas fa-clock"></i> ${post.readTime}</span>
                    </div>
                    <div class="article-content">
                        <p>${post.excerpt}</p>
                        <p><em>完整文章内容正在加载中...</em></p>
                    </div>
                `;
            }

            articleContainer.innerHTML = htmlContent;

            // 高亮代码
            if (typeof hljs !== 'undefined') {
                articleContainer.querySelectorAll('pre code').forEach(block => {
                    hljs.highlightElement(block);
                });
            }

            articleModal.classList.add('active');
        } catch (error) {
            console.error('Failed to load article:', error);
            this.showNotification('文章加载失败，请稍后再试', 'error');
        }
    }

    // 获取分类名称
    getCategoryName(category) {
        const categoryNames = {
            'frontend': '前端开发',
            'backend': '后端开发',
            'tools': '开发工具',
            'thoughts': '技术思考',
            'uncategorized': '其他'
        };
        return categoryNames[category] || category;
    }

    // 处理联系表单
    handleContactForm(form) {
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };
        
        // 简单验证
        if (!data.name || !data.email || !data.subject || !data.message) {
            this.showNotification('请填写所有必填字段', 'error');
            return;
        }
        
        // 模拟发送（实际项目中需要集成邮件服务）
        this.showNotification('消息已发送，我会尽快回复您！', 'success');
        form.reset();
    }

    // 显示通知
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationIcon = notification?.querySelector('.notification-icon');
        const notificationMessage = notification?.querySelector('.notification-message');
        
        if (!notification) return;
        
        // 设置图标
        if (notificationIcon) {
            notificationIcon.className = type === 'success' 
                ? 'notification-icon fas fa-check-circle'
                : 'notification-icon fas fa-exclamation-circle';
        }
        
        // 设置消息
        if (notificationMessage) {
            notificationMessage.textContent = message;
        }
        
        // 设置类型
        notification.className = `notification ${type}`;
        
        // 显示通知
        notification.classList.add('show');
        
        // 自动隐藏
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // 处理滚动事件
    handleScroll() {
        const navbar = document.getElementById('navbar');
        
        if (window.scrollY > 100) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    }

    // 处理键盘事件
    handleKeyboard(e) {
        // ESC 键关闭模态框
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                activeModal.classList.remove('active');
            }
        }
        
        // Ctrl/Cmd + K 打开搜索
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.openSearch();
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new PersonalBlog();
});

// 处理页面可见性变化
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // 页面重新变为可见时可以执行一些操作
        console.log('页面重新可见');
    }
});

// 处理离线/在线状态
window.addEventListener('online', () => {
    console.log('网络连接已恢复');
});

window.addEventListener('offline', () => {
    console.log('网络连接已断开');
});

// 防止意外刷新（开发时有用）
if (process?.env?.NODE_ENV === 'development') {
    window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        e.returnValue = '';
    });
}
