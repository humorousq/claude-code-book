# 第2章 需求规划与架构设计

> 本章将深入讲解如何使用 Claude Code 进行需求分析和架构设计，通过 AI 辅助将业务需求转化为可执行的技术方案。

## 2.1 工作流概述

在现代软件开发中，需求规划与架构设计是最关键的阶段之一。这个阶段决定了项目的方向、技术选型和团队协作方式。传统的需求分析往往依赖经验丰富的架构师，而 Claude Code 通过 AI 辅助，让这个流程更加高效和可靠。

### 从需求到架构的完整流程

使用 Claude Code 的需求规划工作流包含以下步骤：

```
业务需求 → 需求分析 → 技术方案 → 架构设计 → 文档输出
```

**流程说明**：

1. **业务需求**：从用户故事、市场调研或客户反馈开始
2. **需求分析**：使用 `🔵 /plan` 命令分解和细化需求
3. **技术方案**：评估多种实现方式，选择最优方案
4. **架构设计**：设计系统架构、数据模型、接口定义
5. **文档输出**：自动生成 README、CLAUDE.md、API 文档等

### AI 辅助需求分析的优势

相比传统方式，使用 Claude Code 进行需求规划具有以下优势：

| 优势 | 说明 | 示例 |
|------|------|------|
| **全面性** | AI 能考虑更多边界情况和异常场景 | 自动识别遗漏的异常处理需求 |
| **一致性** | 保持技术方案和文档的一致性 | 自动同步 API 文档与代码注释 |
| **可追溯** | 需求变更自动传播到相关文档 | 修改需求后自动更新架构图 |
| **知识积累** | 从历史项目中学习最佳实践 | 推荐成熟的架构模式 |

#### 全面性示例

传统的需求分析依赖个人经验，容易遗漏边界情况。Claude Code 通过分析大量历史项目和最佳实践，能够自动识别常见的需求遗漏点。

例如，在设计一个用户登录功能时，经验丰富的开发者可能会考虑到密码重置、账号锁定等场景，但可能遗漏异地登录提醒、设备管理等高级功能。Claude Code 会基于常见的认证系统模式，自动建议这些容易被忽视的需求点。

### 工作流适用场景与限制

**适用场景**：
- ✅ 中大型项目（3个月以上）
- ✅ 需要团队协作的项目
- ✅ 技术复杂度较高的系统
- ✅ 需要长期维护和迭代的产品

**限制**：
- ⚠️ 小型原型项目可能过度工程化
- ⚠️ 紧急修复场景不适合完整流程
- ⚠️ 需要一定的学习成本

## 2.2 需求分析实践

### `🔵 /plan` 命令深度使用

`🔵 /plan` 命令是 Claude Code 中最核心的需求分析工具。它能够将模糊的业务需求转化为清晰的技术任务。

**基本用法**：

```bash
# 基于用户故事创建需求文档
🔵 `/plan` "作为用户，我想要一个待办事项应用，可以添加、删除、标记完成任务"

# 基于现有代码库生成改进计划
🔵 `/plan` --analyze-codebase

# 从需求文档生成实施计划
🔵 `/plan` --input requirements.md
```

**高级参数**：

```bash
# 指定输出格式
🔵 `/plan` --output json

# 限制任务数量（避免过度分解）
🔵 `/plan` --max-tasks 20

# 指定技术栈
🔵 `/plan` --stack "React + Node.js + PostgreSQL"
```

### 与 🟢 planner agent 协作

🟢 planner agent 是专门用于需求分析和任务分解的智能体。它能够：

- 重新阐述需求以确保理解正确
- 识别风险和潜在阻碍
- 创建分步骤的实施计划
- 估算复杂度和所需时间

**调用 🟢 planner agent**：

```bash
# 方式 1: 使用 🔵 `/plan` 命令（推荐）
🔵 `/plan` "实现一个用户认证系统"

# 方式 2: 直接调用 agent
claude-code --agent planner "实现一个用户认证系统"
```

### 需求分析实战示例

让我们通过一个实际案例来演示完整的需求分析流程。

**业务需求**：

```
作为一个电商平台的运营人员，
我想要一个商品库存管理系统，
以便实时监控库存水平并自动补货。

验收标准：
1. 能够查看所有商品的当前库存
2. 当库存低于阈值时自动发送通知
3. 支持手动调整库存数量
4. 生成库存报告（每日/每周/每月）
```

**执行 `🔵 /plan` 命令**：

```bash
🔵 `/plan` "电商平台库存管理系统：查看库存、自动补货通知、手动调整、库存报告"
```

**Claude Code 生成的技术需求**：

