import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'

interface RecentlyViewedItem {
  id: string
  name: string
  price: number
  image?: string
  location?: string
  viewedAt: string
}

const MAX_RECENT_ITEMS = 10
const STORAGE_KEY = 'recently_viewed_items'

export const useRecentlyViewed = () => {
  const [recentItems, setRecentItems] = useState<RecentlyViewedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()

  // Load recently viewed items on mount
  useEffect(() => {
    loadRecentItems()
  }, [user])

  const loadRecentItems = async () => {
    setIsLoading(true)
    try {
      if (user) {
        // For authenticated users, load from database
        const response = await fetch('/api/users/recently-viewed')
        if (response.ok) {
          const data = await response.json()
          setRecentItems(data.items || [])
        } else {
          // Fallback to localStorage if API fails
          loadFromLocalStorage()
        }
      } else {
        // For guest users, load from localStorage
        loadFromLocalStorage()
      }
    } catch (error) {
      console.error('Error loading recent items:', error)
      loadFromLocalStorage()
    } finally {
      setIsLoading(false)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const items = JSON.parse(stored)
        // Filter out items older than 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        const validItems = items.filter((item: RecentlyViewedItem) => item.viewedAt > thirtyDaysAgo)
        setRecentItems(validItems)
        
        // Update localStorage if we filtered out old items
        if (validItems.length !== items.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validItems))
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      setRecentItems([])
    }
  }

  const saveToLocalStorage = (items: RecentlyViewedItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  const addItem = useCallback(async (item: Omit<RecentlyViewedItem, 'viewedAt'>) => {
    const newItem: RecentlyViewedItem = {
      ...item,
      viewedAt: new Date().toISOString()
    }

    try {
      if (user) {
        // For authenticated users, save to database
        const response = await fetch('/api/users/recently-viewed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newItem),
        })

        if (response.ok) {
          const data = await response.json()
          setRecentItems(data.items || [])
        } else {
          // Fallback to localStorage if API fails
          updateLocalItems(newItem)
        }
      } else {
        // For guest users, save to localStorage
        updateLocalItems(newItem)
      }
    } catch (error) {
      console.error('Error adding recent item:', error)
      updateLocalItems(newItem)
    }
  }, [user])

  const updateLocalItems = (newItem: RecentlyViewedItem) => {
    setRecentItems(prev => {
      // Remove existing item if it exists
      const filtered = prev.filter(item => item.id !== newItem.id)
      
      // Add new item at the beginning
      const updated = [newItem, ...filtered].slice(0, MAX_RECENT_ITEMS)
      
      // Save to localStorage
      saveToLocalStorage(updated)
      
      return updated
    })
  }

  const removeItem = useCallback(async (itemId: string) => {
    try {
      if (user) {
        // For authenticated users, remove from database
        const response = await fetch(`/api/users/recently-viewed/${itemId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          const data = await response.json()
          setRecentItems(data.items || [])
        } else {
          // Fallback to localStorage if API fails
          updateLocalItemsRemove(itemId)
        }
      } else {
        // For guest users, remove from localStorage
        updateLocalItemsRemove(itemId)
      }
    } catch (error) {
      console.error('Error removing recent item:', error)
      updateLocalItemsRemove(itemId)
    }
  }, [user])

  const updateLocalItemsRemove = (itemId: string) => {
    setRecentItems(prev => {
      const updated = prev.filter(item => item.id !== itemId)
      saveToLocalStorage(updated)
      return updated
    })
  }

  const clearAll = useCallback(async () => {
    try {
      if (user) {
        // For authenticated users, clear database
        const response = await fetch('/api/users/recently-viewed', {
          method: 'DELETE',
        })

        if (response.ok) {
          setRecentItems([])
        } else {
          // Fallback to localStorage if API fails
          clearLocalStorage()
        }
      } else {
        // For guest users, clear localStorage
        clearLocalStorage()
      }
    } catch (error) {
      console.error('Error clearing recent items:', error)
      clearLocalStorage()
    }
  }, [user])

  const clearLocalStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setRecentItems([])
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  return {
    recentItems,
    isLoading,
    addItem,
    removeItem,
    clearAll,
    refresh: loadRecentItems
  }
} 