# 视频解析功能使用指南

本博客现已支持在 Markdown 文章中直接嵌入视频。支持多种视频平台和本地视频文件。

## 📺 支持的视频平台

### 1. **YouTube 视频**
在 Markdown 中使用以下语法嵌入 YouTube 视频：

```markdown
@[youtube](dQw4w9WgXcQ)
```

替换 `dQw4w9WgXcQ` 为你的 YouTube 视频 ID。获取方法：
- 打开 YouTube 视频页面
- 从 URL 中提取 ID：`https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- 分享链接中的 ID：`https://youtu.be/dQw4w9WgXcQ`

### 2. **Vimeo 视频**
在 Markdown 中使用以下语法嵌入 Vimeo 视频：

```markdown
@[vimeo](76979871)
```

替换 `76979871` 为你的 Vimeo 视频 ID。获取方法：
- 打开 Vimeo 视频页面
- 从 URL 中提取 ID：`https://vimeo.com/76979871`

### 3. **Bilibili 视频**
在 Markdown 中使用以下语法嵌入 Bilibili 视频：

```markdown
@[bilibili](BV1xx411c7mD)
```

替换 `BV1xx411c7mD` 为你的 Bilibili 视频 ID。获取方法：
- 打开 Bilibili 视频页面
- 从 URL 中提取 ID：`https://www.bilibili.com/video/BV1xx411c7mD`
- 复制右侧"分享"中的 BV 号

### 4. **本地视频文件**
在 Markdown 中使用图片语法嵌入本地视频：

```markdown
![video](videos/my-video.mp4)
```

支持的格式：
- **MP4**: `*.mp4` (最兼容)
- **WebM**: `*.webm` (更小的文件大小)
- **OGG**: `*.ogg` (特定场景)

建议：
- 将视频文件放在 `videos/` 目录下
- 使用 MP4 格式以获得最好的兼容性
- 压缩视频以减小文件大小

本地视频会和图片一样处理，但会渲染为视频播放器。

## 🎬 视频语法详解

### 完整示例

```markdown
# 我的技术分享视频

这是一个关于 JavaScript 的教程：

@[youtube](dQw4w9WgXcQ)

这是一个设计演讲：

@[vimeo](76979871)

这是一个中文技术讲座：

@[bilibili](BV1xx411c7mD)

这是我录制的本地教程视频：

![video](videos/javascript-tutorial.mp4)
```

### 语法规则

| 平台 | 语法 | 示例 |
|------|------|------|
| YouTube | `@[youtube](videoId)` | `@[youtube](dQw4w9WgXcQ)` |
| Vimeo | `@[vimeo](videoId)` | `@[vimeo](76979871)` |
| Bilibili | `@[bilibili](videoId)` | `@[bilibili](BV1xx411c7mD)` |
| 本地视频 | `![video](path/to/video.mp4)` | `![video](videos/tutorial.mp4)` |

## ⚙️ 视频特性

### 自动配置
所有视频都自动配置了以下特性：

- ✅ **响应式布局**: 视频容器会根据屏幕大小自动调整
- ✅ **16:9 宽高比**: 保持最标准的视频宽高比
- ✅ **自适应控制**: 提供播放/暂停、进度条、音量控制
- ✅ **错误处理**: 视频加载失败时会显示友好的错误提示

### 本地视频特性
- ✅ **滚动时暂停**: 页面滚动时视频会自动暂停
- ✅ **懒加载**: 视频只在进入视口时才加载
- ✅ **播放器控制**: 提供完整的 HTML5 视频播放器控制

### 嵌入式平台特性
- ✅ **自动全屏**: 支持全屏播放
- ✅ **平台功能**: 保留每个平台的原生功能
- ✅ **高可用性**: 使用各平台官方嵌入方式

## 🐛 常见问题

### Q: 上传的视频没有显示？
**A**: 检查以下几点：
1. 确认视频文件路径正确（相对于项目根目录）
2. 确认视频文件格式支持（MP4、WebM、OGG）
3. 确认文件大小不过大（建议不超过 100MB）
4. 在浏览器控制台查看错误信息

### Q: YouTube/Bilibili 视频无法加载？
**A**: 
1. 确认视频 ID 输入正确
2. 确认视频在相应平台是公开的
3. 某些地区可能无法访问特定平台（法律或政策原因）
4. 检查网络连接是否正常

### Q: 如何修改视频大小或样式？
**A**: 编辑 `js/config.js` 文件中的 `APP_CONFIG.videoConfig`：

```javascript
videoConfig: {
    autoplay: false,      // 自动播放
    controls: true,       // 显示控制条
    muted: false,         // 静音
    loop: false,          // 循环播放
    preload: 'metadata'   // 预加载元数据
}
```

### Q: 能否同时嵌入音频？
**A**: 目前系统主要支持视频。音频可以使用 HTML 标签直接嵌入：

```html
<audio controls>
    <source src="audio/podcast.mp3" type="audio/mpeg">
    你的浏览器不支持音频播放
</audio>
```

## 📝 最佳实践

### 视频选择建议

| 场景 | 推荐 | 原因 |
|------|------|------|
| 专业教程内容 | YouTube | 受众广，易分享，自动存储 |
| 艺术/创意内容 | Vimeo | 平台受众专业，视频质量高 |
| 中文技术内容 | Bilibili | 本地化优势，弹幕互动 |
| 私密/保密内容 | 本地视频 | 完全控制，不依赖第三方 |
| 快速分享试验 | 本地视频 | 快速部署，无需上传至其他平台 |

### 性能优化建议

1. **压缩本地视频**: 使用 FFmpeg 压缩视频以减小文件大小
   ```bash
   ffmpeg -i input.mp4 -c:v libx264 -crf 23 -c:a aac -b:a 128k output.mp4
   ```

2. **使用适当的格式**:
   - MP4: 最好的兼容性，推荐使用
   - WebM: 更小的文件大小，但兼容性稍低
   - 不要混合使用过多格式

3. **CDN 托管**: 将本地视频文件上传到 CDN 以加快加载速度

4. **缩略图**: 虽然系统会自动生成缩略图，但你也可以为视频添加自定义缩略图

## 🔧 技术细节

### 后端实现
- **配置模块** (`js/config.js`): 集中管理所有视频配置
- **媒体处理器** (`js/media-handler.js`): 处理视频加载、错误、响应式布局
- **渲染器** (`js/markdown-renderer.js`): 将视频语法转换为 HTML
- **加载器** (`js/article-loader.js`): 管理文章加载和缓存

### 响应式容器计算
```
宽高比 16:9 = 1.777...
padding-bottom = 100% / 1.777 ≈ 56.25%
```

这个计算方法确保视频在任何屏幕尺寸上都能保持 16:9 的宽高比。

## 📚 更多资源

- [HTML5 Video 标签文档](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/video)
- [FFmpeg 压缩指南](https://ffmpeg.org/)
- [Markdown 扩展语法](https://markdown.js.org/list/articles.html)
- [博客项目文档](./README.md)

---

如有问题或建议，欢迎提交 Issue！
