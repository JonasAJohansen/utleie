import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { LayoutGrid, Tags, Settings, Users, Package, AlertTriangle } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

  // The middleware will handle the admin role check
  // If we get here, the user is already verified as an admin

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r hidden md:block">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-6">Admin Dashboard</h2>
          <nav className="space-y-2">
            <Link 
              href="/admin/dashboard" 
              className={cn(
                buttonVariants({ variant: "ghost" }), 
                "w-full justify-start"
              )}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
            <Link 
              href="/admin/listings" 
              className={cn(
                buttonVariants({ variant: "ghost" }), 
                "w-full justify-start"
              )}
            >
              <Package className="mr-2 h-4 w-4" />
              Listings
            </Link>
            <Link 
              href="/admin/users" 
              className={cn(
                buttonVariants({ variant: "ghost" }), 
                "w-full justify-start"
              )}
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </Link>
            <Link 
              href="/admin/categories" 
              className={cn(
                buttonVariants({ variant: "ghost" }), 
                "w-full justify-start"
              )}
            >
              <Tags className="mr-2 h-4 w-4" />
              Categories
            </Link>
            <Link 
              href="/admin/brands" 
              className={cn(
                buttonVariants({ variant: "ghost" }), 
                "w-full justify-start"
              )}
            >
              <Settings className="mr-2 h-4 w-4" />
              Brands
            </Link>
            <Link 
              href="/admin/reports" 
              className={cn(
                buttonVariants({ variant: "ghost" }), 
                "w-full justify-start"
              )}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Reports
            </Link>
          </nav>
        </div>
      </aside>

      {/* Mobile navigation */}
      <div className="md:hidden w-full bg-gray-50 border-b p-4">
        <nav className="flex justify-around">
          <Link 
            href="/admin/dashboard" 
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" })
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </Link>
          <Link 
            href="/admin/listings" 
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" })
            )}
          >
            <Package className="h-4 w-4" />
          </Link>
          <Link 
            href="/admin/users" 
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" })
            )}
          >
            <Users className="h-4 w-4" />
          </Link>
          <Link 
            href="/admin/categories" 
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" })
            )}
          >
            <Tags className="h-4 w-4" />
          </Link>
          <Link 
            href="/admin/brands" 
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" })
            )}
          >
            <Settings className="h-4 w-4" />
          </Link>
          <Link 
            href="/admin/reports" 
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" })
            )}
          >
            <AlertTriangle className="h-4 w-4" />
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

