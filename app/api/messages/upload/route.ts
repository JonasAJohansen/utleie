import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  // Documents
  'application/pdf', 'text/plain', 'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Archives
  'application/zip', 'application/x-rar-compressed',
  // Audio
  'audio/mpeg', 'audio/wav', 'audio/ogg',
  // Video
  'video/mp4', 'video/webm', 'video/quicktime'
]

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const conversationId = formData.get('conversationId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 100MB' 
      }, { status: 413 })
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'File type not allowed',
        allowedTypes: ALLOWED_FILE_TYPES
      }, { status: 415 })
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name)
    const fileName = `${uuidv4()}${fileExtension}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'messages')
    const filePath = path.join(uploadDir, fileName)

    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error('Error creating upload directory:', error)
    }

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Generate file URL
    const fileUrl = `/uploads/messages/${fileName}`

    // Determine if file is an image for thumbnail generation
    const isImage = file.type.startsWith('image/')
    let thumbnailUrl = null

    if (isImage) {
      // For images, use the same URL as thumbnail (could implement actual thumbnail generation here)
      thumbnailUrl = fileUrl
    }

    const fileInfo = {
      url: fileUrl,
      name: file.name,
      size: file.size,
      type: file.type,
      mimeType: file.type,
      isImage,
      thumbnailUrl,
      uploadedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      file: fileInfo,
      message: 'File uploaded successfully'
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ 
      error: 'File upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Get file info
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 })
    }

    // Return file metadata (you could extend this to get actual file stats)
    return NextResponse.json({
      filename,
      url: `/uploads/messages/${filename}`,
      exists: true // You could check if file actually exists on disk
    })

  } catch (error) {
    console.error('Error getting file info:', error)
    return NextResponse.json({ 
      error: 'Failed to get file info' 
    }, { status: 500 })
  }
} 