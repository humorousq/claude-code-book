# 附录B：Claude Code Skills 完整清单

本章提供 Claude Code 所有技能的完整参考，包括分类、功能说明和配置示例。

---

## B.1 技能分类概览

Claude Code 包含 100+ 技能，按以下类别组织：

| 类别 | 数量 | 说明 |
|------|------|------|
| 核心开发模式 | 15 | 编码标准、TDD、架构模式 |
| 语言特定模式 | 25 | Python、Go、Kotlin、Java、Rust 等 |
| 框架模式 | 20 | Django、Spring Boot、React、SwiftUI 等 |
| 测试技能 | 10 | 单元测试、集成测试、E2E 测试 |
| 安全技能 | 8 | 安全审查、安全模式、加密 |
| DevOps 技能 | 10 | Docker、部署、数据库迁移 |
| AI/ML 技能 | 8 | Claude API、成本优化、模型选择 |
| 领域特定 | 15 | 金融、物流、能源等垂直领域 |

---

## B.2 核心开发模式技能

### coding-standards - 编码标准

**名称**：coding-standards
**描述**：TypeScript、JavaScript、React 和 Node.js 开发的通用编码标准和最佳实践

**何时激活**：
- 启动新项目或模块
- 审查代码的质量和可维护性
- 重构现有代码以遵循约定
- 强制执行命名、格式化或结构一致性
- 设置 linting、格式化或类型检查规则
- 引导新贡献者了解编码约定

**核心原则**：
1. 可读性优先 - 代码被阅读的次数远多于编写次数
2. KISS - 保持简单
3. DRY - 不要重复自己
4. YAGNI - 你不会需要它

**关键模式**：

```typescript
// 变量命名 - 描述性名称
const marketSearchQuery = 'election'        // 好
const q = 'election'                        // 坏

// 函数命名 - 动词-名词模式
async function fetchMarketData(marketId: string) { }  // 好
async function market(id: string) { }                 // 坏

// 不可变模式 - 使用展开运算符
const updatedUser = { ...user, name: 'New Name' }    // 好
user.name = 'New Name'                                 // 坏

// 错误处理 - 全面的错误处理
async function fetchData(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Fetch failed:', error)
    throw new Error('Failed to fetch data')
  }
}

// 类型安全 - 正确的类型
interface Market {
  id: string
  name: string
  status: 'active' | 'resolved' | 'closed'
  created_at: Date
}

function getMarket(id: string): Promise<Market> { }  // 好
function getMarket(id: any): Promise<any> { }        // 坏
```

**React 最佳实践**：

```typescript
// 组件结构 - 带类型的功能组件
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary'
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  )
}

// 自定义 Hooks
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

**代码异味检测**：
- 长函数（>50 行）- 拆分为更小的函数
- 深嵌套（>4 层）- 使用早期返回
- 魔法数字 - 使用命名常量

---

### tdd-workflow - 测试驱动开发工作流

**名称**：tdd-workflow
**描述**：确保所有代码开发遵循 TDD 原则，具备全面的测试覆盖率

**何时激活**：
- 编写新功能或功能
- 修复错误或问题
- 重构现有代码
- 添加 API 端点
- 创建新组件

**核心原则**：
1. 测试优先于代码 - 始终先编写测试
2. 覆盖率要求 - 最低 80% 覆盖率
3. 测试类型 - 单元测试、集成测试、端到端测试

**TDD 工作流步骤**：
1. 编写用户旅程：`As a [role], I want to [action], so that [benefit]`
2. 生成测试用例
3. 运行测试（它们应该失败）
4. 实现代码
5. 再次运行测试
6. 重构
7. 验证覆盖率

**测试模式**：

```typescript
// 单元测试模式 (Jest/Vitest)
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

// API 集成测试模式
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/markets', () => {
  it('returns markets successfully', async () => {
    const request = new NextRequest('http://localhost/api/markets')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })
})

// 端到端测试模式 (Playwright)
import { test, expect } from '@playwright/test'

test('user can search and filter markets', async ({ page }) => {
  await page.goto('/')
  await page.click('a[href="/markets"]')

  await expect(page.locator('h1')).toContainText('Markets')

  await page.fill('input[placeholder="Search markets"]', 'election')
  await page.waitForTimeout(600)

  const results = page.locator('[data-testid="market-card"]')
  await expect(results).toHaveCount(5, { timeout: 5000 })
})
```

**模拟外部服务**：

```typescript
// Supabase 模拟
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: [{ id: 1, name: 'Test Market' }],
          error: null
        }))
      }))
    }))
  }
}))

