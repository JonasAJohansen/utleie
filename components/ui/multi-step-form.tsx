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
      {/* Enhanced Progress Steps */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Opprett annonse</h2>
          <p className="text-sm text-gray-600">Steg {currentStep + 1} av {steps.length}</p>
        </div>
        
        <nav aria-label="Progress">
          {/* Mobile Layout - Vertical */}
          <div className="md:hidden">
            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <div
                    className={cn(
                      'group flex items-start cursor-pointer transition-all duration-200',
                      index <= currentStep ? 'cursor-pointer' : 'cursor-default'
                    )}
                    onClick={() => index <= currentStep && onStepChange(index)}
                  >
                    <div className="flex items-start">
                      {/* Step Number/Icon */}
                      <div className="flex-shrink-0">
                        {step.isCompleted ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4CD964] shadow-lg"
                          >
                            <Check className="h-4 w-4 text-white" />
                          </motion.div>
                        ) : index === currentStep ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#4CD964] bg-white shadow-md"
                          >
                            <span className="text-xs font-semibold text-[#4CD964]">
                              {index + 1}
                            </span>
                          </motion.div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 border border-gray-200">
                            <span className="text-xs font-medium text-gray-400">
                              {index + 1}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="ml-3 min-w-0 flex-1">
                        <div
                          className={cn(
                            'text-sm font-medium transition-colors duration-200',
                            step.isCompleted
                              ? 'text-[#4CD964]'
                              : index === currentStep
                              ? 'text-[#4CD964]'
                              : 'text-gray-500'
                          )}
                        >
                          {step.title}
                        </div>
                        <div
                          className={cn(
                            'text-xs mt-1 transition-colors duration-200',
                            step.isCompleted
                              ? 'text-green-600'
                              : index === currentStep
                              ? 'text-[#3DAF50]'
                              : 'text-gray-400'
                          )}
                        >
                          {step.description}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connecting Line for Mobile */}
                  {index !== steps.length - 1 && (
                    <div className="ml-4 mt-2 mb-2">
                      <div
                        className={cn(
                          'w-0.5 h-4 transition-colors duration-300',
                          step.isCompleted ? 'bg-[#4CD964]' : 'bg-gray-200'
                        )}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>

          {/* Desktop Layout - Horizontal with better responsive handling */}
          <div className="hidden md:block">
            <ol className="grid grid-cols-5 gap-2 lg:gap-4">
              {steps.map((step, index) => (
                <li key={step.title} className="relative">
                  <div
                    className={cn(
                      'group flex flex-col items-center text-center cursor-pointer transition-all duration-200',
                      index <= currentStep ? 'cursor-pointer' : 'cursor-default'
                    )}
                    onClick={() => index <= currentStep && onStepChange(index)}
                  >
                    {/* Step Number/Icon */}
                    <div className="flex-shrink-0 mb-3">
                      {step.isCompleted ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4CD964] shadow-lg"
                        >
                          <Check className="h-5 w-5 text-white" />
                        </motion.div>
                      ) : index === currentStep ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#4CD964] bg-white shadow-md"
                        >
                          <span className="text-sm font-semibold text-[#4CD964]">
                            {index + 1}
                          </span>
                        </motion.div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 border border-gray-200">
                          <span className="text-sm font-medium text-gray-400">
                            {index + 1}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="min-w-0 w-full">
                      <div
                        className={cn(
                          'text-sm font-medium transition-colors duration-200 mb-1',
                          step.isCompleted
                            ? 'text-[#4CD964]'
                            : index === currentStep
                            ? 'text-[#4CD964]'
                            : 'text-gray-500'
                        )}
                      >
                        {step.title}
                      </div>
                      <div
                        className={cn(
                          'text-xs transition-colors duration-200 line-clamp-2',
                          step.isCompleted
                            ? 'text-green-600'
                            : index === currentStep
                            ? 'text-[#3DAF50]'
                            : 'text-gray-400'
                        )}
                      >
                        {step.description}
                      </div>
                    </div>
                  </div>

                  {/* Connecting Line for Desktop */}
                  {index !== steps.length - 1 && (
                    <div className="absolute top-5 left-1/2 w-full h-0.5 transform translate-x-2">
                      <div
                        className={cn(
                          'h-full w-full transition-colors duration-300',
                          step.isCompleted ? 'bg-[#4CD964]' : 'bg-gray-200'
                        )}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </nav>

        {/* Progress Bar */}
        <div className="mt-8 mb-2">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#4CD964] to-[#3DAF50] rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((currentStep + 1) / steps.length) * 100}%` 
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Start</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% fullført</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <Card className="relative overflow-hidden shadow-sm border border-gray-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 md:p-8"
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {steps[currentStep].title}
              </h3>
              <p className="text-gray-600">
                {steps[currentStep].description}
              </p>
            </div>
            {children}
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Enhanced Navigation */}
      {!isLastStep && (
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={() => onStepChange(currentStep - 1)}
            disabled={currentStep === 0}
            className="px-4 md:px-6 py-2 border-gray-300 hover:border-gray-400 transition-colors"
          >
            Tilbake
          </Button>
          
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">
              Steg {currentStep + 1} av {steps.length}
            </div>
          </div>

          <Button
            onClick={() => onStepChange(currentStep + 1)}
            disabled={currentStep === steps.length - 1}
            className="bg-[#4CD964] hover:bg-[#3DAF50] px-4 md:px-6 py-2 shadow-lg shadow-[#4CD964]/20 transition-all duration-200 hover:shadow-xl hover:shadow-[#4CD964]/30"
          >
            {currentStep === steps.length - 2 ? 'Forhåndsvisning' : 'Neste'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
} 