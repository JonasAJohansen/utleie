import { clerkClient, clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sql } from '@vercel/postgres'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  
  if (userId) {
    try {
      // Check if user exists in our database
      const existingUser = await sql`
        SELECT id FROM users WHERE id = ${userId}
      `

      if (existingUser.rows.length === 0) {
        // Get user details from Clerk
        const client = await clerkClient()
        const user = await client.users.getUser(userId)
        
        if (user) {
          // Create user in our database
          await sql`
            INSERT INTO users (id, username, email, image_url)
            VALUES (
              ${userId}, 
              ${user.username || `user_${userId.split('_')[1]}`}, 
              ${user.emailAddresses[0]?.emailAddress || ''}, 
              ${user.imageUrl || ''}
            )
          `
        }
      }
    } catch (error) {
      console.error('Error syncing user:', error)
    }
  }

  if (isAdminRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    try {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      
      if (!user.privateMetadata?.role || user.privateMetadata.role !== 'org:admin') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    '/api/:path*'
  ]
}

