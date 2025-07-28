'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { 
  ChevronDown, 
  User, 
  Bell, 
  MessageSquare, 
  Package, 
  Heart, 
  Settings, 
  LogOut, 
  Menu, 
  Search, 
  Camera, 
  Drill, 
  Bike, 
  Tv, 
  Shirt, 
  Home, 
  Music, 
  Gamepad, 
  Map, 
  Clock, 
  LifeBuoy, 
  HelpCircle, 
  Leaf, 
  Laptop, 
  Mountain, 
  Car, 
  CheckCircle2, 
  XCircle,
  Plus
} from 'lucide-react'
import { SignInButton, SignUpButton, useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect, useRef } from 'react'
import { CustomDropdown, CustomDropdownItem } from '@/components/ui/custom-dropdown'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useWebSocket } from '@/hooks/use-websocket'

interface Notification {
  id: string
  type: 'RENTAL_REQUEST' | 'REQUEST_APPROVED' | 'REQUEST_REJECTED' | 'MESSAGE'
  read: boolean
  createdAt: string
  senderName: string
  listingName?: string
}

interface Message {
  conversation_id: string
  message_id: string
  content: string
  created_at: string
  is_read: boolean
  other_user_name: string
  other_user_avatar: string
  unread_count: number
}

// Category icon mapping
const categoryIcons: { [key: string]: JSX.Element } = {
  "Kameraer": <Camera className="h-4 w-4" />,
  "Verktøy": <Drill className="h-4 w-4" />,
  "Elektronikk": <Laptop className="h-4 w-4" />,
  "Sport": <Mountain className="h-4 w-4" />,
  "Musikk": <Music className="h-4 w-4" />,
  "Transport": <Car className="h-4 w-4" />,
  "TV og lyd": <Tv className="h-4 w-4" />,
  "Klær": <Shirt className="h-4 w-4" />,
  "Hjem": <Home className="h-4 w-4" />,
  "Gaming": <Gamepad className="h-4 w-4" />,
  "default": <Package className="h-4 w-4" />
}

interface Category {
  name: string
  id: string
  description?: string
  icon?: string
  is_popular?: boolean
  is_featured?: boolean
}

