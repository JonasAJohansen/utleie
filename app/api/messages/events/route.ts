import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

// Store active SSE connections
const connections = new Map<string, ReadableStreamDefaultController[]>()

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
      if (!connections.has(userId)) {
        connections.set(userId, [])
      }
      connections.get(userId)?.push(controller)

      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`)

      // Set up cleanup when connection closes
      request.signal.addEventListener('abort', () => {
        const userConnections = connections.get(userId)
        if (userConnections) {
          const index = userConnections.indexOf(controller)
          if (index > -1) {
            userConnections.splice(index, 1)
          }
          if (userConnections.length === 0) {
            connections.delete(userId)
          }
        }
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

// Function to send message to a specific user via SSE
export function sendSSEMessage(userId: string, message: any) {
  const userConnections = connections.get(userId)
  if (!userConnections || userConnections.length === 0) {
    return false
  }

  const data = `data: ${JSON.stringify(message)}\n\n`
  
  userConnections.forEach((controller, index) => {
    try {
      controller.enqueue(data)
    } catch (error) {
      console.error(`Error sending SSE message to user ${userId}:`, error)
      // Remove broken connection
      userConnections.splice(index, 1)
    }
  })

  return true
}