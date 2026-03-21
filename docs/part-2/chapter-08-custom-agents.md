# 第8章 定制化 Agent 开发

> 本章将深入讲解如何开发定制化的 Claude Code Agent，从架构设计到部署实践，帮助您构建适合特定业务场景的智能体。

## 8.1 Agent 架构深度解析

### Agent 的本质与定位

在 Claude Code 生态系统中，Agent 是专门化的 AI 助手，能够执行特定类型的任务。与通用的 AI 对话不同，Agent 具有以下特征：

| 特征 | 说明 | 示例 |
|------|------|------|
| **专业性** | 专注于特定领域或任务类型 | code-reviewer 专注于代码质量 |
| **工具化** | 具备访问文件、运行命令等工具能力 | 使用 Read、Bash、Grep 等工具 |
| **流程化** | 遵循定义的工作流程和检查清单 | TDD 的 Red-Green-Refactor 循环 |
| **可组合** | 可与其他 Agent 协作完成复杂任务 | planner → architect → tdd-guide |

### Agent 文件结构

每个 Agent 都是一个 Markdown 文件，包含 YAML 前置元数据（frontmatter）和详细的工作指南。

**基本结构**：

```markdown
---
name: agent-name
description: Agent description
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]
model: sonnet | opus | haiku
---

# Agent Title

You are a [role description].

## Your Role
- [Responsibility 1]
- [Responsibility 2]

## Workflow
[Detailed process steps]

## Examples
[Real-world examples]
```

### 元数据字段详解

#### name（必需）

Agent 的唯一标识符，用于在命令行中调用：

```bash
# 通过 --agent 参数调用
claude-code --agent architect "设计微服务架构"

# 在 skill 中引用
claude-code --skill custom-skill --agent architect
```

**命名规范**：
- 使用小写字母和连字符：`code-reviewer`, `tdd-guide`
- 避免缩写，使用完整单词：`security-reviewer` 而非 `sec-rev`
- 体现专业领域：`java-reviewer`, `rust-build-resolver`

#### description（必需）

Agent 的功能描述，影响何时被自动调用：

```yaml
---
description: Security vulnerability detection and remediation specialist. Use PROACTIVELY after writing code that handles user input, authentication, API endpoints, or sensitive data. Flags secrets, SSRF, injection, unsafe crypto, and OWASP Top 10 vulnerabilities.
---
```

**描述规范**：
1. **首句**：简明扼要说明 Agent 的核心能力
2. **触发条件**：明确说明何时应该使用此 Agent
3. **关键能力**：列出主要检测或处理的问题类型
4. **关键词**：包含可搜索的关键词（便于自动调度）

**示例对比**：

```yaml
# ❌ 不好的描述 - 太模糊
description: Code review agent

# ✅ 好的描述 - 明确触发场景
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code. MUST BE USED for all code changes.
```

#### tools（必需）

Agent 可访问的工具列表，决定了 Agent 的能力边界。

**可用工具清单**：

| 工具 | 功能 | 使用场景 |
|------|------|----------|
| `Read` | 读取文件内容 | 分析现有代码、配置文件 |
| `Write` | 创建新文件 | 生成新代码、文档 |
| `Edit` | 编辑现有文件 | 修改代码、修复 bug |
| `Bash` | 执行命令行 | 运行测试、构建项目 |
| `Grep` | 搜索文件内容 | 查找代码模式、依赖关系 |
| `Glob` | 搜索文件路径 | 查找特定类型的文件 |
| `WebFetch` | 获取网页内容 | 获取文档、API 参考 |
| `WebSearch` | 搜索引擎查询 | 查找最新信息、最佳实践 |
| `LSP` | 语言服务器协议 | 代码跳转、定义查找 |
| `Skill` | 调用技能 | 执行预定义工作流 |

**工具选择原则**：

1. **最小权限原则**：只授予必要的工具
2. **安全第一**：避免授予危险操作权限
3. **按需分配**：根据 Agent 职责选择工具

**示例**：

```yaml
# 只读分析的 Agent
tools: ["Read", "Grep", "Glob"]  # architect, planner

# 需要修改文件的 Agent
tools: ["Read", "Write", "Edit", "Bash"]  # tdd-guide

# 完整能力的 Agent
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]  # security-reviewer
```

#### model（必需）

指定使用的 Claude 模型，影响成本和能力。

**模型选择指南**：

| 模型 | 优势 | 成本 | 适用场景 |
|------|------|------|----------|
| `opus` | 最强推理能力、复杂任务 | 高 | 架构设计、复杂规划 |
| `sonnet` | 平衡性能与成本 | 中 | 代码审查、TDD、重构 |
| `haiku` | 快速响应、低成本 | 低 | 简单查询、轻量任务 |

**选择建议**：

```yaml
# 需要深度思考和复杂推理
model: opus  # architect, planner, chief-of-staff

# 常规开发任务
model: sonnet  # code-reviewer, tdd-guide, security-reviewer

# 高频调用的轻量任务
model: haiku  # docs-lookup, simple-formatting
```

### Agent 内部结构设计

#### 核心组件划分

一个完整的 Agent 内部应包含以下组件：

1. **角色定义（Your Role）**
2. **工作流程（Workflow）**
3. **核心原则（Key Principles）**
4. **检查清单（Checklist）**
5. **示例（Examples）**
6. **参考资源（Reference）**

让我们以 `code-reviewer` Agent 为例，详细解析每个组件：

**1. 角色定义**：

```markdown
## Your Role

- Ensure code quality meets project standards
- Identify security vulnerabilities, performance issues, and code smells
- Suggest improvements following project conventions
- Block CRITICAL issues, warn on HIGH issues
```

**设计原则**：
- 使用动词短语描述职责
- 列出 3-7 个核心职责
- 体现 Agent 的核心价值

**2. 工作流程**：

```markdown
## Review Process

When invoked:

1. **Gather context** — Run `git diff --staged` and `git diff` to see all changes.
2. **Understand scope** — Identify which files changed.
3. **Read surrounding code** — Don't review changes in isolation.
4. **Apply review checklist** — Work through each category.
5. **Report findings** — Use the output format below.
```

**设计原则**：
- 步骤编号，顺序清晰
- 每个步骤有明确的目标
- 包含具体的命令或操作
- 考虑上下文信息

**3. 核心原则**：

```markdown
## Key Principles

1. **Defense in Depth** — Multiple layers of security
2. **Least Privilege** — Minimum permissions required
3. **Fail Securely** — Errors should not expose data
```

**设计原则**：
- 提炼最重要的 3-5 条原则
- 使用简洁有力的表述
- 体现最佳实践

**4. 检查清单**：

```markdown
## Review Checklist

### Security (CRITICAL)
- **Hardcoded credentials** — API keys, passwords in source
- **SQL injection** — String concatenation in queries
- **XSS vulnerabilities** — Unescaped user input

### Code Quality (HIGH)
- **Large functions** (>50 lines) — Split into smaller
- **Deep nesting** (>4 levels) — Use early returns
- **Missing error handling** — Unhandled promises
```

**设计原则**：
- 按优先级分组（CRITICAL > HIGH > MEDIUM > LOW）
- 每个检查项有明确的判断标准
- 提供具体示例和修复建议
- 可量化、可执行

**5. 示例**：

```markdown
## Common False Positives

- Environment variables in `.env.example` (not actual secrets)
- Test credentials in test files (if clearly marked)
- Public API keys (if actually meant to be public)

**Always verify context before flagging.**
```

**设计原则**：
- 包含正面示例和反面示例
- 说明边界情况和例外情况
- 帮助 Agent 做出正确判断

