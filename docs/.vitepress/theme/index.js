// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import MyLayout from './MyLayout.vue'
import vitepressBackToTop from 'vitepress-plugin-back-to-top'
import 'vitepress-plugin-back-to-top/dist/style.css'



/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  Layout: MyLayout,

  enhanceApp({ app, router, siteData }) {
    vitepressBackToTop({
      // default
      threshold: 300,
      duration: 500,
    })
  }
}
