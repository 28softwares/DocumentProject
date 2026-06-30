import { createFileRoute } from '@tanstack/react-router'
import { UpdatePage } from '~/components/UpdatePage'

export const Route = createFileRoute('/$projectId/updates/$slug')({
  component: UpdatePage,
})
