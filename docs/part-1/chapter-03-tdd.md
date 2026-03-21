# 第3章 测试驱动开发实战

> "测试不是负担,而是安全保障。TDD不是方法论,而是思维方式。"

## 本章概述

测试驱动开发(Test-Driven Development, TDD)是一种革命性的软件开发实践,它将测试从开发流程的末端移到了最前端。通过"先写测试,再写代码"的方式,TDD不仅提高了代码质量,更改变了开发者的思维方式。

本章将深入探讨如何在Claude Code环境中实践TDD,涵盖完整的工作流程、测试策略、实战案例以及质量保证方法。通过本章的学习,你将掌握:

- TDD的核心原则和红-绿-重构循环
- 如何使用Claude Code的`/tdd`命令和`tdd-guide`代理
- 单元测试、集成测试和端到端测试的最佳实践
- 如何达到80%以上的测试覆盖率
- 处理边界情况和错误的策略
- 模拟外部依赖的模式
- CI/CD集成和自动化测试

## 3.1 TDD核心理念

### 3.1.1 什么是测试驱动开发

测试驱动开发是一种软件开发方法,它要求开发者在编写功能代码之前先编写测试。这个过程遵循一个简单但强大的循环:

**RED → GREEN → REFACTOR**

```
┌─────────────────────────────────────┐
│                                     │
│   RED: 写一个失败的测试              │
│    ↓                                │
│   GREEN: 写最少的代码让测试通过      │
│    ↓                                │
│   REFACTOR: 重构代码,保持测试通过    │
│    ↓                                │
│   REPEAT: 重复下一个功能              │
│                                     │
└─────────────────────────────────────┘
```

这个循环看似简单,但其背后蕴含着深刻的哲学:

1. **测试作为设计工具** - 测试不仅仅是为了验证代码,更是帮助设计API和模块接口的工具
2. **快速反馈循环** - 通过频繁运行测试,快速获得代码正确性的反馈
3. **文档化意图** - 测试本身就是代码意图的活文档
4. **重构信心** - 有测试作为安全网,可以放心地重构代码

### 3.1.2 为什么选择TDD

传统开发流程中,测试往往被视为开发完成后的"附加工作",导致:

- 测试覆盖率不足
- 测试质量参差不齐
- 难以重构代码(没有安全网)
- Bug在后期才发现,修复成本高昂

TDD通过改变开发顺序,从根本上解决了这些问题:

**优势1: 提高代码设计质量**

在编写测试时,你被迫从"使用者"的角度思考API设计。这自然引导你设计出:
- 接口清晰的函数
- 依赖关系松散的模块
- 易于测试(也即易于使用)的代码

**优势2: 提供即时反馈**

不再需要等到QA阶段才发现问题。TDD让你在几秒钟内就能验证代码是否按预期工作。

**优势3: 创建活的文档**

测试代码永远是最新的文档。阅读测试用例比阅读注释更能理解代码的预期行为。

**优势4: 支持无惧重构**

有了全面的测试覆盖,重构不再是"可能破坏某些东西"的冒险行为。测试会在重构出错时立即告诉你。

**优势5: 降低Bug率**

统计数据显示,TDD可以将生产环境的Bug率降低40%-90%。虽然前期投入时间增加,但后期维护成本大幅降低。

### 3.1.3 TDD的三大法则

Kent Beck,TDD的创始人,提出了著名的TDD三大法则:

1. **只有在测试失败时才编写生产代码**
   - 不要为了"以后可能会用到"而编写代码
   - 让测试引导你需要实现的功能

2. **只编写足以导致失败的最小测试**
   - 不要一次性写完所有测试用例
   - 每次只测试一个行为或场景

3. **只编写足以让测试通过的最小代码**
   - 不要过度设计或预先优化
   - 先让它工作,再让它优雅(重构阶段)

### 3.1.4 Claude Code中的TDD支持

Claude Code提供了完整的TDD工具链:

**核心组件**:
- `/tdd` 命令 - 启动TDD工作流
- `tdd-guide` 代理 - TDD专家助手
- `🟢 tdd-workflow` 技能 - TDD最佳实践和模式

**使用方式**:

```bash
# 方式1: 直接调用命令
/tdd 我需要一个计算市场流动性分数的函数

# 方式2: 描述需求
/tdd 创建一个用户认证系统,支持邮箱密码登录和OAuth

# 方式3: 修复Bug
/tdd 修复用户余额查询返回负数的问题
```

**Claude Code的TDD流程**:

```
1. SCAFFOLD (脚手架)
   └─ 定义接口和类型

2. RED (红灯)
   └─ 编写失败的测试

3. GREEN (绿灯)
   └─ 实现最小代码使测试通过

4. REFACTOR (重构)
   └─ 优化代码,保持测试通过

5. COVERAGE (覆盖率)
   └─ 验证80%+覆盖率
```

## 3.2 TDD工作流程详解

### 3.2.1 第一步: 定义接口(SCAFFOLD)

在开始编写测试之前,首先要定义清晰的接口。这包括:

1. **类型定义** - 输入参数和返回值的类型
2. **函数签名** - 函数名称和参数列表
3. **预期行为** - 函数应该做什么

**示例: 市场流动性计算器**

