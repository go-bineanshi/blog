// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import MyLayout from './MyLayout.vue'
import vitepressBackToTop from 'vitepress-plugin-back-to-top'
import 'vitepress-plugin-back-to-top/dist/style.css'

import 'viewerjs/dist/viewer.min.css';
import imageViewer from 'vitepress-plugin-image-viewer';
import vImageViewer from 'vitepress-plugin-image-viewer/lib/vImageViewer.vue';
import { useData, useRoute } from 'vitepress';
import codeblocksFold from 'vitepress-plugin-codeblocks-fold'; // import method
import 'vitepress-plugin-codeblocks-fold/style/index.scss'; // import style

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  Layout: MyLayout,

  enhanceApp(ctx) {
    vitepressBackToTop({
      // default
      threshold: 300,
      duration: 500,
    })
  },
  setup() {
    // Get route
    const route = useRoute();
    // Using
    imageViewer(route);

    const { frontmatter } = useData();
    // basic use
    codeblocksFold({ route, frontmatter }, true, 300);
  }
}
