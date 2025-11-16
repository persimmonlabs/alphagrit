/**
 * Atomic Typography Components
 * Fully responsive, theme-aware, and reusable
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================================================
// HEADING COMPONENT
// ============================================================================

const headingVariants = cva('font-bold tracking-tight', {
  variants: {
    level: {
      h1: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
      h2: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
      h3: 'text-2xl sm:text-3xl md:text-4xl',
      h4: 'text-xl sm:text-2xl md:text-3xl',
      h5: 'text-lg sm:text-xl md:text-2xl',
      h6: 'text-base sm:text-lg md:text-xl',
    },
    weight: {
      black: 'font-black',
      extrabold: 'font-extrabold',
      bold: 'font-bold',
      semibold: 'font-semibold',
      medium: 'font-medium',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    gradient: {
      none: '',
      primary: 'bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent',
      accent: 'bg-gradient-to-r from-accent-500 via-accent-600 to-primary-500 bg-clip-text text-transparent',
      brand: 'bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 bg-clip-text text-transparent',
    },
  },
  defaultVariants: {
    level: 'h2',
    weight: 'bold',
    align: 'left',
    gradient: 'none',
  },
})

export interface HeadingProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'>,
    VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level, weight, align, gradient, as, ...props }, ref) => {
    const Comp = as || level || 'h2'
    return (
      <Comp
        ref={ref}
        className={cn(headingVariants({ level, weight, align, gradient, className }))}
        {...props}
      />
    )
  }
)
Heading.displayName = 'Heading'

// ============================================================================
// TEXT COMPONENT
// ============================================================================

const textVariants = cva('', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    color: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary-500',
      accent: 'text-accent-500',
      error: 'text-destructive',
      success: 'text-green-600 dark:text-green-400',
    },
    truncate: {
      none: '',
      single: 'truncate',
      multi: 'line-clamp-2',
      multi3: 'line-clamp-3',
    },
  },
  defaultVariants: {
    size: 'base',
    weight: 'normal',
    align: 'left',
    color: 'default',
    truncate: 'none',
  },
})

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div' | 'label'
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, size, weight, align, color, truncate, as = 'p', ...props }, ref) => {
    const Comp = as as any
    return (
      <Comp
        ref={ref}
        className={cn(textVariants({ size, weight, align, color, truncate, className }))}
        {...props}
      />
    )
  }
)
Text.displayName = 'Text'

// ============================================================================
// DISPLAY TEXT (Large hero text)
// ============================================================================

const displayVariants = cva('font-black tracking-tight leading-none', {
  variants: {
    size: {
      sm: 'text-5xl sm:text-6xl md:text-7xl',
      md: 'text-6xl sm:text-7xl md:text-8xl',
      lg: 'text-7xl sm:text-8xl md:text-9xl',
    },
    gradient: {
      none: '',
      primary: 'bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent',
      accent: 'bg-gradient-to-r from-accent-500 via-accent-600 to-primary-500 bg-clip-text text-transparent',
      brand: 'bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 bg-clip-text text-transparent',
    },
  },
  defaultVariants: {
    size: 'md',
    gradient: 'none',
  },
})

export interface DisplayProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof displayVariants> {}

export const Display = React.forwardRef<HTMLHeadingElement, DisplayProps>(
  ({ className, size, gradient, ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={cn(displayVariants({ size, gradient, className }))}
        {...props}
      />
    )
  }
)
Display.displayName = 'Display'
