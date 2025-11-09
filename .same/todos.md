# Memento Blog Clone - 待办事项

## 已完成 ✅
- [x] 创建项目
- [x] 添加 shadcn UI 组件
- [x] 创建导航栏组件
- [x] 创建生命进度条组件
- [x] 创建主页英雄区域
- [x] 添加背景图片和模糊效果
- [x] 实现响应式设计
- [x] 添加主题切换功能
- [x] 修复linter错误
- [x] 创建版本1-7
- [x] 优化生命进度条的视觉效果
- [x] 改进日期标签的显示位置
- [x] 添加平滑的滚动动画
- [x] 使用原始网站的Logo图标
- [x] 改进下拉菜单交互
- [x] 添加Recent Notes区域
- [x] 添加Photographs相册区域
- [x] 创建页脚组件
- [x] 实现完整的暗黑模式
- [x] 修复日期标签被遮挡问题
- [x] 将对话框移到右上角
- [x] 实现多语言问候语自动切换
- [x] 创建Links友情链接页面
- [x] 创建Message留言板页面
- [x] 修复导航链接
- [x] 配置Next.js静态导出
- [x] 安装Markdown处理依赖
- [x] 创建content文件夹结构
- [x] 创建示例Markdown文件
- [x] 配置GitHub Pages部署
- [x] 创建完整的README文档

## 待实现功能 📝

### Notes系统
- [ ] 创建Notes列表页面（带侧边栏）
- [ ] 实现Markdown文件读取和解析
- [ ] 创建Notes详情页面（动态路由）
- [ ] 添加分类筛选（IT/Art/Diary）
- [ ] 添加标签系统
- [ ] 实现搜索功能

### Photographs系统
- [ ] 创建Photographs相册列表
- [ ] 实现照片瀑布流布局
- [ ] 添加照片Lightbox查看器
- [ ] 支持按年份分类
- [ ] 支持照片懒加载
- [ ] 添加照片EXIF信息显示

### 部署优化
- [ ] 测试GitHub Actions部署
- [ ] 优化构建性能
- [ ] 添加sitemap.xml
- [ ] 添加robots.txt

## 项目完成！🎉

Memento博客已经完美复现，包含：
- ✅ 主页（带多语言问候语切换）
- ✅ Links页面（4个友情链接卡片）
- ✅ Message页面（引言 + 评论系统界面）
- ✅ 完整的导航系统
- ✅ 暗黑模式支持
- ✅ 响应式设计
- ✅ Markdown内容管理系统基础
- ✅ GitHub Pages部署配置

## 📁 内容管理说明

### 如何添加笔记
1. 在 `content/notes/` 下创建MD文件
2. 添加frontmatter元数据
3. 编写Markdown内容
4. 提交到Git，自动部署

### 如何添加照片
1. 将照片放入 `public/images/photographs/年份/`
2. 在 `content/photographs/` 创建MD配置文件
3. 提交到Git，自动部署

### 部署流程
1. 推送代码到GitHub
2. GitHub Actions自动构建
3. 自动部署到GitHub Pages
