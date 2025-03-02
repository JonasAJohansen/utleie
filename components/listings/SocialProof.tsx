'use client'

import { useState, useEffect } from 'react'
import { Eye, Clock, TrendingUp, ShieldCheck, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SocialProofProps {
  listingId: string
  className?: string
}

export function SocialProof({ listingId, className }: SocialProofProps) {
  // In a real app, you'd fetch these from an API
  // For now, we'll generate some realistic mock data
  const [views, setViews] = useState(0)
  const [recentRentals, setRecentRentals] = useState(0)
  const [isHighDemand, setIsHighDemand] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchSocialData = async () => {
      setIsLoading(true)
      
      try {
        // In a real app, fetch data from API
        // For demo, generate random data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Generate realistic numbers
        const randomViews = Math.floor(Math.random() * 150) + 50
        const randomRentals = Math.floor(Math.random() * 10)
        const randomHighDemand = Math.random() > 0.6
        
        setViews(randomViews)
        setRecentRentals(randomRentals)
        setIsHighDemand(randomHighDemand)
      } catch (error) {
        console.error('Error fetching social proof data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSocialData()
    
    // Simulate incremental view count for demo purposes
    const interval = setInterval(() => {
      setViews(prev => prev + 1)
    }, 60000) // Add a view every minute
    
    return () => clearInterval(interval)
  }, [listingId])
  
  if (isLoading) {
    return (
      <div className={cn("animate-pulse h-10", className)}>
        <div className="bg-gray-200 h-full rounded-lg w-full"></div>
      </div>
    )
  }
  
  return (
    <div className={cn("", className)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Views indicator */}
        <div className="bg-blue-50 rounded-lg p-3 flex items-center">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <Eye className="h-4 w-4 text-blue-700" />
          </div>
          <div>
            <p className="font-medium text-blue-900 text-sm">
              {views} people viewed
            </p>
            <p className="text-blue-700 text-xs">
              in the last 24 hours
            </p>
          </div>
        </div>
        
        {/* Recent rentals */}
        {recentRentals > 0 && (
          <div className="bg-green-50 rounded-lg p-3 flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <Clock className="h-4 w-4 text-green-700" />
            </div>
            <div>
              <p className="font-medium text-green-900 text-sm">
                Rented {recentRentals} times
              </p>
              <p className="text-green-700 text-xs">
                in the last 30 days
              </p>
            </div>
          </div>
        )}
        
        {/* High demand indicator */}
        {isHighDemand && (
          <div className="bg-yellow-50 rounded-lg p-3 flex items-center">
            <div className="bg-yellow-100 p-2 rounded-full mr-3">
              <TrendingUp className="h-4 w-4 text-yellow-700" />
            </div>
            <div>
              <p className="font-medium text-yellow-900 text-sm">
                High demand
              </p>
              <p className="text-yellow-700 text-xs">
                Usually rented quickly
              </p>
            </div>
          </div>
        )}
        
        {/* If not high demand or no recent rentals, show trust indicator */}
        {(!isHighDemand || recentRentals === 0) && (
          <div className="bg-purple-50 rounded-lg p-3 flex items-center">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <ShieldCheck className="h-4 w-4 text-purple-700" />
            </div>
            <div>
              <p className="font-medium text-purple-900 text-sm">
                Trusted owner
              </p>
              <p className="text-purple-700 text-xs">
                Verified identity
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
} 