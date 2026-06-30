import { useState } from 'react'
import { savePendingProject } from '~/utils/projectStorage'
import { projects } from '~/utils/projects'

interface ProjectFormData {
  id: string
  name: string
  description: string
}

interface AddProjectFormProps {
  onProjectAdded?: (project: ProjectFormData) => void
}

export function AddProjectForm({ onProjectAdded }: AddProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    id: '',
    name: '',
    description: '',
  })
  const [errors, setErrors] = useState<Partial<ProjectFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [generatedConfig, setGeneratedConfig] = useState<string>('')

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectFormData> = {}

    if (!formData.id.trim()) {
      newErrors.id = 'Project ID is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.id)) {
      newErrors.id = 'Project ID must contain only lowercase letters, numbers, and hyphens'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateConfigCode = (project: ProjectFormData): string => {
    return `  {
    id: "${project.id}",
    name: "${project.name.replace(/"/g, '\\"')}",
    ${project.description ? `description: "${project.description.replace(/"/g, '\\"')}",` : ''}
    docsPath: "projects/${project.id}/docs",
    updatesPath: "projects/${project.id}/updates",
  },`
  }

  const generateSetupScript = (project: ProjectFormData): string => {
    const escapedName = project.name.replace(/'/g, "'\\''")
    const escapedDesc = (project.description || 'Project documentation').replace(/'/g, "'\\''")

    return `#!/bin/bash
# Setup script for ${escapedName}
# Generated on $(date)

set -e

echo "Setting up project: ${escapedName}..."

mkdir -p projects/${project.id}/docs projects/${project.id}/updates

cat > projects/${project.id}/docs/intro.md << 'EOF'
---
sidebar_position: 1
---

# ${escapedName}

${escapedDesc}
EOF

cat > projects/${project.id}/updates/$(date +%Y-%m-%d)-welcome.md << 'EOF'
---
slug: welcome
title: Welcome to ${escapedName}
authors:
  - name: Admin
tags: [welcome]
---

Welcome to the ${escapedName} documentation!
EOF

if [ ! -f projects/${project.id}/updates/authors.yml ]; then
  cat > projects/${project.id}/updates/authors.yml << 'EOF'
admin:
  name: Admin
  title: Administrator
EOF
fi

if [ ! -f projects/${project.id}/updates/tags.yml ]; then
  cat > projects/${project.id}/updates/tags.yml << 'EOF'
welcome:
  label: Welcome
  permalink: /welcome
  description: Welcome posts
EOF
fi

echo ""
echo "✅ Project ${escapedName} setup complete!"
echo ""
echo "Next steps:"
echo "1. Add the project configuration to projects.config.ts"
echo "2. Restart the dev server: pnpm dev"
echo ""
`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    const configProjects = projects.map((p) => p.id)
    if (configProjects.includes(formData.id)) {
      setErrors({ id: 'A project with this ID already exists' })
      setIsSubmitting(false)
      return
    }

    savePendingProject(formData)
    const config = generateConfigCode(formData)
    setGeneratedConfig(config)

    const script = generateSetupScript(formData)
    const blob = new Blob([script], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `setup-${formData.id}.sh`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setShowSuccess(true)
    setIsSubmitting(false)

    if (onProjectAdded) {
      onProjectAdded(formData)
    }

    setTimeout(() => {
      setFormData({ id: '', name: '', description: '' })
      setShowSuccess(false)
      setGeneratedConfig('')
    }, 5000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!')
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Project</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="project-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project ID <span className="text-red-500">*</span>
            <small className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
              Lowercase letters, numbers, and hyphens only (e.g., "my-project")
            </small>
          </label>
          <input
            type="text"
            id="project-id"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase() })}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.id
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="my-project"
            required
          />
          {errors.id && <span className="text-sm text-red-500">{errors.id}</span>}
        </div>

        <div>
          <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="project-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.name
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="My Awesome Project"
            required
          />
          {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
        </div>

        <div>
          <label
            htmlFor="project-description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Description (optional)
          </label>
          <textarea
            id="project-description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Brief description of the project"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </button>
      </form>

      {showSuccess && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
          <h4 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
            ✅ Project Created Successfully!
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            A setup script has been downloaded. Follow these steps:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>
              Run: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">bash setup-{formData.id}.sh</code>
            </li>
            <li>
              Add this to <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">projects.config.ts</code>:
              <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <pre className="text-xs overflow-x-auto">{generatedConfig}</pre>
                <button
                  onClick={() => copyToClipboard(generatedConfig)}
                  className="mt-2 px-3 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  📋 Copy Config
                </button>
              </div>
            </li>
            <li>Restart the dev server: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">pnpm dev</code></li>
          </ol>
        </div>
      )}
    </div>
  )
}
