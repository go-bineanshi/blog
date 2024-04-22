# Rails

## 1. 安装

```bash
gem install rails
```

## 注：PS

默认的 bundle 从外网下载，会出现 unkownhost 的问题，添加一个国内源即可

```bash
bundle config mirror.https://rubygems.org https://gems.ruby-china.org
```

## 2. 创建项目 & 启动

```bash
rails new blog
cd blog
rails server
```

控制台输出：

![rails server](https://blog.qiniu.g-bill.club/blog/202404191649042.png)

浏览器访问 [localhost:3000](http://localhost:3000)

![rails3000](https://blog.qiniu.g-bill.club/blog/202404191651070.png)

## 3. 部署

### 3.1 基于 puma

### 3.2 基于 passenger