## 8.2 Agent 开发模式

### 模式一：分析型 Agent

**特征**：只读操作，分析现有代码或系统状态，提供建议。

**适用场景**：
- 代码审查
- 架构分析
- 安全审计
- 性能分析

**代表 Agent**：`architect`, `code-reviewer`, `security-reviewer`

**架构模式**：

```
输入 → 收集上下文 → 分析处理 → 生成报告 → 输出建议
```

**实现示例**：以 `architect` Agent 为例

```markdown
---
name: architect
description: Software architecture specialist for system design, scalability, and technical decision-making.
tools: ["Read", "Grep", "Glob"]
model: opus
---

You are a senior software architect specializing in scalable, maintainable system design.

## Architecture Review Process

### 1. Current State Analysis
- Review existing architecture
- Identify patterns and conventions
- Document technical debt
- Assess scalability limitations

### 2. Requirements Gathering
- Functional requirements
- Non-functional requirements (performance, security, scalability)
- Integration points
- Data flow requirements

### 3. Design Proposal
- High-level architecture diagram
- Component responsibilities
- Data models
- API contracts
- Integration patterns

### 4. Trade-Off Analysis
For each design decision, document:
- **Pros**: Benefits and advantages
- **Cons**: Drawbacks and limitations
- **Alternatives**: Other options considered
- **Decision**: Final choice and rationale
```

**关键设计点**：
1. **只读工具**：仅使用 `Read`, `Grep`, `Glob`，不修改文件
2. **结构化输出**：使用 ADR（Architecture Decision Records）格式
3. **权衡分析**：展示多种方案的比较
4. **可执行建议**：建议应具体、可实施

### 模式二：执行型 Agent

**特征**：具有写权限，能够修改文件、运行命令、执行测试。

**适用场景**：
- TDD 开发
- 代码重构
- 构建修复
- 自动化测试

**代表 Agent**：`tdd-guide`, `build-error-resolver`, `e2e-runner`

**架构模式**：

```
输入 → 分析现状 → 制定计划 → 执行操作 → 验证结果 → 迭代改进
```

**实现示例**：以 `tdd-guide` Agent 为例

```markdown
---
name: tdd-guide
description: Test-Driven Development specialist enforcing write-tests-first methodology.
tools: ["Read", "Write", "Edit", "Bash", "Grep"]
model: sonnet
---

You are a Test-Driven Development (TDD) specialist.

## TDD Workflow

### 1. Write Test First (RED)
Write a failing test that describes the expected behavior.

### 2. Run Test -- Verify it FAILS
\`\`\`bash
npm test
\`\`\`

### 3. Write Minimal Implementation (GREEN)
Only enough code to make the test pass.

### 4. Run Test -- Verify it PASSES

### 5. Refactor (IMPROVE)
Remove duplication, improve names -- tests must stay green.

### 6. Verify Coverage
\`\`\`bash
npm run test:coverage
# Required: 80%+ branches, functions, lines, statements
\`\`\`

## Edge Cases You MUST Test

1. **Null/Undefined** input
2. **Empty** arrays/strings
3. **Invalid types** passed
4. **Boundary values** (min/max)
5. **Error paths** (network failures, DB errors)
```

**关键设计点**：
1. **循环验证**：每个步骤都要验证结果
2. **失败优先**：先确保测试失败，再实现功能
3. **增量改进**：每次改动后都验证测试通过
4. **覆盖率要求**：明确量化指标（80%+）

### 模式三：协调型 Agent

**特征**：作为中心协调者，管理多个 Agent 或工具的协作。

**适用场景**：
- 多渠道消息处理
- 复杂工作流编排
- 跨系统集成
- 个人助理

**代表 Agent**：`chief-of-staff`, `planner`

**架构模式**：

```
输入 → 任务分解 → 并行执行 → 汇总结果 → 后续跟进
```

**实现示例**：以 `chief-of-staff` Agent 为例

```markdown
---
name: chief-of-staff
description: Personal communication chief of staff that triages email, Slack, LINE, and Messenger.
tools: ["Read", "Grep", "Glob", "Bash", "Edit", "Write"]
model: opus
---

You are a personal chief of staff that manages all communication channels.

## Triage Process

### Step 1: Parallel Fetch
Fetch all channels simultaneously:
\`\`\`bash
# Email
gog gmail search "is:unread" --max 20 --json

# Calendar
gog calendar events --today --max 30
\`\`\`

### Step 2: Classify
Apply the 4-tier system:
- **skip** (auto-archive)
- **info_only** (summary only)
- **meeting_info** (calendar cross-reference)
- **action_required** (draft reply)

### Step 3: Execute
- skip → Archive immediately
- info_only → Show one-line summary
- meeting_info → Cross-reference calendar
- action_required → Generate draft reply

### Step 4: Post-Send Follow-Through
**After every send, complete ALL of these:**
1. Calendar — Create events
2. Relationships — Update context
3. Todo — Mark completed
4. Git commit — Version control
```

**关键设计点**：
1. **并行处理**：同时处理多个输入源
2. **分类系统**：清晰的优先级分类
3. **强制检查清单**：使用 Hook 确保后续步骤完成
4. **状态持久化**：将状态写入文件，跨会话保持

### 模式四：特定领域 Agent

**特征**：针对特定编程语言、框架或业务领域。

**适用场景**：
- 语言特定代码审查
- 框架最佳实践
- 平台特定问题
- 业务逻辑验证

**代表 Agent**：`java-reviewer`, `python-reviewer`, `rust-build-resolver`

**架构模式**：

```
输入 → 领域分析 → 特定规则应用 → 领域建议 → 输出
```

**实现示例**：创建一个 React 性能优化 Agent

```markdown
---
name: react-perf-optimizer
description: React performance optimization specialist. Identifies re-renders, missing memoization, and bundle size issues. Use when optimizing React application performance.
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---

You are a React performance optimization specialist.

## Your Role

- Identify unnecessary re-renders
- Detect missing memoization opportunities
- Analyze bundle size and code splitting
- Recommend performance improvements

## Performance Analysis Workflow

### 1. Component Re-render Analysis
Search for components without memoization:
\`\`\`bash
# Find components that could benefit from React.memo
grep -r "export.*function.*Component" src/
grep -r "export const.*=.*(" src/
\`\`\`

### 2. Dependency Array Check
Find useEffect, useMemo, useCallback with issues:
\`\`\`bash
# Find potentially missing dependencies
grep -A 5 "useEffect" src/ | grep -v "dep"
\`\`\`

### 3. Bundle Size Analysis
\`\`\`bash
npm run build -- --analyze
\`\`\`

## Common Issues

### Unnecessary Re-renders
\`\`\`tsx
// ❌ BAD: Re-renders on every parent render
export function ChildComponent({ data }) {
  return <div>{data}</div>
}

// ✅ GOOD: Memoized component
export const ChildComponent = React.memo(({ data }) => {
  return <div>{data}</div>
})
\`\`\`

### Missing Dependencies
\`\`\`tsx
// ❌ BAD: Stale closure
useEffect(() => {
  fetchUser(userId)
}, []) // userId missing!

// ✅ GOOD: Complete dependencies
useEffect(() => {
  fetchUser(userId)
}, [userId])
\`\`\`

### Expensive Computations
\`\`\`tsx
// ❌ BAD: Runs on every render
const sortedItems = items.sort((a, b) => a - b)

// ✅ GOOD: Memoized computation
const sortedItems = useMemo(
  () => items.sort((a, b) => a - b),
  [items]
)
\`\`\`

## Output Format

\`\`\`markdown
# React Performance Report

## Critical Issues (N)
1. **Component re-renders unnecessarily**
   - File: src/components/UserList.tsx:42
   - Impact: Re-renders on every keystroke
   - Fix: Add React.memo()

## Warnings (N)
...

## Recommendations
...
\`\`\`
```

