'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { 
  Download, 
  MapPin, 
  Eye, 
  Reply, 
  MoreHorizontal,
  ExternalLink,
  Clock,
  FileText,
  Music,
  Film,
  Archive,
  CheckCheck,
  Check,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface EnhancedMessageProps {
  message: {
    id: string
    content: string
    type: string
    sender_id: string
    sender_username: string
    sender_avatar: string
    timestamp: string
    created_at: string
    is_read?: boolean
    read_at?: string
    file_url?: string
    file_name?: string
    file_size?: number
    file_type?: string
    location_lat?: number
    location_lng?: number
    location_name?: string
    reply_to_content?: string
    reply_to_username?: string
    is_template_response?: boolean
  }
  isOwn: boolean
  showAvatar?: boolean
  onReply?: (message: any) => void
  onMarkRead?: (messageId: string) => void
}

export function EnhancedMessage({
  message,
  isOwn,
  showAvatar = true,
  onReply,
  onMarkRead
}: EnhancedMessageProps) {
  const [showReadReceipts, setShowReadReceipts] = useState(false)

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('no-NO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType.startsWith('video/')) return <Film className="h-4 w-4" />
    if (fileType.startsWith('audio/')) return <Music className="h-4 w-4" />
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const openInNewTab = (url: string) => {
    window.open(url, '_blank')
  }

  const handleMapClick = () => {
    if (message.location_lat && message.location_lng) {
      const googleMapsUrl = `https://www.google.com/maps?q=${message.location_lat},${message.location_lng}`
      openInNewTab(googleMapsUrl)
    }
  }

  const renderMessageContent = () => {
    switch (message.type) {
      case 'file':
        return (
          <div className="space-y-2">
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
            
            <Card className="p-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {typeof getFileIcon(message.file_type || '') === 'string' ? (
                      <span className="text-2xl">{getFileIcon(message.file_type || '')}</span>
                    ) : (
                      getFileIcon(message.file_type || '')
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {message.file_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {message.file_size && formatFileSize(message.file_size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {message.file_type?.startsWith('image/') && message.file_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openInNewTab(message.file_url!)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {message.file_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openInNewTab(message.file_url!)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Image preview */}
              {message.file_type?.startsWith('image/') && message.file_url && (
                <div className="mt-2">
                  <Image
                    src={message.file_url}
                    alt={message.file_name || 'Image'}
                    width={300}
                    height={200}
                    className="rounded-lg object-cover cursor-pointer"
                    onClick={() => openInNewTab(message.file_url!)}
                  />
                </div>
              )}
            </Card>
          </div>
        )

      case 'location':
        return (
          <div className="space-y-2">
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
            
            <Card className="p-3 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors" onClick={handleMapClick}>
              <div className="flex items-center space-x-3">
                <MapPin className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium text-blue-900">
                    {message.location_name || 'Shared Location'}
                  </p>
                  <p className="text-sm text-blue-600">
                    {message.location_lat?.toFixed(4)}, {message.location_lng?.toFixed(4)}
                  </p>
                  <p className="text-xs text-blue-500">Click to open in maps</p>
                </div>
              </div>
            </Card>
          </div>
        )

      default:
        return (
          <div className="space-y-1">
            {/* Reply indicator */}
            {message.reply_to_content && (
              <div className="pl-3 border-l-2 border-gray-300 bg-gray-50 p-2 rounded text-xs text-gray-600">
                <span className="font-medium">{message.reply_to_username}:</span>
                <span className="ml-1">{message.reply_to_content}</span>
              </div>
            )}
            
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            
            {message.is_template_response && (
              <Badge variant="secondary" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Quick Response
              </Badge>
            )}
          </div>
        )
    }
  }

  return (
    <div className={cn(
      "flex gap-3 group",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender_avatar} />
          <AvatarFallback>{message.sender_username[0]}</AvatarFallback>
        </Avatar>
      )}

      {/* Message bubble */}
      <div className={cn(
        "max-w-[70%] space-y-1",
        isOwn ? "items-end" : "items-start"
      )}>
        {/* Sender name */}
        {!isOwn && showAvatar && (
          <p className="text-xs text-gray-500 px-3">
            {message.sender_username}
          </p>
        )}

        {/* Message content */}
        <div className={cn(
          "rounded-lg p-3 shadow-sm",
          isOwn 
            ? "bg-emerald-500 text-white" 
            : "bg-white border"
        )}>
          {renderMessageContent()}
        </div>

        {/* Message metadata */}
        <div className={cn(
          "flex items-center gap-2 px-3 text-xs",
          isOwn ? "justify-end" : "justify-start"
        )}>
          <span className="text-gray-500">
            {formatTime(message.timestamp || message.created_at)}
          </span>
          
          {/* Read receipt indicator */}
          {isOwn && (
            <div className="flex items-center text-gray-400">
              {message.read_at ? (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </div>
          )}

          {/* Message actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {onReply && (
                  <DropdownMenuItem onClick={() => onReply(message)}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                )}
                {!isOwn && onMarkRead && !message.read_at && (
                  <DropdownMenuItem onClick={() => onMarkRead(message.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Mark as read
                  </DropdownMenuItem>
                )}
                {isOwn && (
                  <DropdownMenuItem onClick={() => setShowReadReceipts(!showReadReceipts)}>
                    <Clock className="h-4 w-4 mr-2" />
                    Read receipts
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
} 