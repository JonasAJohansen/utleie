import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, MessageCircle, MapPin, DollarSign, Flag } from 'lucide-react'
import { UserReview } from '@/components/UserReview'
import { ScrollArea } from "@/components/ui/scroll-area"
import { RentalRequest } from '@/components/RentalRequest'
import { ReportDialog } from '@/components/ReportDialog'
import { HeartButton } from '@/components/HeartButton'
import { Badge } from "@/components/ui/badge"
import { ItemGrid } from '@/components/ItemGrid'
import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'

async function getListingData(id: string) {
  try {
    const result = await sql`
      SELECT l.*, u.username, u.image_url as user_image
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ${id}
    `
    return result.rows[0]
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch listing')
  }
}

export default async function ItemListing({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const resolvedParams = await Promise.resolve(params)
  const item = await getListingData(resolvedParams.id)
  const { userId } = await auth()

  if (!item) {
    notFound()
  }

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative h-96 rounded-lg overflow-hidden">
            <Image src={item.image} alt={item.name} fill className="object-cover" />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{item.name}</h1>
            <HeartButton itemId={item.id} />
          </div>
          <div className="flex items-center mb-4">
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            <span className="ml-1 font-semibold">{item.rating ? item.rating.toFixed(1) : 'N/A'}</span>
          </div>
          <div className="flex items-center mb-4 text-2xl font-bold text-green-600">
            <DollarSign className="h-6 w-6 mr-1" />
            {item.price}
            <span className="text-base font-normal text-gray-600 ml-1">/ day</span>
          </div>
          <div className="flex items-center mb-6 text-gray-600">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{item.location || 'Location not specified'}</span>
          </div>
          <p className="text-gray-700 mb-6">{item.description}</p>
          <div className="flex space-x-4">
            <RentalRequest 
              itemId={item.id} 
              itemName={item.name} 
              pricePerDay={item.price}
              unavailableDates={[]}
            />
            <Button asChild>
              <Link href={`/chat?userId=${item.user_id}&listingId=${item.id}&listingName=${encodeURIComponent(item.name)}`}>
                <MessageCircle className="mr-2 h-4 w-4" /> Chat with Owner
              </Link>
            </Button>
            <Button variant="outline">
              <Flag className="mr-2 h-4 w-4" /> Report Listing
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About the Owner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Image src={item.user_image || '/placeholder.svg?height=100&width=100'} alt={item.username} width={64} height={64} className="rounded-full" />
            <div className="ml-4">
              <Link href={`/profile/${item.user_id}`} className="text-xl font-semibold hover:underline">
                {item.username}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* You can add more sections here, such as reviews, related items, etc. */}
    </div>
  )
}