export default function Navigation() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [isMarkingRead, setIsMarkingRead] = useState(false)
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCategories, setShowCategories] = useState(false)
  const [popularCategories, setPopularCategories] = useState<Category[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const hasFetchedRef = useRef(false)
  const markReadTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle WebSocket events (keeping existing functionality)
  const handleNewNotification = (data: any) => {
    if (!data) {
      console.log('Received empty notification data')
      return
    }
    
    console.log('Received new notification:', data)
    
    if (data.type === 'notification_read') {
      setNotifications(prev => {
        if (!Array.isArray(prev)) return []
        return prev.map(n => 
          n && n.id === data.notificationId 
            ? { ...n, read: true } 
            : n
        )
      })
      setUnreadCount(prev => Math.max(0, prev - 1))
    } 
    else if (data.type === 'all_notifications_read') {
      setNotifications(prev => {
        if (!Array.isArray(prev)) return []
        return prev.map(n => n ? { ...n, read: true } : n)
      })
      setUnreadCount(0)
    }
    else if (data.type === 'new_notification') {
      fetchNotifications()
    }
  }

  const handleNewMessage = (data: any) => {
    if (!data) {
      console.log('Received empty message data')
      return
    }
    
    console.log('Received new message:', data)
    fetchMessages()
  }

  const handleMessageRead = (data: any) => {
    if (!data) {
      console.log('Received empty message read data')
      return
    }
    
    console.log('Messages read:', data)
    
    if (data.markedCount) {
      setUnreadMessages(0)
      setHasMarkedAsRead(true)
      setMessages(prev => {
        if (!Array.isArray(prev)) return []
        return prev.map(msg => msg ? {
          ...msg,
          unread_count: 0
        } : msg)
      })
    }
    else if (data.readBy && data.conversationIds && Array.isArray(data.conversationIds)) {
      console.log('Messages read by:', data.readBy, 'in conversations:', data.conversationIds)
    }
  }

  // Initialize WebSocket connection
  const { isConnected } = useWebSocket({
    onNewNotification: handleNewNotification,
    onNewMessage: handleNewMessage,
    onMessageRead: handleMessageRead
  })

  useEffect(() => {
    if (user && !hasFetchedRef.current) {
      fetchNotifications()
      fetchMessages()
      hasFetchedRef.current = true
    }
    
    if (!user) {
      hasFetchedRef.current = false
      setHasMarkedAsRead(false)
    }
  }, [user])

  // Fetch popular categories
  useEffect(() => {
    const fetchPopularCategories = async () => {
      try {
        const response = await fetch('/api/categories?type=popular')
        if (response.ok) {
          const categories = await response.json()
          setPopularCategories(categories)
        }
      } catch (error) {
        console.error('Error fetching popular categories:', error)
      }
    }

    fetchPopularCategories()
  }, [])

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        const notificationsArray = Array.isArray(data) ? data : []
        setNotifications(notificationsArray)
        setUnreadCount(notificationsArray.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([])
      setUnreadCount(0)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages/recent')
      if (response.ok) {
        const data = await response.json()
        const messagesArray = Array.isArray(data) ? data : []
        setMessages(messagesArray)
        setUnreadMessages(messagesArray.reduce((acc: number, msg: Message) => 
          acc + (msg?.unread_count || 0), 0))
      } else {
        console.error('Error fetching messages:', await response.text())
        setMessages([])
        setUnreadMessages(0)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setMessages([])
      setUnreadMessages(0)
    }
  }

  const markMessagesAsRead = async () => {
    if (isMarkingRead || unreadMessages === 0 || hasMarkedAsRead) return
    
    if (markReadTimeoutRef.current) {
      clearTimeout(markReadTimeoutRef.current)
    }
    
    markReadTimeoutRef.current = setTimeout(async () => {
      try {
        setIsMarkingRead(true)
        const response = await fetch('/api/messages/mark-read', {
          method: 'POST'
        })
        
        if (response.ok) {
          setUnreadMessages(0)
          if (Array.isArray(messages)) {
            setMessages(messages.map(msg => ({
              ...msg,
              unread_count: 0
            })))
          }
          setHasMarkedAsRead(true)
        } else {
          console.error('Error marking messages as read:', await response.text())
        }
      } catch (error) {
        console.error('Error marking messages as read:', error)
      } finally {
        setIsMarkingRead(false)
      }
    }, 300)
  }

  const handleSignOut = () => {
    signOut()
    router.push('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearchOpen(false)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const getNotificationText = (notification: Notification) => {
    if (!notification) return 'har en oppdatering for deg.'; 
    
    switch (notification.type) {
      case 'RENTAL_REQUEST':
        return `har sendt deg en leieforespørsel for ${notification.listingName || 'en annonse'}.`;
      case 'REQUEST_APPROVED':
        return `godkjente leieforespørselen din for ${notification.listingName || 'en annonse'}.`;
      case 'REQUEST_REJECTED':
        return `avslo leieforespørselen din for ${notification.listingName || 'en annonse'}.`;
      case 'MESSAGE':
        return `sendte deg en melding.`;
      default:
        return 'har en oppdatering for deg.';
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-white border-b border-gray-100 backdrop-blur supports-[backdrop-filter]:bg-white/95 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center mr-3">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black text-gray-900">
                Price<span className="text-emerald-500">Tag</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <div className="relative">
              <button 
                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                onClick={() => setShowCategories(!showCategories)}
                onMouseEnter={() => setShowCategories(true)}
              >
                <span>Kategorier</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
              </button>
              
              {showCategories && (
                <div 
                  className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 min-w-[200px] z-50"
                  onMouseLeave={() => setShowCategories(false)}
                >
                  {popularCategories.map((category) => (
                    <Link 
                      key={category.name}
                      href={`/category/${category.name.toLowerCase()}`}
                      className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="mr-3 text-gray-500">
                        {categoryIcons[category.name] || categoryIcons.default}
                      </div>
                      <span className="font-medium text-gray-700">{category.name}</span>
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <Link 
                      href="/categories" 
                      className="flex items-center px-4 py-3 text-emerald-600 hover:bg-emerald-50 transition-colors font-medium"
                    >
                      Se alle kategorier
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link 
              href="/search?newest=true" 
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Nye annonser
            </Link>

            {user && (
              <Link 
                href="/rental-requests" 
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Forespørsler
              </Link>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {user ? (
              <>
                {/* Notifications */}
                <CustomDropdown
                  trigger={
                    <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{unreadCount}</span>
                        </div>
                      )}
                    </Button>
                  }
                  content={
                    <div className="w-80 max-h-[480px] overflow-y-auto">
                      <div className="sticky top-0 z-10 flex items-center justify-between py-4 px-4 border-b bg-white">
                        <h3 className="font-bold text-gray-900">Varsler</h3>
                        {unreadCount > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                          >
                            Merk alle som lest
                          </Button>
                        )}
                      </div>
                      
                      {Array.isArray(notifications) && notifications.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {notifications.map((notification) => {
                            if (!notification) return null;
                            
                            let NotificationIcon;
                            let iconColor;
                            
                            switch (notification.type) {
                              case 'RENTAL_REQUEST':
                                NotificationIcon = Package;
                                iconColor = 'text-blue-600';
                                break;
                              case 'REQUEST_APPROVED':
                                NotificationIcon = CheckCircle2;
                                iconColor = 'text-green-600';
                                break;
                              case 'REQUEST_REJECTED':
                                NotificationIcon = XCircle;
                                iconColor = 'text-red-600';
                                break;
                              case 'MESSAGE':
                                NotificationIcon = MessageSquare;
                                iconColor = 'text-purple-600';
                                break;
                              default:
                                NotificationIcon = Bell;
                                iconColor = 'text-gray-600';
                            }
                            
                            return (
                              <Link
                                key={notification.id || `notification-${Math.random()}`}
                                href={`/notifications/${notification.id || ''}`}
                                className={cn(
                                  "flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors",
                                  !notification.read && "bg-emerald-50/50"
                                )}
                              >
                                <div className="p-2 bg-gray-100 rounded-xl flex-shrink-0 mt-0.5">
                                  <NotificationIcon className={cn("h-4 w-4", iconColor)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="font-semibold text-gray-900">{notification.senderName || 'Bruker'}</p>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                      {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : ''}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{getNotificationText(notification)}</p>
                                  {!notification.read && (
                                    <div className="mt-2 w-2 h-2 rounded-full bg-emerald-500"></div>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-12 px-4 text-center">
                          <div className="bg-gray-100 mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-4">
                            <Bell className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-700 font-semibold mb-2">Ingen varsler ennå</p>
                          <p className="text-sm text-gray-500">
                            Vi varsler deg når du har aktivitet på kontoen din
                          </p>
                        </div>
                      )}
                    </div>
                  }
                  align="end"
                  contentClassName="w-80 overflow-hidden rounded-2xl shadow-xl border border-gray-100"
                />

                {/* Messages */}
                <CustomDropdown
                  trigger={
                    <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl">
                      <MessageSquare className="h-5 w-5" />
                      {unreadMessages > 0 && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{unreadMessages}</span>
                        </div>
                      )}
                    </Button>
                  }
                  content={
                    <div className="w-80" onMouseEnter={unreadMessages > 0 && !isMarkingRead ? markMessagesAsRead : undefined}>
                      <div className="flex items-center justify-between py-4 px-4 border-b">
                        <h3 className="font-bold text-gray-900">Meldinger</h3>
                        <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg" asChild>
                          <Link href="/chat">Se alle</Link>
                        </Button>
                      </div>
                      {Array.isArray(messages) && messages.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {messages.map((message) => {
                            if (!message) return null;
                            
                            return (
                              <Link
                                key={message.message_id || `message-${Math.random()}`}
                                href={`/chat?conversationId=${message.conversation_id || ''}`}
                                className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                              >
                                <Image
                                  src={message.other_user_avatar || '/placeholder.svg'}
                                  alt={message.other_user_name || 'User'}
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="font-semibold text-gray-900 truncate">{message.other_user_name || 'Bruker'}</p>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                      {message.created_at ? formatDistanceToNow(new Date(message.created_at), { addSuffix: true }) : ''}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 truncate">{message.content || ''}</p>
                                  {(message.unread_count || 0) > 0 && (
                                    <div className="mt-1 inline-flex items-center rounded-full bg-emerald-500 px-2 py-1 text-xs font-bold text-white">
                                      {message.unread_count} nye
                                    </div>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-12 px-4 text-center">
                          <div className="bg-gray-100 mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-4">
                            <MessageSquare className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-700 font-semibold mb-2">Ingen meldinger ennå</p>
                          <p className="text-sm text-gray-500">
                            Start en samtale ved å kontakte en utleier
                          </p>
                        </div>
                      )}
                    </div>
                  }
                  align="end"
                  contentClassName="w-80 rounded-2xl shadow-xl border border-gray-100"
                />

                {/* Add Listing Button */}
                <Button className="hidden md:flex bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2 rounded-xl shadow-sm" asChild>
                  <Link href="/listings/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Legg ut annonse
                  </Link>
                </Button>

                {/* User Menu */}
                <CustomDropdown
                  trigger={
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100 rounded-xl p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.imageUrl} />
                        <AvatarFallback className="bg-emerald-500 text-white font-semibold">
                          {user?.firstName?.charAt(0) ?? user?.username?.charAt(0) ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-gray-900">{user.firstName || user.username}</p>
                      </div>
                    </Button>
                  }
                  content={
                    <div className="w-56">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user.fullName || user.username}</p>
                        <p className="text-xs text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
                      </div>
                      <div className="py-2">
                        <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                          <Package className="mr-3 h-4 w-4" />
                          Mine annonser
                        </Link>
                        <Link href="/profile/favorites" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                          <Heart className="mr-3 h-4 w-4" />
                          Favoritter
                        </Link>
                        <Link href="/profile?tab=settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                          <Settings className="mr-3 h-4 w-4" />
                          Innstillinger
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 py-2">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Logg ut
                        </button>
                      </div>
                    </div>
                  }
                  align="end"
                  contentClassName="w-56 rounded-2xl shadow-xl border border-gray-100"
                />
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <SignInButton mode="modal">
                  <Button variant="ghost" className="text-gray-700 hover:text-gray-900 font-medium">
                    Logg inn
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2 rounded-xl shadow-sm">
                    Registrer deg
                  </Button>
                </SignUpButton>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="overflow-y-auto w-80 sm:w-96">
                <div className="flex flex-col h-full">
                  {/* Mobile Search */}
                  <div className="mb-6">
                    <form onSubmit={handleSearch} className="relative">
                      <Input
                        type="text"
                        placeholder="Søk..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10 rounded-xl text-base"
                      />
                      <Button 
                        type="submit" 
                        size="icon" 
                        variant="ghost" 
                        className="absolute right-0 top-0 h-full"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-3 sm:space-y-4">
                    <Link href="/categories" className="text-base font-medium text-gray-700 hover:text-gray-900" onClick={() => setIsOpen(false)}>
                      Kategorier
                    </Link>
                    <Link href="/search?newest=true" className="text-base font-medium text-gray-700 hover:text-gray-900" onClick={() => setIsOpen(false)}>
                      Nye annonser
                    </Link>
                    
                    {user ? (
                      <>
                        <Link href="/rental-requests" className="text-base font-medium text-gray-700 hover:text-gray-900" onClick={() => setIsOpen(false)}>
                          Forespørsler
                        </Link>
                        <Link href="/listings/new" className="text-base font-medium text-gray-700 hover:text-gray-900" onClick={() => setIsOpen(false)}>
                          Legg ut annonse
                        </Link>
                        <div className="border-t pt-4 mt-4">
                          <Link href="/profile" className="flex items-center text-base font-medium text-gray-700 hover:text-gray-900 py-2" onClick={() => setIsOpen(false)}>
                            <Package className="mr-2 h-4 w-4" />
                            Mine annonser
                          </Link>
                          <Link href="/profile/favorites" className="flex items-center text-base font-medium text-gray-700 hover:text-gray-900 py-2" onClick={() => setIsOpen(false)}>
                            <Heart className="mr-2 h-4 w-4" />
                            Favoritter
                          </Link>
                        </div>
                        <button 
                          onClick={() => {
                            handleSignOut()
                            setIsOpen(false)
                          }}
                          className="flex items-center text-base font-medium text-red-600 text-left py-2"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logg ut
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col space-y-3 pt-4 border-t">
                        <SignInButton mode="modal">
                          <Button variant="outline" className="justify-start">
                            <User className="mr-2 h-4 w-4" />
                            Logg inn
                          </Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <Button className="justify-start bg-emerald-500 hover:bg-emerald-600">
                            <User className="mr-2 h-4 w-4" />
                            Registrer deg
                          </Button>
                        </SignUpButton>
                      </div>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search Popup */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-30"
          >
            <div className="container mx-auto px-4 py-6">
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="relative">
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Søk etter gjenstander..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-12 h-12 text-lg rounded-2xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <Button 
                    type="submit" 
                    className="absolute right-1 top-1 h-10 w-10 bg-emerald-500 hover:bg-emerald-600 rounded-xl"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <p className="text-sm text-gray-500 mr-2">Populære søk:</p>
                  {["Kamera", "Drill", "Sykkel", "Høyttalere", "Projektor"].map((term) => (
                    <Button
                      key={term}
                      variant="outline"
                      size="sm"
                      className="rounded-full border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
                      onClick={() => {
                        setSearchQuery(term)
                        if (searchInputRef.current) {
                          searchInputRef.current.focus()
                        }
                      }}
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

