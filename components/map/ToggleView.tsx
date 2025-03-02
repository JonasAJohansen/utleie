'use client'

import { Button } from '@/components/ui/button'
import { LayoutGrid, Map, SplitSquareVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ToggleViewProps {
  activeView: 'list' | 'map' | 'split'
  onViewChange: (view: 'list' | 'map' | 'split') => void
}

export function ToggleView({ activeView, onViewChange }: ToggleViewProps) {
  return (
    <div className="bg-white rounded-full shadow-md p-1 flex items-center">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "rounded-full relative",
          activeView === 'list' && "bg-gray-100"
        )}
        onClick={() => onViewChange('list')}
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        <span className="text-sm">List</span>
        {activeView === 'list' && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute inset-0 bg-gray-100 rounded-full -z-10"
          />
        )}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "rounded-full relative",
          activeView === 'split' && "bg-gray-100"
        )}
        onClick={() => onViewChange('split')}
      >
        <SplitSquareVertical className="h-4 w-4 mr-2" />
        <span className="text-sm">Split</span>
        {activeView === 'split' && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute inset-0 bg-gray-100 rounded-full -z-10"
          />
        )}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "rounded-full relative",
          activeView === 'map' && "bg-gray-100"
        )}
        onClick={() => onViewChange('map')}
      >
        <Map className="h-4 w-4 mr-2" />
        <span className="text-sm">Map</span>
        {activeView === 'map' && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute inset-0 bg-gray-100 rounded-full -z-10"
          />
        )}
      </Button>
    </div>
  )
} 