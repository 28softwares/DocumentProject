import matter from 'gray-matter'
import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'

export interface MarkdownFile {
  content: string
  data: Record<string, any>
  slug: string
}

export function parseMarkdown(filePath: string): MarkdownFile {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }
  const fileContent = readFileSync(filePath, 'utf-8')
  const { content, data } = matter(fileContent)
  const slug = filePath.split('/').pop()?.replace(/\.md$/, '') || ''
  
  return {
    content,
    data,
    slug,
  }
}

export function getMarkdownFiles(dirPath: string): MarkdownFile[] {
  if (!existsSync(dirPath)) {
    return []
  }
  
  try {
    const files: MarkdownFile[] = []
    const items = readdirSync(dirPath)
    
    for (const item of items) {
      const fullPath = join(dirPath, item)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        files.push(...getMarkdownFiles(fullPath))
      } else if (item.endsWith('.md') && !item.startsWith('_')) {
        files.push(parseMarkdown(fullPath))
      }
    }
    
    return files
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
    return []
  }
}