```typescript
// lib/liquidity.ts

/**
 * 市场数据接口
 */
export interface MarketData {
  totalVolume: number      // 总交易量
  bidAskSpread: number    // 买卖价差
  activeTraders: number   // 活跃交易者数量
  lastTradeTime: Date     // 最后交易时间
}

/**
 * 计算市场流动性分数
 * @param market 市场数据
 * @returns 流动性分数 (0-100)
 */
export function calculateLiquidityScore(market: MarketData): number {
  // TODO: 实现
  throw new Error('Not implemented')
}
```

这个脚手架阶段虽然代码还不能工作,但已经明确了:

- 输入: `MarketData` 对象
- 输出: 0-100之间的数字
- 行为: 基于多个因素计算流动性分数

### 3.2.2 第二步: 编写失败的测试(RED)

现在编写测试,描述预期行为。关键是**测试应该失败**,因为功能还未实现。

```typescript
// lib/liquidity.test.ts
import { calculateLiquidityScore, MarketData } from './liquidity'

describe('calculateLiquidityScore', () => {
  describe('正常场景', () => {
    it('应该为高流动性市场返回高分', () => {
      const liquidMarket: MarketData = {
        totalVolume: 1000000,
        bidAskSpread: 0.01,
        activeTraders: 500,
        lastTradeTime: new Date()
      }

      const score = calculateLiquidityScore(liquidMarket)

      expect(score).toBeGreaterThan(80)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('应该为低流动性市场返回低分', () => {
      const illiquidMarket: MarketData = {
        totalVolume: 100,
        bidAskSpread: 0.5,
        activeTraders: 2,
        lastTradeTime: new Date(Date.now() - 86400000) // 1天前
      }

      const score = calculateLiquidityScore(illiquidMarket)

      expect(score).toBeLessThan(30)
      expect(score).toBeGreaterThanOrEqual(0)
    })
  })

  describe('边界情况', () => {
    it('应该处理零交易量', () => {
      const noVolume: MarketData = {
        totalVolume: 0,
        bidAskSpread: 0,
        activeTraders: 0,
        lastTradeTime: new Date()
      }

      const score = calculateLiquidityScore(noVolume)

      expect(score).toBe(0)
    })

    it('应该处理极端大值', () => {
      const hugeMarket: MarketData = {
        totalVolume: Number.MAX_SAFE_INTEGER,
        bidAskSpread: 0,
        activeTraders: 1000000,
        lastTradeTime: new Date()
      }

      const score = calculateLiquidityScore(hugeMarket)

      expect(score).toBe(100)
    })
  })

  describe('错误处理', () => {
    it('应该处理负数交易量', () => {
      const invalidMarket: MarketData = {
        totalVolume: -100,
        bidAskSpread: 0.1,
        activeTraders: 10,
        lastTradeTime: new Date()
      }

      const score = calculateLiquidityScore(invalidMarket)

      expect(score).toBe(0)
    })
  })
})
```

**运行测试,验证其失败**:

```bash
npm test lib/liquidity.test.ts

FAIL lib/liquidity.test.ts
  ✕ 应该为高流动性市场返回高分
    Error: Not implemented

1 test failed, 0 passed
```

测试失败了!这正是我们想要的。这个失败验证了:
1. 测试确实在运行
2. 测试能够检测到功能缺失
3. 测试失败的原因是正确的(功能未实现)

### 3.2.3 第三步: 实现最小代码(GREEN)

现在编写**最少**的代码让测试通过。重点是"最少" - 不要过度设计,不要预先优化。

```typescript
// lib/liquidity.ts

export function calculateLiquidityScore(market: MarketData): number {
  // 处理边界情况
  if (market.totalVolume === 0 || market.totalVolume < 0) {
    return 0
  }

  // 计算各维度的分数(0-100)
  const volumeScore = Math.min(market.totalVolume / 1000, 100)
  const spreadScore = Math.max(100 - (market.bidAskSpread * 1000), 0)
  const traderScore = Math.min(market.activeTraders / 10, 100)

  // 最近活跃度加成
  const hoursSinceLastTrade =
    (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = Math.max(100 - (hoursSinceLastTrade * 10), 0)

  // 加权平均
  const score = (
    volumeScore * 0.4 +
    spreadScore * 0.3 +
    traderScore * 0.2 +
    recencyScore * 0.1
  )

  return Math.min(Math.max(score, 0), 100) // 限制在0-100范围内
}
```

**运行测试,验证其通过**:

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ 应该为高流动性市场返回高分 (3ms)
  ✓ 应该为低流动性市场返回低分 (2ms)
  ✓ 应该处理零交易量 (1ms)
  ✓ 应该处理极端大值 (1ms)
  ✓ 应该处理负数交易量 (1ms)

5 tests passed
```

所有测试通过!这是TDD的"绿灯"阶段。现在我们有:
- 工作的代码
- 测试覆盖的功能
- 可部署的软件

### 3.2.4 第四步: 重构(REFACTOR)

现在测试通过了,可以安全地重构代码了。重构的目标:
- 消除重复
- 提高可读性
- 优化性能
- 改进设计

**重构后的代码**:

```typescript
// lib/liquidity.ts

// 配置常量 - 易于调整和维护
const WEIGHTS = {
  VOLUME: 0.4,
  SPREAD: 0.3,
  TRADERS: 0.2,
  RECENCY: 0.1,
} as const

const SCALE_FACTORS = {
  VOLUME: 1000,           // 交易量缩放因子
  SPREAD: 1000,           // 价差缩放因子
  TRADERS: 10,            // 交易者缩放因子
  RECENCY_PENALTY: 10,   // 时间衰减惩罚
} as const

/**
 * 将值限制在指定范围内
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 计算交易量分数 (0-100)
 */
