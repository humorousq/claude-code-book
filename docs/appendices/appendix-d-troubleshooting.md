# 附录D：Claude Code 故障排查指南

本章提供 Claude Code 常见问题的诊断和解决方案，包括错误分析、调试技巧和故障排查决策图。

---

## D.1 常见错误类型

### D.1.1 安装错误

#### 错误：找不到 Claude Code 命令

**症状**：
```bash
command not found: claude
```

**原因**：
- Claude Code 未正确安装
- PATH 环境变量未配置
- 安装目录不在 PATH 中

**解决方案**：

1. 检查安装：
```bash
# 检查 Claude Code 是否安装
which claude

# 如果使用 npm 安装
npm list -g @anthropic/claude-code

# 如果使用 pnpm 安装
pnpm list -g @anthropic/claude-code
```

2. 添加到 PATH：
```bash
# Bash 用户
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Zsh 用户
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

3. 重新安装：
```bash
# 使用 npm
npm install -g @anthropic/claude-code

# 使用 pnpm
pnpm add -g @anthropic/claude-code

# 使用 curl
curl -fsSL https://claude.ai/install.sh | sh
```

---

#### 错误：权限被拒绝

**症状**：
```bash
Error: EACCES: permission denied
```

**原因**：
- 没有 npm 全局目录的写入权限
- 文件权限不正确

**解决方案**：

1. 修复 npm 权限：
```bash
# 创建 npm 全局目录
mkdir -p ~/.npm-global

# 配置 npm 使用新目录
npm config set prefix '~/.npm-global'

# 添加到 PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

2. 或使用 sudo（不推荐）：
```bash
sudo npm install -g @anthropic/claude-code
```

---

### D.1.2 配置错误

#### 错误：找不到配置文件

**症状**：
```bash
Error: Configuration file not found
```

**原因**：
- 配置文件不存在
- 配置文件路径不正确
- 配置文件格式错误

**解决方案**：

1. 创建配置文件：
```bash
# 创建配置目录
mkdir -p ~/.claude

# 创建默认配置
cat > ~/.claude/settings.json <<EOF
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json"
}
EOF
```

2. 验证配置文件：
```bash
# 验证 JSON 格式
cat ~/.claude/settings.json | python -m json.tool

# 或使用 jq
cat ~/.claude/settings.json | jq .
```

---

#### 错误：JSON 解析错误

**症状**：
```bash
Error: Parse error on line 5: ... "hooks": { ...
---------------------^
Expecting 'STRING', '}'
```

**原因**：
- JSON 语法错误
- 缺少逗号或括号
- 多余的逗号

**解决方案**：

1. 使用 JSON 验证器：
```bash
# 使用 Python
python -m json.tool ~/.claude/settings.json

# 使用 jq
jq . ~/.claude/settings.json

# 在线验证器
# https://jsonlint.com/
```

2. 常见 JSON 错误：
```json
// 错误：多余的逗号
{
  "key1": "value1",  // 正确
  "key2": "value2",  // 错误：最后一个元素不应有逗号
}

// 正确：
{
  "key1": "value1",
  "key2": "value2"
}

// 错误：缺少引号
{
  key: "value"  // 错误：key 应该用引号
}

// 正确：
{
  "key": "value"
}
```

---

### D.1.3 Agent 错误

#### 错误：Agent 未找到

**症状**：
```bash
Error: Agent 'my-agent' not found
```

**原因**：
- Agent 文件不存在
- Agent 名称拼写错误
- Agent 目录不在搜索路径中

**解决方案**：

1. 检查 Agent 文件：
```bash
# 列出所有 Agent
ls ~/.claude/agents/

# 搜索 Agent 文件
find ~/.claude -name "*.md" -path "*/agents/*"
```

2. 验证 Agent 配置：
```markdown
---
name: my-agent  # 确保名称正确
description: Agent 描述
tools: ["Read", "Write"]
---
```

3. 检查 Agent 路径：
```bash
# Agent 应该在以下位置之一：
~/.claude/agents/my-agent.md
./agents/my-agent.md
./.claude/agents/my-agent.md
```

---

#### 错误：Agent 工具不可用

**症状**：
```bash
Error: Tool 'Write' not available for agent
```

**原因**：
- Agent 未请求该工具
- 工具名称拼写错误
- 工具不被支持

**解决方案**：

1. 检查工具配置：
```markdown
---
name: my-agent
tools: ["Read", "Write", "Edit", "Bash"]  # 添加需要的工具
---
```

2. 可用工具列表：
- Read - 读取文件
- Write - 写入文件
- Edit - 编辑文件
- Bash - 执行命令
- Grep - 搜索内容
- Glob - 查找文件

