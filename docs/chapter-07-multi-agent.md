# 第6章 多智能体协作工作流

> "单个智能体再强大,也不如协作的团队。多智能体系统将复杂任务化繁为简,通过专业化分工和并行执行实现质的飞跃。"

## 本章概述

在现代软件开发中,单靠一个智能体往往难以应对复杂的多维度任务。多智能体协作工作流通过专业化分工、并行执行和智能调度,让多个专门的智能体协同工作,实现远超单体智能的效果。

本章将深入探讨 Claude Code 的多智能体系统架构,涵盖智能体编排、通信模式、并行策略和实战案例。通过本章的学习,你将掌握:

- 多智能体系统的设计原则和架构模式
- 智能体间通信和协作机制
- 并行任务执行和结果合并策略
- 智能体专业化与角色分工
- 实际项目中的多智能体编排实战
- 性能优化和成本控制技巧

## 6.1 多智能体系统架构

### 6.1.1 为什么需要多智能体协作

传统的单一智能体模式存在以下局限:

**能力限制**:
- 单个智能体难以精通所有领域(前端、后端、数据库、AI等)
- 复杂任务需要多维度专业知识
- 缺乏专业化导致解决方案不够深入

**效率瓶颈**:
- 串行执行导致时间成本高
- 无法利用并行计算能力
- 大任务上下文过载影响质量

**可靠性问题**:
- 单点故障风险
- 缺乏交叉验证
- 错误传播难以控制

多智能体协作的优势:

| 维度 | 单智能体 | 多智能体协作 |
|------|---------|-------------|
| **专业性** | 泛而不精 | 高度专业化 |
| **执行速度** | 串行处理 | 并行加速 |
| **可靠性** | 单点风险 | 容错冗余 |
| **可扩展性** | 受限 | 灵活扩展 |
| **成本效率** | 高成本低质量 | 按需调度优化成本 |

### 6.1.2 Claude Code 智能体体系

Claude Code 提供了丰富的预定义智能体,每个智能体专注于特定领域:

**规划类智能体**:
- `planner` — 需求分析和任务分解专家
- `architect` — 系统架构设计专家

**开发类智能体**:
- `tdd-guide` — 测试驱动开发专家
- `code-reviewer` — 通用代码审查专家
- `python-reviewer` — Python 代码审查专家
- `go-reviewer` — Go 代码审查专家
- `rust-reviewer` — Rust 代码审查专家

**运维类智能体**:
- `build-error-resolver` — 构建错误解决专家
- `e2e-runner` — 端到端测试执行专家
- `refactor-cleaner` — 重构清理专家

**协调类智能体**:
- `chief-of-staff` — 多渠道通信协调专家
- `loop-operator` — 自主循环监控专家

**领域专家智能体**:
- `security-reviewer` — 安全审查专家
- `database-reviewer` — 数据库审查专家
- `doc-updater` — 文档更新专家

### 6.1.3 智能体定义格式

每个智能体都是 Markdown 文件,包含 YAML frontmatter 和详细说明:

```markdown
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability.
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---

You are a senior code reviewer ensuring high standards of code quality and security.

## Review Process

When invoked:
1. **Gather context** — Run `git diff` to see changes
2. **Understand scope** — Identify affected components
...
```

**关键字段说明**:

- **name**: 智能体唯一标识符
- **description**: 功能描述,用于自动调度决策
- **tools**: 可用工具列表(Read, Write, Edit, Bash, Grep 等)
- **model**: 推荐使用的模型(opus, sonnet, haiku)
- **color**: 可选,用于终端输出高亮

### 6.1.4 智能体调度原理

Claude Code 使用智能调度算法决定何时调用哪个智能体:

```
用户请求 → 任务分析 → 智能体匹配 → 执行 → 结果合并
           ↓
    任务类型识别
    - 规划任务 → planner
    - 架构设计 → architect
    - 代码编写 → tdd-guide
    - 代码审查 → code-reviewer
    - 构建错误 → build-error-resolver
```

**调度策略**:

1. **关键词匹配**: 根据请求中的关键词匹配智能体描述
2. **上下文推断**: 根据当前代码上下文推断需要的智能体
3. **用户显式调用**: 用户通过 `--agent` 参数直接指定
4. **工作流触发**: 在特定工作流中自动激活相关智能体

**示例**:

```bash
# 自动调度: Claude Code 识别为规划任务
claude-code "实现一个用户认证系统"

# 显式调用: 直接指定智能体
claude-code --agent planner "实现一个用户认证系统"

# 命令触发: 🔵 `/plan` 命令自动激活 planner
claude-code 🔵 `/plan` "实现一个用户认证系统"
```

## 6.2 智能体通信模式

### 6.2.1 主从模式(Master-Worker)

最常用的协作模式,一个主智能体协调多个工作智能体:

```
┌──────────────┐
│ 主智能体      │ (planner, architect, chief-of-staff)
│ (Coordinator)│
└──────┬───────┘
       │
       ├─────────┬─────────┬─────────┐
       │         │         │         │
   ┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐
   │Worker1│ │Worker2│ │Worker3│ │Worker4│
   │tdd-   │ │code-  │ │build- │ │e2e-   │
   │guide  │ │reviewer│ │error  │ │runner │
   └───────┘ └───────┘ └───────┘ └───────┘
```

