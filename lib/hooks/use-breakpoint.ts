/**
 * Responsive breakpoint hook
 * Fully type-safe, zero hardcoding
 */

'use client'

import { useEffect, useState } from 'react'

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

type Breakpoint = keyof typeof BREAKPOINTS

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('sm')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const updateBreakpoint = () => {
      const width = window.innerWidth

      if (width >= BREAKPOINTS['2xl']) {
        setBreakpoint('2xl')
      } else if (width >= BREAKPOINTS.xl) {
        setBreakpoint('xl')
      } else if (width >= BREAKPOINTS.lg) {
        setBreakpoint('lg')
      } else if (width >= BREAKPOINTS.md) {
        setBreakpoint('md')
      } else {
        setBreakpoint('sm')
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return {
    breakpoint,
    isSm: isMounted && breakpoint === 'sm',
    isMd: isMounted && breakpoint === 'md',
    isLg: isMounted && breakpoint === 'lg',
    isXl: isMounted && breakpoint === 'xl',
    is2Xl: isMounted && breakpoint === '2xl',
    isAboveSm: isMounted && (breakpoint === 'md' || breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl'),
    isAboveMd: isMounted && (breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl'),
    isAboveLg: isMounted && (breakpoint === 'xl' || breakpoint === '2xl'),
    isAboveXl: isMounted && breakpoint === '2xl',
    isMobile: isMounted && (breakpoint === 'sm' || breakpoint === 'md'),
    isDesktop: isMounted && (breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl'),
  }
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return isMounted && matches
}