---

### D.1.4 Skill 错误

#### 错误：Skill 未激活

**症状**：
- Skill 应该激活但没有激活
- 预期的模式没有被应用

**原因**：
- Skill 文件格式不正确
- Skill 描述不匹配当前上下文
- Skill 被禁用

**解决方案**：

1. 检查 Skill 文件：
```bash
# 列出所有 Skill
ls ~/.claude/skills/

# 检查 Skill 文件格式
cat ~/.claude/skills/my-skill/SKILL.md
```

2. 验证 Skill 格式：
```markdown
---
name: my-skill
description: 清晰的描述  # 描述应该具体
origin: local
---

# Skill 内容

## 何时激活
- 明确列出激活条件
```

3. 检查 Skill 优先级：
```json
// ~/.claude/settings.json
{
  "skills": {
    "priority": ["my-skill"],
    "disabled": []  // 确保没有被禁用
  }
}
```

---

### D.1.5 Hook 错误

#### 错误：Hook 执行失败

**症状**：
```bash
Error: Hook 'pre-bash-check' failed with exit code 1
```

**原因**：
- Hook 脚本错误
- Hook 超时
- Hook 权限问题

**解决方案**：

1. 检查 Hook 脚本：
```bash
# 查看 Hook 脚本
cat ~/.claude/scripts/hooks/pre-bash-check.js

# 测试脚本
node ~/.claude/scripts/hooks/pre-bash-check.js
```

2. 检查 Hook 配置：
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/hooks/pre-bash-check.js",
            "timeout": 30  // 增加超时时间
          }
        ]
      }
    ]
  }
}
```

3. 调试 Hook：
```bash
# 手动运行 Hook
node ~/.claude/scripts/hooks/pre-bash-check.js

# 检查环境变量
echo $CLAUDE_PLUGIN_ROOT
```

---

### D.1.6 MCP 错误

#### 错误：MCP 服务器连接失败

**症状**：
```bash
Error: Failed to connect to MCP server 'postgres'
```

**原因**：
- MCP 服务器未安装
- 命令路径不正确
- 环境变量未设置
- 依赖项缺失

**解决方案**：

1. 检查 MCP 服务器：
```bash
# 验证命令是否存在
which mcp-server-postgres

# 检查是否安装
npm list -g mcp-server-postgres
```

2. 安装 MCP 服务器：
```bash
npm install -g mcp-server-postgres
```

3. 检查配置：
```json
{
  "mcpServers": {
    "postgres": {
      "command": "mcp-server-postgres",  // 确保命令正确
      "args": [
        "--connection-string",
        "${DATABASE_URL}"  // 确保环境变量设置
      ],
      "env": {
        "DATABASE_URL": "postgresql://localhost:5432/mydb"
      }
    }
  }
}
```

4. 测试连接：
```bash
# 手动测试 MCP 服务器
mcp-server-postgres --connection-string "postgresql://localhost:5432/mydb"
```

---

## D.2 调试技巧

### D.2.1 启用详细日志

```bash
# 启用详细输出
export CLAUDE_VERBOSE=true
claude

# 或在命令中指定
claude --verbose
```

---

### D.2.2 查看日志文件

```bash
# 查看主日志
tail -f ~/.claude/logs/main.log

# 查看错误日志
tail -f ~/.claude/logs/error.log

# 查看调试日志
tail -f ~/.claude/logs/debug.log
```

---

### D.2.3 测试配置

```bash
# 验证配置文件
claude config check

# 测试 Agent
claude agent test my-agent

# 测试 Skill
claude skill test my-skill

# 测试 Hook
claude hook test pre-bash-check
```

---

### D.2.4 逐步调试

1. **隔离问题**：
```bash
# 使用最小配置
mv ~/.claude/settings.json ~/.claude/settings.json.backup
claude

# 逐步添加配置
```

2. **检查环境**：
```bash
# 检查环境变量
env | grep CLAUDE

# 检查 PATH
echo $PATH

# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version
```

3. **检查依赖**：
```bash
# 检查全局包
npm list -g --depth=0

