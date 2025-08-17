'use client';

import { useState, useEffect, useRef, useCallback } from 'react'

type WebSocketEvent = {
  type: string
  data: any
}

interface UseWebSocketOptions {
  onNewNotification?: (data: any) => void
  onNewMessage?: (data: any) => void
  onMessageRead?: (data: any) => void
  onTyping?: (data: any) => void
  enabled?: boolean
}

export function useWebSocket({
  onNewNotification,
  onNewMessage,
  onMessageRead,
  onTyping,
  enabled = true
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Function to connect to WebSocket
  const connect = useCallback(() => {
    if (!enabled) return
    
    try {
      // Close existing connection if any
      if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
        socketRef.current.close()
      }
      
      // Create new WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.host
      const wsUrl = `${protocol}//${host}/api/ws`
      
      socketRef.current = new WebSocket(wsUrl)
      
      // Connection opened
      socketRef.current.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
      }
      
      // Listen for messages
      socketRef.current.onmessage = (event) => {
        try {
          // Check if event.data exists and is a string
          if (!event || typeof event.data !== 'string') {
            console.warn('Invalid WebSocket message received:', event)
            return
          }
          
          const data = JSON.parse(event.data)
          console.log('WebSocket message received:', data)
          
          // Check if data and type exist
          if (!data || typeof data.type !== 'string') {
            console.warn('Invalid message format, missing type:', data)
            return
          }
          
          if (data.type === 'ping') {
            // Respond to ping with pong
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify({ type: 'pong' }))
            }
            return
          }
          
          // Route messages to appropriate handlers with null checks
          if (data.type === 'notification' && onNewNotification) {
            onNewNotification(data.data || {}) // Pass empty object if data is null
          } else if ((data.type === 'message' || data.type === 'new_message') && onNewMessage) {
            onNewMessage(data.data || {})
          } else if (data.type === 'message_read' && onMessageRead) {
            onMessageRead(data.data || {})
          } else if (data.type === 'typing' && onTyping) {
            onTyping(data.data || {})
          }
          
          setLastEvent({ type: data.type, data: data.data || null })
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      // Connection closed
      socketRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        
        // Attempt to reconnect after delay
        if (enabled && reconnectTimeoutRef.current === null) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null
            connect()
          }, 3000)
        }
      }
      
      // Handle errors - using Event type instead of Error
      socketRef.current.onerror = (event: Event) => {
        console.error('WebSocket error:', event)
      }
      
    } catch (error) {
      console.error('Error setting up WebSocket:', error)
      setIsConnected(false)
    }
    
    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
      
      setIsConnected(false)
    }
  }, [enabled, onNewMessage, onNewNotification, onMessageRead, onTyping])
  
  // Connect on component mount
  useEffect(() => {
    const cleanup = connect()
    
    // Add authentication when the user's session changes
    const handleAuthChange = () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'auth_check' }))
      }
    }
    
    // Listen for auth changes (for example, from Clerk's session)
    window.addEventListener('storage', (event) => {
      if (event.key && (event.key.includes('clerk') || event.key.includes('session'))) {
        handleAuthChange()
      }
    })
    
    return () => {
      window.removeEventListener('storage', handleAuthChange)
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }
  }, [connect])
  
  // Send a message over WebSocket
  const sendMessage = useCallback((type: string, data: any) => {
    if (!isConnected || !socketRef.current) return false
    
    try {
      socketRef.current.send(JSON.stringify({ type, data }))
      return true
    } catch (error) {
      console.error('Error sending WebSocket message:', error)
      return false
    }
  }, [isConnected])
  
  return {
    isConnected,
    lastEvent,
    sendMessage,
  }
} 