'use client';

import { ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';

interface AnimatedSectionProps extends MotionProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedSection({ 
  children, 
  className = '', 
  ...motionProps 
}: AnimatedSectionProps) {
  return (
    <motion.div 
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCard({ 
  children, 
  className = '', 
  ...motionProps 
}: AnimatedSectionProps) {
  return (
    <motion.div 
      className={`rounded-2xl overflow-hidden ${className}`}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
} 