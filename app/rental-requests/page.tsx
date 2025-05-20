import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import RentalRequestsClient from './RentalRequestsClient'

export default async function RentalRequestsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ id?: string; type?: string; status?: string }> 
}) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  const params = await searchParams

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Rental Requests</h1>
      
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }>
        <RentalRequestsClient 
          selectedRequestId={params.id} 
          initialType={params.type || 'all'} 
          initialStatus={params.status || 'all'} 
        />
      </Suspense>
    </div>
  )
} 