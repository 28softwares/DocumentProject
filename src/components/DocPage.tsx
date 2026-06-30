import { useParams } from '@tanstack/react-router'
import { getProjectById, getDefaultProject } from '~/utils/projects'
import { parseMarkdown } from '~/lib/markdown.server'
import { join } from 'path'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github-dark.css'

export function DocPage() {
  const { projectId, slug } = useParams({ from: '/$projectId/docs/$slug' })
  const project = getProjectById(projectId) || getDefaultProject()
  const filePath = join(process.cwd(), project.docsPath, `${slug}.md`)

  let file
  try {
    file = parseMarkdown(filePath)
  } catch (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h1 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-2">Document Not Found</h1>
          <p className="text-red-600 dark:text-red-400">
            The document "{slug}" could not be found in {project.name}.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {file.data.title || slug}
        </h1>
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
