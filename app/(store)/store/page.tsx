import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function StorePage() {
  return (
    <div className="container py-12">
      <section className="text-center space-y-6 py-20">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight">
          Dominate Every Area of Your Life
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          Science-based transformation system for modern men. Not temporary motivation—total reconstruction.
        </p>
        <div className="flex gap-4 justify-center pt-6">
          <Button size="lg" asChild>
            <Link href="#products">Browse Products</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/blog">Read the Blog</Link>
          </Button>
        </div>
      </section>

      <section id="products" className="py-20">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Products</h2>
        <div className="text-center text-muted-foreground py-12">
          <p className="text-lg">Products will be loaded here dynamically from Supabase.</p>
          <p className="text-sm mt-4">Admin panel required to add products.</p>
        </div>
      </section>

      <section className="py-20 bg-primary-500/10 rounded-2xl">
        <div className="text-center space-y-6 px-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Transform?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of men who have taken control of their lives through discipline and action.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/signup">Get Started Now</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
