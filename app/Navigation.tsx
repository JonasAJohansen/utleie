'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Menu, Plus, Search, ShieldCheck } from 'lucide-react'
import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs"

export default function Navigation() {
  const { user } = useUser()
  console.log('Full user object:', user)
  console.log('User metadata:', user?.publicMetadata)
  console.log('User ID:', user?.id)
  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-primary">RentEase</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                <Link href="/listings" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Listings</Link>
                <Link href="/chat" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Chat</Link>
                {user?.publicMetadata?.role === 'admin' && (
                  <Link href="/admin" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                    <ShieldCheck className="h-5 w-5 inline-block mr-1" />
                    Admin
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button asChild>
              <Link href="/listings/new">
                <Plus className="h-5 w-5 mr-2" />
                Add Listing
              </Link>
            </Button>
            {user ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Sign Up</Button>
                </SignUpButton>
              </>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="/">Home</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/listings">Listings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/chat">Chat</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/listings/new">Add Listing</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user ? (
                  <>
                    <DropdownMenuItem>
                      <Link href="/profile">Profile & Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserButton afterSignOutUrl="/" />
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem>
                      <SignInButton mode="modal">
                        Sign In
                      </SignInButton>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <SignUpButton mode="modal">
                        Sign Up
                      </SignUpButton>
                    </DropdownMenuItem>
                  </>
                )}
                {user?.publicMetadata?.role === 'admin' && (
                  <DropdownMenuItem>
                    <Link href="/admin" className="flex items-center">
                      <ShieldCheck className="h-5 w-5 mr-2" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}

