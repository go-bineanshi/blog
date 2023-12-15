import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "快乐学习每一天",
  description: "A VitePress Site",
  themeConfig: {
    logo: '/img/logo.png',
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

    footerConfig: {
      showFooter: true, // 是否显示页脚
      icpRecordCode: '苏ICP备19067404号-1', // ICP备案号
      // publicSecurityRecordCode: '津公网安备12011202000677号', // 联网备案号
      copyright: `Copyright © 2021-${new Date().getFullYear()} bineanshi` // 版权信息
    }
  }
})