function calculateVolumeScore(volume: number): number {
  return Math.min(volume / SCALE_FACTORS.VOLUME, 100)
}

/**
 * 计算价差分数 (0-100)
 * 价差越小,分数越高
 */
function calculateSpreadScore(spread: number): number {
  return clamp(100 - (spread * SCALE_FACTORS.SPREAD), 0, 100)
}

/**
 * 计算活跃度分数 (0-100)
 */
function calculateTraderScore(traders: number): number {
  return Math.min(traders / SCALE_FACTORS.TRADERS, 100)
}

/**
 * 计算时效性分数 (0-100)
 * 最近交易越近,分数越高
 */
function calculateRecencyScore(lastTradeTime: Date): number {
  const hoursSinceLastTrade =
    (Date.now() - lastTradeTime.getTime()) / (1000 * 60 * 60)
  return clamp(100 - (hoursSinceLastTrade * SCALE_FACTORS.RECENCY_PENALTY), 0, 100)
}

/**
 * 计算市场流动性分数
 *
 * @description 基于交易量、买卖价差、活跃交易者和最近交易时间
 *              计算综合流动性分数。分数范围为0-100,越高表示流动性越好。
 *
 * @param market 市场数据对象
 * @returns 流动性分数 (0-100)
 *
 * @example
 * ```typescript
 * const score = calculateLiquidityScore({
 *   totalVolume: 50000,
 *   bidAskSpread: 0.02,
 *   activeTraders: 100,
 *   lastTradeTime: new Date()
 * })
 * // 返回: ~75
 * ```
 */
export function calculateLiquidityScore(market: MarketData): number {
  // 边界情况: 无效数据
  if (market.totalVolume <= 0) {
    return 0
  }

  // 计算各维度分数
  const volumeScore = calculateVolumeScore(market.totalVolume)
  const spreadScore = calculateSpreadScore(market.bidAskSpread)
  const traderScore = calculateTraderScore(market.activeTraders)
  const recencyScore = calculateRecencyScore(market.lastTradeTime)

  // 加权平均
  const weightedScore =
    volumeScore * WEIGHTS.VOLUME +
    spreadScore * WEIGHTS.SPREAD +
    traderScore * WEIGHTS.TRADERS +
    recencyScore * WEIGHTS.RECENCY

  // 确保分数在有效范围内
  return clamp(weightedScore, 0, 100)
}
```

**重构的关键改进**:

1. **提取常量** - 权重和缩放因子现在集中管理,易于调整
2. **提取辅助函数** - 每个维度有独立的计算函数,职责清晰
3. **添加文档** - JSDoc注释说明函数用途和示例
4. **改进命名** - 使用更具描述性的名称
5. **简化主函数** - `calculateLiquidityScore`现在更简洁易读

**验证重构后测试仍然通过**:

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ 应该为高流动性市场返回高分 (3ms)
  ✓ 应该为低流动性市场返回低分 (2ms)
  ✓ 应该处理零交易量 (1ms)
  ✓ 应该处理极端大值 (1ms)
  ✓ 应该处理负数交易量 (1ms)

5 tests passed
```

测试全部通过!重构成功,没有破坏现有功能。

### 3.2.5 第五步: 检查覆盖率

TDD要求至少80%的代码覆盖率。检查当前覆盖率:

```bash
npm test -- --coverage lib/liquidity.test.ts

-----------------------------|---------|----------|---------|---------|
File                         | % Stmts | % Branch | % Funcs | % Lines |
-----------------------------|---------|----------|---------|---------|
liquidity.ts                 |     100 |      100 |     100 |     100 |
-----------------------------|---------|----------|---------|---------|
All files                    |     100 |      100 |     100 |     100 |
-----------------------------|---------|----------|---------|---------|
```

完美!100%覆盖率。但这还不够,我们需要确保测试真的覆盖了所有重要场景。

### 3.2.6 补充更多测试用例

当前测试覆盖了基本场景,但还缺少一些边界情况:

```typescript
// lib/liquidity.test.ts (续)

describe('calculateLiquidityScore', () => {
  // ... 之前的测试 ...

  describe('特殊场景', () => {
    it('应该处理极大价差', () => {
      const market: MarketData = {
        totalVolume: 10000,
        bidAskSpread: 100, // 100%价差!
        activeTraders: 50,
        lastTradeTime: new Date()
      }

      const score = calculateLiquidityScore(market)

      // 价差太大,应该显著降低分数
      expect(score).toBeLessThan(50)
    })

    it('应该处理很久以前的交易', () => {
      const market: MarketData = {
        totalVolume: 10000,
        bidAskSpread: 0.01,
        activeTraders: 50,
        lastTradeTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30天前
      }

      const score = calculateLiquidityScore(market)

      // 交易太旧,应该降低分数
      expect(score).toBeLessThan(70)
    })

    it('应该在所有因素都很好时返回满分', () => {
      const perfectMarket: MarketData = {
        totalVolume: 10000000,
        bidAskSpread: 0.001,
        activeTraders: 10000,
        lastTradeTime: new Date()
      }

      const score = calculateLiquidityScore(perfectMarket)

      expect(score).toBe(100)
    })
  })

  describe('权重平衡', () => {
    it('交易量应该是最重要的因素(40%权重)', () => {
      const highVolume: MarketData = {
        totalVolume: 1000000,
        bidAskSpread: 0.5,  // 高价差,应该降低分数
        activeTraders: 2,   // 少量交易者
        lastTradeTime: new Date(Date.now() - 86400000) // 1天前
      }

      const score = calculateLiquidityScore(highVolume)

      // 虽然其他因素不好,但高交易量应该让分数不会太低
      expect(score).toBeGreaterThan(40)
    })
  })
})
```

