import Link from 'next/link'
import { Plus, Search, MessageCircle, Settings } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'

interface NavbarProps {
  isAdmin?: boolean
}

export default function Navbar({ isAdmin = false }: NavbarProps) {
  return (
    <nav className="flex items-center gap-4">
      <Link href="/listings/new" className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        <span>Legg ut annonse</span>
      </Link>

      <Link href="/listings" className="flex items-center gap-2">
        <Search className="h-4 w-4" />
        <span>Søk</span>
      </Link>

      <Link href="/chat" className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        <span>Meldinger</span>
      </Link>

      {isAdmin && (
        <Link href="/admin" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Admin</span>
        </Link>
      )}

      <UserButton afterSignOutUrl="/" />
    </nav>
  )
} 