**关键设计点**：
1. **领域知识**：包含 React 特定的性能优化知识
2. **具体命令**：提供可执行的检测命令
3. **代码对比**：展示优化前后的代码对比
4. **量化影响**：说明性能问题的具体影响

## 8.3 工具集成深度实践

### 工具访问权限设计

工具的选择直接影响 Agent 的能力和安全性。以下是不同类型 Agent 的工具配置策略：

#### 只读分析型工具配置

适用于不需要修改文件的分析任务：

```yaml
---
name: dependency-analyzer
description: Analyzes project dependencies for security vulnerabilities, outdated packages, and license compliance.
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---
```

**工具使用示例**：

```markdown
## Analysis Commands

### Check for vulnerable dependencies
\`\`\`bash
npm audit --audit-level=moderate
\`\`\`

### Find outdated packages
\`\`\`bash
npx npm-check-updates
\`\`\`

### Analyze bundle size
\`\`\`bash
npx webpack-bundle-analyzer dist/static/js/*.js
\`\`\`

### Search for specific imports
\`\`\`bash
# Find all lodash imports
grep -r "from 'lodash'" src/

# Find moment.js usage (heavy library)
grep -r "import.*moment" src/
\`\`\`
```

#### 代码修改型工具配置

适用于需要修改代码的 Agent：

```yaml
---
name: refactoring-agent
description: Automatically refactors code to improve quality, readability, and performance.
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]
model: sonnet
---
```

**工具使用策略**：

```markdown
## Refactoring Workflow

### 1. Identify Refactoring Opportunities
\`\`\`bash
# Find long functions (>50 lines)
grep -r "function" src/ -A 50 | wc -l
\`\`\`

### 2. Create Backup
\`\`\`bash
git checkout -b refactor/$(date +%Y%m%d-%H%M%S)
git add .
git commit -m "Backup before refactoring"
\`\`\`

### 3. Apply Refactoring
Use Edit tool to make incremental changes:

- Extract function
- Rename variables
- Remove duplication
- Simplify conditionals

### 4. Run Tests
\`\`\`bash
npm test
\`\`\`

### 5. Verify No Regressions
\`\`\`bash
git diff
npm run test:coverage
\`\`\`
```

### 复杂工具链组合

对于复杂的任务，需要组合使用多个工具：

**示例：E2E 测试 Agent 的工具链**

```markdown
---
name: e2e-runner
description: End-to-end testing specialist using Vercel Agent Browser.
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]
model: sonnet
---

## Tool Chain Strategy

### Phase 1: Test Discovery (Read + Grep + Glob)
1. Find all test files:
   \`\`\`bash
   find tests/e2e -name "*.spec.ts"
   \`\`\`

2. Read test configuration:
   \`\`\`
   Read: playwright.config.ts
   \`\`\`

3. Search for test patterns:
   \`\`\`bash
   grep -r "test(" tests/e2e/ | wc -l
   \`\`\`

### Phase 2: Test Execution (Bash)
\`\`\`bash
# Run with trace
npx playwright test --trace on-first-retry

# Run specific test
npx playwright test tests/auth.spec.ts
\`\`\`

### Phase 3: Result Analysis (Read)
Read test report:
\`\`\`
Read: test-results/report.html
\`\`\`

### Phase 4: Fix Failures (Edit + Read)
1. Read failed test:
   \`\`\`
   Read: tests/auth.spec.ts
   \`\`\`

2. Update test:
   \`\`\`
   Edit: tests/auth.spec.ts
   Old: await expect(page.locator('.old-selector'))
   New: await expect(page.locator('[data-testid="new-selector"]'))
   \`\`\`

3. Re-run test:
   \`\`\`bash
   npx playwright test tests/auth.spec.ts
   \`\`\`
```

### 工具使用的最佳实践

#### 1. 错误处理

始终考虑工具调用可能失败的情况：

```markdown
## Robust Tool Usage

### Check Before Edit
\`\`\`markdown
1. Read file first to verify structure
2. Use Grep to find exact string
3. Apply Edit with unique match
4. Verify change with Read
\`\`\`

### Handle Missing Files
\`\`\`markdown
\`\`\`bash
if [ -f "config.json" ]; then
  cat config.json
else
  echo "Config file not found, creating default..."
  echo '{}' > config.json
fi
\`\`\`
\`\`\`
```

#### 2. 批量操作

使用 `Grep` 和 `Glob` 批量处理文件：

```markdown
## Batch Operations

### Find All TypeScript Files
\`\`\`bash
find src -name "*.ts" -o -name "*.tsx"
\`\`\`

### Search Pattern Across Files
\`\`\`bash
grep -r "TODO" src/ --include="*.ts" > todos.txt
\`\`\`

### Apply Same Change to Multiple Files
Use Edit tool iteratively:
\`\`\`markdown
For each file in [file1.ts, file2.ts, file3.ts]:
  Edit: Replace "oldFunction" with "newFunction"
\`\`\`
```

#### 3. 工具链验证

在执行关键操作前后进行验证：

```markdown
## Verification Pattern

### Pre-Check
\`\`\`bash
npm run lint
npm run type-check
\`\`\`

### Execute Changes
[Make modifications]

### Post-Check
\`\`\`bash
npm test
npm run lint
npm run build
\`\`\`
```

### 工具限制与安全边界

#### 不安全的操作模式

避免以下不安全的操作：

```markdown
## ❌ Unsafe Patterns

### 1. Executing Arbitrary User Input
\`\`\`bash
# NEVER do this
eval "$user_input"
\`\`\`

### 2. Unrestricted File Operations
\`\`\`bash
# Dangerous - could delete anything
rm -rf $user_path
\`\`\`

### 3. Hardcoded Secrets in Commands
\`\`\`bash
# Never include secrets in commands
curl -H "Authorization: Bearer sk-abc123" https://api.example.com
\`\`\`
```

#### 安全的操作模式

推荐使用安全的替代方案：

```markdown
## ✅ Safe Patterns

### 1. Use Environment Variables
\`\`\`bash
# Read from environment
export API_KEY=$(cat ~/.config/api_key)
curl -H "Authorization: Bearer $API_KEY" https://api.example.com
\`\`\`

### 2. Validate Paths
\`\`\`bash
# Whitelist allowed directories
ALLOWED_DIRS=("src" "tests" "docs")
if [[ " ${ALLOWED_DIRS[@]} " =~ " $dir " ]]; then
  rm -rf "$dir"
fi
\`\`\`

### 3. Use Safe APIs
\`\`\`bash
# Use structured CLI tools
gh repo view $REPO --json name,description
\`\`\`
```

## 8.4 测试定制化 Agent

### 测试策略

测试 Agent 比测试传统代码更具挑战性，因为 Agent 的输出具有不确定性。以下是分层测试策略：

#### 第一层：单元测试 - 工具调用

测试 Agent 能否正确使用工具：

```javascript
// tests/agents/code-reviewer.test.js
const { CodeReviewer } = require('../agents/code-reviewer')

describe('CodeReviewer Agent', () => {
  test('should read git diff correctly', async () => {
    const agent = new CodeReviewer()

    // Mock git diff output
    const mockDiff = `
