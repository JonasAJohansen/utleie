'use client'

import { motion, AnimatePresence } from "framer-motion"
import { Label } from "@/components/ui/label"

interface AnimatedFilterControlProps {
  label: string
  children: React.ReactNode
  isVisible?: boolean
}

export function AnimatedFilterControl({
  label,
  children,
  isVisible = true
}: AnimatedFilterControlProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          <Label>{label}</Label>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
} 