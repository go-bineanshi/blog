# 第二章 基于 Devise 的用户和帐户

> 转载自 [Hotwiringgrails](https://book.hotwiringrails.com/chapters)

在本章中，我们将允许用户使用 `Devise` 登录和注销应用程序。在以前的 `Rails` `版本中，Devise` 是即插即用的;然而，以 `Turbo` 为默认的 `Rails 7` 的发布，至少目前是这样，这使得 `Devise` 的设置过程有点冒险。

将来，一旦 `Devise` 添加对 `Turbo` 的完全支持，通常简单的 `Devise` 设置过程将恢复。现在，我们将一起解决棘手的部分。

在本章中，我们还将花一些时间创建我们的第一个激励控制器来支持 `toast` 样式的 `Flash` 消息。这将是我们第一次看到 `Hotwire stack` 的一部分，也是热身我们的 `JavaScript` 肌肉的好机会。

在本章的最后，我们将添加一个基本的应用程序布局，为应用程序的关键功能（职位发布和应用程序）做准备，我们将在下一章开始构建这些功能。

在开始之前，请注意，您需要在本地运行 `Redis`。否则，可能会遇到类似此处描述的错误。使用 `redis-cli ping` . 检查 `redis` 是否正在从您的终端运行。

## 添加客户模型

我们将从添加一个基本 `Account` 模型开始。

我们正在为业务用户构建一个应用程序，因此我们可以预期多个用户需要共享对相同数据的访问权限。该 `Account` 模型是我们如何将这些用户及其职位发布和申请人分组到一个实体下。

稍后，我们将使用该 `Account` 模型构建面向公众的职位列表和用户管理界面。目前，它只是一个简单的单属性模型。

使用 Rails 模型生成器创建 Account 模型并迁移数据库。

```bash
rails g model Account name:string
rails db:migrate
```

使用简单验证更新帐户，以确保存在名称：

```rb
# app/models/account.rb
class Account < ApplicationRecord
  validates_presence_of :name
end
```

## 安装 Devise

请注意，本书是在 `Devise` 添加对 `Hotwire/Turbo` 的原生支持之前编写的。您不再需要跳过我们在本章中跳过的所有障碍，例如使用宝石的分支和覆盖控制器。感谢 `Devise` 团队的辛勤工作，您可以像往常一样安装 `Devise`，而无需使用我的 `fork`，也无需制作自己的控制器。我在本章中概述的步骤仍然可以正常工作，但不再需要它们。

`Devise` 仍然是 `Rails-land` 中最受欢迎的身份验证解决方案，这是有充分理由的。虽然有些人鼓励你建立自己的身份验证，而 `Rails 7` 也让这条路线变得更容易，但我仍然更喜欢让 `Devise` 做繁重的工作，所以这就是我们将要采取的路线。

`如前所述，Devise` 和支持 `Turbo` 的 `Rails 7` 还不能很好地协同工作。因此，我们将在应用程序中使用 Devise 的分支。这个分支引入了重要的 PR 来支持 `Devise` 中的 Rails 7 和 `Turbo`。使用这个叉子应该不需要太久了，但它是兼容 `Turbo` 的 `Devise` 版本的简单解决方案，同时我们等待官方 `Devise` 包赶上。

```
# Gemfile

gem 'devise', branch: 'rails_7', github: 'DavidColby/devise'
```

```bash
bundle install
```

接下来，从终端运行 `Devise` 安装任务，并创建一个用户模型：

```bash
rails generate devise:install
rails g devise:views
rails g devise User account:references first_name:string last_name:string
```

更新生成的迁移，以确保使用 `uuid` 列类型正确添加帐户引用：

```rb
# db/migrate/[timestamp]_create_devise_users.rb

# frozen_string_literal: true

class DeviseCreateUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :users, id: :uuid do |t|
      ## Database authenticatable
      t.string :email,              null: false, default: ""
      t.string :encrypted_password, null: false, default: ""

      ## Recoverable
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      ## Rememberable
      t.datetime :remember_created_at

      ## Trackable
      # t.integer  :sign_in_count, default: 0, null: false
      # t.datetime :current_sign_in_at
      # t.datetime :last_sign_in_at
      # t.string   :current_sign_in_ip
      # t.string   :last_sign_in_ip

      ## Confirmable
      # t.string   :confirmation_token
      # t.datetime :confirmed_at
      # t.datetime :confirmation_sent_at
      # t.string   :unconfirmed_email # Only if using reconfirmable

      ## Lockable
      # t.integer  :failed_attempts, default: 0, null: false # Only if lock strategy is :failed_attempts
      # t.string   :unlock_token # Only if unlock strategy is :email or :both
      # t.datetime :locked_at

      t.references :account, foreign_key: true, type: :uuid
      t.string :first_name
      t.string :last_name

      t.timestamps null: false
    end

    add_index :users, :email,                unique: true
    add_index :users, :reset_password_token, unique: true
    # add_index :users, :confirmation_token,   unique: true
    # add_index :users, :unlock_token,         unique: true
  end
end
```

迁移数据库以创建 `Devise` 支持的 `Users` 表。

```bash
rails db:migrate
```

并更新 `config/environments/development.rb` 以设置默认邮件 `URL`，如 `Devise` 自述文件中所述。

```rb
config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }
```

接下来，更新 `config/routes.rb` 以为经过身份验证的用户和访客定义不同的根路由。

```rb
Rails.application.routes.draw do
  devise_for :users
  get 'dashboard/show'

  authenticated :user do
    root to: 'dashboard#show', as: :user_root
  end

  devise_scope :user do
    root to: 'devise/sessions#new'
  end
end
```

在这里，我们删除了将所有用户发送到仪表板的先前根目录，并将其替换为两个根路由，一个适用于经过身份验证的用户，另一个适用于匿名用户访问应用程序时。

## 构建注册流程

当用户在 `Hotwired ATS` 中注册帐户时，我们需要创建一个与该用户 `Account` 关联的帐户，并且我们希望该帐户具有有意义的名称。在 B2B 应用程序中，公司名称通常是最有意义的标识符，因此在注册期间捕获此信息总是很有帮助的。为了捕获这些额外的信息，我们需要 `Devise` 注册表单比默认的 `Devise` 表单更复杂。

我们的目标是允许用户在表单上输入他们的公司名称和电子邮件地址。当他们提交表单时，我们的服务器将创建一个帐户和与该帐户关联的用户。

在我们开发此功能的同时，我们还将通过确保在注册失败时呈现表单错误来修补 `Devise` 的 `Turbo` 兼容性中的一个小漏洞。

首先，从您的终端运行 `Devise` 控制器生成器：

```bash
rails g devise:controllers users -c=registrations
```

这将生成一个 Devise 注册控制器，我们可以 `app/controllers/users/registrations_controller.rb` 覆盖它，我们将使用以下代码来执行此操作：

```rb
# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  before_action :configure_sign_up_params, only: [:create]

  def new
    build_resource
    resource.build_account
    yield resource if block_given?
    respond_with resource
  end

  def create
    build_resource(sign_up_params)

    resource.save
    yield resource if block_given?
    if resource.persisted?
      if resource.active_for_authentication?
        set_flash_message! :notice, :signed_up
        sign_up(resource_name, resource)
        respond_with resource, location: after_sign_up_path_for(resource)
      else
        set_flash_message! :notice, :"signed_up_but_#{resource.inactive_message}"
        expire_data_after_sign_in!
        respond_with resource, location: after_inactive_sign_up_path_for(resource)
      end
    else
      clean_up_passwords resource
      set_minimum_password_length
      # set status to unprocessable_entity so form errors are rendered
      respond_with resource, status: :unprocessable_entity
    end
  end

  protected

  def configure_sign_up_params
    devise_parameter_sanitizer.permit(:sign_up, keys: [
      account_attributes: [:id, :name]
    ])
  end

  def after_sign_up_path_for(resource)
    root_path
  end
end
```

这里发生了很多事情，其中大部分都是内置的 `Devise` 代码。让我们放大一些重要的部分：

```rb
def configure_sign_up_params
  devise_parameter_sanitizer.permit(:sign_up, keys: [
    account_attributes: [:name]
  ])
end
```

在这里，我们用自己的方法覆盖了 `Devise` 允许的参数方法，因此我们可以从提交的注册表单中将帐户名称属性列入白名单。

```rb
def new
  build_resource
  resource.build_account
  yield resource if block_given?
  respond_with resource
end
```

在新操作中，我们在呈现注册表单之前为用户初始化一个 `Account` 对象 （ `resource.build_account` ）（在 `Devise` 术语中称为 ）。

```rb
respond_with resource, status: :unprocessable_entity
```

最后一个重要更改是确保 `create` 操作中的验证错误使用 `unprocessable_entity` 状态代码进行响应。`Turbo` 需要此状态代码才能正确处理故障。没有它，用户将不会收到有关注册尝试失败的任何反馈。

随着注册控制器的更新，我们现在需要再次更新我们的路由，以告诉 `Devise` 通过我们的自定义控制器路由注册请求：

```rb
devise_for :users,
  path: '',
  controllers: {
    registrations: 'users/registrations'
  },
  path_names: {
    sign_in: 'login',
    password: 'forgot',
    confirmation: 'confirm',
    sign_up: 'sign_up',
    sign_out: 'signout'
  }
# Snip
```

在这里，我们还借此机会定义了自定义 `path_names` ，因此我们的 `url` 和 `url` 帮助程序方法更容易阅读。

现在自定义控制器已就位，让我们转向注册表单演示。

在以下位置 `app/views/devise/registrations/new.html.erb` 添加基本注册页面布局：

```erb
<div class="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-lg">
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
      Sign up for Hotwired ATS
    </h2>
    <p class="mt-2 text-center text-sm text-gray-600 max-w">
      Already have an account?
      <%= link_to "Sign in instead", new_user_session_path, class: "font-medium text-blue-600 hover:text-blue-800" %>
    </p>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
    <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <%= form_for(resource, as: resource_name, url: registration_path(resource_name), html: { class: "space-y-6" }) do |form| %>
        <%= render "devise/shared/error_messages", resource: resource %>

        <%= form.fields_for :account do |account_fields| %>
          <div class="form-group">
            <%= account_fields.label :name, "Company Name" %>
            <%= account_fields.text_field :name, autofocus: true %>
          </div>
        <% end %>

        <div class="form-group">
          <%= form.label :email %>
          <%= form.email_field :email, autocomplete: "email" %>
        </div>

        <div class="form-group">
          <%= form.label :password %>
          <%= form.password_field :password, autocomplete: "new-password" %>
          <% if @minimum_password_length %>
            <p class="text-xs text-gray-500 mt-1 text-right">at least 6 characters</p>
          <% end %>
        </div>

        <div class="form-group">
          <%= form.label :password_confirmation %>
          <%= form.password_field :password_confirmation, autocomplete: "new-password" %>
        </div>

        <div>
          <%= form.button "Sign up", class: "btn-primary w-full", data: { disable_with: "Signing up" } %>
        </div>
      <% end %>
    </div>
  </div>
</div>
```

这只是常规的 HTML 和 ERB，应用了一些 `Tailwind` 类。真正需要注意的一点是：

```erb
<%= form.fields_for :account do |account_fields| %>
  <div class="form-group">
    <%= account_fields.label :name %>
    <%= account_fields.text_field :name, autofocus: true %>
  </div>
<% end %>
```

本[fields_for](https://guides.rubyonrails.org/form_helpers.html#understanding-parameter-naming-conventions-the-fields-for-helper)部分是我们如何捕获帐户数据以及用户数据。

构建表单并实现自定义控制器后，注册过程的最后一步是配置模型之间 `Accounts` 和 `Users` 模型中的关联。

在 `app/models/account.rb`

```rb
class Account < ApplicationRecord
  validates_presence_of :name

  has_many :users, dependent: :destroy
end
```

然后在模型中 `User` ：

```rb
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  belongs_to :account
  accepts_nested_attributes_for :account
end
```

有了这些关系，我们现在可以前往 `http://localhost:3000/sign_up` 并创建一个帐户。我们还可以从 `http://localhost:3000/login` 登录现有帐户。

为了使 Devise 与 Turbo 和 Rails 7 兼容，我们需要调整注销功能。默认情况下，当用户注销时，Devise 会返回一个 204 响应代码，Turbo Drive 不知道如何正确处理该代码。

要解决此问题，我们需要覆盖 `Devise` 的默认 `SessionsController` 值。

```rb
class Users::SessionsController < Devise::SessionsController
  def destroy
    super do
      return redirect_to root_path
    end
  end
end
```

在这里，我们只覆盖该 `destroy` 操作，这将允许其余的会话操作使用默认的 Devise 操作。在操作中 `destroy` ，我们重定向到用户注销 `root_path` 后，Turbo Drive 可以很好地处理。

这里描述了这种技术，并且与本节的大部分内容一样，一旦 Devise 有时间赶上 Turbo，将来（希望）将不需要。

与自定义注册控制器一样，我们需要更新路由以使用自定义会话控制器：

```rb
controllers: {
  registrations: 'users/registrations',
  sessions: 'users/sessions',
},
```

我们将添加注销按钮，以便在本章后面查看此更改的运行情况。如果现在要测试它，可以在仪表板显示页面添加一个临时注销按钮：

```erb
# app/views/dashboard/show.html.erb
<%= button_to "Sign out", destroy_user_session_path, method: :delete %>
```

## 表单样式

对 `Tailwind` 的一个常见批评是标记中可能存在类汤，尤其是对于输入和按钮等元素，这些元素通常需要应用许多 `Tailwind` 类。

避免类汤的一种方法是创建我们自己的自定义类，即 `apply Tailwind` 类。这为我们提供了整洁的标记，同时继续在内部使用 `Tailwind` 的类

```bash
touch app/assets/stylesheets/forms.css
```

```css
# app/assets/stylesheets/forms.css @layer utilities {
  .btn {
    @apply px-8 py-2 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-sm;
  }
}
.btn-primary {
  @apply btn bg-blue-500 hover:bg-blue-700 text-white focus:ring-blue-500;
}
.btn-primary-outline {
  @apply btn border border-blue-500 text-blue-700 hover:bg-blue-700 hover:text-white focus:ring-blue-700;
}
.checkbox-group label {
  @apply ml-2 block font-medium text-gray-700 cursor-pointer;
}
.checkbox-group input {
  @apply h-4 w-4 rounded bg-white text-blue-500 border-gray-200 rounded-sm text-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300;
}
.form-group label {
  @apply block font-medium text-gray-700 cursor-pointer;
}
.form-group input,
.form-group select {
  @apply appearance-none w-full max-w-prose bg-white text-gray-700 border-gray-200 rounded-sm focus:ring-1 focus:ring-blue-300 focus:border-blue-300;
}
.form-group label.is-invalid {
  @apply text-red-500;
}
.form-group input.is-invalid {
  @apply border-red-500 focus:ring-red-600 focus:border-red-600;
}
.form-group input[type="file"]::file-selector-button {
  @apply btn bg-white border border-blue-500 text-blue-700 hover:bg-blue-700 hover:text-white focus:ring-blue-700 outline-none text-sm shadow-none;
}
```

在这里，我们使用该 `@apply` 指令使用 Tailwind 的内置类构建默认样式。

这是特定于 Tailwind 的功能，对于我们正在构建的内容并不是特别重要。不要过分强调这些东西的内部运作！

虽然我们可以使用常规的 CSS 规则设置所有内容的样式，但如果我们以后决定在整个应用程序中重新定义配色方案或大小规则，则使用 `@apply` 是有用的。

由于我们正在使用类似 `text-gray-700` 的东西，如果我们以后更改颜色 `gray-700` 是什么，我们不需要更改表单样式，它们将正常工作。

要使这些新类生效，我们需要将新 `forms.css` 文件导入到 `application.tailwind.css` ：

```css
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
@import "forms.css";
```

前往注册页面，您应该会看到一个漂亮的表单，其中应用了我们的新表单样式。

我们可以在登录页面上重用这些样式： `app/views/devise/sessions/new.html.erb`

```erb
<div class="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-lg">
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
      Sign in to Hotwired ATS
    </h2>
    <p class="mt-2 text-center text-sm text-gray-600 max-w">
      Need an account?
      <%= link_to "Sign up for free", new_user_registration_path, class: "font-medium text-blue-600 hover:text-blue-500" %>
    </p>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
    <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <%= form_for(resource, as: resource_name, url: session_path(resource_name), html: { class: "space-y-6" }) do |form| %>
        <div class="form-group">
          <%= form.label :email %>
          <div class="mt-1">
            <%= form.email_field :email, autofocus: true, autocomplete: "email" %>
          </div>
        </div>

        <div class="form-group">
          <%= form.label :password %>
          <div class="mt-1">
            <%= form.password_field :password, autocomplete: "current-password" %>
          </div>
        </div>

        <% if devise_mapping.rememberable? %>
          <div class="flex items-center justify-between">
            <div class="flex items-center justify-baseline checkbox-group">
              <%= form.check_box :remember_me %>
              <%= form.label :remember_me %>
            </div>

            <div class="text-sm">
              <%= link_to "Forgot your password?", new_user_password_path, class: "font-medium text-blue-600 hover:text-blue-500" %>
            </div>
          </div>
        <% end %>

        <div>
          <%= form.button "Sign in", class: "btn-primary w-full", data: { disable_with: "Signing in" } %>
        </div>
      <% end %>
    </div>
  </div>
</div>
```

现在让我们处理 `Flash` 消息，这样我们就可以在请求完成后与用户进行通信。

## 添加 Flash 消息

在我们的应用程序中，我们将 `Flash` 消息呈现为 `toast`，它们短暂地出现在屏幕的右下角，然后消失
我们将 `flash` 消息用于用户可以快速读取和处理的瞬态消息。

我们正在制作的吐司改编自美妙的顺风刺激成分。此库提供使用 `Stimulus` 和 `Tailwind` 构建的常见 UI 组件。我们可以直接使用这个库中的警报组件，但我们在这里学习，并将尽可能编写我们自己的激励控制器。

首先，从终端创建一个 `shared` 目录和 `flash` 部分：

```bash
mkdir app/views/shared
touch app/views/shared/_flash.html.erb
```

并更新闪光灯部分：

```erb
<div class="fixed inset-x-0 -bottom-32 flex items-end justify-right px-4 py-6 sm:p-6 justify-end z-50 pointer-events-none">
  <div class="max-w-sm w-full h-24 shadow-lg rounded px-4 py-3 rounded relative border-l-4 text-white pointer-events-auto <%= flash_class(level) %>">
    <div class="p-2">
      <div class="flex items-start">
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p class="text-sm leading-5">
            <%= content %>
          </p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button class="inline-flex text-white focus:outline-none focus:text-gray-300 transition ease-in-out duration-150">
            <%= inline_svg_tag 'close.svg', class: 'h-4 w-4 inline-block' %>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
```

除了所有 Tailwind 类外，我们还有一些重要的项目需要指出。

我们将一个类附加到 `toast` 正文中 `flash_class(level)` 。这是一个尚未定义的帮助程序方法。现在让我们将其 `app/helpers/application_helper.rb` 添加到：

```rb
module ApplicationHelper
  def flash_class(level)
    case level.to_sym
    when :notice
      'bg-blue-900 border-blue-900'
    when :success
      'bg-green-900 border-green-900'
    when :alert
      'bg-red-900 border-red-900'
    when :error
      'bg-red-900 border-red-900'
    else
      'bg-blue-900 border-blue-900'
    end
  end
end
```

此方法返回 Tailwind 类，以根据我们向用户显示的 Flash 消息类型更改 Toast 的颜色。

我们闪光灯部分的另一个重要部分是 `<%%= inline_svg_tag 'close.svg', class: 'h-4 w-4 inline-block' %> `。这种方法 `inline_svg_tag` 允许我们轻松渲染 `svg`，但它来自我们尚未添加到项目中的 `gem`。接下来让我们解决这个问题。

将 `gem` 添加到您的 `gemfile` 中，然后使用以下命令从终端安装它：

```bash
bundle add inline_svg
```

安装 gem 后重新启动 Rails 服务器，然后从终端创建 close.svg 文件：

```bash
touch app/assets/images/close.svg
```

```svg
# app/assets/images/close.svg
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
```

这个 svg 以及我们将在本书中使用的所有其他 svg 都来自 [Hericons](https://heroicons.com/) 图标库。

有了这些部分，闪光灯部分就可以使用了，但永远不会渲染的部分不是很有帮助。为了使这些 Toast 样式的 Flash 消息正常工作，我们需要在应用程序布局中呈现 Flash 消息，并使用 `Stimulus` 显示和隐藏它们。

接下来，让我们构建 Stimulus 控制器。

我们可以 `stimulus-rails` 随时使用提供的生成器，将新的刺激控制器添加到我们的应用程序中

```bash
rails g stimulus alert
```

生成器在 中 `app/javascript/controllers` 创建一个新文件，并运行 `stimulus:manifest:update` 以在 中 `app/javascript/controllers/index.js` 注册新控制器。

在 `app/javascript/controllers/alert_controller.js` 以下位置更新新控制器：

```js
import { Controller } from "stimulus";

export default class extends Controller {
  static values = {
    closeAfter: {
      type: Number,
      default: 2500,
    },
    removeAfter: {
      type: Number,
      default: 1100,
    },
  };

  initialize() {
    this.hide();
  }

  connect() {
    setTimeout(() => {
      this.show();
    }, 50);
    setTimeout(() => {
      this.close();
    }, this.closeAfterValue);
  }

  close() {
    this.hide();
    setTimeout(() => {
      this.element.remove();
    }, this.removeAfterValue);
  }

  show() {
    this.element.setAttribute(
      "style",
      "transition: 0.5s; transform:translate(0, -100px);"
    );
  }

  hide() {
    this.element.setAttribute(
      "style",
      "transition: 1s; transform:translate(0, 200px);"
    );
  }
}
```

因为这是我们的第一个刺激控制器，让我们在这里暂停一下，谈谈正在发生的事情。

首先，我们用默认值声明值：

```js
static values = {
  closeAfter: {
    type: Number,
    default: 2500
  },
  removeAfter: {
    type: Number,
    default: 1100
  },
}
```

我们可以在控制器中使用 `closeAfterValue` 来引用这些值，并且可以在 DOM 中的任何控制器实例上使用` data-[controller]-[valueName]-value` 来设置值。

值使构建简单、灵活的控制器变得更加容易，这些控制器可以在各种情况下重复使用。使用 Stimulus 值更改回调时，值可能更有用，即使我们没有在此控制器中使用它们，了解它们也很方便。

然后，我们定义了两个刺激生命周期回调， `initialize` 以及 `connect` ：

```js
initialize() {
  this.hide()
}

connect() {
  setTimeout(() => {
    this.show()
  }, 50)
  setTimeout(() => {
    this.close()
  }, this.closeAfterValue)
}
```

通过这些生命周期回调，我们可以定义控制器的行为，每次将控制器添加到 DOM 或从 DOM 中删除控制器时执行这些行为。

在此示例中，我们在控制器首次进入 DOM（ initialize 回调）时隐藏 `toast` 容器。然后，我们会在 `connect` 回调中自动显示（然后隐藏）Toast 容器，该容器在每次控制器进入 DOM 时运行。

在后面的章节中，我们将看到更多示例，说明这些生命周期回调如何使我们能够构建强大的前端交互，并轻松地将第三方 JavaScript 库集成到我们的应用程序中。

`show` `hide` 和 `close` 方法是常规 JavaScript。这些方法将元素移入和移出视口，然后将其从 DOM 中完全删除。

现在我们有了 Stimulus 控制器，下一步是将该控制器连接到 DOM。我们可以通过向 HTML 添加 `data` 属性来做到这一点。

返回 `app/views/shared/\_flash.html.erb` 并更新它：

```erb
<div class="fixed inset-x-0 -bottom-32 flex items-end justify-right px-4 py-6 sm:p-6 justify-end z-50 pointer-events-none">
  <div data-controller="alert" class="max-w-sm w-full h-24 shadow-lg rounded px-4 py-3 rounded relative border-l-4 text-white pointer-events-auto <%= flash_class(level) %>">
    <div class="p-2">
      <div class="flex items-start">
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p class="text-sm leading-5">
            <%= content %>
          </p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button data-action="alert#close" class="inline-flex text-white focus:outline-none focus:text-gray-300 transition ease-in-out duration-150">
            <%= inline_svg_tag 'close.svg', class: 'h-4 w-4 inline-block' %>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
```

在这里，我们添加了两个数据属性。在 `toast` 容器 `div` 上，我们添加了 `data-controller="alert"` .此属性告诉 Stimulus 在每次此 HTML 进入 DOM 时实例化 的新 `AlertController` 实例。

在关闭按钮上，我们添加了 `data-action="alert#close"` .`action` 属性是我们根据用户输入触发刺激方法的方式。我们可以将 `data-action` 属性附加到任何 DOM 元素以侦听用户与该元素的交互，只要该元素具有父 `data-controller` 元素即可。

在这种情况下，当用户单击关闭按钮时， `close()` `AlertController` 控制器中的方法将触发，警报将关闭。

Stimulus 如何知道我们想要侦听按钮上的点击事件？Stimulus 有助于假定某些元素类型（例如 for click 按钮）的默认事件。如果我们想听， `mouseup` 我们可以使用 `data-action="mouseup->alert#close"` .

尽管我们在 Stimulus 控制器中定义了值，但我们尚未将它们添加到标记中。由于我们已经为两个 `closeAfter` 和 `removeAfter` 设置了默认值，因此在实例化控制器时设置值是可选的。

如果我们想覆盖警报控制器的 `closeAfter` 值，我们可以使用：

```erb
data-controller="alert" data-alert-close-after-value="500"
```

`value` 属性必须放在 `controller` 元素上，而操作可以放在控制器元素或控制器的任何子元素上。

如果其中一些概念还不自然，请不要担心。在本书中，我们将创建多个刺激控制器，让我们有充足的机会适应刺激。

为了完成我们的 Flash 消息实现，我们需要在服务器上生成消息时在 DOM 中呈现消息。

为此，我们可以在 `app/views/layouts/application.html.erb` 中更新应用程序布局。当我们在那里时，我们也将放入应用程序 `shell` 的第一部分。更新视图的正文，如下所示：

```erb
<body>
  <div class="flex flex-col h-screen justify-between px-4 md:px-0">
    <main class="mb-auto w-full">
      <div class="mx-auto max-w-7xl">
        <%= yield %>
      </div>
    </main>
  </div>
  <div id="flash-container">
    <% flash.each do |key, value| %>
      <%= render "shared/flash", level: key, content: value %>
    <% end %>
  </div>
</body>
```

在这里，我们做了一些小的表示调整，然后在哈希中 `flash` 存在的每条消息上添加了一个循环。对于每条消息，我们将 `flash` 呈现为部分，并显示我们的 `toast。`

请注意，此实现仅适用于任何时候显示的单个 Toast。这是有意为之的，我们将牢记这一点来构建功能。如果你想要一组更复杂的 `toast` 功能，你可以考虑一个像这样的专用 JavaScript 库。

要试用新的 Flash 消息功能，请重新启动服务器，然后前往登录页面，输入无效的凭据并点击登录按钮。您应该会看到 Flash Toast 自动打开和关闭，如果您速度很快，您可以通过单击关闭图标手动关闭 Toast。

干得好！我们差不多读完了这一章，并走出了本书的设置阶段。

## 应用程序布局更新

我们将通过向基本应用程序布局添加更多结构来结束本章。完成后，我们将有一个简单的顶部导航栏和围绕主要内容的页脚。

登录用户将收到不同的导航栏，每个人都会看到相同的页脚。

这些都是标准的 Rails 和 ERB 代码。首先，创建我们需要的视图：

```bash
mkdir app/views/nav
touch app/views/nav/_top_nav.html.erb app/views/nav/_authenticated.html.erb app/views/nav/_unauthenticated.html.erb
touch app/views/shared/_footer.html.erb
```

`top_nav` 部分呈现顶部导航栏的基本结构，以及 `authenticated` or `unauthenticated` 内容，具体取决于用户是否登录。

```erb
# app/views/nav/_top_nav.html.erb
<nav class="bg-gray-100 shadow">
  <div class="container mx-auto flex text-gray-700 max-w-screen-2xl">
    <div class="flex flex-shrink-0 items-center px-6 py-4">
      <%= link_to "Hotwired ATS", root_path, class: "rounded px-2 py-1 text-gray-700 hover:text-gray-900 hover:bg-gray-200" %>
    </div>
    <% if user_signed_in? %>
      <%= render "nav/authenticated" %>
    <% else %>
      <%= render "nav/unauthenticated" %>
    <% end %>
  </div>
</nav>
```

以及经过身份验证的导航内容：

```erb
# app/views/nav/_authenticated.html.erb
<div class="flex items-center w-full space-x-8">
  <%= link_to "Jobs","#", class: "rounded px-2 py-1 text-gray-700 hover:text-gray-900 hover:bg-gray-200" %>
  <a class="rounded px-2 py-1 text-gray-700 hover:text-gray-900 hover:bg-gray-200" href="#">Applicants</a>
</div>
<div class="flex items-center justify-end px-6 py-4 flex-shrink-0 space-x-8">
  <%= button_to "Log out", destroy_user_session_path, method: :delete, class: "rounded px-2 py-1 text-gray-700 hover:text-gray-900 hover:bg-gray-200" %>
</div>
```

在这里，我们有几个用于工作和申请人资源的占位符链接。我们将建立这些内容，并在以后的章节中建立真正的链接。

以及未经身份验证的导航：

```erb
# app/views/nav/_unauthenticated.html.erb

<div class="flex items-center ml-12 w-full"></div>
<div class="flex items-center justify-end px-6 py-4 flex-shrink-0 space-x-8">
  <%= link_to "Sign In", new_user_session_path, class: "rounded px-2 py-1 text-gray-700 hover:text-gray-900 hover:bg-gray-200" %>
  <%= link_to "Sign Up", new_user_registration_path, class: "rounded px-2 py-1 text-gray-700 hover:text-gray-900 hover:bg-gray-200" %>
</div>

```

填写 `shared/\_footer.html.erb` ，这只是占位符内容来平衡页面：

```erb
# app/views/shared/_footer.html.erb

<footer class="bg-gray-100 border-t border-gray-200">
  <div class="max-w-screen-2xl mx-auto py-6 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
    <div class="mt-8 md:mt-0">
      <p class="text-center text-gray-700 text-sm">
        &copy; <%= Date.current.year %> Hotwired ATS
      </p>
    </div>
    <div class="flex justify-center space-x-6">
      <%= link_to "Terms of Service", "#", class: "text-gray-700 hover:text-gray-900 text-xs" %>
      <%= link_to "Privacy Policy", "#", class: "text-gray-700 hover:text-gray-900 text-xs" %>
    </div>
  </div>
</footer>
```

更新应用程序布局以使用以下新部分：

```erb
# app/views/layouts/application.html.erb
<body>
  <div class="flex flex-col h-screen justify-between px-4 md:px-0">
    <%= render "nav/top_nav" %>
    <main class="mb-auto w-full overflow-auto">
      <div class="mx-auto max-w-7xl md:px-6 lg:px-8 py-8">
        <%= yield %>
      </div>
    </main>
    <%= render "shared/footer" %>
    <div id="flash-container">
      <% flash.each do |key, value| %>
        <%= render "shared/flash", level: key, content: value %>
      <% end %>
    </div>
  </div>
</body>
```

完成这一章的工作不错！在下一章中，我们将创建作业资源，包括首次了解 `Turbo Frames`、`Turbo Streams` 和 `CableReady`。
