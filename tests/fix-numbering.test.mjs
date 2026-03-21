import { ChapterNumberingFixer } from '../scripts/fix-numbering.mjs'
import fs from 'fs'
import path from 'path'

describe('ChapterNumberingFixer', () => {
  let fixer

  beforeEach(() => {
    fixer = new ChapterNumberingFixer()
  })

  test('extractChapterNumber should extract chapter number from filename', () => {
    expect(fixer.extractChapterNumber('chapter-01.md')).toBe(1)
    expect(fixer.extractChapterNumber('chapter-05.md')).toBe(5)
    expect(fixer.extractChapterNumber('chapter-10.md')).toBe(10)
    expect(fixer.extractChapterNumber('preface.md')).toBeNull()
  })

  test('extractHeadings should extract all headings with numbers', () => {
    const content = `# 第5章 标题

## 5.1 第一节
### 5.1.1 小节
### 4.1.1 错误小节

## 5.2 第二节
`

    const headings = fixer.extractHeadings(content)

    expect(headings).toHaveLength(4)
    expect(headings[0]).toEqual({
      level: 2,
      number: '5.1',
      text: '第一节',
      line: 3
    })
    expect(headings[2].number).toBe('4.1.1')
  })

  test('fixNumber should correct chapter prefix', () => {
    expect(fixer.fixNumber('4.1.1', 5)).toBe('5.1.1')
    expect(fixer.fixNumber('5.1.1', 6)).toBe('6.1.1')
    expect(fixer.fixNumber('3.2', 7)).toBe('7.2')
  })

  test('validateAndFix should detect errors', () => {
    // 创建测试文件
    const testDir = './test-temp'
    fs.mkdirSync(testDir, { recursive: true })

    const testFile = path.join(testDir, 'chapter-05.md')
    const content = `# 第5章 标题

## 4.1 错误节
### 4.1.1 错误小节

## 5.2 正确节
`
    fs.writeFileSync(testFile, content)

    // 运行修复
    fixer.chapters.set(5, {
      file: testFile,
      headings: fixer.extractHeadings(content)
    })

    fixer.validateAndFix()

    expect(fixer.errors).toHaveLength(2)
    expect(fixer.fixes).toHaveLength(2)

    // 清理
    fs.rmSync(testDir, { recursive: true })
  })
})
