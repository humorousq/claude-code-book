# 第4章 代码审查与质量控制

> "代码审查不是为了找错,而是为了学习和改进。好的代码是团队的共同责任。"

## 本章概述

代码审查(Code Review)是软件开发生命周期中至关重要的质量保证环节。通过系统的审查流程,可以在代码合并到主分支之前发现潜在问题、分享知识、保持代码一致性,并提升团队整体的技术水平。

本章将深入探讨如何在Claude Code环境中实施多层次的代码审查体系,包括:

- 自动化代码审查工具和方法
- 安全审查和漏洞检测
- 语言特定的审查策略
- 性能优化建议
- 代码审查的最佳实践和工作流程
- 如何集成到CI/CD流程

## 4.1 代码审查的重要性

### 4.1.1 为什么需要代码审查

代码审查不仅仅是"找Bug",它承担着多重角色:

**1. 质量保证**

```
发现Bug → 早期修复 → 降低成本
```

研究表明,Bug在开发阶段修复的成本是生产环境修复成本的1/100。代码审查是最经济的质量保证手段。

**2. 知识共享**

```typescript
// 审查者学习新技巧
// 被审查者获得反馈

// 示例: 审查中发现更优雅的实现
// 原代码
function processUsers(users) {
  const result = []
  for (const user of users) {
    if (user.active) {
      result.push(user)
    }
  }
  return result
}

// 审查建议
const processUsers = (users) => users.filter(u => u.active)
```

**3. 保持一致性**

通过审查确保:
- 代码风格一致
- 架构模式一致
- 命名规范一致
- 文档标准一致

**4. 团队建设**

- 新成员通过审查快速学习项目规范
- 资深成员通过审查传授经验
- 建立"代码是团队资产"的文化

### 4.1.2 代码审查的ROI(投资回报)

Google的研究数据显示:

- **Bug发现率**: 审查能发现60%-90%的缺陷
- **修复成本**: 审查发现的Bug修复成本比QA阶段低5-10倍
- **知识传递**: 审查是最有效的知识传递方式之一
- **时间投资**: 每1小时审查时间节省33分钟后续维护时间

**投资回报公式**:

```
ROI = (节省的维护时间 - 审查时间) / 审查时间 * 100%

示例:
审查时间: 2小时
发现Bug: 5个
每个Bug后期修复时间: 4小时
总节省: 20小时
ROI = (20 - 2) / 2 * 100% = 900%
```

## 4.2 Claude Code的审查工具

### 4.2.1 `🔵 /code-review` 命令

Claude Code提供了强大的`🔵 /code-review`命令,启动自动化代码审查流程。

**使用方式**:

```bash
# 方式1: 审查当前变更
🔵 `/code-review`

# 方式2: 审查特定文件
🔵 `/code-review` src/api/handlers.ts

# 方式3: 审查最近的提交
🔵 `/code-review` --commit HEAD~1
```

**审查流程**:

```
1. 收集变更
   └─ git diff --staged
   └─ git diff

2. 分析代码
   └─ 安全检查
   └─ 质量检查
   └─ 最佳实践检查

3. 生成报告
   └─ 按严重性分类
   └─ 提供修复建议
   └─ 显示文件位置

4. 判定结果
   └─ PASS: 无问题
   └─ WARN: 有中等问题
   └─ BLOCK: 有严重问题
```

### 4.2.2 `code-reviewer` 代理

`code-reviewer`代理是一个专业的代码审查助手,具有:

- **深度分析能力** - 不仅发现问题,还理解上下文
- **多维度检查** - 安全、质量、性能、可维护性
- **智能建议** - 提供具体的修复代码示例
- **置信度过滤** - 只报告高置信度问题,避免噪音

**代理配置**:

```yaml
---
name: code-reviewer
description: 专业代码审查专家。主动审查代码的质量、安全性和可维护性。
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---
```

### 4.2.3 语言特定的审查代理

Claude Code提供了多种语言特定的审查代理:

| 代理 | 专注领域 | 特殊检查 |
|------|---------|---------|
| `python-reviewer` | Python代码 | 类型提示、装饰器、异步模式 |
| `go-reviewer` | Go代码 | Goroutine泄漏、Channel模式 |
| `kotlin-reviewer` | Kotlin代码 | 协程、空安全、函数式编程 |
| `rust-reviewer` | Rust代码 | 所有权、借用、生命周期 |
| `security-reviewer` | 安全审查 | OWASP Top 10、漏洞检测 |

## 4.3 审查清单体系

### 4.3.1 安全性审查(CRITICAL)

安全问题可能导致实际损失,必须**零容忍**。

**检查项目**:

1. **硬编码凭据**

```typescript
// ❌ CRITICAL: API密钥暴露在代码中
const apiKey = "sk-abc123def456..."
const dbPassword = "password123"

// ✅ 正确: 使用环境变量
const apiKey = process.env.API_KEY
const dbPassword = process.env.DB_PASSWORD
```

**检测工具**:

```bash
# 使用grep检测
grep -r "sk-[a-zA-Z0-9]" . --include="*.ts"
grep -r "password\s*=" . --include="*.ts"
```

2. **SQL注入**

```typescript
// ❌ CRITICAL: SQL注入漏洞
const query = `SELECT * FROM users WHERE id = ${userId}`

// ✅ 正确: 参数化查询
const query = `SELECT * FROM users WHERE id = $1`
const result = await db.query(query, [userId])

// ✅ 正确: ORM
const user = await User.findById(userId)
```

