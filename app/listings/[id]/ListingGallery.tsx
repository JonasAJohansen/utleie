'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, ImageIcon, Maximize, ZoomIn, ZoomOut } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

// Define interface for drag info
interface DragInfo {
  offset: {
    x: number;
    y: number;
  };
  velocity: {
    x: number;
    y: number;
  };
}

interface ListingPhoto {
  id: string
  url: string
  description: string
  isMain: boolean
  displayOrder: number
}

export default function ListingGallery({ photos }: { photos: ListingPhoto[] }) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  if (!photos || photos.length === 0) {
    return (
      <div className="relative h-96 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <ImageIcon className="mx-auto h-12 w-12 mb-2" />
          <p className="font-medium">Ingen bilder tilgjengelig</p>
          <p className="text-sm mt-1">Eieren har ikke lastet opp noen bilder enda</p>
        </div>
      </div>
    )
  }

  const mainPhoto = photos.find(p => p.isMain) || photos[0]
  const otherPhotos = photos.filter(p => p !== mainPhoto)

  const handlePrevPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
    resetZoom()
  }

  const handleNextPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
    resetZoom()
  }

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
    resetZoom()
  }

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3))
  }

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1))
  }

  const resetZoom = () => {
    setZoomLevel(1)
    setDragPosition({ x: 0, y: 0 })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevPhoto()
    if (e.key === 'ArrowRight') handleNextPhoto()
    if (e.key === 'Escape') setIsDialogOpen(false)
    if (e.key === 'f') toggleFullScreen()
    if (e.key === '+') zoomIn()
    if (e.key === '-') zoomOut()
  }

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div 
        className="relative h-[450px] rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-white"
        onClick={() => {
          setSelectedPhotoIndex(photos.indexOf(mainPhoto))
          setIsDialogOpen(true)
        }}
      >
        <div className="absolute inset-0 cursor-zoom-in bg-gradient-to-t from-black/10 via-transparent to-transparent">
          <Image
            src={mainPhoto.url}
            alt={mainPhoto.description || "Bilde av produkt"}
            fill
            className="object-cover transition-transform hover:scale-105 duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          
          {/* Badge for main photo */}
          <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-md">
            Main Photo
          </div>
          
          {/* Zoom indicator */}
          <div className="absolute bottom-4 right-4 bg-black/70 text-white rounded-full p-2">
            <ZoomIn className="h-5 w-5" />
          </div>
          
          {/* Photo count indicator */}
          <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-md">
            {photos.length} Photos
          </div>
        </div>
      </div>

      {otherPhotos.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {otherPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm cursor-pointer"
              onClick={() => {
                setSelectedPhotoIndex(photos.indexOf(photo))
                setIsDialogOpen(true)
              }}
            >
              <Image
                src={photo.url}
                alt={photo.description || `Photo ${index + 2}`}
                fill
                className="object-cover transition-transform hover:scale-110 duration-500"
                sizes="(max-width: 768px) 33vw, 25vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300"></div>
            </motion.div>
          ))}
          
          {/* Placeholder tiles if we have less than 4 other photos to maintain grid appearance */}
          {Array.from({ length: Math.max(0, 4 - otherPhotos.length) }).map((_, i) => (
            <div key={`placeholder-${i}`} className="h-24 rounded-lg bg-gray-100 border border-gray-200"></div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className={cn(
            "max-w-4xl p-0 overflow-hidden",
            isFullScreen ? "fixed inset-0 max-w-none w-screen h-screen rounded-none" : ""
          )}
          onKeyDown={handleKeyDown}
        >
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/70 to-transparent flex flex-row justify-between text-white">
            <div>
              <DialogTitle className="text-white">{photos[selectedPhotoIndex].description || `Photo ${selectedPhotoIndex + 1} of ${photos.length}`}</DialogTitle>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-black/20" 
                onClick={zoomOut}
                disabled={zoomLevel <= 1}
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-black/20" 
                onClick={zoomIn}
                disabled={zoomLevel >= 3}
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-black/20" 
                onClick={toggleFullScreen}
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
          
          <div 
            ref={containerRef}
            className="relative h-[70vh] overflow-hidden bg-gray-900 flex items-center justify-center"
            style={isFullScreen ? { height: '100vh' } : {}}
          >
            <motion.div
              drag={zoomLevel > 1}
              dragConstraints={containerRef}
              dragElastic={0.1}
              dragMomentum={false}
              style={{ 
                scale: zoomLevel,
                x: dragPosition.x,
                y: dragPosition.y
              }}
              onDragEnd={(e: MouseEvent | TouchEvent | PointerEvent, info: DragInfo) => {
                setDragPosition({ 
                  x: dragPosition.x + info.offset.x, 
                  y: dragPosition.y + info.offset.y 
                })
              }}
              className="relative w-full h-full"
            >
              <Image
                src={photos[selectedPhotoIndex].url}
                alt={photos[selectedPhotoIndex].description || `Photo ${selectedPhotoIndex + 1}`}
                fill
                sizes="100vw"
                className={cn(
                  "object-contain transition-all duration-300",
                  zoomLevel > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
                )}
                onClick={() => zoomLevel === 1 ? zoomIn() : resetZoom()}
                priority
                quality={90}
              />
            </motion.div>
            
            {/* Navigation buttons */}
            <div className={cn(
              "absolute inset-y-0 left-0 flex items-center transition-opacity",
              zoomLevel > 1 ? "opacity-0" : "opacity-100" 
            )}>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevPhoto();
                }}
                size="icon"
                variant="ghost"
                className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/75 ml-4"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>
            
            <div className={cn(
              "absolute inset-y-0 right-0 flex items-center transition-opacity",
              zoomLevel > 1 ? "opacity-0" : "opacity-100"
            )}>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextPhoto();
                }}
                size="icon"
                variant="ghost"
                className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/75 mr-4"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
          
          {/* Thumbnails */}
          <div className="bg-black p-2 flex justify-center gap-2 overflow-x-auto">
            {photos.map((photo, index) => (
              <div 
                key={photo.id} 
                className={cn(
                  "relative w-16 h-16 rounded overflow-hidden cursor-pointer border-2",
                  selectedPhotoIndex === index ? "border-white" : "border-transparent opacity-70 hover:opacity-100"
                )}
                onClick={() => {
                  setSelectedPhotoIndex(index)
                  resetZoom()
                }}
              >
                <Image
                  src={photo.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
} 