# 检查项目依赖
npm list --depth=0
```

---

## D.3 故障排查决策图

### D.3.1 启动失败决策图

```
启动失败
├─ 命令未找到？
│  ├─ 是 → 检查安装
│  │       ├─ 已安装 → 添加到 PATH
│  │       └─ 未安装 → 重新安装
│  └─ 否 ↓
├─ 配置错误？
│  ├─ 是 → 检查 JSON 格式
│  │       ├─ 格式正确 → 检查配置内容
│  │       └─ 格式错误 → 修复 JSON
│  └─ 否 ↓
├─ 权限问题？
│  ├─ 是 → 修复文件权限
│  │       sudo chown -R $USER:$USER ~/.claude
│  └─ 否 ↓
└─ 查看日志 → 详细诊断
```

---

### D.3.2 Agent 不工作决策图

```
Agent 不工作
├─ Agent 未找到？
│  ├─ 是 → 检查文件路径
│  │       ├─ 路径正确 → 检查文件名
│  │       └─ 路径错误 → 移动或创建文件
│  └─ 否 ↓
├─ Agent 格式错误？
│  ├─ 是 → 检查 YAML frontmatter
│  │       ├─ 格式正确 → 检查字段
│  │       └─ 格式错误 → 修复 frontmatter
│  └─ 否 ↓
├─ 工具不可用？
│  ├─ 是 → 检查 tools 字段
│  │       └─ 添加需要的工具
│  └─ 否 ↓
└─ 模型问题？
    └─ 检查 model 字段
        ├─ opus → 复杂任务
        ├─ sonnet → 平衡
        └─ haiku → 简单任务
```

---

### D.3.3 Skill 不激活决策图

```
Skill 不激活
├─ Skill 未找到？
│  ├─ 是 → 检查文件路径
│  │       └─ ~/.claude/skills/my-skill/SKILL.md
│  └─ 否 ↓
├─ Skill 被禁用？
│  ├─ 是 → 从 disabled 列表移除
│  │       └─ settings.json → skills.disabled
│  └─ 否 ↓
├─ 描述不匹配？
│  ├─ 是 → 修改 description
│  │       └─ 使描述更具体
│  └─ 否 ↓
└─ 优先级问题？
    └─ 检查 priority 列表
        └─ 添加到 priority 列表
```

---

### D.3.4 Hook 失败决策图

```
Hook 失败
├─ 脚本不存在？
│  ├─ 是 → 检查脚本路径
│  │       └─ 创建或修复路径
│  └─ 否 ↓
├─ 脚本错误？
│  ├─ 是 → 手动测试脚本
│  │       node scripts/hooks/my-hook.js
│  └─ 否 ↓
├─ 超时？
│  ├─ 是 → 增加 timeout 值
│  │       "timeout": 60
│  └─ 否 ↓
└─ 环境变量？
    └─ 检查 CLAUDE_PLUGIN_ROOT
        echo $CLAUDE_PLUGIN_ROOT
```

---

### D.3.5 MCP 连接失败决策图

```
MCP 连接失败
├─ 服务器未安装？
│  ├─ 是 → 安装服务器
│  │       npm install -g mcp-server-xxx
│  └─ 否 ↓
├─ 命令路径错误？
│  ├─ 是 → 检查 command 字段
│  │       └─ which mcp-server-xxx
│  └─ 否 ↓
├─ 环境变量缺失？
│  ├─ 是 → 设置环境变量
│  │       export API_KEY=xxx
│  └─ 否 ↓
├─ 参数错误？
│  ├─ 是 → 检查 args 字段
│  │       └─ 查看服务器文档
│  └─ 否 ↓
└─ 依赖缺失？
    └─ 安装依赖
        apt-get install xxx
```

---

## D.4 性能问题

### D.4.1 响应缓慢

**症状**：
- Claude Code 响应时间过长
- Agent 执行缓慢

**诊断**：
```bash
# 检查系统资源
top
htop

# 检查 Node.js 内存使用
node --v8-options | grep memory

# 检查 Claude Code 进程
ps aux | grep claude
```

**解决方案**：

1. 增加内存限制：
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
```

2. 禁用不必要的 Hook：
```json
{
  "hooks": {
    "PreToolUse": []  // 禁用所有 PreToolUse Hook
  }
}
```

3. 使用更快的模型：
```markdown
---
name: my-agent
model: haiku  // 从 sonnet 改为 haiku
---
```

---

### D.4.2 高 CPU 使用

**症状**：
- CPU 使用率持续高
- 风扇噪音大

**诊断**：
```bash
# 找到高 CPU 进程
top -o CPU

# 检查 Claude Code 子进程
pstree -p $(pgrep claude)
```

**解决方案**：

1. 减少并发：
```bash
export CLAUDE_MAX_WORKERS=2
```

2. 异步 Hook 改为同步：
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "...",
            "async": false  // 改为 false
          }
        ]
      }
    ]
  }
}
```

---

### D.4.3 内存泄漏

**症状**：
- 内存使用持续增长
- 最终崩溃

**诊断**：
```bash
# 监控内存使用
watch -n 1 'ps aux | grep claude'

