import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Pusher from 'pusher'

export async function POST(request: NextRequest) {
  try {
    // Check user authentication
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get socket ID and channel name from request
    const body = await request.json()
    const { socket_id, channel_name } = body

    // Validate channel name format
    if (!channel_name.startsWith('private-')) {
      return new NextResponse('Invalid channel', { status: 400 })
    }

    // Ensure user can only connect to their own channels
    const channelSuffix = `-${userId}`
    if (!channel_name.endsWith(channelSuffix)) {
      return new NextResponse('Unauthorized channel access', { status: 403 })
    }

    // Initialize Pusher with server credentials
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true
    })

    // Generate auth token
    const authResponse = pusher.authorizeChannel(socket_id, channel_name)

    return NextResponse.json(authResponse)
  } catch (error) {
    console.error('Pusher auth error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
} 