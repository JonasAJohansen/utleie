'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Pencil, Trash2 } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
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
} from "@/components/ui/alert-dialog"
import { HeartButton } from "@/components/HeartButton"

interface Listing {
  id: string
  name: string
  price: number
  photos: Array<{
    id: string
    url: string
    description: string
    isMain: boolean
    displayOrder: number
  }> | null
  rating: number | null
  location: string
  created_at: string
}

export default function MyListingsPage() {
  const { user } = useUser()
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchListings()
  }, [user])

  async function fetchListings() {
    if (!user) return

    try {
      const response = await fetch(`/api/listings?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setListings(data)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (listingId: string) => {
    try {
      setDeletingId(listingId)
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setListings(listings.filter(listing => listing.id !== listingId))
        toast({
          title: "Listing deleted",
          description: "Your listing has been successfully deleted.",
        })
      } else {
        throw new Error('Failed to delete listing')
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Listings</CardTitle>
        <Button asChild>
          <Link href="/listings/new">Add New Listing</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {listings.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">You haven't created any listings yet.</p>
            <Button asChild>
              <Link href="/listings/new">Create Your First Listing</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <Image 
                    src={listing.photos?.[0]?.url || '/placeholder.svg?height=200&width=300'} 
                    alt={listing.name} 
                    width={300} 
                    height={200} 
                    className="w-full h-48 object-cover" 
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      asChild
                    >
                      <Link href={`/listings/${listing.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="destructive"
                          disabled={deletingId === listing.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your listing.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(listing.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{listing.name}</h3>
                    <HeartButton itemId={listing.id} />
                  </div>
                  <p className="text-gray-600 mb-2">{listing.price} kr/day</p>
                  <div className="flex items-center mb-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1">
                      {typeof listing.rating === 'number' ? listing.rating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.location || 'Location not specified'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