运行更新后的测试:

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ 应该为高流动性市场返回高分
  ✓ 应该为低流动性市场返回低分
  ✓ 应该处理零交易量
  ✓ 应该处理极端大值
  ✓ 应该处理负数交易量
  ✓ 应该处理极大价差
  ✓ 应该处理很久以前的交易
  ✓ 应该在所有因素都很好时返回满分
  ✓ 交易量应该是最重要的因素(40%权重)

9 tests passed
```

所有测试通过!现在我们有了一个健壮的、经过充分测试的功能。

## 3.3 测试类型与策略

### 3.3.1 测试金字塔

测试策略遵循"测试金字塔"模型:

```
         /\
        /  \    E2E Tests (端到端测试)
       /----\   - 量少,执行慢,成本高
      /      \  - 测试完整用户流程
     /--------\ - 例子: 用户登录→浏览→下单→支付
    /          \
   /------------\ Integration Tests (集成测试)
  /              \ - 量中等,执行较快
 /                \ - 测试组件间交互
/------------------\ - 例子: API端点、数据库操作
--------------------\ Unit Tests (单元测试)
--------------------  - 量大,执行快,成本低
                      - 测试单个函数/模块
                      - 例子: 纯函数、工具函数
```

**各层比例建议**:
- 单元测试: 70%
- 集成测试: 20%
- E2E测试: 10%

### 3.3.2 单元测试

单元测试关注**单个函数或模块**的行为,不涉及外部依赖。

**特点**:
- 执行快速 (< 50ms)
- 无副作用
- 易于调试
- 易于维护

**示例: 纯函数测试**

```typescript
// utils/format.test.ts
import { formatCurrency, formatDate } from './format'

describe('formatCurrency', () => {
  it('应该格式化美元货币', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56')
  })

  it('应该格式化欧元货币', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56')
  })

  it('应该处理零值', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00')
  })

  it('应该处理负值', () => {
    expect(formatCurrency(-50, 'USD')).toBe('-$50.00')
  })

  it('应该处理大数字', () => {
    expect(formatCurrency(1000000, 'USD')).toBe('$1,000,000.00')
  })
})

describe('formatDate', () => {
  it('应该格式化日期为本地字符串', () => {
    const date = new Date('2025-01-15')
    expect(formatDate(date)).toBe('2025-01-15')
  })

  it('应该处理无效日期', () => {
    expect(() => formatDate(new Date('invalid'))).toThrow('Invalid date')
  })
})
```

**单元测试最佳实践**:

1. **一个测试一个断言** - 保持测试简单明确
2. **描述性命名** - 测试名称应清楚说明测试内容
3. **独立测试** - 测试之间不应有依赖
4. **边界条件** - 测试空值、最大值、最小值、无效输入
5. **错误路径** - 不仅测试成功情况,也要测试失败情况

### 3.3.3 集成测试

集成测试验证**多个组件协同工作**的正确性。这包括:

- API端点测试
- 数据库操作测试
- 服务间通信测试
- 第三方API集成测试

**示例: API端点测试**

```typescript
// app/api/markets/route.test.ts
import { NextRequest } from 'next/server'
import { GET, POST } from './route'
import { createMockSupabase } from '@/test-utils/mocks'

describe('GET /api/markets', () => {
  beforeEach(() => {
    // 重置模拟
    jest.clearAllMocks()
  })

  it('应该返回市场列表', async () => {
    const request = new NextRequest('http://localhost/api/markets')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
    expect(data.data.length).toBeGreaterThan(0)
  })

  it('应该支持分页参数', async () => {
    const request = new NextRequest(
      'http://localhost/api/markets?page=2&limit=10'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.pagination.page).toBe(2)
    expect(data.pagination.limit).toBe(10)
  })

  it('应该验证无效的分页参数', async () => {
    const request = new NextRequest(
      'http://localhost/api/markets?page=-1'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Invalid page')
  })

  it('应该处理数据库错误', async () => {
    // 模拟数据库错误
    const mockSupabase = createMockSupabase()
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockRejectedValue(new Error('Connection failed'))
    })

    const request = new NextRequest('http://localhost/api/markets')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain('Failed to fetch markets')
  })
})

