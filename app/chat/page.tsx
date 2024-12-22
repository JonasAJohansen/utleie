'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Camera, Send, Smile } from 'lucide-react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

type Message = {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image';
}

type Conversation = {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  listing: {
    id: number;
    name: string;
    image: string;
  };
  lastMessage: string;
  unreadCount: number;
}

const conversations: Conversation[] = [
  {
    id: 1,
    user: { name: 'Alice Johnson', avatar: '/placeholder.svg?height=32&width=32' },
    listing: { id: 1, name: 'Mountain Bike', image: '/placeholder.svg?height=48&width=48' },
    lastMessage: 'Hi, I\'m interested in renting your mountain bike.',
    unreadCount: 2,
  },
  {
    id: 2,
    user: { name: 'Bob Smith', avatar: '/placeholder.svg?height=32&width=32' },
    listing: { id: 2, name: 'DSLR Camera', image: '/placeholder.svg?height=48&width=48' },
    lastMessage: 'Is the camera still available for next weekend?',
    unreadCount: 0,
  },
  {
    id: 3,
    user: { name: 'Carol Williams', avatar: '/placeholder.svg?height=32&width=32' },
    listing: { id: 3, name: 'Camping Tent', image: '/placeholder.svg?height=48&width=48' },
    lastMessage: 'Thanks for the quick response!',
    unreadCount: 1,
  },
]

export default function ChatPage() {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(conversations[0])
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'Alice', content: 'Hi, I\'m interested in renting your mountain bike.', timestamp: '10:30 AM', type: 'text' },
    { id: 2, sender: 'You', content: 'Hello! Sure, when would you like to rent it?', timestamp: '10:35 AM', type: 'text' },
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim() || selectedImage) {
      const newMsg: Message = {
        id: messages.length + 1,
        sender: 'You',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: selectedImage ? 'image' : 'text'
      }
      setMessages([...messages, newMsg])
      setNewMessage('')
      setSelectedImage(null)

      // Simulate receiving a response
      setIsTyping(true)
      setTimeout(() => {
        const responseMsg: Message = {
          id: messages.length + 2,
          sender: activeConversation?.user.name || 'User',
          content: 'Thanks for your message. I\'ll get back to you soon!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
        }
        setMessages(prev => [...prev, responseMsg])
        setIsTyping(false)
      }, 3000)
    }
  }

  const [selectedImage, setSelectedImage] = useState<string | null>(null)

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

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage(prev => prev + emoji.native)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      <Card className="w-1/3 mr-4">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 rounded-lg ${activeConversation?.id === conversation.id ? 'bg-gray-100' : ''}`}
                onClick={() => setActiveConversation(conversation)}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                  <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{conversation.user.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <CardHeader className="flex flex-row items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activeConversation.user.avatar} alt={activeConversation.user.name} />
                <AvatarFallback>{activeConversation.user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{activeConversation.user.name}</CardTitle>
                <p className="text-sm text-gray-500">Regarding: {activeConversation.listing.name}</p>
              </div>
              <div className="ml-auto">
                <Image
                  src={activeConversation.listing.image}
                  alt={activeConversation.listing.name}
                  width={48}
                  height={48}
                  className="rounded-md"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <ScrollArea className="flex-grow mb-4" ref={scrollAreaRef}>
                {messages.map((message) => (
                  <div key={message.id} className={`mb-4 ${message.sender === 'You' ? 'text-right' : ''}`}>
                    <div className={`inline-block p-3 rounded-lg ${message.sender === 'You' ? 'bg-primary text-primary-foreground' : 'bg-gray-100'}`}>
                      {message.type === 'text' ? (
                        <p>{message.content}</p>
                      ) : (
                        <Image src={message.content} alt="Uploaded image" width={200} height={200} className="rounded-md" />
                      )}
                      <span className="text-xs text-gray-500 mt-1 block">{message.timestamp}</span>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="text-left">
                    <div className="inline-block p-3 rounded-lg bg-gray-100">
                      <p className="text-gray-500">Typing...</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-grow"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <Picker data={data} onEmojiSelect={handleEmojiSelect} />
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="icon" onClick={() => document.getElementById('image-upload')?.click()}>
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {selectedImage && (
                <div className="mt-2">
                  <Image src={selectedImage} alt="Selected image" width={100} height={100} className="rounded-md" />
                </div>
              )}
            </CardContent>
          </>
        ) : (
          <CardContent className="h-full flex items-center justify-center">
            <p className="text-gray-500">Select a conversation to start chatting</p>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

