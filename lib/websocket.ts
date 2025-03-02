import { sendToUser, broadcast } from '@/app/api/ws/route'

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