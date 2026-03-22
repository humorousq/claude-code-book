# 贡献指南

感谢您考虑为《Claude Code 实战工作流指南》做出贡献！

## 如何贡献

### 报告问题

如果您发现错误或有改进建议：

1. 检查 [Issues](https://github.com/humorousq/claude-code-book/issues) 中是否已有相关问题
2. 如果没有，创建新的 Issue，详细描述：
   - 问题的描述
   - 重现步骤
   - 期望的结果
   - 实际的结果

### 提交内容

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 修改 Markdown 文件
4. 运行编号修复 (`npm run fix`)
5. 本地测试 (`npm run dev`)
6. 提交更改 (`git commit -m 'feat: add amazing feature'`)
7. 推送到分支 (`git push origin feature/amazing-feature`)
8. 创建 Pull Request

### 内容规范

#### Markdown 格式

- 使用标准 Markdown 语法
- 标题层级清晰（最多 4 级）
- 代码块指定语言
- 链接使用相对路径

#### 章节编号

- 章节编号格式：`X.Y.Z`（例如：5.1.1）
- 编号必须与章节匹配
- 提交前运行 `npm run fix` 自动修复

#### 代码示例

```bash
# 使用代码块指定语言
npm run dev
```

#### 图片

- 放在 `docs/public/images/` 目录
- 使用相对路径引用
- 图片宽度不超过 800px

### 开发流程

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 修改内容
# 编辑 docs/ 目录下的 Markdown 文件

# 4. 修复章节编号
npm run fix

# 5. 测试构建
npm run build

# 6. 预览结果
npm run preview

# 7. 提交更改
git add .
git commit -m "feat: update content"
```

### 发布流程

维护者执行：

```bash
# 1. 更新版本号
# 编辑 package.json

# 2. 更新 CHANGELOG.md

# 3. 提交
git add .
git commit -m "chore: bump version to vX.Y.Z"

# 4. 创建 tag
git tag vX.Y.Z

# 5. 推送
git push origin main --tags

# 6. GitHub Actions 自动构建并发布
```

## 许可证

贡献的内容将采用 MIT 许可证。