```json
{
  "project": "库存管理系统",
  "epics": [
    {
      "id": "INV-001",
      "title": "库存查询系统",
      "priority": "高",
      "stories": [
        "查询所有商品库存",
        "按分类筛选商品",
        "搜索特定商品",
        "分页显示结果"
      ],
      "estimated_effort": "5 story points"
    },
    {
      "id": "INV-002",
      "title": "库存预警系统",
      "priority": "高",
      "stories": [
        "设置库存阈值",
        "自动发送邮件通知",
        "记录预警历史",
        "支持多种通知渠道"
      ],
      "estimated_effort": "8 story points"
    },
    {
      "id": "INV-003",
      "title": "库存调整功能",
      "priority": "中",
      "stories": [
        "手动调整库存数量",
        "批量导入库存更新",
        "调整记录审计日志"
      ],
      "estimated_effort": "3 story points"
    },
    {
      "id": "INV-004",
      "title": "库存报告系统",
      "priority": "中",
      "stories": [
        "生成每日库存报告",
        "生成每周库存趋势",
        "生成每月库存分析",
        "导出 PDF 和 Excel 格式"
      ],
      "estimated_effort": "5 story points"
    }
  ],
  "architecture": {
    "frontend": "React + TypeScript",
    "backend": "Node.js + Express",
    "database": "PostgreSQL",
    "cache": "Redis",
    "message_queue": "RabbitMQ",
    "monitoring": "Prometheus + Grafana"
  },
  "identified_edge_cases": [
    "并发更新库存的竞态条件",
    "商品下架后的库存处理",
    "多仓库场景的库存同步",
    "库存为负数的异常处理",
    "大批量导入的性能优化"
  ],
  "risks": [
    {
      "level": "高",
      "description": "并发更新可能导致数据不一致",
      "mitigation": "使用数据库事务和乐观锁"
    },
    {
      "level": "中",
      "description": "邮件通知可能被标记为垃圾邮件",
      "mitigation": "配置 SPF/DKIM，使用专业邮件服务"
    }
  ]
}
```

### 需求变更管理

在实际项目中，需求变更是常态。Claude Code 提供了需求变更追踪功能：

**变更追踪流程**：

1. **记录变更**：原始需求 → 新需求
2. **影响分析**：自动识别受影响的组件和文件
3. **文档同步**：更新相关文档和架构图
4. **通知团队**：自动通知相关开发者

## 2.3 架构设计流程

### 与 🟢 architect agent 协作

🟢 architect agent 是专注于系统设计和架构决策的智能体。它能够：

- 为新功能设计系统架构
- 评估技术权衡
- 推荐最佳实践和设计模式
- 识别可扩展性瓶颈

**调用 🟢 architect agent**：

```bash
# 设计新系统架构
claude-code --agent architect "设计一个微服务架构的电商平台"

# 评估现有架构
claude-code --agent architect --evaluate-current-architecture
```

### 架构设计最佳实践

#### 模块化与关注点分离

**单一职责原则**：每个模块只负责一个功能

```javascript
// ❌ 错误示例：一个模块做太多事情
class UserManager {
  createUser() { /* ... */ }
  sendEmail() { /* ... */ }
  generateReport() { /* ... */ }
}

// ✅ 正确示例：职责分离
class UserService {
  createUser() { /* ... */ }
}

class EmailService {
  sendEmail() { /* ... */ }
}

class ReportService {
  generateReport() { /* ... */ }
}
```

#### 可扩展性设计

**水平扩展能力**：系统能够通过增加服务器来提升性能

```yaml
# 示例：使用 Docker Compose 配置可扩展架构
services:
  app:
    image: myapp:latest
    deploy:
      replicas: 3  # 可以根据负载动态调整
    environment:
      - DATABASE_URL=postgres://db:5432/mydb
      - REDIS_URL=redis://cache:6379
      - MESSAGE_QUEUE=amqp://mq:5672
```

#### 数据模型设计

**规范化数据库设计**：减少数据冗余

```sql
-- 用户表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 订单表
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  status VARCHAR(50) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 订单明细表
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);
```

### 架构决策记录（ADR）

对于重要的架构决策，创建架构决策记录（Architecture Decision Record）：

```markdown
# ADR-001：使用 Redis 进行会话存储

## 背景
需要存储用户会话数据，支持分布式部署。

## 决定
使用 Redis 作为会话存储，而不是数据库。

## 影响

### 积极影响
- 快速的读写性能（< 1ms）
- 支持会话过期时间
- 易于扩展
- 支持分布式部署

### 消极影响
- 需要额外的 Redis 服务器
- 数据不持久化（重启后丢失）
- 需要配置 Redis 集群以保证高可用

### 考虑过的替代方案
- **数据库存储**：性能较差，但数据持久化
- **文件存储**：性能最差，但最简单
- **JWT 无状态**：无法主动注销会话

## 状态
已接受

## 日期
2025-01-15
```

## 2.4 文档自动化

### 自动生成 README

Claude Code 可以根据项目结构自动生成专业的 README 文档：