describe('POST /api/markets', () => {
  it('应该创建新市场', async () => {
    const requestBody = {
      name: 'Test Market',
      description: 'A test prediction market',
      endDate: '2025-12-31',
    }

    const request = new NextRequest('http://localhost/api/markets', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data.name).toBe('Test Market')
  })

  it('应该验证必需字段', async () => {
    const requestBody = {
      name: '', // 空名称
    }

    const request = new NextRequest('http://localhost/api/markets', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })
})
```

**集成测试关键点**:

1. **模拟外部依赖** - 使用Mock隔离外部服务(数据库、API)
2. **测试真实场景** - 模拟实际请求和响应
3. **验证HTTP状态码** - 确保正确的HTTP状态码
4. **测试错误处理** - 验证错误情况的处理
5. **测试认证授权** - 确保安全检查正常工作

### 3.3.4 端到端测试(E2E)

E2E测试模拟**真实用户行为**,验证整个应用流程。使用Playwright进行E2E测试。

**示例: 用户交易流程测试**

```typescript
// e2e/trading.spec.ts
import { test, expect } from '@playwright/test'

test.describe('市场交易流程', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')

    // 等待登录完成
    await page.waitForURL('/')
  })

  test('用户应该能够浏览市场并下单', async ({ page }) => {
    // 1. 导航到市场页面
    await page.goto('/markets')
    await expect(page.locator('h1')).toContainText('Markets')

    // 2. 搜索市场
    await page.fill('[data-testid="search-input"]', 'election')
    await page.waitForResponse(
      resp => resp.url().includes('/api/markets/search') && resp.status() === 200
    )

    // 3. 点击第一个市场
    const firstMarket = page.locator('[data-testid="market-card"]').first()
    await firstMarket.click()

    // 4. 验证市场详情页
    await expect(page).toHaveURL(/\/markets\/[a-z0-9-]+/)
    await expect(page.locator('[data-testid="market-name"]')).toBeVisible()

    // 5. 选择YES位置
    await page.click('[data-testid="position-yes"]')

    // 6. 输入交易金额
    await page.fill('[data-testid="trade-amount"]', '10.00')

    // 7. 预览交易
    await page.click('[data-testid="preview-trade"]')
    await expect(page.locator('[data-testid="trade-preview"]')).toBeVisible()

    // 8. 确认交易
    await page.click('[data-testid="confirm-trade"]')

    // 9. 等待交易完成
    await page.waitForResponse(
      resp => resp.url().includes('/api/trade') && resp.status() === 200,
      { timeout: 30000 }
    )

    // 10. 验证成功消息
    await expect(page.locator('[data-testid="trade-success"]')).toBeVisible()

    // 截图作为证据
    await page.screenshot({ path: 'artifacts/trade-success.png' })
  })

  test('应该正确显示错误消息当余额不足', async ({ page }) => {
    await page.goto('/markets/test-market')

    // 输入超过余额的金额
    await page.click('[data-testid="position-yes"]')
    await page.fill('[data-testid="trade-amount"]', '999999')

    await page.click('[data-testid="preview-trade"]')

    // 验证错误消息
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Insufficient balance'
    )
  })
})
```

**E2E测试最佳实践**:

1. **测试关键用户流程** - 不要测试每个功能,专注于关键路径
2. **使用Page Object Model** - 提高测试可维护性
3. **使用data-testid** - 使用稳定的测试选择器
4. **等待正确条件** - 等待API响应或UI状态,不要使用固定等待时间
5. **截图和视频** - 失败时自动截图,便于调试
6. **跨浏览器测试** - 在Chrome、Firefox、Safari上运行

## 3.4 模拟外部依赖

### 3.4.1 为什么需要Mock

在测试中,我们不希望依赖真实的外部服务,因为:

1. **不确定性** - 外部服务可能不可用或返回不一致的结果
2. **速度慢** - 网络请求会显著降低测试速度
3. **成本高** - 某些API调用需要付费
4. **副作用** - 测试不应该修改真实数据

Mock让我们可以控制外部依赖的行为,使测试可预测、快速、安全。

### 3.4.2 Mock数据库(Supabase)

```typescript
// test-utils/mocks/supabase.ts
import { jest } from '@jest/globals'

export function createMockSupabase() {
  return {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: 1, name: 'Test Market' },
            error: null
          })
        })),
        order: jest.fn(() => ({
          limit: jest.fn().mockResolvedValue({
            data: [
              { id: 1, name: 'Market 1' },
              { id: 2, name: 'Market 2' }
            ],
            error: null
          })
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn().mockResolvedValue({
          data: { id: 1, name: 'New Market' },
          error: null
        })
      })),
      update: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({
          data: { id: 1, name: 'Updated Market' },
          error: null
        })
      })),
      delete: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      }))
    })),
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123' }, session: { access_token: 'token' } },
        error: null
      })
    },
    rpc: jest.fn().mockResolvedValue({
      data: { result: 'success' },
      error: null
    })
  }
}
```

**使用Mock**:

```typescript
// app/api/markets/route.test.ts
import { createMockSupabase } from '@/test-utils/mocks/supabase'
import { GET } from './route'

jest.mock('@/lib/supabase', () => ({
  supabase: createMockSupabase()
}))

describe('GET /api/markets', () => {
  it('应该返回市场列表', async () => {
    const request = new NextRequest('http://localhost/api/markets')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toHaveLength(2)
  })
})
```

### 3.4.3 Mock Redis

```typescript
// test-utils/mocks/redis.ts
import { jest } from '@jest/globals'

export function createMockRedis() {
  return {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    zadd: jest.fn().mockResolvedValue(1),
    zrange: jest.fn().mockResolvedValue([]),
    searchMarketsByVector: jest.fn().mockResolvedValue([
      { slug: 'test-market', similarity_score: 0.95 },
      { slug: 'another-market', similarity_score: 0.85 }
    ]),
    checkRedisHealth: jest.fn().mockResolvedValue({ connected: true })
  }
}
```

**使用Mock**:

```typescript
// lib/search.test.ts
import { searchMarkets } from './search'
import { createMockRedis } from '@/test-utils/mocks/redis'

jest.mock('@/lib/redis', () => createMockRedis())

describe('searchMarkets', () => {
  it('应该使用向量搜索返回相关市场', async () => {
    const results = await searchMarkets('election')

    expect(results).toHaveLength(2)
    expect(results[0].slug).toBe('test-market')
  })
})
```

### 3.4.4 Mock OpenAI API

```typescript
// test-utils/mocks/openai.ts
import { jest } from '@jest/globals'

