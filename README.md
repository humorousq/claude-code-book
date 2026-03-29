# Claude Code 实战工作流指南

> Everything Claude Code 扩展包实战指南 - 从安装到精通的生产力提升之路

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 在线阅读

- [GitHub Pages](https://humorousq.github.io/claude-code-book/)
- [下载 PDF](https://github.com/humorousq/claude-code-book/releases/latest)

## 🎯 本书特色

- 🎯 **设计理念深度讲解** - 理解 Everything Claude Code 的核心价值和设计原则
- 💡 **生产就绪的工作流** - 50+ Skills、20+ Agents，覆盖开发全生命周期
- 📊 **可量化的效率提升** - 代码审查时间减少 67%，测试覆盖率提升 42%
- 👥 **团队协作最佳实践** - 统一规范、知识沉淀、自动化工作流

## 🚀 快速开始

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/humorousq/claude-code-book.git
cd claude-code-book

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173

### 构建

```bash
# 构建网站
npm run build

# 预览构建结果
npm run preview

# 生成 PDF
npm run pdf
```

### 工具脚本

```bash
# 修复章节编号
npm run fix

# 验证构建
npm run verify

# 运行测试
npm test
```

## 📚 内容结构

### 第一部分：基础篇 - 理解扩展包

1. **第1章：Everything Claude Code 设计理念**
   - 为什么需要扩展包
   - 三大支柱：最佳实践、自动化、可扩展
   - 核心设计原则
   - 可量化的价值

2. **第2章：安装与环境配置**
   - 环境要求检查
   - 安装方式选择
   - 故障排查

### 第二部分：核心工作流篇

3. **第3章：需求规划与架构设计**
   - planner agent 深度使用
   - architect agent 应用
   - 实战案例：电商系统需求规划

4. **第4章：测试驱动开发 (TDD)**
   - tdd-guide agent 使用
   - 测试策略 Skills
   - 实战案例：用户认证系统的 TDD 开发

5. **第5章：代码审查与质量保证**
   - code-reviewer agent 使用
   - 专业化审查 agents
   - 审查工作流自动化

6. **第6章：持续集成与部署**
   - CI/CD Skills
   - MCP 集成
   - 自动化工作流

### 第三部分：高级应用篇

7. **第7章：多智能体协作**
   - 多智能体系统架构
   - 并行执行策略
   - 实战案例：大型电商系统并行开发

8. **第8章：MCP 开发实战**
   - MCP 协议深入
   - 开发自己的 MCP server
   - 最佳实践

9. **第9章：自定义 Skills 和 Agents**
   - Skill 开发指南
   - Agent 定义方法
   - 团队知识沉淀

10. **第10章：团队协作最佳实践**
    - 团队配置管理
    - 工作流集成
    - 知识传承机制

### 附录

- 附录A：命令参考
- 附录B：Skill 参考
- 附录C：模板库
- 附录D：故障排查
- 附录E：术语表

## 🛠️ 技术栈

- [VitePress](https://vitepress.dev/) - 静态网站生成器
- [Puppeteer](https://pptr.dev/) - PDF 生成
- [pdf-lib](https://pdf-lib.js.org/) - PDF 合并
- [GitHub Actions](https://github.com/features/actions) - CI/CD
- [GitHub Pages](https://pages.github.com/) - 网站托管

## 🤝 贡献指南

请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 许可证

[MIT License](LICENSE)

## 🙏 致谢

本项目基于 [everything-claude-code](https://github.com/affaan-m/everything-claude-code) 仓库的中文内容。

---

**版本**: v2.0.0（重构版） | **发布日期**: 2026 | **作者**: humorousz
