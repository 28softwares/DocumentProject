import { useParams, Link } from '@tanstack/react-router'
import { getProjectById, getDefaultProject } from '~/utils/projects'
import { getMarkdownFiles } from '~/lib/markdown.server'
import { join } from 'path'

export function UpdatesPage() {
  const { projectId } = useParams({ from: '/$projectId/updates' })
  const project = getProjectById(projectId) || getDefaultProject()
  const updatesPath = join(process.cwd(), project.updatesPath)
  const files = getMarkdownFiles(updatesPath)

  // Sort by date (newest first)
  const sortedFiles = files.sort((a, b) => {
    const dateA = a.data.date ? new Date(a.data.date).getTime() : 0
    const dateB = b.data.date ? new Date(b.data.date).getTime() : 0
    return dateB - dateA
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {project.name} Updates
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Latest updates and announcements for {project.name}
        </p>
      </div>

      <div className="space-y-6">
        {sortedFiles.length > 0 ? (
          sortedFiles.map((file) => {
            const href = `/${projectId}/updates/${file.slug}`
            const date = file.data.date
              ? new Date(file.data.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : ''

            return (
              <article
                key={file.slug}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <Link to={href}>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                    {file.data.title || file.slug}
                  </h2>
                </Link>
                {date && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{date}</p>
                )}
                {file.data.tags && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {file.data.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {file.content && (
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                    {file.content.substring(0, 200)}...
                  </p>
                )}
                <Link
                  to={href}
                  className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Read more →
                </Link>
              </article>
            )
          })
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No updates available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
