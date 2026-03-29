# 第5章 自动化测试与部署

> "手动测试是重复劳动,自动化测试是资产积累。持续部署让发布成为日常,而非灾难。"

## 本章概述

在前两章中,我们学习了测试驱动开发(TDD)和代码审查。本章将把这些实践集成到完整的自动化流程中,实现持续集成和持续部署(CI/CD)。

自动化测试和部署是现代软件开发的基石。通过自动化,我们可以:

- 快速反馈代码变更的影响
- 保证代码质量的一致性
- 减少人为错误
- 加速发布周期
- 提高团队生产力

本章将深入探讨:

- 端到端(E2E)测试的生成和执行
- Agent Browser和Playwright的使用
- 测试覆盖率管理策略
- CI/CD流程设计和实践
- 自动化部署方案
- 监控和回滚机制
- 故障排查和性能优化

## 5.1 自动化测试体系

### 5.1.1 测试金字塔回顾

在前面的章节中,我们了解了测试金字塔:

```
        /\
       /E2E\      - 10% - 用户流程测试
      /------\
     /Integra\    - 20% - API和集成测试
    /----------\
   / Unit Tests \  - 70% - 单元测试
  /--------------\
```

本章重点聚焦于**E2E测试**和**CI/CD集成**。

### 5.1.2 E2E测试的价值

E2E(End-to-End)测试模拟真实用户行为,验证完整的应用流程。

**优势**:
- 捕获单元测试遗漏的集成问题
- 验证真实用户体验
- 发现环境相关问题
- 建立发布前的信心

**挑战**:
- 执行速度慢(相比单元测试)
- 维护成本高
- 可能出现Flaky测试(不稳定测试)

**策略**:
- 只测试关键用户流程
- 使用Page Object Model提高可维护性
- 并行执行加速测试
- 持续监控和修复Flaky测试

### 5.1.3 Claude Code的E2E工具

Claude Code提供了强大的E2E测试工具:

**核心工具**:
- `/e2e` 命令 - 生成并运行E2E测试
- `e2e-runner` 代理 - E2E测试专家助手
- **Agent Browser** - 首选的浏览器自动化工具
- **Playwright** - 备选的E2E测试框架

**使用场景**:

```bash
# 测试关键用户旅程
/e2e 测试用户登录和市场搜索流程

# 验证交易流程
/e2e 测试用户下订单和支付流程

# 跨浏览器测试
/e2e 在多个浏览器上测试市场详情页
```

## 5.2 Agent Browser: 智能浏览器自动化

### 5.2.1 为什么选择Agent Browser

Agent Browser是基于Playwright构建的智能浏览器自动化工具,相比原始Playwright具有显著优势:

**核心优势**:
1. **语义化选择器** - 使用`@ref`而非CSS选择器,更稳定
2. **AI优化** - 自动等待、智能重试、错误恢复
3. **自然语言交互** - 使用描述性命令而非代码
4. **自动元素识别** - 通过快照获取所有可交互元素

**对比传统Playwright**:

| 特性 | Playwright | Agent Browser |
|------|-----------|---------------|
| 选择器 | CSS/XPath | 语义化引用 |
| 等待策略 | 手动配置 | 自动智能等待 |
| 错误处理 | 需编写代码 | 内置智能重试 |
| 学习曲线 | 较陡峭 | 低门槛 |
| 维护成本 | 高 | 低 |

### 5.2.2 安装和配置

**安装Agent Browser**:

```bash
# 全局安装
npm install -g agent-browser

# 安装浏览器
agent-browser install

# 验证安装
agent-browser --version
```

**基本命令**:

```bash
# 打开网页
agent-browser open https://example.com

# 获取页面快照(列出所有可交互元素)
agent-browser snapshot -i

# 输出示例:
# [ref=e1] button "Submit"
# [ref=e2] textbox "Email"
# [ref=e3] link "Learn more"

# 点击元素
agent-browser click @e1

# 填写表单
agent-browser fill @e2 "test@example.com"

# 等待元素
agent-browser wait visible @e5

# 截图
agent-browser screenshot result.png
```

### 5.2.3 实战示例: 市场搜索流程

**场景**: 测试用户搜索市场的完整流程

```bash
# 步骤1: 打开应用
agent-browser open https://pmx.example.com

# 步骤2: 获取首页快照
agent-browser snapshot -i

# 输出:
# [ref=e1] link "Markets"
# [ref=e2] link "Portfolio"
# [ref=e3] button "Connect Wallet"

# 步骤3: 导航到市场页面
agent-browser click @e1

# 步骤4: 等待页面加载
agent-browser wait networkidle

# 步骤5: 获取搜索框
agent-browser snapshot -i

# 输出:
# [ref=e10] textbox "Search markets..."
# [ref=e11] button "Filter"

# 步骤6: 执行搜索
agent-browser fill @e10 "election"

# 步骤7: 等待结果
agent-browser wait networkidle

# 步骤8: 验证结果
agent-browser snapshot -i

# 步骤9: 截图
agent-browser screenshot search-results.png

# 步骤10: 点击第一个结果
agent-browser click @e20

# 步骤11: 验证详情页
agent-browser wait visible @market-name
agent-browser screenshot market-details.png
```