// Redis 模拟
jest.mock('@/lib/redis', () => ({
  searchMarketsByVector: jest.fn(() => Promise.resolve([
    { slug: 'test-market', similarity_score: 0.95 }
  ])),
  checkRedisHealth: jest.fn(() => Promise.resolve({ connected: true }))
}))
```

**最佳实践**：
- 先写测试 - 始终遵循 TDD
- 每个测试一个断言 - 专注于单一行为
- 描述性的测试名称 - 解释测试内容
- 模拟外部依赖 - 隔离单元测试
- 测试边缘情况 - Null、undefined、空、大量数据

---

### api-design - API 设计

**名称**：api-design
**描述**：REST API 设计标准和最佳实践

**何时激活**：
- 设计新 API 端点
- 审查 API 设计
- 重构 API 结构

**REST API 约定**：

```
GET    /api/markets              # 列出所有市场
GET    /api/markets/:id          # 获取特定市场
POST   /api/markets              # 创建新市场
PUT    /api/markets/:id          # 更新市场（完整）
PATCH  /api/markets/:id          # 更新市场（部分）
DELETE /api/markets/:id          # 删除市场

# 查询参数过滤
GET /api/markets?status=active&limit=10&offset=0
```

**响应格式**：

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

// 成功响应
return NextResponse.json({
  success: true,
  data: markets,
  meta: { total: 100, page: 1, limit: 10 }
})

// 错误响应
return NextResponse.json({
  success: false,
  error: 'Invalid request'
}, { status: 400 })
```

**输入验证**：

```typescript
import { z } from 'zod'

const CreateMarketSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  endDate: z.string().datetime(),
  categories: z.array(z.string()).min(1)
})

export async function POST(request: Request) {
  const body = await request.json()

  try {
    const validated = CreateMarketSchema.parse(body)
    // 继续处理已验证的数据
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }
  }
}
```

---

### backend-patterns - 后端模式

**名称**：backend-patterns
**描述**：后端开发的通用模式

**关键模式**：
- 分层架构
- 依赖注入
- 仓储模式
- 服务层模式
- 中间件链

---

### frontend-patterns - 前端模式

**名称**：frontend-patterns
**描述**：前端开发的通用模式

**关键模式**：
- 组件组合
- 状态管理
- 数据获取
- 路由模式

---

## B.3 语言特定模式技能

### python-patterns - Python 开发模式

**名称**：python-patterns
**描述**：Pythonic 惯用法、PEP 8 标准、类型提示和最佳实践

**何时激活**：
- 编写新 Python 代码
- 审查 Python 代码
- 重构现有 Python 代码
- 设计 Python 包/模块

**核心原则**：
1. 可读性很重要 - Python 优先考虑可读性
2. 显式优于隐式 - 避免魔法
3. EAFP - 请求原谅比许可更容易

**类型提示**：

```python
from typing import Optional, List, Dict, Any

def process_user(
    user_id: str,
    data: Dict[str, Any],
    active: bool = True
) -> Optional[User]:
    """Process a user and return the updated User or None."""
    if not active:
        return None
    return User(user_id, data)

# 现代 Python 3.9+ 类型提示
def process_items(items: list[str]) -> dict[str, int]:
    return {item: len(item) for item in items}

# 泛型类型
from typing import TypeVar

T = TypeVar('T')

def first(items: list[T]) -> T | None:
    """Return the first item or None if list is empty."""
    return items[0] if items else None
```

**错误处理模式**：

```python
# 好：捕获特定异常
def load_config(path: str) -> Config:
    try:
        with open(path) as f:
            return Config.from_json(f.read())
    except FileNotFoundError as e:
        raise ConfigError(f"Config file not found: {path}") from e
    except json.JSONDecodeError as e:
        raise ConfigError(f"Invalid JSON in config: {path}") from e

# 坏：裸 except
def load_config(path: str) -> Config:
    try:
        with open(path) as f:
            return Config.from_json(f.read())
    except:
        return None  # 静默失败！
```

**上下文管理器**：

```python
from contextlib import contextmanager

@contextmanager
def timer(name: str):
    """Context manager to time a block of code."""
    start = time.perf_counter()
    yield
    elapsed = time.perf_counter() - start
    print(f"{name} took {elapsed:.4f} seconds")

# 使用
with timer("data processing"):
    process_large_dataset()
```

