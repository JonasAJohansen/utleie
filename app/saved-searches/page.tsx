import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { sql } from '@vercel/postgres'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { Search, Trash2, Loader2 } from 'lucide-react'
import { Suspense } from 'react'

async function getSavedSearches(userId: string) {
  const searches = await sql`
    SELECT id, search_query, created_at
    FROM saved_searches
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `
  return searches.rows
}

function SavedSearchesList({ searches }: { searches: any[] }) {
  if (searches.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">No saved searches</h2>
        <p className="text-muted-foreground mb-6">
          Save your search criteria to get notified when new matching items are listed.
        </p>
        <Button asChild>
          <Link href="/listings">Start Searching</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {searches.map((search) => {
        const query = search.search_query as Record<string, any>
        const queryString = new URLSearchParams(query).toString()
        // Generate a descriptive name based on search parameters
        const searchName = query.q || 'All Items';
        
        return (
          <Card key={search.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {searchName}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <Link href={`/listings?${queryString}`}>
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                  </Link>
                </Button>
                <form action="/api/saved-searches/delete" method="POST">
                  <input type="hidden" name="searchId" value={search.id} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    type="submit"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </form>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Created {formatDistanceToNow(new Date(search.created_at))} ago</p>
                <p className="mt-1">
                  {Object.entries(query)
                    .filter(([key, value]) => value)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(' • ')}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default async function SavedSearchesPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const savedSearches = await getSavedSearches(userId)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Saved Searches</h1>
        <Button asChild variant="outline">
          <Link href="/listings">New Search</Link>
        </Button>
      </div>

      <Suspense fallback={<LoadingState />}>
        <SavedSearchesList searches={savedSearches} />
      </Suspense>
    </div>
  )
} 