3. **XSS漏洞**

```typescript
// ❌ HIGH: 未转义的用户输入
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// ✅ 正确: 自动转义
<div>{userComment}</div>

// ✅ 正确: 手动转义
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userComment)
}} />
```

4. **路径遍历**

```typescript
// ❌ CRITICAL: 用户控制文件路径
const filePath = path.join('./uploads', req.body.filename)

// ✅ 正确: 验证和规范化
const filename = path.basename(req.body.filename)
const filePath = path.join('./uploads', filename)

// 验证路径在允许的目录内
if (!filePath.startsWith(path.resolve('./uploads'))) {
  throw new Error('Invalid path')
}
```

5. **SSRF(服务器端请求伪造)**

```typescript
// ❌ CRITICAL: 用户控制URL
const response = await fetch(req.body.url)

// ✅ 正确: 白名单验证
const ALLOWED_DOMAINS = ['api.example.com', 'cdn.example.com']

function isAllowedUrl(url: string): boolean {
  const parsed = new URL(url)
  return ALLOWED_DOMAINS.includes(parsed.hostname)
}

if (!isAllowedUrl(req.body.url)) {
  throw new Error('Domain not allowed')
}

const response = await fetch(req.body.url)
```

6. **认证绕过**

```typescript
// ❌ CRITICAL: 路由缺少认证检查
app.get('/api/admin/users', (req, res) => {
  // 直接返回敏感数据
})

// ✅ 正确: 添加认证中间件
app.get('/api/admin/users',
  authenticate,
  requireAdmin,
  (req, res) => {
    // 安全处理
  }
)
```

7. **不安全的依赖**

```bash
# 检查已知漏洞
npm audit --audit-level=high

# 自动修复
npm audit fix
```

### 4.3.2 代码质量审查(HIGH)

**1. 函数复杂度**

```typescript
// ❌ HIGH: 函数过长(>50行)
function processOrder(order: Order) {
  // 100行代码...
  if (condition1) {
    // 20行
    if (condition2) {
      // 15行
    }
  }
  // 更多嵌套...
}

// ✅ 正确: 拆分为小函数
function processOrder(order: Order) {
  validateOrder(order)
  const processedItems = processItems(order.items)
  const total = calculateTotal(processedItems)
  return createOrderRecord(order, processedItems, total)
}

function validateOrder(order: Order) { /* ... */ }
function processItems(items: Item[]) { /* ... */ }
function calculateTotal(items: Item[]) { /* ... */ }
```

**复杂度度量**:

```
圈复杂度(Cyclomatic Complexity) = 决策点数量 + 1

建议阈值:
- 1-10: 简单,易测试
- 11-20: 中等,可接受
- 21-50: 复杂,需重构
- >50: 非常复杂,必须重构
```

**2. 嵌套深度**

```typescript
// ❌ HIGH: 嵌套过深(>4层)
function process(data) {
  if (data) {
    if (data.items) {
      for (const item of data.items) {
        if (item.active) {
          if (item.price > 0) {
            // 处理逻辑
          }
        }
      }
    }
  }
}

// ✅ 正确: 提前返回
function process(data) {
  if (!data?.items) return

  const activeItems = data.items.filter(item =>
    item.active && item.price > 0
  )

  activeItems.forEach(processItem)
}
```

**3. 文件大小**

```
建议阈值:
- 典型文件: 200-400行
- 最大文件: 800行
- 超过800行: 考虑拆分
```

**4. 未使用的代码**

```typescript
// ❌ MEDIUM: 死代码
import { unused1, unused2 } from './utils'

function usedFunction() {
  // ...
}

function unusedFunction() {
  // 死代码,从未调用
}

// ✅ 正确: 清理未使用的代码
import { usedFunction } from './utils'
```

**工具检测**:

```bash
# ESLint检查未使用的变量
npx eslint . --rule 'no-unused-vars: error'

# TypeScript检查
npx tsc --noUnusedLocals --noUnusedParameters
```

### 4.3.3 React/Next.js特定审查(HIGH)

**1. 依赖数组完整性**

```typescript
// ❌ HIGH: 缺少依赖
useEffect(() => {
  fetchData(userId)
}, []) // userId应该在依赖数组中

// ✅ 正确: 完整依赖
useEffect(() => {
  fetchData(userId)
}, [userId])
```

**检测工具**:

```bash
# ESLint React Hooks规则
npx eslint . --rule 'react-hooks/exhaustive-deps: warn'
```

**2. 列表Key的使用**

```typescript
// ❌ HIGH: 使用索引作为key
{items.map((item, index) => (
  <Item key={index} item={item} />
))}

// ✅ 正确: 使用稳定唯一ID
{items.map(item => (
  <Item key={item.id} item={item} />
))}
```

**3. 内存泄漏**

```typescript
// ❌ HIGH: 未清理副作用
useEffect(() => {
  const interval = setInterval(() => {
    updateData()
  }, 1000)
  // 没有清理函数!
}, [])

// ✅ 正确: 清理副作用
useEffect(() => {
  const interval = setInterval(() => {
    updateData()
  }, 1000)

  return () => clearInterval(interval) // 清理
}, [])
```

**4. 不必要的重新渲染**

```typescript
// ❌ MEDIUM: 每次渲染都创建新对象
function Parent() {
  const config = { theme: 'dark' } // 每次渲染新对象
  return <Child config={config} />
}

// ✅ 正确: 使用useMemo
function Parent() {
  const config = useMemo(() => ({ theme: 'dark' }), [])
  return <Child config={config} />
}
```