diff --git a/src/app.ts b/src/app.ts
+const apiKey = "sk-123";
    `

    const result = await agent.analyzeDiff(mockDiff)

    expect(result).toContain('Hardcoded API key')
    expect(result.severity).toBe('CRITICAL')
  })

  test('should detect SQL injection', async () => {
    const code = `
const query = \`SELECT * FROM users WHERE id = \${userId}\`
    `

    const issues = await agent.detectSecurityIssues(code)

    expect(issues).toHaveLength(1)
    expect(issues[0].type).toBe('SQL_INJECTION')
    expect(issues[0].severity).toBe('CRITICAL')
  })
})
```

#### 第二层：集成测试 - 工作流程

测试 Agent 的完整工作流程：

```javascript
// tests/agents/tdd-guide.integration.test.js
const { TDDGuide } = require('../agents/tdd-guide')
const fs = require('fs').promises
const path = require('path')

describe('TDDGuide Integration Tests', () => {
  const testDir = './test-fixtures/tdd-test'

  beforeEach(async () => {
    // Create test directory
    await fs.mkdir(testDir, { recursive: true })
    await fs.writeFile(
      path.join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-project',
        scripts: {
          test: 'jest'
        }
      })
    )
  })

  afterEach(async () => {
    // Cleanup
    await fs.rm(testDir, { recursive: true, force: true })
  })

  test('should follow TDD cycle', async () => {
    const agent = new TDDGuide()

    // Step 1: Write failing test
    await agent.writeTest(testDir, 'math.test.js', `
test('add should sum two numbers', () => {
  expect(add(2, 3)).toBe(5)
})
    `)

    // Step 2: Run test - should fail
    const failResult = await agent.runTest(testDir)
    expect(failResult.pass).toBe(false)

    // Step 3: Write implementation
    await agent.writeImplementation(testDir, 'math.js', `
export function add(a, b) {
  return a + b
}
    `)

    // Step 4: Run test - should pass
    const passResult = await agent.runTest(testDir)
    expect(passResult.pass).toBe(true)

    // Step 5: Verify coverage
    const coverage = await agent.checkCoverage(testDir)
    expect(coverage.lines).toBeGreaterThan(80)
  })
})
```

#### 第三层：场景测试 - 真实案例

使用真实项目场景测试：

```javascript
// tests/agents/security-reviewer.scenario.test.js
const { SecurityReviewer } = require('../agents/security-reviewer')

describe('SecurityReviewer Real Scenarios', () => {
  test('should detect OWASP Top 10 vulnerabilities', async () => {
    const agent = new SecurityReviewer()

    // Real-world vulnerable code
    const vulnerableCode = {
      'auth.js': `
// Hardcoded secret
const JWT_SECRET = 'my-secret-key'

// SQL injection
app.get('/user/:id', (req, res) => {
  const query = \`SELECT * FROM users WHERE id = \${req.params.id}\`
  db.query(query)
})

// XSS vulnerability
app.get('/profile', (req, res) => {
  res.send('<h1>' + req.query.name + '</h1>')
})
      `,
      'payment.js': `
// No input validation
app.post('/charge', (req, res) => {
  stripe.charges.create({
    amount: req.body.amount,
    source: req.body.token
  })
})
      `
    }

    const report = await agent.review(vulnerableCode)

    expect(report.critical).toHaveLength(3)
    expect(report.critical.map(i => i.type)).toContain('HARDCODED_SECRET')
    expect(report.critical.map(i => i.type)).toContain('SQL_INJECTION')
    expect(report.critical.map(i => i.type)).toContain('XSS_VULNERABILITY')
    expect(report.high).toHaveLength(1)
    expect(report.high[0].type).toBe('MISSING_INPUT_VALIDATION')
  })
})
```

### 测试数据管理

#### 固定测试数据（Fixtures）

为 Agent 测试准备固定的测试数据：

```javascript
// tests/fixtures/sample-projects.js

// Good code examples
const goodCode = {
  'auth.ts': `
import bcrypt from 'bcrypt'

export async function validateUser(email: string, password: string) {
  const user = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  )

  if (user && await bcrypt.compare(password, user.passwordHash)) {
    return { id: user.id, email: user.email }
  }

  return null
}
  `,

  'api.ts': `
import { z } from 'zod'

const InputSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email()
})

export async function createUser(input: unknown) {
  const validated = InputSchema.parse(input)

  return db.insert('users', validated)
}
  `
}

// Bad code examples
const badCode = {
  'auth.ts': `
const JWT_SECRET = 'my-secret-123'

export function validateUser(email, password) {
  const query = \`SELECT * FROM users WHERE email = '\${email}'\`
  return db.query(query)
}
  `
}

module.exports = { goodCode, badCode }
```

#### 模拟工具输出

模拟工具的输出以隔离测试：

```javascript
// tests/mocks/tools.js

class MockTools {
  static mockReadFile(content) {
    return jest.fn().mockResolvedValue(content)
  }

  static mockBashCommand(output) {
    return jest.fn().mockResolvedValue({
      stdout: output,
      stderr: '',
      exitCode: 0
    })
  }

  static mockGrepSearch(results) {
    return jest.fn().mockResolvedValue(results)
  }
}

// Usage
describe('Agent with mocked tools', () => {
  let agent
  let mockRead

  beforeEach(() => {
    mockRead = MockTools.mockReadFile('const x = 1')
    agent = new MyAgent({ read: mockRead })
  })

  test('should use read tool', async () => {
    await agent.analyze('file.js')

    expect(mockRead).toHaveBeenCalledWith('file.js')
  })
})
```

### 回归测试

确保 Agent 的改进不会破坏现有功能：

```javascript
// tests/regression/code-reviewer.regression.test.js

const historicalIssues = [
  {
    id: 'REG-001',
    description: 'Should detect hardcoded API keys',
    code: 'const apiKey = "sk-abc123"',
    expectedSeverity: 'CRITICAL'
  },
  {
    id: 'REG-002',
    description: 'Should detect SQL injection',
    code: 'const query = `SELECT * FROM users WHERE id = ${id}`',
    expectedSeverity: 'CRITICAL'
  },
  {
    id: 'REG-003',
    description: 'Should detect missing error handling',
    code: 'fetch(url).then(r => r.json())',
    expectedSeverity: 'HIGH'
  }
]

describe('CodeReviewer Regression Tests', () => {
  const agent = new CodeReviewer()

  historicalIssues.forEach(issue => {
    test(issue.id, async () => {
      const result = await agent.review(issue.code)

      expect(result).toContainEqual(
        expect.objectContaining({
          type: expect.stringMatching(/.*/),
          severity: issue.expectedSeverity
        })
      )
    })
  })
})
```

### 性能测试

测试 Agent 的响应时间和资源消耗：

```javascript
// tests/performance/agent.performance.test.js

describe('Agent Performance', () => {
  test('should complete code review within 30 seconds', async () => {
    const agent = new CodeReviewer()

    // Large codebase
    const files = generateLargeProject(1000) // 1000 files

    const start = Date.now()
    await agent.reviewProject(files)
    const duration = Date.now() - start

    expect(duration).toBeLessThan(30000) // 30 seconds
  })

  test('should handle concurrent requests', async () => {
    const agent = new CodeReviewer()
    const requests = Array(10).fill(null).map(() =>
      agent.review('const x = 1')
    )

    const results = await Promise.all(requests)

    expect(results).toHaveLength(10)
    results.forEach(r => {
      expect(r).toBeDefined()
    })
  })
})
```

## 8.5 部署策略

### 本地部署

#### 开发环境配置

在本地开发环境中部署 Agent：

```bash
# 项目结构
project/
├── .claude/
│   ├── agents/
│   │   ├── custom-agent-1.md
│   │   └── custom-agent-2.md
│   ├── skills/
│   ├── commands/
│   └── hooks/
├── package.json
└── README.md
```

**配置步骤**：

```bash
# 1. 创建配置目录
mkdir -p .claude/agents