```markdown
# 项目名称

简短的项目描述

## 功能特性

- 功能 1
- 功能 2
- 功能 3

## 技术栈

- Frontend: React, TypeScript
- Backend: Node.js, Express
- Database: PostgreSQL

## 快速开始

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 运行项目

\`\`\`bash
npm run dev
\`\`\`

## 项目结构

\`\`\`
project/
├── src/
│   ├── components/
│   ├── services/
│   └── utils/
├── tests/
└── docs/
\`\`\`

## 贡献指南

请参阅 CONTRIBUTING.md

## 许可证

MIT
```

### CLAUDE.md 文件维护

`CLAUDE.md` 文件为 AI 助手提供项目上下文。Claude Code 可以自动维护此文件：

```markdown
# CLAUDE.md

本文件为 Claude Code 处理此仓库代码时提供指导。

## 项目概述

[自动生成的项目描述]

## 运行测试

\`\`\`bash
npm test
\`\`\`

## 架构

[自动生成的架构说明]

## 关键命令

[自动生成的命令列表]

## 开发说明

[自动生成的开发规范]
```

## 2.5 实战案例：微服务项目从需求到架构

让我们通过一个完整的案例，演示从需求到架构的完整流程。

### 业务需求

```
构建一个在线教育平台，支持：
1. 用户注册和登录
2. 课程浏览和购买
3. 视频播放和进度跟踪
4. 在线测试和成绩管理
5. 教师直播授课
```

### 需求分析（使用 `🔵 /plan`）

```bash
🔵 `/plan` "在线教育平台：用户管理、课程购买、视频学习、在线测试、直播授课"
```

### 架构设计（使用 🟢 architect agent）

**微服务架构**：

```
┌─────────────────────────────────────────────────┐
│                   API Gateway                     │
│                 (Kong/Ambassador)                │
└─────────────────┬───────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────────┐
    │             │             │                 │
┌───▼───┐     ┌───▼───┐     ┌───▼───┐         ┌───▼───┐
│ User  │     │Course │     │ Video │         │ Live  │
│Service│     │Service│     │Service│         │Service│
└───┬───┘     └───┬───┘     └───┬───┘         └───┬───┘
    │             │             │                 │
┌───▼───┐     ┌───▼───┐     ┌───▼───┐         ┌───▼───┐
│Postgres│   │Postgres│   │Postgres│         │ Redis │
└───────┘   └───────┘   └───────┘         └───────┘
```

**服务职责**：

1. **User Service**: 用户认证、授权、个人信息管理
2. **Course Service**: 课程管理、购买流程、订单处理
3. **Video Service**: 视频存储、播放、进度跟踪
4. **Live Service**: 直播流管理、实时互动

### 技术选型

```yaml
Frontend:
  - React 18 with TypeScript
  - Tailwind CSS for styling
  - Zustand for state management

Backend:
  - Node.js with Express
  - PostgreSQL for persistent storage
  - Redis for caching and sessions
  - RabbitMQ for message queuing

Infrastructure:
  - Docker for containerization
  - Kubernetes for orchestration
  - AWS/GCP for cloud hosting
  - CloudFlare for CDN
```

### 数据模型

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 课程表
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  teacher_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 购买记录表
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  purchased_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- 视频表
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  title VARCHAR(255) NOT NULL,
  video_url TEXT NOT NULL,
  duration INTEGER NOT NULL,
  sequence INTEGER NOT NULL
);

-- 学习进度表
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  video_id UUID REFERENCES videos(id),
  watched_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, video_id)
);
```

### 实施步骤

**阶段 1: 基础架构搭建**（2周）
1. 搭建微服务脚手架
2. 配置 API Gateway
3. 设置数据库和缓存
4. 实现用户认证服务

**阶段 2: 核心功能开发**（4周）
1. 开发课程管理服务
2. 实现视频播放服务
3. 构建购买流程
4. 集成支付系统

**阶段 3: 高级功能**（3周）
1. 开发直播服务
2. 实现在线测试
3. 添加学习进度跟踪
4. 构建推荐系统

**阶段 4: 优化和部署**（1周）
1. 性能优化
2. 安全加固
3. 部署到生产环境
4. 监控和告警配置

---

**本章小结**：

- 需求规划工作流包含 5 个核心步骤
- 使用 `🔵 /plan` 命令和 🟢 planner agent 进行需求分析
- 使用 🟢 architect agent 进行架构设计
- Claude Code 自动生成和维护项目文档
- 实战案例展示了完整的从需求到架构的流程

**关键要点**：
- AI 辅助提供全面性、一致性、可追溯性和知识积累
- 需要根据项目规模选择合适的工作流模式
- 架构决策应记录在 ADR 中
- 文档自动化是提高效率的关键

**下一章预告**：第2章将深入讲解测试驱动开发（TDD）工作流。
