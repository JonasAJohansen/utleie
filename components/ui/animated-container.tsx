'use client'

interface AnimatedContainerProps {
  children: React.ReactNode
  isLoading: boolean
}

export function AnimatedContainer({ children, isLoading }: AnimatedContainerProps) {
  return (
    <div className="transition-all duration-300 ease-in-out">
      {children}
    </div>
  )
} 