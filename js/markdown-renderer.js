/**
 * Markdown 渲染模块
 * 自定义 marked 配置以支持图片、视频和其他媒体
 */

const MarkdownRenderer = {
    /**
     * 配置 marked 以支持自定义渲染规则
     */
    configure() {
        const renderer = new marked.Renderer();
        
        // 自定义图片渲染
        renderer.image = (token) => {
            return this.renderImage(token);
        };
        
        // 自定义链接渲染
        renderer.link = (token) => {
            return this.renderLink(token);
        };
        
        // 自定义代码块渲染
        renderer.code = (token) => {
            return this.renderCode(token);
        };
        
        // 自定义表格行渲染
        renderer.tablerow = (token) => {
            return this.renderTableRow(token);
        };
        
        marked.setOptions({
            renderer: renderer,
            breaks: true,
            gfm: true,
            pedantic: false,
            silent: false,
            smartypants: true
        });
    },
    
    /**
     * 渲染图片
     * @param {object} token - marked 图片 token
     * @returns {string} HTML
     */
    renderImage(token) {
        let src = token.href;
        
        // 处理相对路径
        if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('/')) {
            src = PathConfig.getAssetPath(`posts/${src}`);
        }
        
        const alt = token.text || 'Image';
        const title = token.title ? ` title="${token.title}"` : '';
        
        return `<img src="${src}" alt="${alt}"${title} />`;
    },
    
    /**
     * 渲染链接
     * @param {object} token - marked 链接 token
     * @returns {string} HTML
     */
    renderLink(token) {
        let href = token.href;
        
        // 处理相对链接
        if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('#')) {
            href = PathConfig.getAssetPath(href);
        }
        
        const title = token.title ? ` title="${token.title}"` : '';
        const target = token.target === '_blank' ? ' target="_blank" rel="noopener"' : '';
        
        return `<a href="${href}"${title}${target}>${token.text}</a>`;
    },
    
    /**
     * 渲染代码块
     * @param {object} token - marked 代码块 token
     * @returns {string} HTML
     */
    renderCode(token) {
        // 兼容不同版本的 marked.js
        let code = '';
        if (token.text) {
            code = token.text;
        } else if (typeof token === 'string') {
            code = token;
        } else {
            console.warn('警告: renderCode 接收到无效的 token', token);
            code = '';
        }
        
        // 防止 undefined 导致的错误
        if (code && typeof code === 'string') {
            code = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
        
        const lang = (token.lang || 'plaintext').toString();
        return `<pre><code class="language-${lang}">${code}</code></pre>`;
    },
    
    /**
     * 渲染表格行
     * @param {object} token - marked 表格行 token
     * @returns {string} HTML
     */
    renderTableRow(token) {
        const header = token.header;
        const tag = header ? 'th' : 'td';
        const align = token.align ? ` style="text-align:${token.align}"` : '';
        
        let row = '\n<tr>\n';
        for (let cell of token.text) {
            row += `<${tag}${align}>${cell}</${tag}>\n`;
        }
        row += '</tr>\n';
        
        return row;
    },
    
    /**
     * 解析 Markdown 内容
     * @param {string} content - Markdown 内容
     * @returns {string} HTML
     */
    parse(content) {
        // 防御性检查
        if (!content || typeof content !== 'string') {
            console.error('错误: 无效的 Markdown 内容', content);
            return '<p>文章内容为空或无效</p>';
        }
        
        try {
            // 预处理视频语法
            content = this.preprocessVideos(content);
            
            // 防止空白内容
            if (!content.trim()) {
                return '<p>文章内容为空</p>';
            }
            
            return marked.parse(content);
        } catch (error) {
            console.error('Markdown 解析错误:', error);
            return `<p>文章渲染失败: ${error.message}</p>`;
        }
    },
    
    /**
     * 预处理视频语法
     * 支持的语法：
     * - ![video](url.mp4)
     * - @[video](url.mp4)
     * - @[youtube](videoId)
     * - @[vimeo](videoId)
     * - @[bilibili](videoId)
     * 
     * @param {string} content - Markdown 内容
     * @returns {string} 处理后的 Markdown 内容
     */
    preprocessVideos(content) {
        // 防御性检查
        if (!content || typeof content !== 'string') {
            console.warn('警告: preprocessVideos 接收到无效的内容', content);
            return '';
        }
        // 处理本地视频: ![video](file.mp4) 或 @[video](file.mp4)
        content = content.replace(/(?:!\[video\]|\@\[video\])\(([^)]+)\)/g, (match, url) => {
            return this.createVideoHtml(url, 'local');
        });
        
        // 处理 YouTube: @[youtube](videoId)
        content = content.replace(/\@\[youtube\]\(([^)]+)\)/g, (match, videoId) => {
            return this.createVideoHtml(videoId, 'youtube');
        });
        
        // 处理 Vimeo: @[vimeo](videoId)
        content = content.replace(/\@\[vimeo\]\(([^)]+)\)/g, (match, videoId) => {
            return this.createVideoHtml(videoId, 'vimeo');
        });
        
        // 处理 Bilibili: @[bilibili](videoId)
        content = content.replace(/\@\[bilibili\]\(([^)]+)\)/g, (match, videoId) => {
            return this.createVideoHtml(videoId, 'bilibili');
        });
        
        return content;
    },
    
    /**
     * 生成视频 HTML
     * @param {string} src - 视频源或 ID
     * @param {string} type - 视频类型 (local, youtube, vimeo, bilibili)
     * @returns {string} HTML
     */
    createVideoHtml(src, type) {
        switch (type) {
            case 'youtube':
                return this.createYouTubeEmbed(src);
            case 'vimeo':
                return this.createVimeoEmbed(src);
            case 'bilibili':
                return this.createBilibiliEmbed(src);
            case 'local':
            default:
                return this.createLocalVideo(src);
        }
    },
    
    /**
     * 创建本地视频 HTML
     * @param {string} url - 视频 URL
     * @returns {string} HTML
     */
    createLocalVideo(url) {
        // 防御性检查
        if (!url || typeof url !== 'string') {
            console.warn('警告: 无效的视频 URL', url);
            return '<p>视频 URL 无效</p>';
        }
        
        // 处理相对路径
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
            try {
                url = PathConfig.getAssetPath(`posts/${url}`);
            } catch (error) {
                console.error('路径处理错误:', error);
            }
        }
        
        let format = 'mp4';
        try {
            if (typeof MediaHandler !== 'undefined' && MediaHandler.getVideoFormat) {
                format = MediaHandler.getVideoFormat(url);
            } else {
                // 回退方案：自己检测格式
                if (url.endsWith('.webm')) format = 'webm';
                else if (url.endsWith('.ogg')) format = 'ogg';
                else format = 'mp4';
            }
        } catch (error) {
            console.warn('视频格式检测失败，使用默认 mp4:', error);
            format = 'mp4';
        }
        
        const mimeType = (APP_CONFIG && APP_CONFIG.videoFormats && APP_CONFIG.videoFormats[format]) || 'video/mp4';
        
        return `
            <div style="margin: 1.5rem 0; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-md);">
                <video 
                    width="100%" 
                    height="auto" 
                    style="display: block; max-width: 100%; height: auto; border-radius: var(--radius);"
                    controls
                    preload="metadata"
                >
                    <source src="${url}" type="${mimeType}">
                    <p>您的浏览器不支持 HTML5 video 标签。<a href="${url}">点击下载视频</a></p>
                </video>
            </div>
        `;
    },
    
    /**
     * 创建 YouTube 嵌入
     * @param {string} videoId - YouTube 视频 ID
     * @returns {string} HTML
     */
    createYouTubeEmbed(videoId) {
        return `
            <div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0; border-radius: var(--radius);">
                <iframe 
                    data-video-type="youtube"
                    data-video-id="${videoId}"
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/${videoId}?rel=0" 
                    title="YouTube video" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
    },
    
    /**
     * 创建 Vimeo 嵌入
     * @param {string} videoId - Vimeo 视频 ID
     * @returns {string} HTML
     */
    createVimeoEmbed(videoId) {
        return `
            <div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0; border-radius: var(--radius);">
                <iframe 
                    data-video-type="vimeo"
                    data-video-id="${videoId}"
                    width="100%" 
                    height="100%" 
                    src="https://player.vimeo.com/video/${videoId}" 
                    title="Vimeo video" 
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
    },
    
    /**
     * 创建 B 站嵌入
     * @param {string} videoId - B 站视频 ID
     * @returns {string} HTML
     */
    createBilibiliEmbed(videoId) {
        return `
            <div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0; border-radius: var(--radius);">
                <iframe 
                    data-video-type="bilibili"
                    data-video-id="${videoId}"
                    width="100%" 
                    height="100%" 
                    src="https://player.bilibili.com/player.html?aid=${videoId}&bvid=&cid=&p=1" 
                    title="Bilibili video" 
                    allow="autoplay; fullscreen" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
    }
};

// 导出 MarkdownRenderer
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MarkdownRenderer };
}

// 暴露到全局作用域（浏览器环境）
if (typeof window !== 'undefined') {
    window.MarkdownRenderer = MarkdownRenderer;
    console.log('✓ Markdown 渲染模块已加载到全局作用域');
}
