/**
 * Error Utilities Unit Tests
 * Tests pure functions without Next.js runtime dependencies
 */

import {
  ERROR_CODES,
  ERROR_MESSAGES,
  getErrorMessage,
  isError,
  getErrorString,
} from '@/lib/errors'

describe('Error Utilities', () => {
  describe('ERROR_CODES', () => {
    it('should have all required error codes', () => {
      expect(ERROR_CODES.UNAUTHORIZED).toBe('UNAUTHORIZED')
      expect(ERROR_CODES.FORBIDDEN).toBe('FORBIDDEN')
      expect(ERROR_CODES.INVALID_REQUEST).toBe('INVALID_REQUEST')
      expect(ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
      expect(ERROR_CODES.NOT_FOUND).toBe('NOT_FOUND')
      expect(ERROR_CODES.CONFLICT).toBe('CONFLICT')
      expect(ERROR_CODES.DATABASE_ERROR).toBe('DATABASE_ERROR')
      expect(ERROR_CODES.STRIPE_ERROR).toBe('STRIPE_ERROR')
      expect(ERROR_CODES.STRIPE_NOT_CONFIGURED).toBe('STRIPE_NOT_CONFIGURED')
      expect(ERROR_CODES.NO_BILLING_ACCOUNT).toBe('NO_BILLING_ACCOUNT')
      expect(ERROR_CODES.INTERNAL_ERROR).toBe('INTERNAL_ERROR')
      expect(ERROR_CODES.SERVICE_UNAVAILABLE).toBe('SERVICE_UNAVAILABLE')
    })

    it('should have 12 total error codes', () => {
      expect(Object.keys(ERROR_CODES)).toHaveLength(12)
    })
  })

  describe('ERROR_MESSAGES', () => {
    it('should have English messages for all error codes', () => {
      const codes = Object.keys(ERROR_CODES) as (keyof typeof ERROR_CODES)[]
      codes.forEach((code) => {
        expect(ERROR_MESSAGES.en[code]).toBeDefined()
        expect(typeof ERROR_MESSAGES.en[code]).toBe('string')
        expect(ERROR_MESSAGES.en[code].length).toBeGreaterThan(0)
      })
    })

    it('should have Portuguese messages for all error codes', () => {
      const codes = Object.keys(ERROR_CODES) as (keyof typeof ERROR_CODES)[]
      codes.forEach((code) => {
        expect(ERROR_MESSAGES.pt[code]).toBeDefined()
        expect(typeof ERROR_MESSAGES.pt[code]).toBe('string')
        expect(ERROR_MESSAGES.pt[code].length).toBeGreaterThan(0)
      })
    })

    it('should have different messages for English and Portuguese', () => {
      expect(ERROR_MESSAGES.en.UNAUTHORIZED).not.toBe(ERROR_MESSAGES.pt.UNAUTHORIZED)
    })
  })

  describe('getErrorMessage', () => {
    it('should return English message by default', () => {
      const message = getErrorMessage('UNAUTHORIZED')
      expect(message).toBe('Please log in to continue.')
    })

    it('should return Portuguese message when requested', () => {
      const message = getErrorMessage('UNAUTHORIZED', 'pt')
      expect(message).toBe('Faça login para continuar.')
    })

    it('should fall back to English for unknown language', () => {
      const message = getErrorMessage('UNAUTHORIZED', 'fr')
      expect(message).toBe('Please log in to continue.')
    })

    it('should return all error messages correctly', () => {
      expect(getErrorMessage('FORBIDDEN')).toBe('You do not have permission to access this resource.')
      expect(getErrorMessage('NOT_FOUND')).toBe('The requested resource was not found.')
      expect(getErrorMessage('INTERNAL_ERROR')).toBe('Something went wrong. Please try again later.')
    })
  })

  describe('isError', () => {
    it('should return true for Error instances', () => {
      expect(isError(new Error('test'))).toBe(true)
      expect(isError(new TypeError('type error'))).toBe(true)
      expect(isError(new RangeError('range error'))).toBe(true)
      expect(isError(new SyntaxError('syntax error'))).toBe(true)
    })

    it('should return false for non-Error values', () => {
      expect(isError('string error')).toBe(false)
      expect(isError({ message: 'object' })).toBe(false)
      expect(isError(null)).toBe(false)
      expect(isError(undefined)).toBe(false)
      expect(isError(42)).toBe(false)
      expect(isError([])).toBe(false)
      expect(isError({})).toBe(false)
    })
  })

  describe('getErrorString', () => {
    it('should extract message from Error instance', () => {
      expect(getErrorString(new Error('test message'))).toBe('test message')
      expect(getErrorString(new TypeError('type error'))).toBe('type error')
    })

    it('should return string directly', () => {
      expect(getErrorString('string error')).toBe('string error')
      expect(getErrorString('')).toBe('')
    })

    it('should return "Unknown error" for other types', () => {
      expect(getErrorString(null)).toBe('Unknown error')
      expect(getErrorString(undefined)).toBe('Unknown error')
      expect(getErrorString(42)).toBe('Unknown error')
      expect(getErrorString({ message: 'object' })).toBe('Unknown error')
      expect(getErrorString([])).toBe('Unknown error')
    })
  })
})
