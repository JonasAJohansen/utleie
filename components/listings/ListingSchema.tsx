'use client'

import { type Product, type AggregateRating, type Offer, type Organization } from 'schema-dts'

interface ListingSchemaProps {
  item: {
    id: string
    name: string
    description: string
    price: number
    rating: number
    reviewCount: number
    location?: string | null
    userId: string
    username: string
    condition?: string
    mainImage?: string
    images?: string[]
    categoryName?: string
  }
  url: string
}

export function ListingSchema({ item, url }: ListingSchemaProps) {
  const mainImageUrl = item.mainImage || '/placeholder.svg'
  const images = item.images || [mainImageUrl]
  
  // Only include rating if there's at least one review
  const hasRating = !isNaN(item.rating) && item.reviewCount > 0
  
  // Build the structured data object
  const productSchema: Product = {
    '@type': 'Product',
    name: item.name,
    description: item.description,
    image: images,
    url,
    sku: item.id,
    brand: {
      '@type': 'Brand',
      name: item.username,
    },
    ...(item.categoryName && {
      category: item.categoryName,
    }),
    ...(item.condition && {
      itemCondition: {
        '@id': `https://schema.org/${getConditionSchema(item.condition)}`
      },
    }),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'NOK',
      price: item.price,
      priceValidUntil: getNextYearDate(),
      availability: 'https://schema.org/InStock',
      url,
      seller: {
        '@type': 'Person',
        name: item.username,
        identifier: item.userId,
      },
      itemOffered: {
        '@type': 'Product',
        name: item.name,
      },
      businessFunction: {
        '@id': 'http://purl.org/goodrelations/v1#LeaseOut'
      },
      validFrom: new Date().toISOString(),
    },
  }
  
  // Add rating if available
  if (hasRating) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: item.rating.toString(),
      reviewCount: item.reviewCount,
      bestRating: '5',
      worstRating: '1',
    }
  }
  
  // Organization schema for the rental platform
  const organizationSchema: Organization = {
    '@type': 'Organization',
    name: 'RentEase',
    url: 'https://rentease.no',
    logo: 'https://rentease.no/logo.png',
  }
  
  // Complete schema with @context
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [productSchema, organizationSchema],
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function getConditionSchema(condition: string): string {
  const conditionMapping: Record<string, string> = {
    'helt_ny': 'NewCondition',
    'som_ny': 'NewCondition',
    'pent_brukt': 'UsedCondition',
    'godt_brukt': 'UsedCondition',
  }
  
  return conditionMapping[condition] || 'UsedCondition'
}

function getNextYearDate(): string {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  return date.toISOString().split('T')[0]
} 