/**
 * Stripe helper tests
 * These test the helper functions without actually calling Stripe
 */

describe('Stripe Configuration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should throw if Stripe secret key is not set', async () => {
    delete process.env.STRIPE_SECRET_KEY

    // The stripe module should throw when imported without config
    await expect(async () => {
      const { stripe } = await import('@/lib/stripe')
      // Force initialization
      stripe.customers.list({ limit: 1 })
    }).rejects.toThrow()
  })

  it('should have subscription plans defined', async () => {
    const { SUBSCRIPTION_PLANS } = await import('@/lib/stripe')

    expect(SUBSCRIPTION_PLANS).toBeDefined()
    expect(SUBSCRIPTION_PLANS.monthly).toBeDefined()
    expect(SUBSCRIPTION_PLANS.yearly).toBeDefined()

    // Check that prices exist (even if placeholders)
    expect(SUBSCRIPTION_PLANS.monthly.USD).toBeDefined()
    expect(SUBSCRIPTION_PLANS.monthly.BRL).toBeDefined()
    expect(SUBSCRIPTION_PLANS.yearly.USD).toBeDefined()
    expect(SUBSCRIPTION_PLANS.yearly.BRL).toBeDefined()
  })
})

describe('Price formatting', () => {
  it('should format USD prices correctly', () => {
    const usdFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    })

    expect(usdFormatter.format(9.99)).toBe('$9.99')
    expect(usdFormatter.format(97)).toBe('$97.00')
  })

  it('should format BRL prices correctly', () => {
    const brlFormatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

    expect(brlFormatter.format(47.9)).toContain('47,90')
    expect(brlFormatter.format(497)).toContain('497,00')
  })
})
