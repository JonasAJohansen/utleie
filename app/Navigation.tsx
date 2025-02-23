'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ChevronDown, User, Bell, MessageSquare, Package, Heart, Settings, LogOut, Menu } from 'lucide-react'
import { SignInButton, SignUpButton, useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from 'react'
import { CustomDropdown, CustomDropdownItem } from '@/components/ui/custom-dropdown'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

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

  useEffect(() => {
    if (user) {
      fetchNotifications()
      fetchMessages()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages...')
      const response = await fetch('/api/messages/recent')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched messages:', data)
        setMessages(data)
        setUnreadMessages(data.reduce((acc: number, msg: Message) => acc + msg.unread_count, 0))
      } else {
        console.error('Error fetching messages:', await response.text())
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const markMessagesAsRead = async () => {
    if (isMarkingRead || unreadMessages === 0) return
    
    try {
      setIsMarkingRead(true)
      console.log('Marking messages as read...')
      const response = await fetch('/api/messages/mark-read', {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Marked messages as read:', data.markedCount)
        setUnreadMessages(0)
        // Update the messages state to reflect read status
        setMessages(messages.map(msg => ({
          ...msg,
          unread_count: 0
        })))
      } else {
        console.error('Error marking messages as read:', await response.text())
      }
    } catch (error) {
      console.error('Error marking messages as read:', error)
    } finally {
      setIsMarkingRead(false)
    }
  }

  const handleSignOut = () => {
    signOut()
    router.push('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-[#00B9FF]">RentEase</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <CustomDropdown
              trigger={
                <Button variant="ghost" className="text-base font-medium">
                  Kategorier <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              }
              content={
                <>
                  <CustomDropdownItem>Elektronikk</CustomDropdownItem>
                  <CustomDropdownItem>Verktøy</CustomDropdownItem>
                  <CustomDropdownItem>Sport</CustomDropdownItem>
                  <CustomDropdownItem>Kjøretøy</CustomDropdownItem>
                  <CustomDropdownItem>Klær</CustomDropdownItem>
                </>
              }
              align="start"
            />
            <Link href="/listings" className="text-base font-medium">
              Utforsk
            </Link>
            {user && (
              <Link href="/rental-requests" className="text-base font-medium">
                Leieforespørsler
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <CustomDropdown
                  trigger={
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      <span className="sr-only">Varsler</span>
                      {unreadCount > 0 && (
                        <div className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></div>
                      )}
                    </Button>
                  }
                  content={
                    <div className="w-80">
                      <div className="flex items-center justify-between py-2 px-4 border-b">
                        <span className="font-semibold">Varsler</span>
                        <Button variant="ghost" size="sm">
                          Merk alle som lest
                        </Button>
                      </div>
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div key={notification.id} className="p-4 border-b last:border-0">
                            <p className="font-medium">{notification.senderName}</p>
                            <p className="text-sm text-gray-500">{notification.listingName}</p>
                          </div>
                        ))
                      ) : (
                        <div className="py-2 px-4 text-sm text-muted-foreground">
                          Du har ingen nye varsler.
                        </div>
                      )}
                    </div>
                  }
                  align="end"
                  contentClassName="w-80"
                />

                {/* Messages */}
                <CustomDropdown
                  trigger={
                    <Button variant="ghost" size="icon" className="relative">
                      <MessageSquare className="h-5 w-5" />
                      <span className="sr-only">Meldinger</span>
                      {unreadMessages > 0 && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-[10px] font-medium text-white">{unreadMessages}</span>
                        </div>
                      )}
                    </Button>
                  }
                  content={
                    <div className="w-80" onMouseEnter={markMessagesAsRead}>
                      <div className="flex items-center justify-between py-2 px-4 border-b">
                        <span className="font-semibold">Meldinger</span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="/chat">Se alle</Link>
                        </Button>
                      </div>
                      {messages.length > 0 ? (
                        <div className="divide-y">
                          {messages.map((message) => (
                            <Link
                              key={message.message_id}
                              href={`/chat?conversationId=${message.conversation_id}`}
                              className="flex items-start gap-3 p-3 hover:bg-accent/5 transition-colors"
                              onClick={() => {
                                console.log('Opening conversation:', message.conversation_id)
                              }}
                            >
                              <Image
                                src={message.other_user_avatar || '/placeholder.svg'}
                                alt={message.other_user_name}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-medium truncate">{message.other_user_name}</p>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{message.content}</p>
                                {message.unread_count > 0 && (
                                  <div className="mt-1 inline-flex items-center rounded-full bg-[#4CD964] px-2 py-1 text-xs font-medium text-white">
                                    {message.unread_count} nye
                                  </div>
                                )}
                              </div>
                            </Link>
                          ))}
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
                <Button variant="ghost" className="hidden md:flex" asChild>
                  <Link href="/listings/new">Lei ut dine ting</Link>
                </Button>

                {/* User Menu */}
                <CustomDropdown
                  trigger={
                    <Button variant="ghost" size="icon" className="rounded-full">
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
                        <Link href="/profile" className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors flex items-center">
                          <Package className="mr-2 h-4 w-4" />
                          <span>Mine annonser</span>
                        </Link>
                        <Link href="/profile/favorites" className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors flex items-center">
                          <Heart className="mr-2 h-4 w-4" />
                          <span>Favoritter</span>
                        </Link>
                        <Link href="/profile?tab=settings" className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors flex items-center">
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
                  <Button variant="ghost" size="sm">
                    Logg inn
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm" className="bg-[#00B9FF] hover:bg-[#00A3E6]">
                    Registrer deg
                  </Button>
                </SignUpButton>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Åpne meny</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col space-y-4">
                  <Link href="/listings" className="text-base font-medium" onClick={() => setIsOpen(false)}>
                    Utforsk
                  </Link>
                  {user ? (
                    <>
                      <Link href="/rental-requests" className="text-base font-medium" onClick={() => setIsOpen(false)}>
                        Leieforespørsler
                      </Link>
                      <Link href="/chat" className="text-base font-medium" onClick={() => setIsOpen(false)}>
                        Meldinger
                      </Link>
                      <Link href="/listings/new" className="text-base font-medium" onClick={() => setIsOpen(false)}>
                        Lei ut dine ting
                      </Link>
                      <Link href="/profile/listings" className="text-base font-medium" onClick={() => setIsOpen(false)}>
                        Mine annonser
                      </Link>
                      <Link href="/profile/favorites" className="text-base font-medium" onClick={() => setIsOpen(false)}>
                        Favoritter
                      </Link>
                      <Link href="/profile" className="text-base font-medium" onClick={() => setIsOpen(false)}>
                        Innstillinger
                      </Link>
                      <button 
                        onClick={() => {
                          handleSignOut()
                          setIsOpen(false)
                        }}
                        className="text-base font-medium text-red-600 text-left"
                      >
                        Logg ut
                      </button>
                    </>
                  ) : (
                    <>
                      <SignInButton mode="modal">
                        <button className="text-base font-medium text-left">Logg inn</button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button className="text-base font-medium text-left">Registrer deg</button>
                      </SignUpButton>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