**数据类**：

```python
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class User:
    """User entity with automatic __init__, __repr__, and __eq__."""
    id: str
    name: str
    email: str
    created_at: datetime = field(default_factory=datetime.now)
    is_active: bool = True
```

**Python 工具集成**：

```bash
# 代码格式化
black .
isort .

# Linting
ruff check .
pylint mypackage/

# 类型检查
mypy .

# 测试
pytest --cov=mypackage --cov-report=html

# 安全扫描
bandit -r .
```

---

### golang-patterns - Go 开发模式

**名称**：golang-patterns
**描述**：Go 语言的最佳实践和惯用模式

**关键模式**：
- 错误处理模式
- 并发模式（goroutines、channels）
- 接口组合
- 依赖注入

---

### kotlin-patterns - Kotlin 开发模式

**名称**：kotlin-patterns
**描述**：Kotlin 语言的最佳实践

**关键技能**：
- kotlin-coroutines-flows - 协程和 Flow 模式
- kotlin-exposed-patterns - Exposed ORM 模式
- kotlin-ktor-patterns - Ktor 框架模式
- kotlin-testing - Kotlin 测试模式

---

### rust-patterns - Rust 开发模式

**名称**：rust-patterns
**描述**：Rust 语言的最佳实践

**关键模式**：
- 所有权和借用
- 生命周期管理
- 错误处理（Result、Option）
- 异步 Rust

---

### java-coding-standards - Java 编码标准

**名称**：java-coding-standards
**描述**：Java 编码标准和最佳实践

**相关技能**：
- jpa-patterns - JPA 模式
- springboot-patterns - Spring Boot 模式
- springboot-security - Spring Boot 安全
- springboot-tdd - Spring Boot TDD
- springboot-verification - Spring Boot 验证

---

### cpp-coding-standards - C++ 编码标准

**名称**：cpp-coding-standards
**描述**：现代 C++ 编码标准

**相关技能**：
- cpp-testing - C++ 测试模式

---

### swiftui-patterns - SwiftUI 模式

**名称**：swiftui-patterns
**描述**：SwiftUI 开发模式

**相关技能**：
- swift-concurrency-6-2 - Swift 并发
- swift-actor-persistence - Swift Actor 持久化
- swift-protocol-di-testing - Swift 协议 DI 测试

---

## B.4 框架模式技能

### Django 相关

**django-patterns** - Django 开发模式
**django-security** - Django 安全模式
**django-tdd** - Django TDD 工作流
**django-verification** - Django 验证

---

### Spring Boot 相关

**springboot-patterns** - Spring Boot 开发模式
**springboot-security** - Spring Boot 安全
**springboot-tdd** - Spring Boot TDD 工作流
**springboot-verification** - Spring Boot 验证

---

### React/Next.js 相关

**frontend-patterns** - 前端模式（包含 React）
**frontend-slides** - 前端演示模式

---

### 其他框架

**android-clean-architecture** - Android 清洁架构
**compose-multiplatform-patterns** - Compose 多平台模式
**laravel-patterns** - Laravel 模式
**laravel-security** - Laravel 安全
**laravel-tdd** - Laravel TDD
**laravel-verification** - Laravel 验证

---

## B.5 测试技能

### e2e-testing - 端到端测试

**名称**：e2e-testing
**描述**：使用 Playwright 进行端到端测试

**关键模式**：
- 页面对象模型
- 测试隔离
- 工件捕获
- 不稳定测试检测

---

### python-testing - Python 测试

**名称**：python-testing
**描述**：Python 测试模式和最佳实践

**关键模式**：
- pytest 模式
- 模拟和补丁
- 测试夹具
- 参数化测试

---

### golang-testing - Go 测试

**名称**：golang-testing
**描述**：Go 测试模式

---

### kotlin-testing - Kotlin 测试

**名称**：kotlin-testing
**描述**：Kotlin 测试模式

---

### rust-testing - Rust 测试

**名称**：rust-testing
**描述**：Rust 测试模式

---

### perl-testing - Perl 测试

**名称**：perl-testing
**描述**：Perl 测试模式

---

## B.6 安全技能

### security-review - 安全审查

**名称**：security-review
**描述**：全面的安全审查流程

