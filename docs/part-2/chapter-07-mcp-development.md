# 第7章 MCP 服务器开发与集成

> "工具扩展能力决定了 AI 助手的上限。MCP 让 Claude Code 成为真正可扩展的开发平台。"

## 本章概述

Model Context Protocol (MCP) 是 Anthropic 推出的开放协议,允许开发者创建可被 Claude 使用的工具和资源。通过 MCP,你可以将任何 API、数据库或服务集成到 Claude Code 的工作流中,极大地扩展其能力边界。

本章将深入探讨 MCP 的核心概念、服务器开发、集成实践以及生产部署策略。通过本章的学习,你将掌握:

- MCP 协议的核心概念和架构设计
- 如何开发自定义 MCP 服务器
- 使用 Claude Code 提供的 MCP 配置模板
- 配置和调试 MCP 集成
- 安全性和性能最佳实践
- 生产环境部署方案
- 实际案例分析和故障排查

## 7.1 MCP 协议深入解析

### 7.1.1 什么是 Model Context Protocol

MCP (Model Context Protocol) 是一个开放标准,定义了 AI 模型如何与外部工具和资源交互。它的核心思想是:

**将 Claude 从"对话系统"转变为"操作平台"**

```
┌──────────────────────────────────────────────┐
│          传统 Claude 交互模式                  │
│                                              │
│  User Query → Claude → Text Response         │
│                                              │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│          MCP 增强的 Claude                    │
│                                              │
│  User Query → Claude → Tool Call            │
│       ↓                                      │
│  MCP Server → External Service              │
│       ↓                                      │
│  Result → Claude → Actionable Response      │
│                                              │
└──────────────────────────────────────────────┘
```

**核心优势**:

1. **标准化接口** - 统一的工具调用协议,避免为每个工具编写适配器
2. **安全性** - 通过权限控制和沙箱机制保护敏感操作
3. **可扩展性** - 插件化架构,轻松添加新功能
4. **上下文感知** - 工具可以访问对话上下文,提供更智能的响应

### 7.1.2 MCP 架构组件

MCP 由三个核心组件构成:

#### 1. Tools (工具)

工具是可执行的函数,Claude 可以调用来完成特定任务。

**示例**:
```json
{
  "name": "get_weather",
  "description": "获取指定城市的天气信息",
  "inputSchema": {
    "type": "object",
    "properties": {
      "city": {
        "type": "string",
        "description": "城市名称"
      },
      "unit": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "default": "celsius"
      }
    },
    "required": ["city"]
  }
}
```

#### 2. Resources (资源)

资源是可读取的数据源,Claude 可以查询但不修改。

**示例**:
```json
{
  "uri": "database://users/profiles",
  "name": "用户档案数据库",
  "description": "只读访问用户档案信息",
  "mimeType": "application/json"
}
```

#### 3. Prompts (提示模板)

预定义的提示模板,帮助用户快速启动常见任务。

**示例**:
```json
{
  "name": "analyze_code",
  "description": "分析代码质量和潜在问题",
  "arguments": [
    {
      "name": "file_path",
      "description": "要分析的文件路径",
      "required": true
    }
  ]
}
```

### 7.1.3 MCP 通信协议

MCP 基于 JSON-RPC 2.0 协议,支持两种传输方式:

#### Stdio Transport (标准输入输出)

最简单的传输方式,MCP 服务器作为子进程运行:

```
┌──────────────┐      stdin/stdout      ┌──────────────┐
│              │ ──────────────────→   │              │
│  Claude Code │                       │  MCP Server  │
│              │ ←──────────────────   │              │
└──────────────┘                       └──────────────┘
```

**优点**:
- 配置简单,无需端口管理
- 生命周期跟随 Claude Code
- 适合本地工具

**缺点**:
- 不支持多客户端
- 调试较困难

#### HTTP Transport (HTTP 传输)

MCP 服务器作为独立的 HTTP 服务:

```
┌──────────────┐      HTTP POST        ┌──────────────┐
│              │ ──────────────────→   │              │
│  Claude Code │   localhost:3000     │  MCP Server  │
│              │ ←──────────────────   │              │
└──────────────┘                       └──────────────┘
```

**优点**:
- 支持多客户端
- 易于调试和监控
- 可以独立部署

**缺点**:
- 需要管理端口和进程
- 配置相对复杂

### 7.1.4 消息流程示例

当 Claude 决定调用工具时,完整的消息流程如下:

```mermaid
sequenceDiagram
    participant User
    participant Claude
    participant MCP Server
    participant External API

    User->>Claude: 查询北京天气
    Claude->>Claude: 分析需要调用 get_weather 工具
    Claude->>MCP Server: tools/call {"name": "get_weather", "arguments": {"city": "Beijing"}}
    MCP Server->>External API: HTTP GET /weather?city=Beijing
    External API-->>MCP Server: {"temp": 25, "condition": "sunny"}
    MCP Server-->>Claude: {"content": "北京当前气温25°C,天气晴朗"}
    Claude-->>User: 北京现在天气晴朗,气温25摄氏度...
```

## 7.2 开发自定义 MCP 服务器

### 7.2.1 环境准备

开发 MCP 服务器的基本要求:

- **Node.js 18+** (推荐使用 TypeScript)
- **Python 3.8+** (如使用 Python SDK)
- MCP SDK 包

**Node.js 项目初始化**:

```bash
# 创建项目目录
mkdir my-mcp-server
cd my-mcp-server

# 初始化 Node.js 项目
npm init -y

# 安装 MCP SDK
npm install @modelcontextprotocol/sdk

# 安装 TypeScript (推荐)
npm install -D typescript @types/node
npx tsc --init
```

**Python 项目初始化**:

```bash
# 创建项目目录
mkdir my-mcp-server
cd my-mcp-server

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装 MCP SDK
pip install mcp
```

