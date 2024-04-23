# Rails

## 1. 安装

```bash
gem install rails
```

## 注：PS

默认的 bundle 从外网下载，会出现 unkownhost 的问题，添加一个国内源即可

```bash
bundle config mirror.https://rubygems.org https://gems.ruby-china.com
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

> ps: 参考 passenger [官方文档-老版本系统](https://www.phusionpassenger.com/docs/advanced_guides/install_and_upgrade/nginx/install/oss/jammy.html) [官方文档-新版本系统](https://www.phusionpassenger.com/docs/tutorials/deploy_to_production/installations/oss/ownserver/ruby/nginx/)

#### 3.2.1 安装 passenger

```bash

sudo apt-get install -y dirmngr gnupg
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 561F9B9CAC40B2F7
sudo apt-get install -y apt-transport-https ca-certificates

# 此处根据系统 ubuntu 版本选择
sudo sh -c 'echo deb https://oss-binaries.phusionpassenger.com/apt/passenger jammy main > /etc/apt/sources.list.d/passenger.list'

sudo apt-get update


sudo apt-get install -y libnginx-mod-http-passenger
```

#### 注： nginx 源码安装时

```bash
./configure --prefix=/usr/share/nginx \
    --modules-path=/usr/lib/nginx/modules \
    --with-http_ssl_module  \
    --http-client-body-temp-path=/opt/nginx/temp/client_body_temp   \
    --http-proxy-temp-path=/opt/nginx/temp/proxy_temp   \
    --http-fastcgi-temp-path=/opt/nginx/temp/fastcgi_temp   \
    --http-uwsgi-temp-path=/opt/nginx/temp/uwsgi_temp   \
    --http-scgi-temp-path=/opt/nginx/temp/scgi_temp \
    --with-http_gzip_static_module \
    --add-module=$(passenger-config --nginx-addon-dir)  # 载入passenger 模块
```

#### 3.2.2 启用 nginx module 并重启 nginx

```bash
if [ ! -f /usr/share/nginx/modules-enabled/50-mod-http-passenger.conf ]; then sudo ln -s /usr/share/nginx/modules-available/mod-http-passenger.load /usr/share/nginx/modules-enabled/50-mod-http-passenger.conf ; fi
sudo ls /usr/share/nginx/conf.d/mod-http-passenger.conf
```

或

```bash
# /usr/share/nginx/conf/nginx.conf

passenger_root /usr/lib/ruby/vendor_ruby/phusion_passenger/locations.ini;
passenger_ruby /usr/bin/passenger_free_ruby;
```

#### 3.2.3 验证 passenger

```bash
sudo /usr/bin/passenger-config validate-install
```

![passenger-config](https://blog.qiniu.g-bill.club/blog/202404221331544.png)

#### 3.2.4 查看 passenger 内存占用情况

```bash
sudo /usr/sbin/passenger-memory-stats
```

![passenger-memory-stats](https://blog.qiniu.g-bill.club/blog/202404221330548.png)

#### 3.2.5 运行 passenger 服务

```bash
bundle exec passenger start
```

#### 3.2.6 停止 passenger 服务

```bash
bundle exec passenger stop
```

#### 3.2.7 部署

```bash
# Gemfile
gem 'passenger', '~> 6.0.20'
```

```bash
bundle install
```

```bash
# nginx.conf

...
http {
    ...
    passenger_root /usr/lib/ruby/vendor_ruby/phusion_passenger/locations.ini;
    #passenger_ruby /home/ubuntu/.rbenv/shims/ruby;  ## 1）
    ...

    server {
        ...

        root /home/ubuntu/blog/public;
        passenger_ruby /home/ubuntu/.rbenv/shims/ruby;  ## 2）
        passenger_enabled on;
        passenger_app_env production;
        passenger_preload_bundler on;
    }

    location ~ ^/assets {
        expires max;
        gzip_static on;
    }
}
# 1） 或者 2）或者也可以同时存在
```

#### 3.2 注

由于 passenger 开源版限制 rails production 日志存储在 nginx 的错误日志中
在 config/environments/production.rb 中修改日志存储位置
![production](https://blog.qiniu.g-bill.club/blog/202404221705040.png)

#### 3.3 其他配置[参考](https://www.phusionpassenger.com/library/config/nginx/reference/)
