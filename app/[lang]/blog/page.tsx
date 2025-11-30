import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BlogIndexPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-6" />
          <h1 className="text-3xl font-heading font-bold text-foreground mb-4">
            {lang === 'pt' ? 'Blog' : 'Blog'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {lang === 'pt'
              ? 'Novos artigos em breve. Enquanto isso, confira nossos e-books!'
              : 'New articles coming soon. In the meantime, check out our e-books!'}
          </p>
          <Link
            href={`/${lang}/ebooks`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
          >
            {lang === 'pt' ? 'Ver E-books' : 'Browse E-books'}
          </Link>
        </div>
      </div>
    </div>
  );
}