### 7.2.2 第一个 MCP 服务器

让我们创建一个简单的计算器 MCP 服务器,提供基本的数学运算功能。

**TypeScript 版本**:

```typescript
// src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// 创建服务器实例
const server = new Server(
  {
    name: 'calculator-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 定义可用工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'add',
        description: '计算两个数字的和',
        inputSchema: {
          type: 'object',
          properties: {
            a: {
              type: 'number',
              description: '第一个数字',
            },
            b: {
              type: 'number',
              description: '第二个数字',
            },
          },
          required: ['a', 'b'],
        },
      },
      {
        name: 'multiply',
        description: '计算两个数字的乘积',
        inputSchema: {
          type: 'object',
          properties: {
            a: {
              type: 'number',
              description: '第一个数字',
            },
            b: {
              type: 'number',
              description: '第二个数字',
            },
          },
          required: ['a', 'b'],
        },
      },
    ],
  };
});

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'add': {
      const result = args.a + args.b;
      return {
        content: [
          {
            type: 'text',
            text: `${args.a} + ${args.b} = ${result}`,
          },
        ],
      };
    }

    case 'multiply': {
      const result = args.a * args.b;
      return {
        content: [
          {
            type: 'text',
            text: `${args.a} × ${args.b} = ${result}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Calculator MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

**Python 版本**:

```python
# src/server.py
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

# 创建服务器实例
server = Server("calculator-server")

# 定义工具列表
@server.list_tools()
async def list_tools():
    return [
        Tool(
            name="add",
            description="计算两个数字的和",
            inputSchema={
                "type": "object",
                "properties": {
                    "a": {
                        "type": "number",
                        "description": "第一个数字"
                    },
                    "b": {
                        "type": "number",
                        "description": "第二个数字"
                    }
                },
                "required": ["a", "b"]
            }
        ),
        Tool(
            name="multiply",
            description="计算两个数字的乘积",
            inputSchema={
                "type": "object",
                "properties": {
                    "a": {
                        "type": "number",
                        "description": "第一个数字"
                    },
                    "b": {
                        "type": "number",
                        "description": "第二个数字"
                    }
                },
                "required": ["a", "b"]
            }
        )
    ]

# 处理工具调用
@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "add":
        result = arguments["a"] + arguments["b"]
        return [TextContent(
            type="text",
            text=f"{arguments['a']} + {arguments['b']} = {result}"
        )]
    elif name == "multiply":
        result = arguments["a"] * arguments["b"]
        return [TextContent(
            type="text",
            text=f"{arguments['a']} × {arguments['b']} = {result}"
        )]
    else:
        raise ValueError(f"Unknown tool: {name}")

# 启动服务器
async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

### 7.2.3 添加资源支持

工具用于执行操作,资源用于读取数据。让我们扩展计算器服务器,添加计算历史记录资源:

```typescript
// src/index.ts (扩展版本)
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// 存储计算历史
const calculationHistory: Array<{
  operation: string;
  a: number;
  b: number;
  result: number;
  timestamp: Date;
}> = [];

const server = new Server(
  {
    name: 'calculator-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// 列出可用资源
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'calculator://history',
        name: '计算历史记录',
        description: '所有已执行计算的历史记录',
        mimeType: 'application/json',
      },
    ],
  };
});

// 读取资源内容
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'calculator://history') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(calculationHistory, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// 扩展工具调用处理器,记录历史
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  let result: number;
  let operation: string;

  switch (name) {
    case 'add': {
      result = args.a + args.b;
      operation = 'addition';
      break;
    }

    case 'multiply': {
      result = args.a * args.b;
      operation = 'multiplication';
      break;
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }

  // 记录到历史
  calculationHistory.push({
    operation,
    a: args.a,
    b: args.b,
    result,
    timestamp: new Date(),
  });

  return {
    content: [
      {
        type: 'text',
        text: `${args.a} ${name === 'add' ? '+' : '×'} ${args.b} = ${result}`,
      },
    ],
  };
});

// ... 其余代码保持不变
```

### 7.2.4 添加提示模板

提示模板让用户可以快速启动常见任务:

```typescript
// src/index.ts (添加提示模板)
import {
  // ... 之前的导入
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

server = new Server(
  {
    name: 'calculator-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// 列出可用提示
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'batch_calculate',
        description: '批量执行多个计算操作',
        arguments: [
          {
            name: 'operations',
            description: '计算操作的JSON数组,例如: [{"op":"add","a":1,"b":2}]',
            required: true,
          },
        ],
      },
    ],
  };
});

