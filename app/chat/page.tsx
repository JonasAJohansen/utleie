'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from "@clerk/nextjs"
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Camera, Send, Smile, X, Search } from 'lucide-react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import Pusher from 'pusher-js'
import { useToast } from "@/hooks/use-toast"

type Message = {
  id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image';
  sender_username: string;
  sender_avatar: string;
  conversation_id: string;
  created_at: string;
}

type Conversation = {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  lastMessage: string | null;
  lastMessageTime: string;
  isTyping?: boolean;
  listingId?: string;
  listingName?: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
};

export default function ChatPage() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({})
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  useEffect(() => {
    const otherUserId = searchParams.get('userId')
    const listingId = searchParams.get('listingId')
    const listingName = searchParams.get('listingName')
    
    if (otherUserId && user) {
      createOrFetchConversation(otherUserId, listingId, listingName)
    }
  }, [searchParams, user])

  const createOrFetchConversation = async (otherUserId: string, listingId?: string | null, listingName?: string | null) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          otherUserId,
          listingId,
          listingName
        }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        toast({
          title: "Error",
          description: errorText || "Failed to start conversation",
          variant: "destructive",
        })
        return
      }

      const conversation = await response.json()
      setConversations(prev => {
        const exists = prev.some(conv => conv.id === conversation.id)
        return exists ? prev : [...prev, conversation]
      })
      setActiveConversation(conversation)
    } catch (error) {
      console.error('Error creating/fetching conversation:', error)
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again later.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (user) {
      fetchConversations()
      // Poll for new conversations every 10 seconds
      const conversationsInterval = setInterval(fetchConversations, 10000)
      return () => clearInterval(conversationsInterval)
    }
  }, [user])

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id)
      // Poll for new messages and typing status every 3 seconds
      const messagesInterval = setInterval(() => {
        fetchMessages(activeConversation.id)
        fetchTypingStatus()
      }, 3000)
      return () => clearInterval(messagesInterval)
    }
  }, [activeConversation])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error fetching messages:', errorText)
        return
      }
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!user || !activeConversation || (!newMessage.trim() && !selectedImage)) return

    const messageContent = newMessage.trim() || selectedImage
    const messageType = selectedImage ? 'image' : 'text'

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          content: messageContent,
          type: messageType,
        }),
      })

      if (response.ok) {
        const newMsg = await response.json()
        setMessages(prev => [...prev, newMsg])
        setNewMessage('')
        setSelectedImage(null)

        // Update last message in conversations list
        setConversations(conversations.map(conv => 
          conv.id === activeConversation.id 
            ? { ...conv, lastMessage: messageContent, lastMessageTime: new Date().toISOString() } 
            : conv
        ))
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEmojiSelect = (emoji: { native: string }) => {
    setNewMessage(prev => prev + emoji.native)
  }

  const closeConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId))
        if (activeConversation?.id === conversationId) {
          setActiveConversation(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error('Error closing conversation:', error)
    }
  }

  // Update typing status
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    if (activeConversation) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Send typing status to server
      fetch('/api/typing-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          isTyping: true,
        }),
      }).catch(error => {
        console.error('Error updating typing status:', error)
      })

      // Clear typing status after 2 seconds
      typingTimeoutRef.current = setTimeout(() => {
        fetch('/api/typing-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId: activeConversation.id,
            isTyping: false,
          }),
        }).catch(error => {
          console.error('Error updating typing status:', error)
        })
      }, 2000)
    }
  }

  const fetchTypingStatus = async () => {
    try {
      const response = await fetch('/api/typing-status')
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error fetching typing status:', errorText)
        return
      }
      const data = await response.json()
      setTypingUsers(data)
    } catch (error) {
      console.error('Error fetching typing status:', error)
    }
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen bg-gray-100">Please sign in to access the chat.</div>
  }

  return (
    <div className="flex justify-center items-start min-h-screen p-4 pt-8">
      <div className="flex w-full max-w-6xl h-[46rem] bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Conversations</h2>
            <div className="relative">
              <Input
                placeholder="Search conversations..."
                className="pl-10 bg-gray-100 border-none rounded-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          <ScrollArea className="h-[calc(36rem-5rem)]">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${
                  activeConversation?.id === conversation.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => setActiveConversation(conversation)}
              >
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={conversation.avatar} alt={conversation.username} />
                    <AvatarFallback>{conversation.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{conversation.username}</h3>
                    {conversation.listingName && (
                      <p className="text-xs text-gray-500 truncate">Re: {conversation.listingName}</p>
                    )}
                    <p className="text-sm text-gray-500 truncate">
                      {typingUsers[conversation.id] ? (
                        <span className="text-green-500 animate-pulse">typing...</span>
                      ) : (
                        conversation.lastMessage || 'No messages yet'
                      )}
                    </p>
                  </div>
                  {conversation.lastMessageTime && !typingUsers[conversation.id] && (
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {formatDate(conversation.lastMessageTime)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={activeConversation.avatar} alt={activeConversation.username} />
                    <AvatarFallback>{activeConversation.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-medium text-gray-900">{activeConversation.username}</h2>
                    {activeConversation.listingName && (
                      <p className="text-xs text-gray-500">Re: {activeConversation.listingName}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => closeConversation(activeConversation.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ScrollArea 
                ref={scrollAreaRef}
                className="flex-grow px-4 py-2"
              >
                {messages.map((message) => {
                  const isCurrentUser = message.sender_id === user?.id
                  return (
                    <div
                      key={message.id}
                      className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={message.sender_avatar || (isCurrentUser ? user.imageUrl : activeConversation.avatar)}
                            alt={message.sender_username} 
                          />
                          <AvatarFallback>{message.sender_username[0]}</AvatarFallback>
                        </Avatar>
                        <div 
                          className={`max-w-xs mx-2 p-3 rounded-2xl ${
                            isCurrentUser 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {message.type === 'image' ? (
                            <Image
                              src={message.content}
                              alt="Shared image"
                              width={200}
                              height={200}
                              className="rounded-lg"
                            />
                          ) : (
                            <p className="text-sm">{message.content}</p>
                          )}
                          <div className={`text-xs mt-1 ${
                            isCurrentUser ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            {formatDate(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </ScrollArea>
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-grow rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-full">
                        <Smile className="h-5 w-5 text-gray-500" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <Picker data={data} onEmojiSelect={handleEmojiSelect} />
                    </PopoverContent>
                  </Popover>
                  <Button variant="outline" size="icon" className="rounded-full" onClick={() => document.getElementById('image-upload')?.click()}>
                    <Camera className="h-5 w-5 text-gray-500" />
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button onClick={handleSendMessage} className="rounded-full bg-blue-500 hover:bg-blue-600 text-white">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
                {selectedImage && (
                  <div className="mt-2">
                    <Image src={selectedImage} alt="Selected image" width={100} height={100} className="rounded-lg" />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-xl text-gray-500 font-light">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

