'use client'

import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"

interface AnimatedFilterControlProps {
  label: string
  children: React.ReactNode
  index: number
}

export function AnimatedFilterControl({ label, children, index }: AnimatedFilterControlProps) {
  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.2 }}
      >
        <Label>{label}</Label>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
} 