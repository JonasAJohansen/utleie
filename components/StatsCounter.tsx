'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Package, Star, TrendingUp } from 'lucide-react'

interface StatItem {
  icon: React.ReactNode
  value: number
  label: string
  suffix?: string
  prefix?: string
  color: string
}

interface CounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
}

function Counter({ end, duration = 2, suffix = '', prefix = '' }: CounterProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOutCubic * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return (
    <span className="font-black text-2xl sm:text-3xl lg:text-4xl">
      {prefix}{count.toLocaleString('nb-NO')}{suffix}
    </span>
  )
}

export function StatsCounter() {
  const [isVisible, setIsVisible] = useState(false)

  const stats: StatItem[] = [
    {
      icon: <Users className="h-8 w-8" />,
      value: 12500,
      label: "Aktive brukere",
      suffix: "+",
      color: "text-blue-600"
    },
    {
      icon: <Package className="h-8 w-8" />,
      value: 8900,
      label: "Tilgjengelige gjenstander",
      suffix: "+",
      color: "text-emerald-600"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      value: 45600,
      label: "Vellykkede utleier",
      suffix: "+",
      color: "text-purple-600"
    },
    {
      icon: <Star className="h-8 w-8" />,
      value: 4.8,
      label: "Gjennomsnittlig rating",
      suffix: "/5",
      color: "text-yellow-600"
    }
  ]

  return (
    <motion.div 
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-emerald-50 relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      onViewportEnter={() => setIsVisible(true)}
      transition={{ duration: 0.8 }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 text-gray-900">
            Tillit gjennom tall
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Tusenvis av nordmenn stoler på vår plattform hver dag
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group-hover:border-gray-200">
                <div className={`${stat.color} mb-4 sm:mb-6 flex justify-center`}>
                  {stat.icon}
                </div>
                
                <div className={`${stat.color} mb-2 sm:mb-3`}>
                  {isVisible ? (
                    <Counter 
                      end={stat.value} 
                      suffix={stat.suffix} 
                      prefix={stat.prefix}
                      duration={2 + index * 0.2}
                    />
                  ) : (
                    <span className="font-black text-2xl sm:text-3xl lg:text-4xl">
                      {stat.prefix}0{stat.suffix}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 font-medium text-sm sm:text-base">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div 
          className="mt-16 sm:mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-gray-500 mb-6 sm:mb-8 font-medium">Trygg og sikker plattform</p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 opacity-60">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">✓</span>
              </div>
              <span className="font-medium text-gray-700">BankID Verifisert</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">🛡️</span>
              </div>
              <span className="font-medium text-gray-700">Forsikret</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">⭐</span>
              </div>
              <span className="font-medium text-gray-700">Høy Rating</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}