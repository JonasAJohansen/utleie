// Set of active connections
const connections = new Map<string, any[]>()

/**
 * Send a message to a specific user via WebSocket
 */
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

/**
 * Broadcast a message to all connected users
 */
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

/**
 * Add a connection to the connections map
 */
export function addConnection(userId: string, socket: any) {
  if (!connections.has(userId)) {
    connections.set(userId, [])
  }
  const userConnections = connections.get(userId)!
  if (!userConnections.includes(socket)) {
    userConnections.push(socket)
  }
  return userConnections
}

/**
 * Remove a connection from the connections map
 */
export function removeConnection(userId: string, socket: any) {
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
  }
}

// Send a notification to a specific user
export function sendNotification(userId: string, data: any) {
  sendToUser(userId, {
    type: 'notification',
    data
  })
}

// Send a message to a specific user
export function sendMessage(userId: string, data: any) {
  sendToUser(userId, {
    type: 'message',
    data
  })
}

// Send a message read event to a specific user
export function sendMessageRead(userId: string, data: any) {
  sendToUser(userId, {
    type: 'message_read',
    data
  })
}

// Broadcast a message to all connected clients
export function broadcastMessage(type: string, data: any) {
  broadcast({
    type,
    data
  })
} 