import { getDictionary } from '@/lib/dictionary'
import type { Locale } from '@/i18n-config'
import Link from 'next/link'

export default async function TermsPage({
  params: { lang },
}: {
  params: { lang: Locale }
}) {
  const dict = await getDictionary(lang)
  const isPt = lang === 'pt'

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/${lang}`} className="text-primary hover:opacity-80">
            ← {isPt ? 'Voltar' : 'Back'}
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">{dict.legal.termsTitle}</h1>
        <p className="text-muted-foreground mb-8">
          {dict.legal.lastUpdated}: {isPt ? '1 de Janeiro de 2025' : 'January 1, 2025'}
        </p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {isPt ? '1. Aceitação dos Termos' : '1. Acceptance of Terms'}
            </h2>
            <p className="text-muted-foreground">
              {isPt
                ? 'Ao acessar e usar este site, você aceita e concorda em cumprir estes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não poderá acessar o serviço.'
                : 'By accessing and using this website, you accept and agree to be bound by these terms and conditions of use. If you disagree with any part of these terms, you may not access the service.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {isPt ? '2. Produtos Digitais' : '2. Digital Products'}
            </h2>
            <p className="text-muted-foreground">
              {isPt
                ? 'Todos os e-books e conteúdos digitais disponíveis nesta plataforma são para uso pessoal e não comercial. Você não pode redistribuir, revender ou compartilhar os materiais sem autorização expressa.'
                : 'All e-books and digital content available on this platform are for personal, non-commercial use. You may not redistribute, resell, or share subscription materials without express authorization.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {isPt ? '3. Pagamentos e Reembolsos' : '3. Payments and Refunds'}
            </h2>
            <p className="text-muted-foreground">
              {isPt
                ? 'Os pagamentos são processados de forma segura através do Stripe. Devido à natureza digital dos produtos, reembolsos serão analisados caso a caso. Entre em contato conosco em até 7 dias após assinar se tiver algum problema.'
                : 'Payments are processed securely through Stripe. Due to the digital nature of products, refunds will be evaluated on a case-by-case basis. Contact us within 7 days of subscribing if you have any issues.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {isPt ? '4. Assinaturas' : '4. Subscriptions'}
            </h2>
            <p className="text-muted-foreground">
              {isPt
                ? 'As assinaturas são cobradas automaticamente no ciclo escolhido (mensal ou anual). Você pode cancelar sua assinatura a qualquer momento através do portal de cobrança. O acesso continuará até o final do período pago.'
                : 'Subscriptions are automatically charged on your chosen cycle (monthly or yearly). You can cancel your subscription at any time through the billing portal. Access will continue until the end of your paid period.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {isPt ? '5. Propriedade Intelectual' : '5. Intellectual Property'}
            </h2>
            <p className="text-muted-foreground">
              {isPt
                ? 'Todo o conteúdo deste site, incluindo textos, gráficos, logos, imagens e software, é propriedade de Alpha Grit e está protegido por leis de direitos autorais.'
                : 'All content on this website, including text, graphics, logos, images, and software, is the property of Alpha Grit and is protected by copyright laws.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {isPt ? '6. Contato' : '6. Contact'}
            </h2>
            <p className="text-muted-foreground">
              {isPt
                ? 'Se você tiver alguma dúvida sobre estes Termos de Serviço, entre em contato conosco através do email de suporte disponível no site.'
                : 'If you have any questions about these Terms of Service, please contact us through the support email available on the website.'}
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          {dict.footer.rights}
        </div>
      </footer>
    </div>
  )
}
