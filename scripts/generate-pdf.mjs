#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { PDFDocument } from 'pdf-lib'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

class BookPDFGenerator {
  constructor() {
    this.browser = null
    this.serverProcess = null
    this.baseUrl = 'http://localhost:4173'
  }

  async startServer() {
    console.log(chalk.blue('🚀 启动预览服务器...\n'))

    return new Promise((resolve, reject) => {
      this.serverProcess = spawn('npm', ['run', 'preview'], {
        stdio: 'pipe',
        shell: true
      })

      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString()
        if (output.includes('Local:')) {
          console.log(chalk.gray(`  ${output.trim()}`))
          setTimeout(resolve, 2000)
        }
      })

      this.serverProcess.stderr.on('data', (data) => {
        console.error(chalk.red(`  ${data.toString()}`))
      })

      this.serverProcess.on('error', reject)
      setTimeout(() => reject(new Error('服务器启动超时')), 30000)
    })
  }

  async launchBrowser() {
    console.log(chalk.blue('🌐 启动浏览器...\n'))

    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    })
  }

  async getAllChapterUrls() {
    const urls = [`${this.baseUrl}/`]
    const parts = ['part-1', 'part-2', 'appendices']

    for (const part of parts) {
      const dir = path.join('docs', part)
      if (!fs.existsSync(dir)) continue

      const files = fs.readdirSync(dir)
        .filter(f => f.endsWith('.md') && (f.startsWith('chapter') || f.startsWith('appendix')))
        .sort()

      for (const file of files) {
        const chapterPath = `/${part}/${file.replace('.md', '')}`
        urls.push(`${this.baseUrl}${chapterPath}`)
      }
    }

    console.log(chalk.blue(`📄 准备生成 ${urls.length} 个页面\n`))
    return urls
  }

  async generatePDF() {
    const page = await this.browser.newPage()
    await page.emulateMediaType('print')

    const chapters = await this.getAllChapterUrls()
    const pdfBuffers = []

    for (let i = 0; i < chapters.length; i++) {
      const chapterUrl = chapters[i]
      console.log(chalk.gray(`  [${i + 1}/${chapters.length}] 处理: ${chapterUrl}`))

      try {
        await page.goto(chapterUrl, { waitUntil: 'networkidle0', timeout: 60000 })
        await page.waitForSelector('.vp-doc', { timeout: 10000 })

        const pdfBuffer = await page.pdf({
          format: 'A4',
          margin: { top: '20mm', bottom: '25mm', left: '15mm', right: '15mm' },
          printBackground: true,
          preferCSSPageSize: true,
          headerTemplate: `<div style="font-size: 10px; text-align: center; width: 100%; color: #666; padding: 5px;">Claude Code 实战工作流指南</div>`,
          footerTemplate: `<div style="font-size: 10px; text-align: center; width: 100%; color: #666; padding: 5px;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`
        })

        pdfBuffers.push(pdfBuffer)
      } catch (error) {
        console.error(chalk.red(`    ❌ 失败: ${error.message}`))
      }
    }

    console.log()
    return pdfBuffers
  }

  async mergePDFs(pdfBuffers, outputPath) {
    console.log(chalk.blue('📖 合并 PDF 文件...\n'))

    const mergedPdf = await PDFDocument.create()

    for (let i = 0; i < pdfBuffers.length; i++) {
      const pdfDoc = await PDFDocument.load(pdfBuffers[i])
      const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
      pages.forEach(page => mergedPdf.addPage(page))
      console.log(chalk.gray(`  合并第 ${i + 1} 个文件 (${pages.length} 页)`))
    }

    const pdfBytes = await mergedPdf.save()
    fs.writeFileSync(outputPath, pdfBytes)

    const stats = fs.statSync(outputPath)
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2)

    console.log()
    console.log(chalk.green(`✅ PDF 生成成功!\n`))
    console.log(chalk.blue(`📄 输出文件: ${outputPath}`))
    console.log(chalk.blue(`📊 文件大小: ${sizeMB} MB\n`))
  }

  async cleanup() {
    console.log(chalk.gray('🧹 清理资源...\n'))
    if (this.browser) await this.browser.close()
    if (this.serverProcess) this.serverProcess.kill()
  }

  async run() {
    try {
      await this.startServer()
      await this.launchBrowser()
      const pdfBuffers = await this.generatePDF()

      if (pdfBuffers.length === 0) {
        throw new Error('没有生成任何 PDF 页面')
      }

      await this.mergePDFs(pdfBuffers, 'pdf-output/Claude-Code-实战工作流指南.pdf')
    } catch (error) {
      console.error(chalk.red(`\n❌ 错误: ${error.message}\n`))
      throw error
    } finally {
      await this.cleanup()
    }
  }
}

async function main() {
  console.log(chalk.blue.bold('\n📚 Claude Code 实战工作流指南 - PDF 生成器\n'))
  const generator = new BookPDFGenerator()
  await generator.run()
}

main().catch(error => {
  console.error(chalk.red(error.stack))
  process.exit(1)
})
