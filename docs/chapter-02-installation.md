# 第2章 安装与环境配置

> "工欲善其事，必先利其器。正确的安装和配置是高效使用 Everything Claude Code 的第一步。"

## 本章概述

本章将指导你完成 Everything Claude Code 扩展包的安装和基础配置。通过本章的学习，你将能够：

- ✅ 检查和准备必要的环境依赖
- ✅ 选择合适的安装方式并完成安装
- ✅ 验证安装是否成功
- ✅ 了解常见问题的解决方案

## 2.1 环境要求检查

### 必需软件

在安装 Everything Claude Code 之前，请确保你的系统已安装以下软件：

| 软件 | 最低版本 | 推荐版本 | 检查命令 |
|------|---------|---------|---------|
| **Node.js** | 18.0.0 | 22.x LTS | `node --version` |
| **npm** | 9.0.0 | 10.x | `npm --version` |
| **Git** | 2.30.0 | 最新版 | `git --version` |
| **Claude Code CLI** | 最新版 | 最新版 | `claude --version` |

### 系统要求

- **操作系统**：macOS、Linux、Windows（完全跨平台支持）
- **内存**：建议 4GB+
- **磁盘空间**：至少 1GB（包含依赖）

### 环境检查脚本

运行以下命令快速检查环境：

```bash
# 检查 Node.js 版本
echo "Node.js 版本: $(node --version)"

# 检查 npm 版本
echo "npm 版本: $(npm --version)"

# 检查 Git 版本
echo "Git 版本: $(git --version)"

# 检查 Claude Code CLI
echo "Claude Code CLI: $(claude --version 2>/dev/null || echo '未安装')"
```

### 安装 Claude Code CLI

如果你还没有安装 Claude Code CLI，请按以下步骤安装：

**macOS/Linux**：
```bash
# 使用 npm 全局安装
npm install -g @anthropic-ai/claude-code

# 或使用 Homebrew（macOS）
brew install claude-code
```

**Windows**：
```bash
# 使用 npm 全局安装
npm install -g @anthropic-ai/claude-code

# 或使用 Chocolatey
choco install claude-code
```

**验证安装**：
```bash
claude --version
# 应显示版本号，如：claude-code/1.0.0
```

---

## 2.2 安装方式选择

Everything Claude Code 提供两种安装方式：

### 方式一：插件安装（推荐）

**适用人群**：大多数用户，希望快速开始使用

**优势**：
- ✅ 简单快速，一条命令完成
- ✅ 自动管理依赖
- ✅ 方便更新

**步骤**：

#### 1. 安装插件

```bash
# 从 Claude Code 插件市场添加
/plugin marketplace add affaan-m/everything-claude-code

# 安装插件
/plugin install everything-claude-code
```

#### 2. 安装规则文件（必需）

由于上游限制，插件无法自动分发规则文件，需要手动安装：

```bash
# 克隆仓库
git clone https://github.com/affaan-m/everything-claude-code.git

# 复制通用规则到 Claude 配置目录
cp -r everything-claude-code/rules/common/* ~/.claude/rules/

# 复制语言特定规则（根据你的技术栈选择）
cp -r everything-claude-code/rules/typescript/* ~/.claude/rules/  # TypeScript
cp -r everything-claude-code/rules/python/* ~/.claude/rules/      # Python
cp -r everything-claude-code/rules/golang/* ~/.claude/rules/      # Go
cp -r everything-claude-code/rules/perl/* ~/.claude/rules/        # Perl
```

#### 3. 验证安装

```bash
# 查看已安装的 Skills
/skill list

# 应显示类似输出：
# - tdd-workflow
# - coding-standards
# - security-review
# ...
```

### 方式二：手动安装

**适用人群**：高级用户，需要完全控制配置

**优势**：
- ✅ 完全控制安装内容
- ✅ 可以选择性安装组件
- ✅ 便于定制和调试

**步骤**：

#### 1. 克隆仓库

```bash
# 克隆完整仓库
git clone https://github.com/affaan-m/everything-claude-code.git

# 进入目录
cd everything-claude-code
```

#### 2. 复制组件到 Claude 配置目录

```bash
# 创建 Claude 配置目录（如果不存在）
mkdir -p ~/.claude/{agents,skills,rules,hooks,commands}

# 复制所有 Agents
cp agents/*.md ~/.claude/agents/

# 复制所有 Skills
cp skills/*.md ~/.claude/skills/

# 复制所有 Commands
cp commands/*.md ~/.claude/commands/

# 复制通用规则
cp -r rules/common/* ~/.claude/rules/

# 复制语言特定规则（根据需要）
cp -r rules/typescript/* ~/.claude/rules/
cp -r rules/python/* ~/.claude/rules/
cp -r rules/golang/* ~/.claude/rules/

# 复制 Hooks 配置
cp hooks/*.yaml ~/.claude/hooks/
```

#### 3. 验证安装

```bash
# 检查 Agents 安装
ls ~/.claude/agents/
# 应显示：planner.md, architect.md, code-reviewer.md 等

# 检查 Skills 安装
ls ~/.claude/skills/
# 应显示：tdd-workflow.md, coding-standards.md 等

# 检查 Rules 安装
ls ~/.claude/rules/
# 应显示：coding-standards.md, error-handling.md 等
```