// 获取提示内容
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'batch_calculate') {
    const operations = JSON.parse(args.operations);

    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `请依次执行以下计算操作:\n${operations
              .map(
                (op: any) =>
                  `- ${op.op === 'add' ? '加法' : '乘法'}: ${op.a} 和 ${op.b}`
              )
              .join('\n')}`,
          },
        },
      ],
    };
  }

  throw new Error(`Unknown prompt: ${name}`);
});
```

## 7.3 MCP 服务器配置与部署

### 7.3.1 配置文件结构

Claude Code 使用 JSON 配置文件管理 MCP 服务器。配置文件位置:

- **全局配置**: `~/.claude.json`
- **项目配置**: `.claude.json` (项目根目录)

**基础配置格式**:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

### 7.3.2 Claude Code 官方 MCP 配置

Claude Code 提供了丰富的 MCP 服务器配置模板,位于 `/mcp-configs/mcp-servers.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_PAT_HERE"
      },
      "description": "GitHub operations - PRs, issues, repos"
    },
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "YOUR_FIRECRAWL_KEY_HERE"
      },
      "description": "Web scraping and crawling"
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref=YOUR_PROJECT_REF"],
      "description": "Supabase database operations"
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "description": "Persistent memory across sessions"
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "description": "Chain-of-thought reasoning"
    }
  }
}
```

### 7.3.3 HTTP 传输配置

对于使用 HTTP 传输的 MCP 服务器:

```json
{
  "mcpServers": {
    "vercel": {
      "type": "http",
      "url": "https://mcp.vercel.com",
      "description": "Vercel deployments and projects"
    },
    "cloudflare-docs": {
      "type": "http",
      "url": "https://docs.mcp.cloudflare.com/mcp",
      "description": "Cloudflare documentation search"
    },
    "browser-use": {
      "type": "http",
      "url": "https://api.browser-use.com/mcp",
      "headers": {
        "x-browser-use-api-key": "YOUR_BROWSER_USE_KEY_HERE"
      },
      "description": "AI browser agent for web tasks"
    }
  }
}
```

### 7.3.4 环境变量管理

**最佳实践**: 不要在配置文件中硬编码敏感信息,使用环境变量:

**方式1: 使用 `.env` 文件**

```bash
# .env
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxxxxxxxxxx
FIRECRAWL_API_KEY=fc_xxxxxxxxxxxxx
EXA_API_KEY=exa_xxxxxxxxxxxxx
```

**方式2: 在配置中引用环境变量**

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

**方式3: 使用系统环境变量**

```bash
# macOS/Linux
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxxxxxxxxxxxx"

# Windows (PowerShell)
$env:GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxxxxxxxxxxxx"
```

### 7.3.5 项目级 vs 全局配置

**全局配置示例** (`~/.claude.json`):

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "description": "Persistent memory - used everywhere"
    }
  },
  "disabledMcpServers": []
}
```

**项目配置示例** (`.claude.json`):

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/dev/my-project"],
      "description": "Project-specific filesystem access"
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref=abc123"],
      "description": "This project's Supabase instance"
    }
  },
  "disabledMcpServers": ["memory"]  // 禁用全局的 memory 服务器
}
```

## 7.4 实战案例: 开发企业级 MCP 服务器

### 7.4.1 案例背景

假设我们需要为团队开发一个 MCP 服务器,集成公司的内部系统:

- **数据库查询**: PostgreSQL 数据库只读访问
- **API 集成**: 内部微服务 API 调用
- **日志查询**: ELK 栈日志搜索
- **权限控制**: 基于角色的访问控制

### 7.4.2 项目结构

```
enterprise-mcp-server/
├── src/
│   ├── index.ts              # 主入口
│   ├── tools/
│   │   ├── database.ts       # 数据库工具
│   │   ├── api.ts            # API 工具
│   │   └── logs.ts           # 日志工具
│   ├── resources/
│   │   └── schemas.ts        # 数据库 schema 资源
│   ├── middleware/
│   │   ├── auth.ts           # 认证中间件
│   │   └── rate-limit.ts     # 速率限制
│   └── config.ts             # 配置管理
├── package.json
├── tsconfig.json
└── .env.example
```

### 7.4.3 核心实现

**配置管理** (`src/config.ts`):

```typescript
// src/config.ts
import { config } from 'dotenv';
import { z } from 'zod';

config();

const configSchema = z.object({
  // 数据库配置
  DATABASE_URL: z.string().url(),
  DATABASE_READONLY: z.string().default('true'),

  // API 配置
  API_BASE_URL: z.string().url(),
  API_KEY: z.string().min(32),

  // ELK 配置
  ELASTICSEARCH_URL: z.string().url(),
  ELASTICSEARCH_API_KEY: z.string(),

  // 安全配置
  JWT_SECRET: z.string().min(32),
  ALLOWED_ROLES: z.string().default('developer,admin'),

  // 速率限制
  RATE_LIMIT_REQUESTS: z.string().default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().default('60000'),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
  const result = configSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Configuration validation failed:');
    console.error(result.error.flatten());
    process.exit(1);
  }

  return result.data;
}
```

**数据库工具** (`src/tools/database.ts`):

```typescript
// src/tools/database.ts
import { Pool } from 'pg';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export function createDatabaseTools(pool: Pool): Tool[] {
  return [
    {
      name: 'query_database',
      description: '在只读模式下执行 SQL 查询 (SELECT 语句)',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'SQL SELECT 查询语句',
          },
          limit: {
            type: 'number',
            description: '返回结果的最大行数',
            default: 100,
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'list_tables',
      description: '列出数据库中的所有表',
      inputSchema: {
        type: 'object',
        properties: {
          schema: {
            type: 'string',
            description: '数据库 schema 名称',
            default: 'public',
          },
        },
      },
    },
  ];
}

