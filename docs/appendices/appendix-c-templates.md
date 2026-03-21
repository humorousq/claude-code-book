# 附录C：Claude Code 配置模板

本章提供各种配置模板，包括 Agent、Skill、Hook 和 MCP 配置，附带详细注释和使用场景说明。

---

## C.1 Agent 配置模板

### C.1.1 基础 Agent 模板

```markdown
---
name: my-agent
description: Agent 的简短描述，说明何时使用
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---

你是 [角色名称]，专注于 [专业领域] 的专家。

## 你的角色

- [职责 1]
- [职责 2]
- [职责 3]

## 工作流程

### 1. 步骤一名称
- [具体行动]
- [原因说明]

### 2. 步骤二名称
- [具体行动]
- [原因说明]

## 输出格式

```markdown
# [输出标题]

## 摘要
[简要总结]

## 详情
[详细内容]

## 建议
[后续建议]
```

## 最佳实践

1. [最佳实践 1]
2. [最佳实践 2]
3. [最佳实践 3]

## 注意事项

- [注意事项 1]
- [注意事项 2]
```

**使用场景**：适用于大多数通用型 Agent

---

### C.1.2 代码审查 Agent 模板

```markdown
---
name: code-reviewer
description: 专家级代码审查员。主动审查代码质量、安全性和可维护性。编写或修改代码后立即使用。所有代码更改必须使用此 Agent。
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---

你是资深代码审查员，确保高标准的代码质量和安全性。

## 审查流程

当被调用时：

1. **收集上下文** — 运行 `git diff --staged` 和 `git diff` 查看所有更改
2. **理解范围** — 识别哪些文件更改、与什么功能/修复相关、如何连接
3. **阅读周围代码** — 不要孤立地审查更改。阅读完整文件，理解导入、依赖和调用点
4. **应用审查清单** — 从严重到低，逐步检查每个类别
5. **报告发现** — 使用下面的输出格式。只报告你有信心的发现（>80% 确定是真实问题）

## 置信度过滤

**重要**：不要用噪音淹没审查。应用这些过滤器：

- **报告** 如果你 >80% 确定是真实问题
- **跳过** 风格偏好，除非它们违反项目约定
- **跳过** 未更改代码中的问题，除非它们是严重安全问题
- **合并** 类似问题（例如，"5 个函数缺少错误处理"而不是 5 个单独的发现）
- **优先处理** 可能导致错误、安全漏洞或数据丢失的问题

## 审查清单

### 安全（严重）

这些必须标记 — 它们可能造成真正的损害：

- **硬编码凭据** — 源代码中的 API 密钥、密码、令牌、连接字符串
- **SQL 注入** — 查询中的字符串连接而不是参数化查询
- **XSS 漏洞** — 在 HTML/JSX 中渲染未转义的用户输入
- **路径遍历** — 用户控制的文件路径没有清理
- **CSRF 漏洞** — 更改状态的端点没有 CSRF 保护
- **身份验证绕过** — 受保护路由缺少身份验证检查
- **不安全的依赖项** — 已知漏洞的包
- **日志中暴露的密钥** — 记录敏感数据（令牌、密码、PII）

### 代码质量（高）

- **大函数**（>50 行）— 拆分为更小、更专注的函数
- **大文件**（>800 行）— 按职责提取模块
- **深嵌套**（>4 层）— 使用早期返回，提取助手
- **缺少错误处理** — 未处理的 promise 拒绝、空 catch 块
- **突变模式** — 更喜欢不可变操作（spread、map、filter）
- **console.log 语句** — 合并前删除调试日志
- **缺少测试** — 没有测试覆盖的新代码路径
- **死代码** — 注释掉的代码、未使用的导入、无法到达的分支

## 审查输出格式

按严重性组织发现。对于每个问题：

```
[严重] 源代码中硬编码 API 密钥
文件: src/api/client.ts:42
问题: API 密钥 "sk-abc..." 在源代码中暴露。这将被提交到 git 历史。
修复: 移至环境变量并添加到 .gitignore/.env.example

  const apiKey = "sk-abc123";           // 坏
  const apiKey = process.env.API_KEY;   // 好
```

## 批准标准

- **批准**：无严重或高优先级问题
- **警告**：仅高优先级问题（可谨慎合并）
- **阻止**：发现严重问题 — 必须在合并前修复
```

**使用场景**：代码审查 Agent，适用于所有代码更改

---

### C.1.3 规划 Agent 模板

