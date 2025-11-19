'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/providers/cart-provider'
import { createCheckoutSession } from '@/lib/actions/checkout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Container, Section, Stack, Flex } from '@/components/ui/layout'
import { Heading, Text } from '@/components/ui/typography'
import { Spacer } from '@/components/ui/spacing'
import { formatCurrency } from '@/lib/utils'
import { Loader2, Lock, CreditCard } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, currency } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  // Check if user is logged in
  const [user, setUser] = useState<any>(null)
  
  useState(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user?.email) setEmail(user.email)
    }
    checkUser()
  })

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions')
      return
    }

    if (!user && (!email || !name)) {
      toast.error('Please fill in your details')
      return
    }

    setIsLoading(true)

    try {
      const result = await createCheckoutSession({
        items,
        currency,
        guestEmail: email,
        guestName: name,
      })

      if (result.success && result.url) {
        window.location.href = result.url
      } else {
        toast.error(result.error || 'Failed to start checkout')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <Section spacing="xl">
        <Heading level="h1" className="mb-8">Checkout</Heading>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Form Section */}
          <div className="lg:col-span-7">
            <form onSubmit={handleCheckout}>
              <Stack gap="xl">
                {/* Guest Info (if not logged in) */}
                {!user && (
                  <div className="rounded-xl border p-6">
                    <Heading level="h3" className="mb-4">Contact Information</Heading>
                    <Stack gap="md">
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </Stack>
                  </div>
                )}

                {/* Payment Method */}
                <div className="rounded-xl border p-6">
                  <Heading level="h3" className="mb-4">Payment Method</Heading>
                  <div className="flex items-center gap-4 rounded-lg border p-4 bg-muted/30">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Text weight="medium">Credit Card</Text>
                      <Text size="sm" color="muted">Processed securely by Stripe</Text>
                    </div>
                  </div>
                </div>

                {/* Order Review */}
                <div className="rounded-xl border p-6">
                  <Heading level="h3" className="mb-4">Order Review</Heading>
                  <Stack gap="md">
                    {items.map((item) => (
                      <Flex key={item.id} justify="between" align="center">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded bg-muted">
                            {/* Optional: thumbnail */}
                          </div>
                          <div>
                            <Text size="sm" weight="medium">{item.name}</Text>
                            <Text size="xs" color="muted">{item.type}</Text>
                          </div>
                        </div>
                        <Text size="sm" weight="medium">
                          {formatCurrency(currency === 'BRL' ? item.price_brl : item.price_usd, currency)}
                        </Text>
                      </Flex>
                    ))}
                    
                    <div className="h-px w-full bg-border my-2" />
                    
                    <Flex justify="between">
                      <Text weight="bold">Total</Text>
                      <Text size="xl" weight="bold" color="primary">
                        {formatCurrency(subtotal, currency)}
                      </Text>
                    </Flex>
                  </Stack>
                </div>

                {/* Terms */}
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I accept the terms and conditions
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      By clicking the button below, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </div>

                <Button size="xl" className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Pay {formatCurrency(subtotal, currency)}
                    </>
                  )}
                </Button>
              </Stack>
            </form>
          </div>

          {/* Sidebar / Trust */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-xl bg-muted/30 p-8">
              <Stack gap="lg">
                <Heading level="h3">Why Choose Alpha Grit?</Heading>
                
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                      ✓
                    </div>
                    <Text size="sm">Instant access to your digital products</Text>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                      ✓
                    </div>
                    <Text size="sm">Secure encrypted payment processing</Text>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                      ✓
                    </div>
                    <Text size="sm">30-day satisfaction guarantee</Text>
                  </li>
                </ul>
              </Stack>
            </div>
          </div>
        </div>
      </Section>
    </Container>
  )
}
