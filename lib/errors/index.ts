import { NextResponse } from 'next/server'

/**
 * Standard API error codes used across all routes
 */
export const ERROR_CODES = {
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Validation errors
  INVALID_REQUEST: 'INVALID_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',

  // Service errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  STRIPE_ERROR: 'STRIPE_ERROR',
  STRIPE_NOT_CONFIGURED: 'STRIPE_NOT_CONFIGURED',
  NO_BILLING_ACCOUNT: 'NO_BILLING_ACCOUNT',

  // Generic errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const

export type ErrorCode = keyof typeof ERROR_CODES

/**
 * User-friendly error messages by language
 */
export const ERROR_MESSAGES: Record<string, Record<ErrorCode, string>> = {
  en: {
    UNAUTHORIZED: 'Please log in to continue.',
    FORBIDDEN: 'You do not have permission to access this resource.',
    INVALID_REQUEST: 'Invalid request. Please refresh and try again.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    NOT_FOUND: 'The requested resource was not found.',
    CONFLICT: 'This action conflicts with existing data.',
    DATABASE_ERROR: 'Unable to process request. Please try again.',
    STRIPE_ERROR: 'Payment service error. Please try again.',
    STRIPE_NOT_CONFIGURED: 'Payments are not available yet.',
    NO_BILLING_ACCOUNT: 'No billing account found.',
    INTERNAL_ERROR: 'Something went wrong. Please try again later.',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable.',
  },
  pt: {
    UNAUTHORIZED: 'Faça login para continuar.',
    FORBIDDEN: 'Você não tem permissão para acessar este recurso.',
    INVALID_REQUEST: 'Requisição inválida. Atualize a página e tente novamente.',
    VALIDATION_ERROR: 'Verifique seus dados e tente novamente.',
    NOT_FOUND: 'O recurso solicitado não foi encontrado.',
    CONFLICT: 'Esta ação conflita com dados existentes.',
    DATABASE_ERROR: 'Não foi possível processar a requisição. Tente novamente.',
    STRIPE_ERROR: 'Erro no serviço de pagamento. Tente novamente.',
    STRIPE_NOT_CONFIGURED: 'Pagamentos ainda não estão disponíveis.',
    NO_BILLING_ACCOUNT: 'Conta de cobrança não encontrada.',
    INTERNAL_ERROR: 'Algo deu errado. Tente novamente mais tarde.',
    SERVICE_UNAVAILABLE: 'Serviço temporariamente indisponível.',
  },
}

/**
 * Standard API response envelope
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: ErrorCode
    message: string
    dev?: string
  }
}

/**
 * Create a standardized error response for API routes
 */
export function createErrorResponse(
  code: ErrorCode,
  status: number,
  lang: string = 'en',
  devMessage?: string
): NextResponse<ApiResponse> {
  const userMessage = ERROR_MESSAGES[lang]?.[code] || ERROR_MESSAGES.en[code]

  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message: userMessage,
        ...(process.env.NODE_ENV === 'development' && devMessage ? { dev: devMessage } : {}),
      },
    },
    { status }
  )
}

/**
 * Create a standardized success response for API routes
 */
export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  )
}

/**
 * Get user-friendly error message by code and language
 */
export function getErrorMessage(code: ErrorCode, lang: string = 'en'): string {
  return ERROR_MESSAGES[lang]?.[code] || ERROR_MESSAGES.en[code]
}

/**
 * Type guard to check if an error is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error
}

/**
 * Extract error message from unknown error type
 */
export function getErrorString(error: unknown): string {
  if (isError(error)) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Unknown error'
}
