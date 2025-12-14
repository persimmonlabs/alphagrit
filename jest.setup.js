import '@testing-library/jest-dom'

// Polyfill Web APIs for Jest environment
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Simple Request/Response polyfills for testing
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(url, options = {}) {
      this.url = url
      this.method = options.method || 'GET'
      this.headers = new Map(Object.entries(options.headers || {}))
      this._body = options.body
    }
    async json() {
      return JSON.parse(this._body)
    }
    async text() {
      return this._body
    }
  }
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, options = {}) {
      this._body = body
      this.status = options.status || 200
      this.headers = new Map(Object.entries(options.headers || {}))
    }
    async json() {
      return typeof this._body === 'string' ? JSON.parse(this._body) : this._body
    }
  }
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers extends Map {
    constructor(init = {}) {
      super(Object.entries(init))
    }
    get(key) {
      return super.get(key.toLowerCase()) || null
    }
    set(key, value) {
      return super.set(key.toLowerCase(), value)
    }
  }
}

// Mock crypto.randomUUID
if (!global.crypto) {
  global.crypto = {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
  }
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useParams() {
    return { lang: 'en' }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies() {
    return {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    }
  },
  headers() {
    return new Headers()
  },
}))

// Suppress console warnings in tests
const originalWarn = console.warn
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('DEPRECATED') || args[0].includes('experimental'))
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.warn = originalWarn
})