**特点**:
- 主智能体负责任务分解、调度、结果合并
- 工作智能体专注于具体执行
- 清晰的责任边界
- 易于监控和调试

**示例场景: 新功能开发流程**

```
用户: 实现用户登录功能

主智能体(planner):
  1. 分解任务:
     - 设计 API 接口
     - 编写测试用例
     - 实现功能代码
     - 执行代码审查
     - 运行端到端测试

  2. 调度执行:
     → architect: 设计登录 API
     → tdd-guide: 编写登录测试
     → (用户编写实现代码)
     → code-reviewer: 审查代码质量
     → e2e-runner: 运行 E2E 测试

  3. 结果合并:
     - 收集各智能体输出
     - 综合评估进度
     - 生成最终报告
```

### 6.2.2 流水线模式(Pipeline)

智能体按顺序执行,每个智能体的输出作为下一个智能体的输入:

```
Input → [Agent1] → Output1 → [Agent2] → Output2 → [Agent3] → Final Output

示例: 代码提交流水线

代码修改 → [code-reviewer] → 审查报告 → [refactor-cleaner] → 重构代码 → [test-runner] → 测试报告
```

**配置示例**:

```yaml
# .claude/pipelines/code-commit.yaml
name: code-commit-pipeline
description: Code commit quality pipeline
steps:
  - agent: code-reviewer
    input: git-diff
    output: review-report

  - agent: refactor-cleaner
    condition: review-report.issues > 0
    input: current-code
    output: refactored-code

  - agent: tdd-guide
    input: refactored-code
    output: test-coverage-report

  - agent: security-reviewer
    input: refactored-code
    output: security-audit-report
```

**特点**:
- 清晰的执行顺序
- 每步输出可验证
- 易于插入新的智能体环节
- 支持条件分支

### 6.2.3 并行模式(Parallel)

多个独立智能体同时执行,最后合并结果:

```
        ┌─────────────┐
        │ Task Split  │
        └──────┬──────┘
               │
       ┌───────┼───────┐
       │       │       │
   ┌───▼───┐ ┌─▼───┐ ┌─▼───┐
   │Agent A│ │Agent B│ │Agent C│
   │(并行) │ │(并行) │ │(并行) │
   └───┬───┘ └─┬───┘ └─┬───┘
       │       │       │
       └───────┼───────┘
               │
        ┌──────▼──────┐
        │ Result Merge│
        └─────────────┘
```

**应用场景**:

1. **多语言代码审查**: 同时审查不同编程语言的代码

```bash
# 并行审查多语言项目
parallel-review() {
  # 同时启动多个审查智能体
  claude-code --agent python-reviewer "审查 src/python/" &
  claude-code --agent go-reviewer "审查 src/go/" &
  claude-code --agent rust-reviewer "审查 src/rust/" &

  # 等待所有审查完成
  wait

  # 合并审查报告
  merge-reports
}
```

2. **全方位质量检查**: 同时进行代码审查、安全审查、性能分析

```bash
# 多维度并行检查
quality-check() {
  claude-code --agent code-reviewer "审查代码质量" > quality.md &
  claude-code --agent security-reviewer "扫描安全漏洞" > security.md &
  claude-code --agent database-reviewer "检查数据库查询" > database.md &

  wait

  # 生成综合报告
  cat quality.md security.md database.md > full-report.md
}
```

**特点**:
- 显著缩短总执行时间
- 充分利用计算资源
- 智能体间无依赖
- 结果合并需要设计

### 6.2.4 协作模式(Collaborative)

多个智能体共同解决一个问题,通过共享上下文协作:

```
┌─────────────────────────────────────┐
│         共享上下文(Context)          │
│  - 代码库状态                        │
│  - 已完成的决策                      │
│  - 待解决问题                        │
└──────────┬───────────────────────────┘
           │
    ┌──────┼──────┐
    │      │      │
┌───▼───┐ │  ┌───▼───┐
│Agent A│ │  │Agent B│
│提供方案│ │  │验证方案│
└───┬───┘ │  └───┬───┘
    │     │      │
    └──┬──┴──────┘
       │
   ┌───▼───┐
   │Agent C│
   │优化方案│
   └───────┘
```

**示例: 架构设计协作**

```bash
# 多智能体架构设计协作
claude-code <<EOF
设计一个高可用电商平台架构

请使用以下协作模式:
1. architect: 设计初始架构
2. database-reviewer: 评估数据库方案
3. security-reviewer: 审查安全设计
4. architect: 综合反馈优化方案
EOF
```

**执行过程**:

