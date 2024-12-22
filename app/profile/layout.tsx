import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useUser()

  if (!user) {
    redirect('/sign-in')
  }

  const navItems = [
    { name: 'My Account', href: '/profile' },
    { name: 'My Listings', href: '/profile/listings' },
    { name: 'Favorites', href: '/profile/favorites' },
    { name: 'Saved Searches', href: '/profile/saved-searches' },
  ]

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <Card className="md:w-64 flex-shrink-0">
        <CardContent className="p-6">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={user.imageUrl} alt={user.fullName || ''} />
              <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold text-center">{user.fullName}</h2>
            <p className="text-sm text-gray-500 text-center">@{user.username}</p>
            <p className="text-sm text-gray-500 text-center mb-4">{user.primaryEmailAddress?.emailAddress}</p>
            <Button asChild className="w-full">
              <Link href="/profile/edit">Edit Profile</Link>
            </Button>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </CardContent>
      </Card>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  )
}

