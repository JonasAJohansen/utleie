import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import NotificationsClient from './NotificationsClient'
import { Loader2 } from 'lucide-react'

export default async function NotificationsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }>
        <NotificationsClient />
      </Suspense>
    </div>
  )
} 