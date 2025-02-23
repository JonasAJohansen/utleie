import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ArrowRight } from 'lucide-react'
import { sql } from '@vercel/postgres'
import { SearchBar } from '@/components/SearchBar'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star } from 'lucide-react'

async function getLatestListings() {
  try {
    const result = await sql`
      SELECT 
        l.*,
        u.username,
        COALESCE(
          (
            SELECT lp.url
            FROM listing_photos lp
            WHERE lp.listing_id = l.id AND lp.is_main = true
            LIMIT 1
          ),
          (
            SELECT lp.url
            FROM listing_photos lp
            WHERE lp.listing_id = l.id
            ORDER BY lp.display_order
            LIMIT 1
          )
        ) as image
      FROM listings l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 6
    `
    return result.rows
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch latest listings')
  }
}

async function getPopularCategories() {
  try {
    const result = await sql`
      SELECT id, name, icon, description
      FROM categories
      WHERE is_popular = true
      ORDER BY name ASC
      LIMIT 8
    `
    return result.rows
  } catch (error) {
    console.error('Database Error:', error)
    return []
  }
}

async function getFeaturedCategories() {
  try {
    const result = await sql`
      SELECT id, name, icon, description
      FROM categories
      WHERE is_featured = true
      ORDER BY name ASC
    `
    return result.rows
  } catch (error) {
    console.error('Database Error:', error)
    return []
  }
}

export default async function Home() {
  const [latestListings, popularCategories] = await Promise.all([
    getLatestListings(),
    getPopularCategories(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-[#4CD964]">500K+</span>
                <span className="text-sm text-muted-foreground">Vellykkede utleier</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-[#4CD964]">100K+</span>
                <span className="text-sm text-muted-foreground">Aktive brukere</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-[#4CD964]">4.9</span>
                <span className="text-sm text-muted-foreground">Gjennomsnittlig vurdering</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-[#4CD964]">50K+</span>
                <span className="text-sm text-muted-foreground">Tilgjengelige gjenstander</span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-[64px] leading-[1.1] font-black tracking-tight mb-6">
              LEI ALT, OVERALT
            </h1>

            {/* Subheading */}
            <p className="text-xl text-muted-foreground mb-8">
              Få tilgang til over 1000 gjenstander i mer enn 50 kategorier. Finn det du trenger, når du trenger det.
            </p>

            {/* Search Bar */}
            <div className="w-full max-w-2xl mx-auto relative z-30">
              <SearchBar />
            </div>
          </div>
        </div>

        {/* Popular Categories */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-1">Populære kategorier</h2>
                <p className="text-muted-foreground">Finn det du trenger fra våre mest populære kategorier</p>
              </div>
              <Link href="/categories" className="text-[#4CD964] hover:underline font-medium">
                Se alle kategorier
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {popularCategories.map((category) => (
                <Link key={category.id} href={`/category/${category.id}`}>
                  <div className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-lg bg-[#4CD964]/10 text-[#4CD964] flex items-center justify-center mb-4">
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Listings */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-1">Nylig lagt til</h2>
                <p className="text-muted-foreground">Sjekk ut de nyeste gjenstandene tilgjengelig for leie</p>
              </div>
              <Link href="/listings" className="text-[#4CD964] hover:underline font-medium">
                Se alle gjenstander
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {latestListings.map((listing) => (
                <Card key={listing.id} className="group hover:shadow-lg transition-shadow">
                  <Link href={`/listings/${listing.id}`}>
                    <CardContent className="p-0">
                      <div className="aspect-[4/3] relative">
                        <Image
                          src={listing.image || '/placeholder.svg'}
                          alt={listing.name}
                          fill
                          className="object-cover rounded-t-lg"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {listing.category_name && (
                          <Badge className="absolute top-3 left-3 bg-white/90 text-black hover:bg-white/90">
                            {listing.category_name}
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold line-clamp-2">{listing.name}</h3>
                          <p className="font-semibold whitespace-nowrap">{listing.price} kr/dag</p>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-4 w-4" />
                          {listing.location || 'Sted ikke spesifisert'}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Image
                              src={listing.user_image || '/placeholder.svg'}
                              alt={listing.username}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            <span className="text-sm text-muted-foreground">{listing.username}</span>
                          </div>
                          {listing.rating > 0 && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{Number(listing.rating).toFixed(1)}</span>
                              <span className="text-muted-foreground">({listing.review_count})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Gjør mer med RentEase i Norge</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Du kan bruke RentEase til mye mer enn bare å leie gjenstander. Her er hva som er tilgjengelig, basert på
                hvor du bor.
              </p>
              <Button className="mt-8 bg-[#4CD964] hover:bg-[#3DAF50] text-white">Åpne en konto</Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Trygg betaling</h3>
                <p className="text-gray-600 mb-4">Sikker betaling og verifiserte brukere for en trygg utleieopplevelse.</p>
                <Link href="/how-it-works" className="text-[#00B9FF] hover:text-[#00A3E6] font-medium inline-flex items-center">
                  Les mer <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Forsikret utleie</h3>
                <p className="text-gray-600 mb-4">Alle utleieforhold er automatisk forsikret gjennom vår partner.</p>
                <Link href="/insurance" className="text-[#00B9FF] hover:text-[#00A3E6] font-medium inline-flex items-center">
                  Les mer <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Enkel prosess</h3>
                <p className="text-gray-600 mb-4">Fra søk til leie på få minutter. Enkelt og oversiktlig for alle parter.</p>
                <Link href="/process" className="text-[#00B9FF] hover:text-[#00A3E6] font-medium inline-flex items-center">
                  Les mer <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t">
          <div className="max-w-screen-xl mx-auto px-4 py-20">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Klar til å begynne?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Bli med i vårt fellesskap i dag og begynn å tjene penger på tingene dine.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="bg-[#4CD964] hover:bg-[#3DAF50]">
                  <Link href="/sign-up">
                    Registrer deg nå
                  </Link>
                </Button>
                <Button size="lg" variant="outline">
                  <Link href="/how-it-works">
                    Lær mer om utleie
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

