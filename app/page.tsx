import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, MapPin, Star, Globe, Shield, CreditCard, Clock, Leaf, DollarSign, Zap, User, Package } from 'lucide-react'
import { sql } from '@vercel/postgres'
import { SearchBar } from '@/components/SearchBar'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedSection, AnimatedCard } from "@/app/components/AnimatedSection"

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
    // Return empty array instead of throwing to prevent page crash
    return []
  }
}

async function getPopularCategories() {
  try {
    const result = await sql`
      SELECT name, name as id, icon, description
      FROM categories
      WHERE is_active = true
      ORDER BY name ASC
      LIMIT 8
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
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        {/* Hero Section - Green Color Scheme */}
        <div className="bg-gradient-to-br from-[#E7F9EF] via-[#F2FFF8] to-[#E5F8EC] pt-28 pb-20 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-[#4CD964]/10 blur-3xl"></div>
          <div className="absolute bottom-10 left-[5%] w-72 h-72 rounded-full bg-[#4CD964]/10 blur-3xl"></div>
          <div className="absolute top-40 left-[15%] w-32 h-32 rounded-full bg-[#4CD964]/20 blur-xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection 
              className="grid md:grid-cols-2 gap-12 items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatedSection 
                className="space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div>
                  <span className="inline-flex items-center rounded-full bg-[#4CD964]/20 px-4 py-1.5 text-sm font-medium text-[#1A8D3B]">
                    <Check className="mr-1.5 h-4 w-4" /> Stoles av over 500k+ brukere
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900">
                  Lei hva som helst <br />
                  <span className="text-[#4CD964] relative">
                    fra hvem som helst
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5.5C32.3333 2.16667 154.4 -0.7 299 8.5" stroke="#4CD964" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600">
                  Spar penger og reduser avfall ved å leie istedenfor å kjøpe.
                  Tusenvis av gjenstander fra pålitelige eiere over hele Norge.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-[#4CD964] hover:bg-[#3DAF50] text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-[#4CD964]/20 hover:shadow-xl hover:shadow-[#4CD964]/30 transform transition-all duration-300 hover:-translate-y-1" asChild>
                    <Link href="/listings">Begynn å leie</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-[#4CD964] text-[#4CD964] px-8 py-6 text-lg rounded-xl hover:bg-[#4CD964]/10 transition-all duration-300" asChild>
                    <Link href="/listings/new">List gjenstandene dine</Link>
                  </Button>
                </div>
                
                <div className="flex items-center flex-wrap gap-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="bg-[#E7F9EF] p-2 rounded-full mr-2">
                      <Shield className="h-5 w-5 text-[#4CD964]" />
                    </div>
                    Fullt forsikret
                  </div>
                  <div className="flex items-center">
                    <div className="bg-[#E7F9EF] p-2 rounded-full mr-2">
                      <CreditCard className="h-5 w-5 text-[#4CD964]" />
                    </div>
                    Sikre betalinger
                  </div>
                  <div className="flex items-center">
                    <div className="bg-[#E7F9EF] p-2 rounded-full mr-2">
                      <Clock className="h-5 w-5 text-[#4CD964]" />
                    </div>
                    24/7 kundestøtte
          </div>
        </div>
              </AnimatedSection>
              
              <AnimatedSection 
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Finn det du trenger</h2>
                  
                  <div className="mb-8">
                    <SearchBar />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-700">Populære søk:</h3>
                    <div className="flex flex-wrap gap-2">
                      {popularCategories.slice(0, 5).map((category) => (
                        <Link key={category.id} href={`/category/${category.id}`} className="px-4 py-2 rounded-full bg-[#F2FFF8] hover:bg-[#4CD964]/10 text-[#1A8D3B] transition-colors duration-200 text-sm font-medium">
                          {category.name}
              </Link>
            ))}
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#4CD964]/10 rounded-full border border-[#4CD964]/20 flex items-center justify-center">
                  <Leaf className="h-8 w-8 text-[#4CD964]" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-[#4CD964]/10 rounded-full border border-[#4CD964]/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-[#4CD964]" />
                </div>
              </AnimatedSection>
            </AnimatedSection>
          </div>
        </div>
        
        {/* Trust Metrics - Green Theme */}
        <div className="py-16 bg-white relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {[
                { value: "500K+", label: "Vellykkede utleier", icon: <Check className="h-6 w-6" /> },
                { value: "100K+", label: "Aktive brukere", icon: <User className="h-6 w-6" /> },
                { value: "50K+", label: "Tilgjengelige gjenstander", icon: <Package className="h-6 w-6" /> },
                { value: "4.9", label: "Gjennomsnittlig vurdering", icon: <Star className="h-6 w-6" /> },
                { value: "24/7", label: "Kundestøtte", icon: <Clock className="h-6 w-6" /> }
              ].map((stat, index) => (
                <AnimatedSection 
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-[#E7F9EF] text-[#4CD964]">
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
        
        {/* How It Works - Green Theme */}
        <div className="py-24 bg-[#FAFFFE] relative">
          <div className="absolute inset-0 bg-[url('/pattern-light.svg')] bg-repeat opacity-5"></div>
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Hvordan Price Tag fungerer</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Å leie gjenstander har aldri vært enklere. Følg disse enkle trinnene for å komme i gang.
              </p>
            </AnimatedSection>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-1/3 left-[16.67%] right-[16.67%] h-0.5 bg-[#4CD964]/30"></div>
              
              {[
                {
                  step: 1,
                  title: "Søk etter gjenstander",
                  description: "Bla gjennom tusenvis av gjenstander på tvers av flere kategorier. Finn akkurat det du trenger.",
                  link: "/listings",
                  linkText: "Begynn å søke"
                },
                {
                  step: 2,
                  title: "Be om utleie",
                  description: "Velg datoene dine og send en forespørsel til eieren. Vårt sikre meldingssystem gjør kommunikasjonen enkel.",
                  link: "/help",
                  linkText: "Lær mer"
                },
                {
                  step: 3,
                  title: "Betal trygt og nyt",
                  description: "Bruk vårt sikre betalingssystem. Hent gjenstanden, bruk den, og returner den når du er ferdig.",
                  link: "/about",
                  linkText: "Sikkerhet og betalinger"
                }
              ].map((step, index) => (
                <AnimatedSection 
                  key={index}
                  className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100 relative z-10"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#4CD964] text-white flex items-center justify-center mb-8 text-xl font-bold shadow-lg shadow-[#4CD964]/20">
                    {step.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 mb-6">
                    {step.description}
                  </p>
                  <Link href={step.link} className="text-[#4CD964] hover:text-[#3DAF50] font-medium inline-flex items-center group">
                    {step.linkText} 
                    <ArrowRight className="h-4 w-4 ml-2 transform transition-transform group-hover:translate-x-1" />
              </Link>
                </AnimatedSection>
            ))}
            </div>
          </div>
        </div>
        
        {/* Latest Listings - Green Theme */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
              <AnimatedSection
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Nylig lagt til gjenstander</h2>
                <p className="text-xl text-gray-600 max-w-2xl">
                  Sjekk ut de nyeste gjenstandene tilgjengelig for utleie
                </p>
              </AnimatedSection>
              <AnimatedSection
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link href="/listings" className="text-[#4CD964] hover:text-[#3DAF50] font-medium inline-flex items-center text-lg group mt-6 md:mt-0">
                  Se alle 
                  <ArrowRight className="h-5 w-5 ml-2 transform transition-transform group-hover:translate-x-1" />
                </Link>
              </AnimatedSection>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {latestListings.length > 0 ? latestListings.map((listing, index) => (
                <AnimatedSection
                  key={listing.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/listings/${listing.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1 rounded-2xl border-0 shadow-lg">
                      <div className="aspect-[4/3] relative">
                  <Image
                    src={listing.image || '/placeholder.svg'}
                    alt={listing.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {listing.category_name && (
                          <Badge className="absolute top-4 left-4 bg-white/90 text-gray-800 hover:bg-white/90 px-3 py-1.5 rounded-full text-sm font-medium">
                            {listing.category_name}
                          </Badge>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      
                      <CardContent className="p-6 flex-grow flex flex-col">
                        <div className="flex-grow">
                          <h3 className="text-xl font-bold mb-2 line-clamp-2 text-gray-900">{listing.name}</h3>
                          
                          <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                            <MapPin className="h-4 w-4" />
                            {listing.location || 'Lokasjon ikke spesifisert'}
                          </div>
                </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <Image
                                src={listing.user_image || '/placeholder.svg'}
                                alt={listing.username}
                                width={36}
                                height={36}
                                className="rounded-full border-2 border-white"
                              />
                              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#4CD964] rounded-full border-2 border-white"></div>
                  </div>
                            <span className="text-sm font-medium text-gray-700">{listing.username}</span>
                  </div>
                          
                          <div className="bg-[#F2FFF8] px-3 py-1.5 rounded-full">
                            <p className="font-bold text-[#1A8D3B]">{listing.price} kr/dag</p>
                </div>
              </div>
                        
                        {listing.rating > 0 && (
                          <div className="flex items-center gap-1 text-sm mt-3 text-gray-700">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(listing.rating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <span className="ml-1">{Number(listing.rating).toFixed(1)}</span>
                            <span className="text-gray-500">({listing.review_count})</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
            </Link>
                </AnimatedSection>
              )) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">Ingen annonser tilgjengelig for øyeblikket.</p>
                  <p className="text-gray-400 text-sm mt-2">Prøv igjen senere eller sjekk nettverkstilkoblingen din.</p>
                </div>
              )}
        </div>
        </div>
      </section>

        {/* Features Section - Green Theme */}
        <section className="py-24 bg-[#F2FFF8]">
          <div className="container mx-auto px-4">
            <AnimatedSection 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Hvorfor velge Price Tag?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Vi gjør utleie enkelt, trygt og rimelig for alle i Norge.
              </p>
            </AnimatedSection>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Shield className="h-10 w-10" />,
                  title: "Fullt forsikrede utleie",
                  description: "Hver utleie er automatisk forsikret gjennom vår partner, som gir begge parter trygghet."
                },
                {
                  icon: <CreditCard className="h-10 w-10" />,
                  title: "Sikre betalinger",
                  description: "Vårt sikre betalingssystem beskytter både leietakere og eiere med escrow-funksjonalitet."
                },
                {
                  icon: <Clock className="h-10 w-10" />,
                  title: "Fleksible varigheter",
                  description: "Lei for en dag, en uke eller lenger. Du velger tidsrammen som passer for deg."
                },
                {
                  icon: <Star className="h-10 w-10" />,
                  title: "Verifiserte anmeldelser",
                  description: "Alle anmeldelser kommer fra reelle utleier, som hjelper deg med å velge pålitelige eiere og kvalitetsgjenstander."
                },
                {
                  icon: <MapPin className="h-10 w-10" />,
                  title: "Lokale utleier",
                  description: "Finn gjenstander i nærheten av deg med vår smarte lokasjonsbaserte søkefunksjonalitet."
                },
                {
                  icon: <Leaf className="h-10 w-10" />,
                  title: "Bærekraftig valg",
                  description: "Reduser avfall og ditt miljøavtrykk ved å leie istedenfor å kjøpe."
                }
              ].map((feature, index) => (
                <AnimatedSection 
                  key={index}
                  className="bg-white p-8 rounded-3xl shadow-lg"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="bg-[#E7F9EF] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-[#4CD964]">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section - Green Theme */}
        <section className="py-24 bg-[#4CD964] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern-dark.svg')] bg-repeat opacity-5"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E7F9EF]/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E7F9EF]/20 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
              <AnimatedSection 
                className="text-white"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Klar til å tjene penger på gjenstandene dine?</h2>
                <p className="text-xl opacity-90 mb-8">
                  Den gjennomsnittlige norske husstanden har 300 000 kr verdt av sjelden brukte gjenstander.
                  Gjør dine ubrukte eiendeler til passiv inntekt.
                </p>
                <Button size="lg" className="bg-white text-[#4CD964] hover:bg-gray-100 px-8 py-6 text-lg rounded-xl shadow-lg" asChild>
                  <Link href="/listings/new">Bli utleier</Link>
                </Button>
              </AnimatedSection>
              
              <AnimatedSection 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {[
                  {
                    icon: <DollarSign className="h-6 w-6" />,
                    title: "Tjen ekstra inntekt",
                    text: "Gjenstander som ikke brukes? Lei dem ut og tjen penger."
                  },
                  {
                    icon: <Zap className="h-6 w-6" />,
                    title: "Enkel annonseringsprosess",
                    text: "Lag din annonse på minutter med vårt enkle grensesnitt."
                  },
                  {
                    icon: <User className="h-6 w-6" />,
                    title: "Du har kontrollen",
                    text: "Sett din egen tilgjengelighet, pris og leiebetingelser."
                  }
                ].map((item, index) => (
                  <AnimatedSection 
                    key={index}
                    className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center text-[#4CD964] shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-white/90">{item.text}</p>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </AnimatedSection>
            </div>
          </div>
        </section>
        
        {/* Testimonials - Green Theme */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <AnimatedSection 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Hva våre brukere sier</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Bli med tusenvis av fornøyde brukere over hele Norge som allerede bruker Price Tag.
              </p>
            </AnimatedSection>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "Jeg sparte over 5000 kr ved å leie et kamera til ferien min istedenfor å kjøpe et. Prosessen var så enkel!",
                  user: "Jonas D.",
                  location: "Oslo",
                  initials: "JD"
                },
                {
                  quote: "Som eier har jeg tjent over 15 000 kr på 3 måneder ved å leie ut verktøy jeg sjelden bruker. Plattformen er fantastisk!",
                  user: "Marte H.",
                  location: "Bergen",
                  initials: "MH"
                },
                {
                  quote: "Jeg leier alt fra elektroverktøy til campingutstyr. Det har gjort livet mitt så mye enklere og mer rimelig.",
                  user: "Kristian J.",
                  location: "Trondheim",
                  initials: "KJ"
                }
              ].map((testimonial, index) => (
                <AnimatedSection 
                  key={index}
                  className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                    ))}
                  </div>
                  <p className="text-lg mb-8 text-gray-700 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-14 h-14 rounded-full bg-[#E7F9EF] flex items-center justify-center text-lg font-bold text-[#4CD964] mr-4">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{testimonial.user}</p>
                      <p className="text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
        </div>
      </section>

        {/* Final CTA - Green Theme */}
        <section className="py-20 bg-[#FAFFFE]">
          <div className="container mx-auto px-4 text-center">
            <AnimatedSection
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">Bli med på utleierevolusjonen i dag</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                Registrer deg på minutter og begynn å leie eller liste gjenstandene dine.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="bg-[#4CD964] hover:bg-[#3DAF50] text-white px-8 py-6 text-lg rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-1" asChild>
                  <Link href="/listings">Opprett en konto</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-[#4CD964] text-[#4CD964] px-8 py-6 text-lg rounded-xl hover:bg-[#4CD964]/10 transition-all duration-300" asChild>
                  <Link href="/about">Lær mer</Link>
        </Button>
              </div>
            </AnimatedSection>
          </div>
      </section>
      </main>
    </div>
  )
}

