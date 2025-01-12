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
  const searchParams = useSearchParams()
  const { user } = useUser()
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

  useEffect(() => {
    if (!user) return

    const otherUserId = searchParams.get('userId')
    const listingId = searchParams.get('listingId')
    const listingName = searchParams.get('listingName')
    
    if (otherUserId) {
      createOrFetchConversation(otherUserId, listingId, listingName)
    }
  }, [searchParams, user])

  // ... rest of the implementation remains the same ...
  
  return (
    <div className="flex h-[calc(90vh-10rem)] mx-4 rounded-2xl overflow-hidden border">
      {/* ... existing JSX ... */}
    </div>
  )
}

export default function ChatPage() {
  return (
    <div className="h-screen flex flex-col">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }>
        <ChatContent />
      </Suspense>
    </div>
  )
}

