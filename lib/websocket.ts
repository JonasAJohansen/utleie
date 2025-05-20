// Set of active connections
const connections = new Map<string, any[]>()

/**
 * Send a message to a specific user via WebSocket
 */
export function sendToUser(userId: string, message: any) {
  if (!userId) {
    console.warn('Cannot send message to empty userId')
    return false
  }

  const userConnections = connections.get(userId)
  if (!userConnections || userConnections.length === 0) {
    // User not connected or no active connections
    return false
  }

  try {
    const data = JSON.stringify(message)
    let successCount = 0
    let failCount = 0

    userConnections.forEach((socket: any) => {
      if (!socket) return
      
      if (socket.readyState === 1) { // OPEN
        try {
          socket.send(data)
          successCount++
        } catch (err) {
          console.error(`Error sending message to user ${userId}:`, err)
          failCount++
        }
      }
    })
    
    return successCount > 0
  } catch (error) {
    console.error(`Error preparing message for user ${userId}:`, error)
    return false
  }
}

/**
 * Broadcast a message to all connected users
 */
export function broadcast(message: any) {
  if (!message) {
    console.warn('Cannot broadcast empty message')
    return false
  }
  
  try {
    const data = JSON.stringify(message)
    let successCount = 0
    
    connections.forEach((userConnections, userId) => {
      if (!userConnections || !Array.isArray(userConnections)) return
      
      userConnections.forEach((socket: any) => {
        if (!socket) return
        
        if (socket.readyState === 1) { // OPEN
          try {
            socket.send(data)
            successCount++
          } catch (err) {
            console.error(`Error broadcasting to user ${userId}:`, err)
          }
        }
      })
    })
    
    return successCount > 0
  } catch (error) {
    console.error('Error preparing broadcast message:', error)
    return false
  }
}

/**
 * Add a connection to the connections map
 */
export function addConnection(userId: string, socket: any) {
  if (!userId || !socket) {
    console.warn('Cannot add connection with empty userId or socket')
    return null
  }
  
  if (!connections.has(userId)) {
    connections.set(userId, [])
  }
  
  const userConnections = connections.get(userId)
  if (!userConnections) {
    console.error(`Failed to get connections for user ${userId}`)
    return null
  }
  
  if (!userConnections.includes(socket)) {
    userConnections.push(socket)
  }
  
  return userConnections
}

/**
 * Remove a connection from the connections map
 */
export function removeConnection(userId: string, socket: any) {
  if (!userId || !socket) {
    console.warn('Cannot remove connection with empty userId or socket')
    return false
  }
  
  const userConnections = connections.get(userId)
  if (!userConnections || !Array.isArray(userConnections)) {
    return false
  }
  
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

// Send a notification to a specific user
export function sendNotification(userId: string, data: any) {
  if (!userId || !data) {
    console.warn('Cannot send notification with empty userId or data')
    return false
  }
  
  return sendToUser(userId, {
    type: 'notification',
    data
  })
}

// Send a message to a specific user
export function sendMessage(userId: string, data: any) {
  if (!userId || !data) {
    console.warn('Cannot send message with empty userId or data')
    return false
  }
  
  return sendToUser(userId, {
    type: 'message',
    data
  })
}

// Send a message read event to a specific user
export function sendMessageRead(userId: string, data: any) {
  if (!userId || !data) {
    console.warn('Cannot send read notification with empty userId or data')
    return false
  }
  
  return sendToUser(userId, {
    type: 'message_read',
    data
  })
}

// Broadcast a message to all connected clients
export function broadcastMessage(type: string, data: any) {
  if (!type) {
    console.warn('Cannot broadcast message with empty type')
    return false
  }
  
  return broadcast({
    type,
    data: data || {}
  })
} 