### 5.2.4 自动化脚本

创建可重用的Agent Browser脚本:

```bash
#!/bin/bash
# scripts/e2e-market-search.sh

# 市场搜索E2E测试
echo "Starting market search E2E test..."

# 打开应用
agent-browser open https://pmx.example.com

# 导航到市场
agent-browser click @markets-link
agent-browser wait networkidle

# 执行搜索
agent-browser fill @search-input "election"
agent-browser wait networkidle

# 验证结果数量
RESULT_COUNT=$(agent-browser query "@market-card" --count)

if [ "$RESULT_COUNT" -gt 0 ]; then
  echo "✅ Found $RESULT_COUNT markets"
  agent-browser screenshot "artifacts/search-success.png"
else
  echo "❌ No markets found"
  agent-browser screenshot "artifacts/search-failed.png"
  exit 1
fi

# 点击第一个市场
agent-browser click "@market-card:first"

# 验证详情页
if agent-browser wait visible "@market-name" --timeout 5000; then
  echo "✅ Market details page loaded"
  agent-browser screenshot "artifacts/market-details.png"
else
  echo "❌ Market details page failed to load"
  exit 1
fi

echo "✅ E2E test completed successfully"
```

**运行脚本**:

```bash
chmod +x scripts/e2e-market-search.sh
./scripts/e2e-market-search.sh
```

### 5.2.5 高级功能

**表单自动填充**:

```bash
# 智能表单填充(自动识别字段类型)
agent-browser fill-form '{
  "email": "test@example.com",
  "password": "securepassword123",
  "remember": true
}'
```

**等待策略**:

```bash
# 等待网络空闲
agent-browser wait networkidle

# 等待元素可见
agent-browser wait visible @element

# 等待元素可点击
agent-browser wait clickable @button

# 等待URL变化
agent-browser wait url "/markets/*"

# 等待API响应
agent-browser wait response "/api/markets"
```

**断言验证**:

```bash
# 验证元素存在
agent-browser assert exists "@market-card"

# 验证元素文本
agent-browser assert text "@title" "Welcome"

# 验证元素数量
agent-browser assert count "@market-card" --gt 5

# 验证URL
agent-browser assert url "/markets"

# 验证页面标题
agent-browser assert title "PMX Markets"
```

**错误处理**:

```bash
# 自动重试
agent-browser retry 3 click @button

# 失败时继续
agent-browser --continue-on-error click @optional-element

# 错误截图
agent-browser --error-screenshot click @button
```

## 5.3 Playwright E2E测试

### 5.3.1 安装和配置

虽然Agent Browser是首选工具,但了解Playwright作为备选方案也很重要。

**安装Playwright**:

```bash
# 初始化Playwright
npm init playwright@latest

# 或者手动安装
npm install -D @playwright/test
npx playwright install
```

**配置文件**:

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // 测试目录
  testDir: './tests/e2e',

  // 并行执行
  fullyParallel: true,

  // CI环境禁止.only
  forbidOnly: !!process.env.CI,

  // CI环境重试次数
  retries: process.env.CI ? 2 : 0,

  // CI环境限制workers
  workers: process.env.CI ? 1 : undefined,

  // 报告器
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'playwright-results.xml' }],
    ['json', { outputFile: 'playwright-results.json' }]
  ],

  // 全局配置
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // 失败时捕获trace
    trace: 'on-first-retry',

    // 失败时截图
    screenshot: 'only-on-failure',

    // 失败时录制视频
    video: 'retain-on-failure',

    // 操作超时
    actionTimeout: 10000,

    // 导航超时
    navigationTimeout: 30000,
  },

  // 浏览器配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // 开发服务器
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

### 5.3.2 Page Object Model(POM)

Page Object Model是一种设计模式,将页面元素和操作封装为对象。

**示例: 市场页面对象**:

```typescript
// tests/pages/MarketsPage.ts
import { Page, Locator, expect } from '@playwright/test'

export class MarketsPage {
  readonly page: Page
  readonly searchInput: Locator
  readonly marketCards: Locator
  readonly filterDropdown: Locator
  readonly noResultsMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.locator('[data-testid="search-input"]')
    this.marketCards = page.locator('[data-testid="market-card"]')
    this.filterDropdown = page.locator('[data-testid="filter-dropdown"]')
    this.noResultsMessage = page.locator('[data-testid="no-results"]')
  }

  /**
   * 导航到市场页面
   */
  async goto() {
    await this.page.goto('/markets')
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * 搜索市场
   */
  async search(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForResponse(
      resp => resp.url().includes('/api/markets/search') && resp.status() === 200
    )
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * 点击第一个市场
   */
  async clickFirstMarket() {
    await this.marketCards.first().click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * 获取市场数量
   */
  async getMarketCount(): Promise<number> {
    return await this.marketCards.count()
  }

  /**
   * 选择过滤器
   */
  async selectFilter(filter: string) {
    await this.filterDropdown.click()
    await this.page.click(`text=${filter}`)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * 验证有结果
   */
  async expectResults() {
    const count = await this.getMarketCount()
    expect(count).toBeGreaterThan(0)
  }

  /**
   * 验证无结果
   */
  async expectNoResults() {
    await expect(this.noResultsMessage).toBeVisible()
  }
}
```

