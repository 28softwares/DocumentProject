import { useParams, Link } from '@tanstack/react-router'
import { getProjectById, getDefaultProject } from '~/utils/projects'
import { parseMarkdown } from '~/lib/markdown.server'
import { join } from 'path'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github-dark.css'

export function UpdatePage() {
  const { projectId, slug } = useParams({ from: '/$projectId/updates/$slug' })
  const project = getProjectById(projectId) || getDefaultProject()
  const updatesPath = join(process.cwd(), project.updatesPath)

  // Try to find the file - it might have a date prefix
  let file
  let filePath
  try {
    // First try exact match
    filePath = join(updatesPath, `${slug}.md`)
    file = parseMarkdown(filePath)
  } catch {
    // Try to find by slug in filename
    try {
      const { readdirSync, existsSync } = require('fs')
      if (!existsSync(updatesPath)) {
        throw new Error('Directory not found')
      }
      const files = readdirSync(updatesPath)
      const matchingFile = files.find((f: string) => f.includes(slug) && f.endsWith('.md'))
      if (matchingFile) {
        filePath = join(updatesPath, matchingFile)
        file = parseMarkdown(filePath)
      } else {
        throw new Error('File not found')
      }
    } catch (error) {
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h1 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-2">Update Not Found</h1>
            <p className="text-red-600 dark:text-red-400">
              The update "{slug}" could not be found in {project.name}.
            </p>
          </div>
        </div>
      )
    }
  }

  const date = file.data.date
    ? new Date(file.data.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to={`/${projectId}/updates`}
        className="inline-block mb-4 text-blue-600 dark:text-blue-400 hover:underline"
      >
        ← Back to Updates
      </Link>

      <article className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {file.data.title || slug}
        </h1>
        {date && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{date}</p>
        )}
        {file.data.tags && (
          <div className="flex flex-wrap gap-2 mb-6">
            {file.data.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
        >
          {file.content}
        </ReactMarkdown>
      </article>
    </div>
  )
}