### 4.3.4 性能审查(MEDIUM)

**1. N+1查询问题**

```typescript
// ❌ HIGH: N+1查询
const users = await db.query('SELECT * FROM users')
for (const user of users) {
  user.posts = await db.query(
    'SELECT * FROM posts WHERE user_id = $1',
    [user.id]
  )
}

// ✅ 正确: 单次JOIN查询
const usersWithPosts = await db.query(`
  SELECT
    u.*,
    json_agg(p.*) as posts
  FROM users u
  LEFT JOIN posts p ON p.user_id = u.id
  GROUP BY u.id
`)
```

**2. 未优化的图片**

```typescript
// ❌ MEDIUM: 直接使用大图片
<img src="/large-image.jpg" alt="Banner" />

// ✅ 正确: 使用Next.js Image组件
import Image from 'next/image'

<Image
  src="/large-image.jpg"
  alt="Banner"
  width={1200}
  height={600}
  priority // 预加载
/>
```

**3. 缺少缓存**

```typescript
// ❌ MEDIUM: 重复计算
function ExpensiveComponent({ data }) {
  const processed = complexCalculation(data) // 每次渲染都计算
  return <div>{processed}</div>
}

// ✅ 正确: 使用缓存
function ExpensiveComponent({ data }) {
  const processed = useMemo(
    () => complexCalculation(data),
    [data]
  )
  return <div>{processed}</div>
}
```

### 4.3.5 最佳实践审查(LOW)

**1. 魔法数字**

```typescript
// ❌ LOW: 未解释的数字
if (user.age > 18) {
  // ...
}

// ✅ 正确: 使用命名常量
const LEGAL_AGE = 18

if (user.age > LEGAL_AGE) {
  // ...
}
```

**2. 文档缺失**

```typescript
// ❌ LOW: 缺少文档
export function calculateFee(amount: number): number {
  // ...
}

// ✅ 正确: 添加JSDoc
/**
 * 计算交易手续费
 *
 * @param amount - 交易金额
 * @returns 手续费金额(四舍五入到分)
 *
 * @example
 * calculateFee(100) // 返回 2.50
 */
export function calculateFee(amount: number): number {
  // ...
}
```

**3. TODO管理**

```typescript
// ❌ LOW: 无关联的TODO
// TODO: 优化性能

// ✅ 正确: 关联Issue
// TODO(#123): 优化查询性能,当前使用全表扫描
```

## 4.4 安全审查详解

### 4.4.1 OWASP Top 10检查

OWASP(开放Web应用安全项目)Top 10列出了Web应用最常见的安全风险。

**1. 注入(Injection)**

包括SQL注入、NoSQL注入、命令注入等。

**检测模式**:

```typescript
// SQL注入特征
const suspiciousPatterns = [
  /\$\{.*\}/,           // 模板字符串拼接
  /\+.*\+/,             // 字符串拼接
  /query\s*\(\s*`/,     // 模板字面量查询
]

function detectSQLInjection(code: string): boolean {
  return suspiciousPatterns.some(pattern =>
    pattern.test(code)
  )
}
```

**防御措施**:

```typescript
// ✅ 使用ORM
const user = await User.findById(userId)

// ✅ 参数化查询
const query = 'SELECT * FROM users WHERE id = $1'
const result = await db.query(query, [userId])

// ✅ 输入验证
function validateUserId(id: string): boolean {
  return /^[a-zA-Z0-9-]+$/.test(id)
}
```

**2. 失效的身份认证**

检查点:
- 密码是否使用bcrypt/argon2哈希?
- JWT是否正确验证签名?
- 会话是否设置HTTP-only Cookie?
- 是否有登录尝试限制?

```typescript
// ❌ 错误: 明文存储密码
const user = await db.insert({
  email,
  password: password // 明文!
})

// ✅ 正确: bcrypt哈希
import bcrypt from 'bcryptjs'

const hashedPassword = await bcrypt.hash(password, 10)
const user = await db.insert({
  email,
  password_hash: hashedPassword
})
```

**3. 敏感数据泄露**

检查:
- 是否强制HTTPS?
- 敏感数据是否加密?
- 日志是否脱敏?
- 错误信息是否暴露内部细节?

```typescript
// ❌ 错误: 日志记录敏感数据
console.log('User login:', {
  email,
  password,
  creditCard
})

// ✅ 正确: 脱敏日志
console.log('User login:', {
  email: maskEmail(email),
  // password: 不记录
  creditCard: maskCreditCard(creditCard)
})

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  return `${local[0]}***@${domain}`
}
```

**4. XML外部实体(XXE)**

```typescript
// ❌ 错误: 不安全的XML解析
const result = xmlParser.parse(xmlString)

// ✅ 正确: 禁用外部实体
const result = xmlParser.parse(xmlString, {
  allowExternalEntities: false
})
```

**5. 失效的访问控制**

```typescript
// ❌ 错误: 缺少权限检查
app.get('/api/admin/users', (req, res) => {
  // 直接返回数据
})

// ✅ 正确: 添加认证和授权
app.get('/api/admin/users',
  authenticate,        // 验证身份
  requireRole('admin'), // 检查权限
  (req, res) => {
    // 处理请求
  }
)

function requireRole(role: string) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}
```

**6. 安全配置错误**

常见问题:
- 默认凭据未修改
- 目录列表未禁用
- 错误信息包含堆栈跟踪
- 不必要的功能未禁用

```typescript
// ✅ 安全配置示例

