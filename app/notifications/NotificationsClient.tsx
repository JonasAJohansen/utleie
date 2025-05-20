'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Bell, 
  Package, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  CheckCheck
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'RENTAL_REQUEST' | 'REQUEST_APPROVED' | 'REQUEST_REJECTED' | 'REQUEST_CANCELED' | 'MESSAGE'
  read: boolean
  createdAt: string
  senderName: string
  listingName?: string
  related_id?: string
}

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        // Ensure we have an array, even if the API returns null/undefined
        setNotifications(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast({
        title: 'Error',
        description: 'Failed to load notifications. Please try again.',
        variant: 'destructive',
      })
      // Set to empty array on error to prevent undefined errors
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }

  const markAllAsRead = async () => {
    // Guard against empty notifications array
    if (!notifications || notifications.length === 0) return
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
      })

      if (response.ok) {
        setNotifications(notifications.map(notification => ({
          ...notification,
          read: true
        })))
        
        toast({
          title: 'Success',
          description: 'All notifications marked as read',
        })
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        variant: 'destructive',
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'RENTAL_REQUEST':
        return <Package className="h-5 w-5" />
      case 'REQUEST_APPROVED':
        return <CheckCircle2 className="h-5 w-5" />
      case 'REQUEST_REJECTED':
        return <XCircle className="h-5 w-5" />
      case 'REQUEST_CANCELED':
        return <XCircle className="h-5 w-5" />
      case 'MESSAGE':
        return <MessageSquare className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'RENTAL_REQUEST':
        return 'bg-blue-100 text-blue-600'
      case 'REQUEST_APPROVED':
        return 'bg-green-100 text-green-600'
      case 'REQUEST_REJECTED':
        return 'bg-red-100 text-red-600'
      case 'REQUEST_CANCELED':
        return 'bg-orange-100 text-orange-600'
      case 'MESSAGE':
        return 'bg-purple-100 text-purple-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getNotificationText = (notification: Notification) => {
    // Safely check for notification type
    if (!notification || !notification.type) return 'Notification received';
    
    // Display relevant text based on notification type
    switch (notification.type) {
      case 'RENTAL_REQUEST':
        return `wants to rent your ${notification.listingName || 'listing'}`
      case 'REQUEST_APPROVED':
        return `approved your request to rent ${notification.listingName || 'listing'}`
      case 'REQUEST_REJECTED':
        return `rejected your request to rent ${notification.listingName || 'listing'}`
      case 'REQUEST_CANCELED':
        return `canceled the rental request for ${notification.listingName || 'listing'}`
      case 'MESSAGE':
        return 'sent you a message'
      default:
        return 'sent you a notification'
    }
  }

  const getNotificationLink = (notification: Notification) => {
    if (!notification) return '/';
    
    if (notification.type === 'MESSAGE') {
      return `/conversations/${notification.related_id || ''}`
    }
    
    if (notification.type && notification.type.startsWith('REQUEST')) {
      return `/rental-requests?id=${notification.related_id || ''}`
    }

    return `/listings/${notification.related_id || ''}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <p>Loading notifications...</p>
      </div>
    )
  }

  // Safety check for notifications array
  const safeNotifications = notifications || [];
  const hasUnread = safeNotifications.some(notif => notif && !notif.read)

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{safeNotifications.length} Notifications</h2>
        {hasUnread && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-sm"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {safeNotifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">You don't have any notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {safeNotifications.map((notification) => {
            // Skip rendering if notification is undefined or has no id
            if (!notification || !notification.id) return null;
            
            return (
              <Link 
                key={notification.id}
                href={getNotificationLink(notification)}
                className={cn(
                  "block p-4 rounded-md border hover:bg-gray-50 transition-colors",
                  !notification.read && "bg-gray-50 border-blue-100"
                )}
              >
                <div className="flex gap-3">
                  <div className={cn(
                    "p-2 rounded-full flex-shrink-0 h-9 w-9 flex items-center justify-center",
                    getNotificationColor(notification.type)
                  )}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-gray-900">
                        {notification.senderName || 'Unknown User'}
                      </p>
                      <span className="text-sm text-gray-500">
                        {notification.createdAt ? 
                          formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 
                          'Recently'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {getNotificationText(notification)}
                    </p>
                    
                    {notification.listingName && (
                      <div className="mt-2 inline-block bg-gray-100 text-xs font-medium rounded px-2 py-1">
                        {notification.listingName}
                      </div>
                    )}
                    
                    {!notification.read && (
                      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  )
} 