export async function handleDatabaseTool(
  name: string,
  args: Record<string, any>,
  pool: Pool,
  userRole: string
): Promise<any> {
  // 权限检查
  if (!['developer', 'admin'].includes(userRole)) {
    throw new Error('Insufficient permissions for database access');
  }

  switch (name) {
    case 'query_database': {
      // 安全检查: 只允许 SELECT 语句
      const query = args.query.trim().toUpperCase();
      if (!query.startsWith('SELECT')) {
        throw new Error('Only SELECT queries are allowed');
      }

      // 执行查询
      const result = await pool.query({
        text: args.query,
        rowMode: 'array',
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                rowCount: result.rowCount,
                rows: result.rows.slice(0, args.limit || 100),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case 'list_tables': {
      const schema = args.schema || 'public';
      const result = await pool.query(
        `SELECT tablename FROM pg_tables WHERE schemaname = $1 ORDER BY tablename`,
        [schema]
      );

      return {
        content: [
          {
            type: 'text',
            text: `Tables in schema "${schema}":\n${result.rows
              .map((r) => `- ${r.tablename}`)
              .join('\n')}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown database tool: ${name}`);
  }
}
```

**认证中间件** (`src/middleware/auth.ts`):

```typescript
// src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request } from '@modelcontextprotocol/sdk/types.js';

interface User {
  id: string;
  role: string;
  permissions: string[];
}

export function createAuthMiddleware(secret: string) {
  return {
    async authenticate(request: Request): Promise<User> {
      // 从请求头提取 token
      const authHeader = request.headers?.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Missing or invalid authorization header');
      }

      const token = authHeader.substring(7);

      try {
        // 验证 JWT
        const decoded = jwt.verify(token, secret) as User;
        return decoded;
      } catch (error) {
        throw new Error('Invalid or expired token');
      }
    },

    hasPermission(user: User, requiredPermission: string): boolean {
      return user.permissions.includes(requiredPermission) ||
             user.role === 'admin';
    },
  };
}
```

**速率限制** (`src/middleware/rate-limit.ts`):

```typescript
// src/middleware/rate-limit.ts
import { RateLimiterMemory } from 'rate-limiter-flexible';

export function createRateLimiter(
  points: number = 100,
  duration: number = 60
) {
  const limiter = new RateLimiterMemory({
    points, // 每个时间窗口允许的请求数
    duration, // 时间窗口(秒)
  });

  return {
    async checkLimit(userId: string): Promise<void> {
      try {
        await limiter.consume(userId);
      } catch (error) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
    },

    async getRemainingPoints(userId: string): Promise<number> {
      try {
        const result = await limiter.get(userId);
        return result?.remainingPoints || 0;
      } catch {
        return 0;
      }
    },
  };
}
```

**主服务器** (`src/index.ts`):

```typescript
// src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Pool } from 'pg';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { loadConfig } from './config.js';
import { createDatabaseTools, handleDatabaseTool } from './tools/database.js';
import { createAuthMiddleware } from './middleware/auth.js';
import { createRateLimiter } from './middleware/rate-limit.js';

async function main() {
  // 加载配置
  const config = loadConfig();

  // 初始化数据库连接池
  const pool = new Pool({
    connectionString: config.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
  });

  // 初始化中间件
  const authMiddleware = createAuthMiddleware(config.JWT_SECRET);
  const rateLimiter = createRateLimiter(
    parseInt(config.RATE_LIMIT_REQUESTS),
    parseInt(config.RATE_LIMIT_WINDOW_MS) / 1000
  );

  // 创建服务器
  const server = new Server(
    {
      name: 'enterprise-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // 注册工具列表
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        ...createDatabaseTools(pool),
        // ... 其他工具
      ],
    };
  });

  // 处理工具调用
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // 提取用户信息 (从请求上下文)
    const user = request.context?.user;
    if (!user) {
      throw new Error('Unauthenticated');
    }

    // 速率限制检查
    await rateLimiter.checkLimit(user.id);

    // 权限检查
    const allowedRoles = config.ALLOWED_ROLES.split(',');
    if (!allowedRoles.includes(user.role)) {
      throw new Error('Insufficient permissions');
    }

    // 路由到对应的处理器
    if (name.startsWith('query_database') || name.startsWith('list_tables')) {
      return handleDatabaseTool(name, args, pool, user.role);
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  // 启动服务器
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Enterprise MCP server started');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

### 7.4.4 构建和部署

**构建脚本** (`package.json`):

```json
{
  "name": "enterprise-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "dotenv": "^16.4.5",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.12.0",
    "rate-limiter-flexible": "^5.0.3",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^20.14.10",
    "@types/pg": "^8.11.6",
    "@typescript-eslint/eslint-plugin": "^7.16.0",
    "@typescript-eslint/parser": "^7.16.0",
    "eslint": "^8.57.0",
    "jest": "^29.7.0",
    "tsx": "^4.16.2",
    "typescript": "^5.5.3"
  }
}
```

**部署配置** (`.claude.json`):

```json
{
  "mcpServers": {
    "enterprise": {
      "command": "node",
      "args": ["/opt/mcp-servers/enterprise/dist/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://readonly@db.internal:5432/production",
        "API_BASE_URL": "https://api.internal.company.com",
        "API_KEY": "${INTERNAL_API_KEY}",
        "ELASTICSEARCH_URL": "https://elk.internal.company.com:9200",
        "ELASTICSEARCH_API_KEY": "${ELASTICSEARCH_API_KEY}",
        "JWT_SECRET": "${JWT_SECRET}",
        "ALLOWED_ROLES": "developer,admin,analyst",
        "RATE_LIMIT_REQUESTS": "100",
        "RATE_LIMIT_WINDOW_MS": "60000"
      }
    }
  }
}
```

## 7.5 高级特性与最佳实践

### 7.5.1 错误处理

**标准错误响应**:

```typescript
// 推荐: 返回结构化错误信息
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    // 处理逻辑...

  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'validation_error',
              message: error.message,
              details: error.details,
            }),
          },
        ],
        isError: true,
      };
    }

    if (error instanceof PermissionError) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'permission_denied',
              message: error.message,
              requiredRole: error.requiredRole,
            }),
          },
        ],
        isError: true,
      };
    }

    // 通用错误
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'internal_error',
            message: 'An unexpected error occurred',
            // 生产环境不要暴露详细错误信息
          }),
        },
      ],
      isError: true,
    };
  }
});
```

### 7.5.2 性能优化

**数据库连接池**:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  min: 5,           // 最小连接数
  max: 20,          // 最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 健康检查
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection healthy');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}, 60000);
```

**缓存策略**:

```typescript
import NodeCache from 'node-cache';

// 创建缓存实例
const cache = new NodeCache({
  stdTTL: 300,      // 默认 TTL: 5 分钟
  checkperiod: 60,  // 每 60 秒检查过期键
});

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== undefined) {
    return cached;
  }

  const data = await fetcher();
  cache.set(key, data, ttl);
  return data;
}

// 使用示例
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'get_user_profile') {
    const userId = request.params.arguments.userId;

    const profile = await getCachedData(
      `user:${userId}`,
      () => fetchUserProfile(userId),
      600  // 缓存 10 分钟
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(profile),
        },
      ],
    };
  }
});
```

**批量操作优化**:

```typescript
// 不推荐: 多次单独查询
async function getUserProfilesBad(userIds: string[]) {
  const profiles = [];
  for (const id of userIds) {
    const profile = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    profiles.push(profile.rows[0]);
  }
  return profiles;
}

