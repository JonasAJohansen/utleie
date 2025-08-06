'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, MapPin, Users } from 'lucide-react'

interface Activity {
  id: number
  type: 'rental' | 'signup' | 'review'
  message: string
  location: string
  timeAgo: string
  category?: string
}

export function LiveActivity() {
  const [currentActivity, setCurrentActivity] = useState(0)

  // Sample activities - in a real app, these would come from your API
  const activities: Activity[] = [
    {
      id: 1,
      type: 'rental',
      message: 'Erik leide ut Canon EOS R5',
      location: 'Oslo',
      timeAgo: '2 min siden',
      category: 'Kameraer'
    },
    {
      id: 2,
      type: 'signup',
      message: 'Maria ble med på plattformen',
      location: 'Bergen',
      timeAgo: '5 min siden'
    },
    {
      id: 3,
      type: 'rental',
      message: 'Lars leide borhammer',
      location: 'Trondheim',
      timeAgo: '8 min siden',
      category: 'Verktøy'
    },
    {
      id: 4,
      type: 'review',
      message: 'Anne ga 5 stjerner til utleier',
      location: 'Stavanger',
      timeAgo: '12 min siden'
    },
    {
      id: 5,
      type: 'rental',
      message: 'Thomas leide gaming setup',
      location: 'Kristiansand',
      timeAgo: '15 min siden',
      category: 'Gaming'
    },
    {
      id: 6,
      type: 'signup',
      message: 'Ingrid ble med på plattformen',
      location: 'Tromsø',
      timeAgo: '18 min siden'
    }
  ]

  // Cycle through activities
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity(prev => (prev + 1) % activities.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [activities.length])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'rental':
        return '📦'
      case 'signup':
        return '🎉'
      case 'review':
        return '⭐'
      default:
        return '📦'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'rental':
        return 'text-emerald-600'
      case 'signup':
        return 'text-blue-600'
      case 'review':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentActivity}
          initial={{ opacity: 0, x: -100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.8 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 p-4 hover:shadow-3xl transition-all duration-300 cursor-pointer group"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition-transform duration-300">
                {getActivityIcon(activities[currentActivity].type)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
                  Live
                </span>
              </div>
              
              <p className={`font-medium text-sm ${getActivityColor(activities[currentActivity].type)} mb-1`}>
                {activities[currentActivity].message}
              </p>
              
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{activities[currentActivity].location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{activities[currentActivity].timeAgo}</span>
                </div>
              </div>
              
              {activities[currentActivity].category && (
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                    {activities[currentActivity].category}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Activity counter */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>245 aktive nå</span>
              </div>
              <div className="flex gap-1">
                {activities.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === currentActivity ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}