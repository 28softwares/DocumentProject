import { createFileRoute } from '@tanstack/react-router'
import { UpdatesPage } from '~/components/UpdatesPage'

export const Route = createFileRoute('/$projectId/updates')({
  component: UpdatesPage,
})
