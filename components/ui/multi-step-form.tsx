import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Card } from './card'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight } from 'lucide-react'

interface Step {
  title: string
  description: string
  isCompleted: boolean
  isOptional?: boolean
}

interface MultiStepFormProps {
  steps: Step[]
  currentStep: number
  onStepChange: (step: number) => void
  children: React.ReactNode
  className?: string
}

export function MultiStepForm({
  steps,
  currentStep,
  onStepChange,
  children,
  className
}: MultiStepFormProps) {
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className={cn('space-y-8', className)}>
      {/* Progress Steps */}
      <nav aria-label="Progress" className="px-4">
        <ol role="list" className="flex items-center">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className={cn(
                'relative',
                index !== steps.length - 1 ? 'pr-8 sm:pr-20' : '',
                'flex-1'
              )}
            >
              {step.isCompleted ? (
                <div className="group">
                  <span className="flex items-start">
                    <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-full w-full rounded-full bg-[#4CD964] group-hover:bg-[#3DAF50]"
                      >
                        <Check className="h-3 w-3 text-white" />
                      </motion.div>
                    </span>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {step.title}
                    </span>
                  </span>
                </div>
              ) : index === currentStep ? (
                <div className="group" aria-current="step">
                  <span className="flex items-start">
                    <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-full w-full rounded-full border-2 border-[#4CD964]"
                      />
                    </span>
                    <span className="ml-3 text-sm font-medium text-[#4CD964]">
                      {step.title}
                    </span>
                  </span>
                </div>
              ) : (
                <div className="group">
                  <span className="flex items-start">
                    <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-gray-300 group-hover:bg-gray-400" />
                    </span>
                    <span className="ml-3 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                      {step.title}
                    </span>
                  </span>
                </div>
              )}

              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    'absolute right-0 top-2.5 h-0.5 w-full max-w-[100px]',
                    step.isCompleted ? 'bg-[#4CD964]' : 'bg-gray-200'
                  )}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <Card className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Navigation - Only show if not in preview step */}
      {!isLastStep && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => onStepChange(currentStep - 1)}
            disabled={currentStep === 0}
          >
            Tilbake
          </Button>
          <Button
            onClick={() => onStepChange(currentStep + 1)}
            disabled={currentStep === steps.length - 1}
            className="bg-[#4CD964] hover:bg-[#3DAF50]"
          >
            {currentStep === steps.length - 2 ? 'Forhåndsvisning' : 'Neste'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
} 