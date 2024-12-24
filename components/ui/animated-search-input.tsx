'use client'

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface AnimatedSearchInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}

export function AnimatedSearchInput({ value, onChange, placeholder }: AnimatedSearchInputProps) {
  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute left-4 top-1/2 transform -translate-y-1/2"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        transition={{ delay: 0.2 }}
      >
        <Search className="h-5 w-5" />
      </motion.div>
      <motion.div
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="pl-12 h-14 bg-white/90 backdrop-blur-sm text-black placeholder:text-gray-500 text-lg rounded-full border-2 border-white/20 focus:border-white/40 transition-colors"
        />
      </motion.div>
    </motion.div>
  )
} 