# 附录A：Claude Code 完整命令速查表

本章提供 Claude Code 所有命令的完整参考，包括语法、参数、使用场景和示例。

---

## A.1 核心工作流命令

### `/tdd` - 测试驱动开发工作流

**描述**：强制执行测试驱动开发方法，确保 80%+ 测试覆盖率

**何时使用**：
- 实现新功能
- 添加新函数/组件
- 修复错误（先编写重现错误的测试）
- 重构现有代码
- 构建关键业务逻辑

**工作流程**：
1. 搭建接口 - 首先定义类型/接口
2. 首先生成测试 - 编写失败的测试（红）
3. 实现最小化代码 - 编写刚好足够的代码以通过测试（绿）
4. 重构 - 改进代码，同时保持测试通过（重构）
5. 验证覆盖率 - 确保 80%+ 的测试覆盖率

**TDD 循环**：
```
RED → GREEN → REFACTOR → REPEAT

RED:      编写失败的测试
GREEN:    编写最小化代码以通过测试
REFACTOR: 改进代码，保持测试通过
REPEAT:   下一个功能/场景
```

**使用示例**：
```bash
/tdd I need a function to calculate market liquidity score
```

**覆盖率要求**：
- 最低 80% 覆盖率（单元 + 集成 + 端到端）
- 100% 要求：金融计算、认证逻辑、安全关键代码、核心业务逻辑

**相关代理**：`tdd-guide`

---

### `/plan` - 实施规划

**描述**：重新阐述需求、评估风险并创建分步实施计划

**何时使用**：
- 开始新功能
- 进行重大架构变更
- 处理复杂重构
- 多个文件/组件将受到影响
- 需求不明确或存在歧义

**工作流程**：
1. 分析请求并用清晰的术语重新阐述需求
2. 分解为多个阶段，每个阶段包含具体、可操作的步骤
3. 识别组件之间的依赖关系
4. 评估风险和潜在阻碍
5. 估算复杂度（高/中/低）
6. 展示计划并等待用户确认

**输出格式**：
```markdown
# 实施计划：[功能名称]

## 需求重述
- [需求 1]
- [需求 2]

## 实施阶段

### 阶段 1：[阶段名称]
1. **[步骤名称]** (文件: path/to/file.ts)
   - 操作: 要执行的具体操作
   - 原因: 执行此步骤的原因
   - 依赖: 无 / 需要步骤 X
   - 风险: 低/中/高

### 阶段 2：[阶段名称]
...

## 依赖项
- [依赖 1]
- [依赖 2]

## 风险评估
- 高: [风险描述]
- 中: [风险描述]
- 低: [风险描述]

## 预估复杂度: 中
- 后端: 4-6 小时
- 前端: 3-4 小时
- 测试: 2-3 小时
- 总计: 9-13 小时

**等待确认**: 是否继续执行此计划？(是/否/修改)
```

**重要说明**：planner 代理在您明确确认之前，不会编写任何代码

**相关代理**：`planner`

---

### `/code-review` - 代码审查

**描述**：对未提交的更改进行全面的安全性和质量审查

**何时使用**：
- 完成功能实现后
- 提交代码前
- 合并 PR 前

**审查类别**：

**安全问题（严重）**：
- 硬编码的凭据、API 密钥、令牌
- SQL 注入漏洞
- XSS 漏洞
- 缺少输入验证
- 不安全的依赖项
- 路径遍历风险

**代码质量（高）**：
- 函数长度超过 50 行
- 文件长度超过 800 行
- 嵌套深度超过 4 层
- 缺少错误处理
- console.log 语句
- TODO/FIXME 注释
- 公共 API 缺少 JSDoc

**最佳实践（中）**：
- 可变模式（应使用不可变模式）
- 代码/注释中使用表情符号
- 新代码缺少测试
- 无障碍性问题（a11y）

**输出格式**：
```
[严重] 源代码中硬编码 API 密钥
文件: src/api/client.ts:42
问题: API 密钥 "sk-abc..." 在源代码中暴露
修复: 移至环境变量并添加到 .gitignore/.env.example

## 审查摘要

| 严重性 | 数量 | 状态 |
|--------|------|------|
| 严重   | 0    | 通过 |
| 高     | 2    | 警告 |
| 中     | 3    | 信息 |
| 低     | 1    | 备注 |

结论: 警告 — 2 个高优先级问题应在合并前解决
```

**相关代理**：`code-reviewer`

---

### `/e2e` - 端到端测试

**描述**：使用 Playwright 生成并运行端到端测试

**何时使用**：
- 测试关键用户旅程（登录、交易、支付）
- 验证多步骤流程端到端工作
- 测试 UI 交互和导航
- 验证前端和后端之间的集成
- 为生产部署做准备

