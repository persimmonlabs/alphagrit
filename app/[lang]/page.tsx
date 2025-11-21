import Link from 'next/link'
import { getDictionary } from '@/lib/dictionary'
import type { Locale } from '@/i18n-config'
import { Button } from '@/components/ui/button'

export default async function Home({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang)

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary selection:text-black">

      {/* --- HEADER (Sticky, Blur, Precision Borders) --- */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="grid grid-cols-[1fr_auto] md:grid-cols-[200px_1fr_200px] h-16 items-center">

          {/* Logo Area */}
          <div className="flex items-center px-6 h-full border-r border-border">
            <Link href={`/${lang}`} className="flex items-center gap-3 group">
              <div className="h-3 w-3 bg-primary group-hover:animate-blink" />
              <span className="font-heading text-lg md:text-xl tracking-[0.2em] uppercase">AlphaGrit</span>
            </Link>
          </div>

          {/* Desktop Nav (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center justify-center gap-8 h-full font-mono text-[10px] tracking-widest text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors uppercase">[ {dict.nav.manifesto} ]</Link>
            <Link href="#" className="hover:text-primary transition-colors uppercase">[ {dict.nav.products} ]</Link>
            <Link href="#" className="hover:text-primary transition-colors uppercase">[ {dict.nav.login} ]</Link>
          </nav>

          {/* Mobile Right: Lang + Menu */}
          <div className="flex items-center h-full justify-end px-6 border-l border-border font-mono text-[10px]">
             <Link href="/en" className={`px-2 py-1 hover:text-primary transition-colors ${lang === 'en' ? 'text-primary font-bold' : 'text-neutral-600'}`}>EN</Link>
             <span className="text-border">|</span>
             <Link href="/pt" className={`px-2 py-1 hover:text-primary transition-colors ${lang === 'pt' ? 'text-primary font-bold' : 'text-neutral-600'}`}>PT</Link>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION (Fluid Typography & Grid Layout) --- */}
      <section className="relative border-b border-border flex flex-col justify-between min-h-[85vh]">
        {/* Background Grid */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none" />

        <div className="container mx-auto px-6 md:px-12 pt-24 md:pt-40 pb-12 flex-1 flex flex-col justify-center">
          {/* Status Pill */}
          <div className="font-mono text-[10px] md:text-xs text-primary mb-6 flex items-center gap-3 uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {dict.hero.status}
          </div>

          {/* Fluid Heading: Never breaks, always massive */}
          <h1 className="font-heading text-[13vw] md:text-[10vw] leading-[0.85] font-bold uppercase text-foreground tracking-tighter mix-blend-difference">
            {dict.hero.title_line1}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-neutral-400 to-neutral-950 stroke-white">{dict.hero.title_line2}</span>
          </h1>
        </div>

        {/* Bottom Hero Grid: Stacks on Mobile, Side-by-Side on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-12 border-t border-border">
          {/* Description Area */}
          <div className="col-span-1 md:col-span-7 p-6 md:p-12 border-b md:border-b-0 md:border-r border-border">
            <p className="font-body text-base md:text-xl text-neutral-400 leading-relaxed max-w-xl">
              {dict.hero.description}
            </p>
          </div>

          {/* CTA Area */}
          <div className="col-span-1 md:col-span-5 p-6 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-4 justify-center bg-secondary/5">
            <Button variant="brutal" size="lg" className="w-full md:w-auto h-14 px-8 text-base">
              {dict.hero.cta_primary}
            </Button>
            <Button variant="outline" size="lg" className="w-full md:w-auto h-14 px-8 text-base border-neutral-800 text-neutral-400 hover:text-foreground">
              {dict.hero.cta_secondary}
            </Button>
          </div>
        </div>
      </section>

      {/* --- INFINITE MARQUEE (Visual Break) --- */}
      <div className="border-b border-border bg-primary py-3 overflow-hidden relative select-none">
         <div className="animate-marquee whitespace-nowrap font-mono text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-black">
            // SYSTEM OVERRIDE // DISCONNECT FROM THE NOISE // REBUILD THE HARDWARE // ALPHAGRIT PROTOCOL V1.0 // SYSTEM OVERRIDE // DISCONNECT FROM THE NOISE
         </div>
      </div>

      {/* --- THE TRINITY GRID (Responsive Bento) --- */}
      <section className="border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {[dict.cards.body, dict.cards.mind, dict.cards.code].map((card, i) => (
            <div key={i} className="group relative flex flex-col justify-between p-8 md:p-12 min-h-[320px] md:min-h-[450px] hover:bg-concrete hover:text-black transition-all duration-500 ease-out cursor-pointer">

              {/* Card Header */}
              <div className="font-mono text-[10px] mb-8 flex justify-between opacity-60 group-hover:opacity-100">
                <span>00{i + 1}</span>
                <span>:: SYS_MOD ::</span>
              </div>

              {/* Card Content */}
              <div className="relative z-10">
                <h3 className="font-heading text-4xl md:text-5xl mb-6 uppercase tracking-tight">{card.title}</h3>
                <p className="font-body text-sm md:text-base opacity-70 max-w-[280px] leading-relaxed group-hover:font-medium">
                  {card.desc}
                </p>
              </div>

              {/* Card Footer/Link */}
              <div className="mt-12 pt-6 border-t border-dashed border-neutral-700/30 group-hover:border-black/30">
                <span className="font-mono text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform inline-block font-bold">
                  {card.link}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FEATURED DROP (Asymmetric Grid) --- */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh] border-b border-border">

        {/* Visual Side (Stacks on top on Mobile) */}
        <div className="relative h-[400px] lg:h-auto border-b lg:border-b-0 lg:border-r border-border bg-neutral-900 overflow-hidden flex items-center justify-center group">
            {/* Dynamic Noise Overlay */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />
            <h2 className="font-heading text-[25vw] lg:text-[15vw] text-neutral-800 group-hover:text-primary transition-colors duration-700 select-none leading-none tracking-tighter">
              VQ
            </h2>
            <div className="absolute bottom-6 left-6 bg-background border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-wider">
              {dict.featured.badge}
            </div>
        </div>

        {/* Content Side */}
        <div className="flex flex-col p-8 md:p-16 lg:p-24 justify-between bg-background">
           <div className="space-y-8">
             <div className="flex justify-between items-center pb-6 border-b border-border">
               <span className="font-mono text-xs text-primary font-bold">{dict.featured.label}</span>
               <span className="font-mono text-xs text-muted-foreground">ID: #884-X</span>
             </div>

             <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl leading-[0.9] uppercase">
               {dict.featured.title}
               <span className="block text-primary mt-2">{dict.featured.product_title}</span>
             </h2>

             <p className="text-muted-foreground text-base md:text-lg max-w-md leading-relaxed">
               {dict.featured.product_desc}
             </p>

             <div className="pt-8 space-y-4">
                {dict.featured.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-1.5 w-1.5 bg-primary shrink-0" />
                    <span className="font-mono text-xs md:text-sm uppercase tracking-wide">{feat}</span>
                  </div>
                ))}
             </div>
           </div>

           {/* Pricing & Action */}
           <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
             <div className="flex flex-col">
               <span className="font-mono text-xs text-muted-foreground line-through mb-1">BRL 497.00</span>
               <span className="font-heading text-4xl md:text-5xl text-foreground">BRL 97.00</span>
             </div>
             <Button variant="brutal" size="lg" className="w-full md:w-auto h-16 px-10 text-lg">
               {dict.featured.cta}
             </Button>
           </div>
        </div>
      </section>

      {/* --- FOOTER (Minimal) --- */}
      <footer className="py-12 px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-secondary/5">
        <div className="space-y-2">
          <h4 className="font-heading text-2xl uppercase tracking-widest">ALPHAGRIT</h4>
          <p className="font-mono text-[10px] text-neutral-500 max-w-[200px] leading-tight">
            DECENTRALIZED PUBLISHING PROTOCOL<br/>
            EST. 2025 // GLOBAL
          </p>
        </div>
        <div className="font-mono text-[10px] text-neutral-500 md:text-right space-y-1">
           <p className="uppercase">{dict.footer.location}</p>
           <p>{dict.footer.rights}</p>
        </div>
      </footer>
    </div>
  )
}
