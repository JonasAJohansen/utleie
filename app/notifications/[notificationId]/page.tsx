import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { sql } from '@vercel/postgres'
import NotificationDetailClient from './NotificationDetailClient'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

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

async function getNotification(notificationId: string, userId: string): Promise<NotificationData | null> {
  const result = await sql`
    SELECT 
      n.*,
      sender.username as "senderName",
      CASE 
        WHEN n.type LIKE 'REQUEST%' THEN l.name
        ELSE NULL
      END as "listingName",
      CASE 
        WHEN n.type LIKE 'REQUEST%' THEN rr.listing_id
        ELSE NULL
      END as "listingId"
    FROM notifications n
    LEFT JOIN users sender ON n.sender_id = sender.id
    LEFT JOIN rental_requests rr ON n.related_id = rr.id
    LEFT JOIN listings l ON rr.listing_id = l.id
    WHERE n.id = ${notificationId}::uuid AND n.user_id = ${userId}
  `
  
  if (result.rowCount === 0) {
    return null
  }
  
  // Mark notification as read
  await sql`
    UPDATE notifications
    SET is_read = true
    WHERE id = ${notificationId}::uuid
  `
  
  return result.rows[0] as NotificationData
}

export default async function NotificationDetailPage({ params }: { params: Promise<{ notificationId: string }> }) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  const { notificationId } = await params
  const notification = await getNotification(notificationId, userId)
  
  if (!notification) {
    redirect('/notifications')
  }
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }>
        <NotificationDetailClient notification={notification} />
      </Suspense>
    </div>
  )
} 