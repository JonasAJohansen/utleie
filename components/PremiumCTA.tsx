'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Gift, Clock, Users } from 'lucide-react'
import Link from 'next/link'

export function PremiumCTA() {
  return (
    <div className="py-20 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Dynamic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-blue-600">
        <div className="absolute inset-0 bg-[url('/pattern-light.svg')] bg-repeat opacity-10"></div>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{ 
            duration: 3.5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-8 sm:mb-12"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-300" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0"
                >
                  <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-300 opacity-50" />
                </motion.div>
              </motion.div>
            </div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 sm:mb-8 text-white leading-tight">
              Bli med i{' '}
              <motion.span
                animate={{ 
                  textShadow: ["0 0 20px rgba(255,255,255,0.5)", "0 0 40px rgba(255,255,255,0.8)", "0 0 20px rgba(255,255,255,0.5)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-yellow-300"
              >
                revolusjonen
              </motion.span>
            </h2>
            
            <p className="text-xl sm:text-2xl md:text-3xl text-emerald-50 max-w-4xl mx-auto font-medium leading-relaxed">
              Start din reise mot smartere forbruk og ekstra inntekt i dag
            </p>
          </motion.div>

          {/* Benefits grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {[
              {
                icon: <Gift className="h-8 w-8" />,
                title: "Gratis å begynne",
                description: "Ingen skjulte kostnader eller månedlige avgifter"
              },
              {
                icon: <Clock className="h-8 w-8" />,
                title: "Klar på 2 minutter",
                description: "Opprett konto og start utleie umiddelbart"
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "12,500+ aktive brukere",
                description: "Bli del av Norges største utleiefelleskab"
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 hover:bg-white/15 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-yellow-300 mb-4 flex justify-center">
                  {benefit.icon}
                </div>
                <h3 className="text-white font-bold text-lg sm:text-xl mb-2">
                  {benefit.title}
                </h3>
                <p className="text-emerald-100 text-sm sm:text-base">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-bold rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <Link href="/listings/new" className="flex items-center">
                  Start utleie nå
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-2" />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" variant="outline" className="bg-transparent border-2 border-white/40 text-white hover:bg-white hover:text-emerald-600 px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-bold rounded-xl sm:rounded-2xl transition-all duration-300 backdrop-blur-sm">
                <Link href="/search">
                  Utforsk utleie
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust indicator */}
          <motion.div 
            className="mt-12 sm:mt-16 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="text-emerald-100 text-sm sm:text-base mb-4">
              ✨ Over 45,000 vellykkede utleier i 2024
            </p>
            <div className="flex justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.7 + i * 0.1 }}
                >
                  <span className="text-yellow-300 text-xl">⭐</span>
                </motion.div>
              ))}
            </div>
            <p className="text-emerald-100 text-sm mt-2">4.8/5 stjerner fra våre brukere</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}