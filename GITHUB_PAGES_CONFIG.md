# GitHub Pages 配置文件

这是本博客的 GitHub Pages 配置。

## 用途

`.nojekyll` 文件告诉 GitHub Pages 不要处理此仓库为 Jekyll 站点，确保所有静态文件（包括包含下划线前缀的文件）都被正确服务。

**重要：此文件必须保留在仓库根目录中！**

## 配置说明

当部署到 GitHub Pages 时：

1. GitHub Pages 检测到 `.nojekyll` 文件
2. 跳过 Jekyll 处理
3. 所有静态文件直接服务
4. JavaScript 和 CSS 文件正常加载
5. AJAX 请求正常处理

## 常见问题

**Q: 删除 .nojekyll 会怎样？**

A: 如果删除此文件：
- GitHub Pages 会将仓库视为 Jekyll 站点
- 某些文件可能无法正确访问
- 博客功能可能不完整

**Q: 为什么需要这个文件？**

A: 这个博客使用纯 JavaScript 和 AJAX，不需要 Jekyll 处理。`.nojekyll` 确保直接服务所有文件。

**更多信息：** [GitHub Pages 文档](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)
