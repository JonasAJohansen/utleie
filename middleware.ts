import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

const isAdminRoute = createRouteMatcher(['/admin', '/admin/(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const { userId } = await auth()
    console.log('Middleware - User ID:', userId)
    
    if (!userId) {
      console.log('Middleware - No user ID')
      return new Response('Unauthorized', { status: 401 })
    }

    // Get the user from Clerk
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    console.log('Middleware - User:', user)
    
    if (!user?.publicMetadata?.role || user.publicMetadata.role !== 'admin') {
      console.log('Middleware - Not admin')
      return new Response('Not authorized', { status: 403 })
    }
  }
  
  return NextResponse.next()
}, { debug: true })

export const config = {
  matcher: [
    '/admin',
    '/admin/(.*)',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