**工作流程**：
1. 分析用户流程并识别测试场景
2. 使用页面对象模型模式生成 Playwright 测试
3. 跨多个浏览器（Chrome、Firefox、Safari）运行测试
4. 捕获失败，包括截图、视频和跟踪
5. 生成包含结果和工件的报告
6. 识别不稳定测试并推荐修复方法

**使用示例**：
```bash
/e2e Test the market search and view flow
```

**测试工件**：
- 所有测试：HTML 报告、JUnit XML
- 仅失败时：截图、视频、跟踪文件、网络日志、控制台日志

**快速命令**：
```bash
# 运行所有 E2E 测试
npx playwright test

# 运行特定测试文件
npx playwright test tests/e2e/markets/search.spec.ts

# 有头模式（查看浏览器）
npx playwright test --headed

# 调试测试
npx playwright test --debug

# 生成测试代码
npx playwright codegen http://localhost:3000

# 查看报告
npx playwright show-report
```

**相关代理**：`e2e-runner`

---

### `/build-fix` - 构建修复

**描述**：以最小、安全的更改逐步修复构建和类型错误

**何时使用**：
- 构建失败时
- 类型检查错误
- 编译错误

**工作流程**：
1. 检测构建系统（npm/pnpm/yarn、Cargo、Maven、Gradle、go mod）
2. 解析并分组错误
3. 修复循环（一次处理一个错误）
4. 总结结果

**构建命令检测**：
| 指示器 | 构建命令 |
|--------|----------|
| package.json 包含 build 脚本 | npm run build 或 pnpm build |
| tsconfig.json | npx tsc --noEmit |
| Cargo.toml | cargo build 2>&1 |
| pom.xml | mvn compile |
| build.gradle | ./gradlew compileJava |
| go.mod | go build ./... |
| pyproject.toml | python -m py_compile 或 mypy . |

**恢复策略**：
| 情况 | 操作 |
|------|------|
| 缺少模块/导入 | 检查包是否已安装；建议安装命令 |
| 类型不匹配 | 读取两种类型定义；修复更窄的类型 |
| 循环依赖 | 使用导入图识别循环；建议提取 |
| 版本冲突 | 检查 package.json / Cargo.toml 中的版本约束 |
| 构建工具配置错误 | 读取配置文件；与有效的默认配置进行比较 |

**相关代理**：`build-error-resolver`

---

## A.2 学习与技能提取命令

### `/learn` - 提取可重用模式

**描述**：分析当前会话，提取值得保存为技能的模式

**何时使用**：
- 解决了非平凡问题后
- 发现可重用的调试技术
- 找到项目特定模式

**提取内容**：
1. 错误解决模式
   - 出现了什么错误？
   - 根本原因是什么？
   - 什么方法修复了它？
   - 这对解决类似错误是否可重用？

2. 调试技术
   - 不明显的调试步骤
   - 有效的工具组合
   - 诊断模式

3. 变通方法
   - 库的怪癖
   - API 限制
   - 特定版本的修复

4. 项目特定模式
   - 发现的代码库约定
   - 做出的架构决策
   - 集成模式

**输出格式**：
```markdown
# [描述性模式名称]

**提取时间**: [日期]
**上下文**: [适用情况的简要描述]

## 问题
[此模式解决什么问题 - 要具体]

## 解决方案
[模式/技术/变通方法]

## 示例
[代码示例（如适用）]

## 何时使用
[触发条件 - 什么应该激活此技能]
```

**保存位置**：`~/.claude/skills/learned/[pattern-name].md`

---

### `/skill-create` - 本地技能生成

**描述**：分析本地 Git 历史，提取编码模式并生成 SKILL.md 文件

**使用方法**：
```bash
/skill-create                    # 分析当前仓库
/skill-create --commits 100      # 分析最近 100 次提交
/skill-create --output ./skills  # 自定义输出目录
/skill-create --instincts        # 也生成 instincts
```

**功能说明**：
1. 解析 Git 历史 - 分析提交记录、文件更改和模式
2. 检测模式 - 识别重复出现的工作流程和约定
3. 生成 SKILL.md - 创建有效的 Claude Code 技能文件
4. 可选创建 Instincts - 用于 continuous-learning-v2 系统

**检测的模式类型**：
| 模式 | 检测方法 |
|------|----------|
| 提交约定 | 对提交消息进行正则匹配 (feat:, fix:, chore:) |
| 文件协同更改 | 总是同时更改的文件 |
| 工作流序列 | 重复的文件更改模式 |
| 架构 | 文件夹结构和命名约定 |
| 测试模式 | 测试文件位置、命名、覆盖率 |