---

## 2.3 基础配置

### 配置环境变量（可选）

如果你需要自定义 Claude Code 的行为，可以设置环境变量：

```bash
# 在 ~/.bashrc 或 ~/.zshrc 中添加
export CLAUDE_CODE_CONFIG_DIR="$HOME/.claude"
export CLAUDE_CODE_LOG_LEVEL="info"
```

### 第一个 Skill 的使用验证

让我们用一个简单的示例验证安装是否成功：

#### 使用 tdd-workflow Skill

```bash
# 创建一个测试项目
mkdir test-project
cd test-project
git init

# 使用 tdd-workflow Skill
/skill use tdd-workflow "实现一个计算器，支持加减乘除"

# Claude 会自动：
# 1. 创建测试文件
# 2. 编写测试用例
# 3. 引导你实现功能
```

如果上述命令成功执行，说明 Everything Claude Code 已正确安装！

### 配置团队共享（可选）

如果你在团队环境中使用，可以将配置文件提交到代码仓库：

```bash
# 在项目根目录创建 .claude 目录
mkdir -p .claude/{agents,skills,rules}

# 复制团队共享的配置
cp ~/.claude/agents/team-*.md .claude/agents/
cp ~/.claude/skills/team-*.md .claude/skills/

# 提交到版本控制
git add .claude/
git commit -m "Add shared Claude Code configuration"
```

这样团队成员克隆项目后，会自动使用团队的配置。

---

## 2.4 故障排查

### 常见问题1：命令找不到

**问题**：
```bash
bash: claude: command not found
```

**解决方案**：
```bash
# 检查 Claude Code 是否已安装
which claude

# 如果返回空，说明未安装或未添加到 PATH
# 重新安装 Claude Code CLI
npm install -g @anthropic-ai/claude-code

# 确保 npm 全局包目录在 PATH 中
echo $PATH
# 应包含类似 /usr/local/bin 或 ~/.npm-global/bin
```

### 常见问题2：Skills 不生效

**问题**：
```bash
/skill list
# 返回空列表或报错
```

**解决方案**：
```bash
# 检查 Skills 目录
ls ~/.claude/skills/

# 如果目录为空，重新复制 Skills
git clone https://github.com/affaan-m/everything-claude-code.git
cp everything-claude-code/skills/*.md ~/.claude/skills/

# 验证文件权限
chmod 644 ~/.claude/skills/*.md
```

### 常见问题3：规则文件未加载

**问题**：Claude 没有按照规则文件工作

**解决方案**：
```bash
# 检查规则目录
ls ~/.claude/rules/

# 确保规则文件格式正确
head ~/.claude/rules/coding-standards.md
# 应看到 YAML frontmatter 和 Markdown 内容

# 重启 Claude Code 会话
# 规则文件在会话开始时加载
```

### 常见问题4：权限错误

**问题**：
```bash
Error: EACCES: permission denied
```

**解决方案**：
```bash
# 检查目录权限
ls -la ~/.claude/

# 修复权限
sudo chown -R $(whoami) ~/.claude/
chmod -R 755 ~/.claude/
```

### 常见问题5：网络问题

**问题**：克隆仓库失败

**解决方案**：
```bash
# 使用镜像站点（中国大陆用户）
git clone https://gitclone.com/github.com/affaan-m/everything-claude-code.git

# 或使用 SSH 协议（如果 HTTPS 被阻止）
git clone git@github.com:affaan-m/everything-claude-code.git
```

---

## 2.5 更新与维护

### 更新扩展包

定期更新可以获得最新的功能和修复：

**插件方式**：
```bash
# 更新插件
/plugin update everything-claude-code

# 更新规则文件
cd everything-claude-code
git pull
cp -r rules/common/* ~/.claude/rules/
```

**手动方式**：
```bash
cd everything-claude-code
git pull origin main

# 重新复制组件
cp agents/*.md ~/.claude/agents/
cp skills/*.md ~/.claude/skills/
cp -r rules/common/* ~/.claude/rules/
```

### 查看已安装版本

```bash
# 查看插件版本
/plugin list

# 查看 Git 仓库版本
cd everything-claude-code
git log -1 --oneline
```

---

## 2.6 本章小结

本章我们完成了：

1. ✅ 检查了环境依赖（Node.js、npm、Git、Claude Code CLI）
2. ✅ 选择并执行了合适的安装方式（插件安装或手动安装）
3. ✅ 验证了安装成功
4. ✅ 了解了常见问题的解决方案

**下一步建议**：
- 如果你刚接触 Everything Claude Code，建议先完成一个简单的 TDD 工作流（第4章）
- 如果你已经熟悉基础用法，可以直接跳到高级工作流（第7章）
- 遇到问题时，查阅附录D"故障排查指南"

---

## 下一步

- **第3章**：学习如何使用 planner agent 进行需求规划
- **第4章**：掌握 TDD 工作流
- **附录D**：查看完整的故障排查指南