// 推荐: 单次批量查询
async function getUserProfilesGood(userIds: string[]) {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = ANY($1)',
    [userIds]
  );
  return result.rows;
}
```

### 7.5.3 日志和监控

**结构化日志**:

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const startTime = Date.now();
  const { name, arguments: args } = request.params;

  logger.info(
    {
      tool: name,
      args,
      userId: request.context?.user?.id,
    },
    'Tool invocation started'
  );

  try {
    const result = await handleToolCall(name, args);

    logger.info(
      {
        tool: name,
        duration: Date.now() - startTime,
        success: true,
      },
      'Tool invocation completed'
    );

    return result;
  } catch (error) {
    logger.error(
      {
        tool: name,
        duration: Date.now() - startTime,
        error: error.message,
        stack: error.stack,
      },
      'Tool invocation failed'
    );

    throw error;
  }
});
```

**指标收集**:

```typescript
import { collectDefaultMetrics, Registry, Counter, Histogram } from 'prom-client';

// 创建 Prometheus 注册表
const register = new Registry();
collectDefaultMetrics({ register });

// 自定义指标
const toolInvocationCounter = new Counter({
  name: 'mcp_tool_invocations_total',
  help: 'Total number of tool invocations',
  labelNames: ['tool', 'status'],
  registers: [register],
});

const toolDurationHistogram = new Histogram({
  name: 'mcp_tool_duration_seconds',
  help: 'Duration of tool invocations in seconds',
  labelNames: ['tool'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

// 在处理器中记录指标
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const timer = toolDurationHistogram.startTimer({ tool: request.params.name });

  try {
    const result = await handleToolCall(request.params.name, request.params.arguments);
    toolInvocationCounter.inc({ tool: request.params.name, status: 'success' });
    return result;
  } catch (error) {
    toolInvocationCounter.inc({ tool: request.params.name, status: 'error' });
    throw error;
  } finally {
    timer();
  }
});
```

### 7.5.4 安全最佳实践

**输入验证**:

```typescript
import { z } from 'zod';

// 定义严格的输入 schema
const SearchQuerySchema = z.object({
  query: z.string()
    .min(1, 'Query cannot be empty')
    .max(500, 'Query too long')
    .refine(
      (q) => !q.includes(';') && !q.includes('--'),
      'Query contains invalid characters'
    ),
  limit: z.number().int().min(1).max(1000).default(100),
  offset: z.number().int().min(0).default(0),
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'search_database') {
    // 验证输入
    const result = SearchQuerySchema.safeParse(request.params.arguments);

    if (!result.success) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'invalid_input',
              details: result.error.flatten(),
            }),
          },
        ],
        isError: true,
      };
    }

    const { query, limit, offset } = result.data;
    // 安全地使用验证后的输入...
  }
});
```

**SQL 注入防护**:

```typescript
// 危险: 直接拼接 SQL
async function searchUsersBad(name: string) {
  const query = `SELECT * FROM users WHERE name LIKE '%${name}%'`;
  return await pool.query(query);
}

// 安全: 使用参数化查询
async function searchUsersGood(name: string) {
  const query = 'SELECT * FROM users WHERE name LIKE $1';
  return await pool.query(query, [`%${name}%`]);
}
```

**敏感数据过滤**:

```typescript
// 敏感字段列表
const SENSITIVE_FIELDS = ['password', 'api_key', 'secret', 'token', 'ssn'];

function filterSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(filterSensitiveData);
  }

  const filtered: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_FIELDS.some((field) => key.toLowerCase().includes(field))) {
      filtered[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      filtered[key] = filterSensitiveData(value);
    } else {
      filtered[key] = value;
    }
  }
  return filtered;
}

// 在返回结果前过滤
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const result = await handleToolCall(request.params);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(filterSensitiveData(result)),
      },
    ],
  };
});
```

### 7.5.5 测试策略

**单元测试**:

```typescript
// tests/tools/database.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Pool } from 'pg';
import { handleDatabaseTool } from '../../src/tools/database.js';

describe('Database Tools', () => {
  let pool: Pool;

  beforeEach(async () => {
    // 使用测试数据库
    pool = new Pool({
      connectionString: 'postgresql://test:test@localhost:5432/mcp_test',
    });

    // 创建测试表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT
      )
    `);

    await pool.query(`
      INSERT INTO test_users (name, email) VALUES
        ('Alice', 'alice@example.com'),
        ('Bob', 'bob@example.com')
    `);
  });

  afterEach(async () => {
    await pool.query('DROP TABLE IF EXISTS test_users');
    await pool.end();
  });

  it('should execute SELECT query', async () => {
    const result = await handleDatabaseTool(
      'query_database',
      { query: 'SELECT * FROM test_users' },
      pool,
      'developer'
    );

    expect(result.content).toBeDefined();
    const data = JSON.parse(result.content[0].text);
    expect(data.rowCount).toBe(2);
    expect(data.rows).toHaveLength(2);
  });

  it('should reject non-SELECT queries', async () => {
    await expect(
      handleDatabaseTool(
        'query_database',
        { query: 'DROP TABLE test_users' },
        pool,
        'developer'
      )
    ).rejects.toThrow('Only SELECT queries are allowed');
  });

  it('should enforce role-based access', async () => {
    await expect(
      handleDatabaseTool(
        'query_database',
        { query: 'SELECT * FROM test_users' },
        pool,
        'viewer'
      )
    ).rejects.toThrow('Insufficient permissions');
  });
});
```

**集成测试**:

```typescript
// tests/integration/server.test.ts
import { describe, it, expect } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

