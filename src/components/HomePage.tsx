import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { projects, getCurrentProject } from '~/utils/projects'
import { getPendingProjects, savePendingProject, removePendingProject } from '~/utils/projectStorage'
import { AddProjectForm } from './AddProjectForm'

export function HomePage() {
  const [allProjects, setAllProjects] = useState(projects)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    const pending = getPendingProjects()
    const existingIds = new Set(projects.map((p) => p.id))
    const newProjects = pending.filter((p: any) => !existingIds.has(p.id))
    if (newProjects.length > 0) {
      setAllProjects([...projects, ...newProjects])
    }
  }, [])

  const handleProjectAdded = (newProject: any) => {
    setAllProjects([...allProjects, newProject])
    setShowAddForm(false)
  }

  const handleRemovePending = (projectId: string) => {
    if (confirm('Remove this pending project?')) {
      removePendingProject(projectId)
      setAllProjects(allProjects.filter((p) => p.id !== projectId))
    }
  }

  const currentProject = getCurrentProject()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Multi-Project Documentation
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Current Project: <strong>{currentProject.name}</strong>
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Available Projects</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add New Project'}
        </button>
      </div>

      {showAddForm && <AddProjectForm onProjectAdded={handleProjectAdded} />}

      {allProjects.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No projects yet. Create your first project above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allProjects.map((project) => {
            const isDefault = project.id === currentProject.id
            const isPending = !projects.some((p) => p.id === project.id)
            const docsPath = isDefault ? '/default/docs' : `/${project.id}/docs`
            const updatesPath = isDefault ? '/default/updates' : `/${project.id}/updates`

            return (
              <div
                key={project.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 ${
                  isDefault
                    ? 'border-blue-500'
                    : isPending
                    ? 'border-yellow-500 border-dashed'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {project.name}
                  </h3>
                  <div className="flex gap-2">
                    {isDefault && (
                      <span className="px-2 py-1 text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900 rounded">
                        Current
                      </span>
                    )}
                    {isPending && (
                      <span className="px-2 py-1 text-xs font-bold text-yellow-600 bg-yellow-100 dark:bg-yellow-900 rounded">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {project.description || 'Project documentation'}
                </p>

                {isPending && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm">
                    <strong>⚠️ Setup Required:</strong> Run the setup script and add to projects.config.ts
                    <button
                      onClick={() => handleRemovePending(project.id)}
                      className="mt-2 w-full px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    >
                      Remove Pending Project
                    </button>
                  </div>
                )}

                {!isPending ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      to={docsPath}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      View Docs
                    </Link>
                    <Link
                      to={updatesPath}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      View Updates
                    </Link>
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                    Complete setup to access
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