**示例: 市场详情页对象**:

```typescript
// tests/pages/MarketDetailsPage.ts
import { Page, Locator, expect } from '@playwright/test'

export class MarketDetailsPage {
  readonly page: Page
  readonly marketName: Locator
  readonly marketDescription: Locator
  readonly priceChart: Locator
  readonly tradeForm: Locator
  readonly positionYes: Locator
  readonly positionNo: Locator
  readonly tradeAmount: Locator
  readonly previewButton: Locator
  readonly confirmButton: Locator

  constructor(page: Page) {
    this.page = page
    this.marketName = page.locator('[data-testid="market-name"]')
    this.marketDescription = page.locator('[data-testid="market-description"]')
    this.priceChart = page.locator('[data-testid="price-chart"]')
    this.tradeForm = page.locator('[data-testid="trade-form"]')
    this.positionYes = page.locator('[data-testid="position-yes"]')
    this.positionNo = page.locator('[data-testid="position-no"]')
    this.tradeAmount = page.locator('[data-testid="trade-amount"]')
    this.previewButton = page.locator('[data-testid="preview-trade"]')
    this.confirmButton = page.locator('[data-testid="confirm-trade"]')
  }

  /**
   * 等待页面加载
   */
  async waitForLoad() {
    await this.marketName.waitFor({ state: 'visible' })
    await this.priceChart.waitFor({ state: 'visible' })
  }

  /**
   * 选择YES位置
   */
  async selectYesPosition() {
    await this.positionYes.click()
  }

  /**
   * 选择NO位置
   */
  async selectNoPosition() {
    await this.positionNo.click()
  }

  /**
   * 输入交易金额
   */
  async enterAmount(amount: string) {
    await this.tradeAmount.fill(amount)
  }

  /**
   * 预览交易
   */
  async previewTrade() {
    await this.previewButton.click()
    await this.page.waitForResponse(
      resp => resp.url().includes('/api/trade/preview')
    )
  }

  /**
   * 确认交易
   */
  async confirmTrade() {
    await this.confirmButton.click()
    await this.page.waitForResponse(
      resp => resp.url().includes('/api/trade') && resp.status() === 200,
      { timeout: 30000 }
    )
  }

  /**
   * 完整交易流程
   */
  async executeTrade(position: 'yes' | 'no', amount: string) {
    if (position === 'yes') {
      await this.selectYesPosition()
    } else {
      await this.selectNoPosition()
    }

    await this.enterAmount(amount)
    await this.previewTrade()
    await this.confirmTrade()
  }
}
```

### 5.3.3 编写E2E测试

**示例: 市场搜索和浏览测试**:

```typescript
// tests/e2e/markets/search.spec.ts
import { test, expect } from '@playwright/test'
import { MarketsPage } from '../../pages/MarketsPage'

test.describe('市场搜索和浏览', () => {
  let marketsPage: MarketsPage

  test.beforeEach(async ({ page }) => {
    marketsPage = new MarketsPage(page)
    await marketsPage.goto()
  })

  test('应该显示市场列表', async ({ page }) => {
    await marketsPage.expectResults()

    // 验证市场卡片包含必要信息
    const firstCard = marketsPage.marketCards.first()
    await expect(firstCard.locator('[data-testid="market-name"]')).toBeVisible()
    await expect(firstCard.locator('[data-testid="market-price"]')).toBeVisible()
  })

  test('应该能够搜索市场', async ({ page }) => {
    await marketsPage.search('election')

    // 验证搜索结果
    await marketsPage.expectResults()

    // 验证结果包含搜索词
    const firstCard = marketsPage.marketCards.first()
    await expect(firstCard).toContainText(/election/i)

    // 截图
    await page.screenshot({ path: 'artifacts/search-results.png' })
  })

  test('应该处理无结果情况', async ({ page }) => {
    await marketsPage.search('xyznonexistentmarket123456789')

    await marketsPage.expectNoResults()
  })

  test('应该能够清除搜索', async ({ page }) => {
    // 初始市场数
    const initialCount = await marketsPage.getMarketCount()

    // 搜索过滤
    await marketsPage.search('trump')
    const filteredCount = await marketsPage.getMarketCount()
    expect(filteredCount).toBeLessThan(initialCount)

    // 清除搜索
    await marketsPage.searchInput.clear()
    await page.waitForLoadState('networkidle')

    // 验证恢复初始状态
    const finalCount = await marketsPage.getMarketCount()
    expect(finalCount).toBe(initialCount)
  })

  test('应该能够使用过滤器', async ({ page }) => {
    await marketsPage.selectFilter('Active')

    // 验证过滤结果
    const cards = marketsPage.marketCards
    const count = await cards.count()

    for (let i = 0; i < Math.min(count, 5); i++) {
      const card = cards.nth(i)
      await expect(card.locator('[data-testid="market-status"]')).toContainText('Active')
    }
  })
})
```