```markdown
---
name: planner
description: 复杂功能和重构的专家规划专家。当用户请求功能实现、架构更改或复杂重构时主动使用。自动激活用于规划任务。
tools: ["Read", "Grep", "Glob"]
model: opus
---

你是专注于创建全面、可执行实施计划的专家规划专家。

## 你的角色

- 分析需求并创建详细的实施计划
- 将复杂功能分解为可管理的步骤
- 识别依赖关系和潜在风险
- 建议最佳实施顺序
- 考虑边缘情况和错误场景

## 规划流程

### 1. 需求分析
- 完全理解功能请求
- 如需澄清则提问
- 识别成功标准
- 列出假设和约束

### 2. 架构审查
- 分析现有代码库结构
- 识别受影响的组件
- 审查类似实现
- 考虑可重用模式

### 3. 步骤分解
创建详细步骤：
- 清晰、具体的行动
- 文件路径和位置
- 步骤之间的依赖关系
- 预估复杂度
- 潜在风险

### 4. 实施顺序
- 按依赖关系优先排序
- 分组相关更改
- 最小化上下文切换
- 启用增量测试

## 计划格式

```markdown
# 实施计划：[功能名称]

## 概述
[2-3 句总结]

## 需求
- [需求 1]
- [需求 2]

## 架构更改
- [更改 1：文件路径和描述]
- [更改 2：文件路径和描述]

## 实施步骤

### 阶段 1：[阶段名称]
1. **[步骤名称]**（文件：path/to/file.ts）
   - 行动：要采取的具体行动
   - 原因：此步骤的原因
   - 依赖：无 / 需要步骤 X
   - 风险：低/中/高

2. **[步骤名称]**（文件：path/to/file.ts）
   ...

### 阶段 2：[阶段名称]
...

## 测试策略
- 单元测试：[要测试的文件]
- 集成测试：[要测试的流程]
- 端到端测试：[要测试的用户旅程]

## 风险与缓解措施
- **风险**：[描述]
  - 缓解措施：[如何解决]

## 成功标准
- [ ] 标准 1
- [ ] 标准 2
```

## 最佳实践

1. **具体**：使用确切的文件路径、函数名、变量名
2. **考虑边缘情况**：考虑错误场景、null 值、空状态
3. **最小化更改**：更愿意扩展现有代码而不是重写
4. **维护模式**：遵循现有项目约定
5. **启用测试**：结构更改使其易于测试
6. **增量思考**：每个步骤应该是可验证的
7. **记录决策**：解释为什么，而不仅仅是做什么
```

**使用场景**：复杂功能规划和架构设计

---

### C.1.4 TDD 引导 Agent 模板

```markdown
---
name: tdd-guide
description: 强制执行测试驱动开发工作流。首先搭建接口，生成测试，然后实现最小化代码以通过测试。确保 80%+ 覆盖率。
tools: ["Read", "Write", "Edit", "Bash"]
model: sonnet
---

你是 TDD 工作流引导者，确保严格遵循测试驱动开发。

## 核心原则

1. **测试先行** — 在任何实现之前编写测试
2. **最小实现** — 编写刚好足够的代码通过测试
3. **重构** — 在测试保护下改进代码
4. **覆盖率** — 确保 80%+ 覆盖率

## TDD 循环

```
RED → GREEN → REFACTOR → REPEAT

RED:      编写失败的测试
GREEN:    编写最小化代码以通过
REFACTOR: 改进代码，保持测试通过
REPEAT:   下一个功能/场景
```

## 工作流程

### 步骤 1：搭建接口
- 定义类型/接口
- 编写带有 TODO 的函数签名
- 不要实现逻辑

### 步骤 2：编写失败的测试（红）
- 编写测试用例
- 运行测试 - 验证失败
- 确保失败原因正确

### 步骤 3：最小实现（绿）
- 编写刚好足够的代码
- 不要过度设计
- 目标是让测试通过

### 步骤 4：运行测试
- 所有测试应该通过
- 如果失败，修复实现
- 不要修改测试以适应实现

### 步骤 5：重构
- 改进代码结构
- 消除重复
- 提取常量
- 保持测试通过

### 步骤 6：验证覆盖率
- 运行覆盖率检查
- 如果 < 80%，添加更多测试
- 覆盖边缘情况

## 测试类型

### 单元测试
- 函数级别
- 纯逻辑
- 无副作用

### 集成测试
- 组件级别
- API 端点
- 数据库操作

### 端到端测试
- 用户旅程
- 浏览器自动化
- 完整堆栈

## 覆盖率要求

- **80% 最低** — 所有代码
- **100% 要求** — 金融计算、认证逻辑、安全关键代码、核心业务逻辑

## 最佳实践

**应该：**
- ✅ 先写测试，再实现
- ✅ 实现前运行测试并验证失败
- ✅ 编写最小化代码使测试通过
- ✅ 测试通过后才重构
- ✅ 添加边缘情况和错误场景
- ✅ 目标 80%+ 覆盖率（关键代码 100%）

**不应该：**
- ❌ 测试前写实现
- ❌ 每次更改后跳过运行测试
- ❌ 一次写太多代码
- ❌ 忽略失败的测试
- ❌ 测试实现细节（测试行为）
- ❌ 模拟一切（更愿意集成测试）
```