**输出示例**：
```markdown
---
name: my-app-patterns
description: 从 my-app 仓库提取的编码模式
version: 1.0.0
source: local-git-analysis
analyzed_commits: 150
---

# My App 模式

## 提交约定
- feat: - 新功能
- fix: - 错误修复
- chore: - 维护任务
- docs: - 文档更新

## 代码架构
src/
├── components/     # React 组件 (PascalCase.tsx)
├── hooks/          # 自定义钩子 (use*.ts)
├── utils/          # 工具函数
├── types/          # TypeScript 类型定义
└── services/       # API 和外部服务

## 工作流
### 添加新组件
1. 创建 src/components/ComponentName.tsx
2. 添加测试在 src/components/__tests__/ComponentName.test.tsx
3. 从 src/components/index.ts 导出
```

**相关命令**：`/instinct-import`、`/instinct-status`、`/evolve`

---

## A.3 会话管理命令

### `/save-session` - 保存会话状态

**描述**：将当前会话状态持久化到文件

**何时使用**：
- 需要暂停工作并稍后恢复
- 保存重要上下文信息
- 创建检查点

**保存内容**：
- 对话历史摘要
- 关键决策和上下文
- 文件更改列表
- 未完成任务

---

### `/resume-session` - 恢复会话状态

**描述**：从保存的会话文件恢复会话

**何时使用**：
- 继续之前中断的工作
- 恢复上下文

**使用方法**：
```bash
/resume-session [session-name]
```

---

### `/sessions` - 列出保存的会话

**描述**：显示所有已保存的会话

**输出**：
```
已保存的会话:
1. market-search-feature (2025-03-20 14:30)
2. auth-refactor (2025-03-19 10:15)
3. api-integration (2025-03-18 16:45)
```

---

### `/checkpoint` - 创建检查点

**描述**：创建当前工作的快照

**使用场景**：
- 在重大更改前创建回退点
- 保存当前进度

---

## A.4 多代理与编排命令

### `/orchestrate` - 多代理编排

**描述**：协调多个代理协同工作

**何时使用**：
- 复杂任务需要多个专业代理
- 需要并行执行独立任务

---

### `/multi-workflow` - 多工作流执行

**描述**：执行多个相关工作流

**使用方法**：
```bash
/multi-workflow [workflow-name]
```

---

### `/multi-plan` - 多阶段规划

**描述**：创建涉及多个组件的复杂计划

---

### `/multi-execute` - 并行执行

**描述**：并行执行多个独立任务

---

### `/multi-frontend` - 多前端工作流

**描述**：处理多个前端项目的工作流

---

### `/multi-backend` - 多后端工作流

**描述**：处理多个后端项目的工作流

---

## A.5 质量与验证命令

### `/verify` - 验证实施

**描述**：验证实现是否符合要求

**何时使用**：
- 完成功能实现后
- 提交代码前

---

### `/test-coverage` - 测试覆盖率检查

**描述**：验证测试覆盖率是否达到目标

**使用方法**：
```bash
/test-coverage                    # 检查当前覆盖率
/test-coverage --threshold 80     # 设置阈值为 80%
```

---

### `/quality-gate` - 质量门禁

**描述**：运行质量门禁检查

**检查项目**：
- 代码格式
- 静态分析
- 测试覆盖率
- 安全扫描

---

### `/refactor-clean` - 清理重构

**描述**：清理技术债务和重构代码

---

## A.6 语言与框架特定命令

### Python 相关

#### `/python-review` - Python 代码审查
**描述**：专门针对 Python 代码的审查，检查 PEP 8 合规性、类型提示、Pythonic 模式

---

### Go 相关

#### `/go-build` - Go 构建检查
**描述**：检查 Go 代码构建和编译错误

#### `/go-test` - Go 测试
**描述**：运行 Go 测试套件

#### `/go-review` - Go 代码审查
**描述**：专门针对 Go 代码的审查

---

### Kotlin 相关

#### `/kotlin-build` - Kotlin 构建检查
**描述**：检查 Kotlin 代码构建错误

#### `/kotlin-test` - Kotlin 测试
**描述**：运行 Kotlin 测试

#### `/kotlin-review` - Kotlin 代码审查
**描述**：专门针对 Kotlin 代码的审查

---

### Java/Gradle 相关

#### `/gradle-build` - Gradle 构建
**描述**：使用 Gradle 构建项目

---

## A.7 循环与自动化命令

### `/loop-start` - 启动自动化循环

**描述**：启动自动化执行循环

**使用方法**：
```bash
/loop-start [config-file]
```

---

### `/loop-status` - 检查循环状态

**描述**：查看当前自动化循环的状态

---

### `/autonomous-loops` - 自主循环

**描述**：启动完全自主的执行循环

---

## A.8 学习系统命令

### `/instinct-import` - 导入 Instincts

**描述**：导入生成的 instincts 到 continuous-learning 系统

---

### `/instinct-export` - 导出 Instincts

**描述**：导出当前学习的 instincts

---

### `/instinct-status` - Instincts 状态

**描述**：查看已学习的 instincts 状态

