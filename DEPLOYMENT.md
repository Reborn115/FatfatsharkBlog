# 部署到 Vercel，并绑定 fatfatshark.space

准备日期：2026-11-06。当前仅有本地项目与预览；此文档不代表已经建立 GitHub 仓库、部署 Vercel 或修改线上 DNS。

网站代码存放在 GitHub，Vercel 负责构建和托管，阿里云管理域名和 DNS。上线后，网站由 Vercel 提供，不依赖这台电脑开机。

## 1. 创建一个空的 GitHub 仓库

登录 GitHub。点击右上角 `+` → `New repository`。

- Owner：自己的个人账号。
- Repository name：建议 `fatfatshark-blog`。
- Visibility：Private 或 Public 均可；Private 隐藏源代码，但不会自动让部署的网站私有。
- 不勾选初始化 README，不额外添加 .gitignore 或许可证，因为本地已经有项目文件。

点击 Create repository。记下该页面显示的仓库 HTTPS 地址。

## 2. 提交本地代码

在终端打开当前目录：

```sh
cd /Users/lizhengdong/FatfatsharkBlog
git init -b main
git add .
git commit -m "Initial blog"
```

本项目的 .gitignore 已排除 node_modules、dist、.astro、.env 和测试截图。需要上传源代码和 package-lock.json，不要单独只上传 dist。

如果 git commit 提示没有用户名和邮箱，使用自己的姓名及 GitHub 设置中的邮箱（也可以使用 GitHub 提供的 noreply 地址），仅为此仓库配置后再提交：

```sh
git config user.name "你的名字"
git config user.email "你的 GitHub 邮箱"
git commit -m "Initial blog"
```

从 GitHub 新仓库页面复制真实 HTTPS 地址替换下面的占位文本：

```sh
git remote add origin https://github.com/你的用户名/fatfatshark-blog.git
git push -u origin main
```

GitHub 不接受账号密码作为 Git HTTPS 密码。若本机没有登录凭据，可以在 GitHub Desktop 中通过浏览器登录，并使用 Add Existing Repository 添加此目录、Publish repository 发布；不要把账号密码或访问令牌写进项目文件。选择 GitHub Desktop 路线时可以由 Desktop 创建并发布仓库，无需先创建同名远程仓库。

成功标准：GitHub 仓库首页能看到 package.json、package-lock.json、astro.config.mjs、src 和 public。

## 3. 在 Vercel 导入仓库

使用 GitHub 账号登录 Vercel。如需选择套餐，个人非商业博客可以使用 Hobby，并遵守其额度。

点击 Add New → Project，在 Import Git Repository 中找到 fatfatshark-blog，点击 Import。如果看不到仓库，配置 Vercel 的 GitHub App 权限，授权它访问该仓库。

检查配置：

| 字段 | 本项目填写值 |
| --- | --- |
| Project Name | fatfatshark-blog，或自己喜欢的名字 |
| Framework Preset | Astro |
| Root Directory | 默认项目根目录，不是 src 或 dist |
| Build Command | npm run build |
| Output Directory | dist |
| Install Command | 默认；也可显式使用 npm ci |
| Node.js Version | 26.x，与本地已通过检查的 Node 26 保持同一主版本 |

本项目是纯静态 Astro，不需要安装 @astrojs/vercel 适配器。

展开 Environment Variables，增加：

```text
Name: SITE_URL
Value: https://fatfatshark.space
```

至少应用到 Production。若也应用到 Preview，预览页的 canonical 和订阅链接将指向正式域名。

点击 Deploy，等待构建完成。先用 Vercel 分配的 .vercel.app 地址检查页面。若后续修改环境变量，必须创建新部署或 Redeploy，旧部署不会自动更新。

成功标准：Deployment 为 Ready，访问分配的地址能看到首页及文章。该临时地址由 Vercel 实际分配，不能假定一定等于项目名。

