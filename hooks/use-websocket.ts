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
  enabled?: boolean
}

export function useWebSocket({
  onNewNotification,
  onNewMessage,
  onMessageRead,
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
          const data = JSON.parse(event.data)
          console.log('WebSocket message received:', data)
          
          if (data.type === 'ping') {
            // Respond to ping with pong
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify({ type: 'pong' }))
            }
            return
          }
          
          // Route messages to appropriate handlers
          if (data.type === 'notification') {
            onNewNotification?.(data.data)
          } else if (data.type === 'message') {
            onNewMessage?.(data.data)
          } else if (data.type === 'message_read') {
            onMessageRead?.(data.data)
          }
          
          setLastEvent({ type: data.type, data: data.data })
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
        // Extract more meaningful info from the event if possible
        const errorDetails = {
          type: 'WebSocket error',
          timestamp: new Date().toISOString(),
          readyState: socketRef.current?.readyState
        };
        
        console.error('WebSocket error occurred:', errorDetails);
        
        // Set connection status to false on error
        setIsConnected(false);
        
        // Attempt to reconnect after error
        if (enabled && reconnectTimeoutRef.current === null) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            console.log('Attempting to reconnect WebSocket after error...');
            connect();
          }, 5000); // Wait 5 seconds before reconnecting
        }
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
  }, [enabled, onNewMessage, onNewNotification, onMessageRead])
  
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
      if (event.key?.includes('clerk') || event.key?.includes('session')) {
        handleAuthChange()
      }
    })
    
    return () => {
      window.removeEventListener('storage', handleAuthChange)
      cleanup?.()
    }
  }, [connect])
  
  // Send a message over WebSocket
  const sendMessage = useCallback((type: string, data: any) => {
    if (!isConnected || !socketRef.current) return
    
    try {
      socketRef.current.send(JSON.stringify({ type, data }))
    } catch (error) {
      console.error('Error sending WebSocket message:', error)
    }
  }, [isConnected])
  
  return {
    isConnected,
    lastEvent,
    sendMessage,
  }
} 