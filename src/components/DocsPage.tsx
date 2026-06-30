import { useParams, Link } from '@tanstack/react-router'
import { getProjectById, getDefaultProject } from '~/utils/projects'
import { getMarkdownFiles } from '~/lib/markdown.server'
import { join } from 'path'

export function DocsPage() {
  const { projectId } = useParams({ from: '/$projectId/docs' })
  const project = getProjectById(projectId) || getDefaultProject()
  const docsPath = join(process.cwd(), project.docsPath)
  const files = getMarkdownFiles(docsPath)

  // Sort by sidebar_position if available
  const sortedFiles = files.sort((a, b) => {
    const posA = a.data.sidebar_position || 999
    const posB = b.data.sidebar_position || 999
    return posA - posB
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <nav className="sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documentation</h2>
            <ul className="space-y-2">
              {sortedFiles.map((file) => {
                const href = `/${projectId}/docs/${file.slug}`
                return (
                  <li key={file.slug}>
                    <Link
                      to={href}
                      className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      {file.data.title || file.slug}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>
        <main className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {project.name} Documentation
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {project.description || 'Select a document from the sidebar to get started.'}
            </p>
            {sortedFiles.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Available Documents</h2>
                <ul className="list-disc list-inside space-y-2">
                  {sortedFiles.map((file) => {
                    const href = `/${projectId}/docs/${file.slug}`
                    return (
                      <li key={file.slug}>
                        <Link
                          to={href}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {file.data.title || file.slug}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No documents available yet.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