export function createMockOpenAI() {
  return {
    embeddings: {
      create: jest.fn().mockResolvedValue({
        data: [{
          embedding: new Array(1536).fill(0.1), // Mock 1536维向量
          index: 0
        }]
      })
    },
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'This is a mock response'
            }
          }]
        })
      }
    }
  }
}
```

### 3.4.5 Mock fetch请求

```typescript
// test-utils/mocks/fetch.ts
import { jest } from '@jest/globals'

export function mockFetchResponse(data: any, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data)
  })
}

// 使用
mockFetchResponse({ markets: [{ id: 1, name: 'Market 1' }] })
```

## 3.5 测试覆盖率管理

### 3.5.1 覆盖率指标

测试覆盖率衡量代码被测试覆盖的程度,包括四个维度:

1. **语句覆盖率(Statement Coverage)** - 每条语句是否被执行
2. **分支覆盖率(Branch Coverage)** - 每个分支(if/else)是否被执行
3. **函数覆盖率(Function Coverage)** - 每个函数是否被调用
4. **行覆盖率(Line Coverage)** - 每行代码是否被执行

### 3.5.2 配置覆盖率阈值

在`jest.config.js`或`vitest.config.ts`中设置:

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

### 3.5.3 运行覆盖率报告

```bash
# 运行覆盖率
npm test -- --coverage

# 生成HTML报告
npm test -- --coverage --coverageReporters=html

# 查看报告
open coverage/lcov-report/index.html
```

### 3.5.4 100%覆盖率的关键代码

某些代码必须达到100%覆盖率:

```typescript
// financial/calculations.ts

/**
 * 计算交易手续费
 * !!! 必须达到100%覆盖率 - 涉及真实资金 !!!
 */
export function calculateFee(amount: number, feeRate: number): number {
  // 边界检查
  if (amount < 0) {
    throw new Error('Amount cannot be negative')
  }

  if (feeRate < 0 || feeRate > 1) {
    throw new Error('Fee rate must be between 0 and 1')
  }

  // 计算手续费
  const fee = amount * feeRate

  // 四舍五入到2位小数
  return Math.round(fee * 100) / 100
}

// financial/calculations.test.ts
describe('calculateFee', () => {
  it('应该正确计算手续费', () => {
    expect(calculateFee(100, 0.02)).toBe(2.00)
  })

  it('应该处理零费率', () => {
    expect(calculateFee(100, 0)).toBe(0)
  })

  it('应该拒绝负金额', () => {
    expect(() => calculateFee(-100, 0.02)).toThrow('cannot be negative')
  })

  it('应该拒绝无效费率', () => {
    expect(() => calculateFee(100, 1.5)).toThrow('must be between 0 and 1')
  })

  it('应该正确四舍五入', () => {
    expect(calculateFee(99.99, 0.029)).toBe(2.90) // 2.89971 → 2.90
  })
})
```

## 3.6 常见测试反模式

### 3.6.1 测试实现细节

**错误示例**:

```typescript
// ❌ 错误: 测试内部状态
it('应该更新状态', () => {
  const component = render(<Counter />)
  component.setState({ count: 5 })
  expect(component.state.count).toBe(5)
})
```

**正确做法**:

```typescript
// ✅ 正确: 测试用户可见的行为
it('应该显示正确的计数', () => {
  render(<Counter initialCount={5} />)
  expect(screen.getByText('Count: 5')).toBeInTheDocument()
})
```

### 3.6.2 测试相互依赖

**错误示例**:

```typescript
// ❌ 错误: 测试共享状态
let user: User

test('创建用户', () => {
  user = createUser('Alice')
  expect(user.name).toBe('Alice')
})

test('更新用户', () => {
  // 依赖前一个测试创建的user
  updateUser(user, 'Bob')
  expect(user.name).toBe('Bob')
})
```

**正确做法**:

```typescript
// ✅ 正确: 每个测试独立
test('创建用户', () => {
  const user = createUser('Alice')
  expect(user.name).toBe('Alice')
})

test('更新用户', () => {
  const user = createUser('Alice') // 独立创建
  const updated = updateUser(user, 'Bob')
  expect(updated.name).toBe('Bob')
})
```

### 3.6.3 过度使用快照测试

**错误示例**:

```typescript
// ❌ 错误: 大型快照测试,难以维护
it('应该渲染组件', () => {
  const { container } = render(<ComplexComponent />)
  expect(container).toMatchSnapshot() // 1000行快照
})
```

**问题**:
- 快照太大,难以审查
- 任何微小变化都会导致快照失败
- 不清楚测试实际验证了什么

**正确做法**:

```typescript
// ✅ 正确: 明确的断言
it('应该显示用户名和邮箱', () => {
  render(<UserCard user={{ name: 'Alice', email: 'alice@example.com' }} />)

  expect(screen.getByText('Alice')).toBeInTheDocument()
  expect(screen.getByText('alice@example.com')).toBeInTheDocument()
})
```

### 3.6.4 不充分的断言

**错误示例**:

```typescript
// ❌ 错误: 断言太弱
it('应该返回数组', async () => {
  const result = await fetchMarkets()
  expect(Array.isArray(result)).toBe(true) // 只检查是数组
})
```

**正确做法**:

```typescript
// ✅ 正确: 充分的断言
it('应该返回市场列表', async () => {
  const result = await fetchMarkets()

  expect(Array.isArray(result)).toBe(true)
  expect(result.length).toBeGreaterThan(0)
  expect(result[0]).toHaveProperty('id')
  expect(result[0]).toHaveProperty('name')
  expect(result[0].id).toMatch(/^[a-z0-9-]+$/)
})
```

## 3.7 TDD实战案例: 用户认证系统

让我们通过一个完整的案例演示TDD流程:实现一个用户认证系统。

### 3.7.1 需求分析

用户认证系统需要支持:
1. 邮箱密码注册
2. 邮箱密码登录
3. 密码加密存储(bcrypt)
4. JWT令牌生成和验证
5. 登录状态持久化

### 3.7.2 第一个功能: 密码哈希

**RED: 编写测试**

```typescript
// auth/password.test.ts
import { hashPassword, verifyPassword } from './password'

