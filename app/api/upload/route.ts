import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get the form data from the request
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return new NextResponse('No file provided', { status: 400 })
    }

    // Generate a unique filename to prevent collisions
    const uniqueFilename = `${userId}-${Date.now()}-${file.name}`

    // Convert the file to a buffer/blob for upload
    const buffer = await file.arrayBuffer()

    // Get the presigned URL for upload
    const { url, uploadUrl } = await put(uniqueFilename, buffer, {
      access: 'public',
      contentType: file.type,
    })

    return NextResponse.json({ url, uploadUrl })
  } catch (error) {
    console.error('Error in upload route:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 