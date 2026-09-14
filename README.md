# 关西・东京 7日行 旅行手册

单个 HTML 文件的旅行手册网页，配一个极轻量的 Cloudflare Worker 做「待办清单」的共享存储。

## 目录结构

```
public/index.html   ← 网页本体（零外部依赖，可离线打开）
src/worker.js        ← 待办清单的共享存储接口
wrangler.toml         ← Cloudflare 部署配置
```

## 部署步骤（照着做一遍，之后每次 push 就自动上线）

### 第 1 步：创建 GitHub 仓库 【需要在电脑上做】
1. 打开 github.com，登录你的账号，New repository，随便起个名字（比如 `japan-trip`），设为 Private 或 Public 都可以，不用勾选任何初始化选项。
2. 把这个文件夹（`public/`、`src/`、`wrangler.toml`、`README.md`）整个上传到这个新仓库。最简单的方式：在仓库页面点 "Add file → Upload files"，把整个文件夹拖进去。

### 第 2 步：在 Cloudflare 创建 KV 命名空间 【需要在电脑上做】
待办清单要"划掉后所有人都看不到"，需要一个共享存储空间，这一步只做一次。

1. 登录 dash.cloudflare.com
2. 左侧菜单找到 "Storage & Databases" → "KV"，点 "Create a namespace"
3. 名字随便起，比如 `japan-trip-todos`，创建后会得到一串 **Namespace ID**，复制下来
4. 回到你 GitHub 仓库里的 `wrangler.toml` 文件，在线编辑（点文件右上角的铅笔图标），把最后一行：
   ```
   id = "REPLACE_WITH_YOUR_KV_NAMESPACE_ID"
   ```
   替换成你刚才复制的真实 ID，然后 Commit 保存。

### 第 3 步：连接 Cloudflare 和 GitHub 【需要在电脑上做】
1. 还是在 Cloudflare 后台，左侧菜单 "Workers & Pages" → "Create" → 选 "Import a repository"（有的界面叫 "Connect to Git"）
2. 授权 Cloudflare 访问你的 GitHub，选中刚才那个仓库
3. Cloudflare 会自动识别出 `wrangler.toml`，构建设置保持默认即可，直接点 "Save and Deploy"
4. 等 1-2 分钟，部署成功后会给你一个形如 `https://japan-trip-guide.你的用户名.workers.dev` 的网址 —— 这就是可以直接发给任何人打开的公开网址，不用登录、不用装 App。

### 之后如何更新
以后你想改行程、加照片、调时间，只要在电脑（或 GitHub App）上编辑 `public/index.html` 并 push/commit，Cloudflare 会自动重新部署，几十秒后网址内容就更新了，不需要重复上面的步骤。

### 可选：绑定自己的域名
如果你有自己的域名并且已经接入 Cloudflare，可以在 Workers 项目的 "Settings → Domains & Routes" 里加一个自定义域名，几分钟内生效。这一步不做也完全不影响网页正常使用。

---

## 待办清单是怎么"共享消失"的

`src/worker.js` 里存了一份初始待办清单，存在 Cloudflare KV 里。网页加载时会调用 `/api/todos` 读取当前清单；点"完成"会调用 `/api/todos/:id`（DELETE）把这一项从 KV 里删掉。因为所有人访问的是同一个 Worker、同一份 KV 数据，所以任何一个人划掉一项，另一个人刷新页面就再也看不到那一项了。

如果想把清单恢复成最初的样子，可以用任何 HTTP 工具（比如浏览器插件或 `curl`）对 `你的网址/api/todos/reset` 发一个 POST 请求。
