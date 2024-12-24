'use client'

import { useUser } from "@clerk/nextjs"
import { redirect, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from "@/lib/utils"

interface ProfileLayoutProps {
  children: React.ReactNode
}

const profileNavItems = [
  {
    title: "Settings",
    href: "/profile",
  },
  {
    title: "My Listings",
    href: "/profile/listings",
  },
  {
    title: "Wishlist",
    href: "/profile/favorites",
  },
  {
    title: "Saved Searches",
    href: "/profile/saved-searches",
  },
]

export default function ProfileLayout({
  children,
}: ProfileLayoutProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  // Wait for user data to load before redirecting
  if (isLoaded && !user) {
    router.push('/sign-in')
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <nav className="space-y-2">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <ul className="space-y-2">
              {profileNavItems.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className={cn(
                      "block p-2 rounded-lg transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-gray-100"
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="md:col-span-3">
          {children}
        </main>
      </div>
    </div>
  )
}

