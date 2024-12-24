'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Menu, Plus, ShieldCheck, Heart, Bookmark, Package, Settings, LogOut } from 'lucide-react'
import { SignInButton, SignUpButton, useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from 'react'

interface Notification {
  id: string
  type: 'RENTAL_REQUEST' | 'REQUEST_APPROVED' | 'REQUEST_REJECTED' | 'MESSAGE'
  read: boolean
  createdAt: string
  senderName: string
  listingName?: string
}

export default function Navigation() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchNotifications()
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

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
        fetchNotifications()
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }
    router.push(getNotificationLink(notification))
  }

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'RENTAL_REQUEST':
        return `${notification.senderName} requested to rent ${notification.listingName}`
      case 'REQUEST_APPROVED':
        return `Your rental request for ${notification.listingName} was approved`
      case 'REQUEST_REJECTED':
        return `Your rental request for ${notification.listingName} was rejected`
      case 'MESSAGE':
        return `New message from ${notification.senderName}`
      default:
        return 'New notification'
    }
  }

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'RENTAL_REQUEST':
        return '/rental-requests'
      case 'REQUEST_APPROVED':
      case 'REQUEST_REJECTED':
        return '/profile/rentals'
      case 'MESSAGE':
        return '/messages'
      default:
        return '#'
    }
  }

  const handleSignOut = () => {
    signOut()
    router.push('/')
  }

  const UserAvatar = () => (
    <Avatar>
      <AvatarImage src={user?.imageUrl} />
      <AvatarFallback>{user?.firstName?.charAt(0) ?? user?.username?.charAt(0) ?? '?'}</AvatarFallback>
    </Avatar>
  )

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-primary">RentEase</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                {user && (
                  <>
                    <Link href="/rental-requests" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center">
                      Rental Requests
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Link>
                    <Link href="/chat" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Chat</Link>
                  </>
                )}
                {user?.publicMetadata?.role === 'admin' && (
                  <Link href="/admin" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                    <ShieldCheck className="h-5 w-5 inline-block mr-1" />
                    Admin
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 5).map(notification => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={`p-4 ${!notification.read ? 'bg-accent' : ''}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {getNotificationText(notification)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button asChild>
                  <Link href="/listings/new">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Listing
                  </Link>
                </Button>
              </>
            )}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                    <UserAvatar />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.fullName || user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile/listings" className="flex items-center">
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Listings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/favorites" className="flex items-center">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Wishlist</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/saved-searches" className="flex items-center">
                      <Bookmark className="mr-2 h-4 w-4" />
                      <span>Saved Searches</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Sign Up</Button>
                </SignUpButton>
              </>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/">Home</Link>
                </DropdownMenuItem>
                {user && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/rental-requests" className="flex items-center">
                        Rental Requests
                        {unreadCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                          >
                            {unreadCount}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/chat">Chat</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/listings/new">Add Listing</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                {user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/listings" className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        <span>My Listings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/favorites" className="flex items-center">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Wishlist</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/saved-searches" className="flex items-center">
                        <Bookmark className="mr-2 h-4 w-4" />
                        <span>Saved Searches</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem>
                      <SignInButton mode="modal">
                        Sign In
                      </SignInButton>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <SignUpButton mode="modal">
                        Sign Up
                      </SignUpButton>
                    </DropdownMenuItem>
                  </>
                )}
                {user?.publicMetadata?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center">
                      <ShieldCheck className="h-5 w-5 mr-2" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}