# 生成堆快照
kill -USR2 $(pgrep claude)
```

**解决方案**：

1. 定期重启：
```bash
# 每小时重启一次
watch -n 3600 'pkill claude && claude'
```

2. 清理缓存：
```bash
rm -rf ~/.claude/cache/*
```

---

## D.5 网络问题

### D.5.1 API 连接失败

**症状**：
```bash
Error: Failed to connect to API: ETIMEDOUT
```

**解决方案**：

1. 检查网络连接：
```bash
# 测试连接
curl -I https://api.anthropic.com

# 测试 DNS
nslookup api.anthropic.com
```

2. 配置代理：
```bash
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
```

3. 增加超时：
```bash
export CLAUDE_API_TIMEOUT=60000  # 60 秒
```

---

### D.5.2 代理配置

**症状**：
- 在企业网络中无法连接
- 需要使用代理

**解决方案**：

1. 设置代理：
```bash
# HTTP 代理
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# SOCKS 代理
export HTTP_PROXY=socks5://proxy.company.com:1080
export HTTPS_PROXY=socks5://proxy.company.com:1080
```

2. 绕过代理：
```bash
export NO_PROXY=localhost,127.0.0.1,.company.com
```

---

## D.6 数据问题

### D.6.1 会话数据丢失

**症状**：
- 保存的会话无法加载
- 历史记录丢失

**解决方案**：

1. 检查数据文件：
```bash
# 查看会话文件
ls -lh ~/.claude/sessions/

# 检查文件完整性
cat ~/.claude/sessions/*.json | python -m json.tool
```

2. 恢复备份：
```bash
# 查找备份
find ~/.claude -name "*.backup"

# 恢复
cp ~/.claude/sessions/backup.json ~/.claude/sessions/current.json
```

---

### D.6.2 缓存损坏

**症状**：
- 行为异常
- 数据不一致

**解决方案**：

```bash
# 清理缓存
rm -rf ~/.claude/cache/*

# 重置状态
rm -rf ~/.claude/state/*

# 重新初始化
claude init
```

---

## D.7 安全问题

### D.7.1 API 密钥泄露

**症状**：
- API 密钥出现在日志或输出中

**解决方案**：

1. 立即撤销：
- 登录 Anthropic 控制台
- 撤销泄露的密钥
- 生成新密钥

2. 清理历史：
```bash
# 从 git 历史中移除
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file" \
  --prune-empty --tag-name-filter cat -- --all

# 或使用 BFG
bfg --delete-files path/to/file
```

3. 添加到 .gitignore：
```bash
echo "secrets.env" >> .gitignore
```

---

### D.7.2 权限过大

**症状**：
- Agent 请求过多权限
- 担心安全问题

**解决方案**：

1. 限制工具：
```markdown
---
name: my-agent
tools: ["Read", "Grep"]  # 只读工具
---
```

2. 沙箱模式：
```bash
# 使用 Docker 运行
docker run -it \
  -v $(pwd):/workspace \
  --network none \
  claude-code
```

---

## D.8 常见警告处理

### D.8.1 弃用警告

**症状**：
```bash
Warning: This feature is deprecated and will be removed in v2.0
```

**解决方案**：

1. 检查文档了解替代方案
2. 更新配置使用新的 API
3. 升级到最新版本

---

### D.8.2 性能警告

**症状**：
```bash
Warning: Operation took 5.2s, consider optimizing
```

**解决方案**：

1. 分析性能：
```bash
# 启用性能分析
export CLAUDE_PROFILE=true
```

2. 优化配置：
- 减少不必要的 Hook
- 使用更快的模型
- 缓存重复计算

---

## D.9 获取帮助

### D.9.1 日志收集

```bash
# 收集诊断信息
claude diagnose > diagnosis.txt

# 收集日志
tar -czf claude-logs.tar.gz ~/.claude/logs/

# 收集配置
tar -czf claude-config.tar.gz ~/.claude/*.json
```

---

### D.9.2 报告问题

提交 Bug 报告时包含：

1. 系统信息：
```bash
uname -a
node --version
npm --version
claude --version
```

2. 配置文件（脱敏）：
```bash
# 移除敏感信息
cat ~/.claude/settings.json | sed 's/"api_key": ".*"/"api_key": "XXX"/g'
```

3. 错误日志：
```bash
tail -100 ~/.claude/logs/error.log
```

4. 重现步骤：
- 详细描述操作步骤
- 预期结果
- 实际结果

---

### D.9.3 社区资源

- GitHub Issues: https://github.com/anthropics/claude-code/issues
- 文档: https://claude.ai/docs
- 社区论坛: https://community.claude.ai
- Discord: https://discord.gg/claude-ai

---

**注意**：在尝试任何解决方案之前，建议备份重要配置和数据。如果问题持续存在，请联系支持团队。