describe('密码处理', () => {
  describe('hashPassword', () => {
    it('应该生成bcrypt哈希', async () => {
      const password = 'myPassword123'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.startsWith('$2b$')).toBe(true) // bcrypt前缀
    })

    it('应该为相同密码生成不同的哈希(使用salt)', async () => {
      const password = 'myPassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('应该正确验证密码', async () => {
      const password = 'myPassword123'
      const hash = await hashPassword(password)

      const isValid = await verifyPassword(password, hash)

      expect(isValid).toBe(true)
    })

    it('应该拒绝错误密码', async () => {
      const password = 'myPassword123'
      const hash = await hashPassword(password)

      const isValid = await verifyPassword('wrongPassword', hash)

      expect(isValid).toBe(false)
    })
  })
})
```

**GREEN: 实现功能**

```typescript
// auth/password.ts
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * 使用bcrypt哈希密码
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * 验证密码是否匹配哈希
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

**运行测试**

```bash
npm test auth/password.test.ts

PASS auth/password.test.ts
  ✓ 应该生成bcrypt哈希 (245ms)
  ✓ 应该为相同密码生成不同的哈希 (481ms)
  ✓ 应该正确验证密码 (312ms)
  ✓ 应该拒绝错误密码 (98ms)

4 tests passed
```

### 3.7.3 第二个功能: JWT令牌

**RED: 编写测试**

```typescript
// auth/jwt.test.ts
import { generateToken, verifyToken } from './jwt'

describe('JWT处理', () => {
  const testUser = {
    id: 'user-123',
    email: 'test@example.com'
  }

  describe('generateToken', () => {
    it('应该生成有效的JWT', () => {
      const token = generateToken(testUser)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3) // JWT有3部分
    })
  })

  describe('verifyToken', () => {
    it('应该验证有效令牌', () => {
      const token = generateToken(testUser)
      const payload = verifyToken(token)

      expect(payload.userId).toBe(testUser.id)
      expect(payload.email).toBe(testUser.email)
    })

    it('应该拒绝无效令牌', () => {
      const invalidToken = 'invalid.token.here'

      expect(() => verifyToken(invalidToken)).toThrow()
    })

    it('应该拒绝过期令牌', () => {
      // 生成一个已过期的令牌
      const expiredToken = generateToken(testUser, { expiresIn: '-1h' })

      expect(() => verifyToken(expiredToken)).toThrow('Token expired')
    })
  })
})
```

**GREEN: 实现功能**

```typescript
// auth/jwt.ts
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production'
const DEFAULT_EXPIRES_IN = '7d'

interface TokenPayload {
  userId: string
  email: string
}

interface TokenOptions {
  expiresIn?: string
}

/**
 * 生成JWT令牌
 */
export function generateToken(
  user: { id: string; email: string },
  options: TokenOptions = {}
): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: options.expiresIn || DEFAULT_EXPIRES_IN
  })
}

/**
 * 验证并解析JWT令牌
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload
    return payload
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired')
    }
    throw new Error('Invalid token')
  }
}
```

### 3.7.4 第三个功能: 用户注册API

**RED: 编写测试**

```typescript
// app/api/auth/register/route.test.ts
import { NextRequest } from 'next/server'
import { POST } from './route'
import { createMockSupabase } from '@/test-utils/mocks/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: createMockSupabase()
}))

describe('POST /api/auth/register', () => {
  it('应该成功注册新用户', async () => {
    const requestBody = {
      email: 'newuser@example.com',
      password: 'SecurePassword123!'
    }

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.user.email).toBe('newuser@example.com')
    expect(data.user.password).toBeUndefined() // 不应返回密码
  })

  it('应该拒绝无效邮箱', async () => {
    const requestBody = {
      email: 'invalid-email',
      password: 'SecurePassword123!'
    }

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Invalid email')
  })

  it('应该拒绝弱密码', async () => {
    const requestBody = {
      email: 'user@example.com',
      password: '123' // 太短
    }

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Password must be')
  })

  it('应该拒绝已存在的邮箱', async () => {
    // Mock数据库返回已存在错误
    const mockSupabase = createMockSupabase()
    mockSupabase.from.mockReturnValueOnce({
      insert: jest.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key' } // 唯一约束冲突
      })
    })

    const requestBody = {
      email: 'existing@example.com',
      password: 'SecurePassword123!'
    }

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toContain('already exists')
  })
})
```

**GREEN: 实现功能**

