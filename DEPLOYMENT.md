# GitHub 发布部署指南

## 第一步：创建 GitHub 仓库

### 1. 访问 GitHub

1. 打开 https://github.com
2. 登录您的账号（humorousz）
3. 点击右上角 "+" → "New repository"

### 2. 填写仓库信息

- **Repository name**: `claude-code-book`
- **Description**: `Claude Code 实战工作流指南 - 从需求到部署的 AI 驱动开发全链路实践`
- **Visibility**: ✅ Public（公开，可以部署到 GitHub Pages）
- **不要勾选**:
  - ❌ Add a README file
  - ❌ Add .gitignore
  - ❌ Choose a license
  （因为本地已经有这些文件了）

3. 点击 "Create repository"

---

## 第二步：推送代码到 GitHub

### 方法一：使用命令行（推荐）

```bash
cd /Users/zhangzhiquan/Github/claude-code-book

# 添加远程仓库
git remote add origin https://github.com/humorousz/claude-code-book.git

# 推送代码到 GitHub
git branch -M main
git push -u origin main
```

### 方法二：如果远程仓库已存在

```bash
# 查看当前远程仓库
git remote -v

# 如果需要更新远程地址
git remote set-url origin https://github.com/humorousz/claude-code-book.git

# 推送
git push -u origin main
```

---

## 第三步：启用 GitHub Pages

### 1. 进入仓库设置

1. 访问 https://github.com/humorousz/claude-code-book
2. 点击 "Settings" 标签
3. 在左侧菜单找到 "Pages"

### 2. 配置 Pages

- **Source**: 选择 "GitHub Actions"（不是 Deploy from a branch）
- 保存设置

### 3. 等待自动部署

- GitHub Actions 会自动运行 `.github/workflows/deploy.yml`
- 大约 2-3 分钟完成部署
- 部署完成后会显示：**Your site is published at https://humorousz.github.io/claude-code-book/**

---

## 第四步：验证网站部署

### 1. 检查 Actions 状态

1. 访问 https://github.com/humorousz/claude-code-book/actions
2. 查看最新的 workflow 运行状态
3. 确保显示 ✅ 绿色对勾

### 2. 访问网站

打开浏览器访问：
**https://humorousz.github.io/claude-code-book/**

---

## 第五步：创建第一个 Release（发布 PDF）

### 1. 创建 Git 标签

```bash
cd /Users/zhangzhiquan/Github/claude-code-book

# 创建标签
git tag -a v1.0.0 -m "Release v1.0.0 - 初始版本"

# 推送标签到 GitHub
git push origin v1.0.0
```

### 2. 自动发布流程

推送标签后，GitHub Actions 会自动：

1. ✅ 构建网站
2. ✅ 生成 PDF（使用 Puppeteer）
3. ✅ 创建 GitHub Release
4. ✅ 上传 PDF 到 Release

### 3. 查看发布结果

1. 访问 https://github.com/humorousz/claude-code-book/releases
2. 找到 v1.0.0 Release
3. 下载生成的 PDF 文件

---

## 第六步：更新网站配置（重要！）

### 修改配置文件中的 URL

编辑 `docs/.vitepress/config.mts`：

```typescript
export default defineConfig({
  // 添加以下配置
  base: '/claude-code-book/',  // 仓库名称
  cleanUrls: true,

  // 更新 editLink
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/humorousz/claude-code-book/edit/main/docs/:path'
    }
  }
})
```

然后提交并推送：

```bash
cd /Users/zhangzhiquan/Github/claude-code-book
git add docs/.vitepress/config.mts
git commit -m "chore: update base URL for GitHub Pages"
git push
```

---

## 常见问题解决

### Q1: 网站显示 404 错误

**解决方案**：
1. 检查 Settings → Pages 是否配置正确
2. 确保 Source 选择的是 "GitHub Actions"
3. 查看 Actions 标签页是否有失败的 workflow

### Q2: PDF 生成失败

**解决方案**：
1. 检查 Actions 日志找出错误原因
2. 确保 Puppeteer 依赖正确安装
3. 可能需要增加 workflow 的权限：

编辑 `.github/workflows/release.yml`，确保有：
```yaml
permissions:
  contents: write
```

### Q3: 样式加载失败

**解决方案**：
在 `docs/.vitepress/config.mts` 中添加：
```typescript
export default defineConfig({
  base: '/claude-code-book/',  // 必须与仓库名称匹配
  // ...
})
```

### Q4: 如何更新内容？

```bash
# 1. 修改 docs/ 下的 Markdown 文件
# 2. 修复章节编号
npm run fix

# 3. 测试构建
npm run build

# 4. 提交并推送
git add .
git commit -m "docs: update content"
git push

# GitHub Actions 会自动重新部署
```

### Q5: 如何发布新版本？

```bash
# 1. 更新版本号
# 编辑 package.json 中的 version

# 2. 更新 CHANGELOG.md

# 3. 提交更改
git add .
git commit -m "chore: bump version to vX.Y.Z"

# 4. 创建新标签
git tag -a vX.Y.Z -m "Release vX.Y.Z"

# 5. 推送
git push
git push origin vX.Y.Z

# GitHub Actions 会自动创建新的 Release
```

---

## 快速命令参考

```bash
# 推送代码
cd /Users/zhangzhiquan/Github/claude-code-book
git remote add origin https://github.com/humorousz/claude-code-book.git
git push -u origin main

# 创建发布
git tag v1.0.0
git push origin v1.0.0

# 更新内容
npm run fix          # 修复编号
npm run build        # 本地测试
git add .            # 提交
git commit -m "..."
git push             # 推送（自动部署）
```

---

## 部署后清单

- [ ] 仓库已创建并推送代码
- [ ] GitHub Pages 已启用（Source: GitHub Actions）
- [ ] Actions workflow 运行成功
- [ ] 网站 https://humorousz.github.io/claude-code-book/ 可访问
- [ ] 配置文件已更新 base URL
- [ ] 第一个 Release v1.0.0 已创建
- [ ] PDF 已生成并上传到 Release

---

## 成功标志

✅ 网站访问正常：https://humorousz.github.io/claude-code-book/
✅ Actions 全部通过：https://github.com/humorousz/claude-code-book/actions
✅ Release 已创建：https://github.com/humorousz/claude-code-book/releases
✅ PDF 可下载

---

**祝您发布顺利！** 🎉
