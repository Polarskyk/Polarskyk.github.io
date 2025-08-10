<<<<<<< Updated upstream
=======
// ==========================================================================
// 个人博客 JavaScript 功能
// ==========================================================================

class PersonalBlog {
    constructor() {
        this.blogManager = null;
        this.posts = [];
        this.filteredPosts = [];
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.currentCategory = 'all';
        this.searchQuery = '';
        
        this.init();
    }

    async init() {
        this.loadTheme();
        this.setupNavigation();
        this.setupThemeToggle();
        this.setupBackToTop();
        this.setupSearch();
        this.setupBlogFilters();
        this.setupTypingEffect();
        this.setupScrollAnimations();
        this.setupContactForm();
        this.setupModalHandlers();
        this.animateStats();
        
        // 初始化博客管理器
        await this.initBlogManager();
    }

    async initBlogManager() {
        if (typeof BlogManager !== 'undefined') {
            this.blogManager = new BlogManager();
            await this.blogManager.init();
            this.posts = this.blogManager.getAllPosts();
            this.filteredPosts = [...this.posts];
            this.renderBlogPosts();
        } else {
            console.warn('BlogManager not loaded, using fallback data');
            this.loadFallbackPosts();
        }
    }

    // ==========================================================================
    // 主题切换功能
    // ==========================================================================

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                this.updateThemeIcon(newTheme);
            });
        }
    }

    updateThemeIcon(theme) {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    // ==========================================================================
    // 导航功能
    // ==========================================================================

    setupNavigation() {
        // 移动端菜单切换
        const mobileToggle = document.getElementById('mobileToggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                mobileToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // 平滑滚动
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const headerOffset = 70;
                    const elementPosition = target.offsetTop;
                    const offsetPosition = elementPosition - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // 导航栏滚动效果
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            const scrolled = window.pageYOffset;
            
            if (navbar) {
                if (scrolled > 100) {
                    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                    navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
                } else {
                    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                    navbar.style.boxShadow = 'none';
                }
            }
        });
    }

    // ==========================================================================
    // 回到顶部功能
    // ==========================================================================

    setupBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ==========================================================================
    // 搜索功能
    // ==========================================================================

    setupSearch() {
        const searchBtn = document.getElementById('searchBtn');
        const searchModal = document.getElementById('searchModal');
        const searchClose = document.getElementById('searchClose');
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');

        // 打开搜索模态框
        searchBtn.addEventListener('click', () => {
            searchModal.classList.add('active');
            searchInput.focus();
        });

        // 关闭搜索模态框
        searchClose.addEventListener('click', () => {
            searchModal.classList.remove('active');
        });

        // 点击背景关闭
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                searchModal.classList.remove('active');
            }
        });

        // 搜索输入处理
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            this.performSearch(query, searchResults);
        });

        // ESC 关闭搜索
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchModal.classList.remove('active');
            }
        });
    }

    performSearch(query, resultsContainer) {
        if (query.length < 2) {
            resultsContainer.innerHTML = '<div class="search-hint">输入至少2个字符开始搜索</div>';
            return;
        }

        let results = [];
        if (this.blogManager) {
            results = this.blogManager.searchPosts(query);
        } else {
            results = this.posts.filter(post => 
                post.title.toLowerCase().includes(query.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
                (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
            );
        }

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="search-hint">没有找到相关文章</div>';
            return;
        }

        const resultsHTML = results.map(post => `
            <div class="search-result-item" data-post-id="${post.id}">
                <h4>${post.title}</h4>
                <p>${post.excerpt}</p>
                <small>${post.date} • ${this.getCategoryName(post.category)}</small>
            </div>
        `).join('');

        resultsContainer.innerHTML = resultsHTML;

        // 添加点击事件
        resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const postId = item.getAttribute('data-post-id');
                this.openArticle(postId);
                document.getElementById('searchModal').classList.remove('active');
            });
        });
    }

    // ==========================================================================
    // 博客过滤功能
    // ==========================================================================

    setupBlogFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // 更新按钮状态
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 执行过滤
                const category = btn.getAttribute('data-category');
                this.filterPosts(category);
            });
        });

        // 加载更多按钮
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMorePosts();
            });
        }
    }

    filterPosts(category) {
        this.currentCategory = category;
        this.currentPage = 1;
        
        if (this.blogManager) {
            this.filteredPosts = this.blogManager.getPostsByCategory(category);
        } else {
            if (category === 'all') {
                this.filteredPosts = [...this.posts];
            } else {
                this.filteredPosts = this.posts.filter(post => post.category === category);
            }
        }
        
        this.renderBlogPosts();
    }

    // ==========================================================================
    // 打字机效果
    // ==========================================================================

    setupTypingEffect() {
        const typingText = document.querySelector('.typing-text');
        if (!typingText) return;
        
        const texts = ['全栈开发者', '前端工程师', '技术博主', '开源贡献者', '代码艺术家'];
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        const typeEffect = () => {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typingText.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingText.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }
            
            let typeSpeed = isDeleting ? 50 : 100;
            
            if (!isDeleting && charIndex === currentText.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typeSpeed = 500;
            }
            
            setTimeout(typeEffect, typeSpeed);
        };
        
        typeEffect();
    }

    // ==========================================================================
    // 滚动动画
    // ==========================================================================

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);
        
        // 观察需要动画的元素
        document.querySelectorAll('.blog-card, .contact-item, .skill-category').forEach(element => {
            observer.observe(element);
        });
    }

    // ==========================================================================
    // 统计数字动画
    // ==========================================================================

    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumber = entry.target;
                    const finalValue = parseInt(statNumber.getAttribute('data-count'));
                    this.animateCounter(statNumber, finalValue);
                    observer.unobserve(statNumber);
                }
            });
        }, observerOptions);
        
        statNumbers.forEach(stat => observer.observe(stat));
    }

    animateCounter(element, target) {
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 40);
    }

    // ==========================================================================
    // 联系表单
    // ==========================================================================

    setupContactForm() {
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const formData = new FormData(contactForm);
                const data = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    subject: formData.get('subject'),
                    message: formData.get('message')
                };
                
                // 模拟提交
                this.showNotification('消息发送成功！我会尽快回复您。', 'success');
                contactForm.reset();
            });
        }
    }

    // ==========================================================================
    // 文章模态框
    // ==========================================================================

    setupModalHandlers() {
        const articleModal = document.getElementById('articleModal');
        const modalClose = document.getElementById('modalClose');
        const modalBackdrop = document.getElementById('modalBackdrop');

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                articleModal.classList.remove('active');
            });
        }

        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', () => {
                articleModal.classList.remove('active');
            });
        }

        // ESC 关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                articleModal.classList.remove('active');
            }
        });
    }

    // ==========================================================================
    // 博客文章管理
    // ==========================================================================

    loadBlogPosts() {
        // 模拟博客文章数据（实际使用时可以从 Markdown 文件或 API 加载）
        this.posts = [
            {
                id: '1',
                title: 'JavaScript ES2024 新特性详解',
                category: 'frontend',
                date: '2025-01-15',
                author: 'Polarsky',
                readTime: '8分钟',
                excerpt: '深入了解 JavaScript ES2024 版本中引入的新特性，包括新的数组方法、装饰器语法和模块改进等...',
                content: `# JavaScript ES2024 新特性详解

JavaScript 持续演进，ES2024 版本带来了许多令人兴奋的新特性。本文将深入探讨这些新功能如何改善我们的开发体验。

## 新的数组方法

ES2024 引入了几个新的数组方法：

\`\`\`javascript
// Array.prototype.toReversed()
const original = [1, 2, 3, 4, 5];
const reversed = original.toReversed(); // [5, 4, 3, 2, 1]
console.log(original); // [1, 2, 3, 4, 5] - 原数组不变

// Array.prototype.toSorted()
const numbers = [3, 1, 4, 1, 5];
const sorted = numbers.toSorted(); // [1, 1, 3, 4, 5]
console.log(numbers); // [3, 1, 4, 1, 5] - 原数组不变
\`\`\`

这些方法的优势在于它们不会修改原数组，而是返回新的数组实例。

## 装饰器语法

装饰器终于成为了标准的一部分：

\`\`\`javascript
class ApiService {
    @cache
    @retry(3)
    async fetchData(url) {
        const response = await fetch(url);
        return response.json();
    }
}
\`\`\`

## 总结

ES2024 的这些新特性将显著提升 JavaScript 的开发体验。建议开发者逐步学习和应用这些新功能。`,
                tags: ['JavaScript', 'ES2024', '前端开发']
            },
            {
                id: '2',
                title: 'React 18 并发特性实践指南',
                category: 'frontend',
                date: '2025-01-12',
                author: 'Polarsky',
                readTime: '10分钟',
                excerpt: 'React 18 引入的并发特性为用户体验带来了革命性的改进。本文将通过实际案例展示如何使用这些新特性...',
                content: `# React 18 并发特性实践指南

React 18 的并发特性是框架发展的重要里程碑。让我们通过实际例子来了解这些新功能。

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

## 并发渲染

React 18 的并发渲染允许 React 暂停、恢复或放弃渲染工作：

\`\`\`jsx
import { startTransition } from 'react';

function SearchResults() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = (newQuery) => {
        setQuery(newQuery);
        startTransition(() => {
            setResults(searchAPI(newQuery));
        });
    };

    return (
        <div>
            <input onChange={(e) => handleSearch(e.target.value)} />
            <ResultsList results={results} />
        </div>
    );
}
\`\`\`

这些特性让应用更加流畅和响应迅速。`,
                tags: ['React', 'React 18', '并发', '前端']
            },
            {
                id: '3',
                title: 'Node.js 性能优化最佳实践',
                category: 'backend',
                date: '2025-01-10',
                author: 'Polarsky',
                readTime: '12分钟',
                excerpt: '深入探讨 Node.js 应用的性能优化策略，从内存管理到异步编程，全面提升应用性能...',
                content: `# Node.js 性能优化最佳实践

Node.js 应用的性能优化是一个系统性工程。本文将分享一些实用的优化策略。

## 内存管理

### 避免内存泄漏

\`\`\`javascript
// 错误示例：全局变量导致内存泄漏
let globalData = [];

function processData(data) {
    globalData.push(data); // 这会导致内存泄漏
}

// 正确示例：及时清理
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
\`\`\`

## 异步编程优化

使用 async/await 替代回调：

\`\`\`javascript
// 使用 Promise.all 并行处理
async function fetchUserData(userId) {
    const [profile, posts, friends] = await Promise.all([
        fetchUserProfile(userId),
        fetchUserPosts(userId),
        fetchUserFriends(userId)
    ]);
    
    return { profile, posts, friends };
}
\`\`\`

## 数据库优化

- 使用连接池
- 实施查询优化
- 添加适当的索引

这些优化措施可以显著提升应用性能。`,
                tags: ['Node.js', '性能优化', '后端开发']
            },
            {
                id: '4',
                title: 'Git 工作流最佳实践',
                category: 'tools',
                date: '2025-01-08',
                author: 'Polarsky',
                readTime: '6分钟',
                excerpt: '分享在团队协作中使用 Git 的最佳实践，包括分支策略、提交规范和代码审查流程...',
                content: `# Git 工作流最佳实践

良好的 Git 工作流是团队协作成功的关键。本文分享一些实用的 Git 最佳实践。

## 分支策略

### Git Flow 模型

\`\`\`bash
# 创建功能分支
git checkout -b feature/user-authentication

# 开发完成后合并到 develop
git checkout develop
git merge feature/user-authentication

# 发布时创建 release 分支
git checkout -b release/v1.0.0
\`\`\`

## 提交规范

使用约定式提交：

\`\`\`bash
# 功能提交
git commit -m "feat: 添加用户认证功能"

# 修复提交
git commit -m "fix: 修复登录页面样式问题"

# 文档提交
git commit -m "docs: 更新 API 文档"
\`\`\`

## 代码审查

建立严格的 PR 审查流程：

1. 功能完整性检查
2. 代码质量评估
3. 测试覆盖率验证
4. 安全性审查

这些实践有助于维护代码质量和团队协作效率。`,
                tags: ['Git', '版本控制', '团队协作']
            },
            {
                id: '5',
                title: '我的开发者成长之路',
                category: 'life',
                date: '2025-01-05',
                author: 'Polarsky',
                readTime: '5分钟',
                excerpt: '回顾我从编程小白到全栈开发者的成长历程，分享一些学习心得和人生感悟...',
                content: `# 我的开发者成长之路

回首编程生涯，从懵懂新手到现在的全栈开发者，这一路充满了挑战和收获。

## 初学阶段

刚开始学编程时，每一个语法错误都让我抓狂。记得第一次写出 "Hello, World!" 时的激动心情。

## 技能积累

随着项目经验的积累，逐渐掌握了：

- 前端技术栈（HTML/CSS/JavaScript）
- 后端开发（Node.js/Python）
- 数据库设计（MySQL/MongoDB）
- 云服务部署（AWS/Docker）

## 持续学习

技术更新很快，保持学习的习惯很重要：

1. 关注技术社区动态
2. 参与开源项目
3. 写技术博客总结
4. 与同行交流分享

## 感悟

编程不仅是技术，更是一种思维方式。保持好奇心，持续学习，享受创造的乐趣。`,
                tags: ['成长', '学习', '感悟']
            },
            {
                id: '6',
                title: 'TypeScript 高级类型系统深度解析',
                category: 'frontend',
                date: '2025-01-03',
                author: 'Polarsky',
                readTime: '15分钟',
                excerpt: '深入探讨 TypeScript 的高级类型系统，包括泛型、条件类型、映射类型等复杂概念...',
                content: `# TypeScript 高级类型系统深度解析

TypeScript 的类型系统是其最强大的特性之一。本文将深入探讨一些高级概念。

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

type Required<T> = {
    [P in keyof T]-?: T[P];
};

interface User {
    id: number;
    name: string;
    email?: string;
}

type PartialUser = Partial<User>; // 所有属性可选
type RequiredUser = Required<User>; // 所有属性必需
\`\`\`

## 模板字面量类型

TypeScript 4.1 引入的强大特性：

\`\`\`typescript
type EventName<T extends string> = \`on\${Capitalize<T>}\`;

type ButtonEvents = EventName<'click' | 'hover'>; 
// 'onClick' | 'onHover'
\`\`\`

这些高级特性让 TypeScript 的类型系统更加强大和灵活。`,
                tags: ['TypeScript', '类型系统', '高级特性']
            }
        ];

        this.filteredPosts = [...this.posts];
        this.renderBlogPosts();
    }

    renderBlogPosts() {
        const blogGrid = document.getElementById('blogGrid');
        const postsToShow = this.filteredPosts.slice(0, this.currentPage * this.postsPerPage);
        
        if (postsToShow.length === 0) {
            blogGrid.innerHTML = '<div class="blog-loading">暂无文章</div>';
            return;
        }

        const postsHTML = postsToShow.map(post => `
            <article class="blog-card" data-post-id="${post.id}">
                <div class="blog-card-image">
                    <i class="fas fa-${this.getCategoryIcon(post.category)}"></i>
                </div>
                <div class="blog-card-content">
                    <div class="blog-card-meta">
                        <span class="blog-card-category">${this.getCategoryName(post.category)}</span>
                        <span>${post.date}</span>
                        <span>${post.readTime}</span>
                    </div>
                    <h3 class="blog-card-title">${post.title}</h3>
                    <p class="blog-card-excerpt">${post.excerpt}</p>
                    <div class="blog-card-footer">
                        <div class="blog-card-author">
                            <i class="fas fa-user"></i>
                            <span>${post.author}</span>
                        </div>
                        <div class="blog-card-read-time">${post.readTime}</div>
                    </div>
                </div>
            </article>
        `).join('');

        blogGrid.innerHTML = postsHTML;

        // 添加点击事件
        blogGrid.querySelectorAll('.blog-card').forEach(card => {
            card.addEventListener('click', () => {
                const postId = card.getAttribute('data-post-id');
                this.openArticle(postId);
            });
        });

        // 更新加载更多按钮
        this.updateLoadMoreButton();
    }

    getCategoryIcon(category) {
        const icons = {
            frontend: 'code',
            backend: 'server',
            tools: 'tools',
            life: 'heart'
        };
        return icons[category] || 'file-alt';
    }

    getCategoryName(category) {
        const names = {
            frontend: '前端',
            backend: '后端',
            tools: '工具',
            life: '生活'
        };
        return names[category] || '其他';
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        const totalShown = this.currentPage * this.postsPerPage;
        
        if (loadMoreBtn) {
            if (totalShown >= this.filteredPosts.length) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'inline-flex';
            }
        }
    }

    loadMorePosts() {
        this.currentPage++;
        this.renderBlogPosts();
    }

    async openArticle(postId) {
        try {
            let post;
            if (this.blogManager) {
                post = await this.blogManager.getPostById(postId);
            } else {
                post = this.posts.find(p => p.id === postId);
            }

            if (!post) {
                this.showNotification('文章未找到', 'error');
                return;
            }

            const articleModal = document.getElementById('articleModal');
            const articleContent = document.getElementById('articleContent');

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
                        <span class="article-date">${post.date}</span>
                        <span class="article-category">${this.getCategoryName(post.category)}</span>
                        <span class="article-read-time">${post.readTime}</span>
                    </div>
                    <div class="article-excerpt">
                        <p>${post.excerpt}</p>
                        <p><em>完整文章内容正在加载中...</em></p>
                    </div>
                `;
            }

            articleContent.innerHTML = htmlContent;

            // 高亮代码
            if (typeof hljs !== 'undefined') {
                articleContent.querySelectorAll('pre code').forEach(block => {
                    hljs.highlightElement(block);
                });
            }

            articleModal.classList.add('active');
        } catch (error) {
            console.error('Failed to load article:', error);
            this.showNotification('文章加载失败，请稍后再试', 'error');
        }
    }

    // ==========================================================================
    // 通知系统
    // ==========================================================================

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--primary-color)'};
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// ==========================================================================
// 添加必要的CSS动画
// ==========================================================================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .search-result-item {
        padding: 15px;
        border-bottom: 1px solid var(--border-color);
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .search-result-item:hover {
        background-color: var(--bg-secondary);
    }

    .search-result-item h4 {
        margin: 0 0 5px 0;
        color: var(--text-primary);
    }

    .search-result-item p {
        margin: 0 0 5px 0;
        color: var(--text-secondary);
        font-size: 14px;
    }

    .search-result-item small {
        color: var(--text-muted);
        font-size: 12px;
    }

    .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }

    .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }

    .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }

    @media (max-width: 768px) {
        .nav-menu.active {
            display: flex;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--bg-card);
            box-shadow: var(--shadow-lg);
            padding: 20px;
        }

        .nav-menu.active .nav-list {
            flex-direction: column;
            width: 100%;
        }
    }
`;
document.head.appendChild(style);

// ==========================================================================
// 初始化应用
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    new PersonalBlog();
});
>>>>>>> Stashed changes
