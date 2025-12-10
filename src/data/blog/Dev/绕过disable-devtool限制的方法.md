---
title: 绕过disable-devtool限制的方法
pubDatetime: 2025-02-12T17:53:33+08:00
description: 在一些网页开发或调试过程中，可能会遇到网页通过 disable-devtool 来限制开发者工具的使用。以下是两种可以实现绕过 disable-devtool 的方法，但请注意，这些方法仅用于技术探讨和合法的开发调试场景，切勿用于非法用途。
category: 开发
tags:
- 前端
- 破解
---

在一些网页开发或调试过程中，可能会遇到网页通过 `disable-devtool` 来限制开发者工具的使用。以下是两种可以实现绕过 `disable-devtool` 的方法，但请注意，这些方法仅用于技术探讨和合法的开发调试场景，**切勿用于非法用途**。

## 一、通过 DevTool 的本地替代

1. **准备工作**

    提前打开浏览器的开发者工具（DevTool），进入“网络”（Network）页面，勾选“保留日志”（Preserve log）选项。这样即使页面发生跳转或关闭，依然可以查看到相关的网络请求日志。同时，勾选“禁用缓存”（Disable cache）选项，防止浏览器直接使用未修改的缓存文件。
2. **寻找目标文件**

    打开需要调试的网页，仔细查看网络请求列表，找到一个包含 `tkName`、`disable-devtool` 等关键字的 `.js` 文件。这通常是网页用来检测开发者工具的关键脚本。
3. **调整网络速度**

    在网络页面中，将网络条件从“无限制”（No throttling）调整为“慢速 4G”（Slow 4G）或“3G”（3G）。这样可以减缓页面跳转或关闭的速度，为我们后续的操作争取时间。
4. **修改文件**

    在“源代码”（Sources）页面中找到刚才定位到的 `.js` 文件，点击暂停调试按钮（Pause），然后在“覆盖”（Overrides）选项中选择一个替代文件夹。接着右键点击要修改的 `.js` 文件，选择“替代”（Override）。
    找到文件中类似以下的代码片段：

    ```javascript
    (d.tkName)) === d.md5) return t("token passed");
    ```
    将其修改为：
    ```javascript
    (d.tkName)) === d.md5, true) return t("token passed");
    ```
5. **完成绕过**

    刷新页面，此时 `disable-devtool` 的限制已被成功绕过。

## 二、通过 Mitmproxy 等 HTTPS 代理的中间人模式替代远程响应

1. **基础操作**

    与第一种方法类似，禁用缓存、先找到目标 `.js` 文件，不再赘述。
2. **本地文件准备**

    将找到的 `.js` 文件另存到本地，并按照第一种方法中的步骤修改该文件。
3. **配置 Mitmproxy 插件**

    使用以下 Mitmproxy 插件代码，实现对远程响应的替换，从而绕过 `disable-devtool`。具体使用方法可参考相关教程。

    ```python
    from mitmproxy import http
    from mitmproxy.http import Response
    
    def request(flow: http.HTTPFlow):
        if "hello" in flow.request.url:  # 替换为需要替代的远程 URL 条件
            try:
                with open("本地文件路径", encoding='utf-8') as f:  # 替换为本地文件路径
                    flow.response = Response.make(
                        200,
                        f.read(),
                        {"Content-Type": "application/javascript"}
                    )
            except UnicodeDecodeError:
                # 如果 UTF-8 编码失败，尝试以二进制方式读取
                with open("本地文件路径", 'rb') as f:  # 替换为本地文件路径
                    flow.response = Response.make(
                        200,
                        f.read(),
                        {"Content-Type": "application/javascript"}
                    )
    ```
4. **实现绕过**

    启动 Mitmproxy 并加载该插件，当访问目标网页时，Mitmproxy 会自动将修改后的本地 `.js` 文件替换远程响应的 `.js` 文件，从而绕过 `disable-devtool`。

### 方法对比

* **第一种方法**：操作相对简单，适合手动调试场景。但如果使用 Selenium 等自动化调试工具，这种方法可能会失效。
* **第二种方法**：虽然操作相对复杂，但可以兼容 Selenium 等自动化调试工具，适合需要自动化操作的场景。
* **第三种方法**：此外，如果网站仅使用 CDN 的 `disable-devtool.js` 文件，还可以通过在安全软件中禁止请求该 URL 来实现绕过。

## 三、重要声明

**再次强调**，以上方法仅供技术探讨和合法的开发调试使用，**切勿用于非法用途**。任何未经授权的绕过行为都可能违反法律法规，导致严重的法律后果。请始终确保您的行为符合法律和道德规范。