**输出示例**：
```
已学习的 Instincts (15 个):
1. commit-convention (置信度: 0.92) - 使用约定式提交
2. immutability-pattern (置信度: 0.88) - 使用不可变模式
3. error-handling (置信度: 0.85) - 全面的错误处理
...
```

---

### `/learn-eval` - 评估学习

**描述**：评估 continuous-learning 系统的性能

---

### `/evolve` - 进化模式

**描述**：将 instincts 聚类为技能/代理

**何时使用**：
- 积累足够的 instincts 后
- 自动提取更高级别的模式

---

## A.9 其他实用命令

### `/aside` - 旁注

**描述**：添加旁注或注释而不中断主要工作流

---

### `/checkpoint` - 检查点

**描述**：创建工作快照

---

### `/claw` - CLAW 工具

**描述**：命令行自动化工具

---

### `/eval` - 评估

**描述**：评估代码或配置

---

### `/harness-audit` - 审计线束

**描述**：审计代理线束配置

---

### `/model-route` - 模型路由

**描述**：配置模型路由策略

---

### `/pm2` - PM2 集成

**描述**：PM2 进程管理集成

---

### `/projects` - 项目管理

**描述**：管理多个项目

---

### `/promote` - 提升

**描述**：提升代码从开发到生产

---

### `/prompt-optimize` - 提示优化

**描述**：优化提示词以提高效率

---

### `/setup-pm` - 设置包管理器

**描述**：配置包管理器设置

**支持的包管理器**：
- npm
- pnpm
- yarn
- bun

---

### `/update-codemaps` - 更新代码地图

**描述**：更新项目的代码地图

---

### `/update-docs` - 更新文档

**描述**：自动更新项目文档

---

## A.10 命令快速参考表

| 命令 | 类别 | 主要用途 | 关键代理 |
|------|------|---------|----------|
| `/tdd` | 工作流 | 测试驱动开发 | tdd-guide |
| `/plan` | 工作流 | 实施规划 | planner |
| `/code-review` | 质量 | 代码审查 | code-reviewer |
| `/e2e` | 测试 | 端到端测试 | e2e-runner |
| `/build-fix` | 构建 | 修复构建错误 | build-error-resolver |
| `/learn` | 学习 | 提取模式 | - |
| `/skill-create` | 学习 | 生成技能 | - |
| `/save-session` | 会话 | 保存会话 | - |
| `/resume-session` | 会话 | 恢复会话 | - |
| `/verify` | 质量 | 验证实施 | - |
| `/test-coverage` | 质量 | 检查覆盖率 | - |
| `/quality-gate` | 质量 | 质量门禁 | - |

---

## A.11 命令组合最佳实践

### 新功能开发流程

```bash
# 1. 规划
/plan Add user authentication with OAuth

# 2. TDD 实现
/tdd Implement OAuth login flow

# 3. 代码审查
/code-review

# 4. E2E 测试
/e2e Test OAuth login flow

# 5. 验证覆盖率
/test-coverage
```

### 错误修复流程

```bash
# 1. TDD 修复（先写失败测试）
/tdd Fix the null pointer exception in user service

# 2. 代码审查
/code-review

# 3. 构建
/build-fix
```

### 重构流程

```bash
# 1. 规划
/plan Refactor payment module

# 2. 执行重构
/refactor-clean

# 3. 验证
/verify

# 4. 测试
/test-coverage
/e2e
```

---

## A.12 命令参数详解

### 通用参数格式

大多数命令支持以下参数格式：

```bash
/command --option value --flag
```

### 常见参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `--output` | 输出目录 | `--output ./dist` |
| `--commits` | 提交数量 | `--commits 100` |
| `--threshold` | 阈值 | `--threshold 80` |
| `--verbose` | 详细输出 | `--verbose` |
| `--dry-run` | 试运行 | `--dry-run` |

---

## A.13 故障排查命令

### 诊断问题

```bash
# 检查会话状态
/sessions

# 查看学习状态
/instinct-status

# 检查循环状态
/loop-status

# 评估学习系统
/learn-eval
```

---

## A.14 命令别名

某些命令支持简短别名：

| 完整命令 | 别名 |
|----------|------|
| `/code-review` | `/cr` |
| `/test-coverage` | `/tc` |
| `/save-session` | `/save` |
| `/resume-session` | `/resume` |

---

## A.15 环境变量配置

命令行为可通过环境变量自定义：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `CLAUDE_PACKAGE_MANAGER` | 包管理器 | auto-detect |
| `CLAUDE_OUTPUT_DIR` | 默认输出目录 | `./output` |
| `CLAUDE_VERBOSE` | 详细模式 | `false` |

---

**注意**：本章内容基于 Everything Claude Code v1.8+ 版本。命令和参数可能随版本更新而变化。建议定期查看官方文档获取最新信息。