describe('MCP Server Integration', () => {
  it('should list available tools', async () => {
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/index.js'],
    });

    const client = new Client(
      { name: 'test-client', version: '1.0.0' },
      { capabilities: {} }
    );

    await client.connect(transport);

    const tools = await client.request(
      { method: 'tools/list' },
      ListToolsResultSchema
    );

    expect(tools.tools).toBeInstanceOf(Array);
    expect(tools.tools.length).toBeGreaterThan(0);

    await client.close();
  });

  it('should execute tool successfully', async () => {
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/index.js'],
    });

    const client = new Client(
      { name: 'test-client', version: '1.0.0' },
      { capabilities: {} }
    );

    await client.connect(transport);

    const result = await client.request(
      {
        method: 'tools/call',
        params: {
          name: 'list_tables',
          arguments: { schema: 'public' },
        },
      },
      CallToolResultSchema
    );

    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe('text');

    await client.close();
  });
});
```

## 7.6 常见 MCP 服务器实例分析

### 7.6.1 GitHub MCP Server

官方提供的 GitHub MCP 服务器是最常用的集成之一:

```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_PAT_HERE"
    },
    "description": "GitHub operations - PRs, issues, repos"
  }
}
```

**提供的工具**:
- `create_issue` - 创建 Issue
- `create_pull_request` - 创建 Pull Request
- `search_repositories` - 搜索仓库
- `get_file_contents` - 获取文件内容
- `push_files` - 推送文件
- `create_branch` - 创建分支

**使用场景**:

```typescript
// Claude Code 自动执行 GitHub 操作
// 用户: "创建一个新分支 feature/user-auth,并添加认证相关文件"

// Claude 会调用:
// 1. create_branch({ owner, repo, branch: "feature/user-auth" })
// 2. push_files({ owner, repo, branch, files: [...] })
// 3. create_pull_request({ title, body, head, base })
```

### 7.6.2 Memory Server

持久化记忆服务器,跨会话保持上下文:

```json
{
  "memory": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-memory"],
    "description": "Persistent memory across sessions"
  }
}
```

**提供的资源**:
- `memory://graph` - 知识图谱
- `memory://entities` - 实体列表

**提供的工具**:
- `create_entities` - 创建实体
- `create_relations` - 创建关系
- `add_observations` - 添加观察
- `delete_entities` - 删除实体
- `read_graph` - 读取图谱
- `search_nodes` - 搜索节点
- `open_nodes` - 打开节点

**使用示例**:

```
用户: 记住项目 my-app 使用 React 18 和 TypeScript 5

Claude 会调用:
create_entities({
  entities: [{
    name: "my-app",
    entityType: "project",
    observations: [
      "Uses React 18",
      "Uses TypeScript 5"
    ]
  }]
})

下次会话时:
用户: my-app 用什么技术栈?
Claude 会调用 search_nodes({ query: "my-app" })
Claude: 根据记忆,my-app 使用 React 18 和 TypeScript 5
```

### 7.6.3 Sequential Thinking Server

增强 Claude 的推理能力:

```json
{
  "sequential-thinking": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
    "description": "Chain-of-thought reasoning"
  }
}
```

**工作原理**:

```
Claude 内部决策过程:
┌─────────────────────────────────────┐
│ 问题: 设计用户认证系统              │
│                                     │
│ Step 1: 分析需求                    │
│   → 需要邮箱+密码登录               │
│   → 需要 OAuth (Google, GitHub)     │
│   → 需要 JWT token 管理             │
│                                     │
│ Step 2: 设计数据模型                │
│   → User 表: id, email, password   │
│   → OAuthConnection 表             │
│   → Session 表                      │
│                                     │
│ Step 3: 选择技术栈                  │
│   → bcrypt for password hashing    │
│   → passport.js for OAuth          │
│   → jsonwebtoken for JWT           │
│                                     │
│ Step 4: 实现步骤                    │
│   → ...                             │
└─────────────────────────────────────┘
```

### 7.6.4 Filesystem Server

安全的文件系统访问:

```json
{
  "filesystem": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-filesystem",
      "/Users/dev/projects"
    ],
    "description": "Filesystem operations (set your path)"
  }
}
```

**安全机制**:
- 只能访问指定路径
- 禁止访问父目录 (`../`)
- 符号链接解析保护

**提供的工具**:
- `read_file` - 读取文件
- `write_file` - 写入文件
- `list_directory` - 列出目录
- `create_directory` - 创建目录
- `move_file` - 移动文件
- `search_files` - 搜索文件
- `get_file_info` - 获取文件信息

### 7.6.5 Firecrawl Server

网页抓取和爬虫:

```json
{
  "firecrawl": {
    "command": "npx",
    "args": ["-y", "firecrawl-mcp"],
    "env": {
      "FIRECRAWL_API_KEY": "YOUR_FIRECRAWL_KEY_HERE"
    },
    "description": "Web scraping and crawling"
  }
}
```

**提供的工具**:
- `firecrawl_scrape` - 抓取单个页面
- `firecrawl_crawl` - 爬取整个网站
- `firecrawl_search` - 搜索网页内容

**使用场景**:

```
用户: 抓取 https://example.com 的文档页面

Claude 会调用:
firecrawl_scrape({
  url: "https://example.com/docs",
  formats: ["markdown"]
})

返回:
# Example Documentation
完整的文档内容...
```

### 7.6.6 Browserbase Server

云端浏览器自动化:

