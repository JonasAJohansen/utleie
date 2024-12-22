import { Suspense } from 'react'
import SearchResults from './SearchResults'
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = 'force-dynamic'

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Search Results</h1>
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults />
      </Suspense>
    </div>
  )
}

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Skeleton className="h-[400px] w-full" />
        </div>
        <div className="md:col-span-3">
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    </div>
  )
}

