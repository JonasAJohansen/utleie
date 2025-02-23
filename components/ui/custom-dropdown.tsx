import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface CustomDropdownProps {
  trigger: React.ReactNode
  content: React.ReactNode
  align?: 'start' | 'end'
  className?: string
  contentClassName?: string
}

interface CustomDropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  href?: string
}

export function CustomDropdown({
  trigger,
  content,
  align = 'start',
  className,
  contentClassName
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn('relative inline-block', className)} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute mt-2 py-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[8rem]',
              align === 'end' ? 'right-0' : 'left-0',
              contentClassName
            )}
            style={{ zIndex: 50 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function CustomDropdownItem({
  children,
  className,
  asChild,
  href,
  ...props
}: CustomDropdownItemProps) {
  const baseClassName = cn(
    'w-full px-4 py-2 text-sm text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors',
    className
  )

  if (asChild && href) {
    return (
      <Link href={href} className={baseClassName}>
        {children}
      </Link>
    )
  }

  return (
    <button
      className={baseClassName}
      {...props}
    >
      {children}
    </button>
  )
} 