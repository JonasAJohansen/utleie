'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useAutoScroll } from '../hooks/useAutoScroll'
import { useUser } from '@clerk/nextjs'
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Send } from 'lucide-react'

interface Message {
  id: string
  text: string
  senderId: string
  senderName: string
  senderImage?: string
  timestamp: Date
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const { user } = useUser()
  const chatRef = useAutoScroll(messages)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const message: Message = {
      id: crypto.randomUUID(),
      text: newMessage,
      senderId: user.id,
      senderName: user.fullName || user.username || 'Anonymous',
      senderImage: user.imageUrl,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      <div 
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map(message => (
          <div 
            key={message.id}
            className={`flex items-start gap-2 ${
              message.senderId === user?.id ? 'flex-row-reverse' : ''
            }`}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.senderImage} />
              <AvatarFallback>{message.senderName[0]}</AvatarFallback>
            </Avatar>
            <div 
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === user?.id 
                  ? 'bg-blue-500 text-white ml-auto' 
                  : 'bg-gray-100'
              }`}
            >
              <p className="text-sm font-medium mb-1">{message.senderName}</p>
              <p>{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form 
        onSubmit={handleSendMessage}
        className="p-4 border-t flex gap-2"
      >
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
} 