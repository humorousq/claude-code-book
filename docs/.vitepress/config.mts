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
      { text: '第一部分', link: '/part-1/chapter-01-native-vs-extension' },
      { text: '第二部分', link: '/part-2/chapter-06-multi-agent' },
      { text: '附录', link: '/appendices/appendix-a-commands' }
    ],

    sidebar: {
      '/part-1/': [
        {
          text: '第一部分：核心工作流深入讲解',
          items: [
            { text: '第1章 原生能力与扩展包', link: '/part-1/chapter-01-native-vs-extension' },
            { text: '第2章 实施计划工作流', link: '/part-1/chapter-02-planning' },
            { text: '第3章 测试驱动开发', link: '/part-1/chapter-03-tdd' },
            { text: '第4章 代码审查工作流', link: '/part-1/chapter-04-code-review' },
            { text: '第5章 自动化测试与部署', link: '/part-1/chapter-05-testing-deployment' }
          ]
        }
      ],
      '/part-2/': [
        {
          text: '第二部分：高级工作流案例演示',
          items: [
            { text: '第6章 多智能体协作', link: '/part-2/chapter-06-multi-agent' },
            { text: '第7章 MCP 开发', link: '/part-2/chapter-07-mcp-development' },
            { text: '第8章 自定义智能体', link: '/part-2/chapter-08-custom-agents' },
            { text: '第9章 团队协作', link: '/part-2/chapter-09-team-collaboration' }
          ]
        }
      ],
      '/appendices/': [
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
      ]
    },

    search: {
      provider: 'local'
    },

    lastUpdated: true,

    editLink: {
      pattern: 'https://github.com/humorousz/claude-code-book/edit/main/docs/:path'
    }
  },

  markdown: {
    lineNumbers: true,
    math: true
  }
})
