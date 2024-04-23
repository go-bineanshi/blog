# Nginx - ubuntu 20.04

## 1. 卸载系统默认 nginx

### 1.1 删除 nginx，–purge 包括配置文件

```bash
sudo apt --purge remove nginx nginx-common nginx-core
```

### 1.2 自动移除全部不使用的软件包

```bash
sudo apt autoremove
```

### 1.3 罗列出与 nginx 相关的软件

```bash
dpkg --get-selections | grep nginx
```

## 2. 安装(推荐源码安装便于升级及自定义组件)

### 2.1 去 [nginx 官网下载](https://nginx.org/en/download.html) nginx 包，建议下载稳定版本

```bash
wget https://nginx.org/download/nginx-1.24.0.tar.gz
```

### 2.2 解压

```bash
tar -zxvf nginx-1.24.0.tar.gz
```

### 2.3 安装依赖

```bash
sudo apt install openssl libssl-dev libpcre3 libpcre3-dev zlib1g-dev make

```

### 2.4 编译

```bash
cd nginx-1.24.0

./configure --prefix=/usr/share/nginx \
    --modules-path=/usr/lib/nginx/modules \
    --with-http_ssl_module  \
    --http-client-body-temp-path=/opt/nginx/temp/client_body_temp   \
    --http-proxy-temp-path=/opt/nginx/temp/proxy_temp   \
    --http-fastcgi-temp-path=/opt/nginx/temp/fastcgi_temp   \
    --http-uwsgi-temp-path=/opt/nginx/temp/uwsgi_temp   \
    --http-scgi-temp-path=/opt/nginx/temp/scgi_temp \
    --with-http_gzip_static_module
```

### 2.5 安装

```bash
make && sudo make install
```

### 2.6 配置

## 3.[命令](https://nginx.org/en/docs/switches.html)

### 3.1 启动

```bash
/opt/nginx/sbin/nginx [-c /opt/nginx/conf/nginx.conf]
```

参数 "-c" 指定了配置文件的路径，如果不加 "-c" 参数，Nginx 会默认加载其安装目录的 conf 子目录中的 nginx.conf 文件。

### 3.2 停止

```bash
/opt/nginx/sbin/nginx -s stop # 强制退出
/opt/nginx/sbin/nginx -s quit # 优雅退出
```

### 3.3 重启

```bash
/opt/nginx/sbin/nginx -s reload
```

### 3.4 查看进程

```bash
ps -ef | grep nginx
```

### 3.5 查看日志

```bash
tail -f /opt/nginx/logs/error.log # 错误日志
tail -f /opt/nginx/logs/access.log # 访问日志
tail -f /opt/nginx/logs/nginx.pid # 进程日志
```

### 3.6 查看版本

```bash
/opt/nginx/sbin/nginx -v
```

### 3.7 测试配置文件

```bash
/opt/nginx/sbin/nginx -t -c /opt/nginx/conf/nginx.conf
```