# 2. 创建 Agent 文件
cat > .claude/agents/my-custom-agent.md << 'EOF'
---
name: my-custom-agent
description: My custom agent description
tools: ["Read", "Write", "Edit", "Bash"]
model: sonnet
---

# My Custom Agent

You are a custom agent for [purpose].

## Your Role
- [Responsibility 1]
- [Responsibility 2]

## Workflow
1. Step 1
2. Step 2
EOF

# 3. 验证配置
claude-code --list-agents

# 4. 测试 Agent
claude-code --agent my-custom-agent "Test task"
```

#### 环境变量管理

使用环境变量配置 Agent 的行为：

```bash
# .env
CLAUDE_MODEL=sonnet
CLAUDE_MAX_TOKENS=4000
CLAUDE_TEMPERATURE=0.7

# Agent-specific settings
MY_AGENT_API_KEY=sk-xxx
MY_AGENT_DEBUG=true
```

**在 Agent 中使用环境变量**：

```markdown
---
name: api-integration-agent
description: Integrates with external APIs
tools: ["Read", "Bash", "WebFetch"]
model: sonnet
---

## Configuration

This agent uses environment variables for API access:

\`\`\`bash
# Check required environment variables
if [ -z "$API_KEY" ]; then
  echo "ERROR: API_KEY not set"
  exit 1
fi
\`\`\`

## Workflow

1. **Validate Configuration**
   \`\`\`bash
   env | grep API_KEY
   \`\`\`

2. **Make API Request**
   \`\`\`bash
   curl -H "Authorization: Bearer $API_KEY" https://api.example.com
   \`\`\`
```

### 团队共享部署

#### Git 仓库管理

将 Agent 配置纳入版本控制：

```bash
# 初始化 Git 仓库
git init

# 添加 Agent 配置
git add .claude/agents/

# 提交
git commit -m "feat: add custom agents for code review and TDD"

# 推送到远程
git remote add origin https://github.com/org/custom-agents.git
git push -u origin main
```

**团队协作流程**：

```bash
# 1. 克隆仓库
git clone https://github.com/org/custom-agents.git
cd custom-agents

# 2. 创建特性分支
git checkout -b feature/new-security-agent

# 3. 添加新 Agent
cat > .claude/agents/🟢 security-scanner.md << 'EOF'
---
name: 🟢 security-scanner
description: Scans for security vulnerabilities
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---
# Security Scanner Agent
...
EOF

# 4. 测试
claude-code --agent 🟢 security-scanner "Scan this project"

# 5. 提交 PR
git add .claude/agents/🟢 security-scanner.md
git commit -m "feat: add security scanner agent"
git push origin feature/new-security-agent

# 6. 创建 Pull Request
gh pr create --title "Add security scanner agent" \
  --body "New agent for automated security scanning"
```

#### 版本管理策略

为 Agent 定义明确的版本规范：

```markdown
---
name: code-reviewer
version: 2.1.0
description: Expert code review specialist
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
changelog:
  - version: 2.1.0
    date: 2025-03-01
    changes:
      - Added React 19 support
      - Improved security detection
  - version: 2.0.0
    date: 2025-01-15
    changes:
      - Major rewrite for new Claude model
      - Breaking: Changed output format
---
```

**语义化版本控制**：

- **MAJOR**：不兼容的 API 更改
- **MINOR**：向后兼容的功能新增
- **PATCH**：向后兼容的问题修复

### 企业级部署

#### 私有仓库部署

在企业内部部署 Agent 仓库：

```yaml
# .claude/config.yaml
agents:
  registry: https://internal-registry.company.com/agents
  authentication:
    type: token
    token_env: COMPANY_REGISTRY_TOKEN
  cache:
    enabled: true
    ttl: 3600

models:
  default: sonnet
  fallback: haiku
  rate_limits:
    sonnet: 100  # requests per minute
    opus: 50
```

**部署脚本**：

```bash
#!/bin/bash
# scripts/deploy-agents.sh

set -e

REGISTRY_URL="https://internal-registry.company.com"
API_TOKEN="${COMPANY_REGISTRY_TOKEN}"

echo "Deploying agents to internal registry..."

# Find all agent files
for agent_file in .claude/agents/*.md; do
  agent_name=$(basename "$agent_file" .md)

  echo "Deploying $agent_name..."

  # Upload to registry
  curl -X POST \
    -H "Authorization: Bearer $API_TOKEN" \
    -F "file=@$agent_file" \
    "$REGISTRY_URL/api/agents/$agent_name"

  echo "✓ $agent_name deployed"
done

echo "All agents deployed successfully"
```

#### CI/CD 集成

将 Agent 测试和部署集成到 CI/CD 流程：

```yaml
# .github/workflows/agent-ci.yml
name: Agent CI/CD

on:
  push:
    paths:
      - '.claude/agents/**'
  pull_request:
    paths:
      - '.claude/agents/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run agent tests
        run: npm run test:agents

      - name: Validate agent schemas
        run: npm run validate:agents

      - name: Run integration tests
        run: npm run test:integration

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to registry
        env:
          REGISTRY_TOKEN: ${{ secrets.REGISTRY_TOKEN }}
        run: ./scripts/deploy-agents.sh

      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Agents deployed to production'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

#### 监控和日志

监控 Agent 的使用情况和性能：

```javascript
// monitoring/agent-logger.js

class AgentLogger {
  constructor(agentName) {
    this.agentName = agentName
    this.startTime = Date.now()
  }

  logInvocation(input, tools) {
    console.log(JSON.stringify({
      event: 'agent_invocation',
      agent: this.agentName,
      input_length: input.length,
      tools: tools,
      timestamp: new Date().toISOString()
    }))
  }

  logCompletion(output, tokens) {
    const duration = Date.now() - this.startTime

    console.log(JSON.stringify({
      event: 'agent_completion',
      agent: this.agentName,
      output_length: output.length,
      tokens_used: tokens,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    }))
  }

  logError(error) {
    console.error(JSON.stringify({
      event: 'agent_error',
      agent: this.agentName,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }))
  }
}

module.exports = AgentLogger
```

**使用示例**：

```markdown
---
name: monitored-agent
description: Agent with performance monitoring
tools: ["Read", "Write", "Bash"]
model: sonnet
---

## Monitoring Integration

\`\`\`javascript
const AgentLogger = require('monitoring/agent-logger')

const logger = new AgentLogger('monitored-agent')

logger.logInvocation(input, this.tools)

try {
  const result = await this.execute(input)
  logger.logCompletion(result, tokensUsed)
  return result
} catch (error) {
  logger.logError(error)
  throw error
}
\`\`\`
```

### 多环境部署

#### 开发、测试、生产环境

```bash
# 目录结构
agents/
├── dev/
│   ├── agents/
│   │   └── experimental-agent.md
│   └── config.yaml
├── staging/
│   ├── agents/
│   │   ├── code-reviewer.md
│   │   └── security-reviewer.md
│   └── config.yaml
└── prod/
    ├── agents/
    │   ├── code-reviewer.md
    │   ├── security-reviewer.md
    │   └── tdd-guide.md
    └── config.yaml
```

**环境切换脚本**：

