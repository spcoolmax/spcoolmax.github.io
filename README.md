# Memento Blog

基于Next.js的个人博客，支持Markdown内容管理和GitHub Pages部署。

## 📁 项目结构

```
memento-blog/
├── content/                    # 📝 内容文件夹（存放Markdown文件）
│   ├── notes/                 # 笔记
│   │   ├── it/               # IT相关笔记
│   │   ├── art/              # 艺术相关笔记
│   │   └── diary/            # 日记
│   └── photographs/           # 照片相册
│       └── 2024.md           # 2024年相册配置
├── public/
│   └── images/               # 🖼️ 静态图片资源
│       └── photographs/      # 照片存储位置
│           └── 2024/         # 按年份分类
└── src/
    ├── app/                  # Next.js页面
    │   ├── page.tsx          # 主页
    │   ├── notes/            # Notes页面
    │   ├── photographs/      # Photographs页面
    │   ├── message/          # 留言板
    │   └── links/            # 友情链接
    └── components/           # React组件
```

## 📝 如何添加内容

### 添加笔记（Notes）

1. 在`content/notes/`下创建Markdown文件
2. 添加frontmatter（元数据）：

```markdown
---
title: "文章标题"
category: "IT"  # IT, Art, 或 Diary
tags: ["标签1", "标签2"]
date: "2024-11-08"
---

# 文章内容

这里是正文...
```

3. 示例文件位置：
   - `content/notes/it/app.md` - IT工具清单
   - `content/notes/art/photographer.md` - 摄影师介绍
   - `content/notes/diary/travel.md` - 旅行日记

### 添加照片（Photographs）

1. 将照片放入`public/images/photographs/年份/`文件夹
2. 在`content/photographs/`创建年份MD文件：

```markdown
---
title: "2024"
date: "2024-11-08"
---

# 2024

## 地点名称

![描述](/images/photographs/2024/photo-1.jpg)
*照片说明*

![描述](/images/photographs/2024/photo-2.jpg)
*照片说明*
```

3. 支持的图片格式：`.jpg`, `.jpeg`, `.png`, `.webp`

## 🚀 本地开发

```bash
# 安装依赖
bun install

# 启动开发服务器
bun dev

# 访问 http://localhost:3000
```

## 📦 部署到GitHub Pages

### 方法一：手动部署

```bash
# 1. 构建静态文件
bun run build

# 2. out文件夹就是静态网站，上传到GitHub Pages即可
```

### 方法二：GitHub Actions自动部署

1. 在项目根目录创建`.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Build
        run: bun run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

2. 在GitHub仓库设置中：
   - 进入 Settings → Pages
   - Source选择"GitHub Actions"

### 配置子路径（如果部署到username.github.io/repo-name）

修改`next.config.js`：

```javascript
const nextConfig = {
  output: 'export',
  basePath: '/repo-name',      // 改成你的仓库名
  assetPrefix: '/repo-name',   // 改成你的仓库名
  // ...
}
```

## 📚 技术栈

- **Next.js 14** - React框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式
- **Markdown** - 内容管理
- **Gray Matter** - Frontmatter解析
- **Remark** - Markdown处理

## 🎨 功能特性

- ✅ 主页（多语言问候语轮换）
- ✅ Notes笔记系统（IT/Art/Diary分类）
- ✅ Photographs照片相册
- ✅ Message留言板
- ✅ Links友情链接
- ✅ 暗黑模式
- ✅ 响应式设计
- ✅ 生命进度条
- ✅ 静态导出支持

## 📖 更多说明

### Markdown语法支持

支持标准Markdown语法，包括：
- 标题（# ## ###）
- 列表（- * 1.）
- 链接（[text](url)）
- 图片（![alt](url)）
- 代码块（```language）
- 引用（>）
- 粗体（**text**）
- 斜体（*text*）

### 图片处理

由于启用了`images.unoptimized: true`，图片不会被Next.js优化，直接使用原始文件。这对于GitHub Pages部署是必要的。

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 License

MIT


### 用户页部署（spcoolmax.github.io）

```bash
# 安装依赖
npm install

# 构建并导出静态文件（生成 out/）
npm run release

# （可选）本地静态预览，确认 out/index.html 正常
npm run preview         # 等价于：npx serve out
# 打开 serve 输出的网址（通常 http://localhost:3000/ ）检查页面样式、图片和交互

# 将 out/ 目录的“内容”复制到 spcoolmax.github.io 仓库根目录提交
# GitHub 仓库 Settings → Pages：
#   Source: Deploy from a branch
#   Branch: 包含导出内容的分支
#   Folder: /
```
