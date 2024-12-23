import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sql } from '@vercel/postgres'
import { clerkClient } from '@clerk/nextjs/server'

const isAdminRoute = createRouteMatcher(['/admin', '/admin/(.*)'])

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
      console.log('Middleware - No user ID')
      return new Response('Unauthorized', { status: 401 })
    }

    // Check if user has admin role
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      console.log('User metadata:', user.privateMetadata)
      
      if (!user.privateMetadata?.role || user.privateMetadata.role !== 'org:admin') {
        console.log('Middleware - Not admin')
        return new Response('Not authorized', { status: 403 })
      }
    } catch (error) {
      console.log('Middleware - Error checking admin status:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/admin',
    '/admin/(.*)',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

