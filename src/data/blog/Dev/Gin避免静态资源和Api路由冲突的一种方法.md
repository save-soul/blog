---
title: Gin避免静态资源和Api路由冲突的一种方法
pubDatetime: 2025-02-11T14:02:06+8:00
description: Gin避免静态资源和Api路由冲突的一种方法
category: 开发
tags: 
- Go语言
- Gin
- Web
---
通常情况下，以下代码编译时会报错：

```go
api := engine.Group("/api")
{
    api.GET("/hello", func(ctx *gin.Context) {
        //省略
    })
}
ser.Static("/","/static")
```

因为存在路由冲突，可通过下述方法解决。

<!-- more -->

```go
func routeSplitMiddleware() gin.HandlerFunc {
    return func(ctx *gin.Context) {
        if strings.HasPrefix(ctx.Request.URL.Path, "/api") {
            ctx.Next()
            return
        }
        if _, err := os.Stat(config.GlobalConfig.Static.Dir + ctx.Request.URL.Path); os.IsNotExist(err) {
            ctx.File("./static/404.html")
            ctx.Abort()
            return
        }
        ctx.File("./static" + ctx.Request.URL.Path)
        ctx.Abort()
    }
}
```

```go
engine.Use(routeSplitMiddleware())
//API路由组
api := engine.Group("/api")
{
    api.GET("/hello", func(ctx *gin.Context) {
        //省略
    })
}

// 处理Api 404
engine.NoRoute(func(c *gin.Context) {
    c.JSON(http.StatusNotFound, gin.H{"error": "404"})
})
```

​`routeSplitMiddleware`​中间件可以将非`/api`​开头的请求返回静态资源，如果静态资源不存在，则路由重定向到404.html；如果请求URL开头为`/api`​，则请求后面的`api`​路由，相应路由如果不存在，则返回404错误消息。

以上，Gin静态资源和Api路由冲突的问题得到解决。