```
[architect] 初始架构:
- 微服务架构
- PostgreSQL 主从复制
- Redis 缓存层
- RabbitMQ 消息队列

[database-reviewer] 数据库评估:
- 建议添加读写分离
- 推荐使用连接池
- 需要分库分表方案

[security-reviewer] 安全审查:
- 添加 API Gateway
- 实施服务间 mTLS
- 增加审计日志

[architect] 优化方案:
- 采用服务网格(Service Mesh)
- 分库分表 + 读写分离
- 多层缓存(本地 + Redis + CDN)
- 全链路追踪
```

### 6.2.5 层级模式(Hierarchical)

多级智能体树状结构,高层智能体管理低层智能体:

```
              ┌──────────┐
              │   CEO    │ (chief-of-staff)
              │ Agent    │
              └────┬─────┘
                   │
         ┌─────────┼─────────┐
         │         │         │
    ┌────▼───┐ ┌───▼────┐ ┌──▼─────┐
    │Manager │ │Manager │ │Manager │
    │ Agent  │ │ Agent  │ │ Agent  │
    └────┬───┘ └───┬────┘ └──┬─────┘
         │         │         │
    ┌────┼────┐    │    ┌────┼────┐
    │    │    │    │    │    │    │
   ┌▼┐  ┌▼┐  ┌▼┐ ┌▼┐  ┌▼┐  ┌▼┐  ┌▼┐
   └─┘  └─┘  └─┘ └─┘  └─┘  └─┘  └─┘
  Worker Agents
```

**示例: 大型项目重构**

```
[chief-of-staff] 项目重构总协调
  │
  ├── [architect] 后端架构重构
  │     ├── [go-reviewer] Go 代码审查
  │     ├── [rust-reviewer] Rust 代码审查
  │     └── [database-reviewer] 数据库迁移
  │
  ├── [architect] 前端架构重构
  │     ├── [code-reviewer] React 代码审查
  │     └── [refactor-cleaner] 代码清理
  │
  └── [tdd-guide] 测试覆盖保障
        └── [e2e-runner] E2E 测试执行
```

## 6.3 并行任务执行策略

### 6.3.1 任务分解原则

并行执行的前提是正确的任务分解。遵循以下原则:

**独立性原则**:
- 分解后的子任务应尽量独立
- 最小化子任务间的依赖关系
- 明确定义任务边界

**粒度原则**:
- 粒度适中: 太粗无法并行,太细调度开销大
- 参考粒度: 每个子任务 1-2 小时工作量
- 同层级任务粒度应相近

**完整性原则**:
- 所有子任务组合应覆盖完整需求
- 避免任务重叠和遗漏
- 明确定义任务完成标准

**示例: 用户认证系统任务分解**

```yaml
# 任务分解树
用户认证系统:
  子任务1: 密码加密模块 (独立,2小时)
    - 哈希函数实现
    - 验证函数实现
    - 单元测试

  子任务2: JWT 令牌模块 (独立,2小时)
    - 令牌生成
    - 令牌验证
    - 过期处理

  子任务3: 用户注册 API (依赖1,2,3小时)
    - 输入验证
    - 数据库操作
    - 集成测试

  子任务4: 用户登录 API (依赖1,2,3,3小时)
    - 凭证验证
    - 令牌返回
    - 集成测试

  子任务5: E2E 测试 (依赖3,4,2小时)
    - 注册流程测试
    - 登录流程测试
```

**并行调度方案**:

```
阶段1(并行): 子任务1 + 子任务2
  ├─ tdd-guide: 密码模块
  └─ tdd-guide: JWT模块

阶段2(串行): 子任务3
  └─ tdd-guide: 注册API

阶段3(串行): 子任务4
  └─ tdd-guide: 登录API

阶段4(串行): 子任务5
  └─ e2e-runner: E2E测试
```

### 6.3.2 并行执行实现

**Bash 并行脚本**:

```bash
#!/bin/bash
# parallel-agents.sh — 并行执行多个智能体

# 任务列表
tasks=(
  "python-reviewer:审查 src/api/"
  "go-reviewer:审查 src/services/"
  "rust-reviewer:审查 src/core/"
)

# 并行执行函数
run_agent() {
  local task="$1"
  local agent=$(echo "$task" | cut -d: -f1)
  local command=$(echo "$task" | cut -d: -f2)

  echo "[START] $agent: $command"
  claude-code --agent "$agent" "$command" > "reports/${agent}.md"
  echo "[DONE] $agent"
}

export -f run_agent

# 创建报告目录
mkdir -p reports

# 并行执行(最多3个并行)
printf '%s\n' "${tasks[@]}" | xargs -P 3 -I {} bash -c 'run_agent "$@"' _ {}

# 合并报告
cat reports/*.md > reports/combined.md
echo "All agents completed. Combined report: reports/combined.md"
```

**Node.js 并行控制**:

