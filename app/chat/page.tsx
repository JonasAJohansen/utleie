'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useUser } from "@clerk/nextjs"
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Camera, Send, Smile, X, Search, Loader2, MessageCircle, MessageSquare } from 'lucide-react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { MessageInput } from '@/components/enhanced-messaging/MessageInput'
import { EnhancedMessage } from '@/components/enhanced-messaging/EnhancedMessage'
import { useRealTimeMessaging } from '@/hooks/use-real-time-messaging'

type Message = {
  id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  type: string;
  sender_username: string;
  sender_avatar: string;
  conversation_id: string;
  created_at: string;
  is_read?: boolean;
  read_at?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  location_lat?: number;
  location_lng?: number;
  location_name?: string;
  reply_to_content?: string;
  reply_to_username?: string;
  is_template_response?: boolean;
}

type Conversation = {
  id: string;
  user_id: string;
  username: string;
  avatar: string;
  lastMessage: string | null;
  lastMessageTime: string;
  isTyping?: boolean;
  listingId?: string;
  listingName?: string;
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  
  const now = new Date()
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffInHours < 48) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString([], { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
}

function ChatContent() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({})
  const [initialLoad, setInitialLoad] = useState(true)
  const [replyingTo, setReplyingTo] = useState<any>(null)

  // WebSocket handlers for real-time messaging
  const handleNewMessage = (data: any) => {
    if (!data || !data.message) {
      console.log('Received empty message data')
      return
    }
    
    console.log('Received new message via WebSocket:', data)
    
    // Only update if the message is for the active conversation
    if (data.conversationId === activeConversation?.id) {
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const exists = prev.some(msg => msg.id === data.message.id)
        return exists ? prev : [...prev, data.message]
      })
    }
    
    // Also refresh conversations to update last message
    fetchConversations()
  }

  // Initialize comprehensive real-time messaging
  const { isConnected, connectionType, isRealTime } = useRealTimeMessaging({
    onNewMessage: handleNewMessage,
    pollingInterval: 15000 // 15 seconds for active chat
  })

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      setTimeout(() => {
        scrollArea.scrollTop = scrollArea.scrollHeight
      }, 100)
    }
  }

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  useEffect(() => {
    if (activeConversation) {
      setInitialLoad(true)
      fetchMessages(activeConversation.id)
      // Reduced polling since we have WebSocket for real-time updates
      const messagesInterval = setInterval(() => {
        fetchTypingStatus()
        // Only fetch messages occasionally as a fallback
        if (!isConnected) {
          fetchMessages(activeConversation.id)
        }
      }, 10000)
      return () => clearInterval(messagesInterval)
    }
  }, [activeConversation, isConnected])

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
    if (!user) return

    const otherUserId = searchParams.get('userId')
    const listingId = searchParams.get('listingId')
    const listingName = searchParams.get('listingName')
    
    if (otherUserId) {
      createOrFetchConversation(otherUserId, listingId, listingName)
    }
  }, [searchParams, user])

  useEffect(() => {
    if (!user) return

    fetchConversations()
    const conversationsInterval = setInterval(fetchConversations, 10000)
    return () => clearInterval(conversationsInterval)
  }, [user])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        const sortedData = data.sort((a: Conversation, b: Conversation) => {
          if (!a.lastMessageTime && !b.lastMessageTime) return 0
          if (!a.lastMessageTime) return 1
          if (!b.lastMessageTime) return -1
          return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        })
        setConversations(prev => {
          const hasChanges = JSON.stringify(prev) !== JSON.stringify(sortedData)
          return hasChanges ? sortedData : prev
        })
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    if (!initialLoad) {
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
      return
    }

    setIsLoadingMessages(true)
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
    } finally {
      setIsLoadingMessages(false)
      setInitialLoad(false)
      setTimeout(scrollToBottom, 200)
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

  const handleEnhancedSendMessage = async (messageData: any) => {
    if (!user || !activeConversation) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      })

      if (response.ok) {
        const newMsg = await response.json()
        setMessages(prev => [...prev, newMsg])

        // Update conversation list with last message
        const displayContent = messageData.content || 
          (messageData.type === 'file' ? `📎 ${messageData.fileName || 'File'}` : '') ||
          (messageData.type === 'location' ? '📍 Location' : '') ||
          'Message'

        setConversations(conversations.map(conv => 
          conv.id === activeConversation.id 
            ? { ...conv, lastMessage: displayContent, lastMessageTime: new Date().toISOString() } 
            : conv
        ))
        
        toast({
          title: "Message sent",
          description: isRealTime ? "Delivered instantly" : "Message sent successfully",
        })
      } else {
        const errorText = await response.text()
        toast({
          title: "Failed to send message",
          description: errorText || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error sending enhanced message:', error)
      toast({
        title: "Network error",
        description: "Please check your connection and try again",
        variant: "destructive",
      })
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

  const handleTyping = async () => {
    if (!activeConversation) return
    
    try {
      await fetch('/api/typing-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          isTyping: true,
        }),
      })
    } catch (error) {
      console.error('Error updating typing status:', error)
    }
  }

  const fetchTypingStatus = async () => {
    if (!activeConversation) return

    try {
      const response = await fetch(`/api/typing-status?conversationId=${activeConversation.id}`)
      if (response.ok) {
        const data = await response.json()
        setTypingUsers(data)
      }
    } catch (error) {
      console.error('Error fetching typing status:', error)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to access the chat.</h2>
          <p className="text-gray-600">You need to be signed in to view and send messages.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(90vh-10rem)] mx-4 rounded-2xl overflow-hidden border">
      {/* Conversations List */}
      <div className="w-80 border-r bg-white">
        <div className="p-4">
          <div className="relative">
            <Input
              placeholder="Search conversations..."
              className="pl-8"
            />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
              <p className="text-gray-500">Start a conversation by clicking "Message" on a user's profile</p>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setActiveConversation(conversation)}
                  className={cn(
                    "w-full p-4 flex items-start gap-4 hover:bg-gray-100 transition-colors",
                    activeConversation?.id === conversation.id && "bg-gray-100"
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversation.avatar || '/placeholder.svg'} />
                    <AvatarFallback>{conversation.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{conversation.username}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage || 'Start a conversation'}
                    </p>
                  </div>
                  {conversation.lastMessageTime && (
                    <time className="text-xs text-gray-500">
                      {formatDate(conversation.lastMessageTime)}
                    </time>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={activeConversation.avatar} />
                  <AvatarFallback>{activeConversation.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <Link 
                    href={`/profile/${activeConversation.user_id}`}
                    className="font-semibold hover:text-blue-500 transition-colors inline-block"
                  >
                    {activeConversation.username}
                  </Link>
                  {activeConversation.listingName && (
                    <p className="text-sm text-gray-500">
                      Discussing: {activeConversation.listingName}
                    </p>
                  )}
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      isRealTime ? 'bg-green-500' : 
                      isConnected ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                    {isRealTime ? `Real-time (${connectionType})` : 
                     isConnected ? `Checking for messages (${connectionType})` : 
                     'Offline'}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea 
              ref={scrollAreaRef}
              className="flex-1 p-4 bg-gray-50"
            >
              {initialLoad && isLoadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div key={message.id} className="mb-4">
                      <EnhancedMessage
                        message={message}
                        isOwn={message.sender_id === user.id}
                        onReply={(msg) => setReplyingTo(msg)}
                        onMarkRead={async (messageId) => {
                          try {
                            await fetch('/api/messages/read-receipts', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ messageId })
                            })
                            // Refresh messages to show updated read status
                            fetchMessages(activeConversation.id)
                          } catch (error) {
                            console.error('Error marking message as read:', error)
                          }
                        }}
                      />
                    </div>
                  ))}
                  {Object.entries(typingUsers).map(([userId, isTyping]) => (
                    isTyping && userId !== user.id && (
                      <div key={userId} className="flex items-center space-x-2 text-muted-foreground text-sm italic">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={conversations.find(c => c.user_id === userId)?.avatar} />
                          <AvatarFallback>{conversations.find(c => c.user_id === userId)?.username[0]}</AvatarFallback>
                        </Avatar>
                        <span>{conversations.find(c => c.user_id === userId)?.username} is typing...</span>
                      </div>
                    )
                  ))}
                </>
              )}
            </ScrollArea>

            {/* Enhanced Message Input */}
            <MessageInput
              conversationId={activeConversation.id}
              onSendMessage={handleEnhancedSendMessage}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }>
        <ChatContent />
      </Suspense>
    </div>
  )
}

