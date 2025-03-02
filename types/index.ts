export interface Listing {
  id: string
  name: string
  description: string
  price: number
  user_id: string
  username?: string
  user_image?: string | null
  category_id?: string
  category_name?: string
  location?: string
  latitude?: string | number
  longitude?: string | number
  condition?: string
  rating?: number
  review_count?: number
  created_at?: string
  image?: string
  photos?: ListingPhoto[]
  status?: 'active' | 'inactive' | 'rented'
}

export interface ListingPhoto {
  id: string
  url: string
  description?: string
  isMain: boolean
  displayOrder: number
}

export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  parent_id?: string | null
}

export interface Brand {
  id: string
  name: string
  category_id: string
  category_name?: string
}

export interface User {
  id: string
  username: string
  email?: string
  image_url?: string | null
  created_at?: string
}

export interface Notification {
  id: string
  type: 'RENTAL_REQUEST' | 'REQUEST_APPROVED' | 'REQUEST_REJECTED' | 'MESSAGE'
  read: boolean
  createdAt: string
  senderName: string
  listingName?: string
  related_id?: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
  type?: 'text' | 'image'
}

export interface Conversation {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
  updated_at: string
  other_user_id?: string
  other_user_name?: string
  other_user_avatar?: string
  last_message?: Message
  unread_count?: number
} 