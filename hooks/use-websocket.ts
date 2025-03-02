import { useState, useEffect, useRef, useCallback } from 'react'
import Pusher from 'pusher-js'

type WebSocketEvent = {
  type: string
  data: any
}

interface UseWebSocketOptions {
  userId?: string | null
  onMessage?: (event: WebSocketEvent) => void
  onNotification?: (event: WebSocketEvent) => void
  channels: string[]
  enabled?: boolean
}

export function useWebSocket({
  userId,
  onMessage,
  onNotification,
  channels,
  enabled = true
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null)
  const pusherRef = useRef<Pusher | null>(null)
  
  const connect = useCallback(() => {
    if (!userId || !enabled) return
    
    try {
      if (pusherRef.current) {
        // Already connected, clean up first
        pusherRef.current.disconnect()
      }
      
      // Initialize Pusher
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
        authEndpoint: '/api/pusher/auth',
        auth: {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })
      
      // Subscribe to channels
      channels.forEach(channel => {
        const pusherChannel = pusherRef.current!.subscribe(`private-${channel}-${userId}`)
        
        // Handle message events
        pusherChannel.bind('message', (data: any) => {
          const event = { type: 'message', data }
          setLastEvent(event)
          onMessage?.(event)
        })
        
        // Handle notification events
        pusherChannel.bind('notification', (data: any) => {
          const event = { type: 'notification', data }
          setLastEvent(event)
          onNotification?.(event)
        })
        
        // Connection states
        pusherChannel.bind('pusher:subscription_succeeded', () => {
          setIsConnected(true)
        })
        
        pusherChannel.bind('pusher:subscription_error', () => {
          setIsConnected(false)
        })
      })
      
    } catch (error) {
      console.error('Error connecting to WebSocket:', error)
      setIsConnected(false)
    }
    
    return () => {
      if (pusherRef.current) {
        channels.forEach(channel => {
          pusherRef.current!.unsubscribe(`private-${channel}-${userId}`)
        })
        pusherRef.current.disconnect()
        pusherRef.current = null
      }
      setIsConnected(false)
    }
  }, [userId, channels, onMessage, onNotification, enabled])
  
  useEffect(() => {
    const cleanup = connect()
    return cleanup
  }, [connect])
  
  const sendMessage = useCallback((channel: string, event: string, data: any) => {
    if (!isConnected || !userId) return
    
    fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: `private-${channel}-${userId}`,
        event,
        data,
      }),
    }).catch(error => {
      console.error('Error sending WebSocket message:', error)
    })
  }, [isConnected, userId])
  
  return {
    isConnected,
    lastEvent,
    sendMessage,
  }
} 