// Express安全头
import helmet from 'helmet'
app.use(helmet())

// 禁用X-Powered-By头
app.disable('x-powered-by')

// 生产环境错误处理
if (process.env.NODE_ENV === 'production') {
  app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Internal server error' })
    // 不暴露堆栈跟踪
  })
}
```

**7. 跨站脚本(XSS)**

```typescript
// ❌ 错误: 未转义的用户输入
res.send(`<div>${userInput}</div>`)

// ✅ 正确: 自动转义(React自动转义)
<div>{userInput}</div>

// ✅ 正确: 手动转义
import DOMPurify from 'dompurify'
const clean = DOMPurify.sanitize(userInput)
res.send(`<div>${clean}</div>`)
```

**8. 不安全的反序列化**

```typescript
// ❌ 错误: 反序列化不可信数据
const obj = JSON.parse(untrustedData)

// ✅ 正确: 验证数据结构
import { z } from 'zod'

const schema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(['user', 'admin'])
})

const obj = schema.parse(JSON.parse(untrustedData))
```

**9. 使用含有漏洞的组件**

```bash
# 定期检查依赖
npm audit

# 更新依赖
npm update

# 使用Dependabot自动更新
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

**10. 不足的日志和监控**

```typescript
// ✅ 完整的安全日志
function logSecurityEvent(event: {
  type: 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN' | 'PERMISSION_DENIED'
  userId?: string
  ip: string
  userAgent: string
  details?: Record<string, any>
}) {
  logger.info('Security Event', {
    timestamp: new Date().toISOString(),
    ...event,
    // 脱敏敏感信息
    details: sanitizeLog(event.details)
  })
}

// 使用示例
logSecurityEvent({
  type: 'FAILED_LOGIN',
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  details: { email: req.body.email }
})
```

### 4.4.2 密钥检测

**常见密钥模式**:

```typescript
const secretPatterns = [
  // API密钥
  /sk-[a-zA-Z0-9]{48}/,           // OpenAI
  /AKIA[A-Z0-9]{16}/,             // AWS
  /ghp_[a-zA-Z0-9]{36}/,          // GitHub

  // JWT密钥
  /jwt[_-]?secret\s*=\s*['"].+['"]/i,

  // 数据库连接字符串
  /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/,

  // 私钥
  /-----BEGIN RSA PRIVATE KEY-----/,
  /-----BEGIN OPENSSH PRIVATE KEY-----/,
]

function detectSecrets(code: string): string[] {
  return secretPatterns
    .filter(pattern => pattern.test(code))
    .map(pattern => pattern.source)
}
```

**工具集成**:

```bash
# 使用gitleaks检测
gitleaks detect --source .

# 使用truffleHog
trufflehog git file://. --fail

# Git pre-commit hook
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

gitleaks detect --source . --fail
```

### 4.4.3 依赖安全审查

```bash
# 运行安全审计
npm audit --audit-level=moderate

# 检查过时的依赖
npm outdated

# 查看依赖树
npm ls --depth=0

# 使用Snyk检查
npx snyk test
```

**package.json配置**:

```json
{
  "scripts": {
    "audit": "npm audit --audit-level=moderate",
    "audit:fix": "npm audit fix",
    "audit:report": "npm audit --json > audit-report.json"
  }
}
```

## 4.5 语言特定审查策略

### 4.5.1 Python代码审查

**使用`python-reviewer`代理**:

```bash
# 启动Python代码审查
/python-review
```

**Python特有检查**:

**1. 类型提示**

```python
# ❌ 缺少类型提示
def calculate_total(items):
    return sum(item.price for item in items)

# ✅ 正确: 添加类型提示
from typing import List

def calculate_total(items: List[Item]) -> float:
    return sum(item.price for item in items)
```

**2. 装饰器使用**

```python
# ❌ 错误: 装饰器顺序不对
@router.get('/api/users')
@login_required
def get_users():
    pass

# ✅ 正确: 路由装饰器在外
@login_required
@router.get('/api/users')
def get_users():
    pass
```

**3. 异步模式**

```python
# ❌ 错误: 同步IO阻塞
def fetch_users():
    time.sleep(1)  # 阻塞!
    return User.query.all()

# ✅ 正确: 异步IO
async def fetch_users():
    await asyncio.sleep(1)
    return await User.query.all()
```

**4. 资源管理**

```python
# ❌ 错误: 未关闭文件
f = open('file.txt')
content = f.read()
# 没有关闭!

# ✅ 正确: 使用with语句
with open('file.txt') as f:
    content = f.read()
# 自动关闭
```

### 4.5.2 Go代码审查

**使用`go-reviewer`代理**:

```bash
/go-review
```

**Go特有检查**:

**1. Goroutine泄漏**

```go
// ❌ 错误: Goroutine泄漏
func processData(ch chan Data) {
    go func() {
        data := <-ch
        process(data)
        // 如果ch关闭,gououtine会阻塞
    }()
}

// ✅ 正确: 使用context控制
func processData(ctx context.Context, ch chan Data) {
    go func() {
        select {
        case data := <-ch:
            process(data)
        case <-ctx.Done():
            return // 退出goroutine
        }
    }()
}
```

**2. 错误处理**

```go
// ❌ 错误: 忽略错误
result, _ := someFunction()

// ✅ 正确: 处理错误
result, err := someFunction()
if err != nil {
    return fmt.Errorf("failed to process: %w", err)
}
```

**3. Channel使用**