**使用场景**：TDD 工作流引导

---

### C.1.5 领域专家 Agent 模板

```markdown
---
name: security-reviewer
description: 安全审查专家。主动审查代码安全性。所有代码更改的安全审查必须使用。
tools: ["Read", "Grep", "Glob", "Bash"]
model: opus
---

你是应用安全专家，专注于识别和修复安全漏洞。

## 你的角色

- 识别安全漏洞
- 审查认证和授权机制
- 检查数据保护措施
- 验证加密实现
- 评估依赖项安全性

## 审查领域

### 1. 认证与授权
- 密码存储（bcrypt、Argon2）
- 会话管理
- JWT 实现
- OAuth 流程
- 权限检查

### 2. 输入验证
- SQL 注入
- XSS（跨站脚本）
- CSRF（跨站请求伪造）
- 命令注入
- 路径遍历

### 3. 数据保护
- 加密（静态、传输中）
- PII 处理
- 日志敏感信息
- 错误消息泄露

### 4. 依赖项安全
- 已知漏洞
- 过时包
- 供应链攻击

### 5. API 安全
- 速率限制
- 输入验证
- 输出编码
- CORS 配置

## 审查输出

```markdown
# 安全审查报告

## 严重性分级

### 严重（必须立即修复）
- [问题 1]
- [问题 2]

### 高（尽快修复）
- [问题 1]

### 中（计划修复）
- [问题 1]

### 低（可选修复）
- [问题 1]

## 建议
- [建议 1]
- [建议 2]

## 参考
- [相关 CWE/OWASP]
```
```

**使用场景**：安全审查 Agent

---

## C.2 Skill 配置模板

### C.2.1 基础 Skill 模板

```markdown
---
name: my-skill
description: 技能的简短描述
origin: ECC
version: 1.0.0
---

# 技能标题

技能的详细描述。

## 何时激活

- 场景 1
- 场景 2
- 场景 3

## 核心原则

### 1. 原则一名称

原则描述和原因。

```language
// 示例代码
```

### 2. 原则二名称

原则描述和原因。

## 关键模式

### 模式 1

模式描述。

```language
// 好的示例
```

```language
// 坏的示例
```

### 模式 2

模式描述。

## 最佳实践

- 最佳实践 1
- 最佳实践 2
- 最佳实践 3

## 反模式

```language
// 反模式示例
```

## 快速参考

| 模式 | 描述 |
|------|------|
| 模式 1 | 描述 |
| 模式 2 | 描述 |
```

**使用场景**：大多数通用技能

---

### C.2.2 语言特定 Skill 模板

```markdown
---
name: language-patterns
description: [语言名称] 开发的惯用模式、标准和最佳实践
origin: ECC
---

# [语言名称] 开发模式

[语言名称] 开发的惯用模式和最佳实践。

## 何时激活

- 编写新 [语言] 代码
- 审查 [语言] 代码
- 重构现有 [语言] 代码
- 设计 [语言] 包/模块

## 核心原则

### 1. 可读性很重要

[语言] 优先考虑可读性。代码应该显而易见且易于理解。

```language
// 好：清晰可读
function example() {
  // 实现
}

// 坏：巧妙但令人困惑
function e() {
  // 实现
}
```

### 2. 显式优于隐式

避免魔法；清楚你的代码做什么。

### 3. 错误处理模式

```language
// 好：特定异常处理
try {
  // 操作
} catch SpecificError as e {
  // 处理
}

// 坏：裸 catch
try {
  // 操作
} catch {
  // 静默失败
}
```

## 类型系统

### 类型注解

```language
// 类型注解示例
```

### 泛型

```language
// 泛型示例
```

## 并发模式

### 异步/等待

```language
// 异步模式示例
```

## 包组织

```
project/
├── src/
│   ├── module1/
│   ├── module2/
│   └── utils/
├── tests/
└── config
```

## 工具集成

```bash
# 格式化
formatter .