**检查项目**：
- 认证和授权
- 输入验证
- 加密
- 会话管理
- API 安全

**相关技能**：
- cloud-infrastructure-security - 云基础设施安全

---

### security-scan - 安全扫描

**名称**：security-scan
**描述**：自动化安全扫描

---

### django-security - Django 安全

**名称**：django-security
**描述**：Django 框架特定的安全模式

---

### springboot-security - Spring Boot 安全

**名称**：springboot-security
**描述**：Spring Boot 框架特定的安全模式

---

### laravel-security - Laravel 安全

**名称**：laravel-security
**描述**：Laravel 框架特定的安全模式

---

### perl-security - Perl 安全

**名称**：perl-security
**描述**：Perl 语言特定的安全模式

---

## B.7 DevOps 技能

### docker-patterns - Docker 模式

**名称**：docker-patterns
**描述**：Docker 容器化模式

**关键模式**：
- 多阶段构建
- Docker Compose 模式
- 镜像优化
- 安全最佳实践

---

### deployment-patterns - 部署模式

**名称**：deployment-patterns
**描述**：部署和发布模式

**关键模式**：
- 蓝绿部署
- 金丝雀发布
- 滚动更新
- 回滚策略

---

### database-migrations - 数据库迁移

**名称**：database-migrations
**描述**：数据库迁移模式

**关键模式**：
- 迁移脚本
- 回滚脚本
- 零停机迁移
- 数据迁移

---

### postgres-patterns - PostgreSQL 模式

**名称**：postgres-patterns
**描述**：PostgreSQL 数据库模式

---

## B.8 AI/ML 技能

### claude-api - Claude API

**名称**：claude-api
**描述**：Claude API 使用模式

**关键模式**：
- 提示工程
- 上下文管理
- 成本优化
- 错误处理

---

### cost-aware-llm-pipeline - 成本感知 LLM 管道

**名称**：cost-aware-llm-pipeline
**描述**：优化 LLM 使用的成本

**关键模式**：
- 模型选择策略
- 缓存模式
- 批处理优化
- 成本监控

---

### prompt-optimizer - 提示优化器

**名称**：prompt-optimizer
**描述**：优化提示词以提高效率

---

### continuous-learning - 持续学习

**名称**：continuous-learning
**描述**：从会话中持续学习模式

**相关技能**：
- continuous-learning-v2 - 持续学习 v2

---

## B.9 领域特定技能

### 金融领域

**energy-procurement** - 能源采购
**investor-materials** - 投资者材料
**investor-outreach** - 投资者外联
**market-research** - 市场研究

---

### 物流领域

**logistics-exception-management** - 物流异常管理
**returns-reverse-logistics** - 退货逆向物流
**inventory-demand-planning** - 库存需求计划
**production-scheduling** - 生产调度

---

### 贸易合规

**customs-trade-compliance** - 海关贸易合规
**carrier-relationship-management** - 承运商关系管理

---

### 质量管理

**quality-nonconformance** - 质量不符合
**plankton-code-quality** - Plankton 代码质量

---

### 其他领域

**deep-research** - 深度研究
**article-writing** - 文章撰写
**video-editing** - 视频编辑
**content-engine** - 内容引擎

---

## B.10 架构与设计技能

### architect - 架构设计

**名称**：architect
**描述**：软件架构设计

---

### ai-first-engineering - AI 优先工程

**名称**：ai-first-engineering
**描述**：AI 优先的工程实践

---

### agentic-engineering - 代理工程

**名称**：agentic-engineering
**描述**：代理系统设计

---

### autonomous-loops - 自主循环

**名称**：autonomous-loops
**描述**：自主执行循环模式

---

### agent-harness-construction - 代理线束构建

**名称**：agent-harness-construction
**描述**：构建代理线束

---

## B.11 实用工具技能

### exa-search - Exa 搜索

**名称**：exa-search
**描述**：使用 Exa 进行搜索

---

### fal-ai-media - Fal AI 媒体

**名称**：fal-ai-media
**描述**：Fal AI 媒体处理

---

### videodb - VideoDB

**名称**：videodb
**描述**：VideoDB 视频数据库

---

### nutrient-document-processing - 文档处理

**名称**：nutrient-document-processing
**描述**：Nutrient 文档处理

---

### clickhouse-io - ClickHouse IO

**名称**：clickhouse-io
**描述**：ClickHouse 数据库集成

---

