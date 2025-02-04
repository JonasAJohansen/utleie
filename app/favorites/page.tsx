import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { sql } from '@vercel/postgres'
import ListingCard from '@/app/components/ListingCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

async function getFavorites(userId: string) {
  const favorites = await sql`
    SELECT 
      f.id as favorite_id,
      l.*,
      u.username,
      u.image_url as user_image,
      COALESCE(r.average_rating, 0) as rating,
      COALESCE(r.review_count, 0) as review_count
    FROM favorites f
    JOIN listings l ON f.listing_id = l.id
    JOIN users u ON l.user_id = u.id
    LEFT JOIN (
      SELECT 
        listing_id,
        COUNT(*) as review_count,
        AVG(rating) as average_rating
      FROM reviews
      GROUP BY listing_id
    ) r ON l.id = r.listing_id
    WHERE f.user_id = ${userId}
    ORDER BY f.created_at DESC
  `
  return favorites.rows
}

function FavoritesList({ favorites, userId }: { favorites: any[], userId: string }) {
  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">No favorites yet</h2>
        <p className="text-muted-foreground mb-6">
          Start adding items to your favorites to keep track of listings you're interested in.
        </p>
        <Button asChild>
          <Link href="/listings">Browse Listings</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {favorites.map((listing) => (
        <ListingCard
          key={listing.id}
          data={listing}
          currentUser={userId}
          showFavoriteButton
          initialIsFavorited={true}
        />
      ))}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export default async function FavoritesPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const favorites = await getFavorites(userId)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Favorites</h1>
        <Button asChild variant="outline">
          <Link href="/listings">Browse More</Link>
        </Button>
      </div>

      <Suspense fallback={<LoadingState />}>
        <FavoritesList favorites={favorites} userId={userId} />
      </Suspense>
    </div>
  )
} 