/**
 * Responsive utility components
 * Show/hide content based on breakpoints
 */

'use client'

import * as React from 'react'
import { useBreakpoint } from '@/lib/hooks/use-breakpoint'

export interface ShowProps {
  above?: 'sm' | 'md' | 'lg' | 'xl'
  below?: 'sm' | 'md' | 'lg' | 'xl'
  only?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  children: React.ReactNode
}

export const Show: React.FC<ShowProps> = ({ above, below, only, children }) => {
  const bp = useBreakpoint()

  let shouldShow = false

  if (only) {
    shouldShow = bp.breakpoint === only
  } else if (above) {
    shouldShow =
      (above === 'sm' && bp.isAboveSm) ||
      (above === 'md' && bp.isAboveMd) ||
      (above === 'lg' && bp.isAboveLg) ||
      (above === 'xl' && bp.isAboveXl)
  } else if (below) {
    shouldShow =
      (below === 'xl' && !bp.is2Xl) ||
      (below === 'lg' && !bp.isAboveLg) ||
      (below === 'md' && !bp.isAboveMd) ||
      (below === 'sm' && bp.isSm)
  }

  if (!shouldShow) return null
  return <>{children}</>
}

export const Hide: React.FC<ShowProps> = (props) => {
  // Invert the logic of Show
  const inverseProps: ShowProps = { ...props }
  if (props.above) {
    delete inverseProps.above
    inverseProps.below = props.above
  } else if (props.below) {
    delete inverseProps.below
    inverseProps.above = props.below
  }

  return <Show {...inverseProps} />
}

// Shorthand components
export const MobileOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Show below="lg">{children}</Show>
)

export const DesktopOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Show above="md">{children}</Show>
)

export const TabletOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Show only="md">{children}</Show>
)
