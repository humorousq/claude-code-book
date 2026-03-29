import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Claude Code 实战工作流指南',
  description: '从需求到部署的 AI 驱动开发全链路实践',
  lang: 'zh-CN',

  // GitHub Pages 部署配置
  base: '/claude-code-book/',
  cleanUrls: true,

  ignoreDeadLinks: true,

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '第1章', link: '/chapter-01-design-philosophy' },
      { text: '附录', link: '/appendices/appendix-a-commands' }
    ],

    sidebar: [
      {
        text: '第1章 Everything Claude Code 设计理念',
        link: '/chapter-01-design-philosophy'
      },
      {
        text: '第2章 安装与环境配置',
        link: '/chapter-02-installation'
      },
      {
        text: '第3章 需求规划与架构设计',
        link: '/chapter-03-planning'
      },
      {
        text: '第4章 测试驱动开发',
        link: '/chapter-04-tdd'
      },
      {
        text: '第5章 代码审查与质量保证',
        link: '/chapter-05-code-review'
      },
      {
        text: '第6章 持续集成与部署',
        link: '/chapter-06-cicd'
      },
      {
        text: '第7章 多智能体协作',
        link: '/chapter-07-multi-agent'
      },
      {
        text: '第8章 MCP 开发实战',
        link: '/chapter-08-mcp'
      },
      {
        text: '第9章 自定义 Skills 和 Agents',
        link: '/chapter-09-custom'
      },
      {
        text: '第10章 团队协作最佳实践',
        link: '/chapter-10-team'
      },
      {
        text: '附录',
        items: [
          { text: '附录A 命令参考', link: '/appendices/appendix-a-commands' },
          { text: '附录B Skill 参考', link: '/appendices/appendix-b-skills' },
          { text: '附录C 模板库', link: '/appendices/appendix-c-templates' },
          { text: '附录D 故障排查', link: '/appendices/appendix-d-troubleshooting' },
          { text: '附录E 术语表', link: '/appendices/appendix-e-glossary' }
        ]
      }
    ],

    search: {
      provider: 'local'
    },

    lastUpdated: true,

    editLink: {
      pattern: 'https://github.com/humorousq/claude-code-book/edit/main/docs/:path'
    }
  },

  markdown: {
    lineNumbers: true,
    math: true
  }
})
