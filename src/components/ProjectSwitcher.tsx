import { useState, useEffect } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { projects, getProjectById, getDefaultProject } from '~/utils/projects'

export function ProjectSwitcher() {
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedProject')
      if (stored && getProjectById(stored)) {
        return stored
      }
    }
    return getDefaultProject().id
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedProject', currentProjectId)
    }
  }, [currentProjectId])

  const handleProjectChange = (projectId: string) => {
    setCurrentProjectId(projectId)
    const project = getProjectById(projectId)
    if (!project) return

    const currentPath = window.location.pathname
    const isDefault = projectId === getDefaultProject().id
    const basePath = isDefault ? '' : `/${projectId}`

    if (currentPath.includes('/docs')) {
      navigate({ to: `/${projectId}/docs` })
    } else if (currentPath.includes('/updates')) {
      navigate({ to: `/${projectId}/updates` })
    } else {
      navigate({ to: '/' })
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="project-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Project:
      </label>
      <select
        id="project-select"
        value={currentProjectId}
        onChange={(e) => handleProjectChange(e.target.value)}
        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </div>
  )
}