```json
{
  "browserbase": {
    "command": "npx",
    "args": ["-y", "@browserbasehq/mcp-server-browserbase"],
    "env": {
      "BROWSERBASE_API_KEY": "YOUR_BROWSERBASE_KEY_HERE"
    },
    "description": "Cloud browser sessions via Browserbase"
  }
}
```

**能力**:
- 执行 JavaScript
- 截图
- 网页交互
- 表单填写
- 端到端测试

**示例**:

```
用户: 打开 https://example.com/login 并登录

Claude 会调用:
1. browserbase_navigate({ url: "https://example.com/login" })
2. browserbase_screenshot() // 查看登录表单
3. browserbase_type({ selector: "#email", text: "user@example.com" })
4. browserbase_type({ selector: "#password", text: "..." })
5. browserbase_click({ selector: "#submit" })
```

## 7.7 故障排查与调试

### 7.7.1 常见问题

#### 问题1: MCP 服务器无法启动

**症状**:
```
Error: Failed to connect to MCP server
spawn ENOENT
```

**排查步骤**:

1. 检查命令路径是否正确:

```bash
# 验证 npx 是否可用
which npx

# 手动运行命令测试
npx -y @modelcontextprotocol/server-github
```

2. 检查环境变量:

```bash
# 验证环境变量是否设置
echo $GITHUB_PERSONAL_ACCESS_TOKEN

# 在配置中使用正确的环境变量名
# .claude.json
{
  "mcpServers": {
    "github": {
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

3. 检查 Node.js 版本:

```bash
node --version  # 应该 >= 18.0.0
```

#### 问题2: 工具调用超时

**症状**:
```
Error: Tool invocation timeout after 30000ms
```

**原因和解决方案**:

| 原因 | 解决方案 |
|------|----------|
| 查询执行时间过长 | 优化 SQL 查询,添加索引 |
| 外部 API 响应慢 | 增加超时时间,添加缓存 |
| 网络问题 | 实现重试机制 |
| 资源不足 | 增加内存/CPU,优化资源使用 |

**代码修复**:

```typescript
// 添加超时控制
import { setTimeout } from 'timers/promises';

async function callWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  const timeout = setTimeout(timeoutMs).then(() => {
    throw new Error(errorMessage);
  });

  return Promise.race([promise, timeout]);
}

// 使用
const result = await callWithTimeout(
  pool.query('SELECT * FROM large_table'),
  5000,
  'Database query timed out after 5 seconds'
);
```

#### 问题3: 权限错误

**症状**:
```
Error: Insufficient permissions
```

**调试方法**:

```typescript
// 添加详细日志
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const user = request.context?.user;
  console.log('User info:', {
    id: user?.id,
    role: user?.role,
    permissions: user?.permissions,
  });

  console.log('Required permissions:', {
    tool: request.params.name,
    allowedRoles: ['developer', 'admin'],
  });

  // ... 权限检查逻辑
});
```

#### 问题4: 内存泄漏

**症状**:
- 服务器内存使用持续增长
- 最终崩溃或变慢

**排查工具**:

```typescript
// 添加内存监控
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`,
  });
}, 30000);

// 使用 Node.js 内存分析
// node --inspect dist/index.js
// 打开 chrome://inspect
```

### 7.7.2 调试技巧

#### 使用 MCP Inspector

MCP 官方提供的调试工具:

```bash
# 安装
npm install -g @modelcontextprotocol/inspector

# 运行
mcp-inspector node dist/index.js
```

打开 `http://localhost:5173` 可以看到:
- 所有可用工具
- 工具 schema
- 测试调用界面
- 日志输出

#### 详细日志输出

```typescript
// 启用调试日志
process.env.LOG_LEVEL = 'debug';

const logger = pino({
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    },
  },
});

// 在所有关键点添加日志
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  logger.debug({ request: request.params }, 'Incoming tool call');

  try {
    const result = await handleToolCall(request.params);
    logger.debug({ result }, 'Tool call result');
    return result;
  } catch (error) {
    logger.error({ error }, 'Tool call failed');
    throw error;
  }
});
```

