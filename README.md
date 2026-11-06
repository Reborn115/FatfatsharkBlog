# fatfatshark 的数字花园

一个纯静态的 Astro 博客，以卡片首页、悬浮导航和舒适的阅读体验为核心。页面结构参考 ooliver.cn 的 Myriad 主页，页面与插画为本项目独立实现。

## 本地启动

```sh
npm ci
npm run dev
```

打开 `http://127.0.0.1:4321`。

开发和预览服务默认监听 `0.0.0.0`，同一局域网内的其他设备可访问 `http://这台电脑的局域网IP:4321`。例如在 macOS 上运行 `ipconfig getifaddr en0` 查看 Wi-Fi 地址。`0.0.0.0` 是监听地址，浏览器中请使用实际 IP；切换网络后 IP 可能变化。

其他设备需连接同一局域网，电脑保持服务运行。如果无法连接，检查 macOS 防火墙是否允许 Node.js 入站，以及 Wi-Fi 是否开启了客户端隔离。

```sh
npm run build    # 类型检查和静态构建
npm run preview  # 预览生产构建
```

需要 Node.js 22.23.4 或更高版本。

## 页面与交互

- 首页：全屏原创插画壁纸、半透明小组件、完整卡片视图切换、个人卡片、北京时间时钟、最近文章、音乐概念封面切换、书架、项目与收藏链接。
- 文章列表：分类筛选、标签入口、Markdown 内容。
- 文章页：代码高亮与复制、桌面目录、阅读进度、相关文章和链接复制。
- 收藏夹：书籍、音乐、项目与链接筛选。
- 关于页、404、RSS 和 sitemap。
- 持久化深浅色切换、全站搜索（⌘ K / Ctrl K）、移动端底部导航和减少动画偏好。

没有登录、后台编辑器、访问统计或数据同步。时钟在浏览器本地计算；音乐卡片为原创概念封面展示，不提供音频播放。所有内容均在构建时从本地文件生成。

## 换成自己的内容

### 个人资料与收藏

修改 `src/data/site.ts`：名字、简介、首页英文标语、邮箱、GitHub 地址、书籍、项目、音乐和收藏链接。

### 替换首页背景图

1. 将图片放到项目的 `public/images/`，例如 `wallpaper-coast.webp`。
2. 修改 `src/data/site.ts` 中以下字段（只改字段值，保留其他配置）：

```ts
wallpaper: '/images/wallpaper-coast.webp',
wallpaperPosition: 'center',
wallpaperMobilePosition: '62% top',
```

浏览器路径不包含 `public`，文件名和扩展名必须与真实文件完全一致。建议使用小写英文、数字和短横线命名。每次换图使用新文件名，可以减少浏览器缓存造成的旧图残留。

没有固定尺寸要求。针对当前全屏背景，我建议横向 16:9，至少 1920 × 1080，优先 2560 × 1440；格式优先 WebP，也支持 JPG、PNG 和 SVG。照片建议压缩到约 300 KB–1 MB，尽量小于 2 MB。这些是本项目的画质与加载速度建议，不是 Vercel 限制。

背景使用 `cover` 等比例铺满屏幕，会裁切超出屏幕的部分，不会拉伸图片。手机竖屏通常会裁掉横图两侧，重要主体尽量不要贴边，下半部分也会被卡片和渐变覆盖。

`wallpaperPosition` 是电脑端的对齐位置；`wallpaperMobilePosition` 是手机端的对齐位置。可使用 `center`、`center top`、`70% center` 等 CSS background-position 值。手机端可以从 `50% top`（居中）开始，再尝试 `35% top`（偏左）或 `75% top`（偏右）。

```sh
npm run dev
```

先在电脑和手机预览，再构建、提交并推送到已连接 Vercel 的 Git 分支。换背景不需要再次修改域名解析。

当前名字、文案、收藏与五篇文章是初始示例，公开发布前请替换或删除。头像与封面在 `public/images/`，可以直接替换为自己的图片。

### 写文章

在 `src/content/blog/` 新建 Markdown 文件。文件名就是文章路径，例如 `hello-world.md` 对应 `/blog/hello-world/`。

```md
---
title: "我的第一篇文章"
description: "用一两句话写下摘要。"
date: 2026-11-06T02:00:00Z
category: "日常随笔"
tags: ["生活", "记录"]
minutes: 3
color: "sage"
icon: "leaf"
draft: false
---

正文从这里开始。
```

`color` 支持 `sage`、`lavender`、`peach`、`sand`。`draft: true` 的文章不会出现在网站或 RSS 中。示例文章用 `demo: true` 显示标识，自己的文章可以省略。

## 部署到 Vercel

1. 将目录中的代码提交到自己的 GitHub 仓库。
2. 在 Vercel 导入该仓库，框架选择 Astro，构建命令 `npm run build`，输出目录 `dist`。
3. 在项目环境变量中设置 `SITE_URL=https://fatfatshark.space`，用于 canonical、RSS 和 sitemap。项目默认域名也已配置为此地址。
4. 在 Settings → Domains 添加自己的域名，并按 Vercel 提示配置 DNS。
5. 发布后，每次向部署分支提交文章或配置修改，Vercel 会自动重新构建。

本地也可以把 `.env.example` 复制成 `.env`，设置 `SITE_URL`。未设置时默认使用 `https://fatfatshark.space`。日后更换域名时，请同时更新此配置和 Vercel 环境变量。

使用阿里云管理域名的完整部署步骤见 `DEPLOYMENT.md`。

## 浏览器验证

```sh
npx playwright install chromium
npm run test:browser
```

先启动本地预览。脚本默认测试 `http://127.0.0.1:4321`，可通过 `TEST_URL` 指定其他本地地址。macOS 若已安装 Google Chrome，会直接使用现有浏览器。截图保存在被 Git 忽略的 `test-results/`。
