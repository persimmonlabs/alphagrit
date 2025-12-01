import { getDictionary } from '@/lib/dictionary'
import type { Locale } from '@/i18n-config'
import Link from 'next/link'
import { Mail, MessageSquare, ArrowLeft } from 'lucide-react'

export default async function ContactPage({
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
          <Link href={`/${lang}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {isPt ? 'Início' : 'Home'}
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
          {isPt ? 'Entre em Contato' : 'Contact Us'}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mb-8 md:mb-12">
          {isPt
            ? 'Tem alguma dúvida ou precisa de ajuda? Estamos aqui para ajudar.'
            : 'Have a question or need help? We\'re here for you.'}
        </p>

        <div className="space-y-4 md:space-y-8">
          <div className="bg-card border border-border rounded-xl p-4 md:p-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-semibold mb-2">
                  {isPt ? 'Suporte por Email' : 'Email Support'}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {isPt
                    ? 'Para questões técnicas, problemas com compras ou dúvidas gerais.'
                    : 'For technical issues, purchase problems, or general inquiries.'}
                </p>
                <a
                  href="mailto:support@alphagrit.com"
                  className="text-primary hover:underline font-medium"
                >
                  support@alphagrit.com
                </a>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 md:p-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-semibold mb-2">
                  {isPt ? 'Perguntas Frequentes' : 'FAQ'}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {isPt
                    ? 'Confira nossas respostas para as perguntas mais comuns.'
                    : 'Check our answers to the most common questions.'}
                </p>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-medium mb-1">
                      {isPt ? 'Como acesso meus e-books?' : 'How do I access my e-books?'}
                    </h3>
                    <p className="text-muted-foreground">
                      {isPt
                        ? 'Após a compra, acesse seu dashboard para ler todos os seus e-books.'
                        : 'After purchase, access your dashboard to read all your e-books.'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">
                      {isPt ? 'Posso cancelar minha assinatura?' : 'Can I cancel my subscription?'}
                    </h3>
                    <p className="text-muted-foreground">
                      {isPt
                        ? 'Sim, você pode cancelar a qualquer momento no portal de cobrança.'
                        : 'Yes, you can cancel anytime through the billing portal.'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">
                      {isPt ? 'Qual a política de reembolso?' : 'What is the refund policy?'}
                    </h3>
                    <p className="text-muted-foreground">
                      {isPt
                        ? 'Entre em contato em até 7 dias após a compra para solicitar reembolso.'
                        : 'Contact us within 7 days of purchase to request a refund.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            {isPt
              ? 'Tempo médio de resposta: 24-48 horas'
              : 'Average response time: 24-48 hours'}
          </p>
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