```javascript
// scripts/parallel-agents.js
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// 智能体任务配置
const tasks = [
  {
    agent: 'code-reviewer',
    command: '审查 src/',
    output: 'reports/code-review.md'
  },
  {
    agent: 'security-reviewer',
    command: '扫描安全漏洞',
    output: 'reports/security-review.md'
  },
  {
    agent: 'database-reviewer',
    command: '检查数据库查询',
    output: 'reports/database-review.md'
  }
];

// 执行单个智能体
async function runAgent(task) {
  console.log(`[START] ${task.agent}: ${task.command}`);
  const { stdout, stderr } = await execAsync(
    `claude-code --agent ${task.agent} "${task.command}"`
  );

  // 写入报告
  await fs.writeFile(task.output, stdout);
  console.log(`[DONE] ${task.agent}`);
  return { agent: task.agent, output: task.output };
}

// 并行执行(控制并发数)
async function runParallel(tasks, maxConcurrency = 3) {
  const results = [];
  const executing = [];

  for (const task of tasks) {
    const promise = runAgent(task).then(result => {
      executing.splice(executing.indexOf(promise), 1);
      return result;
    });

    results.push(promise);
    executing.push(promise);

    if (executing.length >= maxConcurrency) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

// 主函数
async function main() {
  console.log('Starting parallel agent execution...');
  const results = await runParallel(tasks, 3);
  console.log('All agents completed:', results);
}

main().catch(console.error);
```

### 6.3.3 结果合并策略

并行执行后需要智能合并结果:

**简单合并**: 直接拼接所有输出

```bash
# 简单拼接
cat reports/*.md > combined-report.md
```

**结构化合并**: 按类别组织结果

```javascript
// scripts/merge-reports.js
import fs from 'fs';

const reports = {
  quality: 'reports/code-review.md',
  security: 'reports/security-review.md',
  database: 'reports/database-review.md'
};

function mergeReports() {
  const summary = {
    overallStatus: 'PASS',
    criticalIssues: 0,
    warnings: 0,
    details: {}
  };

  for (const [category, file] of Object.entries(reports)) {
    const content = fs.readFileSync(file, 'utf-8');

    // 解析报告内容
    const criticalCount = (content.match(/CRITICAL/g) || []).length;
    const warningCount = (content.match(/WARNING/g) || []).length;

    summary.criticalIssues += criticalCount;
    summary.warnings += warningCount;
    summary.details[category] = {
      critical: criticalCount,
      warnings: warningCount,
      status: criticalCount > 0 ? 'FAIL' : 'PASS'
    };
  }

  // 确定总体状态
  if (summary.criticalIssues > 0) {
    summary.overallStatus = 'FAIL';
  } else if (summary.warnings > 0) {
    summary.overallStatus = 'WARN';
  }

  return summary;
}

const report = mergeReports();
console.log(JSON.stringify(report, null, 2));
```

**智能合并**: AI 辅助冲突解决

```bash
# 使用 AI 智能合并报告
claude-code --agent chief-of-staff "合并以下审查报告,生成综合评估:
- reports/code-review.md
- reports/security-review.md
- reports/database-review.md

要求:
1. 识别重复问题,只保留一次
2. 按严重程度排序
3. 提供修复优先级建议
"
```

## 6.4 智能体专业化策略

### 6.4.1 语言专家智能体

针对不同编程语言创建专门的审查智能体,提供更深度的分析:

**Python 审查专家**:

```markdown
---
name: python-reviewer
description: Expert Python code reviewer specializing in Pythonic idioms, type safety, and ecosystem best practices.
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---

You are a senior Python developer with deep expertise in Python best practices.

## Review Focus

### Pythonic Code
- Use list/dict comprehensions over loops
- Prefer `with` statements for resource management
- Use type hints consistently
- Follow PEP 8 style guide

### Type Safety
- Missing type hints
- Incorrect type annotations
- Use of `Any` when specific types are available
- mypy compatibility

### Ecosystem Best Practices
- Poetry for dependency management
- Pytest for testing
- Black for formatting
- Ruff for linting

### Common Pitfalls
- Mutable default arguments
- Late binding closures
- Missing `__all__` exports
- Improper exception handling

## Example Review

```python
# ❌ BAD: Mutable default argument
def add_item(item, items=[]):
    items.append(item)
    return items

# ✅ GOOD: Immutable default
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```
```

**Go 审查专家**:

```markdown
---
name: go-reviewer
description: Expert Go code reviewer specializing in idiomatic Go, concurrency patterns, and performance optimization.
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---

You are a senior Go developer with deep expertise in idiomatic Go.

## Review Focus

### Idiomatic Go
- Error handling patterns
- Interface design
- Package organization
- Naming conventions

### Concurrency
- Goroutine leak detection
- Channel usage patterns
- Race condition identification
- Context propagation

### Performance
- Memory allocation optimization
- Slice preallocation
- String builder usage
- Benchmarking practices

## Example Review

```go
// ❌ BAD: Ignoring error
data, _ := json.Marshal(obj)

// ✅ GOOD: Handle error explicitly
data, err := json.Marshal(obj)
if err != nil {
    return fmt.Errorf("marshal failed: %w", err)
}
```
```

**Rust 审查专家**:

