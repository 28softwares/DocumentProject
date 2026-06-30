export interface StoredProject {
  id: string
  name: string
  description: string
  createdAt: string
}

export function getPendingProjects(): StoredProject[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('pendingProjects')
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    return []
  }
}

export function savePendingProject(project: Omit<StoredProject, 'createdAt'>): void {
  if (typeof window === 'undefined') return
  const pending = getPendingProjects()
  const newProject: StoredProject = {
    ...project,
    createdAt: new Date().toISOString(),
  }
  if (!pending.some((p) => p.id === project.id)) {
    pending.push(newProject)
    localStorage.setItem('pendingProjects', JSON.stringify(pending))
  }
}

export function removePendingProject(projectId: string): void {
  if (typeof window === 'undefined') return
  const pending = getPendingProjects()
  const filtered = pending.filter((p) => p.id !== projectId)
  localStorage.setItem('pendingProjects', JSON.stringify(filtered))
}

export function clearPendingProjects(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('pendingProjects')
}
