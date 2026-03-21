import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Claude Code 实战工作流指南',
  description: '从需求到部署的 AI 驱动开发全链路实践',
  lang: 'zh-CN',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '序言', link: '/preface' }
    ],

    sidebar: [
      {
        text: '开始',
        items: [
          { text: '序言', link: '/preface' }
        ]
      }
    ],

    search: {
      provider: 'local'
    },

    lastUpdated: true,

    editLink: {
      pattern: 'https://github.com/username/claude-code-book/edit/main/docs/:path'
    }
  },

  markdown: {
    lineNumbers: true,
    math: true
  }
})