```go
// ❌ 错误: 向已关闭的channel发送
ch := make(chan int)
close(ch)
ch <- 1 // panic!

// ✅ 正确: 检查channel状态
select {
case ch <- data:
    // 发送成功
default:
    // channel已满或已关闭
}
```

### 4.5.3 Kotlin代码审查

**使用`kotlin-reviewer`代理**:

```bash
/kotlin-review
```

**Kotlin特有检查**:

**1. 空安全**

```kotlin
// ❌ 错误: 强制非空断言
val name = user!!.name

// ✅ 正确: 安全调用
val name = user?.name ?: "Unknown"
```

**2. 协程使用**

```kotlin
// ❌ 错误: 在协程外使用suspend函数
val result = fetchData() // 错误!

// ✅ 正确: 在协程作用域中调用
scope.launch {
    val result = fetchData()
}
```

**3. 函数式编程**

```kotlin
// ❌ 命令式风格
val activeUsers = mutableListOf<User>()
for (user in users) {
    if (user.isActive) {
        activeUsers.add(user)
    }
}

// ✅ 函数式风格
val activeUsers = users.filter { it.isActive }
```

### 4.5.4 Rust代码审查

**使用`rust-reviewer`代理**:

```bash
/rust-review
```

**Rust特有检查**:

**1. 所有权和借用**

```rust
// ❌ 错误: 悬垂引用
fn dangle() -> &String {
    let s = String::from("hello");
    &s // 返回已释放内存的引用!
}

// ✅ 正确: 返回所有权
fn no_dangle() -> String {
    let s = String::from("hello");
    s // 所有权转移
}
```

**2. 生命周期**

```rust
// ❌ 错误: 缺少生命周期标注
fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() { x } else { y }
}

// ✅ 正确: 添加生命周期
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

**3. 错误处理**

```rust
// ❌ 错误: panic在生产环境
let home = "127.0.0.1".parse::<IpAddr>().unwrap();

// ✅ 正确: 使用Result
let home: Result<IpAddr, _> = "127.0.0.1".parse();
match home {
    Ok(addr) => println!("{}", addr),
    Err(e) => eprintln!("Error: {}", e),
}
```

## 4.6 性能优化审查

### 4.6.1 数据库性能

**1. 索引使用**

```typescript
// ❌ 错误: 查询未索引字段
const users = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
) // email没有索引

// ✅ 正确: 确保索引
CREATE INDEX idx_users_email ON users(email);
```

**2. 查询优化**

```typescript
// ❌ 错误: SELECT *
const users = await db.query('SELECT * FROM users')

// ✅ 正确: 只选择需要的字段
const users = await db.query(
  'SELECT id, name, email FROM users'
)
```

**3. 批量操作**

```typescript
// ❌ 错误: 循环插入
for (const item of items) {
  await db.query('INSERT INTO items VALUES ($1)', [item])
}

// ✅ 正确: 批量插入
const values = items.map((item, i) => `($${i + 1})`).join(',')
await db.query(`INSERT INTO items VALUES ${values}`, items)
```

### 4.6.2 前端性能

**1. 代码分割**

```typescript
// ❌ 错误: 同步导入所有页面
import Dashboard from './Dashboard'
import Settings from './Settings'
import Profile from './Profile'

// ✅ 正确: 动态导入
const Dashboard = dynamic(() => import('./Dashboard'))
const Settings = dynamic(() => import('./Settings'))
const Profile = dynamic(() => import('./Profile'))
```

**2. 图片优化**

```typescript
// ❌ 错误: 大图片未优化
<img src="/large-banner.jpg" />

// ✅ 正确: 使用Next.js Image
<Image
  src="/large-banner.jpg"
  alt="Banner"
  width={1920}
  height={1080}
  loading="lazy"
/>
```

**3. 缓存策略**

```typescript
// ❌ 错误: 每次请求都重新计算
export async function getServerSideProps() {
  const data = await fetchData()
  return { props: { data } }
}

// ✅ 正确: 使用ISR缓存
export async function getStaticProps() {
  const data = await fetchData()
  return {
    props: { data },
    revalidate: 60 // 60秒后重新验证
  }
}
```

### 4.6.3 内存管理

**1. 避免内存泄漏**

```typescript
// ❌ 错误: 未清理定时器
useEffect(() => {
  setInterval(() => {
    updateData()
  }, 1000)
}, [])

// ✅ 正确: 清理定时器
useEffect(() => {
  const timer = setInterval(() => {
    updateData()
  }, 1000)

  return () => clearInterval(timer)
}, [])
```

**2. 大数据处理**

```typescript
// ❌ 错误: 一次性加载所有数据
const allData = await fetchAllData() // 1GB数据!

// ✅ 正确: 分页或流式处理
const page = await fetchPage(1, 100)
// 或使用流
const stream = createReadStream('large-file.json')
```

## 4.7 审查工作流程

### 4.7.1 Pull Request流程

**标准流程**:

```
1. 开发者提交PR
   └─ 自动运行CI测试
   └─ 自动代码审查

2. 自动审查结果
   └─ 通过 → 等待人工审查
   └─ 失败 → 阻止合并,要求修复

3. 人工审查
   └─ 至少1位审查者批准
   └─ 解决所有评论

4. 合并
   └─ Squash and merge
   └─ 删除分支
```

**GitHub Actions配置**:

```yaml
# .github/workflows/code-review.yml
name: Code Review

on:
  pull_request:
    branches: [main]

