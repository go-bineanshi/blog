import { blogPlugin } from '@vuepress/plugin-blog'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  lang: 'zh-CN',
  base: '/', 
  title: '快乐学习每一天',
  description: "bineanshi's blog",
  head: [
    ['link', { rel: 'icon', href: 'https://blog.qiniu.g-bill.club/blog/logo.png' }],
    ["meta", { name:"referrer", content:"no-referrer"}]
  ],
  theme: defaultTheme({
    logo: 'https://blog.qiniu.g-bill.club/blog/logo.png',

    navbar: [
      '/',
      {
        text: "虚拟机",
        children: [
          { text: "Multipass", link: "/pages/container/multipass.md" },
        ],
      },
      {
        text: '编程',
        children: [
          {
            text: 'Ruby 极简教程',
            link: '/pages/ruby/install.md'
          }
        ],
      },
    ],
    sidebar: {
      '/pages/container/': [
        {
          text: "虚拟机",
          children: [
            { text: "Multipass", link: "/pages/container/multipass.md" },
          ],
        },
      ],
      '/pages/ruby/': [
        {
          text: 'Ruby 极简教程',
          collapsible: true,
          children: [
            '/pages/ruby/install.md',
            { 
              text: "应用",
              children: [
                '/pages/ruby/rails.md',
              ]
            }
          ]
        }
      ]
    }
  }),

  plugins: [
  
  ],

  bundler: viteBundler(),
})