```markdown
---
name: rust-reviewer
description: Expert Rust code reviewer specializing in ownership, borrowing, and zero-cost abstractions.
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---

You are a senior Rust developer with deep expertise in systems programming.

## Review Focus

### Ownership & Borrowing
- Lifetime annotation correctness
- Borrow checker compliance
- Move semantics
- Reference validity

### Memory Safety
- Unsafe block justification
- Buffer overflow risks
- Use-after-free prevention
- Null pointer dereference

### Idiomatic Rust
- Option/Result usage
- Iterator methods
- Trait design
- Error propagation

## Example Review

```rust
// ❌ BAD: Unnecessary clone
let name = user.name.clone();
println!("{}", name);

// ✅ GOOD: Borrow when possible
println!("{}", user.name);
```
```

### 6.4.2 领域专家智能体

针对特定技术领域创建专家智能体:

**数据库审查专家**:

```markdown
---
name: database-reviewer
description: Database specialist reviewing queries, schema design, and performance optimizations.
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---

You are a database performance engineer.

## Review Focus

### Query Optimization
- N+1 query detection
- Missing indexes
- Inefficient JOINs
- Unbounded queries

### Schema Design
- Normalization vs denormalization
- Index strategy
- Foreign key constraints
- Migration safety

### Performance
- Query execution plans
- Connection pooling
- Caching strategies
- Batch operations

## Example Review

```sql
-- ❌ BAD: N+1 query pattern
SELECT * FROM users;
-- Then for each user:
SELECT * FROM orders WHERE user_id = ?;

-- ✅ GOOD: Single query with JOIN
SELECT u.*, o.*
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```
```

**安全审查专家**:

```markdown
---
name: security-reviewer
description: Security specialist identifying vulnerabilities, compliance issues, and hardening opportunities.
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---

You are a security engineer specializing in application security.

## Review Focus

### Vulnerability Detection
- SQL injection
- XSS (Cross-Site Scripting)
- CSRF (Cross-Site Request Forgery)
- Path traversal
- Authentication bypass

### Cryptography
- Weak hashing algorithms (MD5, SHA1)
- Insecure random number generation
- Hardcoded secrets
- SSL/TLS misconfiguration

### Compliance
- GDPR data handling
- OWASP Top 10
- SOC 2 requirements
- PCI DSS compliance

## Example Review

```javascript
// ❌ BAD: SQL injection vulnerability
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ GOOD: Parameterized query
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);
```
```

### 6.4.3 构建错误解决专家

针对不同构建系统创建专门的错误解决智能体:

```markdown
---
name: java-build-resolver
description: Java build error specialist for Maven and Gradle issues.
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---

You are a Java build expert.

## Common Issues

### Maven
- Dependency conflicts
- Plugin version mismatches
- Repository access issues
- Build lifecycle problems

### Gradle
- Version catalog issues
- Dependency resolution errors
- Build script syntax errors
- Plugin configuration

## Resolution Strategy

1. Parse build error log
2. Identify root cause
3. Check dependency tree
4. Apply fix
5. Verify build success

## Example Resolution

Error:
```
[ERROR] Failed to execute goal on project my-app:
Could not resolve dependencies for project com.example:my-app:jar:1.0:
Failed to collect dependencies at com.fasterxml.jackson.core:jackson-databind:jar:2.13.0
```

Fix:
```xml
<!-- Add explicit dependency version -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.15.0</version>
</dependency>
```
```

### 6.4.4 自定义专家智能体

根据项目需求创建定制化智能体:

**API 设计审查专家**:

```markdown
---
name: api-design-reviewer
description: RESTful API design specialist ensuring consistency, usability, and best practices.
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---

You are an API design expert.

## Review Criteria

### RESTful Principles
- Resource-oriented URLs
- Correct HTTP methods
- Status code usage
- HATEOAS compliance

### Consistency
- Naming conventions
- Request/response formats
- Error handling
- Pagination patterns

### Usability
- Clear documentation
- Example requests
- Error messages
- Versioning strategy

## Example Review

```yaml
# ❌ BAD: Inconsistent naming
GET /api/users
GET /api/getOrders  # Wrong verb
POST /api/userCreate  # Wrong pattern

# ✅ GOOD: Consistent RESTful design
GET /api/users
GET /api/orders
POST /api/orders
```
```

## 6.5 实战案例: 全栈项目审查流程

### 6.5.1 项目背景

假设我们有一个全栈电商项目,包含:
- **前端**: Next.js + React + TypeScript
- **后端 API**: Node.js + Express + TypeScript
- **微服务**: Go + Rust
- **数据库**: PostgreSQL + Redis

项目结构:

```
ecommerce-platform/
├── frontend/          # Next.js 应用
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
│
├── api/               # Node.js API
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   └── package.json
│
├── services/          # 微服务
│   ├── payment/       # Go
│   │   ├── main.go
│   │   └── go.mod
│   └── inventory/     # Rust
│       ├── src/
│       └── Cargo.toml
│
└── database/
    ├── migrations/
    └── queries/
```

### 6.5.2 多智能体审查编排

创建一个综合审查流程,利用多个专家智能体并行审查:

