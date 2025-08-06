'use client';

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseSSEOptions {
  onNewMessage?: (data: any) => void
  onNewNotification?: (data: any) => void
  onMessageRead?: (data: any) => void
  enabled?: boolean
}

export function useSSE({
  onNewMessage,
  onNewNotification,
  onMessageRead,
  enabled = true
}: UseSSEOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<any>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const connect = useCallback(() => {
    if (!enabled) return
    
    try {
      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      
      // Create new EventSource connection
      eventSourceRef.current = new EventSource('/api/messages/events')
      
      // Connection opened
      eventSourceRef.current.onopen = () => {
        console.log('SSE connected')
        setIsConnected(true)
      }
      
      // Listen for messages
      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('SSE message received:', data)
          
          // Route messages to appropriate handlers
          if (data.type === 'notification' && onNewNotification) {
            onNewNotification(data)
          } else if ((data.type === 'message' || data.type === 'new_message') && onNewMessage) {
            onNewMessage(data)
          } else if (data.type === 'message_read' && onMessageRead) {
            onMessageRead(data)
          }
          
          setLastEvent(data)
        } catch (error) {
          console.error('Error parsing SSE message:', error)
        }
      }
      
      // Handle errors
      eventSourceRef.current.onerror = (event) => {
        console.error('SSE error:', event)
        setIsConnected(false)
        
        // Attempt to reconnect after delay
        if (enabled && reconnectTimeoutRef.current === null) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null
            connect()
          }, 3000)
        }
      }
      
    } catch (error) {
      console.error('Error setting up SSE:', error)
      setIsConnected(false)
    }
    
    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      
      setIsConnected(false)
    }
  }, [enabled, onNewMessage, onNewNotification, onMessageRead])
  
  // Connect on component mount
  useEffect(() => {
    const cleanup = connect()
    
    return () => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }
  }, [connect])
  
  return {
    isConnected,
    lastEvent,
  }
}