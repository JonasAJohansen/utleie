import { useState, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { ImagePlus, X, Star, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoUploadProps {
  photos: Array<{
    file: File
    description: string
    previewUrl: string
    isMain: boolean
  }>
  onPhotosChange: (photos: Array<{
    file: File
    description: string
    previewUrl: string
    isMain: boolean
  }>) => void
  maxPhotos?: number
  className?: string
}

export function PhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 4,
  className
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newPhotos = Array.from(files).map((file, index) => ({
      file,
      description: '',
      previewUrl: URL.createObjectURL(file),
      isMain: photos.length === 0 && index === 0 // First photo is main by default
    }))

    if (photos.length + newPhotos.length > maxPhotos) {
      alert(`Du kan kun laste opp ${maxPhotos} bilder`)
      return
    }

    onPhotosChange([...photos, ...newPhotos])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    if (photos[index].isMain && newPhotos.length > 0) {
      newPhotos[0].isMain = true
    }
    onPhotosChange(newPhotos)
  }

  const handleSetMainPhoto = (index: number) => {
    const newPhotos = photos.map((photo, i) => ({
      ...photo,
      isMain: i === index
    }))
    onPhotosChange(newPhotos)
  }

  const handleDescriptionChange = (index: number, description: string) => {
    const newPhotos = [...photos]
    newPhotos[index].description = description
    onPhotosChange(newPhotos)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Photo Grid */}
      <div className="grid grid-cols-2 gap-4">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.previewUrl}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative group"
          >
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src={photo.previewUrl}
                alt={`Bilde ${index + 1}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Photo Actions */}
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="secondary"
                className={cn(
                  'h-8 w-8 rounded-full',
                  photo.isMain && 'bg-yellow-400 hover:bg-yellow-500'
                )}
                onClick={() => handleSetMainPhoto(index)}
              >
                <Star className={cn('h-4 w-4', photo.isMain && 'fill-white text-white')} />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8 rounded-full"
                onClick={() => handleRemovePhoto(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Main Photo Badge */}
            {photo.isMain && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 rounded-full">
                <span className="text-xs font-medium text-white">Hovedbilde</span>
              </div>
            )}

            {/* Description Input */}
            <Input
              value={photo.description}
              onChange={(e) => handleDescriptionChange(index, e.target.value)}
              placeholder="Legg til beskrivelse"
              className="mt-2"
            />
          </motion.div>
        ))}

        {/* Upload Button */}
        {photos.length < maxPhotos && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div
              className={cn(
                'relative aspect-[4/3] rounded-lg border-2 border-dashed',
                'hover:border-[#4CD964] hover:bg-[#4CD964]/5 transition-colors cursor-pointer',
                'flex items-center justify-center',
                isDragging && 'border-[#4CD964] bg-[#4CD964]/5'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm text-gray-600">
                  Last opp bilde
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Help Text */}
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4 mt-0.5" />
        <div>
          <p>Last opp opptil {maxPhotos} bilder av gjenstanden.</p>
          <p>Det første bildet blir automatisk satt som hovedbilde.</p>
        </div>
      </div>
    </div>
  )
} 