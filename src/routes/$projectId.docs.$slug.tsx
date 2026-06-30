import { createFileRoute } from '@tanstack/react-router'
import { DocPage } from '~/components/DocPage'

export const Route = createFileRoute('/$projectId/docs/$slug')({
  component: DocPage,
})