```bash
#!/bin/bash
# comprehensive-review.sh — 全栈项目综合审查

set -e

echo "=== 全栈项目综合审查开始 ==="

# 创建报告目录
mkdir -p reports

# 阶段1: 并行审查各模块(前端、API、微服务)
echo "[Phase 1] 并行审查各模块..."

# 前端审查(TypeScript)
claude-code --agent code-reviewer \
  "审查 frontend/ 目录,关注 React 最佳实践、性能优化、无障碍访问" \
  > reports/frontend-review.md &

# API 审查(Node.js)
claude-code --agent code-reviewer \
  "审查 api/ 目录,关注 API 设计、错误处理、安全性" \
  > reports/api-review.md &

# 支付服务审查(Go)
claude-code --agent go-reviewer \
  "审查 services/payment/ 目录,关注并发安全、错误处理" \
  > reports/payment-service-review.md &

# 库存服务审查(Rust)
claude-code --agent rust-reviewer \
  "审查 services/inventory/ 目录,关注内存安全、性能" \
  > reports/inventory-service-review.md &

# 数据库审查
claude-code --agent database-reviewer \
  "审查 database/ 目录,关注查询性能、索引优化" \
  > reports/database-review.md &

# 安全审查(全项目)
claude-code --agent security-reviewer \
  "扫描整个项目的安全漏洞,关注认证、授权、数据验证" \
  > reports/security-review.md &

# 等待所有审查完成
wait

echo "[Phase 1] 并行审查完成"

# 阶段2: 生成综合报告
echo "[Phase 2] 生成综合报告..."

claude-code --agent chief-of-staff \
  "合并以下审查报告,生成综合评估:
  - reports/frontend-review.md
  - reports/api-review.md
  - reports/payment-service-review.md
  - reports/inventory-service-review.md
  - reports/database-review.md
  - reports/security-review.md

  要求:
  1. 按严重程度分类(CRITICAL/HIGH/MEDIUM/LOW)
  2. 去重相似问题
  3. 提供修复优先级
  4. 估算修复时间
  " > reports/comprehensive-report.md

echo "=== 审查完成 ==="
echo "综合报告: reports/comprehensive-report.md"

# 显示摘要
grep -A 20 "## Summary" reports/comprehensive-report.md
```

### 6.5.3 审查结果示例

**前端审查报告** (`reports/frontend-review.md`):

```markdown
# Frontend Code Review

## Critical Issues

### 1. Memory Leak in useEffect
**File**: frontend/src/components/ProductList.tsx:42
**Issue**: Subscription not cleaned up in useEffect

```typescript
// ❌ BAD: Missing cleanup
useEffect(() => {
  subscribeToProducts(setProducts);
}, []);

// ✅ GOOD: Return cleanup function
useEffect(() => {
  const unsubscribe = subscribeToProducts(setProducts);
  return () => unsubscribe();
}, []);
```

## High Priority Issues

### 2. Missing Error Boundary
**File**: frontend/src/pages/_app.tsx
**Issue**: No error boundary to catch rendering errors

...

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 1     | FAIL   |
| HIGH     | 3     | WARN   |
| MEDIUM   | 5     | INFO   |
| LOW      | 8     | NOTE   |
```

**API 审查报告** (`reports/api-review.md`):

```markdown
# API Code Review

## Critical Issues

### 1. SQL Injection Vulnerability
**File**: api/src/routes/products.ts:87
**Issue**: Unsanitized user input in SQL query

```typescript
// ❌ BAD: SQL injection
const query = `SELECT * FROM products WHERE name LIKE '%${searchTerm}%'`;

// ✅ GOOD: Parameterized query
const query = `SELECT * FROM products WHERE name LIKE $1`;
const result = await db.query(query, [`%${searchTerm}%`]);
```

...
```

**综合报告** (`reports/comprehensive-report.md`):

```markdown
# 全栈项目综合审查报告

生成时间: 2025-01-15 14:30:00

## 执行摘要

本次审查覆盖全栈电商平台的 6 个主要模块,共发现:
- **CRITICAL**: 3 个严重问题(必须修复)
- **HIGH**: 12 个高优先级问题(建议修复)
- **MEDIUM**: 28 个中等问题
- **LOW**: 45 个低优先级问题

## 严重问题列表

### 1. [CRITICAL] SQL 注入漏洞
**模块**: API
**文件**: api/src/routes/products.ts:87
**影响**: 可能导致数据库被攻击者完全控制
**修复时间**: 15 分钟
**优先级**: P0 (立即修复)

### 2. [CRITICAL] 内存泄漏
**模块**: Frontend
**文件**: frontend/src/components/ProductList.tsx:42
**影响**: 长时间使用后页面卡顿甚至崩溃
**修复时间**: 10 分钟
**优先级**: P0 (立即修复)

### 3. [CRITICAL] 认证绕过
**模块**: Payment Service
**文件**: services/payment/main.go:156
**影响**: 未授权用户可能访问支付接口
**修复时间**: 30 分钟
**优先级**: P0 (立即修复)

## 修复优先级建议

### 第一批(今天完成)
1. SQL 注入漏洞(API)
2. 内存泄漏(Frontend)
3. 认证绕过(Payment Service)

### 第二批(本周完成)
1. N+1 查询优化(Database)
2. 竞态条件修复(Inventory Service)
3. 添加错误边界(Frontend)

### 第三批(下周完成)
1. 代码重构和清理
2. 性能优化
3. 测试覆盖率提升

## 预估总修复时间
- CRITICAL: 1 小时
- HIGH: 4 小时
- MEDIUM: 8 小时
- LOW: 12 小时
**总计**: 25 小时
```