#### 使用 VS Code 调试

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug MCP Server",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/dist/index.js",
      "env": {
        "LOG_LEVEL": "debug"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

### 7.7.3 性能监控

#### 使用 Prometheus + Grafana

**指标暴露端点**:

```typescript
import express from 'express';

// 创建独立的 metrics 服务
const app = express();

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error.message);
  }
});

app.listen(9090, () => {
  console.log('Metrics server running on port 9090');
});
```

**Prometheus 配置** (`prometheus.yml`):

```yaml
scrape_configs:
  - job_name: 'mcp-server'
    static_configs:
      - targets: ['localhost:9090']
```

**Grafana Dashboard**:

导入预配置的仪表盘来监控:
- 请求速率
- 响应时间分布
- 错误率
- 资源使用情况

## 7.8 生产部署最佳实践

### 7.8.1 容器化部署

**Dockerfile**:

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 运行阶段
FROM node:20-alpine

WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S mcpuser && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G mcpuser -g mcpuser mcpuser

# 复制构建产物
COPY --from=builder --chown=mcpuser:mcpuser /app/dist ./dist
COPY --from=builder --chown=mcpuser:mcpuser /app/node_modules ./node_modules

# 安全: 只读文件系统
RUN chmod -R 555 /app

USER mcpuser

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["node", "dist/index.js"]
```

**docker-compose.yml**:

```yaml
version: '3.8'

services:
  mcp-server:
    build: .
    container_name: enterprise-mcp-server
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      API_KEY: ${API_KEY}
      JWT_SECRET: ${JWT_SECRET}
    networks:
      - mcp-network
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
    networks:
      - mcp-network

networks:
  mcp-network:
    driver: bridge
```

### 7.8.2 高可用部署

**使用 PM2**:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'mcp-server',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
```

**启动命令**:

```bash
# 安装 PM2
npm install -g pm2

# 启动集群
pm2 start ecosystem.config.js

# 监控
pm2 monit

# 日志
pm2 logs
```

### 7.8.3 负载均衡

**Nginx 配置**:

```nginx
upstream mcp_backend {
    least_conn;
    server mcp-server-1:3000;
    server mcp-server-2:3000;
    server mcp-server-3:3000;
}

server {
    listen 80;
    server_name mcp.yourcompany.com;

    # HTTPS 重定向
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mcp.yourcompany.com;

    ssl_certificate /etc/letsencrypt/live/mcp.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mcp.yourcompany.com/privkey.pem;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://mcp_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 7.8.4 自动扩展

**Kubernetes Deployment**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-server
  labels:
    app: mcp-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mcp-server
  template:
    metadata:
      labels:
        app: mcp-server
    spec:
      containers:
      - name: mcp-server
        image: yourcompany/mcp-server:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: mcp-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: mcp-server-service
spec:
  selector:
    app: mcp-server
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: mcp-server-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: mcp-server
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 7.8.5 备份和灾难恢复

**数据库备份脚本**:

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/mcp_db_$TIMESTAMP.sql.gz"

# 创建备份
pg_dump $DATABASE_URL | gzip > $BACKUP_FILE

# 加密备份 (可选)
# gpg --encrypt --recipient admin@company.com $BACKUP_FILE

# 上传到云存储
aws s3 cp $BACKUP_FILE s3://your-bucket/backups/

# 保留最近 30 天的备份
find $BACKUP_DIR -name "mcp_db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

**定时任务** (cron):

```bash
# 每天凌晨 2 点执行备份
0 2 * * * /opt/mcp-server/scripts/backup.sh >> /var/log/mcp-backup.log 2>&1
```

## 7.9 未来发展与生态

### 7.9.1 MCP 协议演进

MCP 协议正在快速发展,未来可能包括:

**计划中的特性**:
- **Streaming Support** - 流式响应,支持长时间运行的任务
- **Bidirectional Communication** - 双向通信,服务器可以主动推送消息
- **Tool Composition** - 工具组合,允许工具调用其他工具
- **Resource Subscriptions** - 资源订阅,资源变化时自动通知

**协议版本管理**:

```typescript
// 服务器声明支持的协议版本
const server = new Server(
  {
    name: 'my-server',
    version: '1.0.0',
    protocolVersion: '2024-11-05', // MCP 协议版本
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
      // 未来能力
      streaming: {},
      subscriptions: {},
    },
  }
);
```

### 7.9.2 生态系统工具

**MCP Server Registry**:

社区维护的 MCP 服务器注册表:
- 发现和分享 MCP 服务器
- 版本管理和依赖关系
- 质量评分和用户评价

**MCP Development Kit**:

官方提供的开发工具包:
- 脚手架生成器
- 测试框架
- 调试工具
- 文档生成器

**使用脚手架**:

```bash
# 创建新项目
npx create-mcp-server my-server

# 选择模板
? Select template:
  ❯ basic-typescript
    basic-python
    database-integration
    api-wrapper
    enterprise-starter

# 生成的项目结构
my-server/
├── src/
│   ├── index.ts
│   ├── tools/
│   ├── resources/
│   └── tests/
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### 7.9.3 社区资源

**官方资源**:
- GitHub: https://github.com/modelcontextprotocol
- 文档: https://modelcontextprotocol.io
- Discord 社区: https://discord.gg/mcp

**第三方资源**:
- Awesome MCP: https://github.com/awesome-mcp
- MCP Examples: https://github.com/mcp-examples
- MCP Blog: https://mcp.dev/blog

## 7.10 本章小结

### 关键要点

1. **MCP 是扩展 Claude Code 能力的核心机制** - 通过标准化的工具、资源和提示接口,将 Claude 转变为可编程的操作平台

2. **开发 MCP 服务器需要全面考虑** - 从协议实现、安全性、性能到错误处理和测试

3. **配置管理至关重要** - 使用环境变量保护敏感信息,合理组织全局和项目级配置

4. **安全性不容忽视** - 实施输入验证、权限控制、速率限制和敏感数据过滤

5. **生产部署需要专业实践** - 容器化、负载均衡、监控告警、备份恢复一个都不能少

### 实践清单

在开发自己的 MCP 服务器时,确保完成以下检查:

- [ ] 定义清晰的工具 schema,包含详细的描述和参数验证
- [ ] 实现全面的错误处理,返回结构化错误信息
- [ ] 添加速率限制和权限控制
- [ ] 使用参数化查询防止 SQL 注入
- [ ] 过滤敏感数据,避免泄露机密信息
- [ ] 编写单元测试和集成测试
- [ ] 添加结构化日志和性能监控
- [ ] 使用容器化打包和部署
- [ ] 准备详细的文档和使用示例
- [ ] 制定备份和灾难恢复计划

### 下一步学习

完成本章学习后,建议:

1. **动手实践** - 选择一个简单的需求(如天气查询、股票价格),开发你的第一个 MCP 服务器

2. **阅读源码** - 研究官方 MCP 服务器的实现,学习最佳实践

3. **贡献社区** - 将你的 MCP 服务器开源,分享给社区

4. **深入探索** - 学习更高级的主题,如流式处理、双向通信等

### 延伸阅读

- MCP 官方规范文档
- Anthropic 官方博客: "Building Tools for Claude"
- "Designing Secure AI Tools" - OWASP Guide
- "Production Node.js" - 最佳实践指南

---

在下一章中,我们将探讨如何开发定制化 Agent,将 MCP 服务器作为 Agent 的能力扩展,创建真正智能的工作流自动化系统。
