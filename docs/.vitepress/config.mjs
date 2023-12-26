import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "快乐学习每一天",
  description: "专注 & 洞察 & 分享",
  head: [
    // 添加图标
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  
  lastUpdated: true,

  themeConfig: {
    logo: '/img/logo.png',
    lastUpdatedText: '最后更新', // 最后更新时间文本配置, 需先配置lastUpdated为true
    // 文档页脚文本配置
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    outline: {
      level: 'deep', // 右侧大纲标题层级
      label: '目录', // 右侧大纲标题文本配置
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '示例', link: '/markdown-examples' }
    ],
    
    sidebar: [
      {
        text: '示例',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/go-bineanshi/blog' }
    ],

    // 编辑链接
    editLink: {
      pattern: "https://github.com/go-bineanshi/blog/edit/main/docs/:path", // 自己项目仓库地址
      text: "在 github 上编辑此页",
      icon: "github"
    },
    footerConfig: {
      showFooter: true, // 是否显示页脚
      icpRecordCode: '苏ICP备19067404号-1', // ICP备案号
      publicSecurityRecordCode: '苏公网安备32060102320699号', // 联网备案号
      copyright: `Copyright © 2021-${new Date().getFullYear()} bineanshi` // 版权信息
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    }
  },
  
})