```typescript
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/auth/password'
import { generateToken } from '@/auth/jwt'

interface RegisterRequest {
  email: string
  password: string
}

/**
 * POST /api/auth/register
 * 注册新用户
 */
export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()

    // 验证输入
    const validationError = validateInput(body)
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      )
    }

    // 哈希密码
    const hashedPassword = await hashPassword(body.password)

    // 创建用户
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: body.email,
        password_hash: hashedPassword
      })
      .select('id, email, created_at')
      .single()

    if (error) {
      if (error.code === '23505') { // 唯一约束冲突
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        )
      }
      throw error
    }

    // 生成JWT
    const token = generateToken({ id: user.id, email: user.email })

    return NextResponse.json({
      success: true,
      user,
      token
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function validateInput(body: RegisterRequest): string | null {
  if (!body.email || !body.password) {
    return 'Email and password are required'
  }

  if (!isValidEmail(body.email)) {
    return 'Invalid email format'
  }

  if (body.password.length < 8) {
    return 'Password must be at least 8 characters'
  }

  if (!/[A-Z]/.test(body.password)) {
    return 'Password must contain at least one uppercase letter'
  }

  if (!/[0-9]/.test(body.password)) {
    return 'Password must contain at least one number'
  }

  return null
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

**运行测试**

```bash
npm test app/api/auth/register/route.test.ts

PASS app/api/auth/register/route.test.ts
  ✓ 应该成功注册新用户
  ✓ 应该拒绝无效邮箱
  ✓ 应该拒绝弱密码
  ✓ 应该拒绝已存在的邮箱

4 tests passed
```

### 3.7.5 第四个功能: 用户登录API

**RED: 编写测试**

```typescript
// app/api/auth/login/route.test.ts
import { NextRequest } from 'next/server'
import { POST } from './route'

describe('POST /api/auth/login', () => {
  it('应该成功登录', async () => {
    const requestBody = {
      email: 'user@example.com',
      password: 'correctPassword'
    }

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.token).toBeDefined()
  })

  it('应该拒绝错误密码', async () => {
    const requestBody = {
      email: 'user@example.com',
      password: 'wrongPassword'
    }

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toContain('Invalid credentials')
  })

  it('应该拒绝不存在的用户', async () => {
    const requestBody = {
      email: 'nonexistent@example.com',
      password: 'somePassword'
    }

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toContain('Invalid credentials')
  })
})
```

**GREEN: 实现功能**(留作练习)

## 3.8 CI/CD集成

### 3.8.1 GitHub Actions配置

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          fail_ci_if_error: true

      - name: Build project
        run: npm run build

      - name: Run E2E tests
        run: npx playwright test
        env:
          BASE_URL: http://localhost:3000

      - name: Upload test artifacts
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### 3.8.2 Pre-commit Hook

使用Husky设置pre-commit钩子:

```bash
# 安装husky
npm install --save-dev husky lint-staged

# 初始化husky
npx husky install

# 添加pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

配置`package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "npm test -- --findRelatedTests --passWithNoTests"
    ]
  }
}
```

## 3.9 TDD最佳实践总结

### 3.9.1 核心原则

1. **先写测试,再写代码** - 永远不要偏离这个原则
2. **保持测试简单** - 一个测试只验证一个行为
3. **快速反馈** - 测试应该快速执行(< 50ms)
4. **独立性** - 测试之间不应有依赖
5. **可读性** - 测试名称应清楚表达测试意图
6. **覆盖率** - 至少80%,关键代码100%

### 3.9.2 测试命名约定

```typescript
// 好的命名
it('应该拒绝负数金额', () => { /* ... */ })
it('应该在用户不存在时返回404', () => { /* ... */ })
it('应该正确计算手续费', () => { /* ... */ })

// 不好的命名
it('test1', () => { /* ... */ })
it('works', () => { /* ... */ })
it('function test', () => { /* ... */ })
```

### 3.9.3 测试结构(AAA模式)

```typescript
it('应该正确计算折扣价格', () => {
  // Arrange (准备)
  const product = { price: 100, category: 'electronics' }
  const discountRate = 0.1

  // Act (执行)
  const discountedPrice = calculateDiscount(product, discountRate)

  // Assert (断言)
  expect(discountedPrice).toBe(90)
})
```

### 3.9.4 常见陷阱

1. **过度Mock** - 不要Mock所有东西,只Mock外部依赖
2. **测试脆弱性** - 避免依赖实现细节
3. **忽略失败测试** - 红灯测试必须立即修复
4. **跳过测试** - `test.skip`应该是临时的
5. **不充分的断言** - 确保测试真正验证了行为

## 3.10 本章小结

通过本章的学习,我们掌握了:

- TDD的核心概念和红-绿-重构循环
- 如何在Claude Code中使用`/tdd`命令和`tdd-guide`代理
- 单元测试、集成测试和E2E测试的区别和最佳实践
- 如何Mock外部依赖以隔离测试
- 如何达到80%以上的测试覆盖率
- 常见的测试反模式及其避免方法
- 如何将TDD集成到CI/CD流程中

**关键要点**:

1. TDD不仅仅是测试方法,更是一种设计工具
2. 测试应该是快速、独立、可重复的
3. 覆盖率是指标,不是目标 - 关键是测试质量
4. 测试先行让代码更易维护和重构
5. 自动化测试是持续交付的基石

## 下一章预告

在下一章"代码审查与质量控制"中,我们将学习:
- 如何使用Claude Code进行自动化代码审查
- 多层次审查体系的设计
- 语言特定的审查策略
- 安全审查和性能优化
- 如何将代码审查集成到开发流程中

代码审查是保证代码质量的最后一道防线,结合TDD,我们将构建一个完整的质量保证体系。
