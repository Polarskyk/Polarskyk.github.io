/**
 * 配置管理模块
 * 统一管理路径配置、GitHub 设置和应用配置
 */

// GitHub 配置
const GITHUB_CONFIG = {
    owner: 'Polarskyk',
    repo: 'Polarskyk.github.io',
    branch: 'main',
    postsPath: 'posts'
};

// 应用配置
const APP_CONFIG = {
    // 文章刷新间隔（毫秒）
    refreshInterval: 30000, // 本地环境 30 秒
    refreshIntervalOnline: 300000, // 线上环境 5 分钟
    
    // 搜索去抖动延迟
    searchDebounceDelay: 300,
    
    // 支持的视频格式
    videoFormats: {
        mp4: 'video/mp4',
        webm: 'video/webm',
        ogg: 'video/ogg'
    },
    
    // 支持的视频平台
    videoPlatforms: {
        youtube: 'youtube',
        vimeo: 'vimeo',
        bilibili: 'bilibili'
    },
    
    // 图片优化配置
    imageConfig: {
        enableLazyLoad: true,
        enableClickZoom: true,
        enableErrorHandling: true
    },
    
    // 视频优化配置
    videoConfig: {
        enableLazyLoad: true,
        autoplay: false,
        controls: true,
        muted: false,
        loop: false,
        defaultWidth: '100%',
        defaultHeight: 'auto'
    }
};

/**
 * 路径配置管理对象
 * 支持不同部署方式（GitHub Pages 账户级、项目级、本地等）
 */
const PathConfig = {
    // 检测是否是 GitHub Pages 环境
    isGitHubPages() {
        return window.location.hostname.includes('github.io');
    },
    
    // 检测是否是账户级仓库 (username.github.io)
    isUserRepo() {
        return window.location.hostname.match(/^[\w-]+\.github\.io$/) !== null;
    },
    
    // 获取仓库名称
    getRepoName() {
        const pathname = window.location.pathname;
        const pathParts = pathname.split('/').filter(p => p);
        return pathParts.length > 0 ? pathParts[0] : '';
    },
    
    // 获取基础路径前缀
    getBasePath() {
        if (!this.isGitHubPages()) {
            return './';
        }
        if (this.isUserRepo()) {
            return './';
        }
        const repoName = this.getRepoName();
        return repoName ? `./${repoName}/` : './';
    },
    
    // 获取 posts 文件夹路径
    getPostsPath(filename = '') {
        const basePath = this.getBasePath();
        return filename ? `${basePath}posts/${filename}` : `${basePath}posts/`;
    },
    
    // 获取资源路径（用于图片、视频等）
    getAssetPath(filepath) {
        const basePath = this.getBasePath();
        return filepath.startsWith('/') || filepath.startsWith('http') 
            ? filepath 
            : `${basePath}${filepath}`;
    },
    
    // 获取 HTML 文件路径
    getHtmlPath(filename) {
        const basePath = this.getBasePath();
        return `${basePath}${filename}`;
    },
    
    // 获取 JavaScript 文件路径
    getJsPath(filename) {
        const basePath = this.getBasePath();
        return `${basePath}js/${filename}`;
    },
    
    // 获取样式文件路径
    getCssPath(filename) {
        const basePath = this.getBasePath();
        return filename.startsWith('http') ? filename : `${basePath}${filename}`;
    }
};

// 导出配置对象（用于 ES6 模块）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GITHUB_CONFIG, APP_CONFIG, PathConfig };
}

// 暴露到全局作用域（浏览器环境）
if (typeof window !== 'undefined') {
    window.GITHUB_CONFIG = GITHUB_CONFIG;
    window.APP_CONFIG = APP_CONFIG;
    window.PathConfig = PathConfig;
    console.log('✓ 配置模块已加载到全局作用域');
}
