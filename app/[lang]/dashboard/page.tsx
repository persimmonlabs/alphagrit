import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import DashboardTemplate from '@/components/templates/DashboardTemplate';

export default async function DashboardPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);

  return (
    <DashboardTemplate
      content={dict}
      lang={lang}
    />
  );
}
