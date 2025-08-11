// BlogApp 扩展方法 - 页面功能实现
class BlogAppExtensions {
    constructor(app) {
        this.app = app;
    }

    // 打字效果
    startTypingEffect() {
        const textElement = this.app.elements.typingText;
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
        const stats = this.app.blogManager.getStats();
        
        if (this.app.elements.articleCount) {
            this.animateNumber(this.app.elements.articleCount, stats.articleCount);
        }
        
        if (this.app.elements.categoryCount) {
            this.animateNumber(this.app.elements.categoryCount, stats.categoryCount);
        }
        
        if (this.app.elements.totalWords) {
            this.animateNumber(this.app.elements.totalWords, stats.totalWords + 'k');
        }
    }

    // 数字动画
    animateNumber(element, targetValue) {
        const isNumber = typeof targetValue === 'number';
        const target = isNumber ? targetValue : parseInt(targetValue);
        const suffix = isNumber ? '' : targetValue.toString().replace(/\d/g, '');
        
        let current = 0;
        const increment = Math.ceil(target / 30);
        
        const animate = () => {
            current += increment;
            if (current >= target) {
                element.textContent = targetValue;
                return;
            }
            
            element.textContent = current + suffix;
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // 加载最新文章
    loadRecentPosts() {
        const posts = this.app.blogManager.getPosts().slice(0, 3);
        const container = this.app.elements.recentPostsGrid;
        
        if (!container) return;

        container.innerHTML = '';
        
        posts.forEach(post => {
            const postElement = this.createRecentPostCard(post);
            container.appendChild(postElement);
        });
    }

    // 创建最新文章卡片
    createRecentPostCard(post) {
        const card = document.createElement('div');
        card.className = 'recent-post-card';
        card.dataset.articleId = post.id;
        
        card.innerHTML = `
            <div class="post-content">
                <div class="post-category">
                    <i class="fas fa-tag"></i>
                    ${this.getCategoryName(post.category)}
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-meta">
                    <span class="post-date">
                        <i class="fas fa-calendar"></i>
                        ${this.formatDate(post.date)}
                    </span>
                    <span class="post-read-time">
                        <i class="fas fa-clock"></i>
                        ${post.readTime}
                    </span>
                </div>
            </div>
            <div class="post-action">
                <button class="read-more-btn">
                    阅读全文 <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;
        
        return card;
    }

    // 加载分类过滤器
    loadCategoryFilters() {
        const categories = this.app.blogManager.getCategories();
        const container = this.app.elements.categoryFilters;
        
        if (!container) return;

        // 保留"全部"按钮
        const allButton = container.querySelector('[data-category="all"]');
        container.innerHTML = '';
        
        if (allButton) {
            container.appendChild(allButton);
        }

        // 添加分类按钮
        categories.forEach(category => {
            const button = this.createCategoryFilter(category);
            container.appendChild(button);
        });

        // 更新计数
        this.updateCategoryFilterCounts();
    }

    // 创建分类过滤器
    createCategoryFilter(category) {
        const button = document.createElement('button');
        button.className = 'filter-tab';
        button.dataset.category = category;
        
        const categoryInfo = this.getCategoryInfo(category);
        
        button.innerHTML = `
            <i class="${categoryInfo.icon}"></i>
            <span>${categoryInfo.name}</span>
            <span class="filter-count" id="${category}Count">0</span>
        `;
        
        return button;
    }

    // 更新分类过滤器计数
    updateCategoryFilterCounts() {
        const allPosts = this.app.blogManager.getPosts();
        const categories = this.app.blogManager.getCategories();
        
        // 更新全部计数
        const allCountElement = document.getElementById('allCount');
        if (allCountElement) {
            allCountElement.textContent = allPosts.length;
        }
        
        // 更新各分类计数
        categories.forEach(category => {
            const count = this.app.blogManager.getPostsByCategory(category).length;
            const countElement = document.getElementById(`${category}Count`);
            if (countElement) {
                countElement.textContent = count;
            }
        });
    }

    // 加载博客文章列表
    loadBlogPosts() {
        this.app.elements.blogStatusInfo.innerHTML = `
            <span class="status-text">正在加载文章...</span>
            <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;

        // 模拟加载延迟
        setTimeout(() => {
            this.renderBlogPosts();
        }, 500);
    }

    // 渲染博客文章
    renderBlogPosts() {
        let posts = this.app.blogManager.getPostsByCategory(this.app.currentCategory);
        posts = this.app.blogManager.sortPosts(posts, this.app.currentSort);
        
        // 分页
        const paginationResult = this.app.blogManager.paginatePosts(
            posts, 
            this.app.currentPage_pagination, 
            this.app.postsPerPage
        );

        // 更新状态信息
        this.updateBlogStatusInfo(paginationResult);
        
        // 渲染文章
        this.renderBlogGrid(paginationResult.posts);
        
        // 渲染分页器
        this.renderPagination(paginationResult);
    }

    // 更新博客状态信息
    updateBlogStatusInfo(paginationResult) {
        const { currentPage, totalPages, totalPosts } = paginationResult;
        const startIndex = (currentPage - 1) * this.app.postsPerPage + 1;
        const endIndex = Math.min(currentPage * this.app.postsPerPage, totalPosts);
        
        const categoryName = this.app.currentCategory === 'all' ? 
            '全部' : this.getCategoryName(this.app.currentCategory);
        
        this.app.elements.blogStatusInfo.innerHTML = `
            <span class="status-text">
                显示 ${categoryName} 分类中的第 ${startIndex}-${endIndex} 项，共 ${totalPosts} 篇文章
            </span>
        `;
    }

    // 渲染博客网格
    renderBlogGrid(posts) {
        const container = this.app.elements.blogGrid;
        
        if (!posts.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>暂无文章</h3>
                    <p>该分类下暂时没有文章，请尝试其他分类</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        
        posts.forEach(post => {
            const postCard = this.createBlogPostCard(post);
            container.appendChild(postCard);
        });
    }

    // 创建博客文章卡片
    createBlogPostCard(post) {
        const card = document.createElement('article');
        card.className = `blog-card ${this.app.currentView}-view`;
        card.dataset.articleId = post.id;
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-category">
                    <i class="fas fa-tag"></i>
                    ${this.getCategoryName(post.category)}
                </div>
                <div class="card-date">
                    <i class="fas fa-calendar"></i>
                    ${this.formatDate(post.date)}
                </div>
            </div>
            
            <div class="card-content">
                <h2 class="card-title">${post.title}</h2>
                <p class="card-excerpt">${post.excerpt}</p>
                
                <div class="card-tags">
                    ${post.tags.map(tag => `
                        <span class="tag">
                            <i class="fas fa-hashtag"></i>
                            ${tag}
                        </span>
                    `).join('')}
                </div>
            </div>
            
            <div class="card-footer">
                <div class="card-meta">
                    <span class="meta-item">
                        <i class="fas fa-user"></i>
                        ${post.author}
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-clock"></i>
                        ${post.readTime}
                    </span>
                </div>
                
                <button class="read-more-btn">
                    <span>阅读全文</span>
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;
        
        return card;
    }

    // 渲染分页器
    renderPagination(paginationResult) {
        const { currentPage, totalPages, hasNext, hasPrev } = paginationResult;
        const container = this.app.elements.pagination;
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <button class="page-btn prev-btn ${!hasPrev ? 'disabled' : ''}" 
                    data-page="${currentPage - 1}" 
                    ${!hasPrev ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
                <span>上一页</span>
            </button>
            
            <div class="page-numbers">
        `;

        // 生成页码按钮
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            paginationHTML += `<button class="page-num" data-page="1">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-num ${i === currentPage ? 'active' : ''}" 
                        data-page="${i}">${i}</button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
            paginationHTML += `<button class="page-num" data-page="${totalPages}">${totalPages}</button>`;
        }

        paginationHTML += `
            </div>
            
            <button class="page-btn next-btn ${!hasNext ? 'disabled' : ''}" 
                    data-page="${currentPage + 1}" 
                    ${!hasNext ? 'disabled' : ''}>
                <span>下一页</span>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        container.innerHTML = paginationHTML;

        // 绑定分页事件
        container.addEventListener('click', (e) => {
            const pageBtn = e.target.closest('[data-page]');
            if (pageBtn && !pageBtn.disabled) {
                const page = parseInt(pageBtn.dataset.page);
                this.app.currentPage_pagination = page;
                this.renderBlogPosts();
                this.app.scrollToTop();
            }
        });
    }

    // 工具方法
    getCategoryInfo(category) {
        const categoryMap = {
            frontend: { name: '前端开发', icon: 'fab fa-js' },
            backend: { name: '后端开发', icon: 'fas fa-server' },
            tools: { name: '开发工具', icon: 'fas fa-tools' },
            thoughts: { name: '技术思考', icon: 'fas fa-lightbulb' },
            mobile: { name: '移动开发', icon: 'fas fa-mobile-alt' },
            database: { name: '数据库', icon: 'fas fa-database' },
            devops: { name: 'DevOps', icon: 'fas fa-cogs' }
        };
        
        return categoryMap[category] || { name: category, icon: 'fas fa-folder' };
    }

    getCategoryName(category) {
        return this.getCategoryInfo(category).name;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('zh-CN', options);
    }
}

// 扩展 BlogApp 类
BlogApp.prototype.startTypingEffect = function() {
    if (!this.extensions) {
        this.extensions = new BlogAppExtensions(this);
    }
    this.extensions.startTypingEffect();
};

BlogApp.prototype.updateStats = function() {
    if (!this.extensions) {
        this.extensions = new BlogAppExtensions(this);
    }
    this.extensions.updateStats();
};

BlogApp.prototype.loadRecentPosts = function() {
    if (!this.extensions) {
        this.extensions = new BlogAppExtensions(this);
    }
    this.extensions.loadRecentPosts();
};

BlogApp.prototype.loadCategoryFilters = function() {
    if (!this.extensions) {
        this.extensions = new BlogAppExtensions(this);
    }
    this.extensions.loadCategoryFilters();
};

BlogApp.prototype.loadBlogPosts = function() {
    if (!this.extensions) {
        this.extensions = new BlogAppExtensions(this);
    }
    this.extensions.loadBlogPosts();
};

BlogApp.prototype.renderBlogPosts = function() {
    if (!this.extensions) {
        this.extensions = new BlogAppExtensions(this);
    }
    this.extensions.renderBlogPosts();
};