**示例: 交易流程测试**:

```typescript
// tests/e2e/trading/trade.spec.ts
import { test, expect } from '@playwright/test'
import { MarketsPage } from '../../pages/MarketsPage'
import { MarketDetailsPage } from '../../pages/MarketDetailsPage'

test.describe('市场交易流程', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'testpassword123')
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/')
  })

  test('应该能够成功下单', async ({ page }) => {
    // 1. 导航到市场
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // 2. 点击第一个市场
    await marketsPage.clickFirstMarket()

    // 3. 等待市场详情页加载
    const detailsPage = new MarketDetailsPage(page)
    await detailsPage.waitForLoad()

    // 4. 执行交易
    await detailsPage.executeTrade('yes', '10.00')

    // 5. 验证成功消息
    await expect(page.locator('[data-testid="trade-success"]')).toBeVisible({
      timeout: 30000
    })

    // 6. 截图
    await page.screenshot({ path: 'artifacts/trade-success.png' })
  })

  test('应该验证交易金额', async ({ page }) => {
    // 导航到市场详情
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()
    await marketsPage.clickFirstMarket()

    const detailsPage = new MarketDetailsPage(page)
    await detailsPage.waitForLoad()

    // 输入无效金额
    await detailsPage.enterAmount('-10')
    await detailsPage.previewButton.click()

    // 验证错误消息
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Amount must be positive'
    )
  })

  test('应该拒绝余额不足的交易', async ({ page }) => {
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()
    await marketsPage.clickFirstMarket()

    const detailsPage = new MarketDetailsPage(page)
    await detailsPage.waitForLoad()

    // 输入超大金额
    await detailsPage.enterAmount('999999999')
    await detailsPage.previewButton.click()

    // 验证余额不足错误
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Insufficient balance'
    )
  })
})

test.describe('未认证用户', () => {
  test('应该重定向到登录页面', async ({ page }) => {
    await page.goto('/markets/test-market')

    // 尝试交易
    await page.click('[data-testid="position-yes"]')
    await page.fill('[data-testid="trade-amount"]', '10')
    await page.click('[data-testid="preview-trade"]')

    // 验证重定向到登录
    await page.waitForURL('/login')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
  })
})
```

### 5.3.4 处理Flaky测试

Flaky测试是E2E测试的主要挑战。它们有时通过,有时失败,降低了测试的可信度。

**识别Flaky测试**:

```bash
# 重复运行测试识别不稳定测试
npx playwright test tests/search.spec.ts --repeat-each=10

# 结果示例:
# Test passed 7/10 runs (70% pass rate) - FLAKY
# Test passed 10/10 runs (100% pass rate) - STABLE
```

**常见原因和解决方案**:

**1. 竞态条件**

```typescript
// ❌ 错误: 假设元素立即可见
await page.click('[data-testid="button"]')

// ✅ 正确: 等待元素可交互
await page.locator('[data-testid="button"]').click()
```

**2. 网络延迟**

```typescript
// ❌ 错误: 固定等待时间
await page.waitForTimeout(5000)

// ✅ 正确: 等待特定条件
await page.waitForResponse(
  resp => resp.url().includes('/api/data') && resp.status() === 200
)
```

**3. 动画时间**

```typescript
// ❌ 错误: 在动画期间点击
await page.click('[data-testid="dropdown-item"]')

// ✅ 正确: 等待动画完成
await page.locator('[data-testid="dropdown"]').waitFor({ state: 'visible' })
await page.locator('[data-testid="dropdown-item"]').click()
```

**隔离和修复Flaky测试**:

```typescript
// 标记为flaky
test.fixme('flaky: 复杂搜索', async ({ page }) => {
  // 待修复的测试
})

// 或条件跳过
test.skip(process.env.CI, 'Flaky in CI - Issue #123')
```

### 5.3.5 测试数据管理

**使用Fixtures**:

```typescript
// tests/fixtures/auth.ts
import { test as base } from '@playwright/test'

type AuthFixtures = {
  authenticatedPage: Page
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // 登录
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'testpassword123')
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/')

    await use(page)
  },
})

// 使用
test('认证用户测试', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard')
  // 已登录状态
})
```

**测试数据工厂**:

```typescript
// tests/factories/market.ts
export function createMarket(overrides = {}) {
  return {
    id: `market-${Date.now()}`,
    name: 'Test Market',
    description: 'A test prediction market',
    status: 'ACTIVE',
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides
  }
}

// 使用
const market = createMarket({ name: 'Custom Name' })
```

## 5.4 测试覆盖率管理

### 5.4.1 覆盖率目标

**分层覆盖率目标**:

