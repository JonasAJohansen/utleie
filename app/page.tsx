import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, Star, Search, Shield, Clock, Leaf, Smartphone, CheckCircle, Users, Globe, Camera, Wrench, Gamepad2, TrendingUp, Heart, Zap, Award, Mail, Phone, MessageCircle, ChevronDown, Play, Target, Truck, Home as HomeIcon, Music, Tv, Shirt, Package } from 'lucide-react'
import { sql } from '@vercel/postgres'
import { SearchBar } from '@/components/SearchBar'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedSection, AnimatedCard } from "@/app/components/AnimatedSection"
import { motion } from 'framer-motion'
import { StatsCounter } from '@/components/StatsCounter'
import { PremiumCTA } from '@/components/PremiumCTA'
import { LiveActivity } from '@/components/LiveActivity'

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
    return []
  }
}

async function getPopularCategories() {
  try {
    // First try to get categories marked as popular
    let result = await sql`
      SELECT name, name as id, icon, description
      FROM categories
      WHERE is_active = true AND is_popular = true
      ORDER BY RANDOM()
      LIMIT 3
    `
    
    // If no popular categories found, get random active categories as fallback
    if (result.rows.length === 0) {
      result = await sql`
      SELECT name, name as id, icon, description
      FROM categories
      WHERE is_active = true
        ORDER BY RANDOM()
        LIMIT 3
      `
    }
    
    return result.rows
  } catch (error) {
    console.error('Database Error:', error)
    return []
  }
}

async function getPopularCategoriesWithCounts() {
  try {
    // Get popular categories with listing counts
    let result = await sql`
      SELECT 
        c.name, 
        c.name as id, 
        c.icon, 
        c.description,
        COALESCE(COUNT(l.id), 0) as listing_count
      FROM categories c
      LEFT JOIN listings l ON c.name = l.category_id AND l.status = 'active'
      WHERE c.is_active = true AND c.is_popular = true
      GROUP BY c.name, c.icon, c.description
      ORDER BY listing_count DESC, c.name ASC
      LIMIT 8
    `
    
    // If no popular categories found, get top categories by listing count as fallback
    if (result.rows.length === 0) {
      result = await sql`
        SELECT 
          c.name, 
          c.name as id, 
          c.icon, 
          c.description,
          COALESCE(COUNT(l.id), 0) as listing_count
        FROM categories c
        LEFT JOIN listings l ON c.name = l.category_id AND l.status = 'active'
        WHERE c.is_active = true
        GROUP BY c.name, c.icon, c.description
        ORDER BY listing_count DESC, c.name ASC
        LIMIT 8
      `
    }
    
    return result.rows
  } catch (error) {
    console.error('Database Error:', error)
    return []
  }
}