jobs:
  automated-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci

      - name: Lint
        run: npm run lint

      - name: Security audit
        run: npm audit --audit-level=high

      - name: Test
        run: npm test -- --coverage

      - name: Build
        run: npm run build

      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ All automated checks passed! Ready for review.'
            })
```

### 4.7.2 审查清单模板

**Pull Request模板**:

```markdown
## 描述
<!-- 简要描述这个PR的目的 -->

## 变更类型
- [ ] Bug修复
- [ ] 新功能
- [ ] 重构
- [ ] 文档更新

## 测试
- [ ] 添加了单元测试
- [ ] 添加了集成测试
- [ ] 手动测试通过

## 检查清单
- [ ] 代码通过ESLint检查
- [ ] 测试覆盖率 ≥ 80%
- [ ] 无安全漏洞(npm audit clean)
- [ ] 文档已更新
- [ ] 无breaking changes(或已说明)

## 相关Issue
Closes #123
```

### 4.7.3 审查反馈规范

**好的审查评论示例**:

```
🔴 阻塞问题

[CRITICAL] SQL注入漏洞
文件: src/api/users.ts:45

当前代码使用字符串拼接构建SQL查询,
存在SQL注入风险。

❌ 当前代码:
const query = `SELECT * FROM users WHERE id = ${userId}`

✅ 建议:
const query = 'SELECT * FROM users WHERE id = $1'
const result = await db.query(query, [userId])

参考: https://owasp.org/www-community/attacks/SQL_Injection
```

**建设性反馈模板**:

```
[严重性] 问题标题
位置: 文件名:行号

问题描述: 简明扼要说明问题

❌ 当前代码:
代码片段

✅ 建议方案:
改进后的代码

理由: 为什么要这样改

参考链接: 相关文档或最佳实践
```

## 4.8 代码审查最佳实践

### 4.8.1 审查者指南

**DO(应该做)**:

1. **及时审查** - 24小时内完成审查
2. **建设性反馈** - 提供具体的改进建议
3. **解释原因** - 说明为什么要改,不只是指出问题
4. **平衡严格和灵活** - 区分必须修复和可选改进
5. **学习心态** - 审查也是学习的机会

**DON'T(不应该做)**:

1. **不要过度挑剔** - 关注重要问题,不要纠结细节
2. **不要使用贬义语言** - 保持专业和尊重
3. **不要只批评不表扬** - 也要认可好的代码
4. **不要拖延审查** - 阻塞他人的开发进度
5. **不要越权修改** - 除非被明确要求

### 4.8.2 被审查者指南

**DO**:

1. **小批量提交** - 每个PR控制在400行以内
2. **提供上下文** - PR描述清楚说明目的和背景
3. **自我审查** - 提交前先自己审查一遍
4. **及时响应** - 快速回应审查意见
5. **保持开放心态** - 接受建设性反馈

**DON'T**:

1. **不要提交未测试的代码**
2. **不要忽略审查意见** - 即使不同意也要讨论
3. **不要把PR当成"完成"** - 合并才算完成
4. **不要防御性太强** - 对事不对人
5. **不要提交大量无关变更** - 一个PR一个目的

### 4.8.3 审查效率技巧

**1. 使用检查清单**

确保每次审查都覆盖关键点:

- [ ] 安全性
- [ ] 性能
- [ ] 可维护性
- [ ] 测试覆盖
- [ ] 文档完整

**2. 分类审查**

按类型而不是按文件审查:

```
第一轮: 功能和逻辑
第二轮: 安全性
第三轮: 性能
第四轮: 代码风格
```

**3. 使用工具**

```bash
# 自动格式化
npm run format

# 自动修复lint问题
npm run lint -- --fix

# 自动安全检查
npm audit
```

**4. 时间管理**

- 每个文件审查时间: 5-10分钟
- 单次审查总时间: 不超过60分钟
- 超过60分钟 → 分批审查

## 4.9 持续改进

### 4.9.1 审查指标追踪

**关键指标**:

```typescript
interface ReviewMetrics {
  // 审查速度
  timeToFirstReview: number      // 从PR创建到首次审查(小时)
  timeToApproval: number         // 从PR创建到批准(小时)

  // 审查质量
  issuesFoundInReview: number    // 审查中发现的问题数
  issuesFoundInQA: number        // QA阶段发现的问题数(越低越好)
  issuesFoundInProduction: number // 生产环境发现的问题数(越低越好)

  // 审查参与度
  reviewCommentsPerPR: number    // 每个PR的平均评论数
  codeReviewCoverage: number     // 代码审查覆盖率(%)
}
```

**目标值**:

| 指标 | 目标值 | 可接受范围 |
|------|--------|-----------|
| Time to first review | < 4h | < 24h |
| Time to approval | < 24h | < 48h |
| Issues found in production | 0 | < 1/month |
| Code review coverage | 100% | > 90% |

### 4.9.2 审查文化建设

**1. 定期回顾**

每月举行审查回顾会议:
- 哪些审查做得好?
- 哪些问题被遗漏了?
- 如何改进审查流程?

**2. 分享学习**

```markdown
# 本周代码审查精选

## 优秀实践
- @alice 发现了关键的安全漏洞
- @bob 的性能优化建议提升了50%性能

## 常见问题
- 多个PR缺少错误处理
- 建议: 统一添加try-catch和错误日志

## 新规范
- 所有API端点必须添加速率限制
```

**3. 培训新人**

为新人提供审查培训:
- 如何给出建设性反馈
- 如何回应审查意见
- 常见问题识别

### 4.9.3 自动化增强

**1. Git Hooks**

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm test -- --findRelatedTests
```