| 层级 | 单元测试 | 集成测试 | E2E测试 | 总覆盖率 |
|------|---------|---------|---------|---------|
| 核心业务逻辑 | 90%+ | 80%+ | 关键流程 | 95%+ |
| API端点 | 70%+ | 90%+ | 主要场景 | 85%+ |
| UI组件 | 80%+ | 60%+ | 用户流程 | 75%+ |
| 工具函数 | 95%+ | 40%+ | - | 90%+ |

### 5.4.2 覆盖率配置

**Jest配置**:

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/core/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
}
```

**覆盖率命令**:

```bash
# 运行覆盖率
npm test -- --coverage

# 只运行特定文件的覆盖率
npm test -- --coverage --collectCoverageFrom='src/payment/**/*.ts'

# 生成HTML报告
npm test -- --coverage --coverageReporters=html
open coverage/lcov-report/index.html
```

### 5.4.3 覆盖率报告集成

**Codecov集成**:

```yaml
# .github/workflows/coverage.yml
name: Coverage

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          fail_ci_if_error: true
          flags: unittests
          name: codecov-umbrella
```

**覆盖率徽章**:

```markdown
[![Coverage Status](https://codecov.io/gh/user/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/user/repo)
```

## 5.5 CI/CD流程设计

### 5.5.1 持续集成(CI)工作流

**完整的CI流程**:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  # 任务1: 代码质量检查
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  # 任务2: 单元和集成测试
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
        env:
          CI: true
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
      - name: Upload coverage artifact
        uses: actions/upload-artifact@v3
        with:
          name: coverage
          path: coverage/

  # 任务3: 安全审计
  security:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm audit --audit-level=high
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  # 任务4: 构建检查
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Upload build artifact
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: .next/

  # 任务5: E2E测试(在所有其他检查通过后)
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [lint, test, security, build]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - name: Run E2E tests
        run: npx playwright test
        env:
          BASE_URL: http://localhost:3000
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  # 任务6: 通知状态
  notify:
    name: Notify
    runs-on: ubuntu-latest
    needs: [lint, test, security, build, e2e]
    if: always()
    steps:
      - name: Determine status
        id: status
        run: |
          if [[ "${{ needs.e2e.result }}" == "success" ]]; then
            echo "status=success" >> $GITHUB_OUTPUT
          else
            echo "status=failure" >> $GITHUB_OUTPUT
          fi
      - name: Post status to Slack
        if: github.event_name == 'push'
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "CI Pipeline ${{ steps.status.outputs.status }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*CI Pipeline Status:* ${{ steps.status.outputs.status }}\n*Repository:* ${{ github.repository }}\n*Branch:* ${{ github.ref_name }}\n*Commit:* ${{ github.sha }}\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Run>"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK
```

### 5.5.2 持续部署(CD)工作流

**生产部署流程**:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # 部署到预发布环境
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:staging
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:sha-${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to staging
        run: |
          # 使用kubectl或vercel CLI部署
          echo "Deploying to staging..."
          # 示例: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}

      - name: Run smoke tests
        run: |
          npm run test:smoke
        env:
          BASE_URL: https://staging.example.com

  # 部署到生产环境(手动审批)
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: deploy-staging
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Pull and tag production image
        run: |
          docker pull ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:staging
          docker tag ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:staging ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:production
          docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:production

      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # 部署命令

      - name: Verify deployment
        run: |
          # 健康检查
          curl -f https://api.example.com/health || exit 1

      - name: Notify deployment
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "Production deployment successful",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "✅ *Production Deployment Successful*\n*Version:* ${{ github.sha }}\n*Deployed by:* ${{ github.actor }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 5.5.3 环境管理

**环境配置**:

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    strategy:
      matrix:
        environment: [staging, production]
        include:
          - environment: staging
            url: https://staging.example.com
            needs_approval: false
          - environment: production
            url: https://example.com
            needs_approval: true

    environment:
      name: ${{ matrix.environment }}
      url: ${{ matrix.url }}

    steps:
      - name: Check approval
        if: matrix.needs_approval
        run: echo "Production deployment requires approval"
```

**环境变量管理**:

```yaml
# GitHub Secrets配置
# Settings → Secrets and variables → Actions

# 环境变量
DATABASE_URL_STAGING=postgresql://...
DATABASE_URL_PRODUCTION=postgresql://...

# Secrets
API_KEY_STAGING=sk_staging_...
API_KEY_PRODUCTION=sk_prod_...

# 工作流中使用
jobs:
  deploy:
    steps:
      - name: Set environment variables
        run: |
          if [[ "${{ matrix.environment }}" == "production" ]]; then
            echo "DATABASE_URL=${{ secrets.DATABASE_URL_PRODUCTION }}" >> $GITHUB_ENV
            echo "API_KEY=${{ secrets.API_KEY_PRODUCTION }}" >> $GITHUB_ENV
          else
            echo "DATABASE_URL=${{ secrets.DATABASE_URL_STAGING }}" >> $GITHUB_ENV
            echo "API_KEY=${{ secrets.API_KEY_STAGING }}" >> $GITHUB_ENV
          fi
```

## 5.6 部署策略

### 5.6.1 部署类型

**1. 滚动部署(Rolling Deployment)**

逐步替换旧版本实例,零停机。

```
初始: [v1][v1][v1][v1]
步骤1: [v2][v1][v1][v1]  # 部署1个新实例
步骤2: [v2][v2][v1][v1]  # 部署第2个
步骤3: [v2][v2][v2][v1]  # 部署第3个
完成: [v2][v2][v2][v2]    # 全部替换
```

**Kubernetes示例**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # 最多超出1个实例
      maxUnavailable: 1  # 最多不可用1个实例
  template:
    spec:
      containers:
        - name: app
          image: myapp:v2
          ports:
            - containerPort: 3000
```

**2. 蓝绿部署(Blue-Green Deployment)**

维护两个完整环境,快速切换。

```
蓝环境(v1): [v1][v1][v1][v1] ← 当前生产
绿环境(v2): [v2][v2][v2][v2] ← 新版本

切换流量: 蓝 → 绿
```

**优势**:
- 零停机
- 快速回滚
- 完整测试新版本

**劣势**:
- 需要双倍资源
- 数据库迁移复杂

**3. 金丝雀部署(Canary Deployment)**

逐步增加新版本流量比例。

```
初始: 100%流量 → v1
步骤1: 10%流量 → v2, 90% → v1
步骤2: 30%流量 → v2, 70% → v1
步骤3: 50%流量 → v2, 50% → v1
完成: 100%流量 → v2
```

**Istio示例**:

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: myapp
spec:
  hosts:
    - myapp
  http:
    - route:
        - destination:
            host: myapp
            subset: v1
          weight: 90
        - destination:
            host: myapp
            subset: v2
          weight: 10
```

### 5.6.2 回滚策略

**自动回滚**:

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    steps:
      - name: Deploy
        id: deploy
        run: |
          # 部署命令

      - name: Health check
        id: health
        run: |
          for i in {1..30}; do
            if curl -f https://api.example.com/health; then
              echo "Health check passed"
              exit 0
            fi
            sleep 10
          done
          echo "Health check failed"
          exit 1

      - name: Rollback on failure
        if: failure() && steps.health.outcome == 'failure'
        run: |
          echo "Rolling back to previous version"
          # 回滚命令
          kubectl rollout undo deployment/myapp
```

**手动回滚**:

```yaml
jobs:
  rollback:
    name: Rollback
    runs-on: ubuntu-latest
    if: github.event_name == 'workflow_dispatch'
    steps:
      - name: Rollback to previous version
        run: |
          kubectl rollout undo deployment/myapp
          kubectl rollout status deployment/myapp
```

## 5.7 监控和告警

### 5.7.1 应用监控

**健康检查端点**:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { redis } from '@/lib/redis'

export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    memory: checkMemory(),
    timestamp: new Date().toISOString()
  }

  const allHealthy = Object.values(checks).every(check =>
    check === true || (typeof check === 'object' && check.healthy)
  )

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks
    },
    { status: allHealthy ? 200 : 503 }
  )
}

