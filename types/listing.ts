export interface Listing {
  id: string;
  name: string;
  description: string;
  price: number;
  available_from: string;
  available_to: string;
  security_deposit?: number;
  condition?: string;
  location?: string;
  rating?: number;
  review_count?: number;
  user_id: string;
  username?: string;
  user_image?: string | null;
  category_id?: string;
  category_name?: string;
  created_at?: string;
  photos?: ListingPhoto[];
  min_rental_days?: number;
}

export interface ListingPhoto {
  id: string;
  url: string;
  description?: string;
  isMain: boolean;
  displayOrder: number;
} 