**2. 自动分配审查者**

```yaml
# .github/CODEOWNERS
# 自动分配审查者
/api/** @backend-team
/frontend/** @frontend-team
/security/** @security-team
```

**3. 自动评论**

```yaml
# .github/workflows/auto-comment.yml
name: Auto Comment
on: pull_request

jobs:
  comment:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/github-script@v6
        with:
          script: |
            const { data: files } = await github.rest.pulls.listFiles({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number
            })

            const hasDatabaseChanges = files.some(f =>
              f.filename.includes('migrations/')
            )

            if (hasDatabaseChanges) {
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: '⚠️ This PR contains database migrations. Please review carefully.'
              })
            }
```

## 4.10 实战案例: 审查一个支付模块

让我们通过一个真实案例演示完整的审查流程。

### 4.10.1 提交的代码

```typescript
// src/payment/processor.ts
export async function processPayment(
  amount: number,
  cardNumber: string,
  cvv: string,
  expiry: string
) {
  // 验证卡片信息
  if (cardNumber.length !== 16) {
    throw new Error('Invalid card number')
  }

  // 调用支付网关
  const response = await fetch('https://api.payment.com/charge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      card_number: cardNumber,
      cvv,
      expiry
    })
  })

  const result = await response.json()

  if (result.success) {
    return result.transaction_id
  } else {
    throw new Error('Payment failed')
  }
}
```

### 4.10.2 审查发现的问题

```markdown
# 代码审查报告

## [CRITICAL] 安全问题

### 1. 敏感数据日志泄露
**文件**: src/payment/processor.ts

**问题**: 支付信息可能在日志中暴露

❌ 当前代码:
```typescript
body: JSON.stringify({
  amount,
  card_number: cardNumber,
  cvv,           // CVV绝不能存储或传输!
  expiry
})
```

✅ 建议:
```typescript
// CVV只能在即时交易中使用,不应持久化或日志
const paymentData = {
  amount,
  card_number: cardNumber,
  expiry
}

// 支付网关需要CVV但不应记录
const encryptedCVV = encryptForTransmission(cvv)

// 记录交易(脱敏)
logger.info('Processing payment', {
  amount,
  cardLastFour: cardNumber.slice(-4),
  // 不记录CVV和完整卡号!
})
```

---

### 2. 缺少输入验证
**文件**: src/payment/processor.ts:3

**问题**: 输入验证不充分,只检查长度

❌ 当前代码:
```typescript
if (cardNumber.length !== 16) {
  throw new Error('Invalid card number')
}
```

✅ 建议:
```typescript
import { z } from 'zod'

const PaymentSchema = z.object({
  amount: z.number().positive().max(10000), // 最大金额
  cardNumber: z.string()
    .regex(/^\d{16}$/, 'Card number must be 16 digits'),
  cvv: z.string()
    .regex(/^\d{3,4}$/, 'CVV must be 3-4 digits'),
  expiry: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry format')
    .refine(isValidExpiry, 'Card expired')
})

function isValidExpiry(expiry: string): boolean {
  const [month, year] = expiry.split('/').map(Number)
  const now = new Date()
  const expiryDate = new Date(2000 + year, month - 1)
  return expiryDate > now
}

// 在函数开始时验证
const validated = PaymentSchema.parse({
  amount,
  cardNumber,
  cvv,
  expiry
})
```

---

### 3. 缺少错误处理
**文件**: src/payment/processor.ts:18

**问题**: fetch请求可能失败(网络错误、超时等)

❌ 当前代码:
```typescript
const response = await fetch('https://api.payment.com/charge', {
  // 没有超时设置!
  // 没有错误处理!
})
```

✅ 建议:
```typescript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时

try {
  const response = await fetch('https://api.payment.com/charge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PAYMENT_API_KEY}`
    },
    body: JSON.stringify(paymentData),
    signal: controller.signal
  })

  clearTimeout(timeoutId)

  if (!response.ok) {
    throw new PaymentError(
      `Payment API error: ${response.status}`,
      'API_ERROR'
    )
  }

  const result = await response.json()
  return result
} catch (error) {
  clearTimeout(timeoutId)

  if (error.name === 'AbortError') {
    throw new PaymentError('Payment timeout', 'TIMEOUT')
  }

  throw new PaymentError(
    'Payment processing failed',
    'NETWORK_ERROR',
    { cause: error }
  )
}
```

---

## [HIGH] 代码质量

### 4. 缺少类型定义

❌ 当前代码:
```typescript
const result = await response.json() // any类型
```

✅ 建议:
```typescript
interface PaymentResponse {
  success: boolean
  transaction_id: string
  error?: {
    code: string
    message: string
  }
}