### 6.5.4 持续集成配置

将多智能体审查集成到 CI/CD 流程:

```yaml
# .github/workflows/comprehensive-review.yml
name: Comprehensive Code Review

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  review:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 需要完整历史进行差异分析

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Claude Code
        run: npm install -g @anthropic/claude-code

      - name: Run Parallel Reviews
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          mkdir -p reports

          # 并行执行审查
          claude-code --agent code-reviewer \
            "审查 frontend/ 和 api/ 目录的变更" \
            > reports/code-review.md &

          claude-code --agent go-reviewer \
            "审查 services/payment/ 目录的变更" \
            > reports/go-review.md &

          claude-code --agent rust-reviewer \
            "审查 services/inventory/ 目录的变更" \
            > reports/rust-review.md &

          claude-code --agent security-reviewer \
            "扫描安全漏洞" \
            > reports/security-review.md &

          # 等待所有审查完成
          wait

      - name: Generate Summary Report
        run: |
          claude-code --agent chief-of-staff \
            "合并所有审查报告并生成摘要" \
            > reports/summary.md

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const summary = fs.readFileSync('reports/summary.md', 'utf8');

            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: summary
            });

      - name: Upload Reports
        uses: actions/upload-artifact@v3
        with:
          name: review-reports
          path: reports/
          retention-days: 30

      - name: Check for Critical Issues
        run: |
          if grep -q "CRITICAL.*FAIL" reports/summary.md; then
            echo "::error::Critical issues found. Please fix before merging."
            exit 1
          fi
```

## 6.6 性能优化与成本控制

### 6.6.1 智能体选择策略

不同智能体使用不同的模型,合理选择可优化成本:

**模型层级**:
- **Opus**: 最高能力,最高成本(planner, architect, chief-of-staff)
- **Sonnet**: 平衡能力和成本(code-reviewer, tdd-guide)
- **Haiku**: 快速低成本(简单任务)

**成本对比** (以审查 1000 行代码为例):

| 智能体 | 模型 | 输入 Token | 输出 Token | 成本(美元) |
|--------|------|-----------|-----------|-----------|
| code-reviewer | Sonnet | 5000 | 2000 | $0.11 |
| architect | Opus | 8000 | 3000 | $0.55 |
| 快速审查 | Haiku | 5000 | 1500 | $0.02 |

**优化策略**:

1. **初始审查用 Haiku**: 快速识别明显问题
2. **深度审查用 Sonnet**: 针对重要模块
3. **关键决策用 Opus**: 仅用于架构设计和复杂规划

```bash
# 成本优化审查流程
claude-code --agent code-reviewer --model haiku \
  "快速审查代码,只报告 CRITICAL 和 HIGH 级别问题"

# 如果发现严重问题,再深度审查
if grep -q "CRITICAL" reports/quick-review.md; then
  claude-code --agent code-reviewer --model sonnet \
    "深度审查包含 CRITICAL 问题的文件"
fi
```

### 6.6.2 缓存和增量审查

避免重复审查未变更的代码:

```bash
#!/bin/bash
# incremental-review.sh — 增量审查

# 获取变更文件
changed_files=$(git diff --name-only main | grep -E '\.(ts|tsx|go|rs)$')

if [ -z "$changed_files" ]; then
  echo "No relevant files changed."
  exit 0
fi

echo "Changed files:"
echo "$changed_files"

# 只审查变更文件
for file in $changed_files; do
  extension="${file##*.}"

  case $extension in
    ts|tsx)
      claude-code --agent code-reviewer "审查 $file" > "reports/$(basename $file).md"
      ;;
    go)
      claude-code --agent go-reviewer "审查 $file" > "reports/$(basename $file).md"
      ;;
    rs)
      claude-code --agent rust-reviewer "审查 $file" > "reports/$(basename $file).md"
      ;;
  esac
done
```

### 6.6.3 批处理优化

将多个小文件合并审查,减少 API 调用:

```bash
# 批量审查小型文件
find src -name "*.ts" -size -10k | xargs -I {} cat {} > combined.ts

claude-code --agent code-reviewer \
  "审查以下合并的 TypeScript 文件: combined.ts" \
  > reports/batch-review.md

# 清理临时文件
rm combined.ts
```

### 6.6.4 并行度控制

控制并发智能体数量,避免 API 限流:

```bash
#!/bin/bash
# controlled-parallel.sh — 控制并发度的并行审查

max_parallel=3  # 最大并发数
current=0

for module in frontend api services; do
  # 等待如果达到最大并发
  if [ $current -ge $max_parallel ]; then
    wait -n  # 等待任意一个任务完成
    current=$((current - 1))
  fi

  # 启动审查
  claude-code --agent code-reviewer "审查 $module" > "reports/$module.md" &
  current=$((current + 1))
done

# 等待所有任务完成
wait
```