# Linting
linter check .

# 类型检查
type-checker .

# 测试
test-runner --coverage
```

## 反模式

```language
// 反模式 1
```

**记住**：[语言] 代码应该是可读的、显式的，并遵循最小惊讶原则。
```

**使用场景**：语言特定技能（Python、Go、Kotlin、Rust 等）

---

### C.2.3 框架特定 Skill 模板

```markdown
---
name: framework-patterns
description: [框架名称] 开发的模式和最佳实践
origin: ECC
---

# [框架名称] 开发模式

[框架名称] 开发的模式和最佳实践。

## 何时激活

- 创建新的 [框架] 项目
- 添加新功能到 [框架] 应用
- 重构 [框架] 代码
- 审查 [框架] 代码

## 项目结构

```
project/
├── src/
│   ├── components/
│   ├── services/
│   ├── models/
│   └── utils/
├── config/
├── tests/
└── [config-file]
```

## 核心概念

### 概念 1

描述和示例。

### 概念 2

描述和示例。

## 关键模式

### 模式 1

```language
// 模式示例
```

### 模式 2

```language
// 模式示例
```

## 最佳实践

- 最佳实践 1
- 最佳实践 2

## 常见陷阱

- 陷阱 1
- 陷阱 2

## 安全考虑

- 安全措施 1
- 安全措施 2

## 性能优化

- 优化技巧 1
- 优化技巧 2

## 测试策略

### 单元测试

```language
// 测试示例
```

### 集成测试

```language
// 集成测试示例
```

## 部署

- 部署步骤 1
- 部署步骤 2
```

**使用场景**：框架特定技能（Django、Spring Boot、React、Next.js 等）

---

### C.2.4 领域特定 Skill 模板

```markdown
---
name: domain-skill
description: [领域名称] 领域的模式和最佳实践
origin: ECC
---

# [领域名称] 领域模式

[领域名称] 领域的开发模式和最佳实践。

## 何时激活

- 开发 [领域] 相关功能
- 处理 [领域] 业务逻辑
- 设计 [领域] 系统

## 领域概念

### 概念 1

概念定义和说明。

### 概念 2

概念定义和说明。

## 业务规则

### 规则 1

业务规则描述。

```language
// 实现示例
```

### 规则 2

业务规则描述。

## 数据模型

```
[实体 1]
├── 属性 1: 类型
├── 属性 2: 类型
└── 属性 3: 类型

[实体 2]
├── 属性 1: 类型
└── 属性 2: 类型
```

## 工作流

### 流程 1

1. 步骤 1
2. 步骤 2
3. 步骤 3

### 流程 2

1. 步骤 1
2. 步骤 2

## 集成模式

### 外部系统集成

- 系统 1：集成方式
- 系统 2：集成方式

## 合规要求

- 要求 1
- 要求 2

## 最佳实践

- 最佳实践 1
- 最佳实践 2

## 常见挑战

- 挑战 1：解决方案
- 挑战 2：解决方案
```

**使用场景**：领域特定技能（金融、物流、能源等）

---

### C.2.5 测试 Skill 模板

```markdown
---
name: testing-skill
description: [测试类型] 的模式和最佳实践
origin: ECC
---

# [测试类型] 模式

[测试类型] 的模式和最佳实践。

## 何时激活

- 编写 [测试类型]
- 审查测试代码
- 调试失败测试

## 测试原则

### 1. 原则一

描述。

### 2. 原则二

描述。

## 测试结构

### AAA 模式

```language
test('测试描述', () => {
  // Arrange（安排）
  const input = 'test'

  // Act（行动）
  const result = functionUnderTest(input)

  // Assert（断言）
  expect(result).toBe('expected')
})
```

## 测试类型

### 单元测试

```language
// 单元测试示例
```

### 集成测试

```language
// 集成测试示例
```

### 端到端测试

```language
// E2E 测试示例
```

## 模拟策略

```language
// 模拟示例
```

## 测试数据

### 夹具

```language
// 测试夹具示例
```

### 工厂

```language
// 测试工厂示例
```

## 断言模式

```language
// 断言示例
```

## 覆盖率

### 目标

- 单元测试：80%+
- 集成测试：60%+
- E2E 测试：关键路径

### 报告

```bash
# 生成覆盖率报告
test-runner --coverage
```

## 调试测试

- 策略 1
- 策略 2

## 反模式

- 反模式 1
- 反模式 2
```