```bash
#!/bin/bash
# scripts/switch-env.sh

ENV=${1:-dev}

if [ ! -d "agents/$ENV" ]; then
  echo "Environment $ENV not found"
  exit 1
fi

echo "Switching to $ENV environment..."

# Copy environment-specific config
cp -r agents/$ENV/.claude .claude

# Update Claude Code config
claude-code config set agents-path .claude/agents

echo "✓ Switched to $ENV environment"
echo "Available agents:"
claude-code --list-agents
```

## 8.6 真实案例分析

### 案例一：自动化代码审查 Agent

#### 需求背景

一个开发团队希望自动化代码审查流程，确保所有提交的代码符合质量标准：

1. 检测安全漏洞（SQL 注入、XSS、硬编码密钥）
2. 验证测试覆盖率（至少 80%）
3. 检查代码复杂度（函数长度、嵌套深度）
4. 确保遵循团队编码规范

#### Agent 设计

```markdown
---
name: automated-reviewer
description: Comprehensive code review agent for CI/CD pipelines. Automatically reviews pull requests for security, quality, and testing standards.
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---

You are an automated code reviewer for CI/CD pipelines.

## Your Role

- Block pull requests with CRITICAL security issues
- Warn on quality and maintainability issues
- Verify test coverage meets threshold (80%)
- Check adherence to team coding standards

## Review Workflow

### 1. Gather Changes
\`\`\`bash
# Get PR diff
git diff origin/main...HEAD > /tmp/pr.diff

# Get changed files
git diff --name-only origin/main...HEAD > /tmp/changed-files.txt
\`\`\`

### 2. Security Scan (CRITICAL - Block if found)
\`\`\`bash
# Check for hardcoded secrets
grep -rE "(password|api_key|secret|token).*=.*['\"]" --include="*.ts" --include="*.js"

# Check for SQL injection
grep -rE "SELECT.*\$\{|INSERT.*\$\{" --include="*.ts"

# Check for XSS
grep -rE "innerHTML|dangerouslySetInnerHTML" --include="*.tsx"
\`\`\`

### 3. Quality Check (HIGH - Warn if found)
\`\`\`bash
# Find long functions
for file in $(cat /tmp/changed-files.txt); do
  awk '/^function|^[a-z].*\(/ { start=NR; name=$0 } /^}$/ { if (NR-start > 50) print FILENAME ":" name " is too long (" NR-start " lines)" }' "$file"
done

# Find deep nesting
grep -rE "^\s{16,}" --include="*.ts" --include="*.js" # 4+ levels of indentation

# Find missing error handling
grep -rE "\.then\(" --include="*.ts" | grep -v "catch"
\`\`\`

### 4. Test Coverage Check
\`\`\`bash
# Run tests with coverage
npm run test:coverage -- --reporter=json-summary

# Extract coverage
coverage=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')

if (( $(echo "$coverage < 80" | bc) )); then
  echo "FAIL: Coverage $coverage% is below 80% threshold"
  exit 1
fi
\`\`\`

### 5. Generate Report

\`\`\`markdown
# Code Review Report

## Summary
| Category | Count | Status |
|----------|-------|--------|
| CRITICAL | 0     | ✓ Pass |
| HIGH     | 2     | ⚠ Warn |
| MEDIUM   | 5     | ℹ Info |

## Critical Issues
None found ✓

## High Priority Warnings
1. **Long function in src/utils.ts:42**
   - Function \`processData\` is 67 lines (max: 50)
   - Suggestion: Extract helper functions

2. **Deep nesting in src/api.ts:89**
   - 5 levels of indentation detected
   - Suggestion: Use early returns

## Test Coverage
✓ 84.2% (threshold: 80%)

## Recommendation
⚠ WARN - High priority issues should be addressed before merge.
\`\`\`
```

#### 部署与集成

**GitHub Actions 集成**：

```yaml
# .github/workflows/code-review.yml
name: Automated Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Full history for diff

      - name: Setup Claude Code
        run: |
          npm install -g @anthropic/claude-code
          claude-code config set api-key ${{ secrets.ANTHROPIC_API_KEY }}

      - name: Run Automated Review
        id: review
        run: |
          claude-code --agent automated-reviewer "Review PR #${{ github.event.pull_request.number }}" > review-report.md
          echo "report=$(cat review-report.md)" >> $GITHUB_OUTPUT

      - name: Post Review Comment
        uses: actions/github-script@v6
        with:
          script: |
            const report = `${{ steps.review.outputs.report }}`;
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: report
            });

      - name: Check for Critical Issues
        run: |
          if grep -q "CRITICAL.*[1-9]" review-report.md; then
            echo "Critical issues found - blocking PR"
            exit 1
          fi
```

#### 效果评估

部署后的效果统计：

| 指标 | 部署前 | 部署后 | 改善 |
|------|--------|--------|------|
| 安全漏洞进入生产 | 5/月 | 0/月 | -100% |
| 代码审查耗时 | 45分钟/PR | 5分钟/PR | -89% |
| 测试覆盖率 | 65% | 82% | +26% |
| 代码复杂度超标 | 23% | 8% | -65% |

### 案例二：智能测试生成 Agent

#### 需求背景

团队希望自动生成单元测试，特别是针对：
- 新增的业务逻辑代码
- 复杂的算法实现
- API 端点

#### Agent 设计

```markdown
---
name: test-generator
description: Automatically generates comprehensive unit tests from code. Creates tests for happy paths, edge cases, error scenarios. Achieves 80%+ coverage.
tools: ["Read", "Write", "Edit", "Bash", "Grep"]
model: sonnet
---

You are an intelligent test generation agent.

## Your Role

- Analyze code to understand functionality
- Generate comprehensive unit tests
- Cover happy path, edge cases, and errors
- Ensure 80%+ code coverage

## Test Generation Workflow

### 1. Analyze Code Structure
\`\`\`bash
# Extract function signatures
grep -E "^(export )?(function|const) [a-zA-Z]" src/code.ts

# Identify dependencies
grep -E "import|require" src/code.ts

# Find existing tests (if any)
find tests -name "*.test.ts" -exec basename {} \;
\`\`\`

### 2. Read Code
Read the source file to understand:
- Function signatures
- Input types
- Output types
- Side effects
- Dependencies

### 3. Generate Test Cases

#### Happy Path Tests
\`\`\`typescript
describe('functionName', () => {
  test('should return expected result for valid input', () => {
    const result = functionName(validInput)
    expect(result).toBe(expectedOutput)
  })
})
\`\`\`

#### Edge Cases
\`\`\`typescript
test('should handle empty input', () => {
  expect(functionName('')).toBe('')
})

test('should handle null input', () => {
  expect(() => functionName(null)).toThrow()
})

test('should handle large input', () => {
  const largeInput = 'x'.repeat(10000)
  expect(functionName(largeInput)).toBeDefined()
})
\`\`\`

#### Error Scenarios
\`\`\`typescript
test('should throw on invalid input', () => {
  expect(() => functionName(-1)).toThrow(ValidationError)
})

test('should handle dependency failure', () => {
  mockDependency.mockRejectedValue(new Error('Connection failed'))
  await expect(functionName(input)).rejects.toThrow()
})
\`\`\`

### 4. Mock External Dependencies
\`\`\`typescript
// Mock external services
jest.mock('../services/api')

beforeEach(() => {
  jest.clearAllMocks()
})
\`\`\`

### 5. Verify Coverage
\`\`\`bash
npm test -- --coverage --coverageReporters=json-summary

# Check if coverage >= 80%
coverage=$(jq '.total.lines.pct' coverage/coverage-summary.json)
if (( $(echo "$coverage < 80" | bc) )); then
  echo "Coverage $coverage% is below threshold. Generating additional tests..."
  # Add more tests
fi
\`\`\`
```

