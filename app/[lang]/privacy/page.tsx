import { getDictionary } from '@/lib/dictionary'
import type { Locale } from '@/i18n-config'
import Link from 'next/link'

export default async function PrivacyPage({
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
        <h1 className="text-4xl font-bold mb-2">{dict.legal.privacyTitle}</h1>
        <p className="text-muted-foreground mb-8">
          {dict.legal.lastUpdated}: {isPt ? '1 de Janeiro de 2025' : 'January 1, 2025'}
        </p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {isPt ? '1. Informações que Coletamos' : '1. Information We Collect'}
            </h2>
            <p className="text-muted-foreground">
              {isPt
                ? 'Coletamos informações que você nos fornece diretamente, como nome, endereço de email e informações de pagamento quando você cria uma conta ou assina. Também coletamos informações automaticamente através de cookies e tecnologias semelhantes.'
                : 'We collect information you provide directly to us, such as name, email address, and payment information when you create an account or subscribe. We also collect information automatically through cookies and similar technologies.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {isPt ? '2. Como Usamos Suas Informações' : '2. How We Use Your Information'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {isPt ? 'Usamos as informações coletadas para:' : 'We use the information we collect to:'}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>{isPt ? 'Processar suas assinaturas' : 'Process your subscriptions'}</li>
              <li>{isPt ? 'Fornecer acesso aos produtos digitais' : 'Provide access to digital products'}</li>
              <li>{isPt ? 'Enviar comunicações sobre sua conta' : 'Send communications about your account'}</li>
              <li>{isPt ? 'Melhorar nossos serviços' : 'Improve our services'}</li>
              <li>{isPt ? 'Cumprir obrigações legais' : 'Comply with legal obligations'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {isPt ? '3. Compartilhamento de Informações' : '3. Information Sharing'}
            </h2>
            <p className="text-muted-foreground">
              {isPt
                ? 'Não vendemos suas informações pessoais. Compartilhamos informações apenas com provedores de serviços necessários para operar nosso negócio (como processadores de pagamento) e quando exigido por lei.'
                : 'We do not sell your personal information. We share information only with service providers necessary to operate our business (such as payment processors) and when required by law.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {isPt ? '4. Segurança de Dados' : '4. Data Security'}
            </h2>
            <p className="text-muted-foreground">
              {isPt
                ? 'Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais. Os pagamentos são processados de forma segura pelo Stripe, e não armazenamos dados de cartão de crédito em nossos servidores.'
                : 'We implement technical and organizational security measures to protect your personal information. Payments are processed securely by Stripe, and we do not store credit card data on our servers.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {isPt ? '5. Seus Direitos' : '5. Your Rights'}
            </h2>
            <p className="text-muted-foreground">
              {isPt
                ? 'Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Você também pode optar por não receber comunicações de marketing. Entre em contato conosco para exercer esses direitos.'
                : 'You have the right to access, correct, or delete your personal information. You can also opt out of marketing communications. Contact us to exercise these rights.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {isPt ? '6. Cookies' : '6. Cookies'}
            </h2>
            <p className="text-muted-foreground">
              {isPt
                ? 'Usamos cookies para melhorar sua experiência no site, lembrar suas preferências e analisar o uso do site. Você pode configurar seu navegador para recusar cookies, mas isso pode afetar algumas funcionalidades.'
                : 'We use cookies to improve your experience on our site, remember your preferences, and analyze site usage. You can configure your browser to refuse cookies, but this may affect some functionality.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              {isPt ? '7. Contato' : '7. Contact'}
            </h2>
            <p className="text-muted-foreground">
              {isPt
                ? 'Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco através do email de suporte disponível no site.'
                : 'If you have any questions about this Privacy Policy, please contact us through the support email available on the website.'}
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
