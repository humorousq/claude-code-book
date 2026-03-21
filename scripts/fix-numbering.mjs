#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import pkg from 'fast-glob'
const { glob } = pkg
import chalk from 'chalk'

export class ChapterNumberingFixer {
  constructor() {
    this.chapters = new Map()
    this.errors = []
    this.fixes = []
  }

  async scanChapters(docsDir = 'docs') {
    const pattern = `${docsDir}/**/chapter-*.md`
    const files = await glob(pattern)

    console.log(chalk.blue(`📖 找到 ${files.length} 个章节文件\n`))

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8')
      const chapterNum = this.extractChapterNumber(file)

      if (chapterNum !== null) {
        const headings = this.extractHeadings(content)
        this.chapters.set(chapterNum, { file, headings })
        console.log(chalk.gray(`  扫描: ${path.basename(file)} - 找到 ${headings.length} 个标题`))
      }
    }

    console.log()
  }

  extractChapterNumber(filename) {
    const match = filename.match(/chapter-(\d+)/)
    return match ? parseInt(match[1]) : null
  }

  extractHeadings(content) {
    const regex = /^(#{2,4})\s+(\d+\.[\d.]+)?\s*(.+)$/gm
    const headings = []

    let match
    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length
      headings.push({
        level: match[1].length,
        number: match[2],
        text: match[3],
        line: lineNumber
      })
    }

    return headings
  }

  validateAndFix() {
    console.log(chalk.blue('🔍 验证章节编号...\n'))

    for (const [chapterNum, data] of this.chapters) {
      const expectedPrefix = `${chapterNum}.`

      for (const heading of data.headings) {
        if (!heading.number) continue

        if (!heading.number.startsWith(expectedPrefix)) {
          this.errors.push({
            file: data.file,
            line: heading.line,
            expected: `${expectedPrefix}*`,
            actual: heading.number,
            text: heading.text
          })

          const correctNumber = this.fixNumber(heading.number, chapterNum)
          this.fixes.push({
            file: data.file,
            line: heading.line,
            from: heading.number,
            to: correctNumber
          })
        }
      }
    }
  }

  fixNumber(wrongNumber, correctChapter) {
    const parts = wrongNumber.split('.')
    parts[0] = correctChapter.toString()
    return parts.join('.')
  }

  applyFixes(dryRun = false) {
    if (this.fixes.length === 0) {
      console.log(chalk.green('✅ 没有需要修复的章节编号\n'))
      return
    }

    console.log(chalk.yellow(`🔧 ${dryRun ? '预览' : '应用'}修复...\n`))

    const fileFixes = new Map()

    for (const fix of this.fixes) {
      if (!fileFixes.has(fix.file)) {
        fileFixes.set(fix.file, [])
      }
      fileFixes.get(fix.file).push(fix)
    }

    for (const [file, fixes] of fileFixes) {
      if (!dryRun) {
        const content = fs.readFileSync(file, 'utf-8')
        const lines = content.split('\n')

        for (const fix of fixes) {
          const oldLine = lines[fix.line - 1]
          lines[fix.line - 1] = oldLine.replace(fix.from, fix.to)
        }

        fs.writeFileSync(file, lines.join('\n'))
      }

      console.log(chalk.gray(`  ${dryRun ? '将修复' : '已修复'}: ${path.basename(file)}`))
      for (const fix of fixes) {
        console.log(chalk.gray(`    第 ${fix.line} 行: ${fix.from} → ${fix.to}`))
      }
    }

    console.log()
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalChapters: this.chapters.size,
      errorsFound: this.errors.length,
      fixesApplied: this.fixes.length,
      details: {
        errors: this.errors.map(e => ({
          file: e.file,
          line: e.line,
          expected: e.expected,
          actual: e.actual,
          text: e.text
        })),
        fixes: this.fixes.map(f => ({
          file: f.file,
          line: f.line,
          from: f.from,
          to: f.to
        }))
      }
    }

    return report
  }

  printSummary() {
    console.log(chalk.blue('📊 修复统计\n'))
    console.log(`  章节总数: ${this.chapters.size}`)
    console.log(`  发现错误: ${chalk.red(this.errors.length)}`)
    console.log(`  已修复: ${chalk.green(this.fixes.length)}\n`)

    if (this.errors.length > 0) {
      console.log(chalk.yellow('错误详情:\n'))
      for (const error of this.errors) {
        console.log(chalk.red(`  ❌ ${path.basename(error.file)}:${error.line}`))
        console.log(`     期望: ${error.expected}`)
        console.log(`     实际: ${error.actual}`)
        console.log(`     标题: ${error.text}\n`)
      }
    }
  }
}

// 主程序
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  const fixer = new ChapterNumberingFixer()

  await fixer.scanChapters()
  fixer.validateAndFix()
  fixer.printSummary()

  if (!dryRun) {
    fixer.applyFixes()

    // 保存报告
    const report = fixer.generateReport()
    fs.writeFileSync('fix-report.json', JSON.stringify(report, null, 2))
    console.log(chalk.blue('📄 修复报告已保存到 fix-report.json\n'))
  } else {
    console.log(chalk.gray('💡 使用 --dry-run 查看修复预览，不应用修改\n'))
    fixer.applyFixes(true)
  }
}

main().catch(console.error)
