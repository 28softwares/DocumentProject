import { renderToStream } from '@tanstack/react-start/server'
import { getRouter } from './router'
import { getRouterManifest } from '@tanstack/react-start/router-manifest'

export default async function requestHandler(request: Request) {
  const router = getRouter()
  const manifest = getRouterManifest()

  const stream = await renderToStream({
    request,
    router,
    manifest,
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
