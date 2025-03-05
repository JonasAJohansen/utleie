import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { addConnection, removeConnection } from '@/lib/websocket'

// Handle WebSocket connection
export async function GET(request: NextRequest) {
  // This is necessary to tell Next.js this is a WebSocket endpoint
  if (!request.body) {
    return new Response('WebSocket endpoint', { status: 200 })
  }

  try {
    // Use native Fetch API Response and Request for WebSockets
    // @ts-expect-error - NextRequest does have a socket property in Edge Runtime
    const { socket, response } = request

    // Early return if WebSockets are not supported
    if (!socket) {
      console.error('WebSockets not supported')
      return new Response('WebSockets not supported', { status: 500 })
    }

    // Accept the WebSocket connection
    socket.accept()

    // Set up a ping interval
    const pingInterval = setInterval(() => {
      try {
        if (socket.readyState === 1) { // OPEN
          socket.send(JSON.stringify({ type: 'ping' }))
        }
      } catch (err) {
        console.error('Error sending ping:', err)
        clearInterval(pingInterval)
      }
    }, 30000)

    // Set up authentication
    let userId: string | null = null
    
    // When a message is received
    socket.on('message', async (data: any) => {
      try {
        const message = JSON.parse(data.toString())
        
        // Handle authentication check
        if (message.type === 'auth_check') {
          const auth = await getAuth(request)
          userId = auth.userId
          
          // Store the connection in the user's connections array
          if (userId) {
            addConnection(userId, socket)
            
            try {
              socket.send(JSON.stringify({ 
                type: 'auth_success', 
                data: { userId } 
              }))
            } catch (err) {
              console.error('Error sending auth success:', err)
            }
          } else {
            try {
              socket.send(JSON.stringify({ 
                type: 'auth_failed',
                data: { message: 'Not authenticated' } 
              }))
            } catch (err) {
              console.error('Error sending auth failed:', err)
            }
          }
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err)
      }
    })

    // Handle close event
    socket.on('close', () => {
      clearInterval(pingInterval)
      
      // Remove the socket from connections
      if (userId) {
        removeConnection(userId, socket)
      }
    })

    return response
  } catch (err) {
    console.error('WebSocket setup error:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
} 