async function checkDatabase() {
  try {
    await db.query('SELECT 1')
    return true
  } catch (error) {
    return { healthy: false, error: error.message }
  }
}

async function checkRedis() {
  try {
    await redis.ping()
    return true
  } catch (error) {
    return { healthy: false, error: error.message }
  }
}

function checkMemory() {
  const used = process.memoryUsage()
  const threshold = 500 * 1024 * 1024 // 500MB

  return {
    healthy: used.heapUsed < threshold,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`
  }
}
```

**Prometheus指标**:

```typescript
// lib/metrics.ts
import client from 'prom-client'

// 默认指标(CPU、内存等)
client.collectDefaultMetrics()

// 自定义指标
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
})

export const activeUsers = new client.Gauge({
  name: 'active_users_total',
  help: 'Total number of active users'
})

export const tradeVolume = new client.Counter({
  name: 'trade_volume_total',
  help: 'Total trade volume',
  labelNames: ['market_id']
})

// 使用中间件
export function metricsMiddleware(req, res, next) {
  const end = httpRequestDuration.startTimer()

  res.on('finish', () => {
    end({
      method: req.method,
      route: req.path,
      status_code: res.statusCode
    })
  })

  next()
}
```

### 5.7.2 错误追踪

**Sentry集成**:

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10%采样

  integrations: [
    new Sentry.Integrations.Prismic({
      prismicClientOptions: {}
    })
  ],

  // 过滤敏感信息
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers.authorization
      delete event.request.headers.cookie
    }

    if (event.request?.data) {
      // 过滤密码等敏感字段
      if (event.request.data.password) {
        event.request.data.password = '[Filtered]'
      }
    }

    return event
  }
})
```

**错误上报**:

```typescript
// app/api/trade/route.ts
import * as Sentry from '@sentry/nextjs'

