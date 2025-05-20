'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Package, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Bell,
  Trash2
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface NotificationData {
  id: string
  type: string
  content: string
  is_read: boolean
  created_at: string
  sender_id: string
  user_id: string
  related_id: string
  senderName: string
  listingName?: string
  listingId?: string
}

export default function NotificationDetailClient({ notification }: { notification: NotificationData }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Safety check to ensure notification exists
  if (!notification) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Bell className="h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-medium text-gray-700">Notification not found</h2>
        <p className="text-gray-500 mb-6">This notification may have been deleted or does not exist.</p>
        <Button onClick={() => router.push('/notifications')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Notifications
        </Button>
      </div>
    )
  }
  
  // Try to parse the date, but provide a fallback if it fails
  let formattedDate
  try {
    formattedDate = formatDistanceToNow(parseISO(notification.created_at), { addSuffix: true })
  } catch (error) {
    formattedDate = 'Recently'
  }
  
  const getNotificationIcon = () => {
    if (!notification || !notification.type) return <Bell className="h-6 w-6" />;
    
    switch (notification.type) {
      case 'RENTAL_REQUEST':
        return <Package className="h-6 w-6" />
      case 'REQUEST_APPROVED':
        return <CheckCircle2 className="h-6 w-6" />
      case 'REQUEST_REJECTED':
        return <XCircle className="h-6 w-6" />
      case 'REQUEST_CANCELED':
        return <XCircle className="h-6 w-6" />
      case 'MESSAGE':
        return <MessageSquare className="h-6 w-6" />
      default:
        return <Bell className="h-6 w-6" />
    }
  }

  const getNotificationColor = () => {
    if (!notification || !notification.type) return 'bg-gray-100 text-gray-600';
    
    switch (notification.type) {
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

  const getNotificationTitle = () => {
    if (!notification || !notification.type) return 'Notification';
    
    switch (notification.type) {
      case 'RENTAL_REQUEST':
        return 'New Rental Request'
      case 'REQUEST_APPROVED':
        return 'Request Approved'
      case 'REQUEST_REJECTED':
        return 'Request Rejected'
      case 'REQUEST_CANCELED':
        return 'Request Canceled'
      case 'MESSAGE':
        return 'New Message'
      default:
        return 'Notification'
    }
  }

  const getActionButtonLink = () => {
    if (!notification || !notification.type || !notification.related_id) 
      return '/notifications';
    
    if (notification.type === 'MESSAGE') {
      return `/conversations/${notification.related_id}`
    }
    
    if (notification.type === 'RENTAL_REQUEST') {
      return `/rental-requests?id=${notification.related_id}`
    }
    
    if (notification.type.startsWith('REQUEST_')) {
      return `/rental-requests?id=${notification.related_id}`
    }
    
    return '/'
  }

  const getActionButtonText = () => {
    if (!notification || !notification.type) return 'View Details';
    
    if (notification.type === 'MESSAGE') {
      return 'View Conversation'
    }
    
    if (notification.type === 'RENTAL_REQUEST') {
      return 'View Request'
    }
    
    if (notification.type.startsWith('REQUEST_')) {
      return 'View Request'
    }
    
    return 'View Details'
  }

  const deleteNotification = async () => {
    if (!notification || !notification.id) {
      toast({
        title: 'Error',
        description: 'Invalid notification data',
        variant: 'destructive',
      })
      return;
    }
    
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/notifications/${notification.id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Notification deleted successfully',
        })
        router.push('/notifications')
      } else {
        throw new Error('Failed to delete notification')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/notifications')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Notifications
        </Button>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-start gap-4">
          <div className={`p-3 rounded-full ${getNotificationColor()}`}>
            {getNotificationIcon()}
          </div>
          <div className="flex-1">
            <CardTitle>{getNotificationTitle()}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              From {notification.senderName || 'Unknown'} • {formattedDate}
            </p>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="text-lg">{notification.content || 'No content available'}</div>
            
            {notification.listingName && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">Listing: {notification.listingName}</p>
                {notification.listingId && (
                  <Button 
                    variant="link" 
                    asChild 
                    className="p-0 h-auto mt-1 font-normal text-blue-600"
                  >
                    <Link href={`/listings/${notification.listingId}`}>View Listing</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between gap-4">
          <Button asChild>
            <Link href={getActionButtonLink()}>
              {getActionButtonText()}
            </Link>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this notification? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={deleteNotification} 
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </>
  )
} 