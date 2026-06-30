export interface Project {
  id: string;
  name: string;
  description?: string;
  docsPath: string;
  updatesPath: string;
}

export const projects: Project[] = [
  {
    id: "default",
    name: "Default Project",
    description: "Default project documentation",
    docsPath: "projects/default/docs",
    updatesPath: "projects/default/updates",
  },
];

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function getDefaultProject(): Project {
  return projects[0];
}