export async function POST(req: Request) {
  try {
    const result = await processTrade(req)
    return Response.json(result)
  } catch (error) {
    // 上报错误
    Sentry.captureException(error, {
      tags: {
        section: 'trading'
      },
      user: {
        id: req.user.id
      },
      extra: {
        tradeData: req.body
      }
    })

    return Response.json(
      { error: 'Trade failed' },
      { status: 500 }
    )
  }
}
```

### 5.7.3 日志管理

**结构化日志**:

```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',

  // 生产环境使用JSON,开发环境使用pretty
  transport: process.env.NODE_ENV === 'production'
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true
        }
      },

  // 添加默认字段
  base: {
    env: process.env.NODE_ENV,
    version: process.env.APP_VERSION
  }
})

// 使用
logger.info('User logged in', {
  userId: user.id,
  email: maskEmail(user.email)
})

logger.error('Payment failed', {
  transactionId: transaction.id,
  error: error.message,
  stack: error.stack
})
```

**日志聚合**:

使用ELK Stack或Datadog聚合日志:

```yaml
# docker-compose.yml
version: '3.8'
services:
  elasticsearch:
    image: elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

  logstash:
    image: logstash:8.10.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000"
    depends_on:
      - elasticsearch

  kibana:
    image: kibana:8.10.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
```

### 5.7.4 告警配置

**告警规则**:

```yaml
# prometheus/alerts.yml
groups:
  - name: app
    rules:
      # 高错误率
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) /
          sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      # 响应时间过长
      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.95,
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
          ) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High response time"
          description: "95th percentile response time is {{ $value }}s"

      # 内存使用过高
      - alert: HighMemoryUsage
        expr: |
          process_resident_memory_bytes / (1024 * 1024) > 500
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}MB"
```

**告警通知**:

```yaml
# alertmanager/config.yml
global:
  slack_api_url: 'https://hooks.slack.com/services/xxx'

route:
  receiver: 'team-notifications'
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
      continue: true

receivers:
  - name: 'team-notifications'
    slack_configs:
      - channel: '#alerts'
        title: '{{ .Status | toUpper }}: {{ .CommonAnnotations.summary }}'
        text: '{{ .CommonAnnotations.description }}'

  - name: 'critical-alerts'
    slack_configs:
      - channel: '#critical-alerts'
        title: '🚨 CRITICAL: {{ .CommonAnnotations.summary }}'
        text: '{{ .CommonAnnotations.description }}'
```

## 5.8 故障排查指南

### 5.8.1 常见测试问题

**问题1: E2E测试超时**

```
Error: Timeout of 30000ms exceeded.
```

**排查步骤**:

```typescript
// ❌ 错误: 假设立即完成
await page.click('#button')

// ✅ 正确: 等待响应
await Promise.all([
  page.click('#button'),
  page.waitForResponse(resp =>
    resp.url().includes('/api/action') && resp.status() === 200
  )
])
```

**问题2: 元素找不到**

```
Error: Element not found: [data-testid="submit-btn"]
```

**排查步骤**:

1. 检查元素是否在视口中
2. 验证选择器是否正确
3. 检查元素是否动态生成

```typescript
// 等待元素出现
await page.waitForSelector('[data-testid="submit-btn"]', {
  state: 'visible',
  timeout: 10000
})

// 或使用locator自动等待
await page.locator('[data-testid="submit-btn"]').click()
```

**问题3: 测试互相干扰**

```
Test passes in isolation but fails when run with other tests
```

**解决方案**:

```typescript
// 使用test.beforeEach清理状态
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.context().clearCookies()
})

// 确保测试独立
test('test 1', async ({ page }) => {
  // 不依赖其他测试
})

test('test 2', async ({ page }) => {
  // 不依赖test 1
})
```

### 5.8.2 CI/CD故障排查

**问题1: 构建失败**

```bash
# 查看详细错误日志
npm run build --verbose

# 常见原因:
# - 类型错误
# - 缺少依赖
# - 环境变量未设置
```

**解决方案**:

```typescript
// 检查类型
npx tsc --noEmit

// 安装缺失依赖
npm install

// 设置环境变量
cp .env.example .env.local
```

**问题2: Docker构建失败**

```bash
# 本地测试Docker构建
docker build -t myapp:test .
docker run -p 3000:3000 myapp:test

# 查看构建日志
docker build --progress=plain -t myapp:test .
```

**问题3: 部署后健康检查失败**

```bash
# 查看容器日志
kubectl logs deployment/myapp --tail=100

# 查看事件
kubectl get events --sort-by='.lastTimestamp'

# 进入容器调试
kubectl exec -it deployment/myapp -- /bin/sh
```

### 5.8.3 性能问题排查

**问题1: 测试运行缓慢**

```bash
# 并行运行测试
npx playwright test --workers=4

# 只运行失败的测试
npx playwright test --last-failed

# 分析测试持续时间
npx playwright test --reporter=list
```

**问题2: 内存泄漏**

```bash
# 使用Chrome DevTools分析内存
npx playwright test --headed