## 4. 在 Vercel 项目中添加域名

打开项目 → Settings → Domains，添加：

```text
fatfatshark.space
```

建议同时添加：

```text
www.fatfatshark.space
```

将 fatfatshark.space 用于 Production，让 www.fatfatshark.space 重定向到主域名。若 Vercel 默认建议相反方向，在设置中改成自己选定的主域名，以便与 SITE_URL 一致。

保留域名设置页面，展开 DNS 配置提示。首次显示 Invalid Configuration 很正常，因为 DNS 尚未连接。

## 5. 在阿里云添加公网解析记录

阿里云控制台 → 云解析 DNS → 公网权威解析，找到 fatfatshark.space → 解析设置 → 添加记录。也可以从域名列表的“解析”进入。

按 Vercel 为本项目显示的实际类型和记录值填写，通常如下：

| 阿里云字段 | 主域名 | www 子域名 |
| --- | --- | --- |
| 记录类型 | A | CNAME |
| 主机记录 | @ | www |
| 解析请求来源 / 解析线路 | 默认 | 默认 |
| 记录值 | 复制 Vercel 显示的 IPv4 地址 | 复制 Vercel 显示的目标域名 |
| TTL | 默认 | 默认 |

主机记录 @ 表示 fatfatshark.space；www 表示 www.fatfatshark.space。不要在主机记录中再次填写完整域名。

记录值不要带 https://、路径或 :4321。不要填 127.0.0.1、0.0.0.0 或电脑局域网 IP。不要照抄旧教程固定的 Vercel IP 或 CNAME：本项目控制台提示优先。

只调整 @ 和 www 上与本次网站接入冲突的旧 A、AAAA、CNAME 或 URL 转发记录；已有邮件 MX、TXT 或其他服务的记录应保留。若 Vercel 显示所有权验证要求，再按提示额外添加 TXT，主机记录和验证值都照其提示填。

采用 DNS 记录接入方式时，DNS 服务器可以继续由阿里云管理；不必把域名转移至 Vercel。

## 6. 检查 HTTPS 和跳转

返回 Vercel Domains 页面刷新检测，等待 DNS 缓存更新。记录变更可能几分钟生效，也可能因原 TTL、缓存或其他配置更久，不能保证固定完成时间。

Valid Configuration 表示域名配置通过。DNS 验证完成后 Vercel 自动申请 HTTPS 证书，不必在阿里云另行购买证书。

依次检查：

- https://fatfatshark.space/
- https://fatfatshark.space/blog/
- https://fatfatshark.space/rss.xml
- https://fatfatshark.space/sitemap-index.xml
- https://www.fatfatshark.space/ 应跳转到 https://fatfatshark.space/

如果 .vercel.app 正常而自定义域名失败，优先检查 DNS 和 Domains 提示；如果所有地址都失败，优先检查构建日志和部署状态。若域名变为 Valid 但 HTTPS 仍未就绪，查看证书提示，尤其是既有 CAA 限制或冲突解析，不要盲目删除所有记录。

## 7. 日常更新

修改文章或配置后：

```sh
cd /Users/lizhengdong/FatfatsharkBlog
npm run build
git add .
git commit -m "Update blog"
git push
```

Vercel 会跟随已连接的 Git 分支创建部署。main 应是 Production Branch；Production 部署成功后正式域名切换到新版本。后台检查部署是否 Ready，再访问域名确认。

## 官方资料

- Astro 静态部署：https://docs.astro.build/en/guides/deploy/vercel/
- Vercel GitHub 集成：https://vercel.com/docs/git/vercel-for-github
- Vercel 域名：https://vercel.com/docs/domains/working-with-domains/add-a-domain
- Vercel Node 版本：https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- Vercel 环境变量：https://vercel.com/docs/environment-variables/managing-environment-variables
- 阿里云公网解析：https://help.aliyun.com/zh/dns/pubz-add-parsing-record