const result: PaymentResponse = await response.json()
```

---

### 5. 硬编码API URL

❌ 当前代码:
```typescript
await fetch('https://api.payment.com/charge', {
```

✅ 建议:
```typescript
const PAYMENT_API_URL = process.env.PAYMENT_API_URL ||
  'https://api.payment.com/charge'

await fetch(PAYMENT_API_URL, {
```

---

### 6. 缺少事务记录

**问题**: 支付处理没有持久化记录

✅ 建议:
```typescript
// 在处理前记录
const transaction = await db.transactions.create({
  data: {
    amount,
    cardLastFour: cardNumber.slice(-4),
    status: 'PENDING',
    userId: context.user.id
  }
})

try {
  const result = await processPaymentWithGateway(paymentData)

  // 更新记录
  await db.transactions.update({
    where: { id: transaction.id },
    data: {
      status: 'COMPLETED',
      transactionId: result.transaction_id
    }
  })

  return result
} catch (error) {
  // 记录失败
  await db.transactions.update({
    where: { id: transaction.id },
    data: {
      status: 'FAILED',
      error: error.message
    }
  })

  throw error
}
```

---

## 审查总结

| 严重性 | 数量 | 状态 |
|--------|------|------|
| CRITICAL | 3 | 🔴 阻塞 |
| HIGH | 3 | 🟡 强烈建议 |
| MEDIUM | 0 | ✅ |
| LOW | 0 | ✅ |

**裁决**: 🔴 **BLOCK** - 必须修复CRITICAL问题才能合并
```

### 4.10.3 修复后的代码

```typescript
// src/payment/processor.ts
import { z } from 'zod'
import { db } from '@/lib/database'
import { logger } from '@/lib/logger'
import { PaymentError } from './errors'

// 验证模式
const PaymentSchema = z.object({
  amount: z.number().positive().max(10000),
  cardNumber: z.string().regex(/^\d{16}$/),
  cvv: z.string().regex(/^\d{3,4}$/),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/)
})

interface PaymentResponse {
  success: boolean
  transaction_id: string
  error?: {
    code: string
    message: string
  }
}

const PAYMENT_API_URL = process.env.PAYMENT_API_URL ||
  'https://api.payment.com/charge'

const API_TIMEOUT = 30000 // 30秒

/**
 * 处理支付请求
 *
 * @param amount - 支付金额(美元)
 * @param cardNumber - 16位卡号
 * @param cvv - 3-4位CVV
 * @param expiry - 过期日期(MM/YY格式)
 * @returns 交易ID
 * @throws PaymentError 支付失败
 */
export async function processPayment(
  amount: number,
  cardNumber: string,
  cvv: string,
  expiry: string
): Promise<string> {
  // 1. 验证输入
  const validated = PaymentSchema.parse({ amount, cardNumber, cvv, expiry })

  // 2. 创建事务记录
  const transaction = await db.transactions.create({
    data: {
      amount: validated.amount,
      cardLastFour: validated.cardNumber.slice(-4),
      status: 'PENDING',
      userId: context.user.id
    }
  })

  // 3. 准备支付数据(脱敏)
  const paymentData = {
    amount: validated.amount,
    card_number: validated.cardNumber,
    expiry: validated.expiry
    // CVV单独加密传输,不持久化
  }

  // 4. 记录处理(不包含敏感信息)
  logger.info('Processing payment', {
    transactionId: transaction.id,
    amount: validated.amount,
    cardLastFour: validated.cardNumber.slice(-4)
  })

  try {
    // 5. 调用支付网关(带超时)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    const response = await fetch(PAYMENT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PAYMENT_API_KEY}`
      },
      body: JSON.stringify({
        ...paymentData,
        cvv: validated.cvv // 仅传输,不记录
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new PaymentError(
        `Payment API error: ${response.status}`,
        'API_ERROR'
      )
    }

    const result: PaymentResponse = await response.json()

    if (!result.success) {
      throw new PaymentError(
        result.error?.message || 'Payment failed',
        result.error?.code || 'UNKNOWN'
      )
    }

    // 6. 更新事务记录
    await db.transactions.update({
      where: { id: transaction.id },
      data: {
        status: 'COMPLETED',
        transactionId: result.transaction_id
      }
    })

    logger.info('Payment completed', {
      transactionId: transaction.id,
      gatewayTransactionId: result.transaction_id
    })

    return result.transaction_id
  } catch (error) {
    // 7. 记录失败
    await db.transactions.update({
      where: { id: transaction.id },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })

    logger.error('Payment failed', {
      transactionId: transaction.id,
      error: error instanceof Error ? error.message : 'Unknown'
    })

    if (error instanceof PaymentError) {
      throw error
    }

    if (error.name === 'AbortError') {
      throw new PaymentError('Payment timeout', 'TIMEOUT')
    }

    throw new PaymentError(
      'Payment processing failed',
      'NETWORK_ERROR',
      { cause: error }
    )
  }
}
```

## 4.11 本章小结

通过本章的学习,我们掌握了:

- 代码审查的重要性和ROI
- Claude Code的审查工具:`🔵 /code-review`命令和各种审查代理
- 全面的审查清单体系:安全性、代码质量、性能、最佳实践
- OWASP Top 10安全检查方法
- 语言特定的审查策略(Python、Go、Kotlin、Rust)
- 性能优化审查技巧
- 完整的审查工作流程和最佳实践
- 如何建设审查文化

**关键要点**:

1. **安全第一** - CRITICAL问题必须零容忍
2. **自动化优先** - 用工具处理重复性检查
3. **建设性反馈** - 审查是为了改进,不是批评
4. **持续改进** - 追踪指标,定期回顾
5. **团队责任** - 代码是团队资产,审查是共同责任

**下一步行动**:

1. 配置项目代码审查流程
2. 设置自动化审查工具
3. 制定团队审查规范
4. 定期回顾和改进

## 下一章预告

在下一章"自动化测试与部署"中,我们将学习:
- 如何生成和运行端到端测试
- 测试覆盖率管理
- CI/CD集成和自动化部署
- 部署实践和策略

结合TDD和代码审查,我们将构建完整的质量保证体系,实现持续交付。