### nanoclaw-repl - Nanoclaw REPL

**名称**：nanoclaw-repl
**描述**：Nanoclaw REPL

---

### regex-vs-llm-structured-text - 正则 vs LLM 结构化文本

**名称**：regex-vs-llm-structured-text
**描述**：正则表达式与 LLM 的比较

---

## B.12 项目管理技能

### project-guidelines-example - 项目指南示例

**名称**：project-guidelines-example
**描述**：项目指南模板

---

### strategic-compact - 战略契约

**名称**：strategic-compact
**描述**：战略规划契约

---

### blueprint - 蓝图

**名称**：blueprint
**描述**：项目蓝图

---

### skill-stocktake - 技能盘点

**名称**：skill-stocktake
**描述**：技能盘点和评估

---

## B.13 特定平台技能

### nextjs-turbopack - Next.js Turbopack

**名称**：nextjs-turbopack
**描述**：Next.js Turbopack 配置

---

### bun-runtime - Bun 运行时

**名称**：bun-runtime
**描述**：Bun JavaScript 运行时

---

### foundation-models-on-device - 本地基础模型

**名称**：foundation-models-on-device
**描述**：本地部署基础模型

---

### mcp-server-patterns - MCP 服务器模式

**名称**：mcp-server-patterns
**描述**：Model Context Protocol 服务器模式

---

## B.14 设计模式技能

### liquid-glass-design - 液态玻璃设计

**名称**：liquid-glass-design
**描述**：液态玻璃 UI 设计模式

---

## B.15 技能配置模板

### 创建自定义技能模板

```markdown
---
name: my-custom-skill
description: 自定义技能的描述
origin: local
version: 1.0.0
---

# 技能标题

技能的详细描述

## 何时激活

- 场景 1
- 场景 2
- 场景 3

## 核心原则

1. 原则 1
2. 原则 2
3. 原则 3

## 关键模式

### 模式 1

描述和示例

### 模式 2

描述和示例

## 最佳实践

- 最佳实践 1
- 最佳实践 2
- 最佳实践 3

## 反模式

- 反模式 1
- 反模式 2

## 参考资源

- 资源 1
- 资源 2
```

---

## B.16 技能使用统计

### 最常用技能 Top 10

| 排名 | 技能名称 | 使用频率 |
|------|----------|----------|
| 1 | coding-standards | 每日 |
| 2 | tdd-workflow | 每日 |
| 3 | python-patterns | 每周 |
| 4 | api-design | 每周 |
| 5 | security-review | 每周 |
| 6 | docker-patterns | 每周 |
| 7 | deployment-patterns | 每周 |
| 8 | e2e-testing | 每周 |
| 9 | golang-patterns | 每周 |
| 10 | django-patterns | 每月 |

---

## B.17 技能安装与配置

### 安装技能

技能可通过以下方式安装：

1. **从仓库安装**：
```bash
# 克隆技能仓库
git clone https://github.com/example/skills.git ~/.claude/skills/
```

2. **本地创建**：
```bash
# 创建技能目录
mkdir -p ~/.claude/skills/my-skill

# 创建技能文件
cat > ~/.claude/skills/my-skill/SKILL.md <<EOF
---
name: my-skill
description: My custom skill
---
# My Skill
...
EOF
```

3. **使用 /skill-create 生成**：
```bash
/skill-create --output ~/.claude/skills/
```

### 配置技能优先级

在项目根目录创建 `.claude/skills.json`：

```json
{
  "priority": [
    "project-specific-skill",
    "coding-standards",
    "tdd-workflow"
  ],
  "disabled": [
    "deprecated-skill"
  ]
}
```

---

## B.18 技能版本管理

### 版本格式

技能使用语义化版本：

```
major.minor.patch

major: 重大变更，可能不兼容
minor: 新功能，向后兼容
patch: 错误修复，向后兼容
```

### 在技能中指定版本

```markdown
---
name: my-skill
version: 2.1.0
---
```

---

## B.19 技能贡献指南

### 贡献新技能

1. Fork 仓库
2. 创建技能分支
3. 添加技能文件
4. 编写测试
5. 提交 Pull Request

### 技能质量标准

- 清晰的描述和用途
- 完整的示例代码
- 单一职责原则
- 可测试性
- 完善的文档

---

**注意**：技能列表持续更新中。要查看最新技能列表，请访问官方仓库或使用 `/skill-stocktake` 命令。