# 在测试中添加内存检查
test('memory check', async ({ page }) => {
  const metrics = await page.metrics()
  console.log('JS Heap:', metrics.JSHeapUsedSize)
})
```

## 5.9 最佳实践总结

### 5.9.1 测试最佳实践

**DO(应该做)**:

1. ✅ 使用Page Object Model提高可维护性
2. ✅ 使用`data-testid`作为选择器
3. ✅ 等待API响应而非固定超时
4. ✅ 测试关键用户旅程的端到端
5. ✅ 在合并前运行测试
6. ✅ 在测试失败时审查工件

**DON'T(不应该做)**:

1. ❌ 使用不稳定的选择器(CSS类可能会改变)
2. ❌ 测试实现细节
3. ❌ 针对生产环境运行测试
4. ❌ 忽略不稳定测试
5. ❌ 在失败时跳过工件审查
6. ❌ 使用E2E测试每个边缘情况(使用单元测试)

### 5.9.2 CI/CD最佳实践

**DO**:

1. ✅ 快速反馈 - CI应在10分钟内完成
2. ✅ 自动化一切 - 减少手动步骤
3. ✅ 失败时停止 - 不要忽略失败
4. ✅ 使用有意义的提交消息
5. ✅ 保持主分支可部署
6. ✅ 监控关键指标

**DON'T**:

1. ❌ 提交破坏构建的代码
2. ❌ 跳过CI检查
3. ❌ 过度使用`[skip ci]`
4. ❌ 忽略安全警告
5. ❌ 部署到生产前不测试
6. ❌ 忘记更新文档

## 5.10 实战案例: 完整的CI/CD流程

### 5.10.1 项目背景

一个预测市场应用,需要:
- 自动化测试(单元、集成、E2E)
- 自动化部署到staging和production
- 监控和告警
- 快速回滚能力

### 5.10.2 实施步骤

**步骤1: 设置测试环境**

```bash
# 安装依赖
npm install --save-dev @playwright/test jest @testing-library/react

# 配置Playwright
npx playwright install

# 配置Jest
npx jest --init
```

**步骤2: 编写测试**

```typescript
// 单元测试
describe('calculateLiquidityScore', () => {
  it('should calculate correct score', () => {
    expect(calculateLiquidityScore(mockData)).toBe(75)
  })
})

// 集成测试
describe('GET /api/markets', () => {
  it('should return market list', async () => {
    const res = await fetch('/api/markets')
    expect(res.status).toBe(200)
  })
})

// E2E测试
test('user can search markets', async ({ page }) => {
  await page.goto('/markets')
  await page.fill('[data-testid="search"]', 'election')
  await expect(page.locator('[data-testid="market-card"]').first()).toBeVisible()
})
```

**步骤3: 配置CI/CD**

```yaml
# 创建CI工作流
# .github/workflows/ci.yml

# 创建部署工作流
# .github/workflows/deploy.yml
```

**步骤4: 设置监控**

```typescript
// 健康检查端点
// app/api/health/route.ts

// Prometheus指标
// lib/metrics.ts

// Sentry错误追踪
// lib/sentry.ts
```

**步骤5: 配置告警**

```yaml
# Prometheus告警规则
# prometheus/alerts.yml

# Alertmanager配置
# alertmanager/config.yml
```

**步骤6: 文档化流程**

```markdown
# 部署流程

1. 开发者在功能分支工作
2. 提交PR,触发CI
3. CI通过后,审查代码
4. 合并到main,自动部署到staging
5. 在staging验证
6. 手动触发部署到production
7. 监控部署状态
8. 如有问题,执行回滚
```

### 5.10.3 成果

通过完整的CI/CD流程,团队实现了:

- **部署频率**: 从每周1次提升到每天多次
- **部署时间**: 从1小时缩短到10分钟
- **失败率**: 降低80%
- **恢复时间**: 从1小时缩短到5分钟
- **团队满意度**: 显著提升

## 5.11 本章小结

通过本章的学习,我们掌握了:

- Agent Browser和Playwright的E2E测试
- Page Object Model模式提高测试可维护性
- 测试覆盖率管理和持续改进
- CI/CD流程设计和实施
- 多种部署策略和回滚机制
- 监控、日志和告警系统
- 故障排查和性能优化
- 最佳实践和实战案例

**关键要点**:

1. **自动化一切** - 手动操作是错误的源头
2. **快速反馈** - CI应该快到不会打断工作流
3. **持续改进** - 监控指标,优化流程
4. **安全第一** - 保护密钥,最小权限
5. **文档化** - 记录流程,便于维护
6. **Agent Browser优先** - 使用智能工具提高效率

**下一步行动**:

1. 设置项目的E2E测试框架
2. 配置CI/CD流水线
3. 实施监控和告警
4. 编写关键用户旅程的测试
5. 建立部署和回滚流程
6. 定期回顾和改进

## 下一章预告

在下一章"多智能体协作工作流"中,我们将学习:

- 多智能体架构设计
- 并行执行策略
- 智能体间通信和协调
- 微服务开发案例
- 大规模项目实践

结合自动化测试和部署,我们将构建完整的DevOps体系,实现高效的软件交付。
