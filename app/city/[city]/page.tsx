import { notFound } from 'next/navigation'
import Link from 'next/link'
import { sql } from '@vercel/postgres'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Users, TrendingUp, Star, ArrowRight } from 'lucide-react'
import { AnimatedSection } from "@/app/components/AnimatedSection"

interface PageProps {
  params: Promise<{ city: string }>
}

// Major Norwegian cities with coordinates
const NORWEGIAN_CITIES = {
  'oslo': { name: 'Oslo', lat: 59.9139, lng: 10.7522, county: 'Oslo' },
  'bergen': { name: 'Bergen', lat: 60.3913, lng: 5.3221, county: 'Vestland' },
  'trondheim': { name: 'Trondheim', lat: 63.4305, lng: 10.3951, county: 'Trøndelag' },
  'stavanger': { name: 'Stavanger', lat: 58.9700, lng: 5.7331, county: 'Rogaland' },
  'tromsø': { name: 'Tromsø', lat: 69.6492, lng: 18.9553, county: 'Troms og Finnmark' },
  'kristiansand': { name: 'Kristiansand', lat: 58.1599, lng: 8.0182, county: 'Agder' },
  'drammen': { name: 'Drammen', lat: 59.7440, lng: 10.2045, county: 'Viken' },
  'fredrikstad': { name: 'Fredrikstad', lat: 59.2181, lng: 10.9298, county: 'Viken' },
  'sandnes': { name: 'Sandnes', lat: 58.8522, lng: 5.7414, county: 'Rogaland' },
  'bodø': { name: 'Bodø', lat: 67.2804, lng: 14.4050, county: 'Nordland' }
}

async function getCityData(citySlug: string) {
  const cityInfo = NORWEGIAN_CITIES[citySlug as keyof typeof NORWEGIAN_CITIES]
  if (!cityInfo) return null

  try {
    // Get popular categories with local listing counts
    const categoriesResult = await sql`
      SELECT 
        c.name,
        c.icon,
        c.description,
        COUNT(l.id) as listing_count
      FROM categories c
      LEFT JOIN listings l ON c.name = l.category_id 
        AND l.status = 'active'
        AND l.location ILIKE ${`%${cityInfo.name}%`}
      WHERE c.is_active = true AND c.is_popular = true
      GROUP BY c.name, c.icon, c.description
      ORDER BY listing_count DESC, c.name ASC
      LIMIT 6
    `

    // Get recent listings in the city
    const listingsResult = await sql`
      WITH listing_photos_main AS (
        SELECT DISTINCT ON (listing_id) 
          listing_id, 
          url
        FROM listing_photos
        WHERE is_main = true
        ORDER BY listing_id, display_order
      )
      SELECT 
        l.id,
        l.name,
        l.price,
        l.location,
        l.category_id,
        COALESCE(lp.url, '') as image,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(r.id) as review_count,
        u.username,
        l.created_at
      FROM listings l
      LEFT JOIN listing_photos_main lp ON l.id = lp.listing_id
      LEFT JOIN reviews r ON l.id = r.listing_id
      LEFT JOIN users u ON l.user_id = u.id
      WHERE 
        l.status = 'active' 
        AND l.location ILIKE ${`%${cityInfo.name}%`}
      GROUP BY 
        l.id, l.name, l.price, l.location, l.category_id,
        lp.url, u.username, l.created_at
      ORDER BY l.created_at DESC
      LIMIT 8
    `

    // Get total listing count for the city
    const statsResult = await sql`
      SELECT COUNT(*) as total_listings
      FROM listings
      WHERE status = 'active' AND location ILIKE ${`%${cityInfo.name}%`}
    `

    return {
      cityInfo,
      categories: categoriesResult.rows,
      listings: listingsResult.rows,
      totalListings: parseInt(statsResult.rows[0]?.total_listings || '0')
    }
  } catch (error) {
    console.error('Error fetching city data:', error)
    return null
  }
}

export default async function CityPage(props: PageProps) {
  const params = await props.params
  const citySlug = params.city.toLowerCase()
  
  const data = await getCityData(citySlug)
  
  if (!data) {
    notFound()
  }

  const { cityInfo, categories, listings, totalListings } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <AnimatedSection
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center mb-6">
              <MapPin className="h-8 w-8 mr-3" />
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {cityInfo.county}
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Lei i {cityInfo.name}
            </h1>
            
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl">
              Utforsk {totalListings}+ gjenstander tilgjengelige for utleie i {cityInfo.name}. 
              Fra kameraer til verktøy - finn det du trenger når du trenger det.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
                <Link href={`/search?location=${cityInfo.name}`} className="flex items-center">
                  Utforsk alle annonser
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/listings/new">
                  Legg ut din annonse
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <AnimatedSection
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="text-3xl font-black text-emerald-600 mb-2">{totalListings}+</div>
              <div className="text-gray-600">Tilgjengelige gjenstander</div>
            </AnimatedSection>
            
            <AnimatedSection
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-black text-emerald-600 mb-2">{categories.length}</div>
              <div className="text-gray-600">Populære kategorier</div>
            </AnimatedSection>
            
            <AnimatedSection
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="text-3xl font-black text-emerald-600 mb-2">24/7</div>
              <div className="text-gray-600">Support tilgjengelig</div>
            </AnimatedSection>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Popular Categories */}
        <AnimatedSection
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-2">Populære kategorier i {cityInfo.name}</h2>
          <p className="text-gray-600 mb-8">Utforsk de mest etterspurte kategoriene i området</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <AnimatedSection
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link href={`/search?location=${cityInfo.name}&category=${category.name}`}>
                  <Card className="hover:shadow-lg transition-shadow group">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                        {category.icon || '📦'}
                      </div>
                      <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                      <p className="text-emerald-600 font-medium">
                        {category.listing_count} annonser
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>

        {/* Recent Listings */}
        {listings.length > 0 && (
          <AnimatedSection
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Nyeste annonser</h2>
                <p className="text-gray-600">Ferskt tilgjengelige gjenstander i {cityInfo.name}</p>
              </div>
              
              <Button variant="outline" asChild>
                <Link href={`/search?location=${cityInfo.name}`}>
                  Se alle
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.map((listing, index) => (
                <AnimatedSection
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link href={`/listings/${listing.id}`}>
                    <Card className="hover:shadow-lg transition-shadow group">
                      <div className="aspect-square relative overflow-hidden rounded-t-lg">
                        {listing.image ? (
                          <img
                            src={listing.image}
                            alt={listing.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-4xl">📦</span>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-bold mb-2 truncate">{listing.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{listing.location}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-emerald-600">
                            {listing.price} kr/dag
                          </span>
                          
                          {listing.rating > 0 && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                              {parseFloat(listing.rating).toFixed(1)}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* Call to Action */}
        <AnimatedSection
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-emerald-50 rounded-3xl p-12">
            <h2 className="text-3xl font-bold mb-4">Klar til å starte utleievirksomheten i {cityInfo.name}?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Bli med i tusenvis av utleiere som allerede tjener penger på gjenstander de ikke bruker daglig.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
                <Link href="/listings/new">
                  Legg ut din første annonse
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">
                  Lær mer om PriceTag
                </Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
} 