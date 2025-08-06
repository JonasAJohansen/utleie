import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { sanitizeMessageContent } from '@/lib/phone-utils'
import { sendMessage } from '@/lib/websocket'
import { sendSSEMessage } from '@/lib/sse-messaging'

export async function GET(request: Request) {
  try {
    const session = await auth()
    const userId = session?.userId
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    
    if (!conversationId) {
      return new NextResponse('Conversation ID is required', { status: 400 })
    }

    // Verify user has access to this conversation
    const { rows: conversationRows } = await sql.query(`
      SELECT * FROM conversations 
      WHERE id = $1
      AND (user1_id = $2 OR user2_id = $2)
    `, [conversationId, userId])

    if (conversationRows.length === 0) {
      return new NextResponse('Conversation not found', { status: 404 })
    }

    const { rows: messageRows } = await sql.query(`
      SELECT 
        m.*,
        m.created_at as timestamp,
        u.username as sender_username,
        u.image_url as sender_avatar,
        reply_msg.content as reply_to_content,
        reply_user.username as reply_to_username
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN messages reply_msg ON m.reply_to_message_id = reply_msg.id
      LEFT JOIN users reply_user ON reply_msg.sender_id = reply_user.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `, [conversationId])

    return NextResponse.json(messageRows)
  } catch (error) {
    console.error('[MESSAGES_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.userId
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { 
      conversationId, 
      content, 
      type = 'text',
      fileUrl,
      fileName,
      fileSize,
      fileType,
      locationLat,
      locationLng,
      locationName,
      replyToMessageId,
      isTemplateResponse,
      templateId,
      videoCallUrl,
      videoCallExpiresAt
    } = body
    
    if (!conversationId || (!content && !fileUrl && !locationLat && !videoCallUrl)) {
      return new NextResponse('Missing required content', { status: 400 })
    }

    // Verify user has access to this conversation
    const { rows: conversationRows } = await sql.query(`
      SELECT * FROM conversations 
      WHERE id = $1
      AND (user1_id = $2 OR user2_id = $2)
    `, [conversationId, userId])

    if (conversationRows.length === 0) {
      return new NextResponse('Conversation not found', { status: 404 })
    }

    const messageId = uuidv4()
    const timestamp = new Date().toISOString()
    
    // Sanitize content to remove Norwegian phone numbers
    let sanitizedContent = content
    let phoneNumbersBlocked = false
    
    if (content) {
      const sanitizationResult = sanitizeMessageContent(content)
      sanitizedContent = sanitizationResult.sanitized
      phoneNumbersBlocked = sanitizationResult.hadPhoneNumbers
      
      // Log phone number blocking for debugging
      if (phoneNumbersBlocked) {
        console.log('[PHONE_BLOCKING]', {
          userId,
          conversationId,
          messageId,
          phoneNumbersFound: sanitizationResult.phoneNumbersFound.length,
          originalLength: content.length,
          sanitizedLength: sanitizedContent.length
        })
      }
    }
    
    // Build dynamic SQL query based on provided fields
    const fields = ['id', 'conversation_id', 'sender_id', 'type', 'created_at']
    const values = [messageId, conversationId, userId, type, timestamp]
    let valueIndex = 6

    if (sanitizedContent) {
      fields.push('content')
      values.push(sanitizedContent)
      valueIndex++
    }

    if (fileUrl) {
      fields.push('file_url', 'file_name', 'file_size', 'file_type')
      values.push(fileUrl, fileName, fileSize, fileType)
      valueIndex += 4
    }

    if (locationLat && locationLng) {
      fields.push('location_lat', 'location_lng')
      values.push(locationLat, locationLng)
      valueIndex += 2
      if (locationName) {
        fields.push('location_name')
        values.push(locationName)
        valueIndex++
      }
    }

    if (replyToMessageId) {
      fields.push('reply_to_message_id')
      values.push(replyToMessageId)
      valueIndex++
    }

    if (isTemplateResponse) {
      fields.push('is_template_response')
      values.push(isTemplateResponse)
      valueIndex++
      if (templateId) {
        fields.push('template_id')
        values.push(templateId)
        valueIndex++
      }
    }

    if (videoCallUrl) {
      fields.push('video_call_url')
      values.push(videoCallUrl)
      valueIndex++
      if (videoCallExpiresAt) {
        fields.push('video_call_expires_at')
        values.push(videoCallExpiresAt)
        valueIndex++
      }
    }

    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ')
    const fieldsList = fields.join(', ')

    const { rows: messageRows } = await sql.query(`
      WITH new_message AS (
        INSERT INTO messages (${fieldsList})
        VALUES (${placeholders})
        RETURNING *
      )
      SELECT 
        nm.*,
        u.username as sender_username,
        u.image_url as sender_avatar,
        reply_msg.content as reply_to_content,
        reply_user.username as reply_to_username
      FROM new_message nm
      JOIN users u ON nm.sender_id = u.id
      LEFT JOIN messages reply_msg ON nm.reply_to_message_id = reply_msg.id
      LEFT JOIN users reply_user ON reply_msg.sender_id = reply_user.id
    `, values)

    // Update template usage count if this was a template response
    if (isTemplateResponse && templateId) {
      await sql.query(`
        UPDATE quick_response_templates 
        SET usage_count = usage_count + 1 
        WHERE id = $1 OR template_id = $1
      `, [templateId])
    }

    // Send real-time notification to the recipient
    const conversation = conversationRows[0]
    const recipientId = conversation.user1_id === userId ? conversation.user2_id : conversation.user1_id
    
    if (recipientId) {
      const messageData = {
        type: 'new_message',
        message: messageRows[0],
        conversationId: conversationId
      }
      
      console.log(`[MESSAGE_DELIVERY] Sending message from ${userId} to ${recipientId} in conversation ${conversationId}`)
      
      // Try WebSocket first, fallback to SSE
      const wsSuccess = sendMessage(recipientId, messageData)
      if (wsSuccess) {
        console.log(`[MESSAGE_DELIVERY] WebSocket delivery successful to ${recipientId}`)
      } else {
        console.log(`[MESSAGE_DELIVERY] WebSocket failed, trying SSE for ${recipientId}`)
        const sseSuccess = sendSSEMessage(recipientId, messageData)
        if (sseSuccess) {
          console.log(`[MESSAGE_DELIVERY] SSE delivery successful to ${recipientId}`)
        } else {
          console.log(`[MESSAGE_DELIVERY] Both WebSocket and SSE failed for ${recipientId}`)
        }
      }
    } else {
      console.warn(`[MESSAGE_DELIVERY] No recipient found for conversation ${conversationId}`)
    }

    return NextResponse.json(messageRows[0])
  } catch (error) {
    console.error('[MESSAGES_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

