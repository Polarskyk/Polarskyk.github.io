/**
 * 文章详情页诊断脚本
 * 使用方法: 在浏览器 Console 中复制并粘贴本脚本，然后按 Enter
 * 脚本会检查所有可能导致文章加载失败的问题
 */

(function() {
    console.clear();
    console.log('%c=== 文章详情页诊断开始 ===', 'font-size: 16px; font-weight: bold; color: #2563eb;');
    
    let issueCount = 0;
    let warningCount = 0;
    
    // 记录信息的函数
    function logSuccess(msg) {
        console.log('%c✓ ' + msg, 'color: #10b981; font-weight: bold;');
    }
    
    function logError(msg) {
        console.error('%c✗ ' + msg, 'color: #ef4444; font-weight: bold;');
        issueCount++;
    }
    
    function logWarning(msg) {
        console.warn('%c⚠ ' + msg, 'color: #f59e0b; font-weight: bold;');
        warningCount++;
    }
    
    function logInfo(msg) {
        console.log('%ci ' + msg, 'color: #6366f1;');
    }
    
    // 分隔线
    function separator() {
        console.log('------');
    }
    
    // ========== 第一部分: 环境检查 ==========
    console.log('\n%c📍 1. 环境信息', 'font-size: 14px; font-weight: bold; color: #2563eb;');
    separator();
    
    logInfo('当前 URL: ' + window.location.href);
    logInfo('Protocol: ' + window.location.protocol);
    logInfo('Hostname: ' + window.location.hostname);
    logInfo('Pathname: ' + window.location.pathname);
    
    // 检查 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const filename = urlParams.get('file');
    if (filename) {
        logSuccess('文章文件名: ' + filename);
    } else {
        logError('未指定文章文件名 (URL 应包含 ?file=xxx.md)');
    }
    
    const downloadUrl = urlParams.get('download_url');
    if (downloadUrl) {
        logInfo('下载链接: ' + downloadUrl);
    }
    
    // ========== 第二部分: 协议检查 ==========
    console.log('\n%c📍 2. 访问协议检查', 'font-size: 14px; font-weight: bold; color: #2563eb;');
    separator();
    
    if (window.location.protocol === 'file:') {
        logError('当前使用 file:// 协议，这会导致跨域加载失败');
        logInfo('解决方案: 使用 HTTP 服务器访问页面');
        logInfo('  - Python: python -m http.server 8000');
        logInfo('  - Node.js: npx http-server');
    } else if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
        logSuccess('正在使用 HTTP(S) 协议 ✓');
    } else {
        logWarning('未知的协议: ' + window.location.protocol);
    }
    
    // ========== 第三部分: 模块加载检查 ==========
    console.log('\n%c📍 3. 模块加载状态', 'font-size: 14px; font-weight: bold; color: #2563eb;');
    separator();
    
    const modules = [
        { name: 'PathConfig', type: 'object' },
        { name: 'GITHUB_CONFIG', type: 'object' },
        { name: 'APP_CONFIG', type: 'object' },
        { name: 'MarkdownRenderer', type: 'object' },
        { name: 'MediaHandler', type: 'object' },
        { name: 'ArticleLoader', type: 'object' }
    ];
    
    let loadedModules = 0;
    modules.forEach(mod => {
        if (typeof window[mod.name] !== 'undefined') {
            logSuccess(mod.name + ' 已加载');
            loadedModules++;
        } else {
            logError(mod.name + ' 未加载 (js/config.js 或相关模块加载失败)');
        }
    });
    
    // ========== 第四部分: 外部库检查 ==========
    console.log('\n%c📍 4. 外部库检查', 'font-size: 14px; font-weight: bold; color: #2563eb;');
    separator();
    
    if (typeof marked !== 'undefined') {
        logSuccess('marked.js 已加载');
    } else {
        logError('marked.js 未加载');
    }
    
    if (typeof Prism !== 'undefined') {
        logSuccess('Prism.js 已加载');
    } else {
        logWarning('Prism.js 未加载 (不影响文章显示，只影响代码高亮)');
    }
    
    // ========== 第五部分: 路径配置检查 ==========
    console.log('\n%c📍 5. 路径配置检查', 'font-size: 14px; font-weight: bold; color: #2563eb;');
    separator();
    
    if (typeof PathConfig !== 'undefined') {
        try {
            const basePath = PathConfig.getBasePath();
            logSuccess('基础路径: ' + basePath);
            
            if (filename) {
                const postsPath = PathConfig.getPostsPath(filename);
                logInfo('文章完整路径: ' + postsPath);
            }
            
            if (PathConfig.isGitHubPages()) {
                logInfo('部署环境: GitHub Pages');
                if (PathConfig.isUserRepo()) {
                    logInfo('仓库类型: 账户级 (username.github.io)');
                } else {
                    logWarning('仓库类型: 项目级 - 可能需要特殊配置');
                }
            } else {
                logInfo('部署环境: 本地或其他');
            }
        } catch (error) {
            logError('PathConfig 执行出错: ' + error.message);
        }
    } else {
        logError('无法检查路径配置 (PathConfig 未加载)');
    }
    
    // ========== 第六部分: 脚本加载检查 ==========
    console.log('\n%c📍 6. 脚本加载检查', 'font-size: 14px; font-weight: bold; color: #2563eb;');
    separator();
    
    const requiredScripts = [
        'js/config.js',
        'js/media-handler.js',
        'js/markdown-renderer.js',
        'js/article-loader.js'
    ];
    
    const loadedScripts = Array.from(document.querySelectorAll('script'))
        .map(s => s.src)
        .filter(src => src);
    
    logInfo('已加载的脚本数: ' + loadedScripts.length);
    
    requiredScripts.forEach(script => {
        const isLoaded = loadedScripts.some(s => s.includes(script));
        if (isLoaded) {
            logSuccess(script + ' 已加载');
        } else {
            logError(script + ' 未找到');
        }
    });
    
    // ========== 第七部分: 文章文件测试 ==========
    console.log('\n%c📍 7. 文章文件可访问性测试', 'font-size: 14px; font-weight: bold; color: #2563eb;');
    separator();
    
    if (filename && typeof PathConfig !== 'undefined') {
        try {
            const postsPath = PathConfig.getPostsPath(filename);
            logInfo('测试加载: ' + postsPath);
            
            fetch(postsPath)
                .then(response => {
                    if (response.ok) {
                        logSuccess(`文件可访问 (状态: ${response.status})`);
                        return response.text();
                    } else {
                        logError(`文件加载失败 (状态: ${response.status})`);
                    }
                })
                .then(text => {
                    if (text && text.length > 0) {
                        logSuccess(`文件内容有效 (大小: ${text.length} 字节)`);
                        if (text.startsWith('---')) {
                            logSuccess('Front Matter 格式正确');
                        } else {
                            logWarning('文件不以 --- 开头，可能不是有效的 Markdown');
                        }
                    }
                })
                .catch(error => {
                    logError('无法加载文件: ' + error.message);
                });
        } catch (error) {
            logError('文件测试出错: ' + error.message);
        }
    } else {
        logWarning('无法测试文件可访问性 (未指定文件名或 PathConfig 未加载)');
    }
    
    // ========== 总结 ==========
    console.log('\n%c📍 诊断总结', 'font-size: 14px; font-weight: bold; color: #2563eb;');
    separator();
    
    const totalModules = modules.length;
    const moduleStatus = (loadedModules === totalModules) 
        ? `%c✓ 所有模块已加载 (${loadedModules}/${totalModules})` 
        : `%c✗ 有 ${totalModules - loadedModules} 个模块未加载`;
    
    console.log(moduleStatus, loadedModules === totalModules ? 'color: #10b981; font-weight: bold;' : 'color: #ef4444; font-weight: bold;');
    
    if (issueCount === 0 && warningCount === 0) {
        console.log('%c✓ 没有检测到严重问题！系统应该可以正常工作', 'color: #10b981; font-weight: bold; font-size: 12px;');
        console.log('\n%c如果页面仍然无法加载文章，请尝试以下步骤:', 'color: #6366f1; font-weight: bold;');
        console.log('1. 刷新页面 (Ctrl + F5)');
        console.log('2. 检查 Network 标签页是否有 404 错误');
        console.log('3. 查看 Console 中是否有其他错误信息');
    } else if (issueCount === 0) {
        console.log(`%c⚠ 检测到 ${warningCount} 个警告`, 'color: #f59e0b; font-weight: bold;');
    } else {
        console.log(`%c✗ 检测到 ${issueCount} 个严重问题`, 'color: #ef4444; font-weight: bold;');
        console.log('\n%c常见解决方案:', 'color: #ef4444; font-weight: bold;');
        console.log('1. 检查 js/ 目录中的 .js 文件是否都存在');
        console.log('2. 确保使用 HTTP 服务器而不是直接打开 HTML 文件');
        console.log('3. 检查 posts/ 目录中的 markdown 文件是否存在');
        console.log('4. 尝试清除浏览器缓存并刷新页面');
    }
    
    separator();
    console.log('%c=== 诊断完成 ===', 'font-size: 16px; font-weight: bold; color: #2563eb;');
    console.log('如需更多帮助，请查看 TROUBLESHOOTING.md 文档');
    
})();

// 导出诊断结果 (可选)
console.log('\n%c💡 提示: 你也可以手动检查以下内容:', 'color: #8b5cf6; font-style: italic;');
console.log('- PathConfig.getBasePath()');
console.log('- PathConfig.getPostsPath("welcome.md")');
console.log('- Object.keys(MarkdownRenderer)');
console.log('- Object.keys(MediaHandler)');