#### 使用示例

**输入代码**：

```typescript
// src/utils/validator.ts
export function validateEmail(email: string): boolean {
  if (!email || email.length === 0) {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateAge(age: number): boolean {
  if (typeof age !== 'number' || isNaN(age)) {
    return false
  }

  return age >= 0 && age <= 150
}
```

**Agent 生成的测试**：

```typescript
// tests/utils/validator.test.ts
import { validateEmail, validateAge } from '../../src/utils/validator'

describe('validateEmail', () => {
  describe('happy path', () => {
    test('should return true for valid email', () => {
      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('test.user@domain.org')).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('should return false for empty string', () => {
      expect(validateEmail('')).toBe(false)
    })

    test('should return false for undefined', () => {
      expect(validateEmail(undefined as any)).toBe(false)
    })

    test('should return false for email without @', () => {
      expect(validateEmail('userexample.com')).toBe(false)
    })

    test('should return false for email without domain', () => {
      expect(validateEmail('user@')).toBe(false)
    })

    test('should return false for email with spaces', () => {
      expect(validateEmail('user @example.com')).toBe(false)
    })

    test('should return false for multiple @ symbols', () => {
      expect(validateEmail('user@@example.com')).toBe(false)
    })
  })
})

describe('validateAge', () => {
  describe('happy path', () => {
    test('should return true for valid age', () => {
      expect(validateAge(25)).toBe(true)
      expect(validateAge(0)).toBe(true)
      expect(validateAge(150)).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('should return false for negative age', () => {
      expect(validateAge(-1)).toBe(false)
    })

    test('should return false for age > 150', () => {
      expect(validateAge(151)).toBe(false)
    })

    test('should return false for NaN', () => {
      expect(validateAge(NaN)).toBe(false)
    })

    test('should return false for non-number', () => {
      expect(validateAge('25' as any)).toBe(false)
      expect(validateAge(null as any)).toBe(false)
      expect(validateAge(undefined as any)).toBe(false)
    })
  })
})

// Coverage: 100%
```

#### 集成到开发流程

```bash
# package.json
{
  "scripts": {
    "test:generate": "claude-code --agent test-generator",
    "test:coverage": "jest --coverage --coverageThreshold='{\"global\":{\"lines\":80}}'"
  }
}
```

**Pre-commit Hook**：

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|js)$')

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

# Check if tests exist for each file
for FILE in $STAGED_FILES; do
  TEST_FILE="tests/${FILE%.ts}.test.ts"

  if [ ! -f "$TEST_FILE" ]; then
    echo "No test found for $FILE"
    echo "Generating tests..."
    claude-code --agent test-generator "$FILE"
  fi
done

# Run tests
npm run test:coverage

exit $?
```

### 案例三：多语言代码审查 Agent 集群

#### 需求背景

一个使用多语言技术栈的团队需要针对不同语言的专业代码审查：

- Java 后端服务
- React 前端应用
- Python 数据处理脚本
- Go 微服务
- Rust 性能关键模块

#### 架构设计

使用主 Agent 分发任务到专业 Agent：

```
chief-reviewer (主控)
├── java-reviewer (Java 专家)
├── python-reviewer (Python 专家)
├── go-reviewer (Go 专家)
├── rust-reviewer (Rust 专家)
└── react-reviewer (React 专家)
```

#### 主控 Agent 实现

```markdown
---
name: chief-reviewer
description: Master code reviewer that dispatches to language-specific reviewers. Automatically detects file types and routes to appropriate specialist.
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---

You are the chief code reviewer coordinating multiple language specialists.

## Your Role

- Detect programming languages in changes
- Dispatch to appropriate specialist reviewers
- Aggregate results into unified report
- Ensure consistent quality across all languages

## Dispatch Strategy

### 1. Identify File Types
\`\`\`bash
# Get changed files with extensions
git diff --name-only origin/main...HEAD | awk -F. '{print $NF}' | sort | uniq
\`\`\`

### 2. Route to Specialists

| Extension | Reviewer Agent | Focus Areas |
|-----------|----------------|-------------|
| `.java` | java-reviewer | Spring, Hibernate, JVM performance |
| `.py` | python-reviewer | PEP 8, Django/Flask, async |
| `.go` | go-reviewer | Goroutines, channels, error handling |
| `.rs` | rust-reviewer | Ownership, lifetimes, unsafe |
| `.tsx`, `.ts` | react-reviewer | Hooks, performance, accessibility |

### 3. Execute Reviews
\`\`\`bash
# Run language-specific reviewers
claude-code --agent java-reviewer "Review changes in src/main/java/"
claude-code --agent python-reviewer "Review changes in src/python/"
claude-code --agent go-reviewer "Review changes in cmd/"
\`\`\`

### 4. Aggregate Results
Combine all specialist reports into unified output.
\`\`\`

#### 专业 Agent 示例：Java Reviewer

```markdown
---
name: java-reviewer
description: Java code review specialist. Reviews Spring Boot applications, JPA/Hibernate patterns, and Java best practices.
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---

You are a senior Java developer specializing in enterprise applications.

## Java-Specific Checks

### 1. Spring Boot Best Practices
\`\`\`bash
# Check for proper annotations
grep -r "@Autowired" src/ --include="*.java" | grep -v "constructor"

# Check for proper exception handling
grep -r "catch (Exception e)" src/ --include="*.java"

# Find missing @Transactional
grep -r "@Service" src/ -A 10 | grep -v "@Transactional"
\`\`\`

### 2. JPA/Hibernate Patterns
\`\`\`java
// ❌ BAD: N+1 query problem
List<Order> orders = orderRepository.findAll();
for (Order order : orders) {
    order.getItems().size(); // Triggers N queries
}

// ✅ GOOD: Fetch join
@Query("SELECT o FROM Order o JOIN FETCH o.items")
List<Order> findAllWithItems();
\`\`\`

### 3. Thread Safety
\`\`\`java
// ❌ BAD: Shared mutable state
public class Counter {
    private int count = 0;  // Not thread-safe!

    public void increment() {
        count++;
    }
}

// ✅ GOOD: Atomic operations
public class Counter {
    private AtomicInteger count = new AtomicInteger(0);

    public void increment() {
        count.incrementAndGet();
    }
}
\`\`\`

### 4. Resource Management
\`\`\`java
// ❌ BAD: Potential resource leak
FileInputStream fis = new FileInputStream(file);
// ... code that might throw
fis.close();

// ✅ GOOD: Try-with-resources
try (FileInputStream fis = new FileInputStream(file)) {
    // ... code that might throw
}
\`\`\`
```

#### 使用示例

```bash
# 运行多语言代码审查
claude-code --agent chief-reviewer "Review all changes in PR #42"

# 输出
```

```markdown
# Multi-Language Code Review Report

## Summary

| Language | Files | Issues | Status |
|----------|-------|--------|--------|
| Java | 12 | 3 HIGH | ⚠ Warn |
| Python | 5 | 1 CRITICAL | ❌ Block |
| Go | 3 | 0 | ✓ Pass |
| React | 8 | 2 HIGH | ⚠ Warn |

## Python - CRITICAL Issue ❌

**File**: `src/data/processor.py:45`

**Issue**: SQL Injection Vulnerability
\`\`\`python
# ❌ BAD: String concatenation in SQL
query = f"SELECT * FROM users WHERE id = {user_id}"
cursor.execute(query)
\`\`\`

**Fix**: Use parameterized queries
\`\`\`python
# ✅ GOOD
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
\`\`\`

## Java - HIGH Issues ⚠

**File**: `src/main/java/com/example/OrderService.java:67`

**Issue**: Potential N+1 Query
- The `findAllOrders()` method does not fetch order items
- This will trigger N additional queries when accessing items
- **Suggestion**: Add `@EntityGraph` or fetch join

...

## Recommendation

❌ **BLOCK** - Critical security issue found in Python code.
Please fix before merging.
```

