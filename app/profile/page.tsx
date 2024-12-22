import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Star, Package, Search } from 'lucide-react'
import { useUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"

export default function ProfilePage() {
  const { user } = useUser()

  if (!user) {
    redirect('/sign-in')
  }

  const stats = [
    { name: 'Active Listings', value: 5, icon: Package },
    { name: 'Total Rentals', value: 23, icon: Star },
    { name: 'Unread Messages', value: 3, icon: MessageSquare },
    { name: 'Saved Searches', value: 7, icon: Search },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Welcome, {user.firstName}! Here you can view and manage your account information, listings, favorites, and saved searches.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.name}>
                <CardContent className="flex flex-col items-center p-4">
                  <stat.icon className="h-8 w-8 text-primary mb-2" />
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