## 6.7 最佳实践与注意事项

### 6.7.1 智能体编排最佳实践

**1. 清晰的任务分配**

每个智能体应该有明确的职责边界:

```
✅ 正确示例:
- code-reviewer: 审查代码质量和最佳实践
- security-reviewer: 审查安全漏洞
- database-reviewer: 审查数据库设计

❌ 错误示例:
- reviewer1: 审查所有内容
- reviewer2: 审查所有内容
```

**2. 避免重复工作**

通过共享上下文避免重复审查:

```bash
# 第一次审查
claude-code --agent code-reviewer "审查 src/" > review1.md

# 第二次审查,跳过已审查的部分
claude-code --agent security-reviewer \
  "审查 src/,但参考 review1.md 中的问题,不重复报告" \
  > security-review.md
```

**3. 合理的执行顺序**

先解决阻塞性问题,再执行后续审查:

```
正确顺序:
1. 构建错误修复 (build-error-resolver)
2. 代码审查 (code-reviewer)
3. 安全审查 (security-reviewer)
4. 性能优化 (performance-reviewer)
```

### 6.7.2 性能优化建议

**1. 使用增量审查**

只审查变更部分:

```bash
# 获取当前分支相对于主分支的变更
git diff main --name-only | \
  xargs -I {} claude-code --agent code-reviewer "审查 {}"
```

**2. 批量处理小文件**

将多个小文件合并审查:

```bash
# 合并所有工具文件
cat src/utils/*.ts > combined-utils.ts
claude-code --agent code-reviewer "审查 combined-utils.ts"
```

**3. 使用合适的模型**

根据任务复杂度选择模型:

```bash
# 简单格式检查用 Haiku
claude-code --agent code-reviewer --model haiku "检查代码格式"

# 复杂架构审查用 Opus
claude-code --agent architect --model opus "设计系统架构"
```

### 6.7.3 常见陷阱

**陷阱 1: 过度并行**

问题: 启动太多并行智能体导致 API 限流或资源耗尽

解决: 控制并发度

```bash
# 限制最多 3 个并行智能体
sem -j 3 --id claude-agents \
  claude-code --agent code-reviewer "审查 $file"
```

**陷阱 2: 结果冲突**

问题: 多个智能体对同一问题给出冲突建议

解决: 定义优先级规则

```markdown
# 冲突解决规则

1. 安全优先: security-reviewer 的建议优先级最高
2. 专家优先: 领域专家(如 database-reviewer)优先于通用智能体
3. 最新优先: 后执行的智能体可以覆盖之前的建议
```

**陷阱 3: 忽略依赖关系**

问题: 在依赖未满足时执行任务

解决: 明确定义任务依赖

```yaml
# 任务依赖配置
tasks:
  - name: security-review
    depends_on: [code-review]  # 必须先完成代码审查

  - name: e2e-test
    depends_on: [unit-test, integration-test]
```

### 6.7.4 调试技巧

**1. 查看智能体执行日志**

```bash
# 启用详细日志
claude-code --agent code-reviewer --verbose "审查代码"
```

**2. 单独测试智能体**

```bash
# 测试单个智能体
claude-code --agent code-reviewer "审查测试文件 test.ts"
```

**3. 检查智能体配置**

```bash
# 查看智能体定义
cat ~/.claude/agents/code-reviewer.md
```

## 6.8 本章小结

通过本章的学习,我们掌握了:

- 多智能体协作的优势和适用场景
- 五种智能体通信模式(主从、流水线、并行、协作、层级)
- 并行任务执行的分解原则和实现方法
- 智能体专业化策略(语言专家、领域专家)
- 全栈项目的多智能体审查实战
- 性能优化和成本控制技巧
- 最佳实践和常见陷阱

**关键要点**:

1. **专业化分工**: 让专业的智能体做专业的事
2. **并行加速**: 独立任务并行执行,显著缩短时间
3. **智能调度**: 根据任务类型自动匹配最合适的智能体
4. **成本优化**: 选择合适的模型和批处理策略
5. **持续集成**: 将多智能体审查集成到 CI/CD 流程

**多智能体系统设计清单**:

- [ ] 明确定义每个智能体的职责边界
- [ ] 设计合理的任务分解策略
- [ ] 选择合适的通信模式(主从/流水线/并行)
- [ ] 实现结果合并逻辑
- [ ] 配置并发度控制
- [ ] 集成到 CI/CD 流程
- [ ] 监控成本和性能
- [ ] 建立冲突解决机制

## 下一章预告

在下一章"MCP 服务器开发与集成"中,我们将学习:

- MCP(Model Context Protocol)协议原理
- 如何开发自定义 MCP 服务器
- 将外部工具和服务集成到 Claude Code
- 实战案例: 集成 Slack、GitHub、数据库等外部服务
- MCP 服务器性能优化和错误处理

MCP 服务器扩展了 Claude Code 的能力边界,让你的开发环境拥有无限可能。
