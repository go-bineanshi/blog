# 安装

## 1. Macos - brew

### 1.1 安装 rbenv 和 ruby-build

```bash
brew install rbenv
brew install ruby-build
```

### 1.2 配置 rbenv

在终端中执行以下命令来配置 rbenv:

```bash
rbenv init
```

将命令 `eval "$(rbenv init -)"` 添加到文件中 `~/.bash_profile` ，以便在打开终端时自动加载 `rbenv`

## 2. Ubuntu - apt

```bash
sudo sed -i 's@//.*archive.ubuntu.com@//mirrors.ustc.edu.cn@g' /etc/apt/sources.list
sudo sed -i 's/http:/https:/g' /etc/apt/sources.list
```

更新您的包裹清单：

```bash
sudo apt update
```

安装安装 Ruby 所需的依赖项：

```bash
sudo apt install git curl libssl-dev libreadline-dev zlib1g-dev autoconf bison build-essential libyaml-dev libreadline-dev libncurses5-dev libffi-dev libgdbm-dev
```

安装 rbenv:

```bash
curl -fsSL https://github.com/rbenv/rbenv-installer/raw/HEAD/bin/rbenv-installer | bash
```

载入 rbenv:

```bash
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
```

## 3. 安装 ruby

使用 Ruby China 的镜像安装 Ruby。

```bash
git clone https://github.com/andorchen/rbenv-china-mirror.git "$(rbenv root)"/plugins/rbenv-china-mirror
```

罗列出可供安装的 Ruby 版本：

```bash
rbenv install -l
```

安装指定版本的 Ruby:

```bash
rbenv install 2.7.2
```

## 4. 设置全局默认 ruby 版本

```bash
rbenv global 2.7.2
```

## 5. 安装 Bundler

```bash
gem install bundler
```

## 6. 验证安装

```bash
rbenv versions
ruby -v
```

## 7. 查看 gem 源

```bash
gem sources -l
```

## 8. 切换国内源

```bash
gem sources --remove https://rubygems.org/
gem sources --add https://gems.ruby-china.com/
```
