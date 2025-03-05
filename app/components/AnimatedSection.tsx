'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  variants?: any;
  whileHover?: any;
  whileTap?: any;
  [key: string]: any;
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