## 8.7 最佳实践总结

### 设计原则

#### 1. 单一职责原则

每个 Agent 应该专注于一个明确的任务：

```yaml
# ✅ 好的设计 - 职责清晰
name: sql-injection-detector
description: Detects SQL injection vulnerabilities
tools: ["Read", "Grep"]
---

# ❌ 不好的设计 - 职责混乱
name: security-and-performance-reviewer
description: Reviews security and performance issues
---
```

#### 2. 最小权限原则

只授予必要的工具权限：

```yaml
# 只读分析 Agent
tools: ["Read", "Grep", "Glob"]  # ✓ 不需要 Write/Edit

# 代码生成 Agent
tools: ["Read", "Write", "Edit"]  # ✓ 需要 Write 权限

# 全功能 Agent
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]  # ⚠ 谨慎使用
```

#### 3. 可测试性原则

Agent 的输出应该是可验证的：

```markdown
## Output Format

Always output in this structured format:
\`\`\`json
{
  "status": "pass|warn|fail",
  "issues": [
    {
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "file": "path/to/file.ts",
      "line": 42,
      "message": "Description of the issue",
      "fix": "Suggested fix"
    }
  ],
  "summary": {
    "critical": 0,
    "high": 2,
    "medium": 5,
    "low": 3
  }
}
\`\`\`
```

### 开发流程

#### 1. 原型设计

从简单的原型开始：

```markdown
---
name: prototype-agent
description: Minimal viable agent
tools: ["Read"]
model: haiku
---

## Prototype Version

This is a minimal version to test the core concept.

1. Read file
2. Apply simple rule
3. Output result
```

#### 2. 迭代增强

逐步添加功能：

1. **v0.1**: 基本功能（原型）
2. **v0.2**: 添加工具
3. **v0.3**: 完善检查清单
4. **v1.0**: 生产就绪

#### 3. 持续改进

基于实际使用反馈改进：

```markdown
## Version History

### v1.2.0 (2025-03-15)
- Added React 19 support
- Improved performance detection
- Fixed false positive for test files

### v1.1.0 (2025-02-20)
- Added custom rules support
- Improved output format

### v1.0.0 (2025-01-10)
- Initial production release
```

### 性能优化

#### 1. 并行处理

使用 `Grep` 和 `Glob` 并行处理多个文件：

```bash
# 并行搜索多个模式
grep -r "TODO\|FIXME\|HACK" src/ &

# 并行处理多个文件
find src -name "*.ts" -exec analyze_file {} \; &
wait
```

#### 2. 缓存策略

缓存不变的计算结果：

```javascript
// Simple file-based cache
const fs = require('fs')
const crypto = require('crypto')

function cacheResult(key, result) {
  const hash = crypto.createHash('md5').update(key).digest('hex')
  const cacheFile = `.cache/${hash}.json`

  fs.writeFileSync(cacheFile, JSON.stringify(result))
}

function getCachedResult(key) {
  const hash = crypto.createHash('md5').update(key).digest('hex')
  const cacheFile = `.cache/${hash}.json`

  if (fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
  }

  return null
}
```

#### 3. 模型选择

根据任务复杂度选择合适的模型：

| 任务类型 | 推荐模型 | 理由 |
|----------|----------|------|
| 简单规则检查 | haiku | 快速、低成本 |
| 常规代码审查 | sonnet | 平衡性能和成本 |
| 复杂架构设计 | opus | 需要深度推理 |

### 错误处理

#### 1. 优雅降级

当工具调用失败时提供备选方案：

```markdown
## Error Handling

### Primary Strategy
\`\`\`bash
npm run lint
\`\`\`

### Fallback Strategy (if npm not available)
\`\`\`bash
yarn lint
\`\`\`

### Manual Check (if tools not available)
Read files manually and apply basic checks.
```

#### 2. 验证输入

验证用户输入和环境状态：

```markdown
## Pre-flight Checks

### 1. Validate Environment
\`\`\`bash
# Check Node.js
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js not installed"
  exit 1
fi

# Check package.json
if [ ! -f "package.json" ]; then
  echo "ERROR: Not a Node.js project"
  exit 1
fi
\`\`\`

### 2. Validate Input
\`\`\`bash
if [ -z "$1" ]; then
  echo "ERROR: No file path provided"
  echo "Usage: $0 <file-path>"
  exit 1
fi
\`\`\`
```

### 文档化

#### 1. Agent 文档模板

```markdown
# Agent Name

## Overview
Brief description of what this agent does.

## Prerequisites
- Required tools
- Environment setup
- Dependencies

## Usage
\`\`\`bash
claude-code --agent agent-name "task description"
\`\`\`

## Configuration
Environment variables and settings.

## Examples
Real-world usage examples.

## Output Format
Structure of agent output.

## Troubleshooting
Common issues and solutions.

## Version History
Changelog.
```

#### 2. 使用指南

为每个 Agent 编写详细的使用指南：

```markdown
# Security Reviewer Agent - Usage Guide

## Quick Start

\`\`\`bash
# Review current changes
claude-code --agent security-reviewer "Review staged changes"

# Review specific files
claude-code --agent security-reviewer "Review auth.ts"
\`\`\`

## Common Scenarios

### Scenario 1: Pre-commit Hook
Automatically review code before commit.

### Scenario 2: CI/CD Integration
Integrate into GitHub Actions pipeline.

### Scenario 3: Manual Review
On-demand security audit.

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `severity_threshold` | HIGH | Minimum severity to report |
| `exclude_tests` | true | Skip test files |
| `custom_rules` | [] | Additional custom rules |

## Troubleshooting

### Issue: Agent reports false positives
**Solution**: Add exceptions to `.claude/rules/security-exceptions.md`

### Issue: Agent timeout
**Solution**: Increase timeout or analyze smaller codebase
```

## 8.8 总结

### 关键要点

1. **Agent 架构**：理解 Agent 的结构（元数据、工具、工作流程）是开发的基础

2. **开发模式**：选择合适的模式（分析型、执行型、协调型、特定领域）

3. **工具集成**：合理配置工具权限，确保安全性和功能性

4. **测试策略**：分层测试（单元、集成、场景）确保 Agent 质量

5. **部署实践**：从本地到企业级，逐步完善部署流程

6. **持续改进**：通过监控、日志和反馈不断优化 Agent

### 下一步

在下一章，我们将探讨团队协作与项目管理，学习如何：
- 配置团队共享的 Agent
- 建立代码审查工作流
- 管理 Agent 版本和更新
- 构建团队知识库

### 延伸阅读

- Claude Code 官方文档：Agent 开发指南
- 示例 Agent 仓库：`agents/` 目录中的实际案例
- 社区贡献：参与开源 Agent 开发

---

**练习建议**：

1. 创建一个简单的分析型 Agent，检测代码中的 TODO 注释
2. 开发一个执行型 Agent，自动格式化代码
3. 构建一个特定领域的 Agent，针对您常用的框架
4. 为您的 Agent 编写完整的测试套件
5. 将 Agent 部署到团队环境，收集反馈并改进
