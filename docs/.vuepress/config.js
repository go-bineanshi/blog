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
          },
          {
            text: '转载 Hotwired ATS',
            link: '/pages/ruby/hotwiringrails/chapter1.md'
          }
        ],
      },
      {
        text: '其他',
        children: [
          {
            text: 'Nginx 极简教程',
            link: '/pages/deploy/nginx.md'
          },
          {
            text: 'Elasticsearch',
            link: '/pages/elasticsearch/elasticsearch.md'
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
            },
            {
              text: '转载 Hotwired ATS',
              children: [
                '/pages/ruby/hotwiringrails/chapter1.md',
                '/pages/ruby/hotwiringrails/chapter2.md',
                '/pages/ruby/hotwiringrails/chapter3.md',
                '/pages/ruby/hotwiringrails/chapter4.md',
                '/pages/ruby/hotwiringrails/chapter5.md',
                '/pages/ruby/hotwiringrails/chapter6.md',
                '/pages/ruby/hotwiringrails/chapter7.md',
                '/pages/ruby/hotwiringrails/chapter8.md',
                '/pages/ruby/hotwiringrails/chapter9.md',
                '/pages/ruby/hotwiringrails/chapter10.md',
                '/pages/ruby/hotwiringrails/chapter11.md',
              ]
            }
          ]
        }
      ],
      '/pages/nginx/': [
        {
          text: "运维",
          children: [
            { text: "Nginx", link: '/pages/nginx/nginx.md' },
          ],
        },
      ],
      '/pages/elasticsearch/': [
        {
          text: "Elasticsearch",
          children: [
            { text: "elasticsearch", link: '/pages/elasticsearch/elasticsearch.md' },
            { text: "简易部署", link: '/pages/elasticsearch/deploy.md' },
          ],
        },
      ]
    }
  }),

  plugins: [
  
  ],

  bundler: viteBundler(),
})
