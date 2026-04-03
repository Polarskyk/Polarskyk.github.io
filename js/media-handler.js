/**
 * 媒体处理模块
 * 处理文章中的图片和视频（本地、外部、CDN、平台）
 */

const MediaHandler = {
    /**
     * 处理文章中的所有图片
     * @param {Element} container - 文章容器
     */
    processImages(container) {
        if (!container) return;
        
        const images = container.querySelectorAll('img');
        images.forEach((img, index) => {
            // 添加加载失败处理
            img.onerror = () => {
                console.warn(`图片加载失败: ${img.src}`);
                img.style.backgroundColor = '#f0f0f0';
                img.style.minHeight = '200px';
                img.title = '图片加载失败';
            };
            
            // 添加懒加载
            if (APP_CONFIG.imageConfig.enableLazyLoad) {
                img.loading = 'lazy';
            }
            
            // 添加点击放大功能
            if (APP_CONFIG.imageConfig.enableClickZoom) {
                img.style.cursor = 'pointer';
                img.addEventListener('click', function() {
                    MediaHandler.openImageViewer(this.src, this.alt);
                });
            }
        });
    },
    
    /**
     * 处理文章中的所有视频
     * @param {Element} container - 文章容器
     */
    processVideos(container) {
        if (!container) return;
        
        const videos = container.querySelectorAll('video');
        videos.forEach((video) => {
            // 配置视频属性
            video.controls = APP_CONFIG.videoConfig.controls;
            video.preload = 'metadata';
            
            if (APP_CONFIG.videoConfig.autoplay) {
                video.autoplay = true;
            }
            if (APP_CONFIG.videoConfig.muted) {
                video.muted = true;
            }
            if (APP_CONFIG.videoConfig.loop) {
                video.loop = true;
            }
            
            // 添加视频加载错误处理
            video.addEventListener('error', () => {
                console.warn('视频加载失败:', video.src);
                this.showVideoError(video);
            });
        });
        
        // 处理嵌入式视频（iframe）
        this.processEmbeddedVideos(container);
    },
    
    /**
     * 处理嵌入式视频（iframe）
     * @param {Element} container - 文章容器
     */
    processEmbeddedVideos(container) {
        const iframes = container.querySelectorAll('iframe[data-video-type]');
        iframes.forEach((iframe) => {
            const videoType = iframe.getAttribute('data-video-type');
            const videoId = iframe.getAttribute('data-video-id');
            
            // 设置响应式容器
            const wrapper = document.createElement('div');
            wrapper.style.cssText = `
                position: relative;
                width: 100%;
                padding-bottom: 56.25%;
                height: 0;
                overflow: hidden;
                border-radius: var(--radius);
                margin: 1.5rem 0;
            `;
            
            iframe.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
                border-radius: var(--radius);
            `;
            
            iframe.parentNode.insertBefore(wrapper, iframe);
            wrapper.appendChild(iframe);
        });
    },
    
    /**
     * 打开图片查看器（全屏显示）
     * @param {string} src - 图片 URL
     * @param {string} alt - 图片描述
     */
    openImageViewer(src, alt) {
        const viewer = document.createElement('div');
        viewer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: pointer;
        `;
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border-radius: 8px;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
        `;
        
        const close = () => {
            viewer.remove();
        };
        
        closeBtn.addEventListener('click', close);
        viewer.addEventListener('click', (e) => {
            if (e.target === viewer) close();
        });
        
        viewer.appendChild(img);
        viewer.appendChild(closeBtn);
        document.body.appendChild(viewer);
    },
    
    /**
     * 显示视频错误信息
     * @param {HTMLVideoElement} video - 视频元素
     */
    showVideoError(video) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            background: #f0f0f0;
            border: 1px solid #ddd;
            border-radius: var(--radius);
            padding: 2rem;
            text-align: center;
            color: var(--text-secondary);
        `;
        errorDiv.innerHTML = `
            <p>😕 视频加载失败</p>
            <small>无法加载视频，请检查文件是否存在或网络连接</small>
        `;
        video.parentNode.replaceChild(errorDiv, video);
    },
    
    /**
     * 检测视频类型（本地、YouTube、Vimeo 等）
     * @param {string} url - 视频 URL
     * @returns {object} 视频信息
     */
    detectVideoType(url) {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
            return {
                type: 'youtube',
                id: match ? match[1] : null,
                url: url
            };
        } else if (url.includes('vimeo.com')) {
            const match = url.match(/vimeo\.com\/(\d+)/);
            return {
                type: 'vimeo',
                id: match ? match[1] : null,
                url: url
            };
        } else if (url.includes('bilibili.com')) {
            return {
                type: 'bilibili',
                url: url
            };
        } else {
            return {
                type: 'local',
                url: url,
                format: this.getVideoFormat(url)
            };
        }
    },
    
    /**
     * 获取视频格式
     * @param {string} url - 视频 URL
     * @returns {string} 视频格式 (mp4, webm, ogg 等)
     */
    getVideoFormat(url) {
        const ext = url.split('.').pop().toLowerCase();
        return ext || 'mp4';
    }
};

// 导出 MediaHandler
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MediaHandler };
}
