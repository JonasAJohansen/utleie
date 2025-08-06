// Store active SSE connections
const connections = new Map<string, ReadableStreamDefaultController[]>()

// Function to add SSE connection
export function addSSEConnection(userId: string, controller: ReadableStreamDefaultController) {
  if (!connections.has(userId)) {
    connections.set(userId, [])
  }
  connections.get(userId)?.push(controller)
}

// Function to remove SSE connection
export function removeSSEConnection(userId: string, controller: ReadableStreamDefaultController) {
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

// Function to get connection count for debugging
export function getSSEConnectionCount(userId?: string): number {
  if (userId) {
    return connections.get(userId)?.length || 0
  }
  let total = 0
  connections.forEach(userConnections => {
    total += userConnections.length
  })
  return total
}