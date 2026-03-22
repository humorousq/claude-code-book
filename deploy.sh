#!/bin/bash

echo "🚀 开始部署 Claude Code 实战工作流指南到 GitHub..."
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在 claude-code-book 目录下运行此脚本"
    exit 1
fi

echo "📋 部署步骤："
echo ""
echo "第 1 步：在 GitHub 创建仓库"
echo "  访问：https://github.com/new"
echo "  仓库名称：claude-code-book"
echo "  描述：Claude Code 实战工作流指南"
echo "  可见性：Public"
echo "  不要勾选任何初始化选项"
echo ""
read -p "按 Enter 继续创建仓库，完成后按 Enter..."
echo ""

echo "第 2 步：添加远程仓库"
echo "  git remote add origin https://github.com/humorousz/claude-code-book.git"
echo ""

# 检查远程仓库是否已存在
if git remote | grep -q "origin"; then
    echo "  ℹ️  远程仓库已存在，更新地址..."
    git remote set-url origin https://github.com/humorousz/claude-code-book.git
else
    git remote add origin https://github.com/humorousz/claude-code-book.git
fi

echo "✅ 远程仓库已配置"
echo ""

echo "第 3 步：推送代码到 GitHub"
git branch -M main
git push -u origin main
echo "✅ 代码已推送"
echo ""

echo "第 4 步：启用 GitHub Pages"
echo "  1. 访问：https://github.com/humorousz/claude-code-book/settings/pages"
echo "  2. Source 选择：GitHub Actions"
echo "  3. 点击 Save"
echo ""
read -p "完成后按 Enter 继续..."
echo ""

echo "✅ 网站即将部署到："
echo "  https://humorousz.github.io/claude-code-book/"
echo ""

echo "第 5 步：创建第一个 Release（可选）"
read -p "是否创建 v1.0.0 Release？(y/n): " create_release

if [ "$create_release" = "y" ] || [ "$create_release" = "Y" ]; then
    echo ""
    echo "创建标签 v1.0.0..."
    git tag -a v1.0.0 -m "Release v1.0.0 - 初始版本"
    git push origin v1.0.0
    echo "✅ Release 已创建"
    echo ""
    echo "📦 查看发布："
    echo "  https://github.com/humorousz/claude-code-book/releases"
    echo ""
    echo "⏳ GitHub Actions 正在生成 PDF（大约 3-5 分钟）..."
fi

echo ""
echo "🎉 部署完成！"
echo ""
echo "📚 访问您的书籍："
echo "  https://humorousz.github.io/claude-code-book/"
echo ""
echo "📊 查看 Actions 状态："
echo "  https://github.com/humorousz/claude-code-book/actions"
echo ""
