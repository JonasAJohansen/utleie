'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Paperclip, 
  MapPin, 
  Smile, 
  MoreHorizontal,
  Zap,
  X,
  Loader2,
  FileText,
  Image as ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover'
import { useToast } from '@/hooks/use-toast'
import { useGeolocation } from '@/hooks/use-geolocation'
import { useWebSocket } from '@/hooks/use-websocket'

interface QuickTemplate {
  id: string
  category: string
  template_text: string
  usage_count: number
  is_system_template: boolean
}

interface MessageInputProps {
  conversationId: string
  onSendMessage: (messageData: any) => void
  replyingTo?: any
  onCancelReply?: () => void
  disabled?: boolean
}

export function MessageInput({
  conversationId,
  onSendMessage,
  replyingTo,
  onCancelReply,
  disabled
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [quickTemplates, setQuickTemplates] = useState<QuickTemplate[]>([])
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isWaitingForLocation, setIsWaitingForLocation] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()
  const { getCurrentPosition, coordinates, city, isLoading, error } = useGeolocation()
  const { sendMessage } = useWebSocket({})

  const handleTyping = (isTyping: boolean) => {
    sendMessage('typing', { conversationId, isTyping })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    } else {
      handleTyping(true)
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false)
      typingTimeoutRef.current = null
    }, 2000)
  }


  useEffect(() => {
    fetchQuickTemplates()
  }, [])

  // Auto-share location once coordinates are obtained
  useEffect(() => {
    if (coordinates && isWaitingForLocation) {
      setIsWaitingForLocation(false)
      shareLocationWithCoordinates()
    }
  }, [coordinates])

  const shareLocationWithCoordinates = async () => {
    if (!coordinates) return

    try {
      const locationData = {
        conversationId,
        content: `📍 Shared location`,
        type: 'location',
        locationLat: coordinates.latitude,
        locationLng: coordinates.longitude,
        locationName: city || 'Unknown Location',
        replyToMessageId: replyingTo?.id
      }

      await onSendMessage(locationData)
      toast({
        title: "Location Shared",
        description: `Your location${city ? ` in ${city}` : ''} has been shared`
      })
    } catch (error) {
      console.error('Error sharing location:', error)
      toast({
        title: "Location Error",
        description: "Failed to share your location",
        variant: "destructive"
      })
    }
  }

  const fetchQuickTemplates = async () => {
    try {
      const response = await fetch('/api/messages/templates')
      if (response.ok) {
        const data = await response.json()
        setQuickTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const handleSend = async () => {
    if (!message.trim() && selectedFiles.length === 0) return

    const messageData: any = {
      conversationId,
      content: message.trim(),
      type: 'text'
    }

    if (replyingTo) {
      messageData.replyToMessageId = replyingTo.id
    }

    // Handle file uploads first
    if (selectedFiles.length > 0) {
      setIsUploading(true)
      try {
        for (const file of selectedFiles) {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('conversationId', conversationId)

          const uploadResponse = await fetch('/api/messages/upload', {
            method: 'POST',
            body: formData
          })

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json()
            
            // Send file message
            await onSendMessage({
              conversationId,
              content: `📎 ${file.name}`,
              type: 'file',
              fileUrl: uploadData.file.url,
              fileName: uploadData.file.name,
              fileSize: uploadData.file.size,
              fileType: uploadData.file.type,
              replyToMessageId: replyingTo?.id
            })
          } else {
            throw new Error('File upload failed')
          }
        }
        setSelectedFiles([])
      } catch (error) {
        console.error('Error uploading files:', error)
        toast({
          title: "Upload Failed",
          description: "Failed to upload one or more files",
          variant: "destructive"
        })
      } finally {
        setIsUploading(false)
      }
    }

    // Send text message if there's content
    if (message.trim()) {
      await onSendMessage(messageData)
    }

    setMessage('')
    onCancelReply?.()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files.slice(0, 5 - prev.length)]) // Max 5 files
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const useTemplate = async (template: QuickTemplate) => {
    setMessage(template.template_text)
    setShowTemplates(false)

    // If it's a simple template, send immediately
    if (template.template_text.length < 50) {
      setTimeout(() => {
        onSendMessage({
          conversationId,
          content: template.template_text,
          type: 'text',
          isTemplateResponse: true,
          templateId: template.id,
          replyToMessageId: replyingTo?.id
        })
        setMessage('')
        onCancelReply?.()
      }, 100)
    }
  }

  const shareLocation = async () => {
    try {
      // If we already have coordinates, share immediately
      if (coordinates) {
        await shareLocationWithCoordinates()
        return
      }

      // Otherwise, request location and wait for it
      setIsWaitingForLocation(true)
      getCurrentPosition()
      
      toast({
        title: "Getting Location",
        description: "Please wait while we get your location..."
      })
    } catch (error) {
      console.error('Error sharing location:', error)
      toast({
        title: "Location Error",
        description: "Failed to get your location",
        variant: "destructive"
      })
      setIsWaitingForLocation(false)
    }
  }

  const groupedTemplates = quickTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, QuickTemplate[]>)

  return (
    <div className="border-t bg-white p-4">
      {/* Reply indicator */}
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between bg-gray-50 p-2 rounded">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">↳ Replying to:</span>
            <span className="font-medium">{replyingTo.sender_username}</span>
            <span className="ml-2 truncate max-w-xs">{replyingTo.content}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancelReply}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Selected files */}
      {selectedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center bg-gray-100 rounded p-2">
              {file.type.startsWith('image/') ? (
                <ImageIcon className="h-4 w-4 mr-2 text-blue-500" />
              ) : (
                <FileText className="h-4 w-4 mr-2 text-gray-500" />
              )}
              <span className="text-sm truncate max-w-xs">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="ml-1 h-5 w-5 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end space-x-2">
        {/* Quick Templates */}
        <Popover open={showTemplates} onOpenChange={setShowTemplates}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0">
              <Zap className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" side="top">
            <div className="max-h-64 overflow-y-auto">
              <div className="p-3 border-b">
                <h4 className="font-medium text-sm">Quick Responses</h4>
              </div>
              {Object.entries(groupedTemplates).map(([category, templates]) => (
                <div key={category} className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-1 capitalize">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {templates.slice(0, 5).map((template) => (
                      <button
                        key={template.id}
                        onClick={() => useTemplate(template)}
                        className="w-full text-left text-sm p-2 hover:bg-gray-50 rounded"
                      >
                        {template.template_text}
                        {template.usage_count > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {template.usage_count}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* File Upload */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="shrink-0"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </Button>

        {/* Location Share */}
        <Button
          variant="outline"
          size="sm"
          onClick={shareLocation}
          className="shrink-0"
        >
          <MapPin className="h-4 w-4" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 flex items-center space-x-2">
          <Input
            value={message}
            onChange={handleInputChange}
            placeholder="Type a message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            disabled={disabled || isUploading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={disabled || isUploading || (!message.trim() && selectedFiles.length === 0)}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar,audio/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
} 