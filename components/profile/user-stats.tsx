import { Card, CardContent } from "@/components/ui/card"
import { Package, Star, Clock, MessageSquare } from 'lucide-react'

interface UserStatsProps {
  stats: {
    totalListings: number
    averageRating: number
    responseRate: number
    activeRentals: number
    totalRentals: number
    reviewCount: number
  }
}

export function UserStats({ stats }: UserStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[#4CD964]/10 rounded-full">
              <Package className="h-6 w-6 text-[#4CD964]" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Listings</p>
              <p className="text-2xl font-bold">{stats.totalListings}</p>
              <p className="text-xs text-muted-foreground">
                {stats.activeRentals} active now
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rating</p>
              <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">
                {stats.reviewCount} reviews
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Response</p>
              <p className="text-2xl font-bold">{stats.responseRate}%</p>
              <p className="text-xs text-muted-foreground">
                Response rate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-100 rounded-full">
              <MessageSquare className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rentals</p>
              <p className="text-2xl font-bold">{stats.totalRentals}</p>
              <p className="text-xs text-muted-foreground">
                Total rentals
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 