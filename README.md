# Multi-Project Documentation System

A modern multi-project documentation system built with TanStack Start.

## Features

- **Multi-Project Support**: Manage documentation for multiple projects independently
- **Project Switcher**: Easy navigation between projects
- **Markdown Support**: Full markdown rendering with syntax highlighting
- **Updates/Blog**: Each project has its own updates section
- **Project Management UI**: Add new projects directly from the homepage
- **Dark Mode**: Built-in dark mode support

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Building

```bash
pnpm build
```

### Production

```bash
pnpm start
```

## Project Structure

```
projects/
  └── default/
      ├── docs/          # Documentation files
      └── updates/       # Update/blog posts
```

## Adding a New Project

1. Click "Add New Project" on the homepage
2. Fill in the project details (ID, name, description)
3. Run the downloaded setup script
4. Add the project configuration to `projects.config.ts`
5. Restart the dev server

## Configuration

Projects are configured in `projects.config.ts`:

```typescript
{
  id: "my-project",
  name: "My Project",
  description: "Project description",
  docsPath: "projects/my-project/docs",
  updatesPath: "projects/my-project/updates",
}
```

## Tech Stack

- **TanStack Start**: Full-stack React framework
- **TanStack Router**: Type-safe routing
- **React Markdown**: Markdown rendering
- **Tailwind CSS**: Styling (via classes)

## License

MIT
