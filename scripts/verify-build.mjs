#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

class BuildVerifier {
  constructor() {
    this.errors = []
    this.warnings = []
  }

  verify() {
    console.log(chalk.blue('🔍 验证构建结果...\n'))

    this.checkDistDirectory()
    this.checkChapters()
    this.checkAssets()
    this.checkPDFOutput()

    this.printResults()

    return this.errors.length === 0
  }

  checkDistDirectory() {
    const distDir = 'docs/.vitepress/dist'

    if (!fs.existsSync(distDir)) {
      this.errors.push('dist 目录不存在')
      return
    }

    const files = fs.readdirSync(distDir)
    if (files.length === 0) {
      this.errors.push('dist 目录为空')
    }

    console.log(chalk.gray(`  ✓ dist 目录存在 (${files.length} 个文件)`))
  }

  checkChapters() {
    const parts = ['part-1', 'part-2', 'appendices']

    for (const part of parts) {
      const srcDir = path.join('docs', part)
      const distDir = path.join('docs/.vitepress/dist', part)

      if (!fs.existsSync(srcDir)) {
        this.warnings.push(`源目录不存在: ${srcDir}`)
        continue
      }

      const srcFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.md'))

      if (!fs.existsSync(distDir)) {
        this.errors.push(`构建输出目录不存在: ${distDir}`)
        continue
      }

      const distFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.html'))

      if (srcFiles.length !== distFiles.length) {
        this.warnings.push(
          `${part}: 源文件 (${srcFiles.length}) 与 HTML 文件 (${distFiles.length}) 数量不匹配`
        )
      }

      console.log(chalk.gray(`  ✓ ${part}: ${srcFiles.length} 章节`))
    }
  }

  checkAssets() {
    const assetsDir = 'docs/.vitepress/dist/assets'

    if (!fs.existsSync(assetsDir)) {
      this.warnings.push('assets 目录不存在')
      return
    }

    const files = fs.readdirSync(assetsDir)
    console.log(chalk.gray(`  ✓ assets 目录存在 (${files.length} 个文件)`))
  }

  checkPDFOutput() {
    const pdfDir = 'pdf-output'

    if (!fs.existsSync(pdfDir)) {
      console.log(chalk.gray(`  ⚠ pdf-output 目录不存在`))
      return
    }

    const pdfFiles = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'))

    if (pdfFiles.length === 0) {
      console.log(chalk.gray(`  ⚠ 没有找到 PDF 文件`))
      return
    }

    const pdfFile = path.join(pdfDir, pdfFiles[0])
    const stats = fs.statSync(pdfFile)
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2)

    console.log(chalk.gray(`  ✓ PDF 文件存在 (${sizeMB} MB)`))
  }

  printResults() {
    console.log()

    if (this.errors.length > 0) {
      console.log(chalk.red('❌ 发现错误:\n'))
      for (const error of this.errors) {
        console.log(chalk.red(`  • ${error}`))
      }
      console.log()
    }

    if (this.warnings.length > 0) {
      console.log(chalk.yellow('⚠️  警告:\n'))
      for (const warning of this.warnings) {
        console.log(chalk.yellow(`  • ${warning}`))
      }
      console.log()
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log(chalk.green('✅ 所有检查通过!\n'))
    }
  }
}

function main() {
  const verifier = new BuildVerifier()
  const success = verifier.verify()
  process.exit(success ? 0 : 1)
}

main()
