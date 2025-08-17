import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { addSSEConnection, removeSSEConnection } from '@/lib/sse-utils'

export async function GET(request: NextRequest) {
  const session = await auth()
  const userId = session?.userId
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Store this connection
      addSSEConnection(userId, controller)

      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`)

      // Set up cleanup when connection closes
      request.signal.addEventListener('abort', () => {
        removeSSEConnection(userId, controller)
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}