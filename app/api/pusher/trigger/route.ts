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

    // Get event details from request
    const { channel, event, data } = await request.json()

    // Validate required fields
    if (!channel || !event) {
      return new NextResponse('Channel and event are required', { status: 400 })
    }

    // Validate private channel format
    if (!channel.startsWith('private-')) {
      return new NextResponse('Invalid channel format', { status: 400 })
    }

    // Ensure user can only trigger events on their own channels
    const channelSuffix = `-${userId}`
    if (!channel.endsWith(channelSuffix)) {
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

    // Trigger the event
    await pusher.trigger(channel, event, data || {})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Pusher trigger error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
} 