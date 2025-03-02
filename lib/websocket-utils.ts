// Store active connections
const connections = new Map<string, any[]>()

// Function to send a message to a specific user
export function sendToUser(userId: string, message: any) {
  const userConnections = connections.get(userId)
  if (userConnections && userConnections.length > 0) {
    const data = JSON.stringify(message)
    userConnections.forEach((socket: any) => {
      if (socket.readyState === 1) { // OPEN
        try {
          socket.send(data)
        } catch (err) {
          console.error(`Error sending message to user ${userId}:`, err)
        }
      }
    })
  }
}

// Function to broadcast a message to all connections
export function broadcast(message: any) {
  const data = JSON.stringify(message)
  connections.forEach((userConnections, userId) => {
    userConnections.forEach((socket: any) => {
      if (socket.readyState === 1) { // OPEN
        try {
          socket.send(data)
        } catch (err) {
          console.error(`Error broadcasting to user ${userId}:`, err)
        }
      }
    })
  })
}

// Function to add a user connection
export function addConnection(userId: string, socket: any) {
  if (!connections.has(userId)) {
    connections.set(userId, [])
  }
  const userConnections = connections.get(userId)!
  if (!userConnections.includes(socket)) {
    userConnections.push(socket)
  }
  return true
}

// Function to remove a connection
export function removeConnection(userId: string | null, socket: any) {
  if (!userId) return false
  
  const userConnections = connections.get(userId)
  if (userConnections) {
    const index = userConnections.indexOf(socket)
    if (index !== -1) {
      userConnections.splice(index, 1)
    }
    
    // Remove user from connections map if no active connections
    if (userConnections.length === 0) {
      connections.delete(userId)
    }
    return true
  }
  return false
} 