export default async function Home() {
  const [latestListings, popularCategories, popularCategoriesWithCounts] = await Promise.all([
    getLatestListings(),
    getPopularCategories(),
    getPopularCategoriesWithCounts(),
  ])

  // Icon and color mapping for categories
  const categoryStyles: { [key: string]: { icon: JSX.Element, color: string } } = {
    "Kameraer": { icon: <Camera className="h-8 w-8" />, color: "bg-red-500" },
    "Verktøy": { icon: <Wrench className="h-8 w-8" />, color: "bg-orange-500" },
    "Gaming": { icon: <Gamepad2 className="h-8 w-8" />, color: "bg-purple-500" },
    "Sport": { icon: <Target className="h-8 w-8" />, color: "bg-blue-500" },
    "Transport": { icon: <Truck className="h-8 w-8" />, color: "bg-green-500" },
    "Elektronikk": { icon: <Smartphone className="h-8 w-8" />, color: "bg-indigo-500" },
    "Hjem": { icon: <HomeIcon className="h-8 w-8" />, color: "bg-emerald-500" },
    "Hjem & Have": { icon: <Leaf className="h-8 w-8" />, color: "bg-emerald-500" },
    "Reise": { icon: <Globe className="h-8 w-8" />, color: "bg-cyan-500" },
    "Musikk": { icon: <Music className="h-8 w-8" />, color: "bg-pink-500" },
    "TV og lyd": { icon: <Tv className="h-8 w-8" />, color: "bg-yellow-500" },
    "Klær": { icon: <Shirt className="h-8 w-8" />, color: "bg-teal-500" },
    "default": { icon: <Package className="h-8 w-8" />, color: "bg-gray-500" }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        {/* Hero Section - Bold and Modern */}
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/20">
          {/* Animated gradient orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full opacity-20 animate-pulse blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-15 animate-pulse blur-3xl" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full opacity-10 animate-pulse blur-3xl" style={{ animationDelay: '4s' }}></div>
          </div>
          {/* Animated Floating 3D Elements - Hidden on mobile for better performance */}
          <AnimatedSection
            className="hidden md:block absolute top-20 right-[15%] w-20 h-20 lg:w-24 lg:h-24 bg-emerald-500 rounded-3xl rotate-12 opacity-90 shadow-2xl"
            animate={{ 
              y: [0, -10, 0], 
              rotate: [12, 18, 12] 
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="h-10 w-10 lg:h-12 lg:w-12 text-white" />
            </div>
          </AnimatedSection>
          
          <AnimatedSection
            className="hidden lg:block absolute top-[30%] right-[5%] w-16 h-16 lg:w-18 lg:h-18 bg-blue-500 rounded-2xl -rotate-12 opacity-80 shadow-xl"
            animate={{ 
              x: [0, 8, 0], 
              rotate: [-12, -18, -12] 
            }}
            transition={{ 
              duration: 3.5, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <Wrench className="h-8 w-8 lg:h-9 lg:w-9 text-white" />
            </div>
          </AnimatedSection>
          
          <AnimatedSection
            className="hidden md:block absolute bottom-[25%] left-[10%] w-20 h-20 lg:w-24 lg:h-24 bg-purple-500 rounded-3xl rotate-6 opacity-85 shadow-2xl"
            animate={{ 
              y: [0, -15, 0], 
              rotate: [6, 12, 6] 
            }}
            transition={{ 
              duration: 4.5, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <Gamepad2 className="h-10 w-10 lg:h-12 lg:w-12 text-white" />
            </div>
          </AnimatedSection>
          
          <AnimatedSection
            className="hidden lg:block absolute top-[60%] left-[20%] w-14 h-14 lg:w-16 lg:h-16 bg-orange-500 rounded-2xl -rotate-6 opacity-75 shadow-lg"
            animate={{ 
              x: [0, -6, 0], 
              rotate: [-6, -12, -6] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <Globe className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
            </div>
          </AnimatedSection>

          {/* Additional floating elements */}
          <AnimatedSection
            className="hidden xl:block absolute top-[15%] left-[15%] w-12 h-12 bg-yellow-500 rounded-xl rotate-45 opacity-70 shadow-lg"
            animate={{ 
              y: [0, -12, 0], 
              rotate: [45, 60, 45] 
            }}
            transition={{ 
              duration: 3.8, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
          </AnimatedSection>

          <AnimatedSection
            className="hidden xl:block absolute bottom-[15%] right-[25%] w-10 h-10 bg-pink-500 rounded-lg -rotate-12 opacity-60 shadow-md"
            animate={{ 
              x: [0, 8, 0], 
              rotate: [-12, -24, -12] 
            }}
            transition={{ 
              duration: 2.8, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
          </AnimatedSection>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <AnimatedSection 
              className="max-w-6xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <AnimatedSection 
                className="space-y-6 sm:space-y-8 lg:space-y-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <AnimatedSection
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-gray-900 leading-none px-2 sm:px-0">
                    LEI ALT DU TRENGER,{' '}
                    <br className="hidden sm:block" />
                    <AnimatedSection
                      as="span"
                      className="text-emerald-500"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                    >
                      NÅR DU TRENGER DET
                    </AnimatedSection>
                </h1>
                </AnimatedSection>
                
                <AnimatedSection
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-medium px-4 sm:px-0">
                    Fra kameraer til verktøy, campingutstyr til elektronikk. 
                    Lei istedenfor å kjøpe – smart, bærekraftig og rimelig.
                  </p>
                </AnimatedSection>
                
                {/* Integrated Search */}
                <AnimatedSection
                  className="max-w-4xl mx-auto pt-6 sm:pt-8 px-4 sm:px-0"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 md:p-8 hover:shadow-3xl hover:bg-white/95 transition-all duration-500 relative overflow-hidden">
                    {/* Subtle inner glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-blue-50/30 rounded-2xl sm:rounded-3xl"></div>
                    <div className="relative z-10">
                    <AnimatedSection
                      className="mb-4 sm:mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 1 }}
                    >
                      <SearchBar />
              </AnimatedSection>
              
              <AnimatedSection 
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                    >
                      <p className="text-gray-500 mb-3 sm:mb-4 font-medium text-sm sm:text-base">Eller utforsk populære kategorier:</p>
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        {popularCategories.map((category, index) => (
                          <AnimatedSection
                            key={category.id}
                            as={Link}
                            href={`/category/${category.id}`}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 transition-all duration-200 font-medium border border-emerald-200 text-xs sm:text-sm hover:scale-105 hover:shadow-md"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 1.4 + index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                          {category.name}
                          </AnimatedSection>
            ))}
                    </div>
                    </AnimatedSection>
                    </div>
                  </div>
                </AnimatedSection>
              </AnimatedSection>
            </AnimatedSection>
          </div>
        </div>
        
        {/* Dynamic Stats Counter */}
        <StatsCounter />

        {/* How It Works - Step by Step */}
        <div className="py-16 sm:py-20 lg:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection 
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-gray-900">
                Slik fungerer det
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
                Tre enkle steg til å leie det du trenger
              </p>
            </AnimatedSection>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto relative">
              {/* Connecting Lines - Only show on desktop */}
              <div className="hidden lg:block absolute top-16 left-[16.67%] right-[16.67%] h-0.5 bg-emerald-300"></div>
              
              {[
                {
                  step: "01",
                  icon: <Search className="h-10 w-10" />,
                  title: "Søk og finn",
                  description: "Bla gjennom tusenvis av gjenstander. Bruk filtre for å finne akkurat det du trenger, når du trenger det.",
                  color: "bg-emerald-500"
                },
                {
                  step: "02", 
                  icon: <MessageCircle className="h-10 w-10" />,
                  title: "Book og betal",
                  description: "Send booking-forespørsel til eier. Betal trygt gjennom vår plattform med innebygd forsikring.",
                  color: "bg-blue-500"
                },
                {
                  step: "03",
                  icon: <CheckCircle className="h-10 w-10" />,
                  title: "Hent og nyt",
                  description: "Møt eier på avtalt sted og tid. Bruk gjenstanden og returner den i samme stand som mottatt.",
                  color: "bg-emerald-600"
                }
              ].map((step, index) => (
                <AnimatedSection 
                  key={index}
                  className="text-center relative group cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100 relative z-10 group-hover:shadow-2xl group-hover:border-emerald-200 transition-all duration-500 overflow-hidden">
                    {/* Hover overlay effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 via-emerald-50/20 to-emerald-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                    {/* Step Number */}
                    <div className="text-4xl sm:text-5xl font-black text-emerald-500 mb-4 sm:mb-6">{step.step}</div>
                    
                    {/* Icon */}
                    <div className={`${step.color} w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto text-white shadow-lg`}>
                      <div className="scale-75 sm:scale-100">
                        {step.icon}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                      {step.description}
                    </p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="py-16 sm:py-20 lg:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection 
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 text-gray-900 px-4 sm:px-0">
                Derfor velger tusenvis av nordmenn å leie
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
                Smart økonomi møter bærekraftig forbruk
              </p>
            </AnimatedSection>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: <Leaf className="h-10 w-10 sm:h-12 sm:w-12" />,
                  title: "Bærekraftig",
                  description: "Reduser miljøpåvirkningen din ved å dele ressurser istedenfor å kjøpe nytt",
                  color: "bg-emerald-500"
                },
                {
                  icon: <Shield className="h-10 w-10 sm:h-12 sm:w-12" />,
                  title: "Trygt og enkelt",
                  description: "Sikre betalinger, forsikring og verifiserte brukere gir deg fullstendig trygghet",
                  color: "bg-blue-500"
                },
                {
                  icon: <Clock className="h-10 w-10 sm:h-12 sm:w-12" />,
                  title: "Når du trenger det",
                  description: "Tilgang til kvalitetsutstyr uten langsiktige forpliktelser eller oppbevaring",
                  color: "bg-purple-500"
                }
              ].map((feature, index) => (
                <AnimatedSection 
                  key={index}
                  className="text-center group cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <motion.div 
                    className={`${feature.color} w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 mx-auto text-white shadow-xl group-hover:shadow-2xl transition-all duration-500`}
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed px-4 sm:px-0">
                    {feature.description}
                  </p>
                </AnimatedSection>
            ))}
            </div>
          </div>
        </div>
        
        {/* Popular Categories Showcase */}
        <div className="py-16 sm:py-20 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection 
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 text-gray-900 px-4 sm:px-0">
                Populære kategorier
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
                Utforsk våre mest populære utleiekategorier
              </p>
            </AnimatedSection>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {popularCategoriesWithCounts.map((category, index) => {
                const style = categoryStyles[category.name] || categoryStyles.default
                const displayCount = category.listing_count > 0 ? `${category.listing_count}+` : '0'
                
                return (
                  <AnimatedSection 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Link href={`/category/${category.name.toLowerCase()}`}>
                      <Card className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 shadow-lg rounded-xl sm:rounded-2xl">
                        <div className="text-center">
                          <div className={`${style.color} w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 mx-auto text-white shadow-lg`}>
                            <div className="scale-75 sm:scale-100">
                              {style.icon}
                            </div>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{category.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-500">{displayCount} annonser</p>
                        </div>
                      </Card>
                    </Link>
                  </AnimatedSection>
                )
              })}
            </div>
          </div>
        </div>

        {/* App Mockup Section */}
        <div className="py-16 sm:py-20 lg:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
              <AnimatedSection
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="space-y-6 sm:space-y-8">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900">
                    Alt du trenger i lomma
                  </h2>
                  <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                    Vår mobile app gjør det enkelt å søke, book og administrere utleier. 
                    Tilgjengelig for iOS og Android.
                  </p>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      "Søk blant tusenvis av gjenstander",
                      "Book direkte med eiere",
                      "Sikre betalinger og forsikring",
                      "Meldings- og vurderingssystem"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500 flex-shrink-0" />
                        <span className="text-base sm:text-lg text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl">
                      Last ned appen
                    </Button>
                  </div>
                </div>
              </AnimatedSection>
              
              <AnimatedSection
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="relative">
                  <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3">
                    <div className="bg-gray-100 rounded-2xl p-6 mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Search className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-500">Søk etter kamera...</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { name: "Canon EOS R5", price: "450 kr/dag", location: "Oslo" },
                        { name: "Sony A7 III", price: "350 kr/dag", location: "Bergen" },
                        { name: "DJI Mavic Pro", price: "250 kr/dag", location: "Trondheim" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 bg-emerald-500 rounded-lg"></div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600">{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>

        {/* Norwegian Cities Highlight */}
        <div className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="container mx-auto px-4">
            <AnimatedSection 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900">
                Tilgjengelig over hele Norge
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Fra nord til sør - finn utleiere i din by
              </p>
            </AnimatedSection>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 max-w-6xl mx-auto">
              {[
                { city: "Oslo", listings: "1,200+" },
                { city: "Bergen", listings: "800+" },
                { city: "Trondheim", listings: "600+" },
                { city: "Stavanger", listings: "500+" },
                { city: "Kristiansand", listings: "400+" },
                { city: "Fredrikstad", listings: "300+" },
                { city: "Tromsø", listings: "250+" },
                { city: "Drammen", listings: "350+" }
              ].map((location, index) => (
                <AnimatedSection 
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3 mx-auto">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{location.city}</h3>
                    <p className="text-sm text-gray-500">{location.listings}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>

        {/* Latest Listings */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <AnimatedSection
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900">
                Tilgjengelig for leie nå
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Utforsk våre nyeste tilbud fra verifiserte utleiere
              </p>
            </AnimatedSection>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {latestListings.length > 0 ? latestListings.map((listing, index) => (
                <AnimatedSection
                  key={listing.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={`/listings/${listing.id}`}>
                    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 h-full flex flex-col transform hover:-translate-y-2 rounded-3xl border-0 shadow-lg bg-white">
                      <div className="aspect-[4/3] relative">
                  <Image
                    src={listing.image || '/placeholder.svg'}
                    alt={listing.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {listing.category_name && (
                          <Badge className="absolute top-4 left-4 bg-white/95 text-gray-800 hover:bg-white/95 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                            {listing.category_name}
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="p-6 flex-grow flex flex-col">
                        <div className="flex-grow">
                          <h3 className="text-xl font-bold mb-3 line-clamp-2 text-gray-900">{listing.name}</h3>
                          
                          <div className="flex items-center gap-2 text-gray-500 mb-4">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{listing.location || 'Lokasjon ikke spesifisert'}</span>
                          </div>
                </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                              <Image
                                src={listing.user_image || '/placeholder.svg'}
                                alt={listing.username}
                              width={40}
                              height={40}
                              className="rounded-full border-2 border-gray-200"
                            />
                            <span className="text-sm font-medium text-gray-700">{listing.username}</span>
                  </div>
                          
                          <div className="text-right">
                            <p className="font-black text-xl text-gray-900">{listing.price} kr</p>
                            <p className="text-sm text-gray-500 font-medium">per dag</p>
                </div>
              </div>
                        
                        {listing.rating > 0 && (
                          <div className="flex items-center gap-1 text-sm mt-4">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(listing.rating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <span className="ml-2 font-medium text-gray-600">{Number(listing.rating).toFixed(1)}</span>
                            <span className="text-gray-400">({listing.review_count})</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
            </Link>
                </AnimatedSection>
              )) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-xl">Ingen annonser tilgjengelig for øyeblikket.</p>
                </div>
              )}
        </div>

            <div className="text-center mt-12">
              <Link href="/listings">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-1">
                  Se alle tilbud
                  <ArrowRight className="h-6 w-6 ml-3" />
                </Button>
              </Link>
            </div>
        </div>
      </section>

        {/* Testimonials */}
        <div className="py-16 sm:py-20 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection 
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 text-gray-900 px-4 sm:px-0">
                Hva våre brukere sier
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
                Ekte tilbakemeldinger fra fornøyde leietakere og utleiere
              </p>
            </AnimatedSection>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {[
                {
                  quote: "Fantastisk service! Leide et profesjonelt kamera til bryllupet og sparte tusenvis av kroner. Eieren var super hjelpsom.",
                  name: "Maria Johansen",
                  location: "Oslo",
                  rating: 5,
                  category: "Kameraer"
                },
                {
                  quote: "Som utleier har jeg tjent over 25 000 kr på å leie ut verktøy og utstyr jeg sjelden bruker. Enkel og trygg plattform!",
                  name: "Lars Eriksen", 
                  location: "Bergen",
                  rating: 5,
                  category: "Verktøy"
                },
                {
                  quote: "Perfekt for camping-turer! Leier alt av utstyr istedenfor å fylle loftet med ting jeg bruker en gang i året.",
                  name: "Ingrid Nilsen",
                  location: "Trondheim", 
                  rating: 5,
                  category: "Camping"
                }
              ].map((testimonial, index) => (
                <AnimatedSection 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group cursor-pointer"
                >
                  <Card className="p-6 sm:p-8 h-full bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg rounded-2xl sm:rounded-3xl group-hover:shadow-2xl group-hover:border group-hover:border-emerald-200 transition-all duration-500 relative overflow-hidden">
                    {/* Subtle hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 via-emerald-50/10 to-blue-50/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                    <div className="flex items-center mb-4 sm:mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400 mr-1" />
                      ))}
                  </div>
                    <p className="text-base sm:text-lg mb-6 sm:mb-8 text-gray-700 italic leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold mr-3 sm:mr-4 flex-shrink-0">
                        <span className="text-sm sm:text-base">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm sm:text-base">{testimonial.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{testimonial.location} • {testimonial.category}</p>
                      </div>
                    </div>
                    </div>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>

        {/* Premium CTA Section */}
        <PremiumCTA />

        {/* FAQ Section */}
        <div className="py-16 sm:py-20 lg:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-start">
              <AnimatedSection 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 sm:mb-8 text-gray-900">
                  Ofte stilte spørsmål
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  Har du spørsmål? Vi har svarene! Her er de mest vanlige spørsmålene vi får.
                </p>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Kontakt oss
                </Button>
              </AnimatedSection>
              
              <AnimatedSection 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="space-y-3 sm:space-y-4">
                  {[
                    {
                      question: "Hvordan fungerer forsikringen?",
                      answer: "Alle utleier er automatisk dekket av vår forsikring. Ved skader eller tyveri er både utleier og leietaker beskyttet."
                    },
                    {
                      question: "Hva koster det å leie?",
                      answer: "Prisene settes av utleiere selv. Plattformen tar en liten provisjon på 10% for å dekke betalingsbehandling og forsikring."
                    },
                    {
                      question: "Hvordan blir brukerne verifisert?",
                      answer: "Alle brukere må verifisere identitet med BankID og telefonnummer. Vi sjekker også tidligere anmeldelser og aktivitet."
                    },
                    {
                      question: "Kan jeg avbestille en booking?",
                      answer: "Ja, du kan avbestille inntil 24 timer før start. Ved tidligere avbestilling får du full refusjon."
                    }
                  ].map((faq, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg pr-4">{faq.question}</h3>
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0 mt-1" />
                      </div>
                      <p className="text-gray-600 mt-3 sm:mt-4 leading-relaxed text-sm sm:text-base">{faq.answer}</p>
                    </div>
                ))}
                </div>
              </AnimatedSection>
            </div>
            </div>
        </div>



        {/* CTA Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-emerald-500 to-emerald-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern-dark.svg')] bg-repeat opacity-10"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection
                className="text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 sm:mb-8 px-4 sm:px-0">
                  Har du noe å leie ut?
                </h2>
                <p className="text-lg sm:text-xl lg:text-2xl opacity-95 mb-8 sm:mb-12 leading-relaxed px-4 sm:px-0">
                  Gjør dine ubrukte eiendeler til en inntektskilde. 
                  Opprett en annonse på minutter og begynn å tjene.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4 sm:px-0">
                  <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-bold rounded-xl sm:rounded-2xl shadow-xl">
                    <Link href="/listings/new">Opprett annonse</Link>
                </Button>
                  <Button size="lg" className="bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white hover:text-emerald-600 px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-bold rounded-xl sm:rounded-2xl transition-all duration-300">
                  <Link href="/about">Lær mer</Link>
        </Button>
              </div>
            </AnimatedSection>
            </div>
          </div>
      </section>
      </main>

      {/* Live Activity Feed */}
      <LiveActivity />
    </div>
  )
}

