'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface StickySidebarProps {
  children: React.ReactNode;
  offsetTop?: number; // Offset from the top of the page (in px)
  offsetBottom?: number; // Offset from the bottom of the page (in px)
}

export function StickySidebar({
  children,
  offsetTop = 100,
  offsetBottom = 20
}: StickySidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [sidebarHeight, setSidebarHeight] = useState(0);
  const [containerTop, setContainerTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    // Function to handle scroll event
    const handleScroll = () => {
      if (!sidebarRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      
      // Update measurements
      setSidebarHeight(sidebarRect.height);
      setContainerTop(rect.top);
      setContainerHeight(rect.height);

      // Calculate scroll thresholds
      const containerTopThreshold = offsetTop;
      const containerBottomThreshold = window.innerHeight - sidebarHeight - offsetBottom;

      // Determine if we should stick the sidebar
      if (rect.top <= containerTopThreshold) {
        // If there's not enough space for the entire sidebar to be sticky,
        // we need to switch to a "bottom sticky" behavior when reaching the end
        if (rect.bottom < sidebarHeight + offsetTop) {
          setIsSticky(false);
        } else {
          setIsSticky(true);
        }
      } else {
        setIsSticky(false);
      }
    };

    // Set up initial measurements
    if (sidebarRef.current && containerRef.current) {
      setSidebarHeight(sidebarRef.current.offsetHeight);
      setContainerTop(containerRef.current.getBoundingClientRect().top);
      setContainerHeight(containerRef.current.offsetHeight);
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    // Call it once to initialize
    handleScroll();

    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [offsetTop, offsetBottom]);

  return (
    <div ref={containerRef} className="relative">
      <AnimatePresence>
        <motion.div
          ref={sidebarRef}
          className="w-full"
          style={{
            position: isSticky ? 'fixed' : 'relative',
            top: isSticky ? `${offsetTop}px` : 'auto',
            bottom: isSticky ? `${offsetBottom}px` : 'auto',
            width: containerRef.current ? containerRef.current.offsetWidth : 'auto',
            maxHeight: isSticky ? `calc(100vh - ${offsetTop + offsetBottom}px)` : 'none',
            overflowY: isSticky ? 'auto' : 'visible',
            zIndex: 10,
          }}
          initial={false}
          animate={isSticky ? { y: 0 } : { y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 