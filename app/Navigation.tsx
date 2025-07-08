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
  XCircle 
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

// Updated categories with consolidated parent groups
const categoryGroups = [
  {
    name: "Elektronikk & Teknologi",
    icon: <Laptop className="h-6 w-6" />,
    categories: [
      {
        name: "Elektronikk",
        subcategories: ["Laptops", "Mobiler", "Nettbrett", "Hodetelefoner"],
        featured: ["Nye Apple Produkter", "Gaming Laptops"]
      },
      {
        name: "Kameraer",
        subcategories: ["DSLR", "Mirrorless", "Action Cameras", "Tilbehør"],
        featured: ["GoPro Collection", "Sony Alpha Series"]
      },
      {
        name: "Underholdning",
        subcategories: ["TVer", "Høyttalere", "Streaming-enheter", "Spillkonsoller"],
        featured: ["Smart TV", "Sonos Speakers"]
      }
    ]
  },
  {
    name: "Hjem & Gjør-det-selv",
    icon: <Home className="h-6 w-6" />,
    categories: [
      {
        name: "Verktøy",
        subcategories: ["Drill", "Sag", "Håndsverktøy", "Elektroverktøy"],
        featured: ["Bosch Professional", "Makita Tools"]
      },
      {
        name: "Hageartikler",
        subcategories: ["Gressklippere", "Hagemøbler", "Grilling", "Hageverktøy"],
        featured: ["Weber Grills", "Garden Furniture Sets"]
      },
      {
        name: "Interiør",
        subcategories: ["Møbler", "Dekorasjon", "Belysning"],
        featured: ["Designer Lamps", "Modern Furniture"]
      }
    ]
  },
  {
    name: "Sport & Friluft",
    icon: <Mountain className="h-6 w-6" />,
    categories: [
      {
        name: "Sport",
        subcategories: ["Ski", "Sykkel", "Fotball", "Løping"],
        featured: ["High-end Mountain Bikes", "Ski Equipment"]
      },
      {
        name: "Camping",
        subcategories: ["Telt", "Soveposer", "Matlagingsutstyr", "Ryggsekker"],
        featured: ["Fjällräven Collection", "Ultralight Tents"]
      },
      {
        name: "Vannsport",
        subcategories: ["Kajakk", "SUP", "Surfing", "Dykking"],
        featured: ["Inflatable Kayaks", "Premium SUP Boards"]
      }
    ]
  },
  {
    name: "Musikk & Hobby",
    icon: <Music className="h-6 w-6" />,
    categories: [
      {
        name: "Musikk",
        subcategories: ["Gitarer", "Keyboard", "DJ-utstyr", "Studio"],
        featured: ["Fender Collection", "Professional DJ Equipment"]
      },
      {
        name: "Spill",
        subcategories: ["Konsoll", "PC", "Tilbehør", "VR"],
        featured: ["PlayStation 5", "High-end Gaming PCs"]
      },
      {
        name: "Hobby & Fritid",
        subcategories: ["Kunst", "Håndarbeid", "Modellbygging"],
        featured: ["Art Supplies", "Professional Craft Tools"]
      }
    ]
  },
  {
    name: "Transport",
    icon: <Car className="h-6 w-6" />,
    categories: [
      {
        name: "Kjøretøy",
        subcategories: ["Biler", "Motorsykler", "Tilhengere"],
        featured: ["Electric Vehicles", "Luxury Cars"]
      },
      {
        name: "Sykler",
        subcategories: ["Terrengsykkel", "Bysykkel", "Elsykkel", "Tilbehør"],
        featured: ["E-bikes", "Premium Road Bikes"]
      }
    ]
  }
];

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
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const megaMenuRef = useRef<HTMLDivElement>(null)
  const hasFetchedRef = useRef(false)
  const markReadTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle WebSocket events
  const handleNewNotification = (data: any) => {
    if (!data) {
      console.log('Received empty notification data')
      return
    }
    
    console.log('Received new notification:', data)
    
    if (data.type === 'notification_read') {
      // Update notification's read status locally
      setNotifications(prev => {
        if (!Array.isArray(prev)) return []
        return prev.map(n => 
          n && n.id === data.notificationId 
            ? { ...n, read: true } 
            : n
        )
      })
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1))
    } 
    else if (data.type === 'all_notifications_read') {
      // Mark all notifications as read locally
      setNotifications(prev => {
        if (!Array.isArray(prev)) return []
        return prev.map(n => n ? { ...n, read: true } : n)
      })
      setUnreadCount(0)
    }
    else if (data.type === 'new_notification') {
      // Add new notification to the list
      fetchNotifications()
    }
  }

  const handleNewMessage = (data: any) => {
    if (!data) {
      console.log('Received empty message data')
      return
    }
    
    console.log('Received new message:', data)
    // Refresh messages when a new one arrives
    fetchMessages()
  }

  const handleMessageRead = (data: any) => {
    if (!data) {
      console.log('Received empty message read data')
      return
    }
    
    console.log('Messages read:', data)
    
    if (data.markedCount) {
      // Current user marked messages as read
      setUnreadMessages(0)
      setHasMarkedAsRead(true)
      // Update UI to reflect this
      setMessages(prev => {
        if (!Array.isArray(prev)) return []
        return prev.map(msg => msg ? {
          ...msg,
          unread_count: 0
        } : msg)
      })
    }
    else if (data.readBy && data.conversationIds && Array.isArray(data.conversationIds)) {
      // Someone else read our messages
      // This could update read receipts in an active chat
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
    // Initial data fetch on login
    if (user && !hasFetchedRef.current) {
      fetchNotifications()
      fetchMessages()
      hasFetchedRef.current = true
    }
    
    // Reset the refs and states when user changes (logout/login)
    if (!user) {
      hasFetchedRef.current = false
      setHasMarkedAsRead(false)
    }
  }, [user])

  // We don't need the polling anymore since we're using WebSockets
  // The old polling useEffect can be removed

  useEffect(() => {
    // Handle click outside to close the mega menu
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setActiveMegaMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when search is opened
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
        // Ensure data is always an array
        const notificationsArray = Array.isArray(data) ? data : []
        setNotifications(notificationsArray)
        // Only filter if we have an array
        setUnreadCount(notificationsArray.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      // Set to empty array on error
      setNotifications([])
      setUnreadCount(0)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages/recent')
      if (response.ok) {
        const data = await response.json()
        // Ensure data is always an array
        const messagesArray = Array.isArray(data) ? data : []
        setMessages(messagesArray)
        // Safe reduce operation with default of 0
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
    // Don't run if already marking as read, no unread messages, or already marked as read this session
    if (isMarkingRead || unreadMessages === 0 || hasMarkedAsRead) return
    
    // Clear any pending timeouts
    if (markReadTimeoutRef.current) {
      clearTimeout(markReadTimeoutRef.current)
    }
    
    // Set a debounce timeout to prevent multiple rapid calls
    markReadTimeoutRef.current = setTimeout(async () => {
      try {
        setIsMarkingRead(true)
        const response = await fetch('/api/messages/mark-read', {
          method: 'POST'
        })
        
        if (response.ok) {
          const data = await response.json()
          setUnreadMessages(0)
          // Update the messages state to reflect read status - safely
          if (Array.isArray(messages)) {
            setMessages(messages.map(msg => ({
              ...msg,
              unread_count: 0
            })))
          }
          // Remember that we've marked messages as read for this session
          setHasMarkedAsRead(true)
        } else {
          console.error('Error marking messages as read:', await response.text())
        }
      } catch (error) {
        console.error('Error marking messages as read:', error)
      } finally {
        setIsMarkingRead(false)
      }
    }, 300) // 300ms debounce
    
    // Clean up the timeout on component unmount
    return () => {
      if (markReadTimeoutRef.current) {
        clearTimeout(markReadTimeoutRef.current)
      }
    }
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

  // Add back the toggleCategoryMenu function
  const toggleCategoryMenu = (category: string) => {
    if (activeMegaMenu === category) {
      setActiveMegaMenu(null)
    } else {
      setActiveMegaMenu(category)
    }
  }

  // Helper function to get notification text based on type
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
    <header className="fixed top-0 left-0 right-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      {/* Top navigation bar */}
      <div className="bg-[#4CD964] text-white py-1.5 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Map className="h-3.5 w-3.5 mr-1" />
              <span>Norge</span>
            </div>
          <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>24/7 Kundestøtte</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/help" className="hover:underline flex items-center">
              <HelpCircle className="h-3.5 w-3.5 mr-1" />
              <span>Hjelp</span>
            </Link>
            <Link href="/about" className="hover:underline flex items-center">
              <LifeBuoy className="h-3.5 w-3.5 mr-1" />
              <span>Om oss</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and brand */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Leaf className="h-7 w-7 text-[#4CD964]" />
                  <span className="text-2xl font-bold ml-1 text-gray-900">Price<span className="text-[#4CD964]">Tag</span></span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-4" ref={megaMenuRef}>
              {/* Single Categories dropdown instead of multiple category groups */}
              <div className="relative">
                <button 
                  className="flex items-center space-x-1 py-2 px-3 text-base font-medium text-gray-800 hover:text-[#4CD964] transition-colors"
                  onClick={() => toggleCategoryMenu("AllCategories")}
                >
                  <span>Kategorier</span>
                  <ChevronDown className={`h-4 w-4 opacity-70 transition-transform ${activeMegaMenu === "AllCategories" ? 'rotate-180' : ''}`} />
                </button>
                
                {activeMegaMenu === "AllCategories" && (
                  <div 
                    className="absolute z-50 left-0 mt-2 bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: "650px" }}
                  >
                    <div className="flex">
                      {/* Left sidebar with category groups */}
                      <div className="w-1/3 bg-gray-50 py-3 border-r border-gray-100">
                        {categoryGroups.map((group) => (
                          <Link 
                            key={group.name}
                            href={`/category/${encodeURIComponent(group.name.toLowerCase())}`}
                            className="flex items-center px-4 py-2.5 hover:bg-white transition-colors group"
                          >
                            <div className="mr-3 p-1.5 bg-[#E7F9EF] rounded-md text-[#4CD964]">
                              {group.icon}
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-[#4CD964]">
                              {group.name}
                            </span>
                          </Link>
                        ))}
                        
                        <div className="px-4 pt-4 mt-2 border-t">
                          <Link 
                            href="/categories" 
                            className="flex items-center text-sm font-medium text-[#4CD964] hover:underline"
                          >
                            <span>Se alle kategorier</span>
                            <ChevronDown className="h-3 w-3 ml-1 transform -rotate-90" />
                          </Link>
                        </div>
                      </div>
                      
                      {/* Right content area with subcategories */}
                      <div className="w-2/3 p-4">
                        <h3 className="font-medium text-gray-900 mb-3">Populære kategorier</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                          {/* Display top categories from each group */}
                          {categoryGroups.flatMap(group => 
                            group.categories.slice(0, 2).map(category => (
                              <Link 
                                key={`${group.name}-${category.name}`}
                                href={`/category/${encodeURIComponent(category.name.toLowerCase())}`}
                                className="py-1.5 text-gray-700 hover:text-[#4CD964] flex items-center"
                              >
                                <span className="w-2 h-2 rounded-full bg-[#4CD964] mr-2"></span>
                                {category.name}
                              </Link>
                            ))
                          )}
                        </div>
                        
                        <div className="mt-6">
                          <h3 className="font-medium text-gray-900 mb-3">Mest utleid nå</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <Link 
                              href="/category/elektronikk/kameraer"
                              className="group"
                            >
                              <div className="aspect-[4/3] rounded bg-gray-100 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:from-black/60 transition-colors"></div>
                                <div className="absolute bottom-2 left-2 text-white font-medium">Kameraer</div>
                              </div>
                    </Link>
                            <Link 
                              href="/category/tools/elektroverktoy"
                              className="group"
                            >
                              <div className="aspect-[4/3] rounded bg-gray-100 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:from-black/60 transition-colors"></div>
                                <div className="absolute bottom-2 left-2 text-white font-medium">Elektroverktøy</div>
                              </div>
                  </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Essential navigation links */}
              <Link 
                href="/search?newest=true" 
                className="text-base font-medium text-gray-700 hover:text-[#4CD964] px-3 py-2"
              >
                Nye Annonser
              </Link>
              
              {user && (
                <Link 
                  href="/rental-requests" 
                  className="text-base font-medium text-gray-700 hover:text-[#4CD964] px-3 py-2"
                >
                  Forespørsler
                </Link>
              )}
            </nav>

            {/* Right side buttons/actions */}
            <div className="flex items-center space-x-3">
              {/* Search Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-700 hover:text-[#4CD964]"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Søk</span>
              </Button>

              {user ? (
                <>
                  {/* Redesigned Notifications Dropdown */}
                  <CustomDropdown
                    trigger={
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5 text-gray-700 hover:text-[#4CD964]" />
                        <span className="sr-only">Varsler</span>
                      {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-[#4CD964] rounded-full flex items-center justify-center">
                            <span className="text-[10px] font-medium text-white">{unreadCount}</span>
                          </div>
                      )}
                    </Button>
                    }
                    content={
                      <div className="w-80 max-h-[480px] overflow-y-auto">
                        <div className="sticky top-0 z-10 flex items-center justify-between py-3 px-4 border-b bg-white">
                          <h3 className="font-semibold text-gray-900">Varslinger</h3>
                          {unreadCount > 0 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs font-medium text-[#4CD964] hover:text-[#3DAF50] hover:bg-[#F2FFF8]"
                              onClick={() => console.log('Mark all as read')}
                            >
                              Merk alle som lest
                            </Button>
                          )}
                        </div>
                        
                        {Array.isArray(notifications) && notifications.length > 0 ? (
                          <div className="divide-y">
                            {notifications.map((notification) => {
                              if (!notification) return null;
                              
                              // Determine notification icon based on type
                              let NotificationIcon;
                              let bgColor;
                              
                              switch (notification.type) {
                                case 'RENTAL_REQUEST':
                                  NotificationIcon = Package;
                                  bgColor = 'bg-blue-100';
                                  break;
                                case 'REQUEST_APPROVED':
                                  NotificationIcon = CheckCircle2;
                                  bgColor = 'bg-green-100';
                                  break;
                                case 'REQUEST_REJECTED':
                                  NotificationIcon = XCircle;
                                  bgColor = 'bg-red-100';
                                  break;
                                case 'MESSAGE':
                                  NotificationIcon = MessageSquare;
                                  bgColor = 'bg-purple-100';
                                  break;
                                default:
                                  NotificationIcon = Bell;
                                  bgColor = 'bg-gray-100';
                              }
                              
                              return (
                                <Link
                                  key={notification.id || `notification-${Math.random()}`}
                                  href={`/notifications/${notification.id || ''}`}
                                  className={cn(
                                    "flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors",
                                    !notification.read && "bg-[#F2FFF8]"
                                  )}
                                >
                                  <div className={cn("p-2 rounded-full flex-shrink-0 mt-0.5", bgColor)}>
                                    <NotificationIcon className="h-4 w-4 text-gray-700" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="font-medium text-sm text-gray-900">{notification.senderName || 'Bruker'}</p>
                                      <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : ''}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{getNotificationText(notification)}</p>
                                    {notification.listingName && (
                                      <div className="mt-1 bg-gray-100 rounded px-2 py-1 text-xs font-medium text-gray-600 inline-block">
                                        {notification.listingName}
                                      </div>
                                    )}
                                    {!notification.read && (
                                      <div className="mt-2 w-2 h-2 rounded-full bg-[#4CD964]"></div>
                                    )}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-12 px-4 text-center">
                            <div className="bg-gray-100 mx-auto h-14 w-14 rounded-full flex items-center justify-center mb-4">
                              <Bell className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-gray-700 font-medium mb-1">Ingen varslinger ennå</p>
                            <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
                              Vi varsler deg når du har nytt aktivitet på kontoen din
                            </p>
                          </div>
                        )}
                        
                        <div className="border-t p-3 bg-gray-50 sticky bottom-0 z-10">
                          <Link 
                            href="/notifications" 
                            className="text-sm text-center block w-full text-[#4CD964] hover:underline"
                          >
                            Se alle varsler
                          </Link>
                        </div>
                      </div>
                    }
                    align="end"
                    contentClassName="w-80 overflow-hidden rounded-xl shadow-lg border border-gray-200"
                  />

                  {/* Messages */}
                  <CustomDropdown
                    trigger={
                      <Button variant="ghost" size="icon" className="relative">
                        <MessageSquare className="h-5 w-5 text-gray-700 hover:text-[#4CD964]" />
                        <span className="sr-only">Meldinger</span>
                        {unreadMessages > 0 && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-[#4CD964] rounded-full flex items-center justify-center">
                            <span className="text-[10px] font-medium text-white">{unreadMessages}</span>
                          </div>
                        )}
                      </Button>
                    }
                    content={
                      <div className="w-80" onMouseEnter={unreadMessages > 0 && !isMarkingRead ? markMessagesAsRead : undefined}>
                        <div className="flex items-center justify-between py-2 px-4 border-b">
                          <span className="font-semibold">Meldinger</span>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href="/chat">Se alle</Link>
                          </Button>
                        </div>
                        {Array.isArray(messages) && messages.length > 0 ? (
                          <div className="divide-y">
                            {messages.map((message) => {
                              if (!message) return null;
                              
                              return (
                                <Link
                                  key={message.message_id || `message-${Math.random()}`}
                                  href={`/chat?conversationId=${message.conversation_id || ''}`}
                                  className="flex items-start gap-3 p-3 hover:bg-accent/5 transition-colors"
                                  onClick={() => {
                                    console.log('Opening conversation:', message.conversation_id)
                                  }}
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
                                      <p className="font-medium truncate">{message.other_user_name || 'Bruker'}</p>
                                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {message.created_at ? formatDistanceToNow(new Date(message.created_at), { addSuffix: true }) : ''}
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{message.content || ''}</p>
                                    {(message.unread_count || 0) > 0 && (
                                      <div className="mt-1 inline-flex items-center rounded-full bg-[#4CD964] px-2 py-1 text-xs font-medium text-white">
                                        {message.unread_count} nye
                                      </div>
                                    )}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-8 text-center">
                            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">
                              Du har ingen meldinger ennå
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Start en samtale ved å klikke på "Send melding" på en brukers profil
                            </p>
                          </div>
                        )}
                      </div>
                    }
                    align="end"
                    contentClassName="w-80"
                  />

                  {/* Add Listing Button */}
                  <Button className="hidden md:flex bg-[#4CD964] hover:bg-[#3DAF50] text-white" asChild>
                    <Link href="/listings/new">Lei ut dine ting</Link>
                  </Button>

                  {/* User Menu */}
                  <CustomDropdown
                    trigger={
                      <Button variant="ghost" size="icon" className="rounded-full border-2 border-gray-100">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.imageUrl} />
                          <AvatarFallback>{user?.firstName?.charAt(0) ?? user?.username?.charAt(0) ?? '?'}</AvatarFallback>
                        </Avatar>
                      </Button>
                    }
                    content={
                      <div className="w-56">
                        <div className="px-4 py-3">
                          <p className="text-sm font-medium">{user.fullName || user.username}</p>
                          <p className="text-xs text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
                    </div>
                        <div className="border-t">
                          <Link href="/profile" className="w-full px-4 py-2 text-sm text-left hover:bg-[#F2FFF8] hover:text-[#4CD964] focus:bg-[#F2FFF8] focus:outline-none transition-colors flex items-center">
                      <Package className="mr-2 h-4 w-4" />
                            <span>Mine annonser</span>
                    </Link>
                          <Link href="/profile/favorites" className="w-full px-4 py-2 text-sm text-left hover:bg-[#F2FFF8] hover:text-[#4CD964] focus:bg-[#F2FFF8] focus:outline-none transition-colors flex items-center">
                      <Heart className="mr-2 h-4 w-4" />
                            <span>Favoritter</span>
                    </Link>
                          <Link href="/profile?tab=settings" className="w-full px-4 py-2 text-sm text-left hover:bg-[#F2FFF8] hover:text-[#4CD964] focus:bg-[#F2FFF8] focus:outline-none transition-colors flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                            <span>Innstillinger</span>
                    </Link>
                        </div>
                        <div className="border-t">
                          <CustomDropdownItem
                            onClick={handleSignOut}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <div className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                              <span>Logg ut</span>
                            </div>
                          </CustomDropdownItem>
                        </div>
                      </div>
                    }
                    align="end"
                    contentClassName="w-56"
                  />
                </>
            ) : (
              <>
                <SignInButton mode="modal">
                    <Button variant="ghost" size="sm" className="text-gray-700 hover:text-[#4CD964]">
                      Logg inn
                    </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                    <Button size="sm" className="bg-[#4CD964] hover:bg-[#3DAF50] text-white">
                      Registrer deg
                    </Button>
                </SignUpButton>
              </>
            )}

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                    <span className="sr-only">Åpne meny</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="overflow-y-auto">
                  <div className="flex flex-col h-full">
                    {/* Mobile Search */}
                    <div className="mb-6">
                      <form onSubmit={handleSearch} className="relative">
                        <Input
                          type="text"
                          placeholder="Søk..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pr-10"
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

                    {/* Mobile Menu Categories */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                        Kategorier
                      </h3>
                      <div className="space-y-1">
                        {categoryGroups.map((group) => (
                          <Link 
                            key={group.name}
                            href={`/category/${group.name.toLowerCase()}`}
                            className="flex items-center py-2 text-base font-medium text-gray-700 hover:text-[#4CD964]"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="mr-3 text-[#4CD964]">{group.icon}</div>
                            {group.name}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Menu Navigation */}
                    <nav className="flex flex-col space-y-4">
                {user ? (
                  <>
                          <Link href="/rental-requests" className="text-base font-medium text-gray-700 hover:text-[#4CD964]" onClick={() => setIsOpen(false)}>
                            Leieforespørsler
                          </Link>
                          <Link href="/chat" className="text-base font-medium text-gray-700 hover:text-[#4CD964]" onClick={() => setIsOpen(false)}>
                            Meldinger
                          </Link>
                          <Link href="/listings/new" className="text-base font-medium text-gray-700 hover:text-[#4CD964]" onClick={() => setIsOpen(false)}>
                            Lei ut dine ting
                          </Link>
                          <div className="border-t pt-4 mt-2">
                            <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                              Min konto
                            </h3>
                            <div className="space-y-2">
                              <Link href="/profile" className="flex items-center text-base font-medium text-gray-700 hover:text-[#4CD964]" onClick={() => setIsOpen(false)}>
                        <Package className="mr-2 h-4 w-4" />
                                <span>Mine annonser</span>
                      </Link>
                              <Link href="/profile/favorites" className="flex items-center text-base font-medium text-gray-700 hover:text-[#4CD964]" onClick={() => setIsOpen(false)}>
                        <Heart className="mr-2 h-4 w-4" />
                                <span>Favoritter</span>
                      </Link>
                              <Link href="/profile?tab=settings" className="flex items-center text-base font-medium text-gray-700 hover:text-[#4CD964]" onClick={() => setIsOpen(false)}>
                        <Settings className="mr-2 h-4 w-4" />
                                <span>Innstillinger</span>
                      </Link>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              handleSignOut()
                              setIsOpen(false)
                            }}
                            className="flex items-center text-base font-medium text-red-600 text-left"
                          >
                      <LogOut className="mr-2 h-4 w-4" />
                            <span>Logg ut</span>
                          </button>
                  </>
                ) : (
                        <div className="flex flex-col space-y-2">
                      <SignInButton mode="modal">
                            <Button variant="outline" className="justify-start border-gray-200 hover:bg-[#F2FFF8] hover:text-[#4CD964]">
                              <User className="mr-2 h-4 w-4" />
                              Logg inn
                            </Button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                            <Button className="justify-start bg-[#4CD964] hover:bg-[#3DAF50]">
                              <User className="mr-2 h-4 w-4" />
                              Registrer deg
                            </Button>
                      </SignUpButton>
                        </div>
                      )}
                    </nav>

                    {/* Help Links */}
                    <div className="mt-auto pt-6 border-t">
                      <div className="flex justify-between">
                        <Link href="/help" className="text-sm text-gray-500 hover:text-[#4CD964]" onClick={() => setIsOpen(false)}>
                          Hjelp
                        </Link>
                        <Link href="/about" className="text-sm text-gray-500 hover:text-[#4CD964]" onClick={() => setIsOpen(false)}>
                          Om oss
                        </Link>
                        <Link href="/contact" className="text-sm text-gray-500 hover:text-[#4CD964]" onClick={() => setIsOpen(false)}>
                          Kontakt
                    </Link>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
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
            className="absolute top-full left-0 right-0 bg-white border-t border-b border-gray-200 shadow-lg z-30"
          >
            <div className="container mx-auto px-4 py-6">
              <form onSubmit={handleSearch} className="max-w-xl mx-auto">
                <div className="relative">
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Søk etter gjenstander..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 border-[#4CD964] focus-visible:ring-[#4CD964] h-12 pl-4 text-lg"
                  />
                  <Button 
                    type="submit" 
                    className="absolute right-0 top-0 h-full bg-[#4CD964] hover:bg-[#3DAF50] rounded-l-none"
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
                      className="rounded-full border-gray-200 hover:border-[#4CD964] hover:bg-[#F2FFF8] hover:text-[#4CD964]"
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

      {/* Background overlay when mega menu is active */}
      <AnimatePresence>
        {activeMegaMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/25 z-10"
            onClick={() => setActiveMegaMenu(null)}
            style={{ pointerEvents: activeMegaMenu ? 'auto' : 'none' }}
          />
        )}
      </AnimatePresence>
    </header>
  )
}

