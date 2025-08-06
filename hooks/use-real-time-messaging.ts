'use client';

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSSE } from './use-sse'
import { useWebSocket } from './use-websocket'

interface UseRealTimeMessagingOptions {
  onNewMessage?: (data: any) => void
  onNewNotification?: (data: any) => void
  onMessageRead?: (data: any) => void
  enabled?: boolean
  pollingInterval?: number
}

export function useRealTimeMessaging({
  onNewMessage,
  onNewNotification,
  onMessageRead,
  enabled = true,
  pollingInterval = 30000 // 30 seconds default polling
}: UseRealTimeMessagingOptions) {
  const [connectionType, setConnectionType] = useState<'websocket' | 'sse' | 'polling' | 'none'>('none')
  const [lastMessageCheck, setLastMessageCheck] = useState<Date>(new Date())
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Try WebSocket first
  const { isConnected: wsConnected, sendMessage: wsSendMessage } = useWebSocket({
    onNewMessage,
    onNewNotification,
    onMessageRead,
    enabled
  })

  // Try SSE as backup
  const { isConnected: sseConnected } = useSSE({
    onNewMessage,
    onNewNotification,
    onMessageRead,
    enabled: enabled && !wsConnected
  })

  // Determine active connection type
  useEffect(() => {
    if (wsConnected) {
      setConnectionType('websocket')
      console.log('Real-time messaging: Using WebSocket')
    } else if (sseConnected) {
      setConnectionType('sse')
      console.log('Real-time messaging: Using Server-Sent Events')
    } else if (enabled) {
      setConnectionType('polling')
      console.log('Real-time messaging: Using polling fallback')
    } else {
      setConnectionType('none')
    }
  }, [wsConnected, sseConnected, enabled])

  // Polling fallback when both WebSocket and SSE fail
  const startPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
    }

    if (connectionType === 'polling' && enabled) {
      pollingTimeoutRef.current = setTimeout(async () => {
        try {
          // Check for new messages
          const response = await fetch(`/api/messages/poll?since=${lastMessageCheck.toISOString()}`)
          if (response.ok) {
            const data = await response.json()
            
            if (data.messages && data.messages.length > 0) {
              data.messages.forEach((message: any) => {
                if (onNewMessage) {
                  onNewMessage({
                    type: 'new_message',
                    message: message,
                    conversationId: message.conversation_id
                  })
                }
              })
            }
            
            if (data.notifications && data.notifications.length > 0) {
              data.notifications.forEach((notification: any) => {
                if (onNewNotification) {
                  onNewNotification(notification)
                }
              })
            }
            
            setLastMessageCheck(new Date())
          }
        } catch (error) {
          console.error('Polling error:', error)
        }
        
        // Schedule next poll
        startPolling()
      }, pollingInterval)
    }
  }, [connectionType, enabled, pollingInterval, lastMessageCheck, onNewMessage, onNewNotification])

  // Start polling when needed
  useEffect(() => {
    if (connectionType === 'polling') {
      startPolling()
    } else {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current)
        pollingTimeoutRef.current = null
      }
    }

    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current)
      }
    }
  }, [connectionType, startPolling])

  // Send message function that tries the best available method
  const sendMessage = useCallback((type: string, data: any) => {
    if (connectionType === 'websocket' && wsSendMessage) {
      return wsSendMessage(type, data)
    }
    
    // For SSE and polling, we can't send messages through the connection
    // They would need to be sent via regular HTTP requests
    console.log(`Sending message via HTTP (connection type: ${connectionType})`)
    return false
  }, [connectionType, wsSendMessage])

  return {
    isConnected: wsConnected || sseConnected,
    connectionType,
    sendMessage,
    isRealTime: connectionType === 'websocket' || connectionType === 'sse'
  }
}