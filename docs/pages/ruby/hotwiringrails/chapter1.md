# 第一章 使用 esbuild 设置应用程序

> 转载自 [Hotwiringgrails](https://book.hotwiringrails.com/chapters)

构建 `Hotwired ATS` 的第一步是使用 `Rails` 应用程序生成器创建新的 `Rails` 应用程序。

在本章中，我们将设置构建现代 `Rails` 应用程序所需的所有基本工具，以便我们可以专注于使用所有新工具。由于本章将主要用于安装和设置，因此我们将经常完成有据可查的安装步骤。这意味着我们在这一章中的进展将比在本书的其余部分更快。

在本章结束时，我们将有一个新的 `Rails 7` 应用程序配置为：

- `Postgres` 作为我们的主要数据库
- [esbuild](https://esbuild.github.io/) 捆绑项目的 `JavaScript`，配置为在您更改代码时自动刷新浏览器。
- [Tailwind](https://tailwindcss.com/) 和 `postcss` 用于设置应用程序的样式。
- [Hotwire stack](https://hotwired.dev/) - `Stimulus` 和 `Turbo` - 用于更快的页面加载 （ `Turbo Drive`）、使用 `Turbo Frames` 进行部分页面更新、响应式页面更新 （` Turbo Streams` ） 和前端交互 （ `Stimulus`）。
- [CableReady](https://cableready.stimulusreflex.com/) && [StimulusReflex](https://docs.stimulusreflex.com/) 以实现更多服务器驱动的前端交互性和响应式页面更新。
- [Mrujs](https://mrujs.com/) 将取代 `Rails/UJS` 的一些功能及其强大的[Cable Car](https://mrujs.com/how-tos/integrate-cablecar)插件。
- 用于主键的 `UUID`，只是因为我喜欢使用 `UUID`。

在本章中，我们将同时设置许多工具。您可能不熟悉所有这些，这完全没关系。请不要觉得有必要开始阅读文档或深入研究任何这些工具。在本书的其余部分，我们将详细了解所有关键部分。

## 设置环境 - Setting up your environment

在开始之前，您需要安装 `Ruby`、`Rails`、`Postgres`、`Redis`、`Node` 和 `Yarn`。

本书是为 `Rails 7` 和 `Ruby 3.2.3` 构建的。如果您是首次设置环境，请确保安装这些版本。

我们将要构建的大部分内容都可以在 `Rails 6.1` 上运行，但您的设置体验会有所不同，您可能会遇到无法解释的差异。如果可能的话;请在阅读本书时使用 `Rails 7`，这样您就可以最大限度地花在代码上的时间，并最大限度地减少您花在追逐奇怪错误上的时间。

如果您还没有设置开发环境，并且使用的是 Mac，那么您的第一步应该是 `rails.new`。使用 Bullet Train 团队的这个脚本应该可以完全配置你的开发环境，并准备好按照本书进行操作。请注意，截至 2022 年 3 月，`rails.new `可能不完全支持 M1 Mac。

如果您使用的是 Linux 或 Windows，GoRails 的 Chris 发布了一些很棒的指南，您可以使用这些指南来启动和运行您的开发环境。

## 使用 `rails new` 创建 `Rails` 应用程序 - Creating a Rails application with rails new

第一步是使用 `rails new` 来生成我们的应用程序。`Rails 7` 默认附带 `Stimulus` 和 `Turbo`。我们可以使用新发布的 `jsbundling-rails` 和 `cssbundling-rails gem` 通过一个命令来安装 `esbuild` 和 `Tailwind`。

```bash
rails new hotwired_ats -T -d postgresql --css=tailwind --javascript=esbuild

cd hotwired_ats

rails db:create
```

- 传入选项跳过安装测试框架 （ -T ）
- 将应用程序配置为使用 `Postgres` 作为数据库 （ -d ）
- 安装 `TailwindCSS` （ --css ）
- 选择 `esbuild` 作为我们的 `JavaScript` 捆绑器 （ --javascript ）

命令运行后，您将创建一个安装了 `Stimulus` 和 `Turbo` 的 `Rails` 应用程序，并且 `esbuild` 和 `Tailwind` 的基础知识将到位。

接下来，我们将对默认的 `Tailwind` 安装进行一些调整，以便我们可以从本书中的其他文件导入 `CSS`。

## 配置 Tailwind - Configure Tailwind

提供的 `cssbundling-rails` 默认节点驱动的 `Tailwind` 安装不允许将其他 `css` 文件导入到我们的应用程序提供给最终用户的主 `application.css` 文件中。幸运的是，我们可以毫不费力地解决此限制。

首先，通过 yarn 安装 postcss-import。

```bash
yarn add postcss-import

touch postcss.config.js
```

然后更新 `postcss.config.js` ：

```js
module.exports = {
  plugins: [
    require("postcss-import"),
    require("tailwindcss"),
    require("autoprefixer"),
  ],
};
```

更新` application.tailwind.css` 以将 `@tailwind` 指令替换为导入，如 `Tailwind` 安装文档中所述：

```css
# app/assets/stylesheets/application.tailwind.css
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
```

完成这些更改后，我们现在可以将任何其他 css 文件导入 `application.tailwind.css` .

我们还将使用 `Tailwind Forms` 插件，我们可以添加：

```bash
yarn add @tailwindcss/forms
```

然后将其添加到 `Tailwind` 配置中 `tailwind.config.js` ：

```js
module.exports = {
  mode: "jit",
  content: [
    "./app/**/*.html.erb",
    "./app/helpers/**/*.rb",
    "./app/javascript/**/*.js",
  ],
  plugins: [require("@tailwindcss/forms")],
};
```

## 更新 `esbuild` 配置 - Update esbuild config

现在我们将创建一个自定义配置来替换 `jsbundling-rails` 提供的默认 `esbuild` 脚本。此自定义配置将：

- 在开发和生产中启用源映射。
- 在生产环境中缩小捆绑包。
- 当资产和视图文件发生更改时，自动重新生成和刷新页面。

所有这些配置更改都是可选的，但这些更改，尤其是在文件更改时自动刷新页面，使开发过程中的工作更轻松。作为奖励，查看为 `esbuild` 创建自定义配置的示例应该可以帮助您在将来使用 `esbuild` 时感觉更舒服。

`gem jsbundling-rails` 提供了开箱即用的最简单的构建。在实践中，您经常需要添加自己的自定义配置才能使用源映射和插件。

首先，我们将使用 `chokidar` 来启用观看和自动刷新

```bash
yarn add chokidar -D

touch esbuild.config.js
```

接下来，我们将 `esbuild.config.js` 这样填写：

```js
#!/usr/bin/env node

const esbuild = require("esbuild");
const path = require("path");

// Add more entrypoints, if needed
const entryPoints = ["application.js"];
const watchDirectories = [
  "./app/javascript/**/*.js",
  "./app/views/**/*.html.erb",
  "./app/assets/stylesheets/*.css",
  "./app/assets/stylesheets/*.scss",
];

const config = {
  absWorkingDir: path.join(process.cwd(), "app/javascript"),
  bundle: true,
  entryPoints: entryPoints,
  outdir: path.join(process.cwd(), "app/assets/builds"),
  sourcemap: true,
};

async function rebuild() {
  const chokidar = require("chokidar");
  const http = require("http");
  const clients = [];

  http
    .createServer((req, res) => {
      return clients.push(
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Access-Control-Allow-Origin": "*",
          Connection: "keep-alive",
        })
      );
    })
    .listen(8082);

  let result = await esbuild.build({
    ...config,
    incremental: true,
    banner: {
      js: ' (() => new EventSource("http://localhost:8082").onmessage = () => location.reload())();',
    },
  });

  chokidar.watch(watchDirectories).on("all", (event, path) => {
    if (path.includes("javascript")) {
      result.rebuild();
    }
    clients.forEach((res) => res.write("data: update\n\n"));
    clients.length = 0;
  });
}

if (process.argv.includes("--rebuild")) {
  rebuild();
} else {
  esbuild
    .build({
      ...config,
      minify: process.env.RAILS_ENV == "production",
    })
    .catch(() => process.exit(1));
}
```

这里有很多代码;让我们暂停一下，分解一下。

在函数中 `reload` ，我们首先在端口 8082 上创建一个服务器，并使用 `esbuild` 构建我们的 `JavaScript`，并设置了 `banner` 配置选项。

此选项将 `JavaScript` 插入到构建的文件中，该文件将打开与端口 8082 上的 `Web` 服务器的新 `EventSource` 连接， `reload` 并在每次收到消息时触发。

然后，我们将 `chokidar` 配置为监视我们关心的目录，并且每次检测到更改时，`chokidar` 都会向 `EventSource` 服务器广播一条新消息。这将 `reload()` 触发所有订阅的浏览器，并告诉 `esbuild` 如果检测到的更改位于 `javascript` 目录中，则重新构建 `JavaScript`。

在文件的末尾，`if/else` 块只是检查传递给 `esbuild` 的参数，并在我们刚刚审查的 `rebuild` 函数和将在生产中使用的常规 `esbuild.build()` 函数之间进行选择，因为我们不会监视生产环境中的实时变化。

## 更新 `bin/dev` 脚本 - Update bin/dev Scripts

现在我们已经更新了 `Tailwind` 和 `esbuild` 配置，下一步是更新脚本 `package.json` 部分以使用新配置。

```json
"scripts": {
  "build": "node esbuild.config.js",
  "build:css": "tailwindcss --postcss -i ./app/assets/stylesheets/application.tailwind.css -o ./app/assets/builds/application.css"
},
```

本节 `package.json` 定义了我们可以从命令行调用的脚本， `yarn` 但我们不需要手动运行这些脚本。取而代之的是，`Rails` 附带了一个脚本， `bin/dev` 该脚本调用 `Procfile.dev` .当我们想要改变什么 `bin/dev` 时， `Procfile.dev` 通常是地方。更新 `Procfile.dev` 以将 `--rebuild` 参数传递给 `yarn build` 命令：

```bash
web: bin/rails server -p 3000
js: yarn build --rebuild
css: yarn build:css --watch
```

当您准备好启动应用程序时，请使用 `bin/dev` to 启动 `rails` 服务器并同时构建 `JavaScript` 和 `CSS。`

接下来，我们将安装 `CableReady`、`StimulusReflex` 和 `Mrujs`，以填补我们需要比 `Turbo` 提供的更多内容时的空白。

## 安装 CableReady、StimulusReflex 和 Mrujs

`StimulusReflex` 的安装过程，我们将一起手动完成，这是由 `Rails` 的 `JavaScript` 选项的改动引起的临时要求。在不久的将来，我们可以期待 `StimulusReflex` 有一个自动安装程序，可以与 `Rails 7` 和 `esbuild` 无缝协作。幸运的是，在此期间可以进行手动设置。

在本节过程中，将安装并配置 `StimulusReflex` 和 `CableReady` 以使用软件包的最新预发布版本。这些预发布版本建议维护人员用于生产环境。尽管有预发布标签，但 `CableReady` 和 `StimulusReflex` 的预发布版本经过了充分的测试和稳定。

请注意，我们几乎是直接从本节的 StimulusReflex 文档开始工作的。

```bash
bundle add stimulus_reflex --version 3.5.0.pre8
yarn add stimulus_reflex@3.5.0-pre8
rails dev:cache
rails generate stimulus_reflex:initializer
```

然后更新 `app/javascript/controllers/application.js` 以初始化 `StimulusReflex`:

```js
import { Application } from "@hotwired/stimulus";
import StimulusReflex from "stimulus_reflex";

const application = Application.start();

// Configure Stimulus development experience
application.warnings = true;
application.debug = false;
window.Stimulus = application;

StimulusReflex.initialize(application, { isolate: true });

export { application };
```

接下来，我们需要在本地开发中更新缓存和会话存储。更新 `config/environments/development.rb` ：

```rb
# Replace config.cache_store :memory_store with this line
config.cache_store = :redis_cache_store, { url: ENV.fetch("REDIS_URL") { "redis://localhost:6379/1" } } # You may need to set a password here, depending on your local configuration.

# Add this line
config.session_store :cache_store, key: "_sessions_development", compress: true, pool_size: 5, expire_after: 1.year
```

当您使用 `esbuild` 创建新的 `Rails` 应用程序时，默认情况下不会配置 `ActionCable` 的 `JavaScript，因此我们接下来将添加它。StimulusReflex、CableReady` 和 `Turbo Streams` 都依赖于正确配置的 `ActionCable`。

```bash
mkdir app/javascript/channels
touch app/javascript/channels/consumer.js
```

并填写 `consumer.js` ：

```js
import { createConsumer } from "@rails/actioncable";

export default createConsumer();
```

然后，将 `actioncable` 元标记添加到应用程序布局中。在 `app/views/layouts/application.html.erb`:

```erb
<head>
  <title>Hotwired ATS</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <%= csrf_meta_tags %>
  <%= csp_meta_tag %>
  <%= action_cable_meta_tag %>

  <%= stylesheet_link_tag "application", "data-turbo-track": "reload" %>
  <%= javascript_include_tag "application", "data-turbo-track": "reload", defer: true %>
</head>
```

最后，`StimulusReflex` 依赖于 `stimulus` 包，而不是 `@hotwired/stimulus` 包，后者是具有不同名称的相同包。为了使 `StimulusReflex` 正常工作，我们需要更新 `package.json` 以引用这两个包：

```json
"@hotwired/stimulus": "^3.1.0",
"stimulus": "npm:@hotwired/stimulus"
```

交换软件包后，将安装 `StimulusReflex` 和 `CableReady`。接下来我们将安装 `Mrujs`。再次从您的终端：

```bash
yarn add mrujs
```

像这样更新 `app/javascript/application.js` ：

```js
import "@hotwired/turbo-rails";
import "./controllers";
import consumer from "./channels/consumer";
import CableReady from "cable_ready";
import mrujs from "mrujs";
import { CableCar } from "mrujs/plugins";

mrujs.start({
  plugins: [new CableCar(CableReady)],
});
```

此时，我们的应用程序已准备好使用 `Turbo`、`StimulusReflex`、`CableReady` 和 `Mrujs`，并通过插件支持 `CableReady` 的 `JSON` 序列化器 `CableCar`。我们几乎完成了设置步骤，并准备开始构建功能。

让我们通过配置我们的应用程序以将 `UUID` 用于主键并创建一个空的仪表板页面来结束本章，这样当我们启动应用程序时，我们可以看到除了默认的 `Rails` 欢迎屏幕之外的内容。

## 默认使用 `uuids`

要使用 `uuid`，我们需要启用 `pgcrypto Postgres` 扩展，我们可以通过数据库迁移来完成：

```bash
rails g migration EnableUUID
```

更新生成的迁移文件：

```rb
class EnableUuid < ActiveRecord::Migration[7.0]
  def change
    enable_extension 'pgcrypto'
  end
end
```

从终端运行此迁移以启用扩展：

```bash
rails db:migrate
```

接下来，我们将添加一个配置文件来配置 `Rails` 模型生成器，以自动使用 `uuids` 作为新模型的主键。

```bash
touch config/initializers/generators.rb
```

并填写该文件：

```rb
Rails.application.config.generators do |g|
  g.orm :active_record, primary_key_type: :uuid
end
```

由于按主键对记录进行排序在记录不是按顺序排序时不是很有用，因此我们可以告诉 `ActiveRecord` 在未指定顺序时使用 `created_at` 记录进行排序。

```rb
class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class
  self.implicit_order_column = 'created_at'
end
```

## 创建一个空仪表板

在本书的末尾，我们将构建一个包含两个 `StimulusReflex` 驱动的图表的仪表板。在前面的九章中，我们将创建一个占位符 `DashboardController` ，用作默认的根路由，并存储我们在 UI 中还没有位置的链接。

要创建 `Dashboard` 控制器，请从您的终端使用 `Rails` 控制器生成器：

```bash
rails g controller Dashboard show
```

这将创建一个 `DashboardController`， `app/controllers` 其中定义了单个 `show` 操作，并在 中 `app/views/dashboards` 定义了相应的 `show.html.erb` 视图。

转到路由文件，并将根路由设置为仪表板的 show 操作：

```rb
# config/routes.rb
Rails.application.routes.draw do
  get 'dashboard/show'
  root to: 'dashboard#show'
end
```

启动 `bin/dev` `Rails` 应用程序并前往` localhost:3000`。如果一切顺利，您应该会看到如下所示的页面：