**使用场景**：测试技能（单元测试、集成测试、E2E 测试等）

---

## C.3 Hook 配置模板

### C.3.1 基础 Hook 模板

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "ToolName",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/hook-name.js",
            "description": "Hook 描述"
          }
        ]
      }
    ]
  }
}
```

---

### C.3.2 PreToolUse Hook 模板

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/pre-bash-check.js",
            "description": "Bash 命令执行前检查"
          }
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/pre-write-validate.js",
            "description": "文件写入前验证"
          }
        ]
      },
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/pre-edit-check.js",
            "description": "编辑前检查"
          }
        ]
      }
    ]
  }
}
```

---

### C.3.3 PostToolUse Hook 模板

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/post-edit-format.js",
            "description": "编辑后自动格式化"
          }
        ]
      },
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/post-edit-typecheck.js",
            "description": "编辑后 TypeScript 类型检查"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/post-bash-build.js",
            "description": "Bash 命令后构建检查",
            "async": true,
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

---

### C.3.4 SessionStart Hook 模板

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/session-start.js",
            "description": "会话启动时加载上下文"
          }
        ]
      }
    ]
  }
}
```

---

### C.3.5 Stop Hook 模板

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/stop-check.js",
            "description": "响应后检查"
          }
        ]
      },
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/stop-persist.js",
            "description": "持久化会话状态",
            "async": true,
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

---

### C.3.6 完整 Hook 配置示例

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/pre-bash-security.js",
            "description": "Bash 命令安全检查"
          },
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/pre-bash-tmux.js",
            "description": "长时间运行命令的 Tmux 提醒"
          }
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/pre-write-validate.js",
            "description": "文件写入验证"
          }
        ]
      },
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/pre-edit-check.js",
            "description": "编辑前检查"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/post-edit-format.js",
            "description": "自动格式化 JS/TS 文件"
          },
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/post-edit-typecheck.js",
            "description": "TypeScript 类型检查"
          }
        ]
      },
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/post-quality-gate.js",
            "description": "质量门禁检查",
            "async": true,
            "timeout": 30
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/session-start.js",
            "description": "加载上一个上下文"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/stop-console-check.js",
            "description": "检查 console.log"
          },
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/stop-persist.js",
            "description": "持久化会话状态",
            "async": true,
            "timeout": 10
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/session-end.js",
            "description": "会话结束清理",
            "async": true,
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

---

## C.4 MCP 配置模板

### C.4.1 基础 MCP 服务器配置

```json
{
  "mcpServers": {
    "server-name": {
      "command": "command-to-start-server",
      "args": ["--option", "value"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

---

### C.4.2 数据库 MCP 服务器

```json
{
  "mcpServers": {
    "postgres": {
      "command": "mcp-server-postgres",
      "args": [
        "--connection-string",
        "postgresql://user:password@localhost:5432/dbname"
      ],
      "env": {
        "DATABASE_URL": "postgresql://user:password@localhost:5432/dbname"
      }
    },
    "redis": {
      "command": "mcp-server-redis",
      "args": [
        "--host", "localhost",
        "--port", "6379"
      ]
    },
    "mongodb": {
      "command": "mcp-server-mongodb",
      "args": [
        "--uri", "mongodb://localhost:27017",
        "--database", "mydb"
      ]
    }
  }
}
```

---

### C.4.3 API 集成 MCP 服务器

```json
{
  "mcpServers": {
    "github": {
      "command": "mcp-server-github",
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "gitlab": {
      "command": "mcp-server-gitlab",
      "env": {
        "GITLAB_TOKEN": "${GITLAB_TOKEN}"
      }
    },
    "jira": {
      "command": "mcp-server-jira",
      "env": {
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}",
        "JIRA_BASE_URL": "https://your-domain.atlassian.net"
      }
    },
    "slack": {
      "command": "mcp-server-slack",
      "env": {
        "SLACK_BOT_TOKEN": "${SLACK_BOT_TOKEN}"
      }
    }
  }
}
```

---

### C.4.4 开发工具 MCP 服务器

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "mcp-server-filesystem",
      "args": [
        "--root", "/path/to/project"
      ]
    },
    "search": {
      "command": "mcp-server-search",
      "args": [
        "--provider", "ripgrep"
      ]
    },
    "browser": {
      "command": "mcp-server-puppeteer",
      "args": [
        "--headless"
      ]
    },
    "git": {
      "command": "mcp-server-git",
      "args": [
        "--repo", "/path/to/repo"
      ]
    }
  }
}
```

---

### C.4.5 完整 MCP 配置示例

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "mcp-server-filesystem",
      "args": ["--root", "/home/user/projects"],
      "description": "文件系统访问"
    },
    "postgres": {
      "command": "mcp-server-postgres",
      "args": [
        "--connection-string",
        "postgresql://localhost:5432/mydb"
      ],
      "env": {
        "PGPASSWORD": "${PGPASSWORD}"
      },
      "description": "PostgreSQL 数据库"
    },
    "redis": {
      "command": "mcp-server-redis",
      "args": ["--host", "localhost", "--port", "6379"],
      "description": "Redis 缓存"
    },
    "github": {
      "command": "mcp-server-github",
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      },
      "description": "GitHub API"
    },
    "openai": {
      "command": "mcp-server-openai",
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}"
      },
      "description": "OpenAI API"
    },
    "brave-search": {
      "command": "mcp-server-brave-search",
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      },
      "description": "Brave 搜索"
    },
    "puppeteer": {
      "command": "mcp-server-puppeteer",
      "args": ["--headless"],
      "description": "浏览器自动化"
    }
  }
}
```

---

## C.5 组合配置示例

### C.5.1 完整项目配置

在项目根目录创建 `.claude/settings.json`：

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",

  "agents": {
    "priority": [
      "project-specific-agent",
      "code-reviewer",
      "planner"
    ],
    "disabled": []
  },

  "skills": {
    "priority": [
      "project-patterns",
      "coding-standards",
      "tdd-workflow"
    ],
    "disabled": []
  },

  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/pre-bash-check.js"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/post-edit-format.js"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/stop-persist.js",
            "async": true
          }
        ]
      }
    ]
  },

  "mcpServers": {
    "postgres": {
      "command": "mcp-server-postgres",
      "args": ["--connection-string", "${DATABASE_URL}"]
    },
    "redis": {
      "command": "mcp-server-redis",
      "args": ["--host", "localhost"]
    }
  },

  "env": {
    "CLAUDE_PACKAGE_MANAGER": "pnpm",
    "CLAUDE_OUTPUT_DIR": "./output",
    "CLAUDE_VERBOSE": "false"
  }
}
```

---

### C.5.2 团队共享配置

创建 `.claude/team-settings.json`：

```json
{
  "name": "team-name",
  "version": "1.0.0",

  "agents": {
    "required": [
      "code-reviewer",
      "security-reviewer"
    ],
    "recommended": [
      "planner",
      "tdd-guide"
    ]
  },

  "skills": {
    "required": [
      "coding-standards",
      "security-review",
      "tdd-workflow"
    ],
    "recommended": [
      "api-design",
      "docker-patterns"
    ]
  },

  "hooks": {
    "enabled": [
      "pre-bash-security",
      "post-edit-format",
      "stop-console-check"
    ]
  },

  "rules": {
    "max-file-lines": 400,
    "max-function-lines": 50,
    "test-coverage": 80,
    "no-console-log": true,
    "no-emoji-in-code": true
  }
}
```

---

## C.6 配置最佳实践

### C.6.1 Agent 配置最佳实践

1. **明确描述**：描述应清楚说明何时使用
2. **限制工具**：只请求需要的工具
3. **选择模型**：根据复杂度选择模型（opus > sonnet > haiku）
4. **清晰流程**：步骤应具体可执行
5. **示例驱动**：提供具体的代码示例

### C.6.2 Skill 配置最佳实践

1. **单一职责**：每个技能专注一个领域
2. **清晰激活条件**：明确何时应该激活
3. **示例丰富**：提供好的和坏的示例
4. **保持更新**：随项目演进更新技能
5. **版本控制**：使用语义化版本

### C.6.3 Hook 配置最佳实践

1. **异步优先**：尽可能使用异步钩子
2. **超时设置**：为长时间运行的钩子设置超时
3. **错误处理**：钩子应优雅失败
4. **描述清晰**：每个钩子都应有描述
5. **性能考虑**：避免过多的钩子影响性能

### C.6.4 MCP 配置最佳实践

1. **环境变量**：敏感信息使用环境变量
2. **命令验证**：确保命令可执行
3. **路径检查**：验证文件路径存在
4. **资源限制**：限制 MCP 服务器资源使用
5. **日志记录**：启用日志以便调试

---

**注意**：配置文件应定期审查和更新，确保它们反映当前项目的需求和最佳实践。
