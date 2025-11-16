/**
 * Atomic Spacing Components
 * Zero hardcoding, fully responsive
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

// ============================================================================
// SPACER (Vertical or horizontal space)
// ============================================================================

type SpacingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'

const SPACING_MAP: Record<SpacingSize, string> = {
  xs: '0.5rem',   // 8px
  sm: '1rem',     // 16px
  md: '1.5rem',   // 24px
  lg: '2rem',     // 32px
  xl: '3rem',     // 48px
  '2xl': '4rem',  // 64px
  '3xl': '6rem',  // 96px
  '4xl': '8rem',  // 128px
}

const SPACING_CLASSES: Record<SpacingSize, string> = {
  xs: 'h-2 w-2',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
  '2xl': 'h-16 w-16',
  '3xl': 'h-24 w-24',
  '4xl': 'h-32 w-32',
}

export interface SpacerProps {
  size?: SpacingSize
  axis?: 'vertical' | 'horizontal' | 'both'
  className?: string
}

export const Spacer: React.FC<SpacerProps> = ({
  size = 'md',
  axis = 'vertical',
  className,
}) => {
  const baseClass = axis === 'vertical'
    ? `w-full ${SPACING_CLASSES[size].split(' ')[0]}`
    : axis === 'horizontal'
    ? `h-full ${SPACING_CLASSES[size].split(' ')[1]}`
    : SPACING_CLASSES[size]

  return <div className={cn(baseClass, className)} aria-hidden="true" />
}

// ============================================================================
// BOX (Spacing container with padding/margin)
// ============================================================================

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  p?: SpacingSize
  px?: SpacingSize
  py?: SpacingSize
  pt?: SpacingSize
  pb?: SpacingSize
  pl?: SpacingSize
  pr?: SpacingSize
  m?: SpacingSize
  mx?: SpacingSize
  my?: SpacingSize
  mt?: SpacingSize
  mb?: SpacingSize
  ml?: SpacingSize
  mr?: SpacingSize
}

const spacingToClass = (prefix: string, size?: SpacingSize): string => {
  if (!size) return ''
  const sizeMap: Record<SpacingSize, string> = {
    xs: '2',
    sm: '4',
    md: '6',
    lg: '8',
    xl: '12',
    '2xl': '16',
    '3xl': '24',
    '4xl': '32',
  }
  return `${prefix}-${sizeMap[size]}`
}

export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({
    className,
    p, px, py, pt, pb, pl, pr,
    m, mx, my, mt, mb, ml, mr,
    ...props
  }, ref) => {
    const classes = cn(
      p && spacingToClass('p', p),
      px && spacingToClass('px', px),
      py && spacingToClass('py', py),
      pt && spacingToClass('pt', pt),
      pb && spacingToClass('pb', pb),
      pl && spacingToClass('pl', pl),
      pr && spacingToClass('pr', pr),
      m && spacingToClass('m', m),
      mx && spacingToClass('mx', mx),
      my && spacingToClass('my', my),
      mt && spacingToClass('mt', mt),
      mb && spacingToClass('mb', mb),
      ml && spacingToClass('ml', ml),
      mr && spacingToClass('mr', mr),
      className
    )

    return <div ref={ref} className={classes} {...props} />
  }
)
Box.displayName = 'Box'

// ============================================================================
// DIVIDER (Horizontal or vertical line)
// ============================================================================

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  spacing?: SpacingSize
  className?: string
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  spacing = 'md',
  className,
}) => {
  const spacingClass = orientation === 'horizontal'
    ? `my-${spacing}`
    : `mx-${spacing}`

  const orientationClass = orientation === 'horizontal'
    ? 'w-full h-px'
    : 'h-full w-px'

  return (
    <div
      className={cn(
        orientationClass,
        'bg-border',
        spacingClass,
        className
      )}
      role="separator"
      aria-orientation={orientation}
    />
  )
}

// ============================================================================
// CENTER (Center content)
// ============================================================================

export interface CenterProps extends React.HTMLAttributes<HTMLDivElement> {
  axis?: 'both' | 'horizontal' | 'vertical'
  maxWidth?: string
}

export const Center = React.forwardRef<HTMLDivElement, CenterProps>(
  ({ className, axis = 'both', maxWidth, children, ...props }, ref) => {
    const flexClass = axis === 'both'
      ? 'flex items-center justify-center'
      : axis === 'horizontal'
      ? 'flex justify-center'
      : 'flex items-center'

    return (
      <div
        ref={ref}
        className={cn(flexClass, className)}
        {...props}
      >
        <div style={maxWidth ? { maxWidth } : undefined}>
          {children}
        </div>
      </div>
    )
  }
)
Center